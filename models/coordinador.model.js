const pool = require('../util/database');

module.exports = class Coordinador {

    constructor(mi_id, mi_carrera_id) {
        this.ivd_id = mi_id;
        this.carrera_id = mi_carrera_id;
    }

    static async fetchAll() {
        return pool.query(`
            SELECT c.ivd_id, c.carrera_id,
                   u.nombre, u.primer_apellido, u.segundo_apellido,
                   u.correo_institucional, ca.nombre AS carrera_nombre 
            FROM coordinador c
            JOIN usuario u ON c.ivd_id = u.ivd_id
            JOIN carrera ca ON c.carrera_id = ca.carrera_id`)
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