const pool = require('../util/database');

module.exports = class Profesor {
    constructor(mi_id, mi_nombre, mi_primer_apellido, mi_segundo_apellido) {
        this.id = mi_id;
        this.nombre = mi_nombre;
        this.primer_apellido = mi_primer_apellido;
        this.segundo_apellido = mi_segundo_apellido;
    }

    // Para sincronizar profesores
    static async sincronizarProfesores(profesoresApi) {
        const client = await pool.connect();
        try {
            const profesoresDB_data = await client.query("SELECT * FROM profesor");
            const profesoresDB = profesoresDB_data.rows;

            // Mapa para acceder rápidamente a los profesores por su id
            const profesoresMap = new Map(profesoresDB.map(profesor => [profesor.ivd_id, profesor]));

            let inserted = 0, updated = 0, deleted = 0;

            for (const pA of profesoresApi) {
                const profesorDB = profesoresMap.get(pA.ivd_id);

                if (!profesorDB) {
                    // Inserta los nuevos registros
                    await client.query(
                        `INSERT INTO profesor (ivd_id, nombre, primer_apellido, segundo_apellido, activo) 
                        VALUES ($1, $2, $3, $4, $5)`,
                        [
                            pA.ivd_id,
                            pA.name,
                            pA.first_surname,
                            pA.second_surname,
                            pA.status ? 1 : 0,
                        ]
                    );
                    inserted++;
                } else {
                    // Verifica si hay cambios en los atributos
                    if (
                        (profesorDB.nombre || '').trim() !== (pA.name || '').trim() ||
                        (profesorDB.primer_apellido || '').trim() !== (pA.first_surname || '').trim() ||
                        (profesorDB.segundo_apellido || '').trim() !== (pA.second_surname || '').trim() ||
                        Number(profesorDB.activo) !== (pA.status ? 1 : 0)
                    ) {
                        // Actualiza el registro si hay cambios
                        await client.query(
                            `UPDATE profesor SET nombre = $1, primer_apellido = $2, segundo_apellido = $3, activo = $4 
                            WHERE ivd_id = $5`,
                            [
                                pA.name,
                                pA.first_surname,
                                pA.second_surname,
                                pA.status ? 1 : 0,
                                pA.ivd_id,
                            ]
                        );
                        updated++;
                    }
                }

                // Elimina del mapa para no repetir la revisión
                profesoresMap.delete(pA.ivd_id);
            }

            // Elimina los profesores que ya no están en la API
            for (const [id] of profesoresMap) {
                await client.query("DELETE FROM profesor WHERE ivd_id = $1", [id]);
                deleted++;
            }

            return { inserted, updated, deleted };
        } catch (error) {
            console.error("Error durante la sincronización de profesores:", error);
            throw error;
        } finally {
            client.release();
        }
    }
    // Guarda un nuevo profesor en el almacenamiento persistente
    save() {
        return pool.query(
            'INSERT INTO profesor (ivd_id, nombre, primer_apellido, segundo_apellido) VALUES ($1, $2, $3, $4)',
            [this.id, this.nombre, this.primer_apellido, this.segundo_apellido]
        );
    }

    // Método para devolver los objetos del almacenamiento persistente
    static fetchAll() {
        return pool.query('SELECT ivd_id, nombre, primer_apellido, segundo_apellido, activo FROM profesor ORDER BY ivd_id');
    }
    // Método para devolver los objetos que estan activos
    static async fetchActivos() {
        return pool.query('SELECT ivd_id, nombre, primer_apellido, segundo_apellido FROM profesor WHERE activo = true ORDER BY ivd_id');
    }


    static getSchedule(id) {
        return pool.query(
            'SELECT bloque_tiempo_id FROM profesor_bloque_tiempo WHERE profesor_id = $1',
            [id]
        )
        .then(result => {
            // Convertir explícitamente a array de strings
            return result.rows.map(row => row.bloque_tiempo_id.toString());
        })
        .catch(error => {
            console.error("Error en getBloquesByProfesorId:", error);
            return []; // Retornar array vacío si hay error
        });
    }

    static deleteSchedule(id) {
        return pool.query('DELETE FROM profesor_bloque_tiempo WHERE profesor_id = $1', [id]);
    }

    static updateSchedule(id, bloque) {
        return pool.query('INSERT INTO profesor_bloque_tiempo VALUES ($1, $2)', [id, bloque]);
    }

    static getCourses(id) {
        return pool.query(
            'SELECT materia_id FROM profesor_materia WHERE profesor_id = $1',
            [id]
        )
        .then(result => result.rows.map(row => row.materia_id.toString()));
    }

    static getCoursesInfo(id) {
        return pool.query(`SELECT m.materia_id, sep_id, m.nombre, creditos, horas_profesor, tipo_salon, semestre_plan, c.nombre AS carrera
                           FROM materia m, profesor_materia pm, plan_materia plm, plan_estudio pe, carrera c
                           WHERE m.materia_id = pm.materia_id
                           AND m.materia_id = plm.materia_id
                           AND plm.plan_estudio_id = pe.plan_estudio_id
                           AND plm.plan_estudio_version = pe.version
                           AND pe.carrera_id = c.carrera_id
                           AND profesor_id = $1
                           ORDER BY semestre_plan`, [id]);
    }

    static asignCourses(id, materia) {
        return pool.query('INSERT INTO profesor_materia VALUES($1, $2)', [id, materia]);
    }

    static unassignCourses(id) {
        return pool.query('DELETE FROM profesor_materia WHERE profesor_id = $1', [id]);
    }
    
    // Método para cambiar el atributo activo a true 
    static async activar(id) {
        return pool.query('UPDATE profesor SET activo = true WHERE ivd_id = $1 RETURNING *', [id]);
    }

    // Método para obtener número total de profesores activos
    static async numeroProfesores() {
        const result = await pool.query('SELECT count(*) FROM public.profesor WHERE activo = true');
        return parseInt(result.rows[0].count);
    };


}
