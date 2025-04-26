const pool = require('../util/database');

module.exports = class Coordinador {

    constructor(mi_id, mi_carrera_id) {
        this.ivd_id = mi_id;
        this.carrera_id = mi_carrera_id;
    }

    static async getCarrera(id) {
        return pool.query(`
            SELECT carrera_id
            FROM coordinador
            WHERE ivd_id = $1
            `, [id]
        );
    }
}