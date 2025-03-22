const Profesor = require('../models/consultar_profesor.model.js');
exports.get_dashboard = (req, res, nxt) => {
    res.render('dashboard_coordinador');
};

exports.get_materias = (req, res, nxt) => {
    res.render('materias_coordinador');
};

exports.get_profesores = (req, res, nxt) => {
    Profesor.fetchAll()
         .then((result) => {
             // Asegúrate de pasar los datos a la vista después de obtenerlos
             res.render('profesores_coordinador', {
                 profesores: result.rows, // Pasa los profesores a la vista
             });
         })
         .catch((error) => {
             console.log(error);
             res.status(500).send('Error al obtener los profesores');
         });
};

exports.get_salones = (req, res, nxt) => {
    res.render('salones_coordinador');
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