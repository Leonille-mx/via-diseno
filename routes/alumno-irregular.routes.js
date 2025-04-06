const express = require('express');
const router = express.Router();

const isAuth = require('../util/isAuth');

const irregular_controller = require('../controllers/alumno-irregular.controller');

router.get('/modificar-horario', isAuth, irregular_controller.get_modificar_horario);

router.get('/modificar-horario/materias-disponibles/:semestre', isAuth, irregular_controller.get_materias_disponibles);

router.get('/prevista-horario', isAuth, irregular_controller.get_prevista_horario);

router.get('/resultado-de-horario', isAuth, irregular_controller.get_resultado_de_horario);

router.get('/ayuda', isAuth, irregular_controller.get_ayuda);

module.exports = router;