const express = require('express');
const router = express.Router();
const path = require('path');

router.get('/horario', (req, res, nxt) => {
    res.send("Horario");
});

module.exports = router;