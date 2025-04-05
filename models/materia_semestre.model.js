const pool = require('../util/database');

module.exports = class MateriaSemestre {

    constructor(_materia_id, _semestre_id) {
        this.materia_id = _materia_id;
        this.semestre_id = _semestre_id;
    }

    static async fetchMateriasSemestre() {
        return pool.query(`SELECT 
                           m.materia_id, nombre, creditos, 
                           horas_profesor, tipo_salon, 
                           semestre_id
                           FROM materia m, materia_semestre ms
                           WHERE m.materia_id = ms.materia_id
                           ORDER BY materia_id ASC`);
    }
}