const express = require('express');
const router = express.Router();

const isAuth = require('../util/isAuth');

const coordinador_controller = require('../controllers/coordinador.controller');

router.get('/dashboard', isAuth, coordinador_controller.get_dashboard);

router.get('/materias', isAuth, coordinador_controller.get_materias);

router.post('/materias/sincronizar', isAuth, coordinador_controller.post_sincronizar_materias);
router.post('/materias/abrir', isAuth, coordinador_controller.post_abrir_materia);

router.get('/profesores', isAuth, coordinador_controller.get_profesores);
router.post('/profesores/sincronizar', isAuth, coordinador_controller.post_sincronizar_profesores);
router.get('/profesores/modificar/:id', isAuth, coordinador_controller.get_modificar_profesor);
router.post('/profesores/modificar/:id', isAuth, coordinador_controller.post_modificar_profesor);

router.get('/alumnos', isAuth, coordinador_controller.get_alumnos);
router.post('/alumnos/sincronizar', isAuth, coordinador_controller.post_sincronizar_alumnos);

router.get('/salones', isAuth, coordinador_controller.get_salones);

router.post('/salones', isAuth, coordinador_controller.post_salones);

router.post('/salones/eliminar/:id', isAuth, coordinador_controller.post_eliminar_salon);

router.get('/grupos', isAuth, coordinador_controller.get_grupos);
router.get('/grupos/generar', isAuth, coordinador_controller.get_generar_grupos);
router.post('/grupos/eliminar/:id', isAuth, coordinador_controller.post_eliminar_grupo);

router.get('/alumnos', isAuth, coordinador_controller.get_alumnos);

router.get('/solicitudes-cambio', isAuth, coordinador_controller.get_solicitudes_cambio);

router.get('/ayuda', isAuth, coordinador_controller.get_ayuda);

router.get('/ciclo-escolar', isAuth, coordinador_controller.get_cicloescolar);

router.post('/ciclo-escolar/sincronizar', isAuth, coordinador_controller.postSincronizarCicloEscolar);

router.post('/dashboard/sincronizar-planes-de-estudio', isAuth, coordinador_controller.post_sincronizar_planes_de_estudio);



module.exports = router;