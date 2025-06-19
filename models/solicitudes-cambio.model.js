const pool = require("../util/database");

module.exports = class Solicitud {
  constructor(mi_solicitud, mi_descripcion, mi_estatus, mi_fecha, mi_id, mi_carrera_nombre) {
    this.solicitud = mi_solicitud;
    this.descripcion = mi_descripcion;
    this.estatus = mi_estatus;
    this.fecha = mi_fecha;
    this.id = mi_id;
    this.carrera_nombre = mi_carrera_nombre;
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
            sc.created_at::timestamp ASC
    `);
  }
  
  static fetchActivosPorCarrera(carrera_id) {
    return pool.query(`
        SELECT 
            sc.solicitud_cambio_id, 
            sc.descripcion, 
            sc.aprobada, 
            sc.created_at, 
            sc.ivd_id,
            u.nombre, 
            u.primer_apellido,
            u.correo_institucional,
            c.nombre as carrera_nombre
        FROM 
            solicitud_cambio sc
        JOIN 
            usuario u ON sc.ivd_id = u.ivd_id
        JOIN 
            alumno a ON a.ivd_id = u.ivd_id
        JOIN 
            plan_estudio p ON p.plan_estudio_id = a.plan_estudio_id
        JOIN
            carrera c ON c.carrera_id = p.carrera_id
        WHERE 
            sc.aprobada = false 
            AND
            p.carrera_id = $1
        ORDER BY 
            sc.created_at::timestamp ASC
    `, [carrera_id]);
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
  static async dasboard_Solicitud(carrera_id) {
    const result = await pool.query(`SELECT 
            sc.solicitud_cambio_id,
            sc.created_at,
            u.nombre, 
            u.primer_apellido
        FROM 
            solicitud_cambio sc
        JOIN 
            usuario u ON sc.ivd_id = u.ivd_id
        JOIN 
            alumno a ON a.ivd_id = u.ivd_id
        JOIN 
            plan_estudio p ON p.plan_estudio_id = a.plan_estudio_id
        WHERE 
            sc.aprobada = false 
            AND
            p.carrera_id = $1
        ORDER BY 
            sc.created_at::timestamp ASC`
        , [carrera_id]);
    return result.rows;
  }

  // Método para obtener número total de solicitudes de cambio
  static async numeroTotalSolicitudes(carrera_id) {
    const result = await pool.query(`
      SELECT count(*) 
      FROM solicitud_cambio sc
      JOIN alumno a ON a.ivd_id = sc.ivd_id
      JOIN plan_estudio p ON p.plan_estudio_id = a.plan_estudio_id
      WHERE p.carrera_id = $1 AND sc.aprobada = false`
      , [carrera_id]
    );
    return parseInt(result.rows[0].count);
  }
};