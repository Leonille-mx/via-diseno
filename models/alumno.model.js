const pool = require('../util/database')


module.exports = class Alumno {
    constructor(mi_ivd_id, mi_semestre, mi_regular, mi_inscripcion_completa, mi_plan_estudio_id, usuarioData = null) {
        this.ivd_id = mi_ivd_id;
        this.semestre = mi_semestre;
        this.regular = mi_regular;
        this.inscripcion_completada = mi_inscripcion_completa;
        this.plan_estudio_id = mi_plan_estudio_id;
        this.usuario = usuarioData ? new Usuario(...Object.values(usuarioData)) : null;
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
                        'INSERT INTO alumno (ivd_id, semestre, inscripcion_completada, regular, plan_estudio_id) VALUES ($1, $2, $3, $4, $5)',
                        [sA.ivd_id, sA.semester, false, sA.regular, null]
                    );
                    inserted ++;
                } else if (
                      Number(studentDB.semestre) !== Number(sA.semester) ||
                      Boolean(studentDB.regular) !== Boolean(sA.regular) ||
                      Number(studentDB.plan_estudio_id) !== Number(sA.plan_id)
                ) {
                    await client.query(
                        'UPDATE alumno SET semestre = $1, regular = $2, inscripcion_completada = $3, plan_estudio_id = $4 WHERE ivd_id = $5',
                        [sA.semester, sA.regular, false, null, sA.ivd_id]
                    );
                    updated++;
                }
                studentsMap.delete(sA.ivd_id);
            }
            for (const [id] of studentsMap) {
                await client.query('DELETE FROM alumno WHERE ivd_id = $1' [id]);
                deleted++;
            }
            return { inserted, updated, deleted };

        } catch(error){
            console.error('Error durante la sincronización de alumnos:', error);
            throw error;
        } finally {
            client.release();
        }
    } 

    static async fetchAll() {
        const query = `
            SELECT *
            FROM alumno a, usuario u
            WHERE a.ivd_id = u.ivd_id
        `;
        return await pool.query(query);
    }

    static async fetchAllResultadoAlumnoIrregular(id) {
        return pool.query(`
            SELECT (SELECT b.hora_inicio
                    FROM grupo_bloque_tiempo gb
                    JOIN bloque_tiempo b
                        ON b.bloque_tiempo_id = gb.bloque_tiempo_id
                    WHERE gb.grupo_id = r.grupo_id
                    GROUP BY b.hora_inicio, b.dia, gb.bloque_tiempo_id
                    ORDER BY gb.bloque_tiempo_id ASC
                    LIMIT 1) AS hora_inicio,

                    (SELECT b.hora_fin
                    FROM grupo_bloque_tiempo gb
                    JOIN bloque_tiempo b
                        ON b.bloque_tiempo_id = gb.bloque_tiempo_id
                    WHERE gb.grupo_id = r.grupo_id
                    GROUP BY b.hora_fin, b.dia, gb.bloque_tiempo_id
                    ORDER BY gb.bloque_tiempo_id DESC
                    LIMIT 1) AS hora_fin,

                   m.nombre AS materia_nombre,
                   s.numero AS salon_numero,
                   p.nombre AS profesor_nombre,
                   p.primer_apellido AS profesor_primer_apellido,
                   p.segundo_apellido AS profesor_segundo_apellido,
                   r.obligatorio AS obligatorio,

                   (SELECT ARRAY_AGG(DISTINCT b.dia)
                    FROM grupo_bloque_tiempo gb
                    JOIN bloque_tiempo b
                        ON b.bloque_tiempo_id = gb.bloque_tiempo_id
                    WHERE gb.grupo_id = r.grupo_id) AS dias



            FROM resultado_inscripcion r
            JOIN grupo g ON r.grupo_id = g.grupo_id
            JOIN materia m ON g.materia_id = m.materia_id
            JOIN profesor p ON g.profesor_id = p.ivd_id
            JOIN salon s ON g.salon_id = s.salon_id
            JOIN grupo_bloque_tiempo gb ON g.grupo_id = gb.grupo_id
            WHERE r.alumno_id = $1
            GROUP BY r.grupo_id, m.nombre, s.numero, p.nombre, 
                p.primer_apellido, p.segundo_apellido, r.obligatorio;`
            , [id]);
    }
    // Método para obtener número total de alumnos no inscritos
    static async totalNoInscritos() {
        const result = await pool.query('SELECT count(*) FROM public.alumno WHERE inscripcion_completada = false');
        return parseInt(result.rows[0].count);
    };

    // Método para obtener número total de alumnos no inscritos
    static async numero_TotalAlumnoInscritos() {
        const result = await pool.query('SELECT count(*) FROM public.alumno WHERE inscripcion_completada = true');
        return parseInt(result.rows[0].count);
    };

    //metodo para obtener el numero de alumnos no inscritos e inscritos, agrupado por semestres
    static async alumnosComparacion(){
        const result = await pool.query (`SELECT 
            semestre, count(CASE WHEN inscripcion_completada = TRUE THEN 1 END) AS inscritos, 
            COUNT(CASE WHEN inscripcion_completada = FALSE THEN 1 END) AS no_inscritos 
            FROM public.alumno
            group by semestre
            order by semestre ASC;`);
        return result.rows;
    }

}
