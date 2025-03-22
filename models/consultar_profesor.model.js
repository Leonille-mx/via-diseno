const pool = require('../util/database');

const profesores = []; // Mantengo esta variable para su uso en el controlador

module.exports = class Profesor {

    constructor(mi_id, mi_nombre, mi_primer_apellido, mi_segundo_apellido) {
        this.id = mi_id;
        this.nombre = mi_nombre;
        this.primer_apellido = mi_primer_apellido;
        this.segundo_apellido = mi_segundo_apellido;
    }

    save() {
        return pool.query('INSERT INTO profesor(ivd_id, nombre, primer_apellido, segundo_apellido) VALUES ($1, $2, $3, $4)', 
            [this.id, this.nombre, this.primer_apellido, this.segundo_apellido]);
    }

    static fetchAll() {
        return pool.query('SELECT ivd_id, nombre, primer_apellido, segundo_apellido FROM profesor');
    }

    static fetchOne(id) {
        return pool.query('SELECT * FROM profesor WHERE ivd_id=$1', [id]); }

    static fetch(id) {
        if (id) {
            return this.fetchOne(id);
        } else {
            return this.fetchAll();
        }
    }
}
