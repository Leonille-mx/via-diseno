let semestre = 'semestre';
// Cuando se presiona un elemento del dropdown
document.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', function () {
        semestre = this.getAttribute("data-semestre");
        fetch(`/alumno-irregular/modificar-horario/materias-disponibles/${semestre}`, {
            method: 'GET',
        }).then((res) => { 
            return res.json(); 
        }).then((data) => {
            if (semestre == 's1') {
                document.getElementById('btnSemestre').innerHTML = '1°ro';
            } else if (semestre == 's2') {
                document.getElementById('btnSemestre').innerHTML = '2°do';
            } else if (semestre == 's3') {
                document.getElementById('btnSemestre').innerHTML = '3°ro';
            } else if (semestre == 's4') {
                document.getElementById('btnSemestre').innerHTML = '4°to';
            } else if (semestre == 's5') {
                document.getElementById('btnSemestre').innerHTML = '5°to';
            } else if (semestre == 's6') {
                document.getElementById('btnSemestre').innerHTML = '6°to';
            } else if (semestre == 's7') {
                document.getElementById('btnSemestre').innerHTML = '7°mo';
            } else if (semestre == 's8') {
                document.getElementById('btnSemestre').innerHTML = '8°vo';
            } else if (semestre == 's9') {
                document.getElementById('btnSemestre').innerHTML = '9°no';
            } else if (semestre == 'semestre') {
                document.getElementById('btnSemestre').innerHTML = 'Semestre';
            }
            let html_container = ``;
            for (let materia_disponible of data.materias_disponibles) { 
                html_container += `
                <div class="w-100 d-flex flex-column align-items-center rounded-5 mt-3" style="background-color: white;">
                  <div class="w-100 d-flex my-2">
                    <div class="d-flex m-0 align-items-center justify-content-center" style="width: 100%; padding-left: 10%;">
                      <p class="m-0 me-3">${materia_disponible.hora_inicio} - ${materia_disponible.hora_fin}</p>
                      <p class="m-0 ivd-text-red">(${materia_disponible.dias.join(', ')})</p>
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
                    Salon 
                    ${materia_disponible.salon_numero} | 
                    ${materia_disponible.profesor_nombre} 
                    ${materia_disponible.profesor_primer_apellido}
                    ${materia_disponible.profesor_segundo_apellido}
                  </p>
                </div>`;
            }
            document.getElementById('materiasDisponibles').innerHTML = html_container;
            // Reagregar los evenlisteners para que funcionen los botones
            reagregarEventListeners();
        }).catch((error) => {
            console.log(error);
        });
    });
});

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
            grupo_id: grupo_id, 
            semestre: semestre 
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
                        <div class="d-flex m-0 align-items-center justify-content-center" style="width: 100%; padding-left: 10%;">
                        <p class="m-0 me-3">${materia_resultado.hora_inicio} - ${materia_resultado.hora_fin}</p>
                        <p class="m-0 ivd-text-red">(${materia_resultado.dias.join(', ')})</p>
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
                        Salon 
                        ${materia_resultado.salon_numero} | 
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
                <div class="d-flex m-0 align-items-center justify-content-center" style="width: 100%; padding-left: 10%;">
                <p class="m-0 me-3">${materia_disponible.hora_inicio} - ${materia_disponible.hora_fin}</p>
                <p class="m-0 ivd-text-red">(${materia_disponible.dias.join(', ')})</p>
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
                Salon 
                ${materia_disponible.salon_numero} | 
                ${materia_disponible.profesor_nombre} 
                ${materia_disponible.profesor_primer_apellido}
                ${materia_disponible.profesor_segundo_apellido}
            </p>
            </div>`;
        }
        document.getElementById('materiasDisponibles').innerHTML = html_container_materias_disponibles;
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
            grupo_id: grupo_id, 
            semestre: semestre 
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
                        <div class="d-flex m-0 align-items-center justify-content-center" style="width: 100%; padding-left: 10%;">
                        <p class="m-0 me-3">${materia_resultado.hora_inicio} - ${materia_resultado.hora_fin}</p>
                        <p class="m-0 ivd-text-red">(${materia_resultado.dias.join(', ')})</p>
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
                        Salon 
                        ${materia_resultado.salon_numero} | 
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
                <div class="d-flex m-0 align-items-center justify-content-center" style="width: 100%; padding-left: 10%;">
                <p class="m-0 me-3">${materia_disponible.hora_inicio} - ${materia_disponible.hora_fin}</p>
                <p class="m-0 ivd-text-red">(${materia_disponible.dias.join(', ')})</p>
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
                Salon 
                ${materia_disponible.salon_numero} | 
                ${materia_disponible.profesor_nombre} 
                ${materia_disponible.profesor_primer_apellido}
                ${materia_disponible.profesor_segundo_apellido}
            </p>
            </div>`;
        }
        document.getElementById('materiasDisponibles').innerHTML = html_container_materias_disponibles;
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