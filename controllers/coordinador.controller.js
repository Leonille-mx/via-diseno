const Salon = require('../models/salon.model');
const Campus = require('../models/campus.model');
const Materia = require('../models/materia.model');
const Profesor = require('../models/profesor.model.js');
const MateriaSemestre = require('../models/materia_semestre.model.js');
const { getAllProfessors, getAllCourses } = require('../util/adminApiClient.js');

exports.get_dashboard = (req, res, nxt) => {
    res.render('dashboard_coordinador');
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
    const profesoresDB = await Profesor.fetchAll();  
    const msg = req.query.msg || null;

    res.render('profesores_coordinador', {
        profesores: profesoresDB.rows,  
        msg, 
    });
  } catch (error) {
    console.log(error);
    res.status(500).send('Hubo un problema al obtener los profesores.');
  }
};

exports.post_sincronizar_profesores = async (req, res, nxt) => {
    try {
        const courses = await getAllProfessors(); 
        const profesoresApi = courses.data; 
        
        const resultado = await Profesor.sincronizarProfesores(profesoresApi); 
        const msg = `La operación fue exitosa!<br>
                    Insertado: ${resultado.inserted}<br>
                    Actualizado: ${resultado.updated}<br>
                    Eliminado: ${resultado.deleted}`; 

        res.redirect(`/coordinador/profesores?msg=${encodeURIComponent(msg)}`);
    } catch (error) {
        console.error(error);
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
    Profesor.getSchedule(req.params.id)
    .then((bloques) => {
        res.json({ bloques });
    })
    .catch((error) => {
        console.error("Error al obtener bloques:", error);
        res.status(500).json({ error: "Error al obtener horario" });
    });
};

exports.post_modificar_profesor = (req, res, nxt) => {
    const selectedBlocks = JSON.parse(req.body.selectedBlocks);
    Profesor.deleteSchedule(req.params.id)
    .then(() => {
        for (const bloque of selectedBlocks) {
            Profesor.updateSchedule(req.params.id, bloque)
            .then()
            .catch((error) => {
                console.log(error);
            });
        }
        res.redirect('/coordinador/profesores')
    })
    .catch((error) => {
        console.log(error);
    });
}

exports.get_salones = (req, res, nxt) => {
    Salon.fetchAll()
    .then((salones) => {
        Campus.fetchAll()
            .then((campus) => {
                res.render('salones_coordinador', {
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
    });
};

exports.post_eliminar_salon = (req, res, nxt) => {
    Salon.delete(req.params.id)
        .then(() => {
            res.redirect('/coordinador/salones');
        })
        .catch((error) => {
            console.log(error);
        });
};

exports.get_grupos = (req, res, nxt) => {
    res.render('grupos_coordinador');
};

exports.get_alumnos = (req, res, nxt) => {
    res.render('alumnos_coordinador');
};

exports.get_solicitudes_cambio = (req, res, nxt) => {
    res.render('solicitudes_cambio_coordinador');
};

exports.get_ayuda = (req, res, nxt) => {
    res.render('ayuda_coordinador');
};