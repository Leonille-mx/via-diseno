const express = require('express');
const router = express.Router();

const regular_controller = require('../controllers/alumno-regular.controller');

router.get('/horario', regular_controller.get_horario);

router.get('/ayuda', regular_controller.get_ayuda);

module.exports = router;