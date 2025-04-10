const pool = require('../util/database');

module.exports = class Historial_Academico {
    constructor(mi_ivd_id, mi_materia_id, mi_ciclo_escolar_id, mi_aprobado){
        this.ivd_id = mi_ivd_id;
        this.materia_id = mi_materia_id;
        this.ciclo_escolar_id = mi_ciclo_escolar_id;
        this.aprobado = mi_aprobado;
    }

    static async sincronizarHistorialAcademico(ivd_id, historialApi) {
        const client = await pool.connect();
        try {
            await client.query('DELETE FROM historial_academico WHERE ivd_id = $1', [ivd_id]);

            for (const registro of historialApi) {
                if (!registro.grade_id) continue;

                await client.query(
                    `INSERT INTO historial_academico (
                    ivd_id, materia_id, ciclo_escolar_id, aprobado)
                    VALUES ($1, $2, $3, $4)`,
                    [ivd_id, registro.course_id, 2, registro.grade_final ? registro.grade_final >= 6 : false]
                );
            }
        } catch (error) {
            console.error(`error sincronizando el historial academico del alumno ${ivd_id}:`, error);
            throw error;
        } finally {
            client.release()
        }
    }
}