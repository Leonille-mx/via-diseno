const express = require('express');
const router = express.Router();

const usuario_controller = require('../controllers/usuario.controller');

router.get('/iniciar-sesion', usuario_controller.get_login);

router.post('/iniciar-sesion', usuario_controller.post_login);

router.get('/olvido-contrasena', usuario_controller.mostrarFormulario);
router.post('/olvido-contrasena', usuario_controller.enviarCorreoContrasena);

router.get('/recuperar/:token', usuario_controller.mostrarFormularioNuevaContrasena);
router.post('/recuperar', usuario_controller.guardarNuevaContrasena);

module.exports = router;