const express = require('express');
const router = express.Router();
const path = require('path');

const regular_controller = require('../controllers/alumno-regular.controller');

router.get('/horario', regular_controller.get_horario);

module.exports = router;