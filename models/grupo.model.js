const pool = require('../util/database');


module.exports = class Grupo {
    constructor(mi_grupo_id, mi_material_id, mi_professor_id, mi_salon_id, mi_ciclo_escolar_id) {
        this.id = mi_grupo_id;
        this.material_id = mi_material_id;
        this.professor_id = mi_professor_id;
        this.salon_id = mi_salon_id;
        this.ciclo_escolar_id = mi_ciclo_escolar_id;
    }

    save() {
        return pool.query(
            'INSERT INTO grupo(grupo_id, material_id, professor_id, salon_id, ciclo_escolar_id) VALUES ($1, $2, $3, $4, $5)',
            [this.id, this.material_id, this.professor_id, this.salon_id, this.ciclo_escolar_id]
        );
    }

    static fetchAll() {
        return pool.query('SELECT * FROM grupo'); // Ajusta si necesitas JOINs
    }

    static fetchOne(id) {
        return pool.query('SELECT * FROM grupo WHERE grupo_id = $1', [id]); // Corrección del error "$" -> "$1"
    }

    static fetch(id) {
        return id ? this.fetchOne(id) : this.fetchAll();
    }

    static delete(grupo_id) {
        return pool.query(
            'DELETE FROM grupo WHERE grupo_id = $1',
            [grupo_id]
        );
    }

};