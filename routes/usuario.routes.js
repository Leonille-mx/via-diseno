const express = require('express');
const router = express.Router();
const path = require('path');

const usuario_controller = require('../controllers/usuario.controller');

router.get('/iniciar-sesion', usuario_controller.get_login);

module.exports = router;