const express = require('express');
const router = express.Router();
const path = require('path');

const irregular_controller = require('../controllers/alumno-irregular.controller');

router.get('/horario', irregular_controller.get_horario);

router.get('/editar-horario', irregular_controller.get_editar_horario);

router.get('/prevista-horario', irregular_controller.get_prevista_horario);

module.exports = router;