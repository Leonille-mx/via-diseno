const pool = require('../util/database');

module.exports = class Coordinador {

    constructor(mi_id, mi_carrera_id) {
        this.ivd_id = mi_id;
        this.carrera_id = mi_carrera_id;
    }

    static async sincronizarAdministradores(adminsApi) {
        const client = await pool.connect();
        
        try { 

            const adminsDB_data = await client.query('SELECT * FROM coordinador WHERE ivd_id != 1037');
            const adminsDB = adminsDB_data.rows;
            const adminsMap = new Map(adminsDB.map(admin => [ admin.ivd_id, admin ] ))

            let inserted = 0, updated = 0, deleted = 0;

            for (const admin of adminsApi) {
                const adminDB = adminsMap.get(admin.ivd_id)

                if(!adminDB) {
                    await client.query(
                        'INSERT INTO coordinador (ivd_id, carrera_id, puesto) VALUES ($1, $2, $3)',
                        [admin.ivd_id, 9999, admin.position]
                    );
                    inserted ++;
                } else if (adminDB.puesto !== admin.position) {
                    await client.query(
                        'UPDATE coordinador SET puesto = $1 WHERE ivd_id = $2',
                        [admin.position, admin.ivd_id]
                    );
                    updated++;
                }
                adminsMap.delete(admin.ivd_id);
            }
            for (const [id] of adminsMap) {
                await client.query('DELETE FROM coordinador WHERE ivd_id = $1', [id]);
                deleted++;
            }
            return { inserted, updated, deleted };

        } catch(error){
            console.error('Error durante la sincronización de coordinadores:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    static async fetchAll() {
        return pool.query(`
            SELECT c.ivd_id, c.carrera_id, c.puesto,
                   u.nombre, u.primer_apellido, u.segundo_apellido,
                   u.correo_institucional, ca.nombre AS carrera_nombre 
            FROM coordinador c
            JOIN usuario u ON c.ivd_id = u.ivd_id
            JOIN carrera ca ON c.carrera_id = ca.carrera_id
            ORDER BY ivd_id`)
    }

    static async getCarrera(id) {
        return pool.query(`
            SELECT carrera_id
            FROM coordinador
            WHERE ivd_id = $1
            `, [id]
        );
    }

    static async cambiarCarrera(id, carrera) {
        return pool.query(`
            UPDATE coordinador
            SET carrera_id = $2
            WHERE ivd_id = $1
            `, [id, carrera]
        );
    }
}