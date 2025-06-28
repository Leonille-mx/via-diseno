const express = require('express');
const router = express.Router();

const isAuth = require('../util/isAuth');

const coordinador_controller = require('../controllers/coordinador.controller');
const agregarCicloInfo = require('../util/cicloHelper');   

router.use(isAuth.estaAutenticado, isAuth.esCoordinador);

router.get('/dashboard', agregarCicloInfo, coordinador_controller.get_dashboard);
router.post('/dashboard/reset-grupos', agregarCicloInfo, coordinador_controller.post_reset_grupos);
router.get('/dashboard/filtrado', agregarCicloInfo, coordinador_controller.get_dashboard_carrera);

router.get('/administradores', agregarCicloInfo, coordinador_controller.get_administradores);
router.post('/administradores/cambiar-carrera', agregarCicloInfo, coordinador_controller.administrador_cambiar_carrera);
router.post('/administradores/sincronizar', agregarCicloInfo, coordinador_controller.post_sincronizar_administradores);
router.post('/administradores/filtrados', agregarCicloInfo, coordinador_controller.get_administradores_carrera);

router.get('/materias', agregarCicloInfo, coordinador_controller.get_materias);
router.post('/materias/sincronizar', agregarCicloInfo, coordinador_controller.post_sincronizar_materias);
router.post('/materias/abrir', agregarCicloInfo, coordinador_controller.post_abrir_materia);
router.post('/materia_semestre/eliminar/:materiaId/:semestreId', agregarCicloInfo, coordinador_controller.post_eliminar_materias);
router.get('/materias/filtradas', agregarCicloInfo, coordinador_controller.get_materias_carrera);

router.get('/profesores', agregarCicloInfo, coordinador_controller.get_profesores);
router.post('/profesores/sincronizar', agregarCicloInfo, coordinador_controller.post_sincronizar_profesores);
router.get('/profesores/modificar/:id', agregarCicloInfo, coordinador_controller.get_modificar_profesor);
router.post('/profesores/modificar/:id', agregarCicloInfo, coordinador_controller.post_modificar_profesor);

router.get('/salones', agregarCicloInfo, coordinador_controller.get_salones);
router.post('/salones', agregarCicloInfo, coordinador_controller.post_salones);
router.post('/salones/eliminar/:id', agregarCicloInfo, coordinador_controller.post_eliminar_salon);

router.get('/grupos', agregarCicloInfo, coordinador_controller.get_grupos);
router.post('/grupos', agregarCicloInfo, coordinador_controller.post_grupos);
router.get('/grupos/generar', agregarCicloInfo, coordinador_controller.get_generar_grupos);
router.post('/grupos/eliminar/:id', agregarCicloInfo, coordinador_controller.post_eliminar_grupo);
router.get('/grupos/modificar/:id', agregarCicloInfo, coordinador_controller.get_modificar_grupo);
router.post('/grupos/modificar/:id', agregarCicloInfo, coordinador_controller.post_modificar_grupo);
router.get('/grupos/get/:id', agregarCicloInfo, coordinador_controller.get_grupos_por_id);
router.get('/grupos/get-carrera', agregarCicloInfo, coordinador_controller.get_grupos_carrera);
router.post('/grupos/enviar', agregarCicloInfo, coordinador_controller.enviarDatos);

router.get('/alumnos', agregarCicloInfo, coordinador_controller.get_alumnos);
router.post('/alumnos/sincronizar', agregarCicloInfo, coordinador_controller.post_sincronizar_alumnos);
router.get('/alumnos/consultar-horario/:id', agregarCicloInfo, coordinador_controller.get_alumno_horario);
router.post('/alumnos/cambiar-estatus', agregarCicloInfo, coordinador_controller.post_cambiar_estatus);
router.get('/alumnos/modificar-horario/:id', agregarCicloInfo, coordinador_controller.get_alumno_modificar_horario);
router.get('/alumnos/modificar-horario/materias-disponibles/:semestre/:id', agregarCicloInfo, coordinador_controller.get_materias_disponibles);
router.post('/alumnos/modificar-horario/eliminar-resultado', agregarCicloInfo, coordinador_controller.post_eliminar_materia_del_resultado);
router.post('/alumnos/modificar-horario/agregar-resultado', agregarCicloInfo, coordinador_controller.post_agregar_materia_del_resultado);
router.post('/alumnos/modificar-horario/modificar-obligacion', agregarCicloInfo, coordinador_controller.post_modificar_obligacion);
router.get('/alumnos/filtrados', agregarCicloInfo, coordinador_controller.get_alumnos_carrera);

router.get('/salones', agregarCicloInfo, coordinador_controller.get_salones);
router.post('/salones', agregarCicloInfo, coordinador_controller.post_salones);
router.post('/salones/eliminar/:id', agregarCicloInfo, coordinador_controller.post_eliminar_salon);

router.get('/grupos', agregarCicloInfo, coordinador_controller.get_grupos);
router.post('/grupos', agregarCicloInfo, coordinador_controller.post_grupos);
router.get('/grupos/generar', agregarCicloInfo, coordinador_controller.get_generar_grupos);
router.post('/grupos/eliminar/:id', agregarCicloInfo, coordinador_controller.post_eliminar_grupo);
router.get('/grupos/modificar/:id', agregarCicloInfo, coordinador_controller.get_modificar_grupo);
router.post('/grupos/modificar/:id', agregarCicloInfo, coordinador_controller.post_modificar_grupo);

router.get('/solicitudes-cambio', agregarCicloInfo, coordinador_controller.get_solicitudes_cambio);
router.post('/solicitudes-cambio/aprobar/:id', agregarCicloInfo, coordinador_controller.post_aprobar_solicitud);
router.post('/solicitudes-cambio/rechazar/:id', agregarCicloInfo, coordinador_controller.post_rechazar_solicitud);
router.get('/solicitudes-cambio/filtradas', agregarCicloInfo, coordinador_controller.get_solicitudes_cambio_carrera);


router.get('/ayuda', agregarCicloInfo, coordinador_controller.get_ayuda);

router.get('/ciclo-escolar', agregarCicloInfo, coordinador_controller.get_cicloescolar);
router.post('/ciclo-escolar/sincronizar', agregarCicloInfo, coordinador_controller.postSincronizarCicloEscolar);
router.post('/dashboard/sincronizar-planes-de-estudio', agregarCicloInfo, coordinador_controller.post_sincronizar_planes_de_estudio);

router.post('/guardar-carreras', agregarCicloInfo, coordinador_controller.guardar_carreras);

module.exports = router;