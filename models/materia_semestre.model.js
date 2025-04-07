const pool = require('../util/database');

module.exports = class MateriaSemestre {

    constructor(_materia_id, _semestre_id) {
        this.materia_id = _materia_id;
        this.semestre_id = _semestre_id;
    }

    static async fetchMateriasSemestre() {
        return pool.query(`
            SELECT 
            m.materia_id, nombre, creditos, 
            horas_profesor, tipo_salon, 
            semestre_id
            FROM materia m, materia_semestre ms
            WHERE m.materia_id = ms.materia_id
            ORDER BY materia_id ASC`
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
    
}