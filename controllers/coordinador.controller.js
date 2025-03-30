const Salon = require('../models/salon.model');
const Campus = require('../models/campus.model');
const Materia = require('../models/materia.model');
const Profesor = require('../models/profesor.model.js');
const MateriaSemestre = require('../models/materia_semestre.model.js');
const CicloEscolar = require('../models/ciclo-escolar.model');
const Grupos = require('../models/grupo.model');
const Alumno = require('../models/alumno.model');
const Usuario = require('../models/usuario.model.js');
const { getAllProfessors, getAllCourses, getAllStudents, getCiclosEscolares} = require('../util/adminApiClient.js');

exports.get_dashboard = (req, res) => {
    try {
        const msg = req.query.msg || null;  
        res.render('dashboard_coordinador', {
            msg: msg,
            isLoggedIn: req.session.isLoggedIn || false,
            matricula: req.session.matricula || '',
        });
    } catch (error) {
        console.error("Dashboard error:", error);
        res.status(500).send("Error loading dashboard");
    }
};

exports.get_materias = async (req, res, nxt) => {
    try {
        const materiasSemestreDB = await MateriaSemestre.fetchMateriasSemestre();
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
        res.render('materias_coordinador', {
            isLoggedIn: req.session.isLoggedIn || false,
            matricula: req.session.matricula || '',
            materiasPorSemestre: materiasPorSemestre,
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
        
exports.get_profesores = async (req, res, nxt) => {
  try {
    const materias = await MateriaSemestre.fetchMateriasSemestre(); 
    const profesoresActivos = await Profesor.fetchActivos();  
    const profesoresInactivos = await Profesor.fetchInactivos();
    const msg = req.query.msg || null;

    res.render('profesores_coordinador', {
        isLoggedIn: req.session.isLoggedIn || false,
        matricula: req.session.matricula || '',
        profesores: profesoresActivos.rows,  
        profesoresInactivos: profesoresInactivos.rows,  
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

exports.post_eliminar_profesor = (req, res, nxt) => {
  Profesor.delete(req.params.id)
      .then(() => {
          res.redirect('/coordinador/profesores');
      })
      .catch((error) => {
          console.log(error);
      });
};

exports.get_modificar_profesor = (req, res, next) => {    
    Promise.all([
        Profesor.getSchedule(req.params.id),
        Profesor.getCourses(req.params.id)
    ])
    .then(([bloques, materias]) => {
        res.json({ 
            bloques: bloques,
            materias: materias 
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

exports.post_modificar_profesor = (req, res, nxt) => {
    try {
        const selectedBlocks = JSON.parse(req.body.selectedBlocks);
        const selectedMaterias = JSON.parse(req.body.selectedMaterias);
        const profesorId = req.params.id;

        // Eliminar horario actual del profesor
        Profesor.deleteSchedule(profesorId)
            .then(() => {
                // Desasignar materias actuales del profesor
                return Profesor.unassignCourses(profesorId);
            })
            .then(() => {
                // Asignar nuevas materias al profesor
                const materiaPromises = selectedMaterias.map(materia => 
                    Profesor.asignCourses(profesorId, materia)
                );

                // Actualizar bloques de horario del profesor
                const bloquePromises = selectedBlocks.map(bloque => 
                    Profesor.updateSchedule(profesorId, bloque)
                );

                // Ejecutar todas las promesas en paralelo
                return Promise.all([...materiaPromises, ...bloquePromises]);
            })
            .then(() => {
                res.redirect('/coordinador/profesores');
            })
            .catch(error => {
                console.error("Error en post_modificar_profesor:", error);
                res.status(500).send("Error al modificar el profesor");
            });

    } catch (error) {
        console.error("Error al procesar la solicitud:", error);
        res.status(500).send("Error en los datos enviados");
    }
};


exports.post_activar_profesor = async (req, res, next) => {
    try {
        const profesorId = req.body.profesorId;
        
        if (!profesorId) {
            return res.redirect('/coordinador/profesores?msg=Debe seleccionar un profesor');
        }

        await Profesor.activar(profesorId);
        res.redirect('/coordinador/profesores');
    } catch (error) {
        console.error('Error al activar el profesor:', error);
        res.redirect('/coordinador/profesores?msg=Error al activar el profesor');
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
    Grupos.fetchAll()
        .then((result) => {
            res.render('grupos_coordinador', { 
                grupos: result.rows,
                isLoggedIn: req.session.isLoggedIn || false,
                matricula: req.session.matricula || '',
            });
        })
        .catch((error) => {
            console.error('Error fetching grupos:', error);
            res.status(500).send('Error al obtener los grupos'); 
        });
};

exports.get_alumnos = async (req, res, nxt) => {
    try {
        const studentsDB = await Alumno.fetchAll(); 
        const msg = req.query.msg || null;
        res.render('alumnos_coordinador', {
            students: studentsDB.rows,
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
    Grupos.delete(req.params.id)
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
    
        res.redirect(`/coordinador/dashboard?msg=${encodeURIComponent(msg)}`);
        
    } catch (error) {   
        console.error("Error en sincronización:", error);
        res.redirect(`/coordinador/dashboard?msg=${encodeURIComponent('Error: ' + error.message)}`);
    }        
};
    1