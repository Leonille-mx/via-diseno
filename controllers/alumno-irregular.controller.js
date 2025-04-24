const Alumno = require('../models/alumno.model');
const ResultadoInscripcion = require('../models/resultado_inscripcion.model');
const Materia = require('../models/materia.model');
const BloqueTiempo = require('../models/bloque_tiempo.model');

exports.get_modificar_horario = async (req, res, nxt) => {
    try {
        const materias_resultado = await Alumno.fetchAllResultadoAlumnoIrregular2(req.session.matricula);
        const bloque_tiempo = await BloqueTiempo.fetchAllHoras();
        const bloqueTiempoMap = bloque_tiempo.rows[0]?.id_hora_map || {};
        res.render('modificar_horario_alumno_irregular', {
            isLoggedIn: req.session.isLoggedIn || false,
            matricula: req.session.matricula || '',
            materias_resultado: materias_resultado.rows,
            bloque_tiempo: bloqueTiempoMap
        });
    } catch (error){
        console.log(error);
    }
};

exports.get_materias_disponibles = (req, res, nxt) => {
    if (req.params.semestre == 'semestre') {
        Alumno.fetchAllMateriasDisponiblesDelAlumno2(req.session.matricula)
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
        await ResultadoInscripcion.eliminarMateriaOpcionalDelResultado(req.session.matricula, grupo_id);

        const materias_resultado = await Alumno.fetchAllResultadoAlumnoIrregular2(req.session.matricula);
        const bloque_tiempo = await BloqueTiempo.fetchAllHoras();
        const bloqueTiempoMap = bloque_tiempo.rows[0]?.id_hora_map || {};

        res.status(200).json({
            isLoggedIn: req.session.isLoggedIn || false,
            matricula: req.session.matricula || '',
            materias_resultado: materias_resultado.rows,
            bloque_tiempo: bloqueTiempoMap
        });
    } catch (error) {
        console.log(error);
    }
}

exports.post_agregar_materia_del_resultado = async (req, res, nxt) => {
    try {
        const grupo_id = req.body.grupo_id;
        await ResultadoInscripcion.agregarMateriaOpcionalDelResultado(req.session.matricula, grupo_id);

        const materias_resultado = await Alumno.fetchAllResultadoAlumnoIrregular2(req.session.matricula);
        const bloque_tiempo = await BloqueTiempo.fetchAllHoras();
        const bloqueTiempoMap = bloque_tiempo.rows[0]?.id_hora_map || {};

        res.status(200).json({
            isLoggedIn: req.session.isLoggedIn || false,
            matricula: req.session.matricula || '',
            materias_resultado: materias_resultado.rows,
            bloque_tiempo: bloqueTiempoMap
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

exports.get_prevista_horario = async (req, res, nxt) => {  
    try {
        const materias_resultado = await Alumno.fetchAllResultadoAlumnoIrregular2(req.session.matricula);
        const obligatoriasTotales = await Materia.numero_TotalObligatorias();
        const materias_inscritas = await Materia.totalInscritas();
        const bloque_tiempo = await BloqueTiempo.fetchAllHoras();
        const bloqueTiempoMap = bloque_tiempo.rows[0]?.id_hora_map || {};
                
        res.render('prevista_horario_alumno_irregular', {
            isLoggedIn: req.session.isLoggedIn || false,
            matricula: req.session.matricula || '',
            materias_resultado: materias_resultado.rows,
            obligatoriasTotales: obligatoriasTotales,
            materias_inscritas: materias_inscritas,
            bloque_tiempo: bloqueTiempoMap
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

exports.get_resultado_de_horario = (req, res, nxt) => {
    res.render('resultado_horario_alumno_irregular', {
        isLoggedIn: req.session.isLoggedIn || false,
        matricula: req.session.matricula || '',
    });
};