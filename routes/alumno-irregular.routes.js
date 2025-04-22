const express = require('express');
const router = express.Router();

const isAuth = require('../util/isAuth');

const irregular_controller = require('../controllers/alumno-irregular.controller');

router.use(isAuth.estaAutenticado, isAuth.esAlumnoIrregular);

router.get('/modificar-horario', irregular_controller.get_modificar_horario);

router.get('/modificar-horario/materias-disponibles/:semestre', irregular_controller.get_materias_disponibles);

router.post('/modificar-horario/eliminar-resultado', irregular_controller.post_eliminar_materia_del_resultado);

router.post('/modificar-horario/agregar-resultado', irregular_controller.post_agregar_materia_del_resultado);

router.get('/prevista-horario', irregular_controller.get_prevista_horario);

router.get('/resultado-de-horario', irregular_controller.get_resultado_de_horario);

router.get('/ayuda', irregular_controller.get_ayuda);

module.exports = router;