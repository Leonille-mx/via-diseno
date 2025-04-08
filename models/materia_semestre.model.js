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
                           WHERE m.materia_id = ms.materia_id`);
    }

    static async abrirMateriaEnSemestre(materia_id, semestre_id) {
        const client = await pool.connect();
        try {
            await client.query(
                `INSERT INTO materia_semestre (materia_id, semestre_id)
                 VALUES ($1, $2)`,
                [materia_id, semestre_id]
            );
        } finally {
            client.release();
        }
    }

    static async fetchMateriasNoAbiertasPorSemestre(semestre_id) {
        return pool.query(
            `SELECT m.materia_id, m.nombre, m.creditos, m.horas_profesor, m.tipo_salon
             FROM materia m
             WHERE NOT EXISTS (
                 SELECT 1 FROM materia_semestre ms
                 WHERE ms.materia_id = m.materia_id
                 AND ms.semestre_id = $1
             );`,
            [semestre_id]
        );
    }
}