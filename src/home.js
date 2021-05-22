const express = require('express')
const path = require('path');
const router = express.Router();

router.use('/data/coinlist', (req, res) => {
    res.sendFile(path.join(__dirname, '/coinlist.json'));
});

router.use('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/home.html'));
});


module.exports = router;
