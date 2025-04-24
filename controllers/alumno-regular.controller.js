const Alumno = require('../models/alumno.model');
const ResultadoInscripcion = require('../models/resultado_inscripcion.model');
const CicloEscolar = require('../models/ciclo-escolar.model')

exports.get_prevista_de_horario = async (req, res, next) => {
    try {
        const [materias_resultado, inscripcion_completada, cicloActual] = await Promise.all([
            Alumno.fetchAllResultadoAlumno(req.session.matricula),
            Alumno.verificarInscripcionCompletada(req.session.matricula),
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

        res.render('horario_alumno_regular', {
            isLoggedIn: req.session.isLoggedIn || false,
            matricula: req.session.matricula || '',
            materias_resultado: materias_resultado.rows,
            inscripcion_completada: inscripcion_completada,
            cicloEscolar: cicloInfo 
        });
    } catch (error) {
        console.error('Error en get_prevista_de_horario:', error);
        next(error);
    }
};


exports.get_ayuda = (req, res, nxt) => {
    res.render('ayuda_alumno_regular', {
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
