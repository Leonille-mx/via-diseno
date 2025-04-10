
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
      
          // Get existing cycles and max ID
          const localResult = await client.query('SELECT * FROM ciclo_escolar');
          const localCycles = localResult.rows;
          const maxIdResult = await client.query('SELECT MAX(ciclo_escolar_id) as max_id FROM ciclo_escolar');
          let nextId = maxIdResult.rows[0].max_id ? maxIdResult.rows[0].max_id + 1 : 1;
      
          let inserted = 0, updated = 0, deleted = 0;
          const invalidRecords = [];
      
          // Process external data
          for (const extCycle of externalData) {      
            // Validate date constraint
            if (extCycle.end_date <= extCycle.start_date) {
              invalidRecords.push({
                code: extCycle.code,
                start: extCycle.start_date,
                end: extCycle.end_date
              });
              continue; // Skip invalid record
            }
      
            // Rest of synchronization logic...
            const existing = localCycles.find(lc => lc.code === extCycle.code);
            
            if (existing) {
              // forma una fecha a un string de YYYY-MM-DD
              const formatDate = (date) => {
                    if (!date) return null;
                    // Convierte a YYYY-MM-DD
                    return new Date(date).toLocaleDateString('en-US'); 
                };
  
              if (formatDate(existing.fecha_inicio) !== formatDate(extCycle.start_date) ||
                  formatDate(existing.fecha_fin) !== formatDate(extCycle.end_date) ||
                  (existing.code || "").trim() !== (extCycle.code || "").trim()
                )
              {
                await client.query(
                  `UPDATE ciclo_escolar 
                  SET fecha_inicio = $1, fecha_fin = $2 
                  WHERE ciclo_escolar_id = $3`,
                  [extCycle.start_date, extCycle.end_date, existing.ciclo_escolar_id]
              );
                updated++;
              }
            } else {
              await client.query(
                `INSERT INTO ciclo_escolar 
                (ciclo_escolar_id, code, fecha_inicio, fecha_fin)
                VALUES ($1, $2, $3, $4)`,
                [nextId, extCycle.code, extCycle.start_date, extCycle.end_date]
              );
              nextId++;
              inserted++;
            }
          }
      
          // Delete missing cycles
          const externalCodes = externalData.map(ec => ec.code);
          const toDelete = localCycles.filter(lc => !externalCodes.includes(lc.code));
          
          for (const cycle of toDelete) {
            await client.query(
              'DELETE FROM ciclo_escolar WHERE ciclo_escolar_id = $1',
              [cycle.ciclo_escolar_id]
            );
            deleted++;
          }

          await client.query('COMMIT');

          return {
            inserted,
            updated,
            deleted,
            invalid: invalidRecords
          };
      
        } catch (error) {
          throw error;
        } finally {
          client.release();
        }
      }
};