const path = require('path');

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

exports.get_prueba = (req, res, nxt) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'prueba2_coordinador.html'));
};