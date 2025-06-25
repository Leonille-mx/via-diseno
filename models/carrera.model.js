const pool = require('../util/database');

module.exports = class Carrera {
    constructor(mi_carrera_id, mi_nombre) {
        this.carrera_id = mi_carrera_id;
        this.nombre = mi_nombre;
    } 

    static async sincronizarCarreras(carrerasApi) {
        // Establece la conexión con nuestra base de datos
        const client = await pool.connect();
        try {
            // Iniciamos transacción para garantizar consistencia
            await client.query('BEGIN');

            const carrerasDB_data = await client.query('SELECT * FROM carrera');
            const carrerasDB = carrerasDB_data.rows;

            const carrerasDBMap = new Map(carrerasDB.map(carreras => [carreras.carrera_id, carreras.nombre]));
            // Variables para el mensaje
            let inserted = 0, updated = 0, deleted = 0;
            // Por cada carrea en la API
            for (const cA of carrerasApi) {
                const carreraDB = carrerasDBMap.get(cA.id);
                // Si la carrea no existe en la DB pero en la API si y es activa
                if (!carreraDB && cA.status == 'active') {
                    // Inserta la carrera
                    await client.query(
                        `INSERT INTO carrera 
                        (carrera_id, nombre)
                        VALUES ($1, $2)`,
                        [cA.id, cA.name]
                    );                    
                    // Para cada version del plan de estudio de esa carrera de la API
                    for (const planVersionApi of cA.plans) {
                        // Si la version es activa
                        if (planVersionApi.status == 'active') {
                            // Inserta la version del plan de estudio seleccionado
                            await client.query(
                                `INSERT INTO plan_estudio
                                (plan_estudio_id, version, carrera_id)
                                VALUES ($1, $2, $3)`,
                                [planVersionApi.id, planVersionApi.version, cA.id]
                            );
                        }
                    }
                    // Aumneta uno más para el mensaje
                    inserted ++;
                // Si existe y en la API es activa
                } else if (cA.status == 'active') {
                    // Selecciona todos los planes de estudios 
                    // de la carrera seleccionada
                    const planEstudioDB = await client.query(`
                        SELECT plan_estudio_id, version
                        FROM plan_estudio
                        WHERE carrera_id = $1
                        `, [cA.id]
                    );
                    // Crea un mapa de planes de estudio de la DB 
                    const planEstudioDBMap = new Map(planEstudioDB.rows.map(planE => [planE.plan_estudio_id, planE.version])); 
                    // Crea un mapa de planes de estudio de la API
                    const planEstudioApiMap = new Map(cA.plans.map(planE => [planE.id, {version: planE.version, status: planE.status}])); 
                    
                    for (const planEApi of planEstudioApiMap) {
                        if (!planEstudioDBMap.has(planEApi[0]) && planEApi[1].status === 'active') {
                            console.log(planEApi);
                            await client.query(`
                                INSERT INTO
                                plan_estudio (plan_estudio_id, version, carrera_id)
                                VALUES ($1, $2, $3)`,
                                [planEApi[0], planEApi[1].version, cA.id]
                            );
                            inserted ++;
                        } else if (planEstudioDBMap.has(planEApi[0]) && 
                                   planEstudioDBMap.get(planEApi[0]) !== planEApi[1].version && 
                                   planEApi[1].status === 'active') {
                            await client.query(`
                                DELETE FROM plan_materia
                                WHERE plan_estudio_id = $1 AND plan_estudio_version = $2`,
                                [planEApi[0], planEstudioDBMap.get(planEApi[0])]
                            );
                            await client.query(`
                                DELETE FROM historial_academico ha
                                USING alumno a
                                WHERE ha.ivd_id = a.ivd_id
                                AND a.plan_estudio_id = $1 AND a.plan_estudio_version = $2`,
                                [planEApi[0], planEstudioDBMap.get(planEApi[0])]
                            );
                            await client.query(`
                                DELETE FROM resultado_inscripcion ri
                                USING alumno a
                                WHERE ri.alumno_id = a.ivd_id
                                AND a.plan_estudio_id = $1 AND a.plan_estudio_version = $2`,
                                [planEApi[0], planEstudioDBMap.get(planEApi[0])]
                            );
                            await client.query(`
                                DELETE FROM alumno
                                WHERE plan_estudio_id = $1 AND plan_estudio_version = $2`,
                                [planEApi[0], planEstudioDBMap.get(planEApi[0])]
                            );
                            await client.query(`
                                UPDATE plan_estudio 
                                SET version = $1
                                WHERE plan_estudio_id = $2`,
                                [planEApi[1].version, planEApi[0]]
                            );
                            updated ++;
                            planEstudioDBMap.delete(planEApi[0]);
                        }

                        if (planEstudioDBMap.has(planEApi[0]) && 
                            (planEstudioDBMap.get(planEApi[0]) === planEApi[1].version) && 
                            planEApi[1].status === 'active') {
                            planEstudioDBMap.delete(planEApi[0]);
                        }
                    }

                    for (const [planEDB] of planEstudioDBMap) {
                        await client.query(`
                            DELETE FROM plan_materia
                            WHERE plan_estudio_id = $1`,
                            [planEDB]
                        );
                        await client.query(`
                            DELETE FROM historial_academico ha
                            USING alumno a
                            WHERE ha.ivd_id = a.ivd_id
                            AND a.plan_estudio_id = $1`,
                            [planEDB]
                        );
                        await client.query(`
                            DELETE FROM resultado_inscripcion ri
                            USING alumno a
                            WHERE ri.alumno_id = a.ivd_id
                            AND a.plan_estudio_id = $1`,
                            [planEDB]
                        );
                        await client.query(`
                            DELETE FROM alumno
                            WHERE plan_estudio_id = $1`,
                            [planEDB]
                        );
                        await client.query(`
                            DELETE FROM plan_estudio
                            WHERE plan_estudio_id = $1`,
                            [planEDB]
                        );
                        deleted ++;
                    }

                    if (carreraDB !== cA.name) {
                        await client.query(`
                            UPDATE carrera
                            SET nombre = $1
                            WHERE carrera_id = $2`
                            , [cA.name, cA.id]);
                        updated++;
                    } 
                    carrerasDBMap.delete(cA.id);
                }
            }
            for (let [cDB] of carrerasDBMap) {
                if (cDB === 9999) {
                    carrerasDBMap.delete(cDB);
                continue;
                 }
                await client.query(`
                    DELETE FROM plan_materia pm
                    USING plan_estudio pe
                    WHERE pm.plan_estudio_id = pe.plan_estudio_id
                    AND pm.plan_estudio_version = pe.version
                    AND pe.carrera_id = $1`
                    , [cDB]);
                await client.query(`
                    DELETE FROM historial_academico ha
                    USING alumno a, plan_estudio pe
                    WHERE ha.ivd_id = a.ivd_id
                    AND a.plan_estudio_id = pe.plan_estudio_id
                    AND a.plan_estudio_version = pe.version
                    AND pe.carrera_id = $1`
                    , [cDB]);
                await client.query(`
                    DELETE FROM resultado_inscripcion ri
                    USING alumno a, plan_estudio pe
                    WHERE ri.alumno_id = a.ivd_id
                    AND a.plan_estudio_id = pe.plan_estudio_id
                    AND a.plan_estudio_version = pe.version
                    AND pe.carrera_id = $1`
                    , [cDB]);
                await client.query(`
                    DELETE FROM alumno a
                    USING plan_estudio pe
                    WHERE a.plan_estudio_id = pe.plan_estudio_id
                    AND a.plan_estudio_version = pe.version
                    AND pe.carrera_id = $1`
                    , [cDB]);
                await client.query(`
                    DELETE FROM plan_estudio
                    WHERE carrera_id = $1`
                    , [cDB]);
                await client.query(`
                    DELETE FROM coordinador
                    WHERE carrera_id = $1`
                    , [cDB]);
                await client.query(`
                    DELETE FROM carrera
                    WHERE carrera_id = $1`
                    , [cDB]);
                deleted += 2;
            }
            await client.query('COMMIT');
            return { inserted, updated, deleted };
        } catch (error) {
            await client.query('ROLLBACK');
            console.error("Error durante la sincronización de materias:", error);
            throw error;
        } finally {
            client.release();
        }
    }

    static fetchAll() {
        return pool.query('SELECT * FROM carrera');
    }
}