const pool = require('../util/database');

module.exports = class GenerarGruposGA {
    constructor({
        popSize = 100,
        generations = 100,
        crossoverRate = 0.8,
        mutationRate = 0.04,
        eliteRatio = 0.2,
        tournamentSize = 5,
        greedyRatio = 0.2,
        stagnationThreshold = 50,
        maxMutationRate = 0.2,
        localSearchIters = 5,
        restartRatio = 0.1,
        dynamicEliteMax = 0.3
    } = {}) {
        this.popSize = popSize;
        this.generations = generations;
        this.crossoverRate = crossoverRate;
        this.baseMutationRate = mutationRate;
        this.mutationRate = mutationRate;
        this.maxMutationRate = maxMutationRate;

        this.baseEliteRatio = eliteRatio;
        this.eliteRatio = eliteRatio;
        this.dynamicEliteMax = dynamicEliteMax;
        this.eliteCount = Math.max(1, Math.floor(this.popSize * this.eliteRatio));

        this.tournamentSize = tournamentSize;
        this.greedyRatio = greedyRatio;
        this.stagnationThreshold = stagnationThreshold;
        this.localSearchIters = localSearchIters;
        this.restartRatio = restartRatio;

        this.materias = [];
        this.profesorMaterias = {};
        this.profesorHorarios = {};
        this.bloquesNecesariosMap = {};
        this.population = [];
        this.bestIndividual = null;
        this.unassignedMaterias = [];

        this.metrics = {
            bestFitnessPerGen: [],
            avgFitnessPerGen: [],
            noImprovementStreak: []
        };
    }

  async loadData(carrera_id, client = pool) {
    await client.query(`
    DELETE FROM grupo_bloque_tiempo gbt
    USING grupo g
    JOIN plan_materia pm ON g.materia_id = pm.materia_id
    JOIN plan_estudio pe  ON pm.plan_estudio_id = pe.plan_estudio_id
    WHERE gbt.grupo_id = g.grupo_id
        AND pe.carrera_id = $1
    `, [carrera_id]);

    await client.query(`
    DELETE FROM resultado_inscripcion ri
    USING grupo g
    JOIN plan_materia pm ON g.materia_id = pm.materia_id
    JOIN plan_estudio pe  ON pm.plan_estudio_id = pe.plan_estudio_id
    WHERE ri.grupo_id = g.grupo_id
        AND pe.carrera_id = $1
    `, [carrera_id]);

    await client.query(`
    DELETE FROM grupo g
    USING plan_materia pm
    JOIN plan_estudio pe ON pm.plan_estudio_id = pe.plan_estudio_id
    WHERE g.materia_id = pm.materia_id
        AND pe.carrera_id = $1
    `, [carrera_id]);

    // 1) Traer materias con su carrera y semestres
    const mRes = await client.query(`
      SELECT 
        m.materia_id, 
        m.sep_id, 
        m.horas_profesor, 
        ms.semestre_id,
        c.carrera_id
      FROM materia m
      JOIN materia_semestre ms 
        ON m.materia_id = ms.materia_id
      JOIN plan_materia pm 
        ON m.materia_id = pm.materia_id
      JOIN plan_estudio pe 
        ON pm.plan_estudio_id = pe.plan_estudio_id
       AND pm.plan_estudio_version = pe.version
      JOIN carrera c 
        ON pe.carrera_id = c.carrera_id
      WHERE c.carrera_id = $1
    `, [ carrera_id ]);

    // 2) Traer asignaciones profesor→materia
    const pmRes = await client.query(`
      SELECT materia_id, profesor_id FROM profesor_materia
    `);

    // 3) Traer todos los bloques disponibles por profesor
    const phRes = await client.query(`
      SELECT profesor_id, bloque_tiempo_id FROM profesor_bloque_tiempo
    `);

    // 4) Traer los bloques ya usados en grupos
    const usedRes = await client.query(`
      SELECT g.profesor_id, gbt.bloque_tiempo_id
      FROM grupo_bloque_tiempo gbt
      JOIN grupo g 
        ON gbt.grupo_id = g.grupo_id
    `);

    // 5) Construir map de materias (agrupa semestres)
    const mapMat = {};
    mRes.rows.forEach(r => {
      if (!mapMat[r.materia_id]) {
        mapMat[r.materia_id] = {
          materia_id: r.materia_id,
          sep_id:     r.sep_id,
          horas_profesor: r.horas_profesor,
          semestres: [],
        };
      }
      if (!mapMat[r.materia_id].semestres.includes(r.semestre_id)) {
        mapMat[r.materia_id].semestres.push(r.semestre_id);
      }
    });
    this.materias = Object.values(mapMat);

    // 6) Horas necesarias en bloques (2 por hora de clase)
    this.materias.forEach(m => {
      this.bloquesNecesariosMap[m.materia_id] = m.horas_profesor * 2;
    });

    // 7) Profesor→Materias
    pmRes.rows.forEach(r => {
      this.profesorMaterias[r.materia_id] =
        this.profesorMaterias[r.materia_id] || [];
      this.profesorMaterias[r.materia_id].push(r.profesor_id);
    });

    // 8) Profesor→Bloques *disponibles* = todos menos los usados
    //    construimos un set de usados por profesor
    const usadosPorProf = {};
    usedRes.rows.forEach(r => {
      usadosPorProf[r.profesor_id] = usadosPorProf[r.profesor_id] || new Set();
      usadosPorProf[r.profesor_id].add(r.bloque_tiempo_id);
    });

    phRes.rows.forEach(r => {
      const usados = usadosPorProf[r.profesor_id] || new Set();
      // sólo metemos si NO está en usados
      if (!usados.has(r.bloque_tiempo_id)) {
        this.profesorHorarios[r.profesor_id] =
          this.profesorHorarios[r.profesor_id] || [];
        this.profesorHorarios[r.profesor_id].push(r.bloque_tiempo_id);
      }
    });
  }


    createGreedyIndividual() {
        const ind = this.materias.map(mat => {
            const profs = this.profesorMaterias[mat.materia_id] || [];
            const profesor = profs.length
                ? profs.reduce((a, b) => ((this.profesorHorarios[a] || []).length >= (this.profesorHorarios[b] || []).length ? a : b))
                : null;
            const disp = this.profesorHorarios[profesor] || [];
            const k = this.bloquesNecesariosMap[mat.materia_id];
            const bloques = this.randomBloquesConsecutivos(disp, k);
            return { materia_id: mat.materia_id, sep_id: mat.sep_id, profesor, bloques, semestres: mat.semestres };
        });
        return this.repairIndividual(ind);
    }

    createIndividual() {
        const ind = this.materias.map(mat => {
            const profs = this.profesorMaterias[mat.materia_id] || [];
            const profesor = profs[Math.floor(Math.random() * profs.length)] || null;
            const disp = this.profesorHorarios[profesor] || [];
            const k = this.bloquesNecesariosMap[mat.materia_id];
            const bloques = this.randomBloquesConsecutivos(disp, k);
            return { materia_id: mat.materia_id, sep_id: mat.sep_id, profesor, bloques, semestres: mat.semestres };
        });
        return this.repairIndividual(ind);
    }

    repairIndividual(ind) {
        const usedProf = {};
        const usedSem = {};
        const repaired = [];

        for (const g of ind) {
            const k = this.bloquesNecesariosMap[g.materia_id];
            let profesor = g.profesor;
            let bloques = g.bloques;

            const profs = this.profesorMaterias[g.materia_id] || [];
            const validProf = profs.includes(profesor);
            const validBlocks = Array.isArray(bloques) && bloques.length === k && this.validarSesion(bloques);
            const noOverlap = validBlocks && bloques.every(b => {
                const profConflict = usedProf[profesor] && usedProf[profesor].has(b);
                const semConflict = g.semestres.some(s => usedSem[s] && usedSem[s].has(b));
                return !profConflict && !semConflict;
            });

            if (!validProf || !noOverlap) {
                let best = null;
                let bestFree = [];
                for (const p of profs) {
                    const disp = this.profesorHorarios[p] || [];
                    if (!usedProf[p]) usedProf[p] = new Set();
                    const free = disp.filter(b => !usedProf[p].has(b) && !g.semestres.some(s => usedSem[s] && usedSem[s].has(b)));
                    if (free.length >= k && free.length > bestFree.length) {
                        best = p;
                        bestFree = free;
                    }
                }
                profesor = best;
                bloques = profesor ? this.randomBloquesConsecutivos(bestFree, k) : [];
            }

            if (profesor && bloques.length === k && this.validarSesion(bloques) && bloques.every(b => {
                const profConflict = usedProf[profesor] && usedProf[profesor].has(b);
                const semConflict = g.semestres.some(s => usedSem[s] && usedSem[s].has(b));
                return !profConflict && !semConflict;
            })) {
                if (!usedProf[profesor]) usedProf[profesor] = new Set();
                bloques.forEach(b => usedProf[profesor].add(b));
                for (const s of g.semestres) {
                    if (!usedSem[s]) usedSem[s] = new Set();
                    bloques.forEach(b => usedSem[s].add(b));
                }
            } else {
                profesor = null;
                bloques = [];
            }

            repaired.push({ ...g, profesor, bloques });
        }
        return repaired;
    }

    randomBloquesConsecutivos(disponibilidad, k) {
        // Genera segmentos consecutivos agrupados por día
        const segmentos = [];
        const byDay = disponibilidad.reduce((acc, b) => {
            const day = Math.floor((b - 1) / 24);
            (acc[day] = acc[day] || []).push(b);
            return acc;
        }, {});

        for (const day in byDay) {
            const bloques = byDay[day].sort((a, b) => a - b);
            for (let i = 0; i < bloques.length; i++) {
                const seq = [bloques[i]];
                for (let j = i + 1; j < bloques.length && bloques[j] === bloques[j - 1] + 1; j++) seq.push(bloques[j]);
                if (seq.length >= 2) segmentos.push({ day: parseInt(day), seq });
            }
        }

        segmentos.sort(() => 0.5 - Math.random());
        const result = [];
        let sum = 0;
        const usedDays = new Set();

        for (const { day, seq } of segmentos) {
            if (usedDays.has(day)) continue;
            if (sum + seq.length <= k) {
                result.push(...seq);
                sum += seq.length;
                usedDays.add(day);
                if (sum === k) break;
            }
        }

        if (sum < k) {
            const singles = [...new Set(disponibilidad)].sort(() => 0.5 - Math.random());
            for (const b of singles) {
                const day = Math.floor((b - 1) / 24);
                if (usedDays.has(day)) continue;
                if (!result.includes(b)) {
                    result.push(b);
                    sum++;
                }
                if (sum === k) break;
            }
        }

        return result;
    }

    fitness(ind) {
        let score = 0;
        const usedProf = {}, usedSem = {};
        ind.forEach(g => {
            const k = this.bloquesNecesariosMap[g.materia_id];
            if (!g.profesor || g.bloques.length !== k || !this.validarSesion(g.bloques)) return;
            let conflict = false;
            usedProf[g.profesor] = usedProf[g.profesor] || new Set();
            for (const b of g.bloques) if (usedProf[g.profesor].has(b)) { conflict = true; break; }
            for (const s of g.semestres) {
                usedSem[s] = usedSem[s] || new Set();
                for (const b of g.bloques) if (usedSem[s].has(b)) conflict = true;
            }
            if (!conflict) {
                score++;
                g.bloques.forEach(b => { usedProf[g.profesor].add(b); g.semestres.forEach(s => usedSem[s].add(b)); });
            }
        });
        return score;
    }

    validarSesion(bloques) {
        if (!Array.isArray(bloques) || bloques.length < 2) return false;

        // Agrupa por día y asegura un solo segmento mínimo de longitud ≥2 por día
        const byDay = bloques.reduce((acc, b) => {
            const d = Math.floor((b - 1) / 24);
            (acc[d] = acc[d] || []).push(b);
            return acc;
        }, {});

        for (const day in byDay) {
            const arr = byDay[day].sort((a, b) => a - b);
            let segments = 0;
            let run = 1;

            for (let i = 1; i < arr.length; i++) {
                if (arr[i] === arr[i - 1] + 1) {
                    run++;
                } else {
                    if (run < 2) return false;
                    segments++;
                    run = 1;
                }
            }
            if (run < 2) return false;
            segments++;

            if (segments > 1) return false;
        }

        return true;
    }

    selectParent() {
        let best = null;
        for (let i = 0; i < this.tournamentSize; i++) {
            const ind = this.population[Math.floor(Math.random() * this.popSize)];
            if (!best || this.fitness(ind) > this.fitness(best)) best = ind;
        }
        return best;
    }

    crossover(p1, p2) {
        return p1.map((g, i) => (Math.random() < this.crossoverRate ? { ...g } : { ...p2[i] }));
    }

    mutate(ind) {
        const mutated = ind.map(g => {
            const newGene = { ...g };
            if (Math.random() < this.mutationRate) {
                const profs = this.profesorMaterias[newGene.materia_id] || [];
                newGene.profesor = profs[Math.floor(Math.random() * profs.length)];
            }
            if (Math.random() < this.mutationRate) {
                const disp = this.profesorHorarios[newGene.profesor] || [];
                const k = this.bloquesNecesariosMap[newGene.materia_id];
                newGene.bloques = this.randomBloquesConsecutivos(disp, k);
            }
            return newGene;
        });
        return this.repairIndividual(mutated);
    }

    hillClimb(ind) {
        let best = ind;
        let bestFit = this.fitness(ind);
        for (let i = 0; i < this.localSearchIters; i++) {
            const candidate = best.map(g => ({ ...g }));
            const idx1 = Math.floor(Math.random() * candidate.length);
            const idx2 = Math.floor(Math.random() * candidate.length);
            [candidate[idx1].profesor, candidate[idx2].profesor] = [candidate[idx2].profesor, candidate[idx1].profesor];
            const fit1 = this.fitness(candidate);
            if (fit1 > bestFit) { best = candidate; bestFit = fit1; continue; }
            const idx = Math.floor(Math.random() * candidate.length);
            const gene = candidate[idx];
            const disp = this.profesorHorarios[gene.profesor] || [];
            const k = this.bloquesNecesariosMap[gene.materia_id];
            gene.bloques = this.randomBloquesConsecutivos(disp, k);
            const fit2 = this.fitness(candidate);
            if (fit2 > bestFit) { best = candidate; bestFit = fit2; }
        }
        return this.repairIndividual(best);
    }

    async run(carrera_id) {
        await this.loadData(carrera_id);
        const start = Date.now();
        const limit = 10 * 60 * 1000;
        this.bestIndividual = null;

        const greedyCount = Math.floor(this.popSize * this.greedyRatio);
        this.population = [];
        for (let i = 0; i < greedyCount; i++) this.population.push(this.createGreedyIndividual());
        for (let i = greedyCount; i < this.popSize; i++) this.population.push(this.createIndividual());

        let noImprovementCount = 0;
        let prevBestFitness = -Infinity;
        let genCount = 0;

        while (Date.now() - start < limit && genCount < this.generations) {
            this.population.sort((a, b) => this.fitness(b) - this.fitness(a));
            const currentBest = this.fitness(this.population[0]);
            const avgFitness = this.population.reduce((s, ind) => s + this.fitness(ind), 0) / this.popSize;

            if (currentBest > prevBestFitness) {
                prevBestFitness = currentBest;
                noImprovementCount = 0;
                this.mutationRate = this.baseMutationRate;
                this.eliteRatio = this.baseEliteRatio;
            } else {
                noImprovementCount++;
            }
            if (noImprovementCount > this.stagnationThreshold/2) {
                this.eliteRatio = Math.min(this.dynamicEliteMax, this.baseEliteRatio * 1.5);
            }
            this.eliteCount = Math.max(1, Math.floor(this.popSize * this.eliteRatio));
            if (noImprovementCount > this.stagnationThreshold) {
                this.mutationRate = Math.min(this.mutationRate * 2, this.maxMutationRate);
            }

            this.metrics.bestFitnessPerGen.push(currentBest);
            this.metrics.avgFitnessPerGen.push(avgFitness);
            this.metrics.noImprovementStreak.push(noImprovementCount);

            console.log(`Gen ${genCount}: best=${currentBest}, avg=${avgFitness.toFixed(2)}, noImp=${noImprovementCount}, mut=${this.mutationRate.toFixed(3)}, elite=${this.eliteRatio.toFixed(2)}`);

            if (!this.bestIndividual || currentBest > this.fitness(this.bestIndividual)) {
                this.bestIndividual = this.population[0];
                if (currentBest === this.materias.length) break;
            }

            if (noImprovementCount > this.stagnationThreshold * 2) {
                const reinits = Math.floor(this.popSize * this.restartRatio);
                for (let i = 0; i < reinits; i++) {
                    this.population[this.popSize - 1 - i] = this.createIndividual();
                }
            }

            const elites = this.population.slice(0, this.eliteCount);
            const newPop = [...elites];
            while (newPop.length < this.popSize && Date.now() - start < limit) {
                const p1 = this.selectParent();
                const p2 = this.selectParent();
                let child = Math.random() < this.crossoverRate ? this.crossover(p1, p2) : [...p1];
                child = this.mutate(child);
                child = this.hillClimb(child);
                newPop.push(child);
            }
            this.population = newPop;
            genCount++;
        }

        this.unassignedMaterias = this.bestIndividual
            .filter(g => !g.profesor || !this.validarSesion(g.bloques) || g.bloques.length !== this.bloquesNecesariosMap[g.materia_id])
            .map(g => g.sep_id);

        return { best: this.bestIndividual, unassigned: this.unassignedMaterias, metrics: this.metrics };
    }

    async saveResult(resultado, carrera_id, client = pool) {
        const { best } = resultado;
        await client.query('BEGIN');
        try {
        const asigns = [];
            for (const g of best) {
                if (!g.profesor || !this.validarSesion(g.bloques)) continue;
                const rId = await client.query(`SELECT COALESCE(MAX(grupo_id),0)+1 AS id FROM grupo`);
                const newId = rId.rows[0].id;
                await client.query(
                    `INSERT INTO grupo (grupo_id, materia_id, profesor_id, salon_id, ciclo_escolar_id)
                     VALUES ($1,$2,$3,9999,(SELECT ciclo_escolar_id FROM ciclo_escolar ORDER BY fecha_fin DESC LIMIT 1))`,
                    [newId, g.materia_id, g.profesor]
                );
                const vals = g.bloques.map((_, i) => `($1, $${i+2})`).join(',');
                await client.query(
                    `INSERT INTO grupo_bloque_tiempo (grupo_id, bloque_tiempo_id) VALUES ${vals}`,
                    [newId, ...g.bloques]
                );
                asigns.push({ grupo_id: newId, materia_id: g.materia_id, semestres: g.semestres });
            }
            for (const a of asigns) {
                for (const sem of a.semestres) {
                    await client.query(
                    `INSERT INTO resultado_inscripcion (alumno_id, grupo_id, obligatorio, seleccionado)
                     SELECT al.ivd_id, $1, true, true
                       FROM alumno al
                       JOIN semestre s 
                         ON al.semestre = s.numero
                       JOIN plan_estudio p 
                         ON al.plan_estudio_id = p.plan_estudio_id
                       LEFT JOIN historial_academico h 
                         ON h.ivd_id = al.ivd_id 
                        AND h.materia_id = $2 
                        AND h.aprobado = true
                      WHERE s.semestre_id = $3
                        AND p.carrera_id = $4
                        AND h.ivd_id IS NULL`,
                    [a.grupo_id, a.materia_id, sem, carrera_id]
                    );
                }
            }
            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        }
    }
};
