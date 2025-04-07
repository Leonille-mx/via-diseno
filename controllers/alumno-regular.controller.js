const Alumno = require('../models/alumno.model');
const ResultadoInscripcion = require('../models/resultado_inscripcion.model');

exports.get_prevista_de_horario = async (req, res, nxt) => {
    try {
        const materias_resultado = await Alumno.fetchAllResultadoAlumnoRegular(req.session.matricula);
        console.log(materias_resultado.rows);
        res.render('horario_alumno_regular', {
            isLoggedIn: req.session.isLoggedIn || false,
            matricula: req.session.matricula || '',
            materias_resultado: materias_resultado.rows,
        });
    } catch (error){
        console.log(error);
    }
};

exports.get_ayuda = (req, res, nxt) => {
    res.render('ayuda_alumno_irregular', {
        isLoggedIn: req.session.isLoggedIn || false,
        matricula: req.session.matricula || '',
    });
};
