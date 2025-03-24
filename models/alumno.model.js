const pool = require('../util/database')

module.exports = class Alumno {
    constructor(mi_inscripcion_completa) {
        this.inscripcion_completa = mi_inscripcion_completa;
    }

    async save() {
        const id = req.bod.ivd_id;
        const semestre = req.body.semester; 
        const regular = req.body.regular;
        const plan_estudio_id = req.body.plan_id

        pool.query('INSERT INTO alumnos VALUES ()')

    }

    static fetchAll() {
        return pool.query()
    }
};
