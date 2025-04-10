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
const { getAllProfessors, getAllCourses, getAllStudents, getCiclosEscolares, getAllDegree, getAllAcademyHistory} = require('../util/adminApiClient.js');


exports.get_dashboard = async (req, res) => {
    try {
        const msg1 = req.query.msg1 || null; 
        const msg2 = req.query.msg2 || null; 
        //Consulta el total de profesores activos de la Base de Datos
        const profesoresTotales = await Profesor.numeroProfesores();
        const alumnosNoInscritos = await Alumno.totalNoInscritos();
        const alumnosInscritos = await Alumno.numero_TotalAlumnoInscritos();
        const salon_Totales = await Salon.numero_TotalSalones();
        const grupos_Totales = await Grupos.numeroTotalGrupos();
        const grupos_Dashboard = await Grupos.grupoDashboard();
        const salones_Dashboard = await Salon.salonesDashboard();
        const grafica_Alumnos = await Alumno.alumnosComparacion();
        const materias_Abiertas  = await Materia.numeroMaterias();
        const solicitud_Cambio_Dashboard = await Solicitud.dasboard_Solicitud();
        const total_Solicitudes = await Solicitud.numeroTotalSolicitudes();

        res.render('dashboard_coordinador', {
            msg1: msg1,
            msg2: msg2,
            isLoggedIn: req.session.isLoggedIn || false,
            matricula: req.session.matricula || '',
            //Total de profesores para mostrar en el dashboard
            profesoresTotales: profesoresTotales,
            alumnosNoInscritos: alumnosNoInscritos,
            alumnosInscritos: alumnosInscritos,
            salon_Totales: salon_Totales,
            grupos_Totales: grupos_Totales,
            grupos_Dashboard: grupos_Dashboard,
            salones_Dashboard: salones_Dashboard,
            grafica_Alumnos: grafica_Alumnos,
            materias_Abiertas: materias_Abiertas,
            solicitud_Cambio_Dashboard: solicitud_Cambio_Dashboard,
            total_Solicitudes: total_Solicitudes
            
        });
    } catch (error) {
        console.error("Dashboard error:", error);
        res.status(500).send("Error loading dashboard");
    }
};


exports.get_materias = async (req, res, nxt) => {
    try {
        const materiasSemestreDB = await MateriaSemestre.fetchMateriasSemestre();
        const todasLasMateriasDB = await Materia.fetchAll(); 
        const materiasNoAbiertasDB = await Materia.fetchMateriasNoAbiertas(); 
        
        // Si hay query string, lo guarda en la variable msg
        const msg = req.query.msg || null;
        const allMaterias = materiasSemestreDB.rows;
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
            todasLasMaterias: todasLasMateriasDB.rows,
            materiasNoAbiertas: materiasNoAbiertasDB.rows,
            materiasNoAbiertasPorSemestre,
            msg,
        });
    } catch(error) {
        console.log(error);
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
        res.redirect(`/coordinador/materias?msg=${encodeURIComponent(msg)}`);
    } catch (error) {
        console.error(error);
        // Redirige a la siguiente ruta con un mensaje de error en query string 
        // con la función para encodificarlo
        res.redirect(`/coordinador/materias?msg=${encodeURIComponent('La operación fue fracasada')}`);
    }
};

exports.post_abrir_materia = async (req, res) => {
    try {
        const { semestre_id, materias } = req.body;

        if (!Array.isArray(materias)) {
            console.log(materias)
            throw new Error('materias must be an array');
        }

        for (const materia_id of materias) {
            console.log(`Inserting materia_id=${materia_id}, semestre_id=${semestre_id}`);
            await MateriaSemestre.abrirMateriaEnSemestre(materia_id, semestre_id);
        }

        res.redirect('/coordinador/materias?msg=Materias abiertas exitosamente');
    } catch (error) {
        console.error(error);
        res.redirect('/coordinador/materias?msg=Error al abrir materias');
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
  
      res.render('profesores_coordinador', {
          isLoggedIn: req.session.isLoggedIn || false,
          matricula: req.session.matricula || '',
          profesores: profesoresActivos.rows,  
          msg, 
          materias: materias.rows
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

        res.redirect('/coordinador/profesores');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al modificar detalles del profesor');
    }
};

exports.get_salones = (req, res, nxt) => {
    Salon.fetchAll()
    .then((salones) => {
        Campus.fetchAll()
            .then((campus) => {
                res.render('salones_coordinador', {
                    isLoggedIn: req.session.isLoggedIn || false,
                    matricula: req.session.matricula || '',
                    salones : salones.rows,
                    campus : campus.rows
                });
            })
            .catch((error) => {
                console.log(error);
            });
        })
    .catch((error) => {
        console.log(error);
        res.status(500).send('Error al obtener salones');
    });
};

exports.post_salones = (req, res, nxt) => {
    const salon = new Salon(req.body.numero, req.body.capacidad, req.body.tipo, req.body.nota, req.body.campus);
    salon.save()
    .then(() => {
        res.redirect('/coordinador/salones');
    })
    .catch((error) => {
        console.log(error);
        res.status(500).send('Error al registrar el salón'); 
    });
};

exports.post_eliminar_salon = (req, res, nxt) => {
    Salon.delete(req.params.id)
        .then(() => {
            res.redirect('/coordinador/salones');
        })
        .catch((error) => {
            console.log(error);
            res.status(500).send('Error al eliminar el salón'); 
        });
};

exports.get_grupos = (req, res, next) => {
    Promise.all([
        MateriaSemestre.fetchMateriasSemestre(),
        Profesor.fetchAll(),
        Grupos.fetchAll(),
        Salon.fetchAll()
    ])
    .then(([materias, profesores, grupos, salones]) => {
        res.render('grupos_coordinador', { 
            grupos: grupos.rows,
            materias: materias.rows,
            profesores: profesores.rows,
            salones: salones.rows,
            isLoggedIn: req.session.isLoggedIn || false,
            matricula: req.session.matricula || '',
        });
    })
    .catch((error) => {
        console.error('Error fetching data:', error);
        res.status(500).send('Error al obtener los datos');
    });
};

exports.post_grupos = async (req, res, next) => {
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

        res.redirect('/coordinador/grupos');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al registrar el grupo'); 
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
        const selectedBlocks = JSON.parse(req.body.selectedBlocks);

        await Grupos.deleteHorario(req.params.id);
        await Grupos.updateGrupo(req.params.id, req.body.materia, req.body.profesor, req.body.salon);

        // Actualizar horarios
        const actualizarHorarioPromises = selectedBlocks.map(bloque => 
            Grupos.updateHorario(req.params.id, bloque)
        );
        await Promise.all(actualizarHorarioPromises);

        res.redirect('/coordinador/grupos');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al modificar detalles del grupo');
    }
};


exports.get_alumnos = async (req, res, nxt) => {
    try {
        const alumnosRegularesDB = await Alumno.fetchAllRegulares(); 
        const alumnosIrregularesDB = await Alumno.fetchAllIrregulares();
        const msg = req.query.msg || null;
        res.render('alumnos_coordinador', {
            alumnosRegulares: alumnosRegularesDB.rows,
            alumnosIrregulares: alumnosIrregularesDB.rows,
            msg,
            isLoggedIn: req.session.isLoggedIn || false,
            matricula: req.session.matricula || '',
        });
    } catch(error) {
        console.log(error);
        res.status(500).send('Hubo un problema al obtener los alumnos.');
    }
};

exports.post_sincronizar_alumnos = async (req, res, nxt) => {
    try {
        const students = await getAllStudents();

        const studentsApi = students.data;

        const resultadoUsuario = await Usuario.sincronizarUsuarios(studentsApi);
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

exports.get_solicitudes_cambio = (req, res, nxt) => {
    res.render('solicitudes_cambio_coordinador', {
        isLoggedIn: req.session.isLoggedIn || false,
        matricula: req.session.matricula || '',
    });
};

exports.get_ayuda = (req, res, nxt) => {
    res.render('ayuda_coordinador', {
        isLoggedIn: req.session.isLoggedIn || false,
        matricula: req.session.matricula || '',
    });
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
    Grupos.deleteHorario(req.params.id)
    .then(() => {
        return Grupos.deleteInscripcion(req.params.id);
    })
    .then(() => {
        return Grupos.delete(req.params.id);
    })
    .then(() => {
        res.redirect('/coordinador/grupos');
    })
    .catch((error) => {
        console.error('Delete error:', error);
        res.redirect('/coordinador/grupos?error=delete_failed');
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
    try {

        // Borrar datos de grupos anteriores
        await generarGrupos.deleteAllGruposBloqueTiempo();
        await generarGrupos.deleteResultadoInscripcion();
        await generarGrupos.deleteAllGrupos();

        // Pre-fetch de datos:
        // 1. Materias abiertas
        // 2. Relación materia-profesor
        // 3. Disponibilidad de todos los profesores
        // 4. Salones disponibles
        const [materiasAbiertas, profesorMaterias, profesorHorarios, salonesDisponibles] = await Promise.all([
            generarGrupos.getMateriasAbiertas(),
            generarGrupos.getProfesorMaterias(),
            generarGrupos.getProfesorHorarios(),
            generarGrupos.getSalonesDisponibles()
        ]);

        // Manejar materias abiertas más de una vez para distintos semestres
        const materiasAgrupadas = materiasAbiertas.rows.reduce((acc, materia) => {
            if (!acc[materia.materia_id]) {
              // Se crea el objeto para la materia, iniciando con un array de semestres
              acc[materia.materia_id] = { 
                ...materia, 
                semestres: [materia.semestre_id] 
              };
            } else {
              // Si ya existe, se agrega el semestre a la lista (evitando duplicados si fuera necesario)
              if (!acc[materia.materia_id].semestres.includes(materia.semestre_id)) {
                acc[materia.materia_id].semestres.push(materia.semestre_id);
              }
            }
            return acc;
        }, {});
          
        // Convertir el objeto en un arreglo para facilitar el recorrido en el backtracking
        const materias = Object.values(materiasAgrupadas);
        const salones = salonesDisponibles.rows;

        let gruposAsignados = []; // Almacenará los grupos asignados para validar restricciones

        // Función recursiva de backtracking
        async function backtrack(i) {
            if (i === materias.length) return true; // Si todas las materias ya han sido asignadas

            const materia = materias[i]; // Materia que se asignará
            const bloquesNecesarios = materia.horas_profesor * 2; // Bloques de tiempo requeridos

            // Filtrar profesores disponibles para la materia
            let profesoresDisponibles = profesorMaterias[materia.materia_id] || [];

            // Iterar sobre cada profesor candidato para la materia
            for (let profesor of profesoresDisponibles) {
                const disponibilidad = profesorHorarios[profesor] || [];

                // Generar todas las combinaciones de bloques de tiempo que cumplan con bloquesNecesarios
                const combinaciones = generarGrupos.generarCombinaciones(disponibilidad, bloquesNecesarios);
                if (!combinaciones.length) continue; // Si no hay combinaciones posibles, probar con otro profesor

                for (let salon of salones) {
                    for (let combinacion of combinaciones) {
                        // Validar que la asignación no tenga conflicto con grupos ya asignados
                        if (generarGrupos.validarRestricciones(combinacion, profesor, salon.salon_id, gruposAsignados, materia.semestre_id)) {

                            // Crear el objeto grupo con la información necesaria
                            const grupo = {
                                materia_id: materia.materia_id,
                                profesor_id: profesor,
                                salon_id: salon.salon_id,
                                ciclo_escolar_id: null // No se asigna de momento
                            };

                            // Insertar el grupo en la BD y obtener el grupo_id
                            const grupoInsertado = await generarGrupos.saveGrupo(grupo);
                            const grupo_id = grupoInsertado.rows[0].grupo_id;

                            // Insertar la asignación de bloques en grupo_horario
                            await generarGrupos.saveGrupoHorario(grupo_id, combinacion);

                            // Registrar la asignación para validar restricciones futuras
                            gruposAsignados.push({
                                grupo_id,
                                profesor_id: profesor,
                                salon_id: salon.salon_id,
                                bloques: combinacion,
                                semestres: materia.semestres
                            });

                            // Intentar asignar la siguiente materia
                            if (await backtrack(i + 1)) return true;

                            // Backtracking: si no se pudo asignar, se retira la asignación actual
                            gruposAsignados.pop();
                            await generarGrupos.deleteGrupoHorario(grupo_id);
                            await generarGrupos.deleteGrupo(grupo_id);
                        }
                    }
                }
            }
            return false; // Si ninguna asignación funcionó para la materia actual, retorna false
        }

        const exito = await backtrack(0);
        if (exito) {
          res.redirect('/coordinador/grupos');
        } else {
          res.status(400).json({ mensaje: "No se pudo generar una asignación válida de grupos" });
        }


    } catch (error) {
        console.error("Error en la generación de grupos:", error);    
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
        const solicitudesActivas = await Solicitud.fetchActivos();
        const msg = req.query.msg || null;

        res.render('solicitudes_cambio_coordinador', {
            isLoggedIn: req.session.isLoggedIn || false,
            matricula: req.session.matricula || '',
            solicitudes: solicitudesActivas.rows, 
            msg  
        });
    } catch (error) {
        console.error('Error al obtener solicitudes:', error);
        res.status(500).render('error', {
            message: 'Hubo un problema al obtener las solicitudes de cambio',
            error
        });
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
    
    

