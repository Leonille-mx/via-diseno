document.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', function () {
        const semestre = this.getAttribute("data-semestre");
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
                        <button class="btn btn-sm p-0 d-flex align-items-center justify-content-center me-3" 
                        style="
                            width: 1.3rem;
                            height: 1.3rem;
                            border-radius: 50%;
                            background-color: #84251c;
                            color: white;
                            border: none;
                        ">
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
        }).catch((error) => {
            console.log(error);
        });
    });
});