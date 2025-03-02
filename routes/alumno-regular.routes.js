const express = require('express');
const router = express.Router();
const path = require('path');

router.use('/horario', (req, res, nxt) => {
    res.send("Horario");
});

module.exports = router;