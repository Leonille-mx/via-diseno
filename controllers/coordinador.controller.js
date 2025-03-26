const Salon = require('../models/salon.model');
const Campus = require('../models/campus.model');
const Alumno = require('../models/alumno.model')
const { getAllStudents } = require('../adminApiClient')

exports.get_dashboard = (req, res, nxt) => {
    res.render('dashboard_coordinador');
};

exports.get_materias = (req, res, nxt) => {
    res.render('materias_coordinador');
};

exports.get_profesores = (req, res, nxt) => {
    res.render('profesores_coordinador');
};

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

exports.get_alumnos = async (req, res, nxt) => {
    try {
        const studentsDB = await Alumno.fetchAll(); 
        const msg = req.query.msg || null;
        res.render('alumnos_coordinador', {
            student: studentsDB.rows,
            msg,
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
        const resultado = await Alumno.sincronizarAlumnos(studentsApi);
        const msg = `La operación fue exitosa!<br>
                    Insertado: ${resultado.inserted}<br>
                    Actualizado: ${resultado.updated}<br>
                    Eliminado: ${resultado.deleted}`;
        res.redirect('/coordinador/alumnos?msg=${encodeURIComponent(msg)}')
    } catch (error) {
        console.error(error);
        res.redirect(`/coordinador/alumnos?msg=${encodeURIComponent('La operación fue fracasada')}`);
    }
};

exports.get_usuarios = async (req, res, nxt) => {
    try {
        const usersDB = await Usuario.fetchAll(); 
        const msg = req.query.msg || null;
        res.render('usuarios_coordinador', {
            users: usersDB.rows,
            msg,
        });
    } catch(error) {
        console.log(error);
        res.status(500).send('Hubo un problema al obtener los usuarios.');
    }
};

exports.post_sincronizar_usuarios = async (req, res, nxt) => {
    try {
        const users = await getAllUsers();
        
        const usersApi = users.data;
        const resultado = await Usuario.sincronizarUsuarios(usersApi);
        
        const msg = `Operación de usuarios completada!<br>
                    Insertados: ${resultado.inserted}<br>
                    Actualizados: ${resultado.updated}<br>
                    Eliminados: ${resultado.deleted}`;
                    
        res.redirect(`/coordinador/usuarios?msg=${encodeURIComponent(msg)}`);
    } catch (error) {
        console.error(error);
        res.redirect(`/coordinador/usuarios?msg=${
            encodeURIComponent('Error al sincronizar usuarios')
        }`);
    }
};

exports.get_solicitudes_cambio = (req, res, nxt) => {
    res.render('solicitudes_cambio_coordinador');
};

exports.get_ayuda = (req, res, nxt) => {
    res.render('ayuda_coordinador');
};