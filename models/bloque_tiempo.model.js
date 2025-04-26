const pool = require('../util/database');

module.exports = class BloqueTiempo {

    // Constructor de la clase
    constructor(mi_id, mi_dia, mi_hora_inicio, mi_hora_fin) {
        this.bloque_tiempo_id = mi_id;
        this.dia = mi_dia;
        this.hora_inicio = mi_hora_inicio;
        this.hora_fin = mi_hora_fin;
    }

    // Método para devolver los objetos del almacenamiento persistente
    static fetchAllHoras() {
        return pool.query(`
            SELECT json_object_agg(bloque_tiempo_id, 
                    json_build_array(hora_inicio, hora_fin)) AS id_hora_map
            FROM bloque_tiempo;
        `);
    }
}     