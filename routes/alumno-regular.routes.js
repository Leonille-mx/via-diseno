const express = require('express');
const router = express.Router();

const isAuth = require('../util/isAuth');

const regular_controller = require('../controllers/alumno-regular.controller');

router.use(isAuth.estaAutenticado, isAuth.esAlumnoRegular);

router.get('/horario', regular_controller.get_prevista_de_horario);

router.post('/horario/confirmar', regular_controller.post_confirmar_horario);

router.post('/horario/solitud', regular_controller.post_solicitud_cambio);

router.get('/ayuda', regular_controller.get_ayuda);

module.exports = router;