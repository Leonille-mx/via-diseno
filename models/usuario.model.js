const pool = require('../util/database');

module.exports = class Usuario {
    constructor(mi_ivd_id, mi_contrasena = null, mi_nombre, mi_primer_apellido, mi_segundo_apellido, mi_correo_institucional, mi_role_id) {
        this.ivd_id = mi_ivd_id;
        this.contrasena = mi_contrasena;
        this.nombre = mi_nombre;
        this.primer_apellido = mi_primer_apellido;
        this.segundo_apellido = mi_segundo_apellido;
        this.correo_institucional = mi_correo_institucional;
        this.role_id = mi_role_id;
    }
    static async sincronizarUsuarios(studentsApi) {
        const client = await pool.connect();
        
        try { 

            const usersDB_data = await client.query('SELECT * FROM usuario');

            const usersDB = usersDB_data.rows;

            const usersMap = new Map(usersDB.map(user => [user.ivd_id, user]));
    
            let inserted = 0, updated = 0, deleted = 0;
    
            for (const uA of studentsApi) {
                const userDB = usersMap.get(uA.ivd_id);

                if (!userDB) {
                    await client.query(
                        `INSERT INTO usuario 
                         (ivd_id, contrasena, nombre, primer_apellido, segundo_apellido, correo_institucional, role_id) 
                         VALUES ($1, NULL, $2, $3, $4, $5, $6)`,
                        [ uA.ivd_id, uA.name, uA.first_surname, uA.second_surname, uA.email, 2 ]
                    );
                    inserted++;
                } else if (
                    (userDB.nombre || "").trim() !== (uA.name || "").trim() ||
                    (userDB.primer_apellido || "").trim() !== (uA.first_surname || "").trim() ||
                    (userDB.segundo_apellido || "").trim() !== (uA.second_surname || "").trim() ||
                    (userDB.correo_institucional || "").trim() !== (uA.email || "").trim()
                ) {
                    await client.query(
                        `UPDATE usuario SET contrasena = NULL, nombre = $1, primer_apellido = $2, segundo_apellido = $3, correo_institucional = $4, role_id = $5 WHERE ivd_id = $6`,
                        [ uA.name, uA.first_surname, uA.second_surname, uA.email, 2, uA.ivd_id ]
                    );
                    updated++;
                }
                usersMap.delete(uA.ivd_id); 
            }

            for (const [id] of usersMap) {
                await client.query('DELETE FROM usuario WHERE ivd_id = $1', [id]);
                deleted++;
            }
    
            return { inserted, updated, deleted };
    
        } catch(error) {
            console.error('Error durante la sincronización de usuarios:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    static async fetchAll() {
        const query = `SELECT * FROM usuario.`;
        return await pool.query(query);
    }
    // Función para buscar usuario por su correo institucional
    static async findUsuarioById(usuarioId) {
        const client = await pool.connect();
        try {
            const result = await client.query('SELECT * FROM usuario WHERE ivd_id = $1', [usuarioId]);
            return result.rows[0];
        } catch (error) {
            console.error('Error al buscar usuario:', error);
            throw error;
        } finally {
            client.release();
        }
    }

};