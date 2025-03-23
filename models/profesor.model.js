const pool = require('../util/database');

const profesores = []; // Mantengo esta variable para su uso en el controlador

module.exports = class Profesor {

    // Constructor de la clase
    constructor(mi_id, mi_nombre, mi_primer_apellido, mi_segundo_apellido) {
        this.id = mi_id;
        this.nombre = mi_nombre;
        this.primer_apellido = mi_primer_apellido;
        this.segundo_apellido = mi_segundo_apellido;
    }

    /// Método para guardar de manera persistente un nuevo objeto
    save() {
        return pool.query('INSERT INTO profesor(ivd_id, nombre, primer_apellido, segundo_apellido) VALUES ($1, $2, $3, $4)', 
            [this.id, this.nombre, this.primer_apellido, this.segundo_apellido]);
    }

    // Método para devolver los objetos del almacenamiento persistente
    static fetchAll() {
        return pool.query('SELECT ivd_id, nombre, primer_apellido, segundo_apellido FROM profesor');
    }

    // Método para eliminar un profesor del almacenamiento persistente
    static delete(id) {
        return pool.query('DELETE FROM profesor WHERE ivd_id = $1', [id]);
    }
};
