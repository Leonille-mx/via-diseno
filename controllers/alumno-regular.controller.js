const Alumno = require('../models/alumno.model');
const ResultadoInscripcion = require('../models/resultado_inscripcion.model');

exports.get_prevista_de_horario = async (req, res, nxt) => {
    try {
        const materias_resultado = await Alumno.fetchAllResultadoAlumno(req.session.matricula);
        const inscripcion_completada = await Alumno.verificarInscripcionCompletada(req.session.matricula);
        res.render('horario_alumno_regular', {
            isLoggedIn: req.session.isLoggedIn || false,
            matricula: req.session.matricula || '',
            materias_resultado: materias_resultado.rows,
            inscripcion_completada: inscripcion_completada
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

exports.post_confirmar_horario= async (req, res, nxt) => {
    Alumno.confirmar(req.session.matricula)
    .then (( ) => {
        res.redirect('/alumno-regular/horario');
    })
    .catch((error) => {
        console.log(error);
    });
};

exports.post_solicitud_cambio = async (req, res, nxt) => {
    const { descripcion } = req.body;  
    Alumno.solicitudCambio(req.session.matricula, descripcion)
    .then(() => {
        res.redirect('/alumno-regular/horario');
    })
    .catch((error) => {
        console.log(error);
    });
};
