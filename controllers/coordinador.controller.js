const pool = require('../util/database.js');
const Salon = require('../models/salon.model');
const Campus = require('../models/campus.model');
const Materia = require('../models/materia.model');
const Profesor = require('../models/profesor.model.js');
const MateriaSemestre = require('../models/materia_semestre.model.js');
const CicloEscolar = require('../models/ciclo-escolar.model');
const Grupos = require('../models/grupo.model');
const Alumno = require('../models/alumno.model');
const Usuario = require('../models/usuario.model.js');
const generarGrupos = require('../models/generarGrupos.model.js');
const Carrera = require('../models/carrera.model.js');
const Historial_Academico = require('../models/historial_academico.model.js');
const Solicitud = require('../models/solicitudes-cambio.model.js');
const ResultadoInscripcion = require('../models/resultado_inscripcion.model.js');
const BloqueTiempo = require('../models/bloque_tiempo.model.js');
const Coordinador = require('../models/coordinador.model.js');
const { axiosAdminClient, getToken, getHeaders, getAllProfessors, getAllCourses, getAllStudents, getAllAdministrators, getCiclosEscolares, getAllDegree, getAllAcademyHistory, getExternalCycles, getExternalGroups } = require('../util/adminApiClient.js');


exports.get_dashboard = async (req, res) => {
    try {
        const msg1 = req.query.msg1 || null; 
        const msg2 = req.query.msg2 || null; 
        const carreraCoordinador = await Coordinador.getCarrera(req.session.usuario.id);
        //Consulta el total de profesores activos de la Base de Datos
        const alumnosConMaterias = await Alumno.fetchNumeroIrregularesConMaterias(req.session.carrerasSeleccionadas || [carreraCoordinador.rows[0].carrera_id]);
        const alumnosNoInscritos = await Alumno.totalNoInscritos(req.session.carrerasSeleccionadas || [carreraCoordinador.rows[0].carrera_id]);
        const alumnosInscritos = await Alumno.numero_TotalAlumnoInscritos(req.session.carrerasSeleccionadas || [carreraCoordinador.rows[0].carrera_id]);
        const salon_Totales = await Salon.numero_TotalSalones();
        const grupos_Totales = await Grupos.numeroTotalGrupos(req.session.carrerasSeleccionadas || [carreraCoordinador.rows[0].carrera_id]);
        const grupos_Dashboard = await Grupos.grupoDashboard(req.session.carrerasSeleccionadas || [carreraCoordinador.rows[0].carrera_id]);
        const salones_Dashboard = await Salon.salonesDashboard();
        const grafica_Alumnos = await Alumno.alumnosComparacion(req.session.carrerasSeleccionadas || [carreraCoordinador.rows[0].carrera_id]);
        const materias_Abiertas  = await Materia.numeroMaterias(req.session.carrerasSeleccionadas || [carreraCoordinador.rows[0].carrera_id]);
        const solicitud_Cambio_Dashboard = await Solicitud.dasboard_Solicitud(req.session.carrerasSeleccionadas || [carreraCoordinador.rows[0].carrera_id]);
        const total_Solicitudes = await Solicitud.numeroTotalSolicitudes(req.session.carrerasSeleccionadas || [carreraCoordinador.rows[0].carrera_id]);
        const carreras = await Carrera.fetchAll();

        res.render('dashboard_coordinador', {
            msg1: msg1,
            msg2: msg2,
            showResetModal: true, 
            isLoggedIn: req.session.isLoggedIn || false,
            matricula: req.session.matricula || '',
            //Total de profesores para mostrar en el dashboard
            alumnosSinMaterias: (alumnosNoInscritos - alumnosConMaterias),
            alumnosNoInscritos: alumnosConMaterias,
            alumnosInscritos: alumnosInscritos,
            salon_Totales: salon_Totales,
            grupos_Totales: grupos_Totales,
            grupos_Dashboard: grupos_Dashboard,
            salones_Dashboard: salones_Dashboard,
            grafica_Alumnos: grafica_Alumnos,
            materias_Abiertas: materias_Abiertas,
            solicitud_Cambio_Dashboard: solicitud_Cambio_Dashboard,
            total_Solicitudes: total_Solicitudes,
            carreras: carreras.rows,
            carrerasSeleccionadas: req.session.carrerasSeleccionadas || [carreraCoordinador.rows[0].carrera_id],
        });
    } catch (error) {
        console.error("Dashboard error:", error);
        res.status(500).send("Error loading dashboard");
    }
};

exports.get_dashboard_carrera = async (req, res) => {
  try {
    // 1) Obtener las carreras seleccionadas directamente desde la sesión
    let carrerasFinal = Array.isArray(req.session.carrerasSeleccionadas)
      ? req.session.carrerasSeleccionadas.slice()
      : [];

    // 3) Recalcular todos los datos con las carreras en sesión
    const [materiasAbiertas, gruposTotales, alumnosInscritos,
      alumnosNoInscritos, alumnosConMaterias, salon_Totales,
      grupos_Dashboard, salones_Dashboard, solicitud_Cambio_Dashboard,
      total_Solicitudes, grafica_Alumnos] = await Promise.all([
      Materia.numeroMaterias(carrerasFinal),
      Grupos.numeroTotalGrupos(carrerasFinal),
      Alumno.numero_TotalAlumnoInscritos(carrerasFinal),
      Alumno.totalNoInscritos(carrerasFinal),
      Alumno.fetchNumeroIrregularesConMaterias(carrerasFinal),
      Salon.numero_TotalSalones(),
      Grupos.grupoDashboard(carrerasFinal),
      Salon.salonesDashboard(carrerasFinal),
      Solicitud.dasboard_Solicitud(carrerasFinal),
      Solicitud.numeroTotalSolicitudes(carrerasFinal),
      Alumno.alumnosComparacion(carrerasFinal)
    ]);

    // 4) Calcular alumnos sin materias (NoInscritos – ConMaterias)
    const alumnosSinMaterias = alumnosNoInscritos - alumnosConMaterias;

    // 5) Enviar JSON al frontend con la misma estructura esperada
    res.json({
      materiasAbiertas,
      gruposTotales,
      alumnosInscritos,
      alumnosNoInscritos: alumnosConMaterias,
      alumnosSinMaterias,
      salon_Totales,
      grupos_Dashboard,
      salones_Dashboard,
      solicitud_Cambio_Dashboard,
      total_Solicitudes,
      grafica_Alumnos
    });

  } catch (error) {
    console.error("Error al filtrar dashboard:", error);
    res.status(500).json({ error: 'Error al filtrar datos del dashboard' });
  }
};

