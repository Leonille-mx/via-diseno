const pool = require('../util/database');

module.exports = class Usuario {
    constructor(mi_ivd_id, mi_contrasena, mi_nombre, mi_primer_apellido, mi_segundo_apellido, mi_correo_institucional, mi_role_id) {
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
                const role_id = sA.role?.id

                if (!userDB) {
                    await client.query(
                        `INSERT INTO usuario 
                         (ivd_id, contrasena, nombre, primer_apellido, segundo_apellido, correo_institucional, role_id) 
                         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                        [ uA.ivd_id, mi_contrasena, uA.name, uA.first_surname, uA.second_surname, uA.email, 
                            role_id
                        ]
                    );
                    inserted++;
                } else if (
                    userDB.nombre !== uA.name ||
                    userDB.primer_apellido !== uA.first_surname ||
                    userDB.segundo_apellido !== uA.second_surname ||
                    userDB.correo_institucional !== uA.email ||
                    Number(userDB.role_id) !== Number(role_id)
                ) {
                    await client.query(
                        `UPDATE usuario SET contrasena = $1, nombre = $2, primer_apellido = $3, segundo_apellido = $4, correo_institucional = $5, role_id = $6 WHERE ivd_id = $7`,
                        [ mi_contrasena, uA.name, uA.first_surname, uA.second_surname, uA.email, role_id, uA.ivd_id ]
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

};