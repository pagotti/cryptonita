const api = require('./src/api')

api.launch({
    routers: [
        require('./src/coin')
    ]
});
