const express = require('express')
const app = express()

exports.launch = function (options) {
    if (options) {
        if (Array.isArray(options.routers)) {
            options.routers.forEach(e => {
                app.use(e);
            });
        }
    }

    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, function () {
        console.log(`API lauched at ${PORT}`);
    });
};