const Alumno = require('../models/alumno.model');
const ResultadoInscripcion = require('../models/resultado_inscripcion.model');
const Materia = require('../models/materia.model');

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

exports.get_resultado_de_horario = async (req, res, nxt) => {
    try {
        const isConfirmed = await AlumnoIrregular.verificarConfirmacion(req.session.matricula);
        
        if (!isConfirmed) {
            return res.redirect('/alumno-irregular/modificar-horario');
        }

        const horario = await AlumnoIrregular.obtenerHorarioConfirmado(req.session.matricula);

        res.render('resultado_horario_alumno_irregular', {
            isLoggedIn: req.session.isLoggedIn || false,
            matricula: req.session.matricula || '',
            horario: horario,  
            isConfirmed: true  
        });
    } catch (error) {
        console.error("Error en get_resultado_de_horario:", error);
        next(error);
    }
};

exports.post_confirmar_horario = async (req, res) => {
    try {
        const matricula = req.session.matricula;
        
        if (!matricula) {
            return res.status(400).json({ 
                success: false, 
                message: "Sesión inválida" 
            });
        }

       
        await Alumno.confirmar(matricula);

        res.json({ 
            success: true,
            message: 'Horario confirmado exitosamente',
            redirectUrl: '/alumno-irregular/resultado-de-horario'
        });

    } catch (error) {
        console.error("Error en post_confirmar_horario:", error);
        res.status(500).json({
            success: false,
            message: 'Error al confirmar horario: ' + error.message
        });
    }
};


exports.get_resultado_de_horario = (req, res, nxt) => {
    res.render('resultado_horario_alumno_irregular', {
        isLoggedIn: req.session.isLoggedIn || false,
        matricula: req.session.matricula || '',
    });
};