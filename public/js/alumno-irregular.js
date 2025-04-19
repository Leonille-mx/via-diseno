function reagregarEventListeners() {
    document.querySelectorAll(".btn-eliminar").forEach((button) => {
        button.addEventListener("click", eliminar);
    });
    document.querySelectorAll(".btn-agregar").forEach((button) => {
        button.addEventListener("click", agregar);
    });
}

async function eliminar(event) {
    const button = event.currentTarget;
    const grupo_id = button.getAttribute("data-grupo-id");
    fetch(`/alumno-irregular/modificar-horario/eliminar-resultado`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }, 
        body: JSON.stringify({ 
            grupo_id: grupo_id
        })
    }).then((res) => {
        return res.json();
    }).then((data) => {
        // Para las materias seleccionadas
        let html_container_materias_seleccionadas = ``;
        for (let materia_resultado of data.materias_resultado) {
            html_container_materias_seleccionadas += `
                <div class="w-100 d-flex flex-column align-items-center rounded-5 mt-3" style="background-color: white;">
                    <div class="w-100 d-flex my-2">
                    <div class="d-flex m-0 align-items-center justify-content-center" style="width: 100%; padding-left: 10%;">`
            for (let i = 0; i < materia_resultado.dias.length; i++) { 
                html_container_materias_seleccionadas += `
                          <p class="m-0 me-2">
                            ${materia_resultado.hora_inicio[i].substring(0, 5)} - ${materia_resultado.hora_fin[i].substring(0, 5)}
                          </p>`;
                if (i !== materia_resultado.dias.length - 1) {
                    html_container_materias_seleccionadas += `
                            <p class="m-0 me-3 ivd-text-red">
                              (${materia_resultado.dias[i]})  
                            </p>`;
                } else { 
                    html_container_materias_seleccionadas += `
                            <p class="m-0 ivd-text-red">
                              (${materia_resultado.dias[i]})  
                            </p>`;
                }
            }
            html_container_materias_seleccionadas += `
                </div>
                     <div class="d-flex align-items-center justify-content-end" style="width: 10%;">`
            if (materia_resultado.obligatorio === false) {
                html_container_materias_seleccionadas += `
                            <button class="btn-eliminar btn btn-sm p-0 d-flex align-items-center justify-content-center me-3" 
                            style="
                            width: 1.3rem;
                            height: 1.3rem;
                            border-radius: 50%;
                            background-color: #84251c;
                            color: white;
                            border: none;
                            "
                            data-grupo-id="${materia_resultado.grupo_id}"
                            >
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
                                <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
                            </svg>
                            </button>`
            }
            html_container_materias_seleccionadas += `
                        </div>
                    </div>
                    <div class="ivd-bg-red w-100" style="height: 1px;"></div>
                    <p class="fw-semibold my-3">${materia_resultado.materia_nombre}</p>
                    <p class="mb-3">
                    Salon:`;
            if (materia_resultado.salon_numero === 9999) {
                html_container_materias_seleccionadas += `
                    No asignado | `;
            } else { 
                html_container_materias_seleccionadas += `
                    ${materia_resultado.salon_numero} | `;
            }
            html_container_materias_seleccionadas += `
                        ${materia_resultado.profesor_nombre} 
                        ${materia_resultado.profesor_primer_apellido}
                        ${materia_resultado.profesor_segundo_apellido}
                    </p>
                </div>`
        } 
        document.getElementById('materiasSeleccionadas').innerHTML = html_container_materias_seleccionadas;

        // Para las materias disponibles
        let html_container_materias_disponibles = ``;
        for (let materia_disponible of data.materias_disponibles) { 
            html_container_materias_disponibles += `
            <div class="w-100 d-flex flex-column align-items-center rounded-5 mt-3" style="background-color: white;">
                <div class="w-100 d-flex my-2">
                    <div class="d-flex m-0 align-items-center justify-content-center" style="width: 100%; padding-left: 10%;">`
            for (let i = 0; i < materia_disponible.dias.length; i++) { 
                html_container_materias_disponibles += `
                          <p class="m-0 me-2">
                            ${materia_disponible.hora_inicio[i].substring(0, 5)} - ${materia_disponible.hora_fin[i].substring(0, 5)}
                          </p>`;
                if (i !== materia_disponible.dias.length - 1) {
                    html_container_materias_disponibles += `
                            <p class="m-0 me-3 ivd-text-red">
                              (${materia_disponible.dias[i]})  
                            </p>`;
                } else { 
                    html_container_materias_disponibles += `
                            <p class="m-0 ivd-text-red">
                              (${materia_disponible.dias[i]})  
                            </p>`;
                }
            }
            html_container_materias_disponibles += `
            </div>
                <div class="d-flex align-items-center justify-content-end" style="width: 10%;">
                    <button class="btn-agregar btn btn-sm p-0 d-flex align-items-center justify-content-center me-3" 
                    style="
                        width: 1.3rem;
                        height: 1.3rem;
                        border-radius: 50%;
                        background-color: #84251c;
                        color: white;
                        border: none;
                    "
                    data-grupo-id="${materia_disponible.grupo_id}"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus" viewBox="0 0 16 16">
                        <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="ivd-bg-red w-100" style="height: 1px;"></div>
            <p class="fw-semibold my-3">${materia_disponible.materia_nombre}</p>
            <p class="mb-3">
                    Salon:`;
            if (materia_disponible.salon_numero === 9999) {
                html_container_materias_disponibles += `
                    No asignado | `;
            } else { 
                html_container_materias_disponibles += `
                    ${materia_disponible.salon_numero} | `;
            }
            html_container_materias_disponibles += `
                ${materia_disponible.profesor_nombre} 
                ${materia_disponible.profesor_primer_apellido}
                ${materia_disponible.profesor_segundo_apellido}
            </p>
            </div>`;
        }
        document.getElementById('materiasDisponibles').innerHTML = html_container_materias_disponibles;
        // Recargar la tabla del horario
        let html_container_tabla = ``;

        const colores = ['bg-primary-subtle', 'bg-success-subtle ','bg-warning-subtle ','bg-danger-subtle','bg-info-subtle'];
        const materiasColor = {};
        let colorIndex = 0;
        
        const horario = { 
          Lunes: {}, Martes: {}, Miércoles: {}, Jueves: {}, Viernes: {} 
        };
        
        if (typeof data.materias_resultado !== 'undefined' && Array.isArray(data.materias_resultado)) {
            data.materias_resultado.forEach(materia => {
            // Asignar color único por materia
            if (!materiasColor[materia.materia_nombre]) {
                if (materia.obligatorio === true) {
                  materiasColor[materia.materia_nombre] = 'bg-secondary';
                } else {
                  materiasColor[materia.materia_nombre] = colores[colorIndex % colores.length];
                  colorIndex++;
                }
            }
            
            let indexDia = 0;
            materia.dias.forEach(dia => {
              const diaNombre = dia.charAt(0).toUpperCase() + dia.slice(1).toLowerCase();
              
              const [hi, mi] = materia.hora_inicio[indexDia].split(':').map(Number);
              const [hf, mf] = materia.hora_fin[indexDia].split(':').map(Number);
              
              const inicioBloque = hi * 2 + (mi >= 30 ? 1 : 0);
              const finBloque = hf * 2 + (mf >= 30 ? 1 : 0);
              
              if (horario[diaNombre]) {
                horario[diaNombre][inicioBloque] = {
                  rowspan: finBloque - inicioBloque,
                  nombre: materia.materia_nombre,
                  color: materiasColor[materia.materia_nombre],
                  salon: materia.salon_numero,
                  profesor: `${materia.profesor_nombre} ${materia.profesor_primer_apellido}`,
                  hora: `${materia.hora_inicio[indexDia]} - ${materia.hora_fin[indexDia]}`
                };
                
                for (let b = inicioBloque + 1; b < finBloque; b++) {
                  horario[diaNombre][b] = 'ocupar';
                }
              }
              indexDia ++;
            });
          });
        }

        for (let bloque = 14; bloque < 32; bloque++) {
            const hora = Math.floor(bloque / 2);
            const minutos = bloque % 2 === 0 ? '00' : '30';
            let horaFormato;
            if (bloque % 2 !== 0) {
                horaFormato = `${hora}:${minutos} - ${hora + 1}:00`;
            } else {
                horaFormato = `${hora}:${minutos} - ${hora}:30`;
            }
          
            html_container_tabla += `
                <tr style="max-height: 1rem;">
                    <th class="hour-cell text-center align-middle">${horaFormato}</th>`;

            ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].forEach(dia => {
                if (horario[dia][bloque] === 'ocupar') return;
                if (horario[dia][bloque]) { 
                    const clase = horario[dia][bloque];
                    html_container_tabla += `
                        <td class="text-black text-center align-middle ${clase.color} p-0" 
                            rowspan="${clase.rowspan}"
                            data-bs-toggle="tooltip" 
                            data-bs-placement="top" `
                            if (clase.salon === 9999) {
                                html_container_tabla += `
                                    title="${clase.hora} | Salon: No asignado | Prof: ${clase.profesor}"`;
                            } else {
                                html_container_tabla += `
                                    title="${clase.hora} | Salon: ${clase.salon} | Prof: ${clase.profesor}"`;
                            }
                            html_container_tabla += `
                            style="height: 2rem">
                        ${clase.nombre}
                        </td>`;

                } else {
                    html_container_tabla +=`
                        <td class="empty-slot p-0" style="height: 2rem"></td>`;
                }
            })
            html_container_tabla += `
                </tr>`;
        }
        document.querySelector('.horario-body').innerHTML = html_container_tabla;
        // Reagregar los evenlisteners para que funcionen los botones
        reagregarEventListeners();
    }).catch((error) => {
        console.log(error);
    });
}

