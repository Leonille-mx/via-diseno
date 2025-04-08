const express = require('express');
const router = express.Router();

const isAuth = require('../util/isAuth');

const regular_controller = require('../controllers/alumno-regular.controller');

router.get('/horario', isAuth, regular_controller.get_prevista_de_horario);

router.get('/horario-final', isAuth, regular_controller.get_horario_final);

router.post('/horario/confirmar', isAuth, regular_controller.post_confirmar_horario);

router.post('/horario/solitud', isAuth, regular_controller.post_solicitud_cambio);

router.get('/ayuda', isAuth, regular_controller.get_ayuda);

module.exports = router;