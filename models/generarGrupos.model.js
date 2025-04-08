const pool = require('../util/database');

module.exports = class generarGrupos {

    // Obtiene las materias abiertas para las que deben generarse grupos
    static async getMateriasAbiertas() {
        return pool.query(`SELECT * FROM materia m, materia_semestre ms
                            WHERE m.materia_id = ms.materia_id`);
    }

    // Obtiene la relación materia-profesor y la devuelve como un objeto:
    // { materia_id: [profesor_id, ...], ... }
    static async getProfesorMaterias() {
        const result = await pool.query(`SELECT * FROM profesor_materia`);
        const mapping = {};
        result.rows.forEach(row => {
            if (!mapping[row.materia_id]) mapping[row.materia_id] = [];
            mapping[row.materia_id].push(row.profesor_id);
        });
        return mapping;
    }

    // Obtiene la disponibilidad de todos los profesores en una sola consulta.
    // Devuelve un objeto: { profesor_id: [bloque_tiempo_id, ...], ... }
    static async getProfesorHorarios() {
        const result = await pool.query(`SELECT * FROM profesor_bloque_tiempo`);
        const mapping = {};
        result.rows.forEach(row => {
            if (!mapping[row.profesor_id]) mapping[row.profesor_id] = [];
            mapping[row.profesor_id].push(row.bloque_tiempo_id);
        });
        return mapping;
    }

    // Obtiene todos los salones disponibles
    static async getSalonesDisponibles() {
        return pool.query('SELECT * FROM salon');
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

    // Genera todas las combinaciones de k elementos a partir del arreglo "disponibilidad",
    // pero sólo conserva aquellas combinaciones en las que, para cada día, 
    // si se selecciona un bloque, éstos vienen en secuencias de al menos dos (sesión mínima de 1 hora).
    static generarCombinaciones(disponibilidad, k) {
        let resultados = [];
        function backtrack(start, comb) {
            if (comb.length === k) {
                if (generarGrupos.validarSesion(comb, 24)) {
                    resultados.push([...comb]);
                }
            return;
            }
            for (let i = start; i < disponibilidad.length; i++) {
                comb.push(disponibilidad[i]);
                backtrack(i + 1, comb);
                comb.pop();
            }
        }
        backtrack(0, []);
        return resultados;
    } 

    // Valida que la asignación de bloques para un grupo no genere conflictos:
    // - Dos grupos con el mismo profesor no pueden tener bloques en común.
    // - Dos grupos en el mismo salón no pueden tener bloques en común.
    // - Dos grupos del mismo semestre (ciclo escolar) no pueden tener bloques en común.
    static validarRestricciones(asignacion, profesor, salon, gruposAsignados, semestres) {
        for (let grupo of gruposAsignados) {
            // Verificar conflicto de profesor
            if (grupo.profesor_id === profesor) {
                if (grupo.bloques.some(b => asignacion.includes(b))) return false;
            }
            // Verificar conflicto de salón
            if (grupo.salon_id === salon) {
                if (grupo.bloques.some(b => asignacion.includes(b))) return false;
            }
            // Verificar conflicto en los semestres involucrados
            if (grupo.semestres.some(s => semestres.includes(s))) {
                if (grupo.bloques.some(b => asignacion.includes(b))) return false;
            }
        }
        // Además, se valida que la sesión sea correcta en cada día
        return generarGrupos.validarSesion(asignacion, 24);
    }

    // Inserta un grupo en la tabla "grupo" y retorna el grupo_id generado
    static async saveGrupo(grupo) {
        // Obtener el máximo grupo_id actual (si no hay registros, se usa 0)
        const resultMax = await pool.query(`SELECT COALESCE(MAX(grupo_id), 0) AS max_id FROM grupo`);
        const newId = resultMax.rows[0].max_id + 1;
        
        // Insertar el grupo con el nuevo id
        return pool.query(
            `INSERT INTO grupo (grupo_id, materia_id, profesor_id, salon_id, ciclo_escolar_id)
            VALUES ($1, $2, $3, $4, $5) RETURNING grupo_id`,
            [newId, grupo.materia_id, grupo.profesor_id, grupo.salon_id, 6]
        );
    }

    // Inserta la asignación de bloques en la tabla "grupo_horario"
    static async saveGrupoHorario(grupo_id, bloques) {
        if (!bloques.every(b => Number.isInteger(b))) throw new Error(error);
        const values = bloques.map((_, i) => `($1, $${i + 2})`).join(', ');
        return pool.query(`INSERT INTO grupo_bloque_tiempo (grupo_id, bloque_tiempo_id)
                           VALUES ${values}`, [grupo_id, ...bloques]);
    }   

    // Elimina el horario de un grupo de la base de datos
    static async deleteGrupoHorario(grupo_id) {
        return pool.query(`DELETE FROM grupo_bloque_tiempo WHERE grupo_id = $1`, [grupo_id]);
    }

    // Elimina un grupo de la base de datos
    static async deleteGrupo(grupo_id) {
        return pool.query(`DELETE FROM grupo WHERE grupo_id = $1`, [grupo_id]);
    }

    // Elimina los grupos asignados a los alumnos
    static async deleteResultadoInscripcion() {
        return pool.query(`DELETE FROM resultado_inscripcion`);
    }

    // Elimina todos los horarios asignados a los grupos
    static async deleteAllGruposBloqueTiempo() {
        return pool.query(`DELETE FROM grupo_bloque_tiempo`);
    }

    // Elimina todos los grupos
    static async deleteAllGrupos() {
        return pool.query(`DELETE FROM grupo`);
    }
}