exports.post_reset_grupos = async (req, res) => {
    try {
        const resultado = await Grupos.resetDatosGrupos();
        res.json(resultado);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error del servidor' 
        });
    }
};

exports.get_administradores = async (req, res, nxt) => {
    try {
        const carreras = await Carrera.fetchAll();
        const carreraCoordinador = await Coordinador.getCarrera(req.session.usuario.id);
        const coordinadores = await Coordinador.fetchAll();
        const msg = req.query.msg || null;
        res.render('administradores_coordinador', {
            isLoggedIn: req.session.isLoggedIn || false,
            matricula: req.session.matricula || '',
            carreras: carreras.rows,
            carrerasSeleccionadas: req.session.carrerasSeleccionadas || [carreraCoordinador.rows[0].carrera_id],
            administradores: coordinadores.rows,
            msg,
        });
    } catch (error) {
        console.error("Admins error:", error);
        res.status(500).send("Error loading admins");
    }
}

exports.post_sincronizar_administradores = async (req, res, nxt) => {
    try {
        const admins = await getAllAdministrators();

        const adminsApi = admins.data;

        const resultadoUsuario = await Usuario.sincronizarUsuariosAdmins(adminsApi);
        const resultadoAdmins = await Coordinador.sincronizarAdministradores(adminsApi);

        const msg = `La operación fue exitosa!<br>
                    Insertado: ${resultadoUsuario.inserted}<br>
                    Actualizado: ${resultadoUsuario.updated + resultadoAdmins.updated}<br>
                    Eliminado: ${resultadoUsuario.deleted}`;
        res.redirect(`/coordinador/administradores?msg=${encodeURIComponent(msg)}`);
    } catch (error) {
        console.error(error);
        res.redirect(`/coordinador/administradores?msg=${encodeURIComponent('La operación fue fracasada')}`);
    }
};

exports.get_administradores_carrera = async (req, res, nxt) => {
    try {
        const { carreras } = req.body; 
        const result = await Coordinador.fetchPorCarrera(carreras);
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener administradores filtrados:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

exports.administrador_cambiar_carrera = async (req, res, nxt) => {
    const {admin_id, carrera_id } = req.body;
    try {
        await Coordinador.cambiarCarrera(admin_id, carrera_id);
        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({success: false, error: 'Error al actualizar la carrera'});
    }
}

exports.get_materias = async (req, res, nxt) => {
    try {
        const carreraCoordinador = await Coordinador.getCarrera(req.session.usuario.id);
        const materiasSemestreDB = await MateriaSemestre.fetchMateriasSemestre();
        
        // Si hay query string, lo guarda en la variable msg
        const msg = req.query.msg || null;
        const msgTitle = req.query.msgTitle;
        const allMaterias = materiasSemestreDB.rows;
        const carreras = await Carrera.fetchAll();
        // Creamos un nuevo objeto que tienen key-value relación y están separados
        // por semestre
        const materiasPorSemestre = allMaterias.reduce((accumulator, materia) => {
            // Si no existe la llave de un semestre
            if (!accumulator[materia.semestre_id]) {
                // Crea una nueva llave con su valor vacío
                accumulator[materia.semestre_id] = [];
            }
            // Si no, pushea la materia en el valor
            accumulator[materia.semestre_id].push(materia);
            // Regresa el acumulador para la siguiente iteración
            return accumulator;
        }, {});

        const materiasNoAbiertasPorSemestre = {};
        const totalSemestres = 9;
        for (let i = 1; i <= totalSemestres; i++) {
            const semestreId = `s${i}`;
            const res = await MateriaSemestre.fetchMateriasNoAbiertasPorSemestre(semestreId);
            materiasNoAbiertasPorSemestre[semestreId] = res.rows;
        }

        res.render('materias_coordinador', {
            isLoggedIn: req.session.isLoggedIn || false,
            matricula: req.session.matricula || '',
            materiasPorSemestre: materiasPorSemestre,
            materiasNoAbiertasPorSemestre,
            msg,
            msgTitle,
            carreras: carreras.rows,
            carrerasSeleccionadas: req.session.carrerasSeleccionadas || [carreraCoordinador.rows[0].carrera_id],
        });
    } catch(error) {
        console.log(error);
    }
};

exports.get_materias_carrera = async (req, res, nxt) => {
  try {
    // Traemos **todas** las materias por semestre del modelo
    const materiasSemestreDB = await MateriaSemestre.fetchMateriasSemestre();
    const allMaterias = materiasSemestreDB.rows;

    // Agrupamos igual que en el render inicial
    const materiasPorSemestre = allMaterias.reduce((acc, m) => {
      if (!acc[m.semestre_id]) acc[m.semestre_id] = [];
      acc[m.semestre_id].push(m);
      return acc;
    }, {});

    // (Opcional) Si quieres enviar también las no-abiertas:
    const materiasNoAbiertasPorSemestre = {};
    for (let i = 1; i <= 9; i++) {
      const semestreId = `s${i}`;
      const resultado = await MateriaSemestre.fetchMateriasNoAbiertasPorSemestre(semestreId);
      materiasNoAbiertasPorSemestre[semestreId] = resultado.rows;
    }

    // Respondemos con la misma forma de los locals de EJS
    res.json({ materiasPorSemestre, materiasNoAbiertasPorSemestre });
  } catch (error) {
    console.error('Error al obtener materias:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.post_sincronizar_materias = async (req, res, nxt) => {
    try {
        // Trae materias de la API
        const courses = await getAllCourses();

        // Extrae la 'data' de la JSON respuesta
        const materiasApi = courses.data;

        // Llama la función sincronizarMaterias() para sincronizar los datos de materia
        const resultado = await Materia.sincronizarMaterias(materiasApi);
        // Crea una variable para el mensaje de operación
        const msg = `La operación fue exitosa!<br>
                    Insertado: ${resultado.inserted}<br>
                    Actualizado: ${resultado.updated}<br>
                    Eliminado: ${resultado.deleted}`;

        // Redirige a la siguiente ruta con el mensaje en query string 
        // con la función para encodificarlo
        res.redirect(`/coordinador/materias?msg=${encodeURIComponent(msg)}&msgTitle=${encodeURIComponent('Sincronizar Materias')}`);
    } catch (error) {
        console.error(error);
        // Redirige a la siguiente ruta con un mensaje de error en query string 
        // con la función para encodificarlo
        res.redirect(`/coordinador/materias?msg=${encodeURIComponent('La operación fue fracasada')}&msgTitle=${encodeURIComponent('Sincronizar Materias')}`);
    }
};

exports.post_abrir_materia = async (req, res) => {
    try {
        const { semestre_id, materiasInsertar, materiasEliminar } = req.body;

        for (let materiaId of materiasInsertar) {
            await MateriaSemestre.abrirMateriaEnSemestre(materiaId, semestre_id);
        }

        for (let materiaId of materiasEliminar) {
            await MateriaSemestre.eliminar(materiaId, semestre_id);
        }

        res.redirect(`/coordinador/materias?msg=${encodeURIComponent('Materias abiertas exitosamente')}&msgTitle=${encodeURIComponent('Abrir Materias')}`);
    } catch (error) {
        console.error(error);
        res.redirect(`/coordinador/materias?msg=${encodeURIComponent('Error al abrir materias')}&msgTitle=${encodeURIComponent('Abrir Materias')}`);
    }
};

exports.post_eliminar_materias = (req, res, next) => {
    const { materiaId, semestreId } = req.params; 
    MateriaSemestre.eliminar(materiaId, semestreId) 
        .then(() => {
            res.redirect('/coordinador/materias');
        })
        .catch((error) => {
            console.log(error);
            res.status(500).send("Error al eliminar la materia");
        });
};

exports.get_profesores = async (req, res, nxt) => {
    try {
      const profesoresDB = await Profesor.fetchAll(); 
      const materias = await MateriaSemestre.fetchMateriasSemestre(); 
      const profesoresActivos = await Profesor.fetchActivos();  
      const msg = req.query.msg || null;
      const msg2 = req.query.msg2 || null;
      const carreraCoordinador = await Coordinador.getCarrera(req.session.usuario.id);
      const carreras = await Carrera.fetchAll();
  
      res.render('profesores_coordinador', {
          isLoggedIn: req.session.isLoggedIn || false,
          matricula: req.session.matricula || '',
          profesores: profesoresActivos.rows,  
          msg, 
          msg2,
          materias: materias.rows,
          carreras: carreras.rows,
          carrerasSeleccionadas: req.session.carrerasSeleccionadas || [carreraCoordinador.rows[0].carrera_id],
      });
    } catch (error) {
      console.log(error);
      res.status(500).send('Hubo un problema al obtener los profesores.');
    }
  };



exports.post_sincronizar_profesores = async (req, res, nxt) => {
    try {
        // Trae materias de la API
        const courses = await getAllProfessors(); 
        // Extrae la 'data' de la JSON respuesta
        const profesoresApi = courses.data; 
        // Llama la función sincronizarProfesores() para sincronizar los datos del profesor        
        const resultado = await Profesor.sincronizarProfesores(profesoresApi); 
        // Crea una variable para el mensaje de operación
        const msg = `La operación fue exitosa!<br>
                    Insertado: ${resultado.inserted}<br>
                    Actualizado: ${resultado.updated}<br>
                    Eliminado: ${resultado.deleted}`; 
        // Redirige a la siguiente ruta con el mensaje en query string 
        // con la función para encodificarlo
        res.redirect(`/coordinador/profesores?msg=${encodeURIComponent(msg)}`);
    } catch (error) {
        console.error(error);
        // Redirige a la siguiente ruta con un mensaje de error en query string 
        // con la función para encodificarlo
        res.redirect(`/coordinador/profesores?msg=${encodeURIComponent('La operación fue fracasada')}`);
    }
};

exports.get_modificar_profesor = (req, res, next) => {    
    Promise.all([
        Profesor.getSchedule(req.params.id),
        Profesor.getCourses(req.params.id),
        Profesor.getCoursesInfo(req.params.id),
        MateriaSemestre.fetchMateriasSemestreOnce()
    ])
    .then(([bloques, materias, materiasInfo, materiasDisp]) => {
        res.json({ 
            bloques: bloques,
            materias: materias,
            materiasInfo: materiasInfo,
            allMaterias: materiasDisp
        });
    })
    .catch((error) => {
        console.error("Error al obtener datos:", error);
        res.status(500).json({ 
            error: "Error al obtener datos del profesor",
            details: error.message
        });
    });
};

exports.post_modificar_profesor = async (req, res, next) => {
    try {
        const selectedBlocks = JSON.parse(req.body.selectedBlocks);
        const selectedMaterias = JSON.parse(req.body.selectedMaterias);
        const profesorId = req.params.id;

        await Profesor.deleteSchedule(profesorId);
        await Profesor.unassignCourses(profesorId);

        // Asignar cursos
        const asignarCursosPromises = selectedMaterias.map(materia => 
            Profesor.asignCourses(profesorId, materia)
        );
        await Promise.all(asignarCursosPromises);

        // Actualizar horarios
        const actualizarHorarioPromises = selectedBlocks.map(bloque => 
            Profesor.updateSchedule(profesorId, bloque)
        );
        await Promise.all(actualizarHorarioPromises);

        res.redirect(`/coordinador/profesores?msg2=${'Los detalles del profesor se modificaron exitosamente.'}`);
    } catch (error) {
        console.error(error);
        res.redirect(`/coordinador/profesores?msg2=${'La operación fue fracasada. Intente de nuevo.'}`);
    }
};

exports.get_salones = async (req, res, nxt) => {
    try {
        const msgTitle = req.query.msgTitle || null;
        const msg = req.query.msg || null;
        const carreraCoordinador = await Coordinador.getCarrera(req.session.usuario.id);

        const [carreras, salones, campus] = await Promise.all([
            Carrera.fetchAll(),
            Salon.fetchAll(),
            Campus.fetchAll()
        ]);

        res.render('salones_coordinador', {
            isLoggedIn: req.session.isLoggedIn || false,
            matricula: req.session.matricula || '',
            salones: salones.rows,
            campus: campus.rows,
            msgTitle,
            msg,
            carreras: carreras.rows,
            carrerasSeleccionadas: req.session.carrerasSeleccionadas || [carreraCoordinador.rows[0].carrera_id],
        });
    } catch (error) {
        console.error("Error en get_salones:", error);
        res.status(500).send("Error al cargar la vista de salones");
    }
};

exports.post_salones = async (req, res, nxt) => {
    msgTitle = `Agregar Salón`
    const existeSalon = await Salon.existeSalon(req.body.numero, req.body.campus);
    if (existeSalon.rows[0].result === true) {
        res.redirect(`/coordinador/salones?msg=${encodeURIComponent('Ya existe un salón con el mismo número en este campus. Intente de nuevo.')}
                                        &msgTitle=${encodeURIComponent(msgTitle)}`);     
    } else {
        const salon = new Salon(req.body.numero, req.body.capacidad, req.body.tipo, req.body.nota, req.body.campus);
        salon.save()
        .then(() => {
            res.redirect(`/coordinador/salones?msg=${encodeURIComponent('El salón fue registrado exitosamente.')}
                                              &msgTitle=${encodeURIComponent(msgTitle)}`);
        })
        .catch((error) => {
            console.error(error);
            res.redirect(`/coordinador/salones?msg=${encodeURIComponent('La operación fue fracasada. Intente de nuevo.')}
                                              &msgTitle=${encodeURIComponent(msgTitle)}`); 
        });
    }
};

exports.post_eliminar_salon = (req, res, nxt) => {
    msgTitle = `Eliminar Salón`
    
    Salon.deleteGrupoSalon(req.params.id)
        .then(() => {
            return  Salon.delete(req.params.id);
        })
        .then(() => {
            res.redirect(`/coordinador/salones?msg=${encodeURIComponent('El salón fue eliminado exitosamente.')}
                                          &msgTitle=${encodeURIComponent(msgTitle)}`);
        })
        .catch((error) => {
            console.log(error);
            res.redirect(`/coordinador/salones?msg=${encodeURIComponent('La operación fue fracasada. Intente de nuevo.')}
                                              &msgTitle=${encodeURIComponent(msgTitle)}`); 
        });
};

exports.get_grupos = (req, res, next) => {
    const msgTitle = req.query.msgTitle || null; 
    const msg = req.query.msg || null; 
    Promise.all([
        MateriaSemestre.fetchMateriasSemestre(),
        Profesor.fetchAll(),
        Grupos.fetchAll(),
        Salon.fetchAll(),
        Carrera.fetchAll(),
        Coordinador.getCarrera(req.session.usuario.id),
    ])
    .then(([materias, profesores, grupos, salones, carreras, carreraCoordinador]) => {
        res.render('grupos_coordinador', { 
            grupos: grupos.rows,
            materias: materias.rows,
            profesores: profesores.rows,
            salones: salones.rows,
            isLoggedIn: req.session.isLoggedIn || false,
            matricula: req.session.matricula || '',
            msgTitle,
            msg,
            carreras: carreras.rows,
            carrerasSeleccionadas: req.session.carrerasSeleccionadas || [carreraCoordinador.rows[0].carrera_id],
        });
    })
    .catch((error) => {
        console.error('Error fetching data:', error);
        res.status(500).send('Error al obtener los datos');
    });
};

exports.get_grupos_carrera = (req, res, nxt) => {
    Grupos.fetchAll()
    .then((grupos) => {
        res.status(200).json({
            isLoggedIn: req.session.isLoggedIn || false,
            matricula: req.session.matricula || '',
            grupos: grupos.rows
        });
    }).catch((error) => {
        console.error('Error fetching data:', error);
        res.status(500).send('Error al obtener los datos');
    });
};

exports.get_grupos_por_id = (req, res, nxt) => {
    const carrera_id = req.params.id;
    Grupos.fetchAllPorId(carrera_id)
    .then((grupos) => {
        res.status(200).json({
            isLoggedIn: req.session.isLoggedIn || false,
            matricula: req.session.matricula || '',
            grupos: grupos.rows
        });
    }).catch((error) => {
        console.error('Error fetching data:', error);
        res.status(500).send('Error al obtener los datos');
    });
};

exports.post_grupos = async (req, res, next) => {
    const msgTitle = `Agregar Grupo`;
    try {
        const selectedBlocks = JSON.parse(req.body.selectedBlocks);
        const grupo = new Grupos(req.body.materia, req.body.profesor, req.body.salon);
        
        const savedGroup = await grupo.save();
        const groupId = savedGroup.rows[0].grupo_id;

        // Asignar bloques al grupo
        const asignarBloquesPromises = selectedBlocks.map(bloque => 
            Grupos.updateHorario(groupId, bloque)
        );
        await Promise.all(asignarBloquesPromises);

        res.redirect(`/coordinador/grupos?msg=${encodeURIComponent('El grupo fue registrado exitosamente.')}
                                         &msgTitle=${encodeURIComponent(msgTitle)}`);
    } catch (error) {
        console.error(error);
        res.redirect(`/coordinador/grupos?msg=${encodeURIComponent('La operación fue fracasada. Intente de nuevo.')}
                                         &msgTitle=${encodeURIComponent(msgTitle)}`); 
    }
};

exports.get_modificar_grupo = (req, res, next) => {    
    Promise.all([
        Grupos.getHorario(req.params.id),
        Grupos.fetchOne(req.params.id)
    ])
    .then(([bloques, grupo]) => {
        res.json({ 
            bloques: bloques,
            grupo: grupo 
        });
    })
    .catch((error) => {
        console.error("Error al obtener datos:", error);
        res.status(500).json({ 
            error: "Error al obtener datos del grupo",
            details: error.message
        });
    });
};

exports.post_modificar_grupo = async (req, res, next) => {
    try {
        const msgTitle = `Modificar Grupo`;

        const selectedBlocks = JSON.parse(req.body.selectedBlocks);

        await Grupos.deleteHorario(req.params.id);
        await Grupos.updateGrupo(req.params.id, req.body.materia, req.body.profesor, req.body.salon);

        // Actualizar horarios
        const actualizarHorarioPromises = selectedBlocks.map(bloque => 
            Grupos.updateHorario(req.params.id, bloque)
        );
        await Promise.all(actualizarHorarioPromises);

        res.redirect(`/coordinador/grupos?msg=${encodeURIComponent('Los detalles del grupo fueron modificados exitosamente.')}
                                         &msgTitle=${encodeURIComponent(msgTitle)}`);
    } catch (error) {
        console.error(error);
        res.redirect(`/coordinador/grupos?msg=${encodeURIComponent('La operación fue fracasada. Intente de nuevo.')}
                                         &msgTitle=${encodeURIComponent(msgTitle)}`); 
    }
};


exports.get_alumnos = async (req, res, nxt) => {
    const carreraCoordinador = await Coordinador.getCarrera(req.session.usuario.id);
    try {
        const alumnosRegularesDB = await Alumno.fetchAllRegulares(); 
        const alumnosIrregularesDB = await Alumno.fetchAllIrregulares();
        const msg = req.query.msg || null;
        const carreras = await Carrera.fetchAll();
        res.render('alumnos_coordinador', {
            alumnosRegulares: alumnosRegularesDB.rows,
            alumnosIrregulares: alumnosIrregularesDB.rows,
            msg,
            isLoggedIn: req.session.isLoggedIn || false,
            matricula: req.session.matricula || '',
            carreras: carreras.rows,
            carrerasSeleccionadas: req.session.carrerasSeleccionadas || [carreraCoordinador.rows[0].carrera_id],
        });
    } catch(error) {
        console.log(error);
        res.status(500).send('Hubo un problema al obtener los alumnos.');
    }
};

exports.get_alumnos_carrera = async (req, res, next) => {
  try {
    const [regularesDB, irregularesDB] = await Promise.all([
      Alumno.fetchAllRegulares(),  
      Alumno.fetchAllIrregulares()
    ]);
    res.json({
      alumnosRegulares:   regularesDB.rows,
      alumnosIrregulares: irregularesDB.rows
    });
  } catch (error) {
    console.error('Error al obtener alumnos filtrados:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.post_sincronizar_alumnos = async (req, res, nxt) => {
    try {
        const students = await getAllStudents();

        const studentsApi = students.data;

        const resultadoUsuario = await Usuario.sincronizarUsuariosAlumnos(studentsApi);
        const resultadoAlumno = await Alumno.sincronizarAlumnos(studentsApi);

        const alumnos_sin_historial = [];

        for (const student of studentsApi) {
            try {
                const historial = await getAllAcademyHistory(student.ivd_id);
                const historialApi = historial.data;
                await Historial_Academico.sincronizarHistorialAcademico(student.ivd_id, historialApi);
            } catch (error) {
                alumnos_sin_historial.push(student.ivd_id);
                continue;
            }
        }
        console.log("Alumnos sin historial: " + alumnos_sin_historial);
        const msg = `La operación fue exitosa!<br>
                    Insertado: ${resultadoUsuario.inserted}<br>
                    Actualizado: ${resultadoUsuario.updated + resultadoAlumno.updated}<br>
                    Eliminado: ${resultadoUsuario.deleted}`;
        res.redirect(`/coordinador/alumnos?msg=${encodeURIComponent(msg)}`);
    } catch (error) {
        console.error(error);
        res.redirect(`/coordinador/alumnos?msg=${encodeURIComponent('La operación fue fracasada')}`);
    }
};

exports.get_alumno_horario = async (req, res, nxt) => {
    const esRegular = await Alumno.esRegular(req.params.id);
    const bloque_tiempo = await BloqueTiempo.fetchAllHoras();
    const bloqueTiempoMap = bloque_tiempo.rows[0]?.id_hora_map || {};
    if (esRegular.rows[0].regular === true) {
        Alumno.fetchAllResultadoAlumno(req.params.id)
        .then((data) => {
            res.status(200).json({
                isLoggedIn: req.session.isLoggedIn || false,
                matricula: req.session.matricula || '',
                materias_resultado: data.rows,
                bloque_tiempo: bloqueTiempoMap
            });
        });
    } else {
        Alumno.fetchAllResultadoAlumno(req.params.id)
        .then((data) => {
            res.status(200).json({
                isLoggedIn: req.session.isLoggedIn || false,
                matricula: req.session.matricula || '',
                materias_resultado: data.rows,
                bloque_tiempo: bloqueTiempoMap
            });
        });
    }
}

exports.post_cambiar_estatus = async (req, res, nxt) => {
    try {
        await Solicitud.aprobar(req.body.alumno_id);
        const carreraCoordinador = await Coordinador.getCarrera(req.session.usuario.id);
        const alumnosRegularesDB = await Alumno.fetchAllRegularesPorCarrera(carreraCoordinador.rows[0].carrera_id); 
        const alumnosIrregularesDB = await Alumno.fetchAllIrregularesPorCarrera(carreraCoordinador.rows[0].carrera_id);
        res.status(200).json({
            isLoggedIn: req.session.isLoggedIn || false,
            matricula: req.session.matricula || '',
            alumnosRegulares: alumnosRegularesDB.rows,
            alumnosIrregulares: alumnosIrregularesDB.rows,
        });
    } catch (error) {
        console.log(error);
    };
};

exports.get_alumno_modificar_horario = async (req, res, nxt) => {
    try {
        const materias_resultado = await Alumno.fetchAllResultadoAlumno2(req.params.id);
        const materias_disponibles_semestre = await Alumno.fetchAllMateriasDisponiblesCoordinador(req.params.id);
        const bloque_tiempo = await BloqueTiempo.fetchAllHoras();
        const bloqueTiempoMap = bloque_tiempo.rows[0]?.id_hora_map || {};
        res.status(200).json({
            isLoggedIn: req.session.isLoggedIn || false,
            matricula: req.session.matricula || '',
            materias_resultado: materias_resultado.rows,
            materias_disponibles_semestre: materias_disponibles_semestre.rows,
            bloque_tiempo: bloqueTiempoMap
        });
    } catch (error){
        console.log(error);
    }
};

exports.get_materias_disponibles = async (req, res, nxt) => {
    const bloque_tiempo = await BloqueTiempo.fetchAllHoras();
    const bloqueTiempoMap = bloque_tiempo.rows[0]?.id_hora_map || {};
    if (req.params.semestre == 'semestre') {
        Alumno.fetchAllMateriasDisponiblesCoordinador(req.params.id)
        .then((materias_disponibles) => {
            res.status(200).json({
                materias_disponibles: materias_disponibles.rows,
                bloque_tiempo: bloqueTiempoMap
            });
        }).catch((error) => {
            console.log(error);
        });
    } else {
        Alumno.fetchAllMateriasDisponiblesDelAlumnoPorSemestre(req.params.semestre, req.params.id)
        .then((materias_disponibles) => {
            res.status(200).json({
                materias_disponibles: materias_disponibles.rows,
                bloque_tiempo: bloqueTiempoMap
            });
        }).catch((error) => {
            console.log(error);
        });
    }
};

exports.post_eliminar_materia_del_resultado = async (req, res, nxt) => {
    try {
        const grupo_id = req.body.grupo_id;
        const alumno_id = req.body.alumno_id;
        await ResultadoInscripcion.eliminarMateriaDelResultado(grupo_id, alumno_id);

        const materias_resultado = await Alumno.fetchAllResultadoAlumno2(alumno_id);
        const bloque_tiempo = await BloqueTiempo.fetchAllHoras();
        const bloqueTiempoMap = bloque_tiempo.rows[0]?.id_hora_map || {};
        const materias_disponibles = req.body.semestre == 'semestre'
            ? await Alumno.fetchAllMateriasDisponiblesCoordinador(alumno_id)
            : await Alumno.fetchAllMateriasDisponiblesDelAlumnoPorSemestre(req.body.semestre, alumno_id);
        res.status(200).json({
            isLoggedIn: req.session.isLoggedIn || false,
            matricula: req.session.matricula || '',
            materias_resultado: materias_resultado.rows,
            materias_disponibles: materias_disponibles.rows,
            bloque_tiempo: bloqueTiempoMap
        });
    } catch (error) {
        console.log(error);
    }
}

exports.post_agregar_materia_del_resultado = async (req, res, nxt) => {
    try {
        const grupo_id = req.body.grupo_id;
        const alumno_id = req.body.alumno_id;
        await ResultadoInscripcion.agregarMateriaDelResultado(alumno_id, grupo_id);

        const materias_resultado = await Alumno.fetchAllResultadoAlumno2(alumno_id);
        const bloque_tiempo = await BloqueTiempo.fetchAllHoras();
        const bloqueTiempoMap = bloque_tiempo.rows[0]?.id_hora_map || {};
        const materias_disponibles = req.body.semestre == 'semestre'
            ? await Alumno.fetchAllMateriasDisponiblesCoordinador(alumno_id)
            : await Alumno.fetchAllMateriasDisponiblesDelAlumnoPorSemestre(req.body.semestre, alumno_id);

        res.status(200).json({
            isLoggedIn: req.session.isLoggedIn || false,
            matricula: req.session.matricula || '',
            materias_resultado: materias_resultado.rows,
            materias_disponibles: materias_disponibles.rows,
            bloque_tiempo: bloqueTiempoMap
        });
    } catch (error) {
        console.log(error);
    }
}

exports.post_modificar_obligacion = async (req, res, nxt) => {
    try {
        const grupo_id = req.body.grupo_id;
        const alumno_id = req.body.alumno_id;
        const obligatorio = req.body.obligatorio;

        await ResultadoInscripcion.modificarObligacion(alumno_id, grupo_id, obligatorio);
        const materias_resultado = await Alumno.fetchAllResultadoAlumno2(alumno_id);
        const bloque_tiempo = await BloqueTiempo.fetchAllHoras();
        const bloqueTiempoMap = bloque_tiempo.rows[0]?.id_hora_map || {};

        res.status(200).json({
            isLoggedIn: req.session.isLoggedIn || false,
            matricula: req.session.matricula || '',
            materias_resultado: materias_resultado.rows,
            bloque_tiempo: bloqueTiempoMap
        });
    } catch (error) {
        console.log(error);
    }
};

exports.get_ayuda = async (req, res, nxt) => {
    try {
        const carreras = await Carrera.fetchAll();
        const carreraCoordinador = await Coordinador.getCarrera(req.session.usuario.id);

        res.render('ayuda_coordinador', {
            isLoggedIn: req.session.isLoggedIn || false,
            matricula: req.session.matricula || '',
            carreras: carreras.rows,
            carrerasSeleccionadas: req.session.carrerasSeleccionadas || [carreraCoordinador.rows[0].carrera_id],
        });
    } catch (error) {
        console.error("Error en get_ayuda:", error);
        res.status(500).send("Error al cargar la vista de ayuda");
    }
};


exports.get_cicloescolar = (req, res, next) => {
    CicloEscolar.fetchAll()
        .then((result) => {
            const formattedData = result.rows.map(row => ({
                ...row,
                fecha_inicio: new Date(row.fecha_inicio),
                fecha_fin: new Date(row.fecha_fin)
            }));
            
            res.render('ciclo_escolar_coordinador', {
                cicloescolar: formattedData,
                msg: req.query.msg || null
            });
        })
        .catch((error) => {
            console.error("Critical DB Error:", error);
            res.status(500).send(`
                <h1>Error</h1>
                <p>No se pudieron cargar los ciclos escolares. Inténtelo de nuevo más tarde..</p>
                <a href="/coordinador/ciclo-escolar">Retry</a>
            `);
        });
};

exports.post_eliminar_grupo = (req, res, nxt) => {
    const msgTitle = `Eliminar Grupo`;

    Grupos.deleteHorario(req.params.id)
    .then(() => {
        return Grupos.deleteInscripcion(req.params.id);
    })
    .then(() => {
        return Grupos.delete(req.params.id);
    })
    .then(() => {
        res.redirect(`/coordinador/grupos?msg=${encodeURIComponent('El grupo fue eliminado exitosamente.')}
                                         &msgTitle=${encodeURIComponent(msgTitle)}`);
    })
    .catch((error) => {
        console.error(error);
        res.redirect(`/coordinador/grupos?msg=${encodeURIComponent('La operación fue fracasada. Intente de nuevo.')}
                                         &msgTitle=${encodeURIComponent(msgTitle)}`); 
    });
};

exports.postSincronizarCicloEscolar = async (req, res) => {
    try {
        const externalData = await getCiclosEscolares();
        const result = await CicloEscolar.sincronizarConAPI(externalData);
    
        let msg = `Sincronización completada:<br>
                Insertados: ${result.inserted}<br>
                Actualizados: ${result.updated}<br>
                Eliminados: ${result.deleted}`;
    
        if (result.invalid.length > 0) {
        msg += `<br><br>- Registros omitidos -<br><br>`;
        msg += result.invalid.map(r => 
            `code: ${r.code}<br><br>Fecha Inicio: ${r.start}<br><br>Fecha Fin: ${r.end}`
        ).join('<br>');
        }
    
        res.redirect(`/coordinador/dashboard?msg1=${encodeURIComponent(msg)}`);
        
    } catch (error) {   
        console.error("Error en sincronización:", error);
        res.redirect(`/coordinador/dashboard?msg1=${encodeURIComponent('Error: ' + error.message)}`);
    }        
};

exports.get_generar_grupos = async (req, res, next) => {
    const title = 'Generar Grupos';
    const ga = new generarGrupos();
    try {
        const carreraCoordinador = await Coordinador.getCarrera(req.session.usuario.id);
        const carrera_id = carreraCoordinador.rows[0].carrera_id;
        const resultado = await ga.run(carrera_id);
        await ga.saveResult(resultado, carrera_id);

        const { best, unassigned } = resultado;
        let msg = 'Los grupos fueron generados exitosamente.';
        if (unassigned.length > 0) {
            msg += ' No se pudieron asignar las materias: ' + unassigned.join(', ');
        }
        res.redirect(`/coordinador/grupos?msg=${encodeURIComponent(msg)}&msgTitle=${encodeURIComponent(title)}`);
    } catch (error) {
        console.error(error);
        let msg = " La operación fue fracasada. Intente de nuevo."
        res.redirect(`/coordinador/grupos?msg=${encodeURIComponent(msg)}&msgTitle=${encodeURIComponent(title)}`);
    }
};

exports.post_sincronizar_planes_de_estudio = async (req, res) => {
    try {
        // Trae carreras de la API
        const degrees = await getAllDegree();

        // Extrae la 'data' de la JSON respuesta
        const carrerasApi = degrees.data;

        // Llama la función sincronizarPlanesDeEstudio() para sincronizar los planes de estudios juntoss con las carreras
        const resultado = await Carrera.sincronizarCarreras(carrerasApi);
        // Crea una variable para el mensaje de operación
        const msg = `La operación fue exitosa!<br>
                    Insertado: ${resultado.inserted}<br>
                    Actualizado: ${resultado.updated}<br>
                    Eliminado: ${resultado.deleted}`;

        // Redirige a la siguiente ruta con el mensaje en query string 
        // con la función para encodificarlo
        res.redirect(`/coordinador/dashboard?msg2=${encodeURIComponent(msg)}`);
    } catch (error) {
        console.error(error);
        // Redirige a la siguiente ruta con un mensaje de error en query string 
        // con la función para encodificarlo
        res.redirect(`/coordinador/dashboard?msg2=${encodeURIComponent('La operación fue fracasada')}`);
    }
}

exports.get_solicitudes_cambio = async (req, res, next) => {
    try {
        const carreraCoordinador = await Coordinador.getCarrera(req.session.usuario.id);
        const solicitudesActivas = await Solicitud.fetchActivos();
        const msg = req.query.msg || null;
        const carreras = await Carrera.fetchAll();

        res.render('solicitudes_cambio_coordinador', {
            isLoggedIn: req.session.isLoggedIn || false,
            matricula: req.session.matricula || '',
            solicitudes: solicitudesActivas.rows, 
            msg  ,
            carreras: carreras.rows,
            carrerasSeleccionadas: req.session.carrerasSeleccionadas || [carreraCoordinador.rows[0].carrera_id],
        });
    } catch (error) {
        console.error('Error al obtener solicitudes:', error);
        res.status(500).render('error', {
            message: 'Hubo un problema al obtener las solicitudes de cambio',
            error
        });
    }
};

exports.get_solicitudes_cambio_carrera = async (req, res, next) => {
    try {
        const result = await Solicitud.fetchActivos();
        res.json({ solicitudes: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
    }
};

exports.post_aprobar_solicitud = async (req, res, nxt) => {
    Solicitud.aprobar(req.params.id)
    .then (( ) => {
        res.redirect('/coordinador/solicitudes-cambio')
    })
    .catch((error) => {
        console.log(error);
    });
};

exports.post_rechazar_solicitud = async (req, res, nxt) => {
    Solicitud.rechazar(req.params.id)
    .then (( ) => {
        res.redirect('/coordinador/solicitudes-cambio')
    })
    .catch((error) => {
        console.log(error);
    });
};

exports.enviarGruposAPI = async (req, res, isInternal = false) => {
    try {
      const token = await getToken();
      const headers = getHeaders(token);
  
      const [
        gruposResult,
        profesoresExternosResponse,
        ciclosLocalesResult,
        ciclosExternosResponse,
        gruposExternosResponse
      ] = await Promise.all([
        Grupos.fetchAll(),
        getAllProfessors(token),
        CicloEscolar.fetchAll(),
        getExternalCycles(),
        getExternalGroups(token)
      ]);
  
      const gruposLocales = gruposResult.rows;
      const profesoresExternos = profesoresExternosResponse.data || [];
      const ciclosLocales = ciclosLocalesResult.rows;
      const ciclosExternos = ciclosExternosResponse.data || [];
      const gruposExternos = Array.isArray(gruposExternosResponse.data) ? gruposExternosResponse.data : [];

  
      const mapaProfesores = Object.fromEntries(
        profesoresExternos.map(p => [String(p.ivd_id), p.id])
      );
  
      const mapaIdToCode = Object.fromEntries(
        ciclosLocales.map(c => [c.ciclo_escolar_id, c.code])
      );
  
      const mapaCodeToApiId = Object.fromEntries(
        ciclosExternos.map(c => [c.code, c.id])
      );
  
      const mapaExternosPorNombre = new Map(
        gruposExternos.map(g => [g.name, g])
      );
  
      const nombresLocales = new Set();
  
      for (const grupo of gruposLocales) {
        const profesor_api_id = mapaProfesores[String(grupo.profesor_id)];
        const code_local = mapaIdToCode[grupo.ciclo_escolar_id];
        const ciclo_api_id = mapaCodeToApiId[code_local];
        const nombreGrupo = String(grupo.grupo_id);
        nombresLocales.add(nombreGrupo);
  
        const body = {
          school_cycle_id: ciclo_api_id,
          course_id: grupo.materia_id,
          professor_id: profesor_api_id,
          name: nombreGrupo,
          room: grupo.numero === 9999 ? "No asignado" : String(grupo.numero)
        };
  
        const grupoExistente = mapaExternosPorNombre.get(nombreGrupo);
  
        if (!grupoExistente) {
          // No existe: POST
          const response = await axiosAdminClient.post('/v1/groups', body, { headers });
          const grupo_api_id = response.data?.data?.id;
          if (grupo_api_id) {
            await Grupos.guardarIdExternoGrupoPorId(grupo_api_id, grupo.grupo_id);
          }
        } else {
          // Ya existe: PATCH si hay diferencias
          const cambios =
            grupoExistente.school_cycle_id !== body.school_cycle_id ||
            grupoExistente.course_id !== body.course_id ||
            grupoExistente.professor_id !== body.professor_id ||
            grupoExistente.room !== body.room;
  
          if (cambios) {
            await axiosAdminClient.patch(`/v1/groups/${grupoExistente.id}`, body, { headers });
          }
        }
      }
  
      // Eliminar los grupos externos que no están localmente
      for (const externo of gruposExternos) {
        if (!nombresLocales.has(externo.name)) {
          await axiosAdminClient.delete(`/v1/groups/${externo.id}`, { headers });
        }
      }
  
      if (!isInternal) {
        res.status(200).send('Grupos enviados, actualizados y eliminados correctamente.');
      }
    } catch (error) {
      console.error('Error al enviar grupos:', error.response?.data || error.message);
      if (!isInternal) {
        res.status(500).send('Error al enviar grupos.');
      }
    }
  };
  

exports.enviarAlumnosAPI = async (req, res, isInternal = false) => {
    try {
      const token = await getToken();
      const headers = getHeaders(token);
  
      const resultado = await Grupos.getInscripcionesConApiId();
  
      for (const inscripcion of resultado.rows) {
        await axiosAdminClient.post('/v1/students_groups', {
          group_id: inscripcion.grupo_api_id,
          student_ivd_id: inscripcion.alumno_id
        }, { headers });
      }
  
      if (!isInternal) {
        res.status(200).send('Inscripciones enviadas exitosamente.');
      }
    } catch (error) {
      console.error('Error al enviar inscripciones:', error.response?.data || error.message);
      if (!isInternal) {
        res.status(500).send('Error al enviar inscripciones.');
      }
    }
};
  
exports.enviarHorariosAPI = async (req, res, isInternal = false) => {
    try {
      const token = await getToken();
      const headers = getHeaders(token);
  
      const resultado = await Grupos.getHorariosConApiId();
      const bloques = resultado.rows;
  
      const gruposPorDia = {};
      for (const bloque of bloques) {
        const key = `${bloque.grupo_api_id}-${bloque.dia}`;
        if (!gruposPorDia[key]) gruposPorDia[key] = [];
        gruposPorDia[key].push(bloque);
      }
  
      for (const key in gruposPorDia) {
        const bloquesDia = gruposPorDia[key];
        const dia = bloquesDia[0].dia;
        const group_id = bloquesDia[0].grupo_api_id;
        
        bloquesDia.sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));

        let tempGroup = [bloquesDia[0]];
        
        function minutos(horaStr) {
            const [h, m] = horaStr.split(':').map(Number);
            return h * 60 + m;
          }

          for (let i = 1; i < bloquesDia.length; i++) {
            const actual = bloquesDia[i];
            const anterior = bloquesDia[i - 1];
          
            const finAnterior = minutos(anterior.hora_fin);
            const inicioActual = minutos(actual.hora_inicio);
          
            // Si el bloque actual inicia exactamente donde terminó el anterior → es consecutivo
            if (inicioActual === finAnterior) {
              tempGroup.push(actual);
            } else {
              await enviarBloqueHorario(group_id, dia, tempGroup, token);
              tempGroup = [actual];
            }
          }
          
          if (tempGroup.length > 0) {
            await enviarBloqueHorario(group_id, dia, tempGroup, token);
          }
        console.log(`Grupo ${group_id}, Día ${dia} → ${bloquesDia.length} bloques`);
      }
  
      if (!isInternal) {
        res.status(200).send('Horarios enviados exitosamente.');
      }
    } catch (error) {
      console.error('Error al enviar horarios:', error.response?.data || error.message);
      if (!isInternal) {
        res.status(500).send('Error al enviar horarios.');
      }
    }
};  
  
const enviarBloqueHorario = async (group_id, dia, bloques, token) => {
    const buildDateTime = (hora) => {
      return new Date(`2000-01-01T${hora}-06:00`);
    };
  
    const start = buildDateTime(bloques[0].hora_inicio);
    const end = buildDateTime(bloques[bloques.length - 1].hora_fin);
  
    const data = {
      group_id,
      weekday: dia,
      start_hour: start.toISOString(),
      end_hour: end.toISOString()
    };
  
    await axiosAdminClient.post('/v1/schedules', data, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  };
  
  
exports.enviarDatos = async (req, res) => {
    try {
      await exports.enviarGruposAPI(req, res, true);
      await exports.enviarAlumnosAPI(req, res, true);
      await exports.enviarHorariosAPI(req, res, true);
  
      // Verifica que no se haya respondido antes
      if (!res.headersSent) {
        res.redirect('/coordinador/grupos?msg=Datos enviados exitosamente&msgTitle=Enviar Grupos');
      }
    } catch (error) {
      console.error('Error al enviar todo:', error);
      if (!res.headersSent) {
        res.status(500).send('Error al enviar datos');
      }
    }
};
  
exports.guardar_carreras = async (req, res) => {
    const { seleccionadas } = req.body;
    req.session.carrerasSeleccionadas = Array.isArray(seleccionadas)
        ? seleccionadas.map(Number)
        : [];
    res.sendStatus(200);
};