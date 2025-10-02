const pool = require('../util/database');

module.exports = class cicloescolar {
    constructor(mi_code, mi_fecha_inicio, mi_fecha_fin) {
        this.code = mi_code;
        this.fecha_inicio = mi_fecha_inicio; 
        this.fecha_fin = mi_fecha_fin; 
    }

    save() {
        return pool.query(
            'INSERT INTO ciclo_escolar (code, fecha_inicio, fecha_fin) VALUES ($1, $2, $3) RETURNING *',
            [this.code, this.fecha_inicio, this.fecha_fin]
        );
    }

    static fetchAll() {
        return pool.query('SELECT * FROM ciclo_escolar');
    }

    static fetchById(ciclo_escolar_id) {
        return pool.query(
            'SELECT * FROM ciclo_escolar WHERE ciclo_escolar_id = $1',
            [ciclo_escolar_id]
        );
    }

    static fetchMostRecent() {
      return pool.query(
          'SELECT * FROM ciclo_escolar ORDER BY fecha_inicio DESC LIMIT 1'
      );
  }

    static update(ciclo_escolar_id, code, fecha_inicio, fecha_fin) {
        return pool.query(
            'UPDATE ciclo_escolar SET code = $1, fecha_inicio = $2, fecha_fin = $3 WHERE ciclo_escolar_id = $4',
            [code, fecha_inicio, fecha_fin, ciclo_escolar_id]
        );
    }

    static delete(ciclo_escolar_id) {
        return pool.query(
            'DELETE FROM ciclo_escolar WHERE ciclo_escolar_id = $1',
            [ciclo_escolar_id]
        );
    }

    static async sincronizarConAPI(externalData) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        const localResult = await client.query('SELECT * FROM ciclo_escolar');
        const localCycles = localResult.rows;

        // Mapas para búsquedas rápidas
        const localById = new Map(localCycles.map(r => [r.ciclo_escolar_id, r]));
        const localByCode = new Map(localCycles.map(r => [ (r.code||'').trim(), r ]));

        let inserted = 0, updated = 0, deleted = 0;
        const invalidRecords = [];

        const toISO = (d) => {
          if (!d) return null;
          const dt = new Date(d);
          if (isNaN(dt)) return null;
          if (dt.getFullYear() === 0) return null; // filtrar year=0
          return dt.toISOString().slice(0,10); // YYYY-MM-DD
        };

        // Normalizar externalData posible wrapper { data: [...] }
        const items = Array.isArray(externalData) ? externalData : (externalData?.data ?? []);

        for (const ext of items) {
          const extId = (ext.id != null) ? Number(ext.id) : null;
          const extCode = (ext.code || '').trim();
          const extStart = toISO(ext.start_date);
          const extEnd = toISO(ext.end_date);

          // Validaciones
          if (!extCode || extCode === '-') {
            invalidRecords.push({ id: extId, code: extCode, reason: 'code inválido/placeholder' });
            continue;
          }
          if (!extStart || !extEnd) {
            invalidRecords.push({ id: extId, code: extCode, reason: 'fecha inválida o year=0', rawStart: ext.start_date, rawEnd: ext.end_date });
            continue;
          }
          if (extEnd <= extStart) {
            invalidRecords.push({ id: extId, code: extCode, reason: 'end_date <= start_date', start: extStart, end: extEnd });
            continue;
          }

          // Buscar por code primero (clave lógica), luego por id
          const byCode = localByCode.get(extCode);
          const byId = (extId != null) ? localById.get(extId) : undefined;

          if (byCode) {
            // Actualizar registro que coincida por code
            if (toISO(byCode.fecha_inicio) !== extStart || toISO(byCode.fecha_fin) !== extEnd || ( (byCode.code||'').trim() !== extCode)) {
              await client.query(
                `UPDATE ciclo_escolar SET code = $1, fecha_inicio = $2, fecha_fin = $3 WHERE ciclo_escolar_id = $4`,
                [extCode, extStart, extEnd, byCode.ciclo_escolar_id]
              );
              updated++;
              // Sincronizar mapas con datos nuevos
              localById.set(byCode.ciclo_escolar_id, { ...byCode, code: extCode, fecha_inicio: extStart, fecha_fin: extEnd });
              localByCode.set(extCode, localById.get(byCode.ciclo_escolar_id));
            }
          } else if (byId) {
            // Actualizar registro que coincida por id
            if (toISO(byId.fecha_inicio) !== extStart || toISO(byId.fecha_fin) !== extEnd || ((byId.code||'').trim() !== extCode)) {
              await client.query(
                `UPDATE ciclo_escolar SET code = $1, fecha_inicio = $2, fecha_fin = $3 WHERE ciclo_escolar_id = $4`,
                [extCode, extStart, extEnd, byId.ciclo_escolar_id]
              );
              updated++;
              // actualizar mapas
              localById.set(byId.ciclo_escolar_id, { ...byId, code: extCode, fecha_inicio: extStart, fecha_fin: extEnd });
              localByCode.set(extCode, localById.get(byId.ciclo_escolar_id));
            }
          } else {
            // No existe local -> insertar
            if (extId != null) {
              // Intentamos insertar con el id externo, pero si ya existe un registro con ese id (colisión), ON CONFLICT lo convertirá en UPDATE
              await client.query(
                `INSERT INTO ciclo_escolar (ciclo_escolar_id, code, fecha_inicio, fecha_fin)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (ciclo_escolar_id) DO UPDATE
                  SET code = EXCLUDED.code,
                      fecha_inicio = EXCLUDED.fecha_inicio,
                      fecha_fin = EXCLUDED.fecha_fin`,
                [extId, extCode, extStart, extEnd]
              );
              // Si la fila fue insertada incrementa inserted, si fue actualizada no podemos saber fácilmente sin RETURNING; asumimos inserted++ salvo que quieras comprobar.
              inserted++;
              // Actualizar mapas (asegura consistencia local para esta transacción)
              localById.set(extId, { ciclo_escolar_id: extId, code: extCode, fecha_inicio: extStart, fecha_fin: extEnd });
              localByCode.set(extCode, localById.get(extId));
            } else {
              // extId no viene -> insertar sin id (requiere que la DB genere id con DEFAULT/sequence)
              await client.query(
                `INSERT INTO ciclo_escolar (code, fecha_inicio, fecha_fin) VALUES ($1, $2, $3)`,
                [extCode, extStart, extEnd]
              );
              inserted++;
              // NOTA: no actualizamos localById porque no conocemos el id generado en esta ejecución
            }
          }
        } // end for

        // Eliminar ciclos locales que no aparecen en externalData (comparando por code)
        const externalCodes = new Set(items.map(x => (x.code || '').trim()));
        const toDelete = Array.from(localByCode.values()).filter(lc => !externalCodes.has((lc.code||'').trim()));

        for (const cycle of toDelete) {
          await client.query('DELETE FROM ciclo_escolar WHERE ciclo_escolar_id = $1', [cycle.ciclo_escolar_id]);
          deleted++;
        }

        await client.query('COMMIT');

        return { inserted, updated, deleted, invalid: invalidRecords };

      } catch (error) {
        try { await client.query('ROLLBACK'); } catch (r) { /* ignore */ }
        throw error;
      } finally {
        client.release();
      }
    }

    getFormattedPeriod() {
        const startDate = new Date(this.fecha_inicio);
        const endDate = new Date(this.fecha_fin);
        
        const startMonth = startDate.toLocaleString('es-ES', { month: 'long' });
        const endMonth = endDate.toLocaleString('es-ES', { month: 'long' });
        const year = startDate.getFullYear();
        
        return `Semestre ${this.capitalizeFirstLetter(startMonth)} - ${this.capitalizeFirstLetter(endMonth)} ${year}`;
    }

    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
};