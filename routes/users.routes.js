const express = require('express');
const router = express.Router();
const path = require('path');

router.get('/iniciar-sesion',(req, res, nxt) => {
    res.send("Iniciar sesion");
});

module.exports = router;