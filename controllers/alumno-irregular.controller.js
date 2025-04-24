const Alumno = require('../models/alumno.model');
const ResultadoInscripcion = require('../models/resultado_inscripcion.model');
const Materia = require('../models/materia.model');
const CicloEscolar = require('../models/ciclo-escolar.model');
const BloqueTiempo = require('../models/bloque_tiempo.model');

exports.get_modificar_horario = async (req, res, nxt) => {
    const inscripcion_completada = await Alumno.verificarInscripcionCompletada(req.session.usuario.id);
    if (inscripcion_completada === false) {
        try {
            const materias_resultado = await Alumno.fetchAllResultadoAlumnoIrregular2(req.session.usuario.id);
            const bloque_tiempo = await BloqueTiempo.fetchAllHoras();
            const bloqueTiempoMap = bloque_tiempo.rows[0]?.id_hora_map || {};
            const cicloActual = await CicloEscolar.fetchMostRecent();
    
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
                matricula: req.session.usuario.id || '',
                materias_resultado: materias_resultado.rows,
                cicloEscolar: cicloInfo,
                bloque_tiempo: bloqueTiempoMap
            });
        } catch (error) {
            console.error('Error en get_modificar_horario:', error);
            nxt(error);
        }
    } else if (inscripcion_completada === true) {
        try {
            const materias_resultado = await Alumno.fetchAllResultadoAlumno2(req.session.usuario.id);
            const bloque_tiempo = await BloqueTiempo.fetchAllHoras();
            const bloqueTiempoMap = bloque_tiempo.rows[0]?.id_hora_map || {};
            const inscripcion_completada = await Alumno.verificarInscripcionCompletada(req.session.usuario.id);
            const cicloActual = await CicloEscolar.fetchMostRecent();
    
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
            res.render('resultado_inscripcion_alumno_irregular', {
                isLoggedIn: req.session.isLoggedIn || false,
                matricula: req.session.usuario.id || '',
                materias_resultado: materias_resultado.rows,
                inscripcion_completada: inscripcion_completada,
                cicloEscolar: cicloInfo,
                bloque_tiempo: bloqueTiempoMap
            });
        } catch (error) {
            console.error('Error en get_prevista_de_horario:', error);
            next(error);
        }
    }
};

exports.get_materias_disponibles = (req, res, nxt) => {
    if (req.params.semestre == 'semestre') {
        Alumno.fetchAllMateriasDisponiblesDelAlumno2(req.session.usuario.id)
        .then((materias_disponibles) => {
            res.status(200).json({
                materias_disponibles: materias_disponibles.rows,
            });
        }).catch((error) => {
            console.log(error);
        });
    } else {
        Alumno.fetchAllMateriasDisponiblesDelAlumnoPorSemestre(req.params.semestre, req.session.usuario.id)
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
        await ResultadoInscripcion.eliminarMateriaOpcionalDelResultado(req.session.usuario.id, grupo_id);

        const materias_resultado = await Alumno.fetchAllResultadoAlumnoIrregular2(req.session.usuario.id);
        const bloque_tiempo = await BloqueTiempo.fetchAllHoras();
        const bloqueTiempoMap = bloque_tiempo.rows[0]?.id_hora_map || {};

        res.status(200).json({
            isLoggedIn: req.session.isLoggedIn || false,
            matricula: req.session.usuario.id || '',
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
        await ResultadoInscripcion.agregarMateriaOpcionalDelResultado(req.session.usuario.id, grupo_id);

        const materias_resultado = await Alumno.fetchAllResultadoAlumnoIrregular2(req.session.usuario.id);
        const bloque_tiempo = await BloqueTiempo.fetchAllHoras();
        const bloqueTiempoMap = bloque_tiempo.rows[0]?.id_hora_map || {};

        res.status(200).json({
            isLoggedIn: req.session.isLoggedIn || false,
            matricula: req.session.usuario.id || '',
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
        matricula: req.session.usuario.id || '',
    });
};

exports.get_prevista_horario = async (req, res, nxt) => {  
    try {
        const materias_resultado = await Alumno.fetchAllResultadoAlumnoIrregular2(req.session.usuario.id);
        const obligatoriasTotales = await Materia.numero_TotalObligatorias();
        const materias_inscritas = await Materia.totalInscritas(req.session.usuario.id);
        const bloque_tiempo = await BloqueTiempo.fetchAllHoras();
        const bloqueTiempoMap = bloque_tiempo.rows[0]?.id_hora_map || {};
                
        res.render('prevista_horario_alumno_irregular', {
            isLoggedIn: req.session.isLoggedIn || false,
            matricula: req.session.usuario.id || '',
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

exports.get_resultado_de_horario = async (req, res, nxt) => {
    try {
        const isConfirmed = await AlumnoIrregular.verificarConfirmacion(req.session.usuario.id);
        
        if (!isConfirmed) {
            return res.redirect('/alumno-irregular/modificar-horario');
        }

        const horario = await AlumnoIrregular.obtenerHorarioConfirmado(req.session.usuario.id);

        res.render('resultado_inscripcion_alumno_irregular', {
            isLoggedIn: req.session.isLoggedIn || false,
            matricula: req.session.usuario.id || '',
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
        const matricula = req.session.usuario.id;
        
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
            redirectUrl: '/alumno-irregular/resultado-de-inscripcion'
        });

    } catch (error) {
        console.error("Error en post_confirmar_horario:", error);
        res.status(500).json({
            success: false,
            message: 'Error al confirmar horario: ' + error.message
        });
    }
};

exports.get_resultado_de_horario = async (req, res, next) => {
    try {
        const materias_resultado = await Alumno.fetchAllResultadoAlumno2(req.session.usuario.id);
        const bloque_tiempo = await BloqueTiempo.fetchAllHoras();
        const bloqueTiempoMap = bloque_tiempo.rows[0]?.id_hora_map || {};
        const inscripcion_completada = await Alumno.verificarInscripcionCompletada(req.session.usuario.id);
        const cicloActual = await CicloEscolar.fetchMostRecent();

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
        res.render('resultado_inscripcion_alumno_irregular', {
            isLoggedIn: req.session.isLoggedIn || false,
            matricula: req.session.usuario.id || '',
            materias_resultado: materias_resultado.rows,
            inscripcion_completada: inscripcion_completada,
            cicloEscolar: cicloInfo,
            bloque_tiempo: bloqueTiempoMap
        });
    } catch (error) {
        console.error('Error en get_prevista_de_horario:', error);
        next(error);
    }
};
