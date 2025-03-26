const pool = require('../util/database');

module.exports = class Profesor {
     // Constructor de la clase
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
                    if (pA.status) {
                        await client.query(
                            `INSERT INTO profesor (ivd_id, nombre, primer_apellido, segundo_apellido, activo) 
                            VALUES ($1, $2, $3, $4, $5)`,
                            [
                                pA.ivd_id,
                                pA.name,
                                pA.first_surname,
                                pA.second_surname,
                                false,
                            ]
                        );
                        inserted++;
                    }
                } else {
                    // Verifica si hay cambios en los atributos
                    if (
                        (profesorDB.nombre || '').trim() !== (pA.name || '').trim() ||
                        (profesorDB.primer_apellido || '').trim() !== (pA.first_surname || '').trim() ||
                        (profesorDB.segundo_apellido || '').trim() !== (pA.second_surname || '').trim() ||
                        (profesorDB.activo) == true
                    ) {
                        // Actualiza el registro si hay cambios
                        await client.query(
                            `UPDATE profesor SET nombre = $1, primer_apellido = $2, segundo_apellido = $3, activo = $4 
                            WHERE ivd_id = $5`,
                            [
                                pA.name,
                                pA.first_surname,
                                pA.second_surname,
                                false,
                                pA.ivd_id,
                            ]
                        );
                        updated++;
                    }
                    if (pA.status == false & profesorDB.activo == true) {
                        await client.query("DELETE FROM profesor WHERE ivd_id = $1", pA.ivd_id);
                        deleted++;
                    }
                }

                // Elimina del mapa para no repetir la revisión
                profesoresMap.delete(pA.ivd_id);
            }

            // Elimina los profesores que ya no están en la API
            for (const [id] of profesoresMap) {
                if (id != 1) {
                    await client.query("DELETE FROM profesor WHERE ivd_id = $1", [id]);
                    deleted++;
                }
            }

            return { inserted, updated, deleted };
        } catch (error) {
            console.error("Error durante la sincronización de profesores:", error);
            throw error;
        } finally {
            client.release();
        }
    }

    // No se si aun se necesita
    save() {
        return pool.query(
            'INSERT INTO profesor (ivd_id, nombre, primer_apellido, segundo_apellido) VALUES ($1, $2, $3, $4)',
            [this.id, this.nombre, this.primer_apellido, this.segundo_apellido]
        );
    }

    // Método para devolver los objetos del almacenamiento persistente
    static fetchAll() {
        return pool.query('SELECT ivd_id, nombre, primer_apellido, segundo_apellido, activo FROM profesor ORDER BY activo DESC');
    }
    // Método para devolver los objetos que estan activos
    static async fetchActivos() {
        return pool.query('SELECT ivd_id, nombre, primer_apellido, segundo_apellido FROM profesor WHERE activo = true');
    }
    // Método para devolver los objetos que estan no activos 
    static fetchInactivos() {
        return pool.query('SELECT ivd_id, nombre, primer_apellido, segundo_apellido FROM profesor WHERE activo = false');
    }

    // Método para el atributo activo a false 
    static delete(id) {
        return pool.query('UPDATE profesor SET activo = false WHERE ivd_id = $1', [id]);
    }

    // Método para cambiar el atributo activo a true 
    static async activar(id) {
        try {
            const result = await pool.query(
                'UPDATE profesor SET activo = true WHERE ivd_id = $1 RETURNING *',
                [id]
            );
            return result.rows[0];
        } catch (error) {
            console.error('Error al activar el profesor:', error);
            throw error;
        }
    }
};
