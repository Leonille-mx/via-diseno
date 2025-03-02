const express = require('express');
const router = express.Router();
const path = require('path');

router.get('/dashboard', (req, res, nxt) => {
    res.send("Dashboard");
});

router.get('/materias', (req, res, nxt) => {
    res.send("Materias");
});

router.get('/profesores', (req, res, nxt) => {
    res.send("Profesores");
});

router.get('/salones', (req, res, nxt) => {
    res.send("Salones");
});

router.get('/grupos', (req, res, nxt) => {
    res.send("Grupos");
});

router.get('/alumnos', (req, res, nxt) => {
    res.send("Alumnos");
});

router.get('/horario-alumno', (req, res, nxt) => {
    res.send("Horario Alumno");
});

module.exports = router;