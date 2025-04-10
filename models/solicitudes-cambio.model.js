const pool = require("../util/database");

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
      "INSERT INTO solicitud_cambio(solicitud_cambio_id, descripcion, aprobada, created_at, ivd_id) VALUES ($1, $2, $3, $4, $5)",
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
            sc.created_at::timestamp DESC
    `);
  }

  static aprobar(id) {
    return Promise.all([
      pool.query(
        "UPDATE solicitud_cambio SET aprobada = true WHERE ivd_id = $1",
        [id]
      ),
      pool.query("UPDATE alumno SET regular = false WHERE ivd_id = $1", [id]),
    ]);
  }

  static rechazar(id) {
    return pool.query(
      "UPDATE solicitud_cambio SET aprobada = true WHERE ivd_id = $1",
      [id]
    );
  }

  //metodo para obtener el la solicitud, nombre y apellido de las solicitudes
  static async dasboard_Solicitud() {
    const result = await pool.query(`SELECT 
            sc.solicitud_cambio_id,
            sc.created_at,
            u.nombre, 
            u.primer_apellido
        FROM 
            solicitud_cambio sc
        JOIN 
            usuario u ON sc.ivd_id = u.ivd_id
              ORDER BY
                sc.created_at DESC	`);
    return result.rows;
  }

  // Método para obtener número total de solicitudes de cambio
  static async numeroTotalSolicitudes() {
    const result = await pool.query("SELECT count(*) FROM public.solicitud_cambio");
    return parseInt(result.rows[0].count);
  }
};
