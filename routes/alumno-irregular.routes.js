const express = require('express');
const router = express.Router();
const path = require('path');

router.get('/horario', (req, res, nxt) => {
    res.send("Horario");
});

router.get('/editar-horario', (req, res, nxt) => {
    res.send("Editar Horario");
});

router.get('/prevista-horario', (req, res, nxt) => {
    res.send("Prevista Horario");
});

module.exports = router;