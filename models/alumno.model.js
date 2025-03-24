const pool = require('../util/database')

module.exports = class Alumno {
    constructor(mi_id, mi_semestre, mi_regular, mi_inscripcion_completa, mi_plan_estudio_id) {
        this.id = mi_id;
        this.semestre = mi_semestre;
        this.regular = mi_regular;
        this.inscripcion_completa = mi_inscripcion_completa;
        this.plan_estudio_id = mi_plan_estudio_id;
    }

    static async sincronizarAlumnos(studentsApi) {

        const client = await pool.connect();
        
        try { 

            const studentsDB_data = await client.query('SELECT * FROM alumno');

            const studentsDB = studentsDB_data.rows;

            const studentsMap = new Map(studentsDB.map(student => [ student.ivd_id, student ] ))

            let inserted = 0, updated = 0, deleted = 0;

            for (const sA of studentsApi) {
                const studentDB = studentsMap.get(sA.ivd_id)

                if(!studentDB) {
                    await client.query(
                        'INSERT INTO alumno (ivd_id, semestre, regular, plan_estudio_id) VALUES ($1, $2, $3, $4)',
                        [sA.ivd_id, sA.semester, sA.regular, sA.plan_id]
                    );
                    inserted ++;
                } else if (
                      Number(studentDB.semestre) !== Number(sA.semester) ||
                      Boolean(studentDB.regular) !== Boolean(sA.regular)
                ) {
                    await client.query(
                        'UPDATE alumno SET semestre = $1, regular = $2, plan_estudio_id = $3 WHERE alumno_id = $4',
                        [sA.semester, sA.regular, sA.plan_id, sA.ivd_id]
                    );
                    updated++;
                }
                materiasMap.delete(sA.ivd_id);
            }
            for (const [id] of studentsMap) {
                await client.query('DELETE FROM alumno WHERE ivd_id = $1' [id]);
                deleted++;
            }
            return { inserted, updated, deleted };

        } catch(error){
            console.error('Errr durante la sincronización de alumnos:', error);
            throw error;
        } finally {
            client.release();
        }
    } 
}
