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

     // Método para obtener número total de grupos abiertos
     static async numeroTotalGrupos() {
        const result = await pool.query('SELECT count(*) FROM public.grupo');
        return parseInt(result.rows[0].count);
    };

    //Metodo para obtener los grupos con las relaciones entre otras tablas
    static async grupoDashboard() {
        const result = await pool.query(
            ` SELECT 
            g.grupo_id,
            bt.dia,
            bt.hora_inicio,
            bt.hora_fin,
            m.nombre AS materia_nombre,
            p.nombre || ' ' || p.primer_apellido AS profesor_nombre
        FROM 
            grupo_bloque_tiempo gbt
        JOIN 
            bloque_tiempo bt ON gbt.bloque_tiempo_id = bt.bloque_tiempo_id
        JOIN 
            grupo g ON gbt.grupo_id = g.grupo_id
        JOIN 
            materia m ON g.materia_id = m.materia_id
        JOIN 
            profesor p ON g.profesor_id = p.ivd_id
        ORDER BY 
            g.grupo_id, bt.dia, bt.hora_inicio`
            );
        return result.rows;
    };

};