const Alumno = require('../models/alumno.model');
const ResultadoInscripcion = require('../models/resultado_inscripcion.model');
const Materia = require('../models/materia.model');
const CicloEscolar = require('../models/ciclo-escolar.model')

exports.get_modificar_horario = async (req, res, nxt) => {
    try {
        const [materias_resultado, materias_disponibles_semestre, cicloActual] = await Promise.all([
            Alumno.fetchAllResultadoAlumnoIrregular(req.session.matricula),
            Alumno.fetchAllMateriasDisponiblesDelAlumno(req.session.matricula),
            CicloEscolar.fetchMostRecent()
        ]);

        let cicloInfo = null;
        if (cicloActual.rows.length > 0) {
            const ciclo = cicloActual.rows[0];
            const cicloObj = new CicloEscolar(ciclo.code, ciclo.fecha_inicio, ciclo.fecha_fin);
            cicloInfo = {
                periodo: cicloObj.getFormattedPeriod(),
                fecha_inicio: new Date(ciclo.fecha_inicio).toLocaleDateString('es-ES'),
                fecha_fin: new Date(ciclo.fecha_fin).toLocaleDateString('es-ES'),
                raw: ciclo 
            };
        }

        res.render('modificar_horario_alumno_irregular', {
            isLoggedIn: req.session.isLoggedIn || false,
            matricula: req.session.matricula || '',
            materias_resultado: materias_resultado.rows,
            materias_disponibles_semestre: materias_disponibles_semestre.rows,
            cicloEscolar: cicloInfo
        });
    } catch (error) {
        console.error('Error en get_modificar_horario:', error);
        nxt(error);
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
        await ResultadoInscripcion.eliminarMateriaOpcionalDelResultado(req.session.matricula, grupo_id);

        const materias_resultado = await Alumno.fetchAllResultadoAlumnoIrregular(req.session.matricula);
        const materias_disponibles = await Alumno.fetchAllMateriasDisponiblesDelAlumno(req.session.matricula);

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
        await ResultadoInscripcion.agregarMateriaOpcionalDelResultado(req.session.matricula, grupo_id);

        const materias_resultado = await Alumno.fetchAllResultadoAlumnoIrregular(req.session.matricula);
        const materias_disponibles = await Alumno.fetchAllMateriasDisponiblesDelAlumno(req.session.matricula);

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

exports.get_resultado_de_horario = (req, res, nxt) => {
    res.render('resultado_horario_alumno_irregular', {
        isLoggedIn: req.session.isLoggedIn || false,
        matricula: req.session.matricula || '',
    });
};