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
    return pool.query(`
        SELECT 
            sc.solicitud_cambio_id, 
            sc.descripcion, 
            sc.aprobada, 
            sc.created_at, 
            sc.ivd_id,
            u.nombre, 
            u.primer_apellido, 
            u.correo_institucional 

        FROM 
            solicitud_cambio sc
        JOIN 
            usuario u ON sc.ivd_id = u.ivd_id
    `);
}
static fetchActivos() {
    return pool.query(`
        SELECT 
            sc.solicitud_cambio_id, 
            sc.descripcion, 
            sc.aprobada, 
            sc.created_at, 
            sc.ivd_id,
            u.nombre, 
            u.primer_apellido,
            u.correo_institucional
        FROM 
            solicitud_cambio sc
        JOIN 
            usuario u ON sc.ivd_id = u.ivd_id
        WHERE 
            sc.aprobada = false
        ORDER BY 
            sc.solicitud_cambio_id
    `);
}

static delete(id) {
    return pool.query('UPDATE solicitud_cambio SET aprobada = true WHERE solicitud_cambio_id = $1', [id])
}

    
};
