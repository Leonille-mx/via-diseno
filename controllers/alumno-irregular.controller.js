const Alumno = require('../models/alumno.model');
const ResultadoInscripcion = require('../models/resultado_inscripcion.model');

exports.get_modificar_horario = async (req, res, nxt) => {
    try {
        const materias_resultado = await Alumno.fetchAllResultadoAlumnoIrregular(req.session.matricula);
        const materias_disponibles_semestre = await Alumno.fetchAllMateriasDisponiblesDelAlumno(req.session.matricula);
        res.render('modificar_horario_alumno_irregular', {
            isLoggedIn: req.session.isLoggedIn || false,
            matricula: req.session.matricula || '',
            materias_resultado: materias_resultado.rows,
            materias_disponibles_semestre: materias_disponibles_semestre.rows,
        });
    } catch (error){
        console.log(error);
    }
};

exports.get_materias_disponibles = (req, res, nxt) => {
    if (req.params.semestre == 'semestre') {
        Alumno.fetchAllMateriasDisponiblesDelAlumno(req.session.matricula)
        .then((materias_disponibles) => {
            res.status(200).json({
                materias_disponibles: materias_disponibles.rows,
            });
        }).catch((error) => {
            console.log(error);
        });
    } else {
        Alumno.fetchAllMateriasDisponiblesDelAlumnoPorSemestre(req.params.semestre, req.session.matricula)
        .then((materias_disponibles) => {
            res.status(200).json({
                materias_disponibles: materias_disponibles.rows,
            });
        }).catch((error) => {
            console.log(error);
        });
    }
};

exports.post_eliminar_materia_del_resultado = async (req, res, nxt) => {
    try {
        const grupo_id = req.body.grupo_id;
        await ResultadoInscripcion.eliminarMateriaDelResultado(grupo_id);

        const materias_resultado = await Alumno.fetchAllResultadoAlumnoIrregular(req.session.matricula);
        const materias_disponibles = req.body.semestre == 'semestre'
            ? await Alumno.fetchAllMateriasDisponiblesDelAlumno(req.session.matricula)
            : await Alumno.fetchAllMateriasDisponiblesDelAlumnoPorSemestre(req.body.semestre, req.session.matricula);

        res.status(200).json({
            isLoggedIn: req.session.isLoggedIn || false,
            matricula: req.session.matricula || '',
            materias_resultado: materias_resultado.rows,
            materias_disponibles: materias_disponibles.rows,
        });
    } catch (error) {
        console.log(error);
    }
}

exports.post_agregar_materia_del_resultado = async (req, res, nxt) => {
    try {
        const grupo_id = req.body.grupo_id;
        await ResultadoInscripcion.agregarMateriaDelResultado(req.session.matricula, grupo_id);

        const materias_resultado = await Alumno.fetchAllResultadoAlumnoIrregular(req.session.matricula);
        const materias_disponibles = req.body.semestre == 'semestre'
            ? await Alumno.fetchAllMateriasDisponiblesDelAlumno(req.session.matricula)
            : await Alumno.fetchAllMateriasDisponiblesDelAlumnoPorSemestre(req.body.semestre, req.session.matricula);

        res.status(200).json({
            isLoggedIn: req.session.isLoggedIn || false,
            matricula: req.session.matricula || '',
            materias_resultado: materias_resultado.rows,
            materias_disponibles: materias_disponibles.rows,
        });
    } catch (error) {
        console.log(error);
    }
}

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