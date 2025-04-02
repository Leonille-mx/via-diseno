const pool = require('../util/database');

module.exports = class Solicitud {
    constructor(mi_solicitud, mi_descripcion, mi_estatus, mi_fecha, mi_id) {
        this.solicitud = mi_solicitud;
        this.descripcion = mi_descripcion;
        this.estatus = mi_estatus;
        this.fecha = mi_fecha;
        this.id = mi_id;
    }

    save() {
        return pool.query(
            'INSERT INTO solicitud_cambio(solicitud_cambio_id, descripcion, aprobada, created_at, ivd_id) VALUES ($1, $2, $3, $4, $5)',
            [this.solicitud, this.descripcion, this.estatus, this.fecha, this.id]
        );
    }

    static fetchAll() {
        return pool.query('SELECT solicitud_cambio_id, descripcion, aprobada, created_at, ivd_id FROM solicitud_cambio');
    }

    static fetchActivos() {
        return pool.query('SELECT solicitud_cambio_id, descripcion, aprobada, created_at, ivd_id FROM solicitud_cambio WHERE aprobada = true');
    }

    static delete(id) {
        return pool.query('DELETE FROM solicitud_cambio WHERE solicitud_cambio_id = $1', [id]);
    }
    
    // Métodos adicionales recomendados
    static findById(id) {
        return pool.query('SELECT * FROM solicitud_cambio WHERE solicitud_cambio_id = $1', [id]);
    }

};
