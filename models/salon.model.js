const pool = require('../util/database');

const salones = [];

module.exports = class Salon {

    constructor(mi_id, mi_capacidad, mi_tipo, mi_nota, mi_campus) {
        this.id = mi_id;
        this.capacidad = mi_capacidad;
        this.tipo = mi_tipo;
        this.nota = mi_nota;
        this.campus = mi_campus;
    }

    save() {
        return pool.query('INSERT INTO salon(salon_id, capacidad, tipo, nota, campus) VALUES ($1, $2, $3, $4, $5)', [this.id, this.capacidad, this.tipo, this.nota, this.campus]);
    }

    static fetchAll() {
        return pool.query('SELECT salon_id, capacidad, tipo, nota, nombre FROM salon s, campus c WHERE s.campus_id = c.campus_id');
    }

    static fetchOne(id) {
        return pool.query('SELECT * FROM salon WHERE salon_id=$', [id]);
    }

    static fetch(id) {
        if (id) {
            return this.fetchOne(id);
        } else {
            return this.fetchAll();
        }
    }
}      