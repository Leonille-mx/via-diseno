const express = require('express');
const router = express.Router();

const isAuth = require('../util/isAuth');

const regular_controller = require('../controllers/alumno-regular.controller');

router.get('/horario', isAuth, regular_controller.get_prevista_de_horario);

router.get('/ayuda', isAuth, regular_controller.get_ayuda);

module.exports = router;