const pool = require('../util/database');


module.exports = class Grupo {
    constructor(mi_materia_id, mi_profesor_id, mi_salon_id) {
        this.materia_id = mi_materia_id;
        this.profesor_id = mi_profesor_id;
        this.salon_id = mi_salon_id;
    }

    async save() {
        
        const resultMax = await pool.query(`SELECT COALESCE(MAX(grupo_id), 0) AS max_id FROM grupo`);
        const newId = resultMax.rows[0].max_id + 1;

        const cicloMax = await pool.query(`SELECT ciclo_escolar_id FROM ciclo_escolar ORDER BY fecha_fin DESC LIMIT 1;`)
        const ciclo = cicloMax.rows[0].ciclo_escolar_id;

        return pool.query(
            'INSERT INTO grupo(grupo_id, materia_id, profesor_id, salon_id, ciclo_escolar_id) VALUES ($1, $2, $3, $4, $5) RETURNING grupo_id',
            [newId, this.materia_id, this.profesor_id, this.salon_id, ciclo]
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

    static updateHorario(id, bloque) {
        return pool.query('INSERT INTO grupo_bloque_tiempo VALUES ($1, $2)', [id, bloque]);
    }

};