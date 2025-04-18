const pool = require('../util/database');

module.exports = class generarGrupos {

    // Obtiene las materias abiertas para las que deben generarse grupos
    static async getMateriasAbiertas(client = pool) {
        return client.query(`SELECT * FROM materia m, materia_semestre ms
                            WHERE m.materia_id = ms.materia_id`);
    }

    // Obtiene la relación materia-profesor y la devuelve como un objeto:
    // { materia_id: [profesor_id, ...], ... }
    static async getProfesorMaterias(client = pool) {
        const result = await client.query(`SELECT * FROM profesor_materia`);
        const mapping = {};
        result.rows.forEach(row => {
            if (!mapping[row.materia_id]) mapping[row.materia_id] = [];
            mapping[row.materia_id].push(row.profesor_id);
        });
        return mapping;
    }

    // Obtiene la disponibilidad de todos los profesores en una sola consulta.
    // Devuelve un objeto: { profesor_id: [bloque_tiempo_id, ...], ... }
    static async getProfesorHorarios(client = pool) {
        const result = await client.query(`SELECT * FROM profesor_bloque_tiempo`);
        const mapping = {};
        result.rows.forEach(row => {
            if (!mapping[row.profesor_id]) mapping[row.profesor_id] = [];
            mapping[row.profesor_id].push(row.bloque_tiempo_id);
        });
        return mapping;
    }

    // Heurística MRV (Minimum Remaining Values): estima opciones y ordena materias de más restrictiva a menos considerando:
    // - Cantidad de profesores disponibles
    // - Cantidad de bloques de tiempo por profesor
    // - Horas por semana requeridas por la materia
    static ordenarMateriasMRV(materias, profesorMaterias, profesorHorarios) {
        function binomial(n, k) {
            let res = 1;
            for (let i = 1; i <= k; i++) {
                res = (res * (n - i + 1)) / i;
            }
            return res;
        }
        return materias
            .map(m => {
                const bloquesNecesarios = m.horas_profesor * 2;
                const profesores = profesorMaterias[m.materia_id] || [];
                let total = 0;
                profesores.forEach(p => {
                    const len = profesorHorarios[p]?.length || 0;
                    if (len >= bloquesNecesarios) total += binomial(len, bloquesNecesarios);
                });
                return { materia: m, opciones: total };
            })
            .sort((a, b) => a.opciones - b.opciones)
            .map(obj => obj.materia);
    }

    // Valida que en cada día los bloques seleccionados
    // aparezcan en secuencias consecutivas de al menos 2.
    static validarSesion(asignacion, blocksPerDay) {
        let dias = {};
        asignacion.forEach(b => {
            const dayIndex = Math.floor((parseInt(b) - 1) / blocksPerDay);
            if (!dias[dayIndex]) dias[dayIndex] = [];
            dias[dayIndex].push(parseInt(b));
        });
        for (const day in dias) {
            let bloques = dias[day].sort((a, b) => a - b);
            if (bloques.length === 1) return false;
            let secuencia = [bloques[0]];
            for (let i = 1; i < bloques.length; i++) {
                if (bloques[i] === bloques[i - 1] + 1) {
                    secuencia.push(bloques[i]);
                } else {
                    if (secuencia.length < 2) return false;
                        secuencia = [bloques[i]];
                }
            }
            if (secuencia.length < 2) return false;
        }
        return true;
    }

    // Genera todas las combinaciones válidas de k bloques a partir de la disponibilidad,
    // garantizando que en cada día los bloques seleccionados formen secuencias 
    // secuencias consecutivas de al menos 2 bloques (sesiones mínimas de 1 hora).
    static generarCombinaciones(disponibilidad, k) {

        // 1) Agrupar bloques de tiempo por día
        // Estructura: { día: [bloques] } para manejar restricciones diarias
        const byDay = disponibilidad.reduce((acc, b) => {
            
            // Calcular día asumiendo 24 bloques por día
            const day = Math.floor((b - 1) / 24);
            
             // Inicializar array para nuevo día
            if (!acc[day]) { acc[day] = []; }
            
             // Agregar bloque a su día correspondiente
            acc[day].push(b);
            
            return acc;
        }, {});
      
        // 2) Extraer segmentos contiguos de longitud ≥ 2
        const segmentos = [];

        // Procesar cada grupo de bloques por día
        for (const bloques of Object.values(byDay)) {
            // Ordenar bloques para detectar secuencias consecutivas
            bloques.sort((a,b) => a - b);

            // Generar todas las posibles secuencias válidas
            for (let i = 0; i < bloques.length; i++) {
                let seq = [ bloques[i] ];

                // Extender secuencia mientras haya bloques consecutivos
                for (let j = i+1; j < bloques.length && bloques[j] === bloques[j-1] + 1; j++) {
                    seq.push(bloques[j]);

                    // Registrar solo secuencias de 2+ bloques
                    if (seq.length >= 2) {
                        segmentos.push({ bloques: [...seq], size: seq.length });
                    }
                }
            }
        }
      
        const resultados = [];

        // 3) Backtracking con control de solapamientos
        function backtrack(idx, usedBlocksSet, currentSum, currentSegments) {
            
            if (currentSum === k) {
                // Aplanamos segmentos a lista de bloques
                resultados.push(currentSegments.flatMap(s => s.bloques));
                return;
            }

            if (currentSum > k || idx === segmentos.length) {return;}
      
            const seg = segmentos[idx]; // Segmento actual a evaluar
      
            // Si no se solapa, incluir este segmento
            const overlap = seg.bloques.some(b => usedBlocksSet.has(b));
            if (!overlap) {
                // Marcamos bloques como usados
                seg.bloques.forEach(b => usedBlocksSet.add(b));
                currentSegments.push(seg); // Agregar segmento a la solución
        
                // Explorar rama con este segmento incluido
                backtrack(idx + 1, usedBlocksSet, currentSum + seg.size, currentSegments);
        
                // Rollback para backtracking
                currentSegments.pop();
                seg.bloques.forEach(b => usedBlocksSet.delete(b));
            }
        
            // Explorar rama sin incluir este segmento
            backtrack(idx + 1, usedBlocksSet, currentSum, currentSegments);
            }
            
            // Inicia el backtracking 
            backtrack(0, new Set(), 0, []);
            return resultados;
      }
      
    // Valida que la asignación de bloques para un grupo no genere conflictos:
    // - Dos grupos con el mismo profesor no pueden tener bloques en común.
    // - Dos grupos del mismo semestre (ciclo escolar) no pueden tener bloques en común.
    static validarRestricciones(asignacion, profesor, gruposAsignados, semestres) {
        for (let grupo of gruposAsignados) {
            // Verificar conflicto de profesor
            if (grupo.profesor_id === profesor && grupo.bloques.some(b => asignacion.includes(b))) return false;
            // Verificar conflicto en los semestres involucrados
            if (grupo.semestres.some(s => semestres.includes(s)) && grupo.bloques.some(b => asignacion.includes(b))) return false;
        }
        // Además, se valida que la sesión sea correcta en cada día
        return generarGrupos.validarSesion(asignacion, 24);
    }

    // Función auxiliar para generar la llave del cache
    static obtenerClaveCache(profesor, bloquesNecesarios) {
        return `${profesor}-${bloquesNecesarios}`;
    }

    // Inserta un grupo en la tabla "grupo" y retorna el grupo_id generado
    static async saveGrupo(grupo, client = pool) {
        const resultMax = await client.query(`SELECT COALESCE(MAX(grupo_id), 0) AS max_id FROM grupo`);
        const newId = resultMax.rows[0].max_id + 1;
        const cicloMax = await client.query(`SELECT ciclo_escolar_id FROM ciclo_escolar ORDER BY fecha_fin DESC LIMIT 1;`);
        const ciclo = cicloMax.rows[0].ciclo_escolar_id;
        return client.query(
            `INSERT INTO grupo (grupo_id, materia_id, profesor_id, salon_id, ciclo_escolar_id)
             VALUES ($1, $2, $3, $4, $5) RETURNING grupo_id`,
            [newId, grupo.materia_id, grupo.profesor_id, grupo.salon_id, ciclo]
        );
    }

    // Inserta la asignación de bloques en la tabla "grupo_bloque_tiempo"
    static async saveGrupoHorario(grupo_id, bloques, client = pool) {
        if (!bloques.every(b => Number.isInteger(b))) throw new Error("Bloques inválidos");
        const values = bloques.map((_, i) => `($1, $${i + 2})`).join(', ');
        return client.query(`INSERT INTO grupo_bloque_tiempo (grupo_id, bloque_tiempo_id)
                             VALUES ${values}`, [grupo_id, ...bloques]);
    }

    // Elimina el horario de un grupo de la base de datos
    static async deleteGrupoHorario(grupo_id, client = pool) {
        return client.query(`DELETE FROM grupo_bloque_tiempo WHERE grupo_id = $1`, [grupo_id]);
    }

    // Elimina un grupo de la base de datos
    static async deleteGrupo(grupo_id, client = pool) {
        return client.query(`DELETE FROM grupo WHERE grupo_id = $1`, [grupo_id]);
    }

    // Elimina los grupos asignados a los alumnos
    static async deleteResultadoInscripcion(client = pool) {
        return client.query(`DELETE FROM resultado_inscripcion`);
    }

    // Elimina todos los horarios asignados a los grupos
    static async deleteAllGruposBloqueTiempo(client = pool) {
        return client.query(`DELETE FROM grupo_bloque_tiempo`);
    }

    // Elimina todos los grupos
    static async deleteAllGrupos(client = pool) {
        return client.query(`DELETE FROM grupo`);
    }

    // Asigna cada grupo a todos los alumnos de su(s) semestre(s) que no hayan aprobado la materia previamente.
    static async asignarGruposAAlumnos(gruposAsignados, client = pool) {
        for (const { grupo_id, semestres } of gruposAsignados) {
          for (const semestreId of semestres) {
            await client.query(`INSERT INTO resultado_inscripcion (alumno_id, grupo_id, obligatorio)
                                SELECT a.ivd_id, g.grupo_id, true
                                FROM alumno a
                                JOIN semestre s ON a.semestre = s.numero
                                JOIN grupo g ON g.grupo_id = $1
                                LEFT JOIN historial_academico h
                                ON h.ivd_id = a.ivd_id
                                AND h.materia_id = g.materia_id
                                AND h.aprobado = true
                                WHERE s.semestre_id = $2
                                AND h.ivd_id IS NULL`,
                                [grupo_id, semestreId]
            );
          }
        }
    }
}