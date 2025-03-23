const Salon = require('../models/salon.model');
const Materia = require('../models/materia.model');
const { getAllCourses } = require('../adminApiClient');

exports.get_dashboard = (req, res, nxt) => {
    res.render('dashboard_coordinador');
};

exports.get_materias = (req, res, nxt) => {
    Materia.fetchAll()
        .then((result) => {
            res.render('materias_coordinador', {
                materias: result.rows,
            });
        }).catch((error) => {
            console.log(error);
        });
};

exports.post_sincronizar_materias = async (req, res, nxt) => {
    try {
        const courses = await getAllCourses(); 
        console.log(courses); 
        res.redirect('/coordinador/materias');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error para traer datos de materias');
    }
};

exports.get_profesores = (req, res, nxt) => {
    res.render('profesores_coordinador');
};

exports.get_salones = (req, res, nxt) => {
    Salon.fetchAll()
        .then((result) => {
            res.render('salones_coordinador', {
                salones : result.rows,
            });
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