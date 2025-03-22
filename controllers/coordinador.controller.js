const Salon = require('../models/salon.model');
const Campus = require('../models/campus.model');

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