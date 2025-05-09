const Alumno = require('../models/alumno.model');
const ResultadoInscripcion = require('../models/resultado_inscripcion.model');
const CicloEscolar = require('../models/ciclo-escolar.model')
const BloqueTiempo = require('../models/bloque_tiempo.model');

exports.get_prevista_de_horario = async (req, res, next) => {
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
        res.render('horario_alumno_regular', {
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


exports.get_ayuda = (req, res, nxt) => {
    res.render('ayuda_alumno_regular', {
        isLoggedIn: req.session.isLoggedIn || false,
        matricula: req.session.usuario.id || '',
    });
};

exports.post_confirmar_horario= async (req, res, nxt) => {
    Alumno.confirmar(req.session.usuario.id)
    .then (( ) => {
        res.redirect('/alumno-regular/horario');
    })
    .catch((error) => {
        console.log(error);
    });
};

exports.post_solicitud_cambio = async (req, res, nxt) => {
    const { descripcion } = req.body;  
    Alumno.solicitudCambio(req.session.usuario.id, descripcion)
    .then(() => {
        res.redirect('/alumno-regular/horario');
    })
    .catch((error) => {
        console.log(error);
    });
};
