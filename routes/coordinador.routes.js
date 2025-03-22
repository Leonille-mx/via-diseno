const express = require('express');
const router = express.Router();

const coordinador_controller = require('../controllers/coordinador.controller');

router.get('/dashboard', coordinador_controller.get_dashboard);

router.get('/materias', coordinador_controller.get_materias);

router.get('/profesores', coordinador_controller.get_profesores);

router.get('/salones', coordinador_controller.get_salones);
router.post('/salones', coordinador_controller.post_salones);
router.post('/salones/eliminar/:id', coordinador_controller.post_eliminar_salon);

router.get('/grupos', coordinador_controller.get_grupos);

router.get('/alumnos', coordinador_controller.get_alumnos);

router.get('/solicitudes-cambio', coordinador_controller.get_solicitudes_cambio);

router.get('/ayuda', coordinador_controller.get_ayuda);

module.exports = router;