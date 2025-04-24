const CicloEscolar = require('../models/ciclo-escolar.model');

async function agregarCicloInfo(req, res, next) {
    try {
        const cicloActual = await CicloEscolar.fetchMostRecent();

        if (cicloActual.rows.length > 0) {
            const ciclo = cicloActual.rows[0];
            const cicloObj = new CicloEscolar(ciclo.code, ciclo.fecha_inicio, ciclo.fecha_fin);
            res.locals.cicloInfo = {
                periodo: cicloObj.getFormattedPeriod(),
                fecha_inicio: new Date(ciclo.fecha_inicio).toLocaleDateString('es-ES'),
                fecha_fin: new Date(ciclo.fecha_fin).toLocaleDateString('es-ES'),
                raw: ciclo 
            };
        } else {
            res.locals.cicloInfo = null;
        }
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = agregarCicloInfo;
        