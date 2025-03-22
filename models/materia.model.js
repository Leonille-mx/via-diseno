const pool = require('../util/database')

module.exports = class Materia {
    constructor(mi_id, mi_nombre, mi_creditos, mi_horas_profesor, mi_tipo_salon, mi_abierta, mi_obligatoria, mi_profesor_id) {
        this.id = mi_id;
        this.nombre = mi_nombre;
        this.horas_profesor = mi_horas_profesor;
        this.tipo_salon = mi_tipo_salon;
        this.abierta = mi_abierta;
        this.obligatoria = mi_obligatoria
        this.profesor_id = mi_profesor_id;
    }

    static abreMateria() {
        
    }

    static fetchAll() {
        return pool.query('SELECT materia_id, nombre, creditos, horas_profesor, tipo_salon, obligatoria FROM Materia WHERE abierta = true');
    }
}