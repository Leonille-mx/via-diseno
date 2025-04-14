const Alumno = require('../models/alumno.model');
const Materia = require('../models/materia.model');

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

exports.get_prevista_horario = async (req, res, nxt) => {  
    try {
        const materias_resultado = await Alumno.fetchAllResultadoAlumnoIrregular(req.session.matricula);
        const obligatoriasTotales = await Materia.numero_TotalObligatorias();
        const materias_inscritas = await Materia.totalInscritas();
                
        res.render('prevista_horario_alumno_irregular', {
            isLoggedIn: req.session.isLoggedIn || false,
            matricula: req.session.matricula || '',
            materias_resultado: materias_resultado.rows,
            obligatoriasTotales: obligatoriasTotales,
            materias_inscritas: materias_inscritas
        });
    } catch (error) {
        console.error("Error in get_prevista_horario:", error);
        nxt(error);  
    }
};

exports.get_resultado_de_horario = (req, res, nxt) => {
    res.render('resultado_horario_alumno_irregular', {
        isLoggedIn: req.session.isLoggedIn || false,
        matricula: req.session.matricula || '',
    });
};