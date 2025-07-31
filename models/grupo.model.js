const pool = require('../util/database');


module.exports = class Grupo {
    constructor(mi_materia_id, mi_profesor_id, mi_salon_id) {
        this.materia_id = mi_materia_id;
        this.profesor_id = mi_profesor_id;
        this.salon_id = mi_salon_id;
    }

    async save() {     
    // 1. Obtener nuevo ID de grupo
    const resultMax = await pool.query(`SELECT COALESCE(MAX(grupo_id), 0) AS max_id FROM grupo`);
    const newId = resultMax.rows[0].max_id + 1;

    // 2. Obtener ciclo escolar actual (más reciente)
    const cicloMax = await pool.query(`SELECT ciclo_escolar_id FROM ciclo_escolar ORDER BY fecha_fin DESC LIMIT 1`);
    const ciclo = cicloMax.rows[0].ciclo_escolar_id;

    // 3. Insertar nuevo grupo
    const grupo_id = await pool.query(
        `INSERT INTO grupo(grupo_id, materia_id, profesor_id, salon_id, ciclo_escolar_id)
         VALUES ($1, $2, $3, $4, $5) RETURNING grupo_id`,
        [newId, this.materia_id, this.profesor_id, this.salon_id, ciclo]
    );

    // 4. Obtener los semestres en los que se imparte esta materia
    const semestres = await pool.query(
        `SELECT semestre_id FROM materia_semestre WHERE materia_id = $1`,
        [this.materia_id]
    );

    // 5. Obtener la carrera de la materia
    const carreraRes = await pool.query(`
        SELECT pe.carrera_id
        FROM plan_materia pm
        JOIN plan_estudio pe
            ON pm.plan_estudio_id = pe.plan_estudio_id
        AND pm.plan_estudio_version = pe.version
        WHERE pm.materia_id = $1
        LIMIT 1
        `, [this.materia_id]);
    const carreraId = carreraRes.rows[0].carrera_id;

    // 6. Asignar alumnos al grupo recién creado
    for (const row of semestres.rows) {
        const semestreId = row.semestre_id;

        await pool.query(
            `INSERT INTO resultado_inscripcion (alumno_id, grupo_id, obligatorio, seleccionado)
            SELECT al.ivd_id, $1, true, true
            FROM alumno al
            JOIN semestre s
            ON al.semestre = s.numero
            JOIN plan_estudio pe
            ON al.plan_estudio_id = pe.plan_estudio_id
            LEFT JOIN historial_academico h 
            ON h.ivd_id = al.ivd_id 
            AND h.materia_id = $2 
            AND h.aprobado = true
            WHERE s.semestre_id = $3
            AND pe.carrera_id = $4 
            AND h.ivd_id IS NULL`,
            [ newId, this.materia_id, semestreId, carreraId ]
        );
    }

    return grupo_id;
    }

    static fetchAll() {
        return pool.query(`
            SELECT g.grupo_id, m.nombre AS materia, g.materia_id, g.profesor_id, p.nombre, p.primer_apellido, 
            p.segundo_apellido, s.numero, c.ciclo_escolar_id, c.code, ms.semestre_id, ca.carrera_id, ca.nombre AS carrera_nombre 
            FROM grupo g
            JOIN materia m ON g.materia_id = m.materia_id
            JOIN profesor p ON g.profesor_id = p.ivd_id
            LEFT JOIN salon s ON g.salon_id = s.salon_id
            JOIN ciclo_escolar c ON g.ciclo_escolar_id = c.ciclo_escolar_id
            LEFT JOIN materia_semestre ms ON m.materia_id = ms.materia_id
            JOIN plan_materia pm ON m.materia_id = pm.materia_id
            JOIN plan_estudio pe ON pm.plan_estudio_id = pe.plan_estudio_id
            JOIN  carrera ca ON pe.carrera_id = ca.carrera_id
            ORDER BY ms.semestre_id, g.grupo_id
        `);
    }
    static fetchAllPorId(carrera_id) {
        return pool.query(`
            SELECT g.grupo_id,m.nombre AS materia, p.nombre, p.primer_apellido, 
            p.segundo_apellido, s.numero, c.code, ms.semestre_id, ca.nombre AS carrera_nombre
            FROM grupo g
            JOIN materia m ON g.materia_id = m.materia_id
            JOIN profesor p ON g.profesor_id = p.ivd_id
            LEFT JOIN salon s ON g.salon_id = s.salon_id
            JOIN ciclo_escolar c ON g.ciclo_escolar_id = c.ciclo_escolar_id
            LEFT JOIN materia_semestre ms ON m.materia_id = ms.materia_id
            JOIN plan_materia pm ON m.materia_id = pm.materia_id
            JOIN plan_estudio pe ON pm.plan_estudio_id = pe.plan_estudio_id
            JOIN  carrera ca ON pe.carrera_id = ca.carrera_id
            WHERE pe.carrera_id = $1
            ORDER BY ms.semestre_id, g.grupo_id
        `, [carrera_id]);
    }
    static fetchOne(id) {
        return pool.query(`SELECT g.grupo_id, m.materia_id, m.nombre materia, p.nombre, p.primer_apellido, p.segundo_apellido, 
                           p.ivd_id, s.numero, s.salon_id, c.code
                           FROM grupo g, materia m, profesor p, salon s, ciclo_escolar c
                           WHERE g.materia_id = m.materia_id
                           AND g.profesor_id = p.ivd_id
                           AND g.salon_id = s.salon_id
                           AND g.ciclo_escolar_id = c.ciclo_escolar_id
                           AND grupo_id = $1`, [id]); 
    }

    static fetch(id) {
        return id ? this.fetchOne(id) : this.fetchAll();
    }

    static delete(grupo_id) {
        return pool.query(
            'DELETE FROM grupo WHERE grupo_id = $1',
            [grupo_id]
        );
    }

    static deleteInscripcion(grupo_id) {
        return pool.query(`DELETE FROM resultado_inscripcion WHERE grupo_id = $1`, [grupo_id]);
    }

    static deleteHorario(grupo_id) {
        return pool.query(
            'DELETE FROM grupo_bloque_tiempo WHERE grupo_id = $1',
            [grupo_id]
        );
    }

    static updateHorario(id, bloque) {
        return pool.query('INSERT INTO grupo_bloque_tiempo VALUES ($1, $2)', [id, bloque]);
    }

    static getHorario(id) {
        return pool.query(
            'SELECT bloque_tiempo_id FROM grupo_bloque_tiempo WHERE grupo_id = $1',
            [id]
        )
        .then(result => {
            // Convertir explícitamente a array de strings
            return result.rows.map(row => row.bloque_tiempo_id.toString());
        })
        .catch(error => {
            console.error("Error en getBloquesByGrupoId:", error);
            return []; // Retornar array vacío si hay error
        });
    }

    static updateGrupo(id, materia, profesor, salon) {
        return pool.query(`UPDATE grupo SET materia_id = $1, profesor_id = $2, salon_id = $3
                           WHERE grupo_id = $4`, [materia, profesor, salon, id]);
    }
     // Método para obtener número total de grupos abiertos
     static async numeroTotalGrupos(carreras_id) {
        const result = await pool.query(
            `SELECT count(*) FROM grupo g
            JOIN materia m ON g.materia_id = m.materia_id
            JOIN plan_materia pm ON m.materia_id = pm.materia_id
            JOIN plan_estudio pe ON pm.plan_estudio_id = pe.plan_estudio_id
                AND pm.plan_estudio_version = pe.version
            JOIN carrera c ON pe.carrera_id = c.carrera_id  
            WHERE c.carrera_id = ANY($1)
            `, [carreras_id]);
        return parseInt(result.rows[0].count);
    };

    //Metodo para obtener los grupos con las relaciones entre otras tablas
    static async grupoDashboard(carreras_id) {
        const result = await pool.query(
            ` SELECT 
                g.grupo_id,
                bt.dia,
                MIN(bt.hora_inicio) AS hora_inicio,
                MAX(bt.hora_fin) AS hora_fin,
                MIN(m.nombre) AS materia_nombre,
                MIN(p.nombre || ' ' || p.primer_apellido) AS profesor_nombre
            FROM 
                grupo_bloque_tiempo gbt
                JOIN bloque_tiempo bt ON gbt.bloque_tiempo_id = bt.bloque_tiempo_id
                JOIN grupo g ON gbt.grupo_id = g.grupo_id
                JOIN materia m ON g.materia_id = m.materia_id
                JOIN plan_materia pm ON m.materia_id = pm.materia_id
                JOIN plan_estudio pe ON pm.plan_estudio_id = pe.plan_estudio_id
                    AND pm.plan_estudio_version = pe.version
                JOIN carrera c ON pe.carrera_id = c.carrera_id 
                JOIN profesor p ON g.profesor_id = p.ivd_id
            WHERE
                c.carrera_id = ANY($1)
            GROUP BY 
                g.grupo_id, bt.dia
            ORDER BY 
                g.grupo_id, bt.dia;`
            , [carreras_id]) ;
        return result.rows;
    };


    static async resetDatosGrupos() {
        try {
            // Transicion
            await pool.query('BEGIN');
    
            // Se ejecutan las consultas
            await pool.query('DELETE FROM resultado_inscripcion');
            await pool.query('DELETE FROM grupo_bloque_tiempo');
            await pool.query('DELETE FROM grupo');
            await pool.query('UPDATE alumno SET inscripcion_completada = false')
    
            // Se hace commit de lo hecho
            await pool.query('COMMIT');
            
            return { success: true, message: 'Los datos del registro de la inscripción anterior han sido eliminados' };
        } catch (error) {
            // Rollback por si hay algun error
            await pool.query('ROLLBACK');
            console.error('Error al reset de los datos:', error);
            return { success: false, message: 'La eliminación de los datos del registro de la inscripción anterior ha fallado' };
        }
    }
    
    static async guardarIdExternoGrupoPorId(grupo_api_id, grupo_id) {
        return pool.query(
          `UPDATE grupo SET grupo_api_id = $1 WHERE grupo_id = $2`,
          [grupo_api_id, grupo_id]
        );
    }
      
  
    // Obtener inscripciones que ya tienen grupo_api_id asignado
    static async getInscripcionesConApiId() {
      return pool.query(`
        SELECT ri.alumno_id, g.grupo_api_id
        FROM resultado_inscripcion ri
        JOIN grupo g ON ri.grupo_id = g.grupo_id
        WHERE g.grupo_api_id IS NOT NULL
      `);
    }
  
    // Obtener bloques de horario por grupo con grupo_api_id
    static async getHorariosConApiId() {
      return pool.query(`
        SELECT 
          gbt.grupo_id, 
          g.grupo_api_id,
          bt.dia,
          bt.hora_inicio,
          bt.hora_fin
        FROM grupo_bloque_tiempo gbt
        JOIN grupo g ON gbt.grupo_id = g.grupo_id
        JOIN bloque_tiempo bt ON gbt.bloque_tiempo_id = bt.bloque_tiempo_id
        WHERE g.grupo_api_id IS NOT NULL
        ORDER BY g.grupo_id, bt.dia, bt.bloque_tiempo_id
      `);
    }
};