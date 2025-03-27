const express = require('express');
const router = express.Router();

const isAuth = require('../util/isAuth');

const irregular_controller = require('../controllers/alumno-irregular.controller');

router.get('/horario', isAuth, irregular_controller.get_horario);

router.get('/editar-horario', isAuth, irregular_controller.get_editar_horario);

router.get('/prevista-horario', isAuth, irregular_controller.get_prevista_horario);

router.get('/ayuda', isAuth, irregular_controller.get_ayuda);

module.exports = router;