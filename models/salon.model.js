const pool = require('../util/database');

module.exports = class Salon {

    // Constructor de la clase
    constructor(mi_numero, mi_capacidad, mi_tipo, mi_nota, mi_campus) {
        this.numero = mi_numero
        this.capacidad = mi_capacidad;
        this.tipo = mi_tipo;
        this.nota = mi_nota || 'N/A';
        this.campus = mi_campus;
    }

    // Método para obtener el id máximo
    static async getMaxID() {
        const result = await pool.query('SELECT MAX(salon_id) AS max_id FROM salon');
        return result.rows[0].max_id || 0;
    }

    // Método para guardar de manera persistente un nuevo objeto
    async save() {
        const maxId = await Salon.getMaxID();  // Espera a obtener el máximo ID
        const newId = maxId + 1;  // Genera el nuevo ID

        return pool.query('INSERT INTO salon(salon_id, numero, capacidad, tipo, nota, campus_id) VALUES ($1, $2, $3, $4, $5, $6)',
            [newId, this.numero, this.capacidad, this.tipo, this.nota, this.campus]
        );
    }

    // Método para devolver los objetos del almacenamiento persistente
    static fetchAll() {
        return pool.query('SELECT * FROM salon s, campus c WHERE s.campus_id = c.campus_id ORDER BY salon_id');
    }

    // Método para eliminar un objeto del almacenamiento persistente
    static delete(id) {
        return pool.query('DELETE FROM salon WHERE salon_id = $1', [id]);
    }

    // Método para obtener número total de salones registrados
    static async numero_TotalSalones() {
        const result = await pool.query('SELECT count(*) FROM public.salon');
        return parseInt(result.rows[0].count);
    };

    //Metodo para obtener los grupos con las relaciones entre otras tablas
    static async salonesDashboard() {
        const result = await pool.query('SELECT numero, capacidad FROM public.salon');
        return result.rows;
    };

}      