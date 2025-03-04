const express = require('express');
const router = express.Router();
const path = require('path');

const coordinador_controller = require('../controllers/coordinador.controller');

router.get('/dashboard', coordinador_controller.get_dashboard);

router.get('/materias', coordinador_controller.get_materias);

router.get('/profesores', coordinador_controller.get_profesores);

router.get('/salones', coordinador_controller.get_salones);

router.get('/grupos', coordinador_controller.get_grupos);

router.get('/alumnos', coordinador_controller.get_alumnos);

router.get('/horario-alumno', coordinador_controller.get_horario_alumno);

module.exports = router;