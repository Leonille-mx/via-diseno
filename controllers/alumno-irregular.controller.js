const Alumno = require('../models/alumno.model');

exports.get_modificar_horario = (req, res, nxt) => {
    Alumno.fetchAllResultadoAlumnoIrregular(req.session.matricula)
    .then((materias_resultado) => {
        res.render('modificar_horario_alumno_irregular', {
            isLoggedIn: req.session.isLoggedIn || false,
            matricula: req.session.matricula || '',
            materias_resultado: materias_resultado.rows,
        });
    }).catch((error) => {
        console.log(error);
    })
};

exports.get_ayuda = (req, res, nxt) => {
    res.render('ayuda_alumno_irregular', {
        isLoggedIn: req.session.isLoggedIn || false,
        matricula: req.session.matricula || '',
    });
};

exports.get_prevista_horario = (req, res, nxt) => {
    res.render('prevista_horario_alumno_irregular', {
        isLoggedIn: req.session.isLoggedIn || false,
        matricula: req.session.matricula || '',
    });
};

exports.get_resultado_de_horario = (req, res, nxt) => {
    res.render('resultado_horario_alumno_irregular', {
        isLoggedIn: req.session.isLoggedIn || false,
        matricula: req.session.matricula || '',
    });
};