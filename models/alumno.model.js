const pool = require('../util/database')

module.exports = class Alumno {
    constructor(mi_ivd_id, mi_semestre, mi_regular, mi_inscripcion_completa, mi_plan_estudio_id, mi_plan_estudio_version, mi_carrera_id = null, mi_carrera_nombre = null, usuarioData = null) {
        this.ivd_id = mi_ivd_id;
        this.semestre = mi_semestre;
        this.regular = mi_regular;
        this.inscripcion_completada = mi_inscripcion_completa;
        this.plan_estudio_id = mi_plan_estudio_id;
        this.plan_estudio_version = mi_plan_estudio_version;
        this.carrera_id = mi_carrera_id; 
        this.nombre = mi_carrera_nombre; 
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
                        'INSERT INTO alumno (ivd_id, semestre, inscripcion_completada, regular, plan_estudio_id, plan_estudio_version) VALUES ($1, $2, $3, $4, $5, $6)',
                        [sA.ivd_id, sA.semester, false, sA.regular, sA.plan_id, sA.plan_version]
                    );
                    inserted ++;
                } else if (
                      Number(studentDB.semestre) !== Number(sA.semester) ||
                      Boolean(studentDB.regular) !== Boolean(sA.regular) ||
                      Number(studentDB.plan_estudio_id) !== Number(sA.plan_id) ||
                      Number(studentDB.plan_estudio_version) !== Number(sA.plan_version)
                ) {
                    await client.query(
                        'UPDATE alumno SET semestre = $1, regular = $2, inscripcion_completada = $3, plan_estudio_id = $4, plan_estudio_version = $5 WHERE ivd_id = $6',
                        [sA.semester, sA.regular, false, sA.plan_id, sA.plan_version, sA.ivd_id]
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

    static async fetchAllRegulares() {
        const query = `
            SELECT *
            FROM alumno a, usuario u
            WHERE a.ivd_id = u.ivd_id AND
                  a.regular = true
            ORDER BY a.ivd_id ASC
        `;
        return await pool.query(query);
    }

    static async fetchAllRegularesPorCarrera(carrera_id) {
        const query = `
          SELECT a.*, u.*, c.carrera_id, c.nombre as carrera_nombre
          FROM alumno a
          JOIN usuario u ON a.ivd_id = u.ivd_id
          JOIN plan_estudio p ON p.plan_estudio_id = a.plan_estudio_id
          JOIN carrera c ON c.carrera_id = p.carrera_id
          WHERE a.regular = true AND
                p.carrera_id = $1
          ORDER BY a.ivd_id ASC
      `; 
      return await pool.query(query, [carrera_id]);
    }

    static async fetchAllIrregulares() {
        const query = `
            SELECT *,
                  (SELECT COUNT(alumno_id) > 0 AS result
                   FROM resultado_inscripcion
                   WHERE alumno_id = a.ivd_id)
                  AS asignada
            FROM alumno a
            WHERE a.ivd_id = u.ivd_id AND
                  a.regular = false
            ORDER BY a.ivd_id ASC
        `;
        return await pool.query(query);
    }
    
    static async fetchAllIrregularesPorCarrera(carrera_id) {
      const query = `
          SELECT a.*, 
               u.*,
               p.carrera_id,
               c.nombre as carrera_nombre,
               (SELECT COUNT(alumno_id) > 0 AS result
                FROM resultado_inscripcion
                WHERE alumno_id = a.ivd_id) AS asignada
        FROM alumno a
        JOIN usuario u ON a.ivd_id = u.ivd_id
        JOIN plan_estudio p ON p.plan_estudio_id = a.plan_estudio_id
        JOIN carrera c ON c.carrera_id = p.carrera_id
        WHERE a.regular = false AND
              p.carrera_id = $1
        ORDER BY a.ivd_id ASC
      `;
      return await pool.query(query, [carrera_id]);
    }

    static async fetchNumeroIrregularesConMaterias(carrera_id) {
      const result = await pool.query(`
            SELECT COUNT(*)
            FROM (
              SELECT alumno_id
              FROM resultado_inscripcion
              GROUP BY alumno_id
            ) AS sub
            JOIN alumno a ON a.ivd_id = sub.alumno_id
            JOIN plan_estudio p ON p.plan_estudio_id = a.plan_estudio_id
            WHERE a.inscripcion_completada = false AND p.carrera_id = $1;
      `, [carrera_id]);
      return parseInt(result.rows[0].count);
    }
    static async fetchAllResultadoAlumnoIrregular2(id) {
      return pool.query(`
        SELECT 
          r.grupo_id AS grupo_id,
    
          ( -- JSONB agg de los bloques por día, ordenados internamente y luego por día
            SELECT jsonb_agg(sub.bloques ORDER BY sub.min_bt)
            FROM (
              SELECT
                jsonb_agg(gb.bloque_tiempo_id ORDER BY gb.bloque_tiempo_id) AS bloques,
                MIN(gb.bloque_tiempo_id)                          AS min_bt
              FROM grupo_bloque_tiempo gb
              JOIN bloque_tiempo b ON b.bloque_tiempo_id = gb.bloque_tiempo_id
              WHERE gb.grupo_id = r.grupo_id
              GROUP BY b.dia
            ) AS sub
          ) AS bloque_tiempo_id,
    
          m.nombre               AS materia_nombre,
          s.numero               AS salon_numero,
          p.nombre               AS profesor_nombre,
          p.primer_apellido      AS profesor_primer_apellido,
          p.segundo_apellido     AS profesor_segundo_apellido,
          r.obligatorio          AS obligatorio,
          r.seleccionado         AS seleccionado,
    
          ( -- JSONB agg de los días en el mismo orden que los bloques
            SELECT jsonb_agg(sub2.dia ORDER BY sub2.min_bt)
            FROM (
              SELECT
                b.dia,
                MIN(gb.bloque_tiempo_id) AS min_bt
              FROM grupo_bloque_tiempo gb
              JOIN bloque_tiempo b ON b.bloque_tiempo_id = gb.bloque_tiempo_id
              WHERE gb.grupo_id = r.grupo_id
              GROUP BY b.dia
            ) AS sub2
          ) AS dias
    
        FROM resultado_inscripcion r
        JOIN grupo             g ON r.grupo_id    = g.grupo_id
        JOIN materia           m ON g.materia_id  = m.materia_id
        JOIN profesor          p ON g.profesor_id = p.ivd_id
        JOIN salon             s ON g.salon_id    = s.salon_id
        JOIN grupo_bloque_tiempo gb ON gb.grupo_id = g.grupo_id
    
        WHERE r.alumno_id = $1
    
        GROUP BY
          r.grupo_id,
          m.nombre,
          s.numero,
          p.nombre,
          p.primer_apellido,
          p.segundo_apellido,
          r.obligatorio,
          r.seleccionado
    
        ORDER BY (
          SELECT MIN(gb2.bloque_tiempo_id)
          FROM grupo_bloque_tiempo gb2
          WHERE gb2.grupo_id = r.grupo_id
        ) ASC;
      `, [id]);
    }
    static async fetchAllResultadoAlumnoIrregular3(id) {
      return pool.query(`
        SELECT 
          r.grupo_id AS grupo_id,
    
          ( -- JSONB agg de los bloques por día, ordenados internamente y luego por día
            SELECT jsonb_agg(sub.bloques ORDER BY sub.min_bt)
            FROM (
              SELECT
                jsonb_agg(gb.bloque_tiempo_id ORDER BY gb.bloque_tiempo_id) AS bloques,
                MIN(gb.bloque_tiempo_id)                          AS min_bt
              FROM grupo_bloque_tiempo gb
              JOIN bloque_tiempo b ON b.bloque_tiempo_id = gb.bloque_tiempo_id
              WHERE gb.grupo_id = r.grupo_id
              GROUP BY b.dia
            ) AS sub
          ) AS bloque_tiempo_id,
    
          m.nombre               AS materia_nombre,
          s.numero               AS salon_numero,
          p.nombre               AS profesor_nombre,
          p.primer_apellido      AS profesor_primer_apellido,
          p.segundo_apellido     AS profesor_segundo_apellido,
          r.obligatorio          AS obligatorio,
          r.seleccionado         AS seleccionado,
    
          ( -- JSONB agg de los días en el mismo orden que los bloques
            SELECT jsonb_agg(sub2.dia ORDER BY sub2.min_bt)
            FROM (
              SELECT
                b.dia,
                MIN(gb.bloque_tiempo_id) AS min_bt
              FROM grupo_bloque_tiempo gb
              JOIN bloque_tiempo b ON b.bloque_tiempo_id = gb.bloque_tiempo_id
              WHERE gb.grupo_id = r.grupo_id
              GROUP BY b.dia
            ) AS sub2
          ) AS dias
    
        FROM resultado_inscripcion r
        JOIN grupo             g ON r.grupo_id    = g.grupo_id
        JOIN materia           m ON g.materia_id  = m.materia_id
        JOIN profesor          p ON g.profesor_id = p.ivd_id
        JOIN salon             s ON g.salon_id    = s.salon_id
        JOIN grupo_bloque_tiempo gb ON gb.grupo_id = g.grupo_id
    
        WHERE r.alumno_id = $1 AND r.seleccionado = true
    
        GROUP BY
          r.grupo_id,
          m.nombre,
          s.numero,
          p.nombre,
          p.primer_apellido,
          p.segundo_apellido,
          r.obligatorio,
          r.seleccionado
    
        ORDER BY (
          SELECT MIN(gb2.bloque_tiempo_id)
          FROM grupo_bloque_tiempo gb2
          WHERE gb2.grupo_id = r.grupo_id
        ) ASC;
      `, [id]);
    }
    static async fetchAllResultadoAlumnoIrregular(id) {
      return pool.query(`
        SELECT 
          r.grupo_id AS grupo_id,
    
          -- hora de inicio de cada día, como JSONB
          (
            SELECT jsonb_agg(sub.hora_inicio ORDER BY sub.min_bt)
            FROM (
              SELECT 
                b.hora_inicio,
                MIN(gb.bloque_tiempo_id) AS min_bt
              FROM grupo_bloque_tiempo gb
              JOIN bloque_tiempo b 
                ON b.bloque_tiempo_id = gb.bloque_tiempo_id
              WHERE gb.grupo_id = r.grupo_id
              GROUP BY b.dia, b.hora_inicio
            ) AS sub
          ) AS hora_inicio,
    
          -- hora de fin de cada día, como JSONB
          (
            SELECT jsonb_agg(sub.hora_fin ORDER BY sub.max_bt)
            FROM (
              SELECT 
                b.hora_fin,
                MAX(gb.bloque_tiempo_id) AS max_bt
              FROM grupo_bloque_tiempo gb
              JOIN bloque_tiempo b 
                ON b.bloque_tiempo_id = gb.bloque_tiempo_id
              WHERE gb.grupo_id = r.grupo_id
              GROUP BY b.dia, b.hora_fin
            ) AS sub
          ) AS hora_fin,
    
          m.nombre               AS materia_nombre,
          s.numero               AS salon_numero,
          p.nombre               AS profesor_nombre,
          p.primer_apellido      AS profesor_primer_apellido,
          p.segundo_apellido     AS profesor_segundo_apellido,
          r.obligatorio          AS obligatorio,
          r.seleccionado         AS seleccionado,
    
          -- días ordenados según su primer bloque
          (
            SELECT jsonb_agg(sub2.dia ORDER BY sub2.min_bt)
            FROM (
              SELECT 
                b.dia,
                MIN(gb.bloque_tiempo_id) AS min_bt
              FROM grupo_bloque_tiempo gb
              JOIN bloque_tiempo b 
                ON b.bloque_tiempo_id = gb.bloque_tiempo_id
              WHERE gb.grupo_id = r.grupo_id
              GROUP BY b.dia
            ) AS sub2
          ) AS dias
    
        FROM resultado_inscripcion r
        JOIN grupo             g ON r.grupo_id   = g.grupo_id
        JOIN materia           m ON g.materia_id = m.materia_id
        JOIN profesor          p ON g.profesor_id= p.ivd_id
        JOIN salon             s ON g.salon_id   = s.salon_id
        JOIN grupo_bloque_tiempo gb ON gb.grupo_id= r.grupo_id
    
        WHERE r.alumno_id = $1
          AND r.seleccionado = true
    
        GROUP BY 
          r.grupo_id,
          m.nombre,
          s.numero,
          p.nombre,
          p.primer_apellido,
          p.segundo_apellido,
          r.obligatorio,
          r.seleccionado
    
        ORDER BY (
          SELECT MIN(gb2.bloque_tiempo_id)
          FROM grupo_bloque_tiempo gb2
          WHERE gb2.grupo_id = r.grupo_id
        ) ASC;
      `, [id]);
    }
    static async fetchAllResultadoAlumno2(id) {
      return pool.query(`
        SELECT 
          r.grupo_id AS grupo_id,
    
          ( -- Agrupa por día y dentro de cada día ordena los bloques, luego ordena los días
            SELECT jsonb_agg(sub.bloques ORDER BY sub.min_bt)
            FROM (
              SELECT
                jsonb_agg(gb.bloque_tiempo_id ORDER BY gb.bloque_tiempo_id) AS bloques,
                MIN(gb.bloque_tiempo_id)                          AS min_bt
              FROM grupo_bloque_tiempo gb
              JOIN bloque_tiempo b ON b.bloque_tiempo_id = gb.bloque_tiempo_id
              WHERE gb.grupo_id = r.grupo_id
              GROUP BY b.dia
            ) AS sub
          ) AS bloque_tiempo_id,
    
          m.nombre               AS materia_nombre,
          s.numero               AS salon_numero,
          p.nombre               AS profesor_nombre,
          p.primer_apellido      AS profesor_primer_apellido,
          p.segundo_apellido     AS profesor_segundo_apellido,
          r.obligatorio          AS obligatorio,
    
          ( -- Lista de días en el mismo orden que los bloques
            SELECT jsonb_agg(sub2.dia ORDER BY sub2.min_bt)
            FROM (
              SELECT
                b.dia,
                MIN(gb.bloque_tiempo_id) AS min_bt
              FROM grupo_bloque_tiempo gb
              JOIN bloque_tiempo b ON b.bloque_tiempo_id = gb.bloque_tiempo_id
              WHERE gb.grupo_id = r.grupo_id
              GROUP BY b.dia
            ) AS sub2
          ) AS dias
    
        FROM resultado_inscripcion r
        JOIN grupo             g ON r.grupo_id    = g.grupo_id
        JOIN materia           m ON g.materia_id  = m.materia_id
        JOIN profesor          p ON g.profesor_id = p.ivd_id
        JOIN salon             s ON g.salon_id    = s.salon_id
        JOIN grupo_bloque_tiempo gb ON gb.grupo_id = g.grupo_id
    
        WHERE r.alumno_id = $1
    
        GROUP BY
          r.grupo_id,
          m.nombre,
          s.numero,
          p.nombre,
          p.primer_apellido,
          p.segundo_apellido,
          r.obligatorio
    
        ORDER BY (
          SELECT MIN(gb2.bloque_tiempo_id)
          FROM grupo_bloque_tiempo gb2
          WHERE gb2.grupo_id = r.grupo_id
        ) ASC;
      `, [id]);
    }    

    static async fetchAllResultadoAlumno(id) {
      return pool.query(`
        SELECT 
          r.grupo_id AS grupo_id,
    
          ( -- Agrupa por día y dentro de cada día ordena los bloques, luego ordena los días
            SELECT jsonb_agg(sub.bloques ORDER BY sub.min_bt)
            FROM (
              SELECT
                jsonb_agg(gb.bloque_tiempo_id ORDER BY gb.bloque_tiempo_id) AS bloques,
                MIN(gb.bloque_tiempo_id)                          AS min_bt
              FROM grupo_bloque_tiempo gb
              JOIN bloque_tiempo b ON b.bloque_tiempo_id = gb.bloque_tiempo_id
              WHERE gb.grupo_id = r.grupo_id
              GROUP BY b.dia
            ) AS sub
          ) AS bloque_tiempo_id,
    
          m.nombre               AS materia_nombre,
          s.numero               AS salon_numero,
          p.nombre               AS profesor_nombre,
          p.primer_apellido      AS profesor_primer_apellido,
          p.segundo_apellido     AS profesor_segundo_apellido,
          r.obligatorio          AS obligatorio,
    
          ( -- Lista de días en el mismo orden que los bloques
            SELECT jsonb_agg(sub2.dia ORDER BY sub2.min_bt)
            FROM (
              SELECT
                b.dia,
                MIN(gb.bloque_tiempo_id) AS min_bt
              FROM grupo_bloque_tiempo gb
              JOIN bloque_tiempo b ON b.bloque_tiempo_id = gb.bloque_tiempo_id
              WHERE gb.grupo_id = r.grupo_id
              GROUP BY b.dia
            ) AS sub2
          ) AS dias
    
        FROM resultado_inscripcion r
        JOIN grupo             g ON r.grupo_id    = g.grupo_id
        JOIN materia           m ON g.materia_id  = m.materia_id
        JOIN profesor          p ON g.profesor_id = p.ivd_id
        JOIN salon             s ON g.salon_id    = s.salon_id
        JOIN grupo_bloque_tiempo gb ON gb.grupo_id = g.grupo_id
    
        WHERE r.alumno_id = $1 AND r.seleccionado = true
              
    
        GROUP BY
          r.grupo_id,
          m.nombre,
          s.numero,
          p.nombre,
          p.primer_apellido,
          p.segundo_apellido,
          r.obligatorio
    
        ORDER BY (
          SELECT MIN(gb2.bloque_tiempo_id)
          FROM grupo_bloque_tiempo gb2
          WHERE gb2.grupo_id = r.grupo_id
        ) ASC;
      `, [id]);
    }
    
    static esRegular(alumno_id) {
      return pool.query(`
        SELECT regular
        FROM alumno
        WHERE ivd_id = $1`
        , [alumno_id]
      );
    }

    // Método para obtener número total de alumnos no inscritos
    static async totalNoInscritos(carrera_id) {
        const result = await pool.query(`
          SELECT count(*) 
          FROM alumno a
          JOIN plan_estudio p ON p.plan_estudio_id = a.plan_estudio_id
          WHERE a.inscripcion_completada = false AND p.carrera_id = $1`
        , [carrera_id]);
        return parseInt(result.rows[0].count);
    };

    // Método para obtener número total de alumnos no inscritos
    static async numero_TotalAlumnoInscritos(carrera_id) {
        const result = await pool.query(`
          SELECT count(*) 
          FROM alumno a
          JOIN plan_estudio p ON p.plan_estudio_id = a.plan_estudio_id
          WHERE a.inscripcion_completada = true AND p.carrera_id = $1`
        , [carrera_id]);
        return parseInt(result.rows[0].count);
    };

    //metodo para obtener el numero de alumnos no inscritos e inscritos, agrupado por semestres
    static async alumnosComparacion(carrera_id){
        const result = await pool.query (`
            SELECT 
            a.semestre, count(CASE WHEN a.inscripcion_completada = TRUE THEN 1 END) AS inscritos, 
            COUNT(CASE WHEN a.inscripcion_completada = FALSE THEN 1 END) AS no_inscritos 
            FROM public.alumno a
            JOIN plan_estudio p ON p.plan_estudio_id = a.plan_estudio_id
            WHERE p.carrera_id = $1
            group by semestre
            order by semestre ASC;`
            , [carrera_id]
          );
        return result.rows;
    }

    static async fetchAllMateriasDisponiblesDelAlumno(id) {
      return pool.query(`
        SELECT 
          r.grupo_id AS grupo_id,
    
          -- hora_inicio como JSONB, ordenado por el primer bloque de cada día
          (
            SELECT jsonb_agg(sub.hora_inicio ORDER BY sub.min_bt)
            FROM (
              SELECT
                b.hora_inicio,
                MIN(gb.bloque_tiempo_id) AS min_bt
              FROM grupo_bloque_tiempo gb
              JOIN bloque_tiempo b ON b.bloque_tiempo_id = gb.bloque_tiempo_id
              WHERE gb.grupo_id = r.grupo_id
              GROUP BY b.dia, b.hora_inicio
            ) AS sub
          ) AS hora_inicio,
    
          -- hora_fin como JSONB, ordenado por el último bloque de cada día
          (
            SELECT jsonb_agg(sub.hora_fin ORDER BY sub.max_bt)
            FROM (
              SELECT
                b.hora_fin,
                MAX(gb.bloque_tiempo_id) AS max_bt
              FROM grupo_bloque_tiempo gb
              JOIN bloque_tiempo b ON b.bloque_tiempo_id = gb.bloque_tiempo_id
              WHERE gb.grupo_id = r.grupo_id
              GROUP BY b.dia, b.hora_fin
            ) AS sub
          ) AS hora_fin,
    
          -- bloques por día como JSONB matrices, con bloques internos ordenados y días ordenados
          (
            SELECT jsonb_agg(sub.bloques ORDER BY sub.min_bt)
            FROM (
              SELECT
                jsonb_agg(gb.bloque_tiempo_id ORDER BY gb.bloque_tiempo_id) AS bloques,
                MIN(gb.bloque_tiempo_id)                              AS min_bt
              FROM grupo_bloque_tiempo gb
              JOIN bloque_tiempo b ON b.bloque_tiempo_id = gb.bloque_tiempo_id
              WHERE gb.grupo_id = r.grupo_id
              GROUP BY b.dia
            ) AS sub
          ) AS bloque_tiempo_id,
    
          m.nombre               AS materia_nombre,
          s.numero               AS salon_numero,
          p.nombre               AS profesor_nombre,
          p.primer_apellido      AS profesor_primer_apellido,
          p.segundo_apellido     AS profesor_segundo_apellido,
          r.obligatorio          AS obligatorio,
    
          -- días como JSONB, ordenados según el primer bloque de cada día
          (
            SELECT jsonb_agg(sub2.dia ORDER BY sub2.min_bt)
            FROM (
              SELECT
                b.dia,
                MIN(gb.bloque_tiempo_id) AS min_bt
              FROM grupo_bloque_tiempo gb
              JOIN bloque_tiempo b ON b.bloque_tiempo_id = gb.bloque_tiempo_id
              WHERE gb.grupo_id = r.grupo_id
              GROUP BY b.dia
            ) AS sub2
          ) AS dias
    
        FROM resultado_inscripcion r
        JOIN grupo             g ON r.grupo_id    = g.grupo_id
        JOIN materia           m ON g.materia_id  = m.materia_id
        JOIN profesor          p ON g.profesor_id = p.ivd_id
        JOIN salon             s ON g.salon_id    = s.salon_id
        JOIN grupo_bloque_tiempo gb ON gb.grupo_id = g.grupo_id
    
        WHERE r.alumno_id = $1
          AND r.seleccionado = false
    
        GROUP BY
          r.grupo_id,
          m.nombre,
          s.numero,
          p.nombre,
          p.primer_apellido,
          p.segundo_apellido,
          r.obligatorio
    
        ORDER BY (
          SELECT MIN(gb2.bloque_tiempo_id)
          FROM grupo_bloque_tiempo gb2
          WHERE gb2.grupo_id = r.grupo_id
        ) ASC;
      `, [id]);
    }
    
    static async fetchAllMateriasDisponiblesDelAlumno2(id) {
      return pool.query(`
        SELECT 
          r.grupo_id AS grupo_id,
    
          -- bloques por día como JSONB
          (
            SELECT jsonb_agg(sub.bloques ORDER BY sub.min_bt)
            FROM (
              SELECT
                jsonb_agg(gb.bloque_tiempo_id ORDER BY gb.bloque_tiempo_id) AS bloques,
                MIN(gb.bloque_tiempo_id)                              AS min_bt
              FROM grupo_bloque_tiempo gb
              JOIN bloque_tiempo b ON b.bloque_tiempo_id = gb.bloque_tiempo_id
              WHERE gb.grupo_id = r.grupo_id
              GROUP BY b.dia
            ) AS sub
          ) AS bloque_tiempo_id,
    
          m.nombre               AS materia_nombre,
          s.numero               AS salon_numero,
          p.nombre               AS profesor_nombre,
          p.primer_apellido      AS profesor_primer_apellido,
          p.segundo_apellido     AS profesor_segundo_apellido,
          r.obligatorio          AS obligatorio,
    
          -- días como JSONB
          (
            SELECT jsonb_agg(sub2.dia ORDER BY sub2.min_bt)
            FROM (
              SELECT
                b.dia,
                MIN(gb.bloque_tiempo_id) AS min_bt
              FROM grupo_bloque_tiempo gb
              JOIN bloque_tiempo b ON b.bloque_tiempo_id = gb.bloque_tiempo_id
              WHERE gb.grupo_id = r.grupo_id
              GROUP BY b.dia
            ) AS sub2
          ) AS dias
    
        FROM resultado_inscripcion r
        JOIN grupo             g ON r.grupo_id    = g.grupo_id
        JOIN materia           m ON g.materia_id  = m.materia_id
        JOIN profesor          p ON g.profesor_id = p.ivd_id
        JOIN salon             s ON g.salon_id    = s.salon_id
        JOIN grupo_bloque_tiempo gb ON gb.grupo_id = g.grupo_id
    
        WHERE r.alumno_id = $1
          AND r.seleccionado = false
    
        GROUP BY
          r.grupo_id,
          m.nombre,
          s.numero,
          p.nombre,
          p.primer_apellido,
          p.segundo_apellido,
          r.obligatorio
    
        ORDER BY (
          SELECT MIN(gb2.bloque_tiempo_id)
          FROM grupo_bloque_tiempo gb2
          WHERE gb2.grupo_id = r.grupo_id
        ) ASC;
      `, [id]);
    }
    
    static async fetchAllMateriasDisponiblesCoordinador(id) {
      return pool.query(`
        SELECT 
          g.grupo_id AS grupo_id,
    
          -- bloques por día como JSONB
          (
            SELECT jsonb_agg(sub.bloques ORDER BY sub.min_bt)
            FROM (
              SELECT
                jsonb_agg(gb.bloque_tiempo_id ORDER BY gb.bloque_tiempo_id) AS bloques,
                MIN(gb.bloque_tiempo_id)                              AS min_bt
              FROM grupo_bloque_tiempo gb
              JOIN bloque_tiempo b ON b.bloque_tiempo_id = gb.bloque_tiempo_id
              WHERE gb.grupo_id = g.grupo_id
              GROUP BY b.dia
            ) AS sub
          ) AS bloque_tiempo_id,
    
          m.nombre               AS materia_nombre,
          s.numero               AS salon_numero,
          p.nombre               AS profesor_nombre,
          p.primer_apellido      AS profesor_primer_apellido,
          p.segundo_apellido     AS profesor_segundo_apellido,
    
          -- días como JSONB
          (
            SELECT jsonb_agg(sub2.dia ORDER BY sub2.min_bt)
            FROM (
              SELECT
                b.dia,
                MIN(gb.bloque_tiempo_id) AS min_bt
              FROM grupo_bloque_tiempo gb
              JOIN bloque_tiempo b ON b.bloque_tiempo_id = gb.bloque_tiempo_id
              WHERE gb.grupo_id = g.grupo_id
              GROUP BY b.dia
            ) AS sub2
          ) AS dias
    
        FROM grupo g
        JOIN materia_semestre ms ON ms.materia_id = g.materia_id
        JOIN materia           m  ON ms.materia_id = m.materia_id
        JOIN profesor          p  ON g.profesor_id = p.ivd_id
        JOIN salon             s  ON g.salon_id = s.salon_id
        JOIN grupo_bloque_tiempo gb ON gb.grupo_id = g.grupo_id
    
        WHERE 
          g.grupo_id NOT IN (
            SELECT r.grupo_id
            FROM resultado_inscripcion r
            WHERE r.alumno_id = $1
          )
          AND ms.materia_id IN (
            SELECT ha.materia_id
            FROM historial_academico ha
            WHERE ha.ivd_id = $1
              AND ha.aprobado = false
          )
    
        GROUP BY
          g.grupo_id,
          m.nombre,
          s.numero,
          p.nombre,
          p.primer_apellido,
          p.segundo_apellido
    
        ORDER BY (
          SELECT MIN(gb2.bloque_tiempo_id)
          FROM grupo_bloque_tiempo gb2
          WHERE gb2.grupo_id = g.grupo_id
        ) ASC;
      `, [id]);
    }
    
    static async fetchAllMateriasDisponiblesDelAlumnoPorSemestre(semestre, id) {
      return pool.query(`
        SELECT 
          g.grupo_id AS grupo_id,
    
          -- bloques por día como JSONB
          (
            SELECT jsonb_agg(sub.bloques ORDER BY sub.min_bt)
            FROM (
              SELECT
                jsonb_agg(gb.bloque_tiempo_id ORDER BY gb.bloque_tiempo_id) AS bloques,
                MIN(gb.bloque_tiempo_id)                              AS min_bt
              FROM grupo_bloque_tiempo gb
              JOIN bloque_tiempo b ON b.bloque_tiempo_id = gb.bloque_tiempo_id
              WHERE gb.grupo_id = g.grupo_id
              GROUP BY b.dia
            ) AS sub
          ) AS bloque_tiempo_id,
    
          m.nombre               AS materia_nombre,
          s.numero               AS salon_numero,
          p.nombre               AS profesor_nombre,
          p.primer_apellido      AS profesor_primer_apellido,
          p.segundo_apellido     AS profesor_segundo_apellido,
    
          -- días como JSONB
          (
            SELECT jsonb_agg(sub2.dia ORDER BY sub2.min_bt)
            FROM (
              SELECT
                b.dia,
                MIN(gb.bloque_tiempo_id) AS min_bt
              FROM grupo_bloque_tiempo gb
              JOIN bloque_tiempo b ON b.bloque_tiempo_id = gb.bloque_tiempo_id
              WHERE gb.grupo_id = g.grupo_id
              GROUP BY b.dia
            ) AS sub2
          ) AS dias
    
        FROM grupo g
        JOIN materia_semestre ms ON ms.materia_id = g.materia_id
        JOIN materia           m  ON ms.materia_id = m.materia_id
        JOIN profesor          p  ON g.profesor_id = p.ivd_id
        JOIN salon             s  ON g.salon_id = s.salon_id
        JOIN grupo_bloque_tiempo gb ON gb.grupo_id = g.grupo_id
    
        WHERE 
          ms.semestre_id = $1
          AND g.grupo_id NOT IN (
            SELECT r.grupo_id
            FROM resultado_inscripcion r
            WHERE r.alumno_id = $2
          )
          AND ms.materia_id IN (
            SELECT ha.materia_id
            FROM historial_academico ha
            WHERE ha.ivd_id = $2
              AND ha.aprobado = false
          )
    
        GROUP BY
          g.grupo_id,
          m.nombre,
          s.numero,
          p.nombre,
          p.primer_apellido,
          p.segundo_apellido
    
        ORDER BY (
          SELECT MIN(gb2.bloque_tiempo_id)
          FROM grupo_bloque_tiempo gb2
          WHERE gb2.grupo_id = g.grupo_id
        ) ASC;
      `, [semestre, id]);
    }
    static confirmar(id) {
        return pool.query('UPDATE alumno SET inscripcion_completada = true WHERE ivd_id = $1', [id]);
    }

    static rechazar(id) {
        return pool.query('UPDATE usuario SET inscripcion_completada = true WHERE ivd_id = $1', [id]);
    }
    
    static solicitudCambio(ivd_id, descripcion) {
        return pool.query('SELECT MAX(solicitud_cambio_id) as max_id FROM solicitud_cambio')
            .then(maxIdResult => {
                const nextId = (maxIdResult.rows[0].max_id || 0) + 1;             
                return pool.query(
                    `INSERT INTO solicitud_cambio 
                    (solicitud_cambio_id, ivd_id, descripcion, aprobada, created_at) 
                    VALUES ($1, $2, $3, $4, $5)`,
                    [nextId, ivd_id, descripcion, false, new Date()]
                );
            });
    }

    static async verificarInscripcionCompletada(matricula) {
        try {
          const resultado = await pool.query(
            'SELECT inscripcion_completada FROM alumno WHERE ivd_id = $1', 
            [matricula]
          );
          return resultado.rows[0]?.inscripcion_completada || false;
        } catch (error) {
          console.error("Error al verificar inscripción:", error);
          return false;
        }
      }

    static async findAlumnoById(alumnoId) {
        const client = await pool.connect();
        try {
            const result = await client.query('SELECT * FROM alumno WHERE ivd_id = $1', [alumnoId]);
            return result.rows[0];
        } catch (error) {
            console.error('Error al buscar alumno por usuario_id:', error);
            throw error;
        } finally {
            client.release();
        }
      }
}