# Cryptonita

Cryptonita is a API for get last hour price of crypto currencies.


## PostgreSQL Setup
To setup database table for cached prices:

```sql
CREATE TABLE public.price (
    coin character varying(50) NOT NULL,
    currency character varying(4) NOT NULL,
    lastdate date NOT NULL,
    hour smallint NOT NULL,
    price numeric(18,8)
);
```

## Usage

```javascript
npm install 

set POSTGRES_URL=postgres://[your-postgres-url]
set COINGECKO_API=https://api.coingecko.com/api/v3
node index.js

curl -s 'http://localhost:5000/price/usd?plain=1&coin=bitcoin'
```

With no 'plain' or 'plain=0' output a JSON: 

```javscript
{
    "bitcoin": {
        "usd": 42000
    }
}
```

## Notes
This API is based on [Coingecko public API](https://www.coingecko.com/en/api) cached on free PostgreSQL Database instant at [ElephantSQL](https://www.elephantsql.com).

## License
[MIT](https://choosealicense.com/licenses/mit/)