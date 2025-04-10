const pool = require('../util/database');

module.exports = class MateriaSemestre {

    constructor(_materia_id, _semestre_id) {
        this.materia_id = _materia_id;
        this.semestre_id = _semestre_id;
    }

    static async fetchMateriasSemestre() {
        return pool.query(`
            SELECT 
            m.materia_id, m.sep_id, nombre, creditos,
            semestre_plan, horas_profesor, 
            tipo_salon, semestre_id
            FROM materia m, materia_semestre ms
            WHERE m.materia_id = ms.materia_id
            ORDER BY m.sep_id ASC`
        );
    }

    static async fetchMateriasSemestreOnce() {
        return pool.query(`
            SELECT DISTINCT
            m.materia_id, sep_id, m.nombre, creditos, horas_profesor, tipo_salon, semestre_plan, c.nombre AS carrera
            FROM materia m, materia_semestre ms, plan_materia plm, plan_estudio pe, carrera c
            WHERE m.materia_id = ms.materia_id
            AND m.materia_id = plm.materia_id
            AND plm.plan_estudio_id = pe.plan_estudio_id
            AND plm.plan_estudio_version = pe.version
            AND pe.carrera_id = c.carrera_id
            ORDER BY semestre_plan`
        );
    }    

    static eliminar(idMateria, idSemestre) {
        return pool.query('BEGIN') 
            .then(() => pool.query(
                `DELETE FROM resultado_inscripcion 
                 WHERE grupo_id IN (SELECT grupo_id FROM grupo WHERE materia_id = $1)`,
                [idMateria]
            ))
            .then(() => pool.query(
                `DELETE FROM grupo_bloque_tiempo 
                 WHERE grupo_id IN (SELECT grupo_id FROM grupo WHERE materia_id = $1)`,
                [idMateria]
            ))
            .then(() => pool.query(
                'DELETE FROM grupo WHERE materia_id = $1',
                [idMateria]
            ))
            .then(() => pool.query(
                'DELETE FROM materia_semestre WHERE materia_id = $1 AND semestre_id = $2',
                [idMateria, idSemestre]
            ))
            .then(() => pool.query('COMMIT')) 
            .catch(err => {
                return pool.query('ROLLBACK') 
                    .then(() => { throw err; });
            });
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
            `SELECT m.materia_id, m.sep_id, m.semestre_plan, m.nombre, m.creditos, m.horas_profesor, m.tipo_salon
             FROM materia m
             WHERE NOT EXISTS (
                 SELECT 1 FROM materia_semestre ms
                 WHERE ms.materia_id = m.materia_id
                 AND ms.semestre_id = $1
             )
             ORDER BY m.sep_id;`,
            [semestre_id]
        );
    }
}
