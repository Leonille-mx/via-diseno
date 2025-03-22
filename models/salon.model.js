const pool = require('../util/database');

const salones = [];

module.exports = class Salon {

    // Constructor de la clase
    constructor(mi_id, mi_capacidad, mi_tipo, mi_nota, mi_campus) {
        this.id = mi_id;
        this.capacidad = mi_capacidad;
        this.tipo = mi_tipo;
        this.nota = mi_nota;
        this.campus = mi_campus;
    }

    // Método para guardar de manera persistente un nuevo objeto
    save() {
        return pool.query('INSERT INTO salon(salon_id, capacidad, tipo, nota, campus) VALUES ($1, $2, $3, $4, $5)', [this.id, this.capacidad, this.tipo, this.nota, this.campus]);
    }

    // Método para devolver los objetos del almacenamiento persistente
    static fetchAll() {
        return pool.query('SELECT salon_id, capacidad, tipo, nota, nombre FROM salon s, campus c WHERE s.campus_id = c.campus_id');
    }

    // Método para eliminar un objeto del almacenamiento persistente
    static delete(id) {
        return pool.query('DELETE FROM salon WHERE salon_id = $1', [id]);
    }
}      