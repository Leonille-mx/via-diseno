const pool = require('../util/database');

module.exports = class Materia {
    constructor(mi_id, mi_nombre, mi_creditos, mi_horas_profesor, mi_tipo_salon) {
        this.id = mi_id;
        this.nombre = mi_nombre;
        this.creditos = mi_creditos;
        this.horas_profesor = mi_horas_profesor;
        this.tipo_salon = mi_tipo_salon;
    }
    // Para sincronizar materias
    static async sincronizarMaterias(materiasApi) {
        // Establece la conexión con nuestra base de datos
        const client = await pool.connect();
        try {
            // Trae todos los registros de la tabla materia de nuestra base de datos
            const materiasDB_data = await client.query("SELECT * FROM materia");
            // Un arreglo de objetos de los registros de nuestra base de datos
            const materiasDB = materiasDB_data.rows;
    
            // Convierte los datos en un mapa para poder buscarlos más rápido
            // Donde materia.id es la llave y guarda el objeto materia como su valor
            const materiasMap = new Map(materiasDB.map(materia => [ materia.materia_id, materia]));
    
            // Variables para checar el resultado
            let inserted = 0, updated = 0, deleted = 0;
    
            // Procesa los registros importados a través de la API
            for (const mA of materiasApi) {
                // Checa que si el id de los registros de la API se encuentra en
                // el mapa de los registros de nuestra base de datos
                // Si se encuentra, regresa la llave(materia_id)
                // Si no se encuentra, la variable materiaDB va a ser undefined
                const materiaDB = materiasMap.get(mA.id);
                // Si no se encuentra
                if (!materiaDB) {
                    // Inserta los nuevos registros en nuestra base de datos
                    await client.query(
                        `INSERT INTO materia 
                        (materia_id, nombre, creditos, horas_profesor, tipo_salon) 
                        VALUES ($1, $2, $3, $4, $5, $6)`,
                        [
                            mA.id, 
                            mA.name,
                            mA.credits,
                            mA.hours_professor,
                            mA.facilities,
                        ]
                    );
                    for (const requisito of mA.requisites) {
                        await client.query(
                            `INSERT INTO materia_requisito 
                            (materia_id, requisito_id)
                            VALUES ($1, $2)`,
                            [
                                mA.id,
                                requisito.requisite_course_id,
                            ]
                        );
                    }
                    inserted++;
                // Si existe la llave pero otros atributos son diferentes    
                } else {
                    let changed = false;
                    // Trae los registros de la tabla materia_requisito del id actual
                    const requisitosDB = await client.query(
                        `SELECT requisito_id 
                        FROM materia_requisito 
                        WHERE materia_id = $1`, [mA.id]
                    );

                    // Crea un set de los requisito_id de los registros de nuestra base de datos
                    const requisitosDBSet = new Set(requisitosDB.rows.map(requisito => requisito.requisito_id));
                    // Crea un set de los requisite_course_id del otro sistema
                    const requisitosApiSet = new Set(mA.requisites.map(requisito => requisito.requisite_course_id));

                    // Inserta los nuevos requisite_course_id a nuestra base de datos
                    // si no existen
                    for (const requisitoApi of mA.requisites) {
                        // Si el requisite_course_id del id actual no existe en el requisitosDBSet
                        if (!requisitosDBSet.has(requisitoApi.requisite_course_id)) {
                            // Inserta los nuevos requisite_course_id a la tabla
                            await client.query(
                                `INSERT INTO materia_requisito
                                (materia_id, requisito_id)
                                VALUES
                                ($1, $2)`, 
                                [
                                    mA.id, 
                                    requisitoApi.requisite_course_id,
                                ]
                            );
                            changed = true;
                        }
                    }

                    // Si ya no existen los requisito_id, los borra
                    for (const requisitoDB of requisitosDBSet) {
                        if (!requisitosApiSet.has(requisitoDB)) {
                            await client.query(
                                `DELETE 
                                FROM materia_requisito
                                WHERE materia_id = $1 AND requisito_id = $2`,
                                [
                                    mA.id,
                                    requisitoDB
                                ]
                            );
                            changed = true;
                        }  
                    }

                    if (
                        // Normaliza el nombre (trim strings) para una mejor comparasión
                        (materiaDB.nombre || "").trim() !== (mA.name || "").trim() ||
                        // Conviértelos a números para una mejor comparasión
                        Number(materiaDB.creditos) !== Number(mA.credits) ||
                        // Conviértelos a números para una mejor comparasión
                        Number(materiaDB.horas_profesor) !== Number(mA.hours_professor) ||
                        // Normaliza el tipo de salon (trim strings) para una mejor comparasión
                        (materiaDB.tipo_salon || "").trim() !== (mA.facilities || "").trim()
                    ) {
                        // Actualiza los registros de nuestra base de datos
                        await client.query(
                            `UPDATE materia 
                            SET nombre = $1, creditos = $2, horas_profesor = $3, 
                            tipo_salon = $4 WHERE materia_id = $5`,
                            [
                                mA.name, 
                                mA.credits, 
                                mA.hours_professor, 
                                mA.facilities, 
                                mA.id,
                            ]
                        );
                        changed = true;
                    }
                    if(changed) {
                        updated++;
                    }
                }
                
                // Elimina el id del mapa para los registros ya revisados
                materiasMap.delete(mA.id);
            }
    
            // Elimina cualquier datos que existan en el otro sistema de nuestra base de datos
            for (const [id] of materiasMap) {
                await client.query("DELETE FROM materia WHERE materia_id = $1", [id]);
                await client.query("DELETE FROM materia_requisito WHERE materia_id = $1", [id]);
                await client.query("DELETE FROM materia_semestre WHERE materia_id = $1", [id]);
                deleted++;
            }
            // Regresa el resultado para el mensaje
            return { inserted, updated, deleted };
    
        } catch (error) {
            console.error("Error durante la sincronización de materias:", error);
            throw error;
        // Después de la operación, termina la conexión de nuestra base de datos.
        } finally {
            client.release();
        }
    }
    // Trae los registros
    static fetchAll() {
        return pool.query('SELECT materia_id, nombre, creditos, horas_profesor, tipo_salon FROM Materia');
    }

     // Método para obtener número total de materias abiertas
     static async numeroMaterias() {
        const result = await pool.query('SELECT COUNT(*) FROM public.materia_semestre');
        return parseInt(result.rows[0].count);
    };


    
}