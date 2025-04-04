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
        return pool.query(`SELECT g.grupo_id, m.nombre materia, p.nombre, p.primer_apellido, p.segundo_apellido, s.numero, c.code
                           FROM grupo g, materia m, profesor p, salon s, ciclo_escolar c
                           WHERE g.materia_id = m.materia_id
                           AND g.profesor_id = p.ivd_id
                           AND g.salon_id = s.salon_id
                           AND g.ciclo_escolar_id = c.ciclo_escolar_id
                           ORDER BY g.grupo_id`);
    }

    static fetchOne(id) {
        return pool.query('SELECT * FROM grupo WHERE grupo_id = $1', [id]); 
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

    static deleteHorario(grupo_id) {
        return pool.query(
            'DELETE FROM grupo_bloque_tiempo WHERE grupo_id = $1',
            [grupo_id]
        );
    }

};