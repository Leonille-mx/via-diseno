const pool = require('../util/database');


module.exports = class ResultadoInscripcion {
    constructor(alumno_id, grupo_id, obligatorio, seleccionado) {
        this.alumno_id = alumno_id;
        this.grupo_id = grupo_id;
        this.obligatorio = obligatorio;
        this.seleccionado = seleccionado;
    }

    static async eliminarMateriaDelResultado(grupo_id, alumno_id) {
        return pool.query(`
            DELETE FROM resultado_inscripcion
            WHERE grupo_id = $1 AND alumno_id = $2`
            ,[grupo_id, alumno_id]
        );
    }

    static async agregarMateriaDelResultado(alumno_id, grupo_id) {
        return pool.query(`
            INSERT INTO resultado_inscripcion (alumno_id, grupo_id, obligatorio, seleccionado)
            VALUES ($1, $2, true, true)`
            , [alumno_id, grupo_id]
        );
    }

    static async modificarObligacion(alumno_id, grupo_id, obligatorio) {
        return pool.query(`
            UPDATE resultado_inscripcion
            SET obligatorio = $1
            WHERE alumno_id = $2 AND grupo_id = $3`
            , [obligatorio, alumno_id, grupo_id]
        );
    }

    static async eliminarMateriaOpcionalDelResultado(alumno_id, grupo_id) {
        return pool.query(`
                UPDATE resultado_inscripcion 
                SET seleccionado = false 
                WHERE alumno_id = $1 AND grupo_id = $2`
            , [alumno_id, grupo_id]
        );
    }

    static async agregarMateriaOpcionalDelResultado(alumno_id, grupo_id) {
        return pool.query(`
                UPDATE resultado_inscripcion 
                SET seleccionado = true 
                WHERE alumno_id = $1 AND grupo_id = $2`
            , [alumno_id, grupo_id]
        );
    }
}