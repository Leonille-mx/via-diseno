const express = require('express');
const router = express.Router();
const path = require('path');

const usuario_controller = require('../controllers/usuario.controller');

router.get('/iniciar-sesion', usuario_controller.get_login);

router.post('/iniciar-sesion', usuario_controller.post_login);

module.exports = router;