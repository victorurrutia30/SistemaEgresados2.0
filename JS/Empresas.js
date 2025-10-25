const ws = new WebSocket(`ws://${window.location.hostname}:9999/?token=${JWT_TOKEN}`);

ws.onopen = () => {
    ws.send("Usuario Autenticado");
};

ws.onmessage = (event) => {
    Toastify({
        text: event.data,
        duration: 6000,
        gravity: "top",
        position: "right",
        close: true,
        style: {
            background: "#10188b",
        },
    }).showToast();
};

ws.onerror = (err) => {
    swal.fire({
        icon: 'error',
        title: 'Error de WebSocket',
        text: 'Ha ocurrido un error en la conexión WebSocket. Por favor, intente nuevamente más tarde.' + err,
    });
};

ws.onclose = () => {
    Toastify({
        text: "Conexión cerrada por el servidor",
        duration: 6000,
        gravity: "top",
        position: "right",
        style: {
            background: "#ff0000",
        },
    }).showToast();
};

$(document).ready(function () {
    ObtenerDatos();
    inicializarSliders();
});

function ObtenerDatos() {
    $.ajax({
        url: '/Empresas/DatosEmpresa',
        type: 'GET',
        success: function (response) {
            console.log('Datos de la empresa:', response);
            if (response.success) {
                if (!response.data) {
                    Swal.fire('Error', 'No se pudieron obtener los datos de la empresa.');
                    return;
                }
                renderDatosEmpresa(response.data);
            } else {
                Swal.fire('Error', response.message || 'No se pudieron obtener los datos de la empresa.');
            }
        },
        error: function (error) {
            console.error('Error al obtener datos:', error);
            Swal.fire('Error', 'No se pudieron obtener los datos de la empresa.');
        }
    });
}

function renderDatosEmpresa(empresa) {
    $('#NombreEmpresa').text(empresa.razon_social);
    $('.header h5').text(empresa.razon_social || 'Empresa sin nombre');

    const infoEmpresa = `${empresa.sector_economico || 'Sin sector'} • ${empresa.tamano_empresa || 'Sin tamaño'} • ${empresa.nit || 'Sin NIT'}`;
    $('.header p').text(infoEmpresa);

    renderEstadisticas(empresa.Estadisticas);

    renderInfoDetallada(empresa);

    renderVacantesRecientes(empresa.VacantesRecientes);

    renderCandidatosEnProceso(empresa.CandidatosEnProceso);

    renderEstadoVinculacion(empresa);
}

function renderInfoDetallada(empresa) {
    const infoHTML = `
        <div class="row mb-4">
            <div class="col-12">
                <div class="card card-custom">
                    <div class="card-header card-header-custom">
                        <h3>Información de la Empresa</h3>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <div class="info-item">
                                    <strong><i class="bi bi-building"></i> Razón Social:</strong>
                                    <span id="razonSocial">${empresa.razon_social || 'No especificado'}</span>
                                </div>
                            </div>
                            <div class="col-md-6 mb-3">
                                <div class="info-item">
                                    <strong><i class="bi bi-card-text"></i> NIT:</strong>
                                    <span id="nit">${empresa.nit || 'No especificado'}</span>
                                </div>
                            </div>
                            <div class="col-md-6 mb-3">
                                <div class="info-item">
                                    <strong><i class="bi bi-envelope"></i> Email:</strong>
                                    <span id="emailContacto">${empresa.email_contacto || 'No especificado'}</span>
                                </div>
                            </div>
                            <div class="col-md-6 mb-3">
                                <div class="info-item">
                                    <strong><i class="bi bi-telephone"></i> Teléfono:</strong>
                                    <span id="telefono">${empresa.telefono || 'No especificado'}</span>
                                </div>
                            </div>
                            <div class="col-md-12 mb-3">
                                <div class="info-item">
                                    <strong><i class="bi bi-geo-alt"></i> Dirección:</strong>
                                    <span id="direccion">${empresa.direccion || 'No especificado'}</span>
                                </div>
                            </div>
                            <div class="col-md-4 mb-3">
                                <div class="info-item">
                                    <strong><i class="bi bi-briefcase"></i> Sector:</strong>
                                    <span id="sectorEconomico">${renderSectorEconomicoInline(empresa.sector_economico)}</span>
                                </div>
                            </div>
                            <div class="col-md-4 mb-3">
                                <div class="info-item">
                                    <strong><i class="bi bi-diagram-3"></i> Tamaño:</strong>
                                    <span id="tamanoEmpresa">${renderTamanoEmpresaInline(empresa.tamano_empresa)}</span>
                                </div>
                            </div>
                            <div class="col-md-4 mb-3">
                                <div class="info-item">
                                    <strong><i class="bi bi-calendar-check"></i> Registro:</strong>
                                    <span id="fechaRegistro">${formatearFecha(empresa.fecha_registro)}</span>
                                </div>
                            </div>
                            <div class="col-md-6 mb-3">
                                <div class="info-item">
                                    <strong><i class="bi bi-university"></i> Universidad:</strong>
                                    <span id="vinculacionUniversidad">${renderVinculacionInline(empresa.vinculada_universidad)}</span>
                                </div>
                            </div>
                            <div class="col-md-6 mb-3">
                                <div class="info-item">
                                    <strong><i class="bi bi-star"></i> Puntuación:</strong>
                                    <span id="puntuacionEmpresa">${renderPuntuacionInline(empresa.puntuacion_empresa)}</span>
                                </div>
                            </div>
                            <div class="col-md-12 mb-3">
                                <div class="info-item">
                                    <strong><i class="bi bi-circle-fill"></i> Estado:</strong>
                                    <span id="estadoEmpresa">${renderEstadoInline(empresa.estado_activo)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    $('.row.mb-4').first().before(infoHTML);
}

function renderSectorEconomicoInline(sector) {
    const iconosSector = {
        'Tecnología': '💻',
        'Servicios': '🛎️',
        'Manufactura': '🏭',
        'Comercio': '🛒',
        'Construcción': '🏗️',
        'Educación': '📚',
        'Salud': '🏥',
        'Finanzas': '💰',
        'Agricultura': '🌾',
        'Turismo': '✈️',
        'Otro': '🏢'
    };

    const icono = iconosSector[sector] || iconosSector['Otro'];
    return `${icono} ${sector || 'No especificado'}`;
}

function renderTamanoEmpresaInline(tamano) {
    const coloresTamano = {
        'Micro': 'info',
        'Pequeña': 'success',
        'Mediana': 'warning',
        'Grande': 'primary'
    };

    const color = coloresTamano[tamano] || 'secondary';
    return `<span class="badge bg-${color}">${tamano || 'No especificado'}</span>`;
}

function renderVinculacionInline(vinculada) {
    if (vinculada) {
        return `<span class="badge bg-success"><i class="bi bi-check-circle"></i> Vinculada</span>`;
    } else {
        return `<span class="badge bg-secondary"><i class="bi bi-x-circle"></i> No Vinculada</span>`;
    }
}

function renderPuntuacionInline(puntuacion) {
    if (puntuacion === null || puntuacion === undefined) {
        return 'Sin calificación';
    }

    const estrellas = generarEstrellas(puntuacion);
    return `<span class="rating">${estrellas} <strong>${puntuacion.toFixed(1)}</strong>/5.0</span>`;
}

function generarEstrellas(puntuacion) {
    let estrellas = '';
    const puntuacionRedondeada = Math.round(puntuacion * 2) / 2;

    for (let i = 1; i <= 5; i++) {
        if (i <= puntuacionRedondeada) {
            estrellas += '<i class="bi bi-star-fill text-warning"></i>';
        } else if (i - 0.5 === puntuacionRedondeada) {
            estrellas += '<i class="bi bi-star-half text-warning"></i>';
        } else {
            estrellas += '<i class="bi bi-star text-warning"></i>';
        }
    }

    return estrellas;
}

function renderEstadoInline(estadoActivo) {
    if (estadoActivo) {
        return `<span class="badge bg-success"><i class="bi bi-check-circle"></i> Activa</span>`;
    } else {
        return `<span class="badge bg-danger"><i class="bi bi-x-circle"></i> Inactiva</span>`;
    }
}

function renderEstadoVinculacion(empresa) {
    if (empresa.vinculada_universidad) {
        console.log('Empresa vinculada a universidad');
    }
}

function renderEstadisticas(estadisticas) {
    if (!estadisticas) return;

    $('.module-card').eq(0).find('.module-number').text(estadisticas.VacantesActivas || 0);
    $('.module-card').eq(1).find('.module-number').text(estadisticas.CandidatosEvaluados || 0);
    $('.module-card').eq(2).find('.module-number').text(estadisticas.Contrataciones || 0);
    $('.module-card').eq(3).find('.module-number').text(estadisticas.PromedioEvaluacion + '%' || '0.0%');

    $('.module-card').eq(3).find('.module-title').text('Tasa de Éxito');
}

function renderVacantesRecientes(vacantes) {
    if (!vacantes || vacantes.length === 0) return;

    const tbody = $('.table-custom').eq(0).find('tbody');
    tbody.empty();

    vacantes.forEach(vacante => {
        const estadoClass = obtenerClaseEstado(vacante.estado_vacante);
        const fechaFormateada = formatearFechaCorta(vacante.fecha_publicacion);

        const row = `
            <tr>
                <td>${vacante.titulo}</td>
                <td><span class="status ${estadoClass}">${vacante.estado_vacante}</span></td>
                <td>${fechaFormateada}</td>
                <td class="text-nowrap">
                    <div class="d-flex gap-2">
                        <button class="btn btn-custom btn-sm" onclick="verPostulantes(${vacante.id_vacante})">
                            Ver Postulantes (${vacante.NumeroPostulantes})
                        </button>
                        <button class="btn btn-outline-custom btn-sm" onclick="editarVacante(${vacante.id_vacante})">
                            Editar Vacante
                        </button>
                    </div>
                </td>
            </tr>
        `;
        tbody.append(row);
    });
}

function renderCandidatosEnProceso(candidatos) {
    if (!candidatos || candidatos.length === 0) return;

    const tbody = $('.table-custom').eq(1).find('tbody');
    tbody.empty();

    candidatos.forEach(candidato => {
        const estadoClass = obtenerClaseEstado(candidato.estado);
        const iconoEstado = obtenerIconoEstado(candidato.estado);
        const contactado = candidato.fue_contactado ?
            '<i class="bi bi-check-circle-fill text-success" title="Contactado"></i>' :
            '<i class="bi bi-circle text-muted" title="No contactado"></i>';

        const row = `
            <tr>
                <td>${candidato.NombreCandidato}</td>
                <td>${candidato.TituloVacante}</td>
                <td>${contactado}</td>
                <td>
                    <span class="status ${estadoClass}">
                        <i class="bi ${iconoEstado}"></i> ${candidato.estado}
                    </span>
                </td>
            </tr>
        `;
        tbody.append(row);
    });

    $('.table-custom').eq(1).find('thead th').eq(2).text('Contactado');
}

function obtenerClaseEstado(estado) {
    const estados = {
        'Activa': 'status-pending',
        'Entrevista': 'status-pending',
        'Revisión CV': 'status-noresult',
        'Revision': 'status-noresult',
        'Oferta': 'status-offer',
        'Contratado': 'status-contract',
        'Cerrada': 'status-closed'
    };
    return estados[estado] || 'status-noresult';
}

function obtenerIconoEstado(estado) {
    const iconos = {
        'Entrevista': 'bi-clock',
        'Revisión CV': 'bi-eye',
        'Revision': 'bi-eye',
        'Oferta': 'bi-envelope',
        'Contratado': 'bi-check-lg',
        'Pendiente': 'bi-hourglass'
    };
    return iconos[estado] || 'bi-circle';
}

function formatearFechaCorta(fechaString) {
    if (!fechaString) return 'N/A';

    let fecha;
    if (typeof fechaString === 'string' && fechaString.includes('/Date(')) {
        const timestamp = parseInt(fechaString.match(/\d+/)[0]);
        fecha = new Date(timestamp);
    } else {
        fecha = new Date(fechaString);
    }

    const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = meses[fecha.getMonth()];
    const año = fecha.getFullYear();

    return `${dia} ${mes}. ${año}`;
}

function verPostulantes(idVacante) {
    console.log('Ver postulantes de vacante:', idVacante);
}

function editarVacante(idVacante) {
    console.log('Editar vacante:', idVacante);

}

function formatearFecha(fechaString) {
    if (!fechaString) return 'No especificado';

    if (typeof fechaString === 'string' && fechaString.includes('/Date(')) {
        const timestamp = parseInt(fechaString.match(/\d+/)[0]);
        const fecha = new Date(timestamp);
        return fecha.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function inicializarSliders() {
    const sliders = [
        { id: 'peso-experiencia', valorId: 'val-experiencia' },
        { id: 'peso-habilidades', valorId: 'val-habilidades' },
        { id: 'peso-calificaciones', valorId: 'val-calificaciones' },
        { id: 'peso-carrera', valorId: 'val-carrera' },
        { id: 'peso-idiomas', valorId: 'val-idiomas' }
    ];

    sliders.forEach(slider => {
        const input = document.getElementById(slider.id);
        const valorSpan = document.getElementById(slider.valorId);

        if (input && valorSpan) {
            input.addEventListener('input', function () {
                valorSpan.textContent = this.value + '%';
                actualizarTotalPeso();
            });
        }
    });
}

function actualizarTotalPeso() {
    const experiencia = parseInt(document.getElementById('peso-experiencia').value) || 0;
    const habilidades = parseInt(document.getElementById('peso-habilidades').value) || 0;
    const calificaciones = parseInt(document.getElementById('peso-calificaciones').value) || 0;
    const carrera = parseInt(document.getElementById('peso-carrera').value) || 0;
    const idiomas = parseInt(document.getElementById('peso-idiomas').value) || 0;

    const total = experiencia + habilidades + calificaciones + carrera + idiomas;

    const totalPesoSpan = document.getElementById('total-peso');
    if (totalPesoSpan) {
        totalPesoSpan.textContent = total + '%';

        if (total === 100) {
            totalPesoSpan.style.color = '#28a745';
        } else {
            totalPesoSpan.style.color = '#dc3545';
        }
    }
}

function convertirBytes(bytes) {
    if (!bytes) return '0 KB';
    return (bytes / 1024).toFixed(2) + ' KB';
}