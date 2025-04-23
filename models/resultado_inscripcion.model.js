const pool = require('../util/database');


module.exports = class ResultadoInscripcion {
    constructor(alumno_id, grupo_id, obligatorio) {
        this.alumno_id = alumno_id;
        this.grupo_id = grupo_id;
        this.obligatorio = obligatorio;
    }

    static async eliminarMateriaDelResultado(grupo_id) {
        return pool.query(`
            DELETE FROM resultado_inscripcion
            WHERE grupo_id = $1`
            ,[grupo_id]
        );
    }

    static async agregarMateriaDelResultado(alumno_id, grupo_id) {
        return pool.query(`
            INSERT INTO resultado_inscripcion (alumno_id, grupo_id, obligatorio)
            VALUES ($1, $2, false)`
            , [alumno_id, grupo_id]
        );
    }
}