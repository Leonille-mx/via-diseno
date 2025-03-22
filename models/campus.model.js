const pool = require('../util/database');

module.exports = class Campus {

    // Constructor de la clase
    constructor(mi_id, mi_nombre) {
        this.id = mi_id;
        this.nombre = mi_nombre;
    }

    // Método para guardar de manera persistente un nuevo objeto
    save() {
        return pool.query('INSERT INTO campus(nombre) VALUES ($1)', [this.nombre]);
    }

    // Método para devolver los objetos del almacenamiento persistente
    static fetchAll() {
        return pool.query('SELECT * FROM campus');
    }

    // Método para eliminar un objeto del almacenamiento persistente
    static delete(id) {
        return pool.query('DELETE FROM campus WHERE campus_id = $1', [id]);
    }
}     