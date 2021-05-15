const express = require('express')
const axios = require('axios').default;
const { Pool } = require('pg')
const COINGECKO_BASE = process.env.COINGECKO_API || 'https://api.coingecko.com/api/v3';

const router = express.Router();

router.use('/price/:currency', (req, res) => {
    const currency = req.params.currency,
          coins = (req.query.coin || "usd").split(",");
          
    return getPrice(coins, currency)
        .then(prices => { res.send(prices) })
        .catch(err => {
            console.log(err);
            res.send({});
        });
});

const getPrice = function(coins, currency, res) {
    return new Promise((resolve, reject) => {
        if (!coins || !currency) {
            console.log('no parameters');
            reject();
        } else {
            const qry = {
                text: `SELECT coin, currency, price FROM price
                       WHERE coin = ANY ($1) AND 
                          currency = $2 AND 
                          lastDate = current_date AND 
                          hour = date_part('hour', current_timestamp);`,
                values: [coins, currency]
            };
            const pool = new Pool({
                connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL
            });
            pool.query(qry)
                .then(res => {
                    if (res && res.rowCount > 0) {
                        const result = Object.fromEntries(res.rows.map(e => [e.coin, Object.fromEntries([[e.currency, Number(e.price)]])]));
                        const coinsHave = res.rows.map(e => e.coin);
                        const coinsGap = coins.filter(e => coinsHave.indexOf(e) < 0);
                        if (coinsGap.length > 0)
                            getFromAPI(coinsGap, currency)
                                .then(e => { 
                                    resolve({ ...result, ...e });
                                    return e; 
                                })
                                .then(e => logPrice(e, currency))
                                .catch(e => {
                                    console.log(`API error: ${e}`);
                                    reject();
                                });
                        else 
                            resolve(result);
                    } else {
                        getFromAPI(coins, currency)
                            .then(e => { resolve(e); return e;})
                            .then(e => logPrice(e, currency))
                            .catch(e => {
                                console.log(`API error: ${e}`);
                                reject();
                            });

                    }
                })
                .then(() => pool.end())
                .catch((e) => {
                    console.log(`Database error: ${e}`);
                    reject();
                });
        }
    });
};

const getFromAPI = function (coins, currency) {
    return new Promise((resolve, reject) => {
        axios.get(`${COINGECKO_BASE}/simple/price?ids=${coins.join(',')}&vs_currencies=${currency}`)
            .then(resp => {
                if (resp.status == 200)
                    resolve(resp.data);
                else 
                    resolve({});
            }).catch(err => {
                console.log(err); 
                reject(err);
            });
    });
}

const logPrice = function (data, currency) {
    const values = Object.keys(data).map(e => { return { coin: e, value: data[e][currency] } });    
    const insertValues = values.map(e => `('${e.coin}', '${currency}', current_date, date_part('hour', current_timestamp), ${e.value})`);
    const deleteValues = values.map(e => `'${e.coin}'`);
    const qry = {
      text: `DELETE FROM price WHERE coin IN (${deleteValues.join(",")}) AND currency = '${currency}'; 
             INSERT INTO price (coin, currency, lastDate, hour, price) VALUES ${insertValues.join(",")};`
    };
    const pool = new Pool({
        connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL
    });
    return pool
        .query(qry)
        .then(() => pool.end())
        .catch((e) => console.log(`Database error: ${e}`));
};

module.exports = router;