async function agregar(event) {
    const button = event.currentTarget;
    const grupo_id = button.getAttribute("data-grupo-id");
    fetch(`/alumno-irregular/modificar-horario/agregar-resultado`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }, 
        body: JSON.stringify({ 
            grupo_id: grupo_id
        })
    }).then((res) => {
        return res.json();
    }).then((data) => {
        // Para las materias seleccionadas
        let html_container_materias_seleccionadas = ``;
        for (let materia_resultado of data.materias_resultado) {
            html_container_materias_seleccionadas += `
                <div class="w-100 d-flex flex-column align-items-center rounded-5 mt-3" style="background-color: white;">
                    <div class="w-100 d-flex my-2">
                        <div class="d-flex m-0 align-items-center justify-content-center" style="width: 100%; padding-left: 10%;">`
            for (let i = 0; i < materia_resultado.dias.length; i++) { 
                html_container_materias_seleccionadas += `
                          <p class="m-0 me-2">
                            ${materia_resultado.hora_inicio[i].substring(0, 5)} - ${materia_resultado.hora_fin[i].substring(0, 5)}
                          </p>`;
                if (i !== materia_resultado.dias.length - 1) {
                    html_container_materias_seleccionadas += `
                            <p class="m-0 me-3 ivd-text-red">
                              (${materia_resultado.dias[i]})  
                            </p>`;
                } else { 
                    html_container_materias_seleccionadas += `
                            <p class="m-0 ivd-text-red">
                              (${materia_resultado.dias[i]})  
                            </p>`;
                }
            }
            html_container_materias_seleccionadas += `
                </div>
                    <div class="d-flex align-items-center justify-content-end" style="width: 10%;">`
            if (materia_resultado.obligatorio === false) {
                html_container_materias_seleccionadas += `
                            <button class="btn-eliminar btn btn-sm p-0 d-flex align-items-center justify-content-center me-3" 
                            style="
                            width: 1.3rem;
                            height: 1.3rem;
                            border-radius: 50%;
                            background-color: #84251c;
                            color: white;
                            border: none;
                            "
                            data-grupo-id="${materia_resultado.grupo_id}"
                            >
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
                                <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
                            </svg>
                            </button>`
            }
            html_container_materias_seleccionadas += `
                        </div>
                    </div>
                    <div class="ivd-bg-red w-100" style="height: 1px;"></div>
                    <p class="fw-semibold my-3">${materia_resultado.materia_nombre}</p>
                    <p class="mb-3">
                    Salon:`;
            if (materia_resultado.salon_numero === 9999) {
                html_container_materias_seleccionadas += `
                    No asignado | `;
            } else { 
                html_container_materias_seleccionadas += `
                    ${materia_resultado.salon_numero} | `;
            }
            html_container_materias_seleccionadas += `
                        ${materia_resultado.profesor_nombre} 
                        ${materia_resultado.profesor_primer_apellido}
                        ${materia_resultado.profesor_segundo_apellido}
                    </p>
                </div>`
        } 
        document.getElementById('materiasSeleccionadas').innerHTML = html_container_materias_seleccionadas;

        // Para las materias disponibles
        let html_container_materias_disponibles = ``;
        for (let materia_disponible of data.materias_disponibles) { 
            html_container_materias_disponibles += `
            <div class="w-100 d-flex flex-column align-items-center rounded-5 mt-3" style="background-color: white;">
            <div class="w-100 d-flex my-2">
                <div class="d-flex m-0 align-items-center justify-content-center" style="width: 100%; padding-left: 10%;">`;
            for (let i = 0; i < materia_disponible.dias.length; i++) { 
                html_container_materias_disponibles += `
                          <p class="m-0 me-2">
                            ${materia_disponible.hora_inicio[i].substring(0, 5)} - ${materia_disponible.hora_fin[i].substring(0, 5)}
                          </p>`;
                if (i !== materia_disponible.dias.length - 1) {
                    html_container_materias_disponibles += `
                            <p class="m-0 me-3 ivd-text-red">
                              (${materia_disponible.dias[i]})  
                            </p>`;
                } else { 
                    html_container_materias_disponibles += `
                            <p class="m-0 ivd-text-red">
                              (${materia_disponible.dias[i]})  
                            </p>`;
                }
            }
            html_container_materias_disponibles += `
                      </div>
                <div class="d-flex align-items-center justify-content-end" style="width: 10%;">
                    <button class="btn-agregar btn btn-sm p-0 d-flex align-items-center justify-content-center me-3" 
                    style="
                        width: 1.3rem;
                        height: 1.3rem;
                        border-radius: 50%;
                        background-color: #84251c;
                        color: white;
                        border: none;
                    "
                    data-grupo-id="${materia_disponible.grupo_id}"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus" viewBox="0 0 16 16">
                        <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="ivd-bg-red w-100" style="height: 1px;"></div>
            <p class="fw-semibold my-3">${materia_disponible.materia_nombre}</p>
            <p class="mb-3">
                    Salon:`;
            if (materia_disponible.salon_numero === 9999) {
                html_container_materias_disponibles += `
                    No asignado | `;
            } else { 
                html_container_materias_disponibles += `
                    ${materia_disponible.salon_numero} | `;
            }
            html_container_materias_disponibles += `
                ${materia_disponible.profesor_nombre} 
                ${materia_disponible.profesor_primer_apellido}
                ${materia_disponible.profesor_segundo_apellido}
            </p>
            </div>`;
        }
        document.getElementById('materiasDisponibles').innerHTML = html_container_materias_disponibles;
        // Recargar la tabla del horario
        let html_container_tabla = ``;

        const colores = ['bg-primary-subtle', 'bg-success-subtle ','bg-warning-subtle ','bg-danger-subtle','bg-info-subtle'];
        const materiasColor = {};
        let colorIndex = 0;
        
        const horario = { 
          Lunes: {}, Martes: {}, Miércoles: {}, Jueves: {}, Viernes: {} 
        };
        
        if (typeof data.materias_resultado !== 'undefined' && Array.isArray(data.materias_resultado)) {
            data.materias_resultado.forEach(materia => {
            // Asignar color único por materia
            if (!materiasColor[materia.materia_nombre]) {
                if (materia.obligatorio === true) {
                  materiasColor[materia.materia_nombre] = 'bg-secondary';
                } else {
                  materiasColor[materia.materia_nombre] = colores[colorIndex % colores.length];
                  colorIndex++;
                }
            }
            
            let indexDia = 0;
            materia.dias.forEach(dia => {
              const diaNombre = dia.charAt(0).toUpperCase() + dia.slice(1).toLowerCase();
              
              const [hi, mi] = materia.hora_inicio[indexDia].split(':').map(Number);
              const [hf, mf] = materia.hora_fin[indexDia].split(':').map(Number);
              
              const inicioBloque = hi * 2 + (mi >= 30 ? 1 : 0);
              const finBloque = hf * 2 + (mf >= 30 ? 1 : 0);
              
              if (horario[diaNombre]) {
                horario[diaNombre][inicioBloque] = {
                  rowspan: finBloque - inicioBloque,
                  nombre: materia.materia_nombre,
                  color: materiasColor[materia.materia_nombre],
                  salon: materia.salon_numero,
                  profesor: `${materia.profesor_nombre} ${materia.profesor_primer_apellido}`,
                  hora: `${materia.hora_inicio[indexDia]} - ${materia.hora_fin[indexDia]}`
                };
                
                for (let b = inicioBloque + 1; b < finBloque; b++) {
                  horario[diaNombre][b] = 'ocupar';
                }
              }
              indexDia ++;
            });
          });
        }

        for (let bloque = 14; bloque < 32; bloque++) {
            const hora = Math.floor(bloque / 2);
            const minutos = bloque % 2 === 0 ? '00' : '30';
            let horaFormato;
            if (bloque % 2 !== 0) {
                horaFormato = `${hora}:${minutos} - ${hora + 1}:00`;
            } else {
                horaFormato = `${hora}:${minutos} - ${hora}:30`;
            }
          
            html_container_tabla += `
                <tr style="max-height: 1rem;">
                    <th class="hour-cell text-center align-middle">${horaFormato}</th>`;

            ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].forEach(dia => {
                if (horario[dia][bloque] === 'ocupar') return;
                if (horario[dia][bloque]) { 
                    const clase = horario[dia][bloque];
                    html_container_tabla += `
                        <td class="text-black text-center align-middle ${clase.color} p-0" 
                            rowspan="${clase.rowspan}"
                            data-bs-toggle="tooltip" 
                            data-bs-placement="top" `
                            if (clase.salon === 9999) {
                                html_container_tabla += `
                                    title="${clase.hora} | Salon: No asignado | Prof: ${clase.profesor}"`;
                            } else {
                                html_container_tabla += `
                                    title="${clase.hora} | Salon: ${clase.salon} | Prof: ${clase.profesor}"`;
                            }
                            html_container_tabla += `
                            style="height: 2rem">
                        ${clase.nombre}
                        </td>`;

                } else {
                    html_container_tabla +=`
                        <td class="empty-slot p-0" style="height: 2rem"></td>`;
                }
            })
            html_container_tabla += `
                </tr>`;
        }
        document.querySelector('.horario-body').innerHTML = html_container_tabla;
        // Reagregar los evenlisteners para que funcionen los botones
        reagregarEventListeners();
    }).catch((error) => {
        console.log(error);
    });
}

// Cuando se elimina una materia selccionada
document.querySelectorAll(".btn-eliminar").forEach((button) => {
    button.addEventListener("click", eliminar);
});

// Cuando se agrega una materia disponible
document.querySelectorAll(".btn-agregar").forEach((button) => {
    button.addEventListener("click", agregar);
});