const ws = new WebSocket(`ws://${window.location.hostname}:9999/?token=${JWT_TOKEN}`);

ws.onmessage = (event) => {
    let data;

    try {
        data = JSON.parse(event.data);
    } catch {
        data = { tipo: 'info', mensaje: event.data };
    }  


    const tipo = data.tipo || 'info';
    const Por = data.Por || 'Sistema';
    const mensaje = data.mensaje || 'Mensaje recibido del servidor.';
    const duracion = (Por.toLowerCase() === 'admin') ? 15000 : 7000;
    const colores = {
        info: { bg: '#3b82f6', sombra: 'rgba(59, 130, 246, 0.2)', grad: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' },
        success: { bg: '#10b981', sombra: 'rgba(16, 185, 129, 0.2)', grad: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
        warning: { bg: '#f59e0b', sombra: 'rgba(245, 158, 11, 0.2)', grad: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
        error: { bg: '#ef4444', sombra: 'rgba(239, 68, 68, 0.2)', grad: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }
    };
    if (tipo === 'se_canceloPostulacion') {
        cargarTopCandidatos();
        ActualizarEstadisticas();
        return;
    }
    if (tipo === 'nueva_Postulacion') {
        cargarTopCandidatos();
        ActualizarEstadisticas();
        return;
    }

    const color = colores[tipo] || colores.info;

    Toastify({
        text: `
            <div style="display: flex; align-items: center; gap: 14px;">
                <div style="
                    width: 10px; 
                    height: 10px; 
                    background: ${color.bg}; 
                    border-radius: 50%; 
                    box-shadow: 0 0 0 3px ${color.sombra};
                    animation: pulse 2s ease-in-out infinite;
                    flex-shrink: 0;
                "></div>

                <div style="flex: 1;">
                    <div style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 5px;
                    ">
                        <div style="
                            font-weight: 600; 
                            font-size: 13px; 
                            color: #1f2937;
                            letter-spacing: 0.3px;
                        ">${tipo.toUpperCase() === 'INFO' ? 'MENSAJE DEL SISTEMA' : tipo.toUpperCase()}</div>
                        <div style="
                            font-size: 11px;
                            color: #6b7280;
                            background: #f3f4f6;
                            padding: 2px 8px;
                            border-radius: 12px;
                            font-weight: 500;
                        ">Por: ${Por}</div>
                    </div>
                    <div style="
                        font-size: 14px; 
                        color: #374151;
                        font-weight: 500;
                        line-height: 1.4;
                    ">${mensaje}</div>
                </div>

                <div style="
                    width: 32px;
                    height: 32px;
                    background: ${color.grad};
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                ">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                </div>
            </div>

            <style>
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            </style>
        `,
        duration: duracion,
        gravity: "top",
        position: "right",
        close: true,
        escapeMarkup: false,
        style: {
            background: "#ffffff",
            borderRadius: "10px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.05)",
            padding: "16px 18px",
            border: "1px solid #e5e7eb",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            minWidth: "380px"
        },
    }).showToast();
};

ws.onerror = (err) => {
    Swal.fire({
        icon: 'error',
        title: 'Error de Conexión',
        text: 'No se pudo establecer la conexión WebSocket. Verifique su conexión a internet.',
        confirmButtonColor: '#8b1538',
        confirmButtonText: 'Entendido',
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};

ws.onclose = () => {
    Toastify({
        text: `
            <div style="display: flex; align-items: center; gap: 14px;">
                <div style="
                    width: 10px; 
                    height: 10px; 
                    background: #ef4444; 
                    border-radius: 50%; 
                    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
                    flex-shrink: 0;
                "></div>
                <div style="flex: 1;">
                    <div style="
                        font-weight: 600; 
                        font-size: 13px; 
                        margin-bottom: 3px;
                        color: #1f2937;
                        letter-spacing: 0.3px;
                    ">CONEXIÓN INTERRUMPIDA</div>
                    <div style="
                        font-size: 14px; 
                        color: #4b5563;
                        font-weight: 500;
                    ">El servidor ha cerrado la conexión</div>
                </div>
                <div style="
                    width: 32px;
                    height: 32px;
                    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                ">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="15" y1="9" x2="9" y2="15"/>
                        <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                </div>
            </div>
        `,
        duration: 6000,
        gravity: "top",
        position: "right",
        close: true,
        escapeMarkup: false,
        style: {
            background: "#ffffff",
            borderRadius: "10px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.05)",
            padding: "16px 18px",
            minWidth: "380px",
            border: "1px solid #e5e7eb",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        },
    }).showToast();
};

let modalBuscarEgresados = null;
let modalPerfilCompleto = null;
let modalContactarEgresado = null;
let paginaActualModal = 1;
let registrosPorPaginaModal = 20;


let egresadosListaModal = [];
let vacanteSeleccionadaId = null;
let vacanteSeleccionadaNombre = null;
let vacanteSeleccionadaEstadoActual = null;
let todasLasVacantes = [];
let paginaActual = 1;
let registrosPorPagina = 10;


let todosLosEgresados = [];
let paginaActualEgresados = 1;
const egresadosPorPagina = 10;

$(document).ready(function () {
    ObtenerDatos();
    inicializarSliders();
    cargarTopSectores();
    cargarTopCandidatos();
    cargarVacantes();
    renderizarControlesPaginacion();

    if (document.getElementById('pipelineChart')) {
        inicializarGraficoPipeline();
    }

    const modalBuscarEl = document.getElementById('modalBuscarEgresados');
    const modalPerfilEl = document.getElementById('modalPerfilCompleto');
    const modalContactarEl = document.getElementById('modalContactarEgresado');

    if (modalBuscarEl) modalBuscarEgresados = new bootstrap.Modal(modalBuscarEl);
    if (modalPerfilEl) modalPerfilCompleto = new bootstrap.Modal(modalPerfilEl);
    if (modalContactarEl) modalContactarEgresado = new bootstrap.Modal(modalContactarEl);

    $('#filtroCarreraModal, #filtroHabilidadModal').on('keypress', function (e) {
        if (e.which === 13) {
            aplicarFiltrosModal();
        }
    });

    $('#PublicarVacante').on('click', function () {
        $('#modalPublicarVacante').modal('show');
    });

    if ($('#formVacante').length > 0) {
        updateProgress();

        $('#formVacante').on('input change', 'input, select, textarea', function () {
            updateProgress();
        });

        $('#salario_min, #salario_max').on('blur', function () {
            const min = parseFloat($('#salario_min').val()) || 0;
            const max = parseFloat($('#salario_max').val()) || 0;
            if (min > 0 && max > 0 && min > max) {
                Toastify({
                    text: "⚠️ El salario mínimo no puede ser mayor al máximo",
                    duration: 3000,
                    gravity: "top",
                    position: "right",
                    style: { background: "#ff9800" }
                }).showToast();
            }
        });

        const hoy = new Date().toISOString().split('T')[0];
        $('#fecha_cierre').attr('min', hoy);
    }
});
function ObtenerDatos() {
    $.ajax({
        url: '/Empresas/DatosEmpresa',
        type: 'GET',
        success: function (response) {
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

function ActualizarEstadisticas() {
    $.ajax({
        url: '/Empresas/ActualizarEstadisticas',
        type: 'GET',
        success: function (response) {
            if (response.success) {
                renderEstadisticas(response.data.Estadisticas);
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
    $('h5.mb-1').text(empresa.razon_social + ' • Panel de Empresa');

    const infoEmpresa = `${empresa.sector_economico || 'Sin sector'} • ${empresa.tamano_empresa || 'Sin tamaño'} • ${empresa.nit || 'Sin NIT'}`;
    $('.company-subtitle').text(infoEmpresa);

    renderEstadisticas(empresa.Estadisticas);
    renderCandidatosEnProceso(empresa.CandidatosEnProceso);
}

function renderEstadisticas(estadisticas) {
    if (!estadisticas) return;

    $('.stat-card').eq(0).find('.stat-value').text(estadisticas.VacantesActivas || 0);

    $('.stat-card').eq(1).find('.stat-value').text(estadisticas.TotalCandidatos || 0);

    $('.stat-card').eq(2).find('.stat-value').text(estadisticas.Entrevistas || 0);

    $('.stat-card').eq(3).find('.stat-value').text(estadisticas.PromedioCandidatosPorVacante || 0);
}

function renderCandidatosEnProceso(candidatos) {

    const tbody = $('.table-custom').eq(1).find('tbody');
    tbody.empty();

    if (!candidatos || candidatos.length === 0) {
        tbody.html(`
            <tr>
                <td colspan="4" class="text-center py-4">
                    <i class="bi bi-people text-muted" style="font-size: 2rem;"></i>
                    <p class="text-muted small mt-2 mb-0">No hay candidatos en proceso</p>
                    <small class="text-muted">Los candidatos aparecerán aquí cuando se postulen a tus vacantes</small>
                </td>
            </tr>
        `);
        return;
    }

    candidatos.forEach(candidato => {
        const estadoClass = obtenerClaseEstadoCandidato(candidato.estado);

        const row = `
            <tr>
                <td><strong>${candidato.NombreCandidato}</strong></td>
                <td>${candidato.Carrera}</td>
                <td>${candidato.TituloVacante}</td>
                <td>
                    <span class="badge-custom ${estadoClass}">
                        ${candidato.estado}
                    </span>
                </td>
            </tr>
        `;
        tbody.append(row);
    });
}
function abrirModalPerfil() {
    const modal = new bootstrap.Modal(document.getElementById('modalPerfilEmpresa'));
    modal.show();
    cargarDatosPerfilEmpresa();
}

function cargarDatosPerfilEmpresa() {
    $.ajax({
        url: '/Empresas/ObtenerDatosEmpresa',
        type: 'GET',
        beforeSend: function () {
            $('#loadingPerfil').show();
            $('#formPerfil').hide();
        },
        success: function (response) {

            if (response.success && response.data) {
                const empresa = response.data;

                $('#razonSocial').val(empresa.razon_social || '');
                $('#nit').val(empresa.nit || '');
                $('#emailContacto').val(empresa.email_contacto || '');
                $('#telefono').val(empresa.telefono || '');
                $('#direccion').val(empresa.direccion || '');
                $('#sectorEconomico').val(empresa.sector_economico || '');
                $('#tamanoEmpresa').val(empresa.tamano_empresa || '');

                $('#loadingPerfil').hide();
                $('#formPerfil').show();
            } else {
                Toastify({
                    text: response.message || "Error al cargar datos",
                    duration: 3000,
                    gravity: "top",
                    position: "right",
                    style: { background: "#dc3545" }
                }).showToast();

                $('#loadingPerfil').hide();
                $('#formPerfil').show();
            }
        },
        error: function (xhr, status, error) {
            console.error('Error al cargar perfil:', error);
            console.error('Respuesta del servidor:', xhr.responseText);

            Toastify({
                text: "Error al cargar datos del perfil",
                duration: 3000,
                gravity: "top",
                position: "right",
                style: { background: "#dc3545" }
            }).showToast();

            $('#loadingPerfil').hide();
            $('#formPerfil').show();
        }
    });
}

function guardarPerfilEmpresa() {
    const razonSocial = $('#razonSocial').val().trim();
    const nit = $('#nit').val().trim();
    const email = $('#emailContacto').val().trim();
    const telefono = $('#telefono').val().trim();

    if (!razonSocial) {
        Toastify({
            text: "La razón social es obligatoria",
            duration: 3000,
            gravity: "top",
            position: "right",
            style: { background: "#dc3545" }
        }).showToast();
        return;
    }

    if (!nit) {
        Toastify({
            text: "El NIT es obligatorio",
            duration: 3000,
            gravity: "top",
            position: "right",
            style: { background: "#dc3545" }
        }).showToast();
        return;
    }

    if (!email) {
        Toastify({
            text: "El email de contacto es obligatorio",
            duration: 3000,
            gravity: "top",
            position: "right",
            style: { background: "#dc3545" }
        }).showToast();
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        Toastify({
            text: "El formato del email no es válido",
            duration: 3000,
            gravity: "top",
            position: "right",
            style: { background: "#dc3545" }
        }).showToast();
        return;
    }

    if (!telefono) {
        Toastify({
            text: "El teléfono es obligatorio",
            duration: 3000,
            gravity: "top",
            position: "right",
            style: { background: "#dc3545" }
        }).showToast();
        return;
    }

    const empresa = {
        razon_social: razonSocial,
        nit: nit,
        email_contacto: email,
        telefono: telefono,
        direccion: $('#direccion').val().trim(),
        sector_economico: $('#sectorEconomico').val().trim(),
        tamano_empresa: $('#tamanoEmpresa').val()
    };

    Swal.fire({
        title: '¿Confirmar cambios?',
        text: "Se actualizará la información de tu empresa",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#8b1038',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, actualizar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            realizarActualizacionPerfil(empresa);
        }
    });
}

function realizarActualizacionPerfil(empresa) {
    $.ajax({
        url: '/Empresas/ActualizarPerfil',
        type: 'POST',
        data: empresa,
        beforeSend: function () {
            Swal.fire({
                title: 'Actualizando...',
                text: 'Por favor espera',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
        },
        success: function (response) {
            Swal.close();

            console.log('✅ Respuesta del servidor:', response);

            if (response.success) {
                Toastify({
                    text: response.message || "Perfil actualizado correctamente",
                    duration: 3000,
                    gravity: "top",
                    position: "right",
                    style: { background: "#28a745" }
                }).showToast();

                const modal = bootstrap.Modal.getInstance(document.getElementById('modalPerfilEmpresa'));
                if (modal) {
                    modal.hide();
                }

                setTimeout(function () {
                    ObtenerDatos();
                }, 500);
            } else {
                Toastify({
                    text: response.message || "Error al actualizar perfil",
                    duration: 3000,
                    gravity: "top",
                    position: "right",
                    style: { background: "#dc3545" }
                }).showToast();
            }
        },
        error: function (xhr, status, error) {
            Swal.close();
            console.error('❌ Error AJAX:', error);
            console.error('Status:', xhr.status);
            console.error('Respuesta:', xhr.responseText);

            Toastify({
                text: "Error de comunicación con el servidor",
                duration: 4000,
                gravity: "top",
                position: "right",
                style: { background: "#dc3545" }
            }).showToast();
        }
    });
}


function abrirModalBuscarEgresados() {
    if (!modalBuscarEgresados) {
        Swal.fire('Error', 'Modal no inicializado', 'error');
        return;
    }
    modalBuscarEgresados.show();
    cargarEgresadosModal();
}

function cargarEgresadosModal() {
    mostrarLoadingModal(true);

    $.ajax({
        url: '/Empresas/FiltrarEgresadosCVPublico',
        type: 'GET',
        success: function (response) {
            mostrarLoadingModal(false);
            if (response.success) {
                egresadosListaModal = response.data;
                paginaActualModal = 1;
                renderizarEgresadosModal();
            } else {
                Swal.fire('Error', response.message, 'error');
                mostrarEstadoVacioModal();
            }
        },
        error: function (xhr, status, error) {
            console.error('Error:', error);
            mostrarLoadingModal(false);
            Swal.fire('Error', 'No se pudieron cargar los egresados', 'error');
            mostrarEstadoVacioModal();
        }
    });
}

function aplicarFiltrosModal() {
    const carrera = $('#filtroCarreraModal').val().trim();
    const habilidad = $('#filtroHabilidadModal').val().trim();

    console.log('Aplicando filtros - Carrera:', carrera, 'Habilidad:', habilidad);
    mostrarLoadingModal(true);

    $.ajax({
        url: '/Empresas/FiltrarEgresadosCVPublico',
        type: 'GET',
        data: { carrera: carrera, habilidad: habilidad },
        success: function (response) {
            mostrarLoadingModal(false);
            if (response.success) {
                egresadosListaModal = response.data;
                paginaActualModal = 1;
                if (response.data && response.data.length > 0) {
                    renderizarEgresadosModal();
                    Toastify({
                        text: `Se encontraron ${response.data.length} egresados`,
                        duration: 3000,
                        gravity: "top",
                        position: "right",
                        style: { background: "#28a745" },
                    }).showToast();
                } else {
                    mostrarEstadoVacioModal();
                }
            } else {
                Swal.fire('Error', response.message, 'error');
                mostrarEstadoVacioModal();
            }
        },
        error: function (xhr, status, error) {
            console.error('Error AJAX:', error);
            mostrarLoadingModal(false);
            Swal.fire('Error', 'Error al aplicar filtros', 'error');
        }
    });
}

function limpiarFiltrosModal() {
    $('#filtroCarreraModal').val('');
    $('#filtroHabilidadModal').val('');

    console.log('Limpiando filtros...');
    mostrarLoadingModal(true);

    $.ajax({
        url: '/Empresas/FiltrarEgresadosCVPublico',
        type: 'GET',
        data: { carrera: '', habilidad: '' },
        success: function (response) {
            mostrarLoadingModal(false);
            if (response.success) {
                egresadosListaModal = response.data;
                paginaActualModal = 1;
                if (response.data && response.data.length > 0) {
                    renderizarEgresadosModal();
                    Toastify({
                        text: `Filtros limpiados. Mostrando ${response.data.length} egresados`,
                        duration: 3000,
                        gravity: "top",
                        position: "right",
                        style: { background: "#6c757d" },
                    }).showToast();
                } else {
                    mostrarEstadoVacioModal();
                }
            } else {
                Swal.fire('Error', response.message, 'error');
                mostrarEstadoVacioModal();
            }
        },
        error: function (xhr, status, error) {
            console.error('Error AJAX al limpiar filtros:', error);
            mostrarLoadingModal(false);
            Swal.fire('Error', 'Error al limpiar filtros', 'error');
        }
    });
}

function renderizarEgresadosModal() {
    const container = $('#listaEgresadosModal');
    container.empty();
    $('#emptyStateModal').hide();

    if (!egresadosListaModal || egresadosListaModal.length === 0) {
        mostrarEstadoVacioModal();
        return;
    }

    const totalRegistros = egresadosListaModal.length;
    const totalPaginas = Math.ceil(totalRegistros / registrosPorPaginaModal);

    if (paginaActualModal > totalPaginas) {
        paginaActualModal = totalPaginas;
    }
    if (paginaActualModal < 1) {
        paginaActualModal = 1;
    }

    const inicio = (paginaActualModal - 1) * registrosPorPaginaModal;
    const fin = Math.min(inicio + registrosPorPaginaModal, totalRegistros);
    const egresadosPagina = egresadosListaModal.slice(inicio, fin);

    const formatearFecha = (fechaString) => {
        if (!fechaString) return 'No especificado';
        let fecha;

        if (typeof fechaString === 'string' && fechaString.includes('/Date(')) {
            const match = fechaString.match(/\/Date\((\d+)([+-]\d+)?\)\//);
            if (match) {
                const timestamp = parseInt(match[1]);
                fecha = new Date(timestamp);
            } else {
                return 'Formato inválido';
            }
        } else {
            fecha = new Date(fechaString);
        }

        if (isNaN(fecha)) return 'Fecha inválida';

        const opciones = { day: '2-digit', month: 'short', year: 'numeric' };
        return fecha.toLocaleDateString('es-ES', opciones);
    };

    const listaHTML = egresadosPagina.map(egresado => {
        const primeraLetra = egresado.NombreCompleto ? egresado.NombreCompleto.charAt(0).toUpperCase() : '?';
        const fechaGraduacion = egresado.anio_graduacion ? formatearFecha(egresado.anio_graduacion) : 'No especificado';
        const promedio = egresado.promedio ? parseFloat(egresado.promedio).toFixed(2) : null;

        return `
            <div class="egresado-item-lista mb-3">
                <div class="d-flex align-items-start gap-3">
                    <div class="egresado-avatar-lista">${primeraLetra}</div>
                    <div class="flex-grow-1">
                        <h6 class="egresado-nombre-lista mb-1">${egresado.NombreCompleto || 'Sin nombre'}</h6>
                        <p class="egresado-carrera-lista mb-2">${egresado.carrera || 'Sin carrera'}</p>
                        <span class="badge-cv-publico-lista"><i class="bi bi-unlock-fill"></i> CV Público</span>
                        
                        <div class="info-contacto-lista mt-2">
                            ${egresado.email ? `<div class="info-item-lista"><i class="bi bi-envelope"></i> ${egresado.email}</div>` : ''}
                            ${egresado.telefono ? `<div class="info-item-lista"><i class="bi bi-telephone"></i> ${egresado.telefono}</div>` : ''}
                            <div class="info-item-lista"><i class="bi bi-calendar-check"></i> Graduación: ${fechaGraduacion}</div>
                            ${promedio ? `<div class="info-item-lista"><i class="bi bi-star-fill"></i> Promedio: ${promedio}</div>` : ''}
                        </div>
                        
                        ${egresado.habilidades ? `
                            <div class="habilidades-lista mt-2">
                                <i class="bi bi-tools"></i> <strong>Habilidades</strong>
                                <div class="mt-1">${egresado.habilidades}</div>
                            </div>
                        ` : ''}
                        
                        <div class="botones-lista mt-3">
                            <button class="btn btn-sm btn-matching" onclick="verPerfilCompletoModal(${egresado.id_egresado})">
                                <i class="bi bi-eye"></i> Ver Perfil Completo
                            </button>
                            <button class="btn btn-sm btn-outline-secondary" onclick="abrirModalContactarModal(${egresado.id_egresado}, '${egresado.NombreCompleto.replace(/'/g, "\\'")}')">
                                <i class="bi bi-envelope"></i> Contactar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    container.html(`<div class="col-12">${listaHTML}</div>`);

    renderizarPaginacionModal(totalRegistros, totalPaginas, inicio, fin);
}

function renderizarPaginacionModal(totalRegistros, totalPaginas, inicio, fin) {
    const containerTop = $('#paginacionEgresadosModalTop');
    const containerBottom = $('#paginacionEgresadosModalBottom');

    if (totalRegistros === 0) {
        containerTop.empty();
        containerBottom.empty();
        return;
    }

    const selectorHTML = `
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div class="d-flex align-items-center gap-2">
                <label class="mb-0 fw-bold">Mostrar:</label>
                <select class="form-select form-select-sm" style="width: auto;" onchange="cambiarRegistrosPorPagina(this.value)">
                    <option value="10" ${registrosPorPaginaModal === 10 ? 'selected' : ''}>10</option>
                    <option value="20" ${registrosPorPaginaModal === 20 ? 'selected' : ''}>20</option>
                    <option value="50" ${registrosPorPaginaModal === 50 ? 'selected' : ''}>50</option>
                    <option value="100" ${registrosPorPaginaModal === 100 ? 'selected' : ''}>100</option>
                    <option value="300" ${registrosPorPaginaModal === 300 ? 'selected' : ''}>300</option>
                    <option value="500" ${registrosPorPaginaModal === 500 ? 'selected' : ''}>500</option>
                    <option value="${totalRegistros}" ${registrosPorPaginaModal === totalRegistros ? 'selected' : ''}>Todos</option>
                </select>
                <span class="text-muted">registros por página</span>
            </div>
            
            <div class="text-muted">
                Mostrando ${inicio + 1} - ${fin} de ${totalRegistros} egresados
            </div>
            
            <nav aria-label="Paginación de egresados">
                <ul class="pagination pagination-sm mb-0">
                    <li class="page-item ${paginaActualModal === 1 ? 'disabled' : ''}">
                        <a class="page-link" href="javascript:void(0)" onclick="irAPaginaModal(1)">
                            <i class="bi bi-chevron-double-left"></i>
                        </a>
                    </li>
                    <li class="page-item ${paginaActualModal === 1 ? 'disabled' : ''}">
                        <a class="page-link" href="javascript:void(0)" onclick="irAPaginaModal(${paginaActualModal - 1})">
                            <i class="bi bi-chevron-left"></i>
                        </a>
                    </li>
                    ${generarBotonesPaginacion(totalPaginas)}
                    <li class="page-item ${paginaActualModal === totalPaginas ? 'disabled' : ''}">
                        <a class="page-link" href="javascript:void(0)" onclick="irAPaginaModal(${paginaActualModal + 1})">
                            <i class="bi bi-chevron-right"></i>
                        </a>
                    </li>
                    <li class="page-item ${paginaActualModal === totalPaginas ? 'disabled' : ''}">
                        <a class="page-link" href="javascript:void(0)" onclick="irAPaginaModal(${totalPaginas})">
                            <i class="bi bi-chevron-double-right"></i>
                        </a>
                    </li>
                </ul>
            </nav>
        </div>
    `;

    containerTop.html(selectorHTML);
}

function generarBotonesPaginacion(totalPaginas) {
    let botones = '';
    const maxBotones = 5;
    let inicio = Math.max(1, paginaActualModal - Math.floor(maxBotones / 2));
    let fin = Math.min(totalPaginas, inicio + maxBotones - 1);

    if (fin - inicio < maxBotones - 1) {
        inicio = Math.max(1, fin - maxBotones + 1);
    }

    if (inicio > 1) {
        botones += `
            <li class="page-item">
                <a class="page-link" href="javascript:void(0)" onclick="irAPaginaModal(1)">1</a>
            </li>
        `;
        if (inicio > 2) {
            botones += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
    }

    for (let i = inicio; i <= fin; i++) {
        botones += `
            <li class="page-item ${i === paginaActualModal ? 'active' : ''}">
                <a class="page-link" href="javascript:void(0)" onclick="irAPaginaModal(${i})">${i}</a>
            </li>
        `;
    }

    if (fin < totalPaginas) {
        if (fin < totalPaginas - 1) {
            botones += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
        botones += `
            <li class="page-item">
                <a class="page-link" href="javascript:void(0)" onclick="irAPaginaModal(${totalPaginas})">${totalPaginas}</a>
            </li>
        `;
    }

    return botones;
}

function irAPaginaModal(numeroPagina) {
    paginaActualModal = numeroPagina;
    renderizarEgresadosModal();

    $('#listaEgresadosModal').parent().animate({ scrollTop: 0 }, 300);
}

function cambiarRegistrosPorPagina(cantidad) {
    registrosPorPaginaModal = cantidad === 'Todos' ? egresadosListaModal.length : parseInt(cantidad);
    paginaActualModal = 1;
    renderizarEgresadosModal();
}

function mostrarLoadingModal(mostrar) {
    if (mostrar) {
        $('#loadingEgresados').show();
        $('#listaEgresadosModal').hide();
        $('#emptyStateModal').hide();
        $('#paginacionEgresadosModal').empty();
    } else {
        $('#loadingEgresados').hide();
        $('#listaEgresadosModal').show();
    }
}

function mostrarEstadoVacioModal() {
    $('#listaEgresadosModal').empty();
    $('#emptyStateModal').show();
    $('#paginacionEgresadosModalTop').empty();
    $('#paginacionEgresadosModalBottom').empty();
}


function verPerfilCompletoModal(idEgresado) {

    $('#contenidoPerfilCompleto').html(`
        <div class="text-center py-5">
            <div class="spinner-border" style="color: #8b1038;" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-3">Cargando perfil completo...</p>
        </div>
    `);

    if (modalPerfilCompleto) {
        modalPerfilCompleto.show();
    } else {
        $('#modalPerfilCompleto').modal('show');
    }

    $.ajax({
        url: '/Empresas/VerPerfilEgresadoCompleto',
        type: 'GET',
        data: { idEgresado: idEgresado },
        success: function (response) {
            if (response.success) {
                renderizarPerfilCompletoModal(response.data);
            } else {
                Swal.fire('Error', response.message || 'No se pudo cargar el perfil', 'error');
                if (modalPerfilCompleto) {
                    modalPerfilCompleto.hide();
                } else {
                    $('#modalPerfilCompleto').modal('hide');
                }
            }
        },
        error: function (xhr, status, error) {
            console.error('❌ Error al cargar perfil:', error);
            console.error('Respuesta completa:', xhr.responseText);

            Swal.fire('Error', 'No se pudo cargar el perfil del egresado', 'error');
            if (modalPerfilCompleto) {
                modalPerfilCompleto.hide();
            } else {
                $('#modalPerfilCompleto').modal('hide');
            }
        }
    });
}


function renderizarPerfilCompletoModal(perfil) {
    const fechaGraduacions = perfil.anio_graduacion
        ? (() => {
            const fecha = new Date(parseInt(perfil.anio_graduacion.match(/\d+/)[0]));
            return `${fecha.getDate()} de ${fecha.toLocaleDateString('es-ES', { month: 'long' })} del ${fecha.getFullYear()}`;
        })()
        : null;
    const primeraLetra = perfil.NombreCompleto ? perfil.NombreCompleto.charAt(0).toUpperCase() : '?';

    const fechaGraduacion = perfil.anio_graduacion || perfil.año_graduacion || perfil.fecha_graduacion || perfil.anoGraduacion;

    const contenido = `
        <div class="perfil-header-modal">
            <div class="perfil-avatar-grande-modal">${primeraLetra}</div>
            <h4 class="perfil-nombre-modal">${perfil.NombreCompleto}</h4>
            <p class="perfil-carrera-modal">${perfil.carrera || 'Sin carrera'}</p>
            <div class="d-flex justify-content-center gap-2 flex-wrap">
                ${perfil.email ? `<span class="info-tag-modal"><i class="bi bi-envelope"></i> ${perfil.email}</span>` : ''}
                ${perfil.telefono ? `<span class="info-tag-modal"><i class="bi bi-telephone"></i> ${perfil.telefono}</span>` : ''}
                ${perfil.anio_graduacion ? `<span class="info-tag-modal"><i class="bi bi-calendar-check"></i> Graduación: ${fechaGraduacions}</span>` : ''}
                ${perfil.promedio_academico ? `<span class="info-tag-modal"><i class="bi bi-star-fill"></i> Promedio: ${perfil.promedio_academico.toFixed(2)}</span>` : ''}
      

            </div>
        </div>

        ${perfil.carta_presentacion ? `
            <div class="perfil-section-modal">
                <h6 class="perfil-section-title-modal">
                    <i class="bi bi-file-text-fill"></i> Carta de Presentación
                </h6>
                <div class="carta-presentacion-modal">${perfil.carta_presentacion}</div>
            </div>
        ` : `
            <div class="perfil-section-modal">
                <div class="alert alert-info">
                    <i class="bi bi-info-circle"></i> Este egresado no ha agregado una carta de presentación
                </div>
            </div>
        `}

        <div class="perfil-section-modal">
            <h6 class="perfil-section-title-modal">
                <i class="bi bi-file-earmark-pdf-fill"></i> Currículum Vitae
            </h6>
            <div class="cv-info-box">
                <div class="cv-icon-large">
                    <i class="bi bi-file-earmark-pdf"></i>
                </div>
                <div class="cv-details">
                    <div class="cv-filename">
                        ${perfil.nombre_archivo || 'CV_' + perfil.NombreCompleto.replace(/\s+/g, '_') + '.pdf'}
                    </div>
                    <div class="cv-metadata">
                        <i class="bi bi-file-earmark"></i> Documento PDF
                        ${perfil.anio_graduacion ? ` • Graduación: ${fechaGraduacions}` : ''}
                    </div>
                </div>
                <button class="btn btn-primary" onclick="cargarCVEnModal('${perfil.ruta_archivo}','${perfil.nombre_archivo}','${perfil.id_egresado}')">
                    <i class="bi bi-file-earmark-pdf"></i> Ver CV
                </button>
            </div>
        </div>

        ${perfil.habilidades ? `
            <div class="perfil-section-modal">
                <h6 class="perfil-section-title-modal">
                    <i class="bi bi-tools"></i> Habilidades Principales
                </h6>
                <div class="habilidades-container-modal">
                    ${perfil.habilidades.split(',').map(h => `
                        <span class="habilidad-tag-modal">${h.trim()}</span>
                    `).join('')}
                </div>
            </div>
        ` : ''}

        <div class="perfil-acciones-modal">
            <button class="btn btn-lg btn-matching" onclick="descargarCVModal(${perfil.id_egresado})">
                <i class="bi bi-download"></i> Descargar CV Completo
            </button>
            <button class="btn btn-lg btn-outline-secondary" onclick="abrirModalContactarDesdePerfilModal(${perfil.id_egresado}, '${perfil.NombreCompleto.replace(/'/g, "\\'")}')">
                <i class="bi bi-envelope-fill"></i> Contactar Egresado
            </button>
        </div>
    `;

    $('#contenidoPerfilCompleto').html(contenido);
}

function cargarCVEnModal(rutaArchivo, nombreArchivo,idEgresado) {
    $('#VerCV').modal('show');
    const cvContainer = $('#cv-container');
    const extension = nombreArchivo.split('.').pop().toLowerCase();

    cvContainer.html(`
        <div class="text-center">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Cargando CV...</span>
            </div>
            <p class="mt-2">Cargando CV...</p>
        </div>
    `);
    AgregarVisualizacion(idEgresado);
    if (extension === 'pdf') {
        mostrarPDF(rutaArchivo, cvContainer);
    } else if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
        mostrarImagen(rutaArchivo, cvContainer);
    } else if (['doc', 'docx'].includes(extension)) {
        mostrarDocumentoWord(rutaArchivo, cvContainer, nombreArchivo);
    }
}
function AgregarVisualizacion(idEgresado) {
    $.ajax({
        url: '/Empresas/AgregarVisualizacion',
        type: 'POST',
        data: { idEgresado: idEgresado },
        success: function (response) {
            if (!response.success) {
                Swal.fire({
                    title: 'Oop Ocurio un error',
                    text: response.message,
                    icon: 'error'
                });
            }
        },
        error: function (error) {
            Swal.fire({
                title: 'Oop Ocurio un error',
                text: error.message,
                icon: 'error'
            });
        }
    })
}
function mostrarPDF(rutaArchivo, container) {
    container.html(`
        <div class="pdf-viewer">
            <embed src="${rutaArchivo}" type="application/pdf" width="100%" height="600px" />
            <div class="mt-2 text-center">
                <small class="text-muted">Si no puedes ver el PDF, 
                    <a href="${rutaArchivo}" target="_blank" class="btn btn-sm btn-outline-primary">ábrelo en una nueva pestaña</a>
                </small>
            </div>
        </div>
    `);
}

function mostrarImagen(rutaArchivo, container) {
    container.html(`
        <div class="image-viewer text-center">
            <img src="${rutaArchivo}" alt="CV" class="img-fluid" style="max-height: 600px;">
            <div class="mt-2">
                <small class="text-muted">Imagen del CV</small>
            </div>
        </div>
    `);
}

function mostrarDocumentoWord(rutaArchivo, container, nombreArchivo) {
    container.html(`
        <div class="document-viewer text-center">
            <div class="alert alert-info">
                <i class="fas fa-file-word fa-3x text-primary mb-3"></i>
                <h5>Documento de Word</h5>
                <p>No se puede previsualizar documentos de Word directamente en el navegador.</p>
                <button class="btn btn-primary" onclick="descargarCV('${rutaArchivo}', '${nombreArchivo}')">
                    <i class="fas fa-download"></i> Descargar Documento
                </button>
            </div>
        </div>
    `);
}

function descargarCVModal(idEgresado) {

    Toastify({
        text: "⏳ Preparando descarga del CV...",
        duration: 2000,
        gravity: "top",
        position: "right",
        style: { background: "#17a2b8" },
    }).showToast();

    window.location.href = `/Empresas/DescargarCVEgresado?idEgresado=${idEgresado}`;

    setTimeout(function () {
        Toastify({
            text: "✅ Descarga iniciada correctamente",
            duration: 3000,
            gravity: "top",
            position: "right",
            style: { background: "#28a745" },
        }).showToast();
    }, 1000);
}

function abrirModalContactarModal(idEgresado, nombreEgresado) {
    $('#idEgresadoContactarModal').val(idEgresado);
    $('#asuntoMensajeModal').val(`Oportunidad Laboral - ${nombreEgresado}`);
    $('#textoMensajeModal').val('');
    modalContactarEgresado.show();
}

function abrirModalContactarDesdePerfilModal(idEgresado, nombreEgresado) {

    if (modalPerfilCompleto) {
        modalPerfilCompleto.hide();
    } else {
        $('#modalPerfilCompleto').modal('hide');
    }

    setTimeout(() => {
        abrirModalContactarModal(idEgresado, nombreEgresado);
    }, 300);
}

function enviarMensajeModal() {
    const idEgresado = $('#idEgresadoContactarModal').val();
    const asunto = $('#asuntoMensajeModal').val().trim();
    const mensaje = $('#textoMensajeModal').val().trim();

    if (!asunto || !mensaje) {
        Swal.fire('Error', 'Por favor completa todos los campos', 'warning');
        return;
    }

    if (mensaje.length < 20) {
        Swal.fire('Error', 'El mensaje debe tener al menos 20 caracteres', 'warning');
        return;
    }

    Swal.fire({
        title: 'Enviando mensaje...',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); }
    });

    $.ajax({
        url: '/Empresas/EnviarMensajeEgresado',
        type: 'POST',
        data: { idEgresado: idEgresado, asunto: asunto, mensaje: mensaje },
        success: function (response) {
            if (response.success) {
                Swal.fire('Éxito', 'Mensaje enviado correctamente', 'success');
                modalContactarEgresado.hide();
                $('#asuntoMensajeModal').val('');
                $('#textoMensajeModal').val('');

                Toastify({
                    text: "Mensaje enviado al egresado",
                    duration: 4000,
                    gravity: "top",
                    position: "right",
                    style: { background: "#28a745" },
                }).showToast();
            } else {
                Swal.fire('Error', response.message, 'error');
            }
        },
        error: function () {
            Swal.fire('Error', 'No se pudo enviar el mensaje', 'error');
        }
    });
}

function cargarTopSectores() {

    $.ajax({
        url: '/Empresas/ObtenerTopSectores',
        type: 'GET',
        beforeSend: function () {
            $('#sectores-container').html(`
                <div class="text-center py-3">
                    <div class="spinner-border spinner-border-sm" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                    <p class="text-muted small mt-2">Cargando sectores...</p>
                </div>
            `);
        },
        success: function (response) {

            if (response.success && response.data && response.data.length > 0) {
                actualizarSectoresUI(response.data);
            } else {
                mostrarMensajeSectoresVacio(response.message);
            }
        },
        error: function (xhr, status, error) {
            console.error('❌ Error al cargar sectores:', error);
            console.error('Respuesta completa:', xhr.responseText);
            mostrarMensajeSectoresVacio('Error al cargar los sectores');
        }
    });
}

function actualizarSectoresUI(sectores) {

    const container = $('#sectores-container');

    if (!sectores || sectores.length === 0) {
        mostrarMensajeSectoresVacio('No hay datos disponibles');
        return;
    }

    container.empty();

    sectores.forEach(function (sector) {
        const nombreSector = sector.Sector || sector.sector || 'Sin nombre';
        const cantidad = sector.Cantidad || sector.cantidad || 0;
        const porcentaje = sector.Porcentaje || sector.porcentaje || 0;

        const html = `
            <div class="mb-3">
                <div class="d-flex justify-content-between mb-1">
                    <span class="small fw-medium">${nombreSector}</span>
                    <span class="small text-muted">${cantidad} candidatos (${porcentaje}%)</span>
                </div>
                <div class="progress" style="height: 8px; border-radius: 4px;">
                    <div class="progress-bar" 
                         style="width: ${porcentaje}%; background-color: #7c2d5e; transition: width 0.6s ease;"
                         role="progressbar"
                         aria-valuenow="${porcentaje}"
                         aria-valuemin="0"
                         aria-valuemax="100">
                    </div>
                </div>
            </div>
        `;
        container.append(html);
    });

}

function mostrarMensajeSectoresVacio(mensaje = 'No hay datos de sectores disponibles') {
    $('#sectores-container').html(`
        <div class="text-center py-4">
            <i class="bi bi-graph-up text-muted" style="font-size: 2rem;"></i>
            <p class="text-muted small mt-2 mb-0">${mensaje}</p>
        </div>
    `);
}

function cargarTopCandidatos() {

    $.ajax({
        url: '/Empresas/ObtenerTopCandidatos',
        type: 'GET',
        success: function (response) {

            if (response.success && response.data && response.data.length > 0) {
                actualizarCandidatosUI(response.data);
            } else {
                mostrarMensajeCandidatosVacio(response.message);
            }
        },
        error: function (xhr, status, error) {
            console.error('❌ Error al cargar candidatos:', error);
            console.error('Respuesta completa:', xhr.responseText);
            mostrarMensajeCandidatosVacio('Error al cargar los candidatos');
        }
    });
}

function actualizarCandidatosUI(candidatos) {
    const container = $('#candidatos-container');

    if (!candidatos || candidatos.length === 0) {
        mostrarMensajeCandidatosVacio('No hay candidatos disponibles');
        return;
    }

    container.empty();

    candidatos.forEach(function (candidato) {
        const nombre = candidato.Nombre || candidato.nombre || 'Sin nombre';
        const carrera = candidato.Carrera || candidato.carrera || 'Sin carrera';
        const vacante = candidato.Vacante || candidato.vacante || 'Sin vacante';
        const estado = candidato.Estado || candidato.estado || 'En revisión';

        const estadoClass = obtenerClaseEstadoCandidato(estado);

        const html = `
            <tr>
                <td><strong>${nombre}</strong></td>
                <td>${carrera}</td>
                <td>${vacante}</td>
                <td>
                    <span class="badge-custom ${estadoClass}">
                        ${estado}
                    </span>
                </td>
            </tr>
        `;
        container.append(html);
    });

}

function mostrarMensajeCandidatosVacio(mensaje = 'No hay candidatos en proceso') {
    $('#candidatos-container').html(`
        <tr>
            <td colspan="4" class="text-center py-4">
                <i class="bi bi-people text-muted" style="font-size: 2rem;"></i>
                <p class="text-muted small mt-2 mb-0">${mensaje}</p>
            </td>
        </tr>
    `);
}

function obtenerClaseEstadoCandidato(estado) {
    const estadoLower = estado.toLowerCase().trim();

    const estados = {
        'entrevista': 'badge-entrevista',
        'en revisión': 'badge-revision',
        'revision': 'badge-revision',
        'revisión': 'badge-revision',
        'oferta': 'badge-oferta',
        'contratado': 'badge-contratado',
        'ideals': 'badge-finalista',
        'finalista': 'badge-finalista'
    };

    return estados[estadoLower] || 'badge-revision';
}

function verificarRespuestasServidor() {

    $.ajax({
        url: '/Empresas/ObtenerTopSectores',
        type: 'GET',
        success: function (response) {
            if (response.data && response.data.length > 0) {
            }
        },
        error: function (xhr) {
            console.error('❌ Error en ObtenerTopSectores:', xhr.responseText);
        }
    });

    $.ajax({
        url: '/Empresas/ObtenerTopCandidatos',
        type: 'GET',
        success: function (response) {
        },
        error: function (xhr) {
            console.error('❌ Error en ObtenerTopCandidatos:', xhr.responseText);
        }
    });
}

function formatearFecha(fechaString) {
    if (!fechaString) return 'No especificado';

    let fecha;

    if (typeof fechaString === 'string' && fechaString.includes('/Date(')) {
        const match = fechaString.match(/\/Date\((\d+)([+-]\d+)?\)\//);
        if (match) {
            const timestamp = parseInt(match[1]);
            fecha = new Date(timestamp);
        } else {
            return 'Formato inválido';
        }
    } else {
        fecha = new Date(fechaString);
    }

    if (isNaN(fecha)) return 'Fecha inválida';

    const opciones = { year: 'numeric', month: 'short' };
    return fecha.toLocaleDateString('es-ES', opciones);
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

    return `${dia} ${mes}, ${año}`;
}

function obtenerClaseEstadoVacante(estado) {
    const estados = {
        'Abierta': 'badge-entrevista',
        'Cerrada': 'badge-cerrada',
        'En Revisión': 'badge-revision',
        'Eliminada': 'badge-eliminada'
    };
    return estados[estado] || 'badge-revision';
}

function obtenerClaseEstadoCandidato(estado) {
    const estados = {
        'Entrevista': 'badge-entrevista',
        'En Revisión': 'badge-revision',
        'Revision': 'badge-revision',
        'Oferta': 'badge-oferta',
        'Contratado': 'badge-contratado',
        'Ideals': 'badge-finalista'
    };
    return estados[estado] || 'badge-revision';
}

function mostrarLoadingModal(mostrar) {
    if (mostrar) {
        $('#loadingEgresados').show();
        $('#listaEgresadosModal').hide();
        $('#emptyStateModal').hide();
    } else {
        $('#loadingEgresados').hide();
        $('#listaEgresadosModal').show();
    }
}

function mostrarEstadoVacioModal() {
    $('#listaEgresadosModal').empty();
    $('#emptyStateModal').show();
}

function verPostulantes(idVacante) {
    console.log('Ver postulantes de vacante:', idVacante);
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
            });
        }
    });
}
$('#PublicarVacante').on('click', function () {
    $('#Agregarvacante').modal('show');
});

function updateProgress() {
    const fields = [
        $('#titulo').val() ? $('#titulo').val().trim() : '',
        $('#area_trabajo').val() ? $('#area_trabajo').val().trim() : '',
        $('#requisitos').val() ? $('#requisitos').val().trim() : '',
        $('#salario_min').val() ? $('#salario_min').val() : '',
        $('#salario_max').val() ? $('#salario_max').val() : '',
        $('#tipo_contrato').val() ? $('#tipo_contrato').val() : '',
        $('#ubicacion').val() ? $('#ubicacion').val().trim() : '',
        $('#modalidad').val() ? $('#modalidad').val() : '',
        $('#fecha_cierre').val() ? $('#fecha_cierre').val() : ''
    ];

    const filledFields = fields.filter(field => field !== '').length;
    const progress = (filledFields / fields.length) * 100;

    $('#progressBarVacante').css('width', progress + '%');

}

function mostrarError(mensaje) {
    Swal.fire({
        title: 'Error de validación',
        html: mensaje,
        icon: 'error',
        confirmButtonColor: '#dc3545',
        showClass: {
            popup: 'animate__animated animate__shakeX'
        }
    });
}
function cancelar() {
    Swal.fire({
        title: '¿Cancelar publicación?',
        text: 'Se perderán todos los datos ingresados',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, cancelar',
        cancelButtonText: 'Continuar editando'
    }).then((result) => {
        if (result.isConfirmed) {
            $('#formVacante')[0].reset();
            updateProgress();
            Swal.fire('Cancelado', 'Los datos han sido descartados', 'info');
        }
    });
}

function updateProgress() {
    const fields = [
        $('#titulo').val() ? $('#titulo').val().trim() : '',
        $('#area_trabajo').val() ? $('#area_trabajo').val().trim() : '',
        $('#requisitos').val() ? $('#requisitos').val().trim() : '',
        $('#salario_min').val() ? $('#salario_min').val() : '',
        $('#salario_max').val() ? $('#salario_max').val() : '',
        $('#tipo_contrato').val() ? $('#tipo_contrato').val() : '',
        $('#ubicacion').val() ? $('#ubicacion').val().trim() : '',
        $('#modalidad').val() ? $('#modalidad').val() : '',
        $('#fecha_cierre').val() ? $('#fecha_cierre').val() : ''
    ];

    const filledFields = fields.filter(field => field !== '').length;
    const progress = (filledFields / fields.length) * 100;

    $('#progressBarVacante').css('width', progress + '%');

}

function mostrarError(mensaje) {
    Swal.fire({
        title: 'Error de validación',
        html: mensaje,
        icon: 'error',
        confirmButtonColor: '#dc3545',
        showClass: {
            popup: 'animate__animated animate__shakeX'
        }
    });
}

function cancelar() {
    Swal.fire({
        title: '¿Cancelar publicación?',
        text: 'Se perderán todos los datos ingresados',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, cancelar',
        cancelButtonText: 'Continuar editando'
    }).then((result) => {
        if (result.isConfirmed) {
            $('#formVacante')[0].reset();
            updateProgress();
            Swal.fire('Cancelado', 'Los datos han sido descartados', 'info');
        }
    });
}

function guardarVacante() {

    const titulo = document.getElementById('titulo') ? document.getElementById('titulo').value : '';
    const areaTrabajo = document.getElementById('area_trabajo') ? document.getElementById('area_trabajo').value : '';
    const requisitos = document.getElementById('requisitos') ? document.getElementById('requisitos').value : '';
    const tipoContrato = document.getElementById('tipo_contrato') ? document.getElementById('tipo_contrato').value : '';
    const ubicacion = document.getElementById('ubicacion') ? document.getElementById('ubicacion').value : '';
    const modalidad = document.getElementById('modalidad') ? document.getElementById('modalidad').value : '';
    const fechaCierre = document.getElementById('fecha_cierre') ? document.getElementById('fecha_cierre').value : '';


    if (!titulo || titulo.trim() === '') {
        Swal.fire({
            title: 'Advertencia',
            text: 'Por favor ingresa el título de la vacante',
            icon: 'warning',
            confirmButtonColor: '#8b1038'
        });
        document.getElementById('titulo').focus();
        return false;
    }

    if (!areaTrabajo || areaTrabajo.trim() === '') {
        Swal.fire({
            title: 'Advertencia',
            text: 'Por favor ingresa el área de trabajo',
            icon: 'warning',
            confirmButtonColor: '#8b1038'
        });
        document.getElementById('area_trabajo').focus();
        return false;
    }

    if (!requisitos || requisitos.trim() === '') {
        Swal.fire({
            title: 'Advertencia',
            text: 'Por favor ingresa los requisitos',
            icon: 'warning',
            confirmButtonColor: '#8b1038'
        });
        document.getElementById('requisitos').focus();
        return false;
    }

    if (!tipoContrato) {
        Swal.fire({
            title: 'Advertencia',
            text: 'Por favor selecciona el tipo de contrato',
            icon: 'warning',
            confirmButtonColor: '#8b1038'
        });
        document.getElementById('tipo_contrato').focus();
        return false;
    }

    if (!ubicacion || ubicacion.trim() === '') {
        Swal.fire({
            title: 'Advertencia',
            text: 'Por favor ingresa la ubicación',
            icon: 'warning',
            confirmButtonColor: '#8b1038'
        });
        document.getElementById('ubicacion').focus();
        return false;
    }

    if (!modalidad) {
        Swal.fire({
            title: 'Advertencia',
            text: 'Por favor selecciona la modalidad de trabajo',
            icon: 'warning',
            confirmButtonColor: '#8b1038'
        });
        document.getElementById('modalidad').focus();
        return false;
    }

    if (!fechaCierre) {
        Swal.fire({
            title: 'Advertencia',
            text: 'Por favor selecciona la fecha de cierre',
            icon: 'warning',
            confirmButtonColor: '#8b1038'
        });
        document.getElementById('fecha_cierre').focus();
        return false;
    }

    const salarioMin = document.getElementById('salario_min') ? document.getElementById('salario_min').value : '';
    const salarioMax = document.getElementById('salario_max') ? document.getElementById('salario_max').value : '';
    const salarioConfidencial = document.getElementById('salario_confidencial') ? document.getElementById('salario_confidencial').value : 'false';
    const estado = document.getElementById('estado') ? document.getElementById('estado').value : 'Activa';

    const formData = {
        titulo: titulo.trim(),
        descripcion: '',
        area: areaTrabajo.trim(),
        requisitos: requisitos.trim(),
        tipo_contrato: tipoContrato,
        modalidad: modalidad,
        ubicacion: ubicacion.trim(),
        salario_min: salarioMin ? parseFloat(salarioMin) : null,
        salario_max: salarioMax ? parseFloat(salarioMax) : null,
        salario_confidencial: salarioConfidencial === 'true',
        fecha_cierre: fechaCierre
    };


    Swal.fire({
        title: '¿Publicar vacante?',
        text: 'La vacante será visible para todos los egresados',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#8b1038',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, publicar',
        cancelButtonText: 'Revisar'
    }).then((result) => {
        if (result.isConfirmed) {
            enviarVacante(formData);
        }
    });

    return false;
}

function limpiarFormularioVacante() {
    if (document.getElementById('titulo')) document.getElementById('titulo').value = '';
    if (document.getElementById('area_trabajo')) document.getElementById('area_trabajo').value = '';
    if (document.getElementById('requisitos')) document.getElementById('requisitos').value = '';
    if (document.getElementById('ubicacion')) document.getElementById('ubicacion').value = '';
    if (document.getElementById('salario_min')) document.getElementById('salario_min').value = '';
    if (document.getElementById('salario_max')) document.getElementById('salario_max').value = '';
    if (document.getElementById('fecha_cierre')) document.getElementById('fecha_cierre').value = '';

    if (document.getElementById('tipo_contrato')) document.getElementById('tipo_contrato').selectedIndex = 0;
    if (document.getElementById('modalidad')) document.getElementById('modalidad').selectedIndex = 0;
    if (document.getElementById('salario_confidencial')) document.getElementById('salario_confidencial').selectedIndex = 0;
}

function enviarVacante(formData) {
    Swal.fire({
        title: 'Publicando vacante...',
        text: 'Por favor espera',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    $.ajax({
        url: '/Empresas/CrearVacante',
        type: 'POST',
        data: formData,
        success: function (response) {
            Swal.close();
            if (response.success) {
                Swal.fire({
                    title: '¡Éxito!',
                    text: 'Vacante creada correctamente',
                    icon: 'success',
                    confirmButtonColor: '#8b1038',
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    $('#modalPublicarVacante').modal('hide');
                    limpiarFormularioVacante();
                    cargarVacantes();
                    ObtenerDatos();

                    Toastify({
                        text: "✅ Vacante publicada exitosamente",
                        duration: 3000,
                        close: true,
                        gravity: "top",
                        position: "right",
                        style: {
                            background: "linear-gradient(to right, #00b09b, #96c93d)"
                        }
                    }).showToast();
                });
            } else {
                Swal.fire('Error', response.message || 'Error al crear la vacante', 'error');
            }
        },
        error: function (xhr, status, error) {
            Swal.close();
            console.error('❌ Error AJAX:', error);
            console.error('Status:', xhr.status);
            console.error('Respuesta:', xhr.responseText);
            let mensaje = 'Error al crear la vacante';
            if (xhr.responseJSON && xhr.responseJSON.message) {
                mensaje = xhr.responseJSON.message;
            }
            Swal.fire('Error', mensaje, 'error');
        }
    });
}

function inicializarGraficoPipeline() {
    var ctx = document.getElementById('pipelineChart').getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Nuevo', 'En proceso', 'Completado'],
            datasets: [{
                label: 'Pipeline por Estado',
                data: [10, 5, 3],
                backgroundColor: ['#007bff', '#ffc107', '#28a745']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
    return myChart;
}
function getBadgeClass(estado) {
    const badges = {
        "Entrevista": "badge-entrevista",
        "En Revisión": "badge-revision",
        "Contratado": "badge-contratado",
        "Oferta": "badge-oferta",
        "Cerrada": "badge-cerrada",
        "Activa": "badge-activa",
        "Borrador": "badge-secondary",
        "Eliminada": "badge-eliminada"
    };
    return badges[estado] || "badge-activa";
}



function cargarVacantes() {
    $.ajax({
        url: '/Empresas/ObtenerVacantes',
        type: 'GET',
        success: function (response) {
            if (!response.success || !response.data || response.data.length === 0) {
                document.querySelector('#tablaVacantes tbody').innerHTML = `
                    <tr>
                        <td colspan="4" class="text-center text-muted py-4">
                            <i class="bi bi-inbox" style="font-size: 2rem;"></i>
                            <p class="mt-2">No hay vacantes registradas</p>
                        </td>
                    </tr>`;
                renderizarControlesPaginacion();
                return;
            }

            todasLasVacantes = response.data;
            renderizarVacantes();
            renderizarControlesPaginacion();
        },
        error: function (xhr, status, error) {
            console.error('Error al cargar vacantes:', error);
            Toastify({
                text: "❌ Error al cargar las vacantes",
                duration: 3000,
                close: true,
                gravity: "top",
                position: "right",
                style: {
                    background: "linear-gradient(to right, #ff5f6d, #ffc371)"
                }
            }).showToast();
        }
    });
}

function renderizarVacantes() {
    const tbody = document.querySelector('#tablaVacantes tbody');
    tbody.innerHTML = '';

    let inicio = (paginaActual - 1) * registrosPorPagina;
    let fin = inicio + registrosPorPagina;
    let vacantesParaMostrar = [];

    if (registrosPorPagina === 'todas') {
        vacantesParaMostrar = todasLasVacantes;
    } else {
        vacantesParaMostrar = todasLasVacantes.slice(inicio, fin);
    }

    vacantesParaMostrar.forEach(vacante => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <strong>${vacante.titulo}</strong><br>
                <small class="text-muted"><i class="bi bi-briefcase"></i> ${vacante.area || 'N/A'}</small>
            </td>
            <td>
                <span class="badge-custom ${getBadgeClass(vacante.estado)}">${vacante.estado}</span>
            </td>
            <td>
                <small>
                    <i class="bi bi-calendar-plus"></i> ${formatearFecha(vacante.fecha_publicacion)}<br>
                    <i class="bi bi-calendar-x"></i> ${formatearFecha(vacante.fecha_cierre)}
                </small>
            </td>
            <td>
                <div class="btn-group" role="group">
                    <button class="btn btn-sm btn-outline-primary" onclick="abrirModalCambiarEstado(${vacante.id_vacante}, '${escaparComillas(vacante.titulo)}', '${vacante.estado}')" title="Cambiar estado">
                        <i class="bi bi-arrow-repeat"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-info" onclick="verDetallesVacante(${vacante.id_vacante})" title="Ver detalles">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-warning" onclick="editarVacante(${vacante.id_vacante})" title="Editar">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="abrirEliminarVacante(${vacante.id_vacante}, '${escaparComillas(vacante.titulo)}')" title="Eliminar">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    actualizarTextoMostrando();
}

const MAX_REGISTROS_RENDERIZAR = 100;
const REGISTROS_RECOMENDADOS = 50;

function renderizarControlesPaginacion() {
    let contenedor = document.getElementById('paginacionVacantes');
    if (!contenedor) {
        contenedor = document.createElement('div');
        contenedor.id = 'paginacionVacantes';
        contenedor.className = 'mt-3';

        const tableResponsive = document.querySelector('.table-responsive');
        if (tableResponsive && tableResponsive.parentNode) {
            tableResponsive.parentNode.insertBefore(contenedor, tableResponsive.nextSibling);
        } else {
            console.error('No se encontró el contenedor table-responsive');
            return;
        }
    }

    const totalPaginas = registrosPorPagina === 'todas'
        ? 1
        : Math.ceil(todasLasVacantes.length / registrosPorPagina);

    let paginasHTML = generarBotonesPaginacion(totalPaginas);

    const mostrarAdvertencia = todasLasVacantes.length > 500 && registrosPorPagina === 'todas';

    contenedor.innerHTML = `
        ${mostrarAdvertencia ? `
            <div class="alert alert-warning alert-dismissible fade show mb-3" role="alert">
                <i class="bi bi-exclamation-triangle-fill"></i>
                <strong>Advertencia:</strong> Tienes ${todasLasVacantes.length} vacantes. 
                Mostrar todas puede afectar el rendimiento. 
                Se recomienda usar paginación de ${REGISTROS_RECOMENDADOS} registros.
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        ` : ''}
        
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div id="infoPaginacion" class="text-muted small"></div>
            <div class="d-flex align-items-center gap-2 flex-wrap">
                <div class="btn-group" role="group">
                    <button class="btn btn-outline-secondary btn-sm" onclick="irAPrimeraPagina()" ${paginaActual === 1 || registrosPorPagina === 'todas' ? 'disabled' : ''} title="Primera página">
                        <i class="bi bi-chevron-bar-left"></i>
                    </button>
                    <button class="btn btn-outline-secondary btn-sm" onclick="cambiarPagina('anterior')" ${paginaActual === 1 || registrosPorPagina === 'todas' ? 'disabled' : ''} title="Anterior">
                        <i class="bi bi-chevron-left"></i>
                    </button>
                    ${paginasHTML}
                    <button class="btn btn-outline-secondary btn-sm" onclick="cambiarPagina('siguiente')" ${paginaActual === totalPaginas || registrosPorPagina === 'todas' ? 'disabled' : ''} title="Siguiente">
                        <i class="bi bi-chevron-right"></i>
                    </button>
                    <button class="btn btn-outline-secondary btn-sm" onclick="irAUltimaPagina()" ${paginaActual === totalPaginas || registrosPorPagina === 'todas' ? 'disabled' : ''} title="Última página">
                        <i class="bi bi-chevron-bar-right"></i>
                    </button>
                </div>
                <select id="selectCantidad" class="form-select form-select-sm" style="width:auto;" onchange="cambiarRegistrosPorPagina()">
                    <option value="10" selected>10 por página</option>
                    <option value="20">20 por página</option>
                    <option value="50">50 por página</option>
                    <option value="100">100 por página</option>
                    ${todasLasVacantes.length <= 500 ? '<option value="todas">Todas</option>' : ''}
                </select>
            </div>
        </div>
    `;

    const select = document.getElementById('selectCantidad');
    if (select && registrosPorPagina !== 'todas') {
        select.value = registrosPorPagina;
    }

    actualizarTextoMostrando();
}

function generarBotonesPaginacion(totalPaginas) {
    if (registrosPorPagina === 'todas' || totalPaginas <= 1) {
        return '<button class="btn btn-primary btn-sm">1</button>';
    }

    let botones = '';
    const rango = 2;

    if (paginaActual > rango + 1) {
        botones += `<button class="btn btn-outline-secondary btn-sm" onclick="irAPagina(1)">1</button>`;
        if (paginaActual > rango + 2) {
            botones += `<button class="btn btn-outline-secondary btn-sm" disabled>...</button>`;
        }
    }

    for (let i = Math.max(1, paginaActual - rango); i <= Math.min(totalPaginas, paginaActual + rango); i++) {
        if (i === paginaActual) {
            botones += `<button class="btn btn-primary btn-sm">${i}</button>`;
        } else {
            botones += `<button class="btn btn-outline-secondary btn-sm" onclick="irAPagina(${i})">${i}</button>`;
        }
    }

    if (paginaActual < totalPaginas - rango) {
        if (paginaActual < totalPaginas - rango - 1) {
            botones += `<button class="btn btn-outline-secondary btn-sm" disabled>...</button>`;
        }
        botones += `<button class="btn btn-outline-secondary btn-sm" onclick="irAPagina(${totalPaginas})">${totalPaginas}</button>`;
    }

    return botones;
}

function irAPagina(numeroPagina) {
    const totalPaginas = Math.ceil(todasLasVacantes.length / registrosPorPagina);
    if (numeroPagina >= 1 && numeroPagina <= totalPaginas) {
        paginaActual = numeroPagina;
        renderizarVacantes();
        renderizarControlesPaginacion();
        scrollearArriba();
    }
}

function irAPrimeraPagina() {
    irAPagina(1);
}

function irAUltimaPagina() {
    const totalPaginas = Math.ceil(todasLasVacantes.length / registrosPorPagina);
    irAPagina(totalPaginas);
}

function cambiarRegistrosPorPagina() {
    const select = document.getElementById('selectCantidad');
    const valorSeleccionado = select.value;

    if (valorSeleccionado === 'todas' && todasLasVacantes.length > MAX_REGISTROS_RENDERIZAR) {
        Swal.fire({
            title: '⚠️ Demasiados registros',
            html: `
                Tienes <strong>${todasLasVacantes.length}</strong> vacantes.<br>
                Mostrar todas puede causar lentitud en el navegador.<br><br>
                <strong>Se recomienda:</strong><br>
                • Usar paginación de ${REGISTROS_RECOMENDADOS} registros<br>
                • Aplicar filtros para reducir resultados
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Mostrar todas de todos modos',
            cancelButtonText: 'Usar paginación recomendada',
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#28a745'
        }).then((result) => {
            if (result.isConfirmed) {
                mostrarLoadingRenderizado();
                registrosPorPagina = 'todas';
                paginaActual = 1;
                setTimeout(() => {
                    renderizarVacantes();
                    renderizarControlesPaginacion();
                }, 100);
            } else {
                select.value = REGISTROS_RECOMENDADOS;
                registrosPorPagina = REGISTROS_RECOMENDADOS;
                paginaActual = 1;
                renderizarVacantes();
                renderizarControlesPaginacion();
            }
        });
        return;
    }

    if (valorSeleccionado === 'todas') {
        mostrarLoadingRenderizado();
        setTimeout(() => {
            registrosPorPagina = 'todas';
            paginaActual = 1;
            renderizarVacantes();
            renderizarControlesPaginacion();
        }, 100);
    } else {
        registrosPorPagina = parseInt(valorSeleccionado);
        paginaActual = 1;
        renderizarVacantes();
        renderizarControlesPaginacion();
    }
}

function cambiarPagina(direccion) {
    const totalPaginas = registrosPorPagina === 'todas'
        ? 1
        : Math.ceil(todasLasVacantes.length / registrosPorPagina);

    if (direccion === 'anterior' && paginaActual > 1) {
        paginaActual--;
    } else if (direccion === 'siguiente' && paginaActual < totalPaginas) {
        paginaActual++;
    }

    renderizarVacantes();
    renderizarControlesPaginacion();
    scrollearArriba();
}

function scrollearArriba() {
    const contenedor = document.querySelector(".table-responsive");
    if (contenedor) {
        contenedor.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
}

function mostrarLoadingRenderizado() {
    const tableBody = document.querySelector('#tableVacantes tbody');
    if (tableBody) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="100" class="text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                    <p class="mt-3 text-muted">Renderizando ${todasLasVacantes.length} vacantes, por favor espera...</p>
                </td>
            </tr>
        `;
    }
}

function actualizarTextoMostrando() {
    const info = document.getElementById('infoPaginacion');
    if (!info) return;

    const total = todasLasVacantes.length;

    if (total === 0) {
        info.innerHTML = '<span class="text-muted">No hay vacantes para mostrar</span>';
        return;
    }

    const inicio = registrosPorPagina === 'todas' ? 1 : (paginaActual - 1) * registrosPorPagina + 1;
    const fin = registrosPorPagina === 'todas'
        ? total
        : Math.min(paginaActual * registrosPorPagina, total);

    let iconoRendimiento = '';
    const registrosActuales = fin - inicio + 1;

    if (registrosActuales > 100) {
        iconoRendimiento = '<i class="bi bi-exclamation-triangle-fill text-warning" title="Muchos registros"></i> ';
    } else if (registrosActuales > 50) {
        iconoRendimiento = '<i class="bi bi-info-circle-fill text-info" title="Cantidad moderada"></i> ';
    }

    info.innerHTML = `
        ${iconoRendimiento}
        Mostrando <strong>${inicio}-${fin}</strong> de <strong>${total}</strong> vacantes
        ${total > 500 ? '<span class="badge bg-warning text-dark ms-2">Dataset grande</span>' : ''}
    `;
}

function escaparComillas(texto) {
    if (!texto) return '';
    return texto.replace(/'/g, "\\'").replace(/"/g, "&quot;");
}
function formatearFecha(fecha) {
    if (!fecha) return '-';

    const date = new Date(fecha);
    if (isNaN(date.getTime())) return '-';

    const opciones = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    };

    return date.toLocaleDateString('es-ES', opciones);
}
function abrirModalCambiarEstado(idVacante, nombreVacante, estadoActual) {
    vacanteSeleccionadaId = idVacante;
    vacanteSeleccionadaNombre = nombreVacante;
    vacanteSeleccionadaEstadoActual = estadoActual;

    document.getElementById('modalCambioVacante').textContent = nombreVacante;
    document.getElementById('modalCambioEstadoActual').textContent = estadoActual;
    document.getElementById('modalCambioEstadoActual').className = 'badge-custom ' + getBadgeClass(estadoActual);

    const selectEstado = document.getElementById('selectEstado');
    selectEstado.value = estadoActual;

    const modal = new bootstrap.Modal(document.getElementById('modalCambiarEstado'));
    modal.show();
}

function confirmarCambioEstado() {
    const nuevoEstado = document.getElementById('selectEstado').value;

    if (nuevoEstado === vacanteSeleccionadaEstadoActual) {
        Toastify({
            text: "⚠️ Selecciona un estado diferente al actual",
            duration: 3000,
            close: true,
            gravity: "top",
            position: "right",
            style: {
                background: "linear-gradient(to right, #ff9800, #ff6b00)"
            }
        }).showToast();
        return;
    }
    Swal.fire({
        title: '¿Confirmar cambio?',
        html: `
            <div class="text-start">
                <p>Cambiarás el estado de:</p>
                <strong class="d-block mb-3">${vacanteSeleccionadaNombre}</strong>
                <hr>
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span>De:</span>
                    <span class="badge bg-secondary px-3 py-2">${vacanteSeleccionadaEstadoActual}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                    <span>A:</span>
                    <span class="badge bg-primary px-3 py-2">${nuevoEstado}</span>
                </div>
            </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: '<i class="bi bi-check-circle"></i> Sí, cambiar',
        cancelButtonText: '<i class="bi bi-x-circle"></i> Cancelar',
        confirmButtonColor: '#8b1038',
        cancelButtonColor: '#6c757d',
        customClass: {
            popup: 'text-start'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            ejecutarCambioEstado(vacanteSeleccionadaId, nuevoEstado);
        }
    });
}

function ejecutarCambioEstado(idVacante, nuevoEstado) {
    Swal.fire({
        title: 'Actualizando estado...',
        html: 'Por favor espera un momento',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    $.ajax({
        url: '/Empresas/CambiarEstadoVacante',
        type: 'POST',
        data: {
            id_vacante: idVacante,
            nuevo_estado: nuevoEstado
        },
        success: function (response) {
            Swal.close();

            if (response.success) {
                const modal = bootstrap.Modal.getInstance(document.getElementById('modalCambiarEstado'));
                if (modal) modal.hide();

                Swal.fire({
                    icon: 'success',
                    title: '¡Estado actualizado!',
                    text: response.message,
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    cargarVacantes();
                    ObtenerDatos();
                    cargarTopCandidatos();
                    if (typeof cargarEstadisticas === 'function') cargarEstadisticas();
                    if (typeof cargarGraficoPipeline === 'function') cargarGraficoPipeline();
                });

                Toastify({
                    text: `✅ ${response.message}`,
                    duration: 3000,
                    close: true,
                    gravity: "top",
                    position: "right",
                    style: {
                        background: "linear-gradient(to right, #00b09b, #96c93d)"
                    }
                }).showToast();

            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: response.message || 'No se pudo actualizar el estado',
                    confirmButtonColor: '#8b1038'
                });
            }
        },
        error: function () {
            Swal.close();

            Swal.fire({
                icon: 'error',
                title: 'Error de conexión',
                text: 'No se pudo conectar con el servidor. Por favor, intenta nuevamente.',
                confirmButtonColor: '#8b1038'
            });
        }
    });
}


function abrirEliminarVacante(idVacante, nombreVacante) {

    vacanteSeleccionadaId = idVacante;
    vacanteSeleccionadaNombre = nombreVacante;

    document.getElementById('modalEliminarNombre').textContent = nombreVacante;
    document.getElementById('modalEliminarCandidatos').textContent = '0';

    const modal = new bootstrap.Modal(document.getElementById('modalEliminarVacante'));
    modal.show();
}
function confirmarEliminacion() {

    Swal.fire({
        title: 'Eliminando...',
        html: 'Por favor espera',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    $.ajax({
        url: '/Empresas/EliminarVacante',
        type: 'POST',
        data: { id_vacante: vacanteSeleccionadaId },
        success: function (response) {

            const modal = bootstrap.Modal.getInstance(document.getElementById('modalEliminarVacante'));
            if (modal) {
                modal.hide();
            }

            if (response.success) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Eliminado!',
                    text: response.message,
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    cargarVacantes();
                    ObtenerDatos();

                    if (typeof cargarEstadisticas === 'function') {
                        cargarEstadisticas();
                    }

                    if (typeof cargarGraficoPipeline === 'function') {
                        cargarGraficoPipeline();
                    }
                });

                Toastify({
                    text: `✅ ${response.message}`,
                    duration: 3000,
                    close: true,
                    gravity: "top",
                    position: "right",
                    style: {
                        background: "linear-gradient(to right, #00b09b, #96c93d)"
                    }
                }).showToast();

            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: response.message,
                    confirmButtonColor: '#8b1038'
                });
            }
        },
        error: function (xhr, status, error) {
            console.error('Error al eliminar:', error);
            console.error('Response:', xhr.responseText);

            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo eliminar la vacante',
                confirmButtonColor: '#8b1038'
            });
        }
    });
}
function verDetallesVacante(idVacante) {

    Swal.fire({
        title: 'Cargando detalles...',
        html: 'Por favor espera',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    $.ajax({
        url: '/Empresas/ObtenerDetalleVacante',
        type: 'GET',
        data: { id_vacante: idVacante },
        success: function (response) {
            Swal.close();

            if (response.success && response.data) {
                const vacante = response.data;

                const detallesHTML = `
                    <div class="text-start">
                        <div class="mb-3">
                            <h5 class="text-primary"><i class="bi bi-briefcase-fill"></i> ${vacante.titulo}</h5>
                            <span class="badge-custom ${getBadgeClass(vacante.estado)}">${vacante.estado}</span>
                        </div>
                        
                        <hr>
                        
                        <div class="row mb-3">
                            <div class="col-6">
                                <strong><i class="bi bi-building"></i> Área:</strong>
                                <p class="mb-0">${vacante.area || 'N/A'}</p>
                            </div>
                            <div class="col-6">
                                <strong><i class="bi bi-geo-alt-fill"></i> Ubicación:</strong>
                                <p class="mb-0">${vacante.ubicacion || 'N/A'}</p>
                            </div>
                        </div>

                        <div class="row mb-3">
                            <div class="col-6">
                                <strong><i class="bi bi-laptop"></i> Modalidad:</strong>
                                <p class="mb-0">${vacante.modalidad || 'N/A'}</p>
                            </div>
                            <div class="col-6">
                                <strong><i class="bi bi-clock"></i> Tipo de Contrato:</strong>
                                <p class="mb-0">${vacante.tipo_contrato || 'N/A'}</p>
                            </div>
                        </div>

                        <div class="mb-3">
                            <strong><i class="bi bi-currency-dollar"></i> Salario:</strong>
                            <p class="mb-0">${vacante.salario_confidencial ?
                        'Confidencial' :
                        `$${vacante.salario_min} - $${vacante.salario_max}`}
                            </p>
                        </div>

                        <div class="mb-3">
                            <strong><i class="bi bi-file-text"></i> Descripción:</strong>
                            <p class="text-muted mb-0">${vacante.descripcion || 'Sin descripción'}</p>
                        </div>

                        <div class="mb-3">
                            <strong><i class="bi bi-list-check"></i> Requisitos:</strong>
                            <p class="text-muted mb-0" style="white-space: pre-line;">${vacante.requisitos || 'Sin requisitos especificados'}</p>
                        </div>

                        <hr>

                        <div class="row">
                            <div class="col-6">
                                <strong><i class="bi bi-calendar-plus"></i> Publicación:</strong>
                                <p class="mb-0">${renderizarFecha(vacante.fecha_publicacion)}</p>
                            </div>
                            <div class="col-6">
                                <strong><i class="bi bi-calendar-x"></i> Cierre:</strong>
                                <p class="mb-0">${renderizarFecha(vacante.fecha_cierre)}</p>
                            </div>
                        </div>
                    </div>
                `;

                const contenedorDetalles = document.getElementById('contenidoDetallesVacante');
                if (contenedorDetalles) {
                    contenedorDetalles.innerHTML = detallesHTML;
                } else {
                    console.error('No se encontró el contenedor contenidoDetallesVacante');
                }

                const modalElement = document.getElementById('modalVerDetalles');
                if (modalElement) {
                    const modal = new bootstrap.Modal(modalElement);
                    modal.show();
                } else {
                    console.error('No se encontró el modal modalVerDetalles');
                }

            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: response.message || 'No se pudieron obtener los detalles',
                    confirmButtonColor: '#8b1038'
                });
            }
        },
        error: function (xhr, status, error) {
            Swal.close();
            console.error('Error al obtener detalles:', error);
            console.error('Status:', status);
            console.error('Response:', xhr.responseText);

            Swal.fire({
                icon: 'error',
                title: 'Error de conexión',
                text: 'No se pudo obtener los detalles de la vacante',
                confirmButtonColor: '#8b1038'
            });
        }
    });
}

function renderizarFecha(fechaString) {
    if (!fechaString) return 'No especificado';

    let fecha;

    if (typeof fechaString === 'string' && fechaString.includes('/Date(')) {
        const match = fechaString.match(/\/Date\((\d+)([+-]\d+)?\)\//);
        if (match) {
            const timestamp = parseInt(match[1]);
            fecha = new Date(timestamp);
        } else {
            return 'Formato inválido';
        }
    } else {
        fecha = new Date(fechaString);
    }

    if (isNaN(fecha)) return 'Fecha inválida';

    const opciones = { day: '2-digit', month: 'short', year: 'numeric' };
    let fechaFormateada = fecha.toLocaleDateString('es-ES', opciones);

    fechaFormateada = fechaFormateada.replace(/\b([a-z])/g, l => l.toUpperCase());

    return fechaFormateada;
}


function editarVacante(idVacante) {

    $.ajax({
        url: '/Empresas/ObtenerDetalleVacante',
        type: 'GET',
        data: { id_vacante: idVacante },
        success: function (response) {

            if (response.success && response.data) {
                const vacante = response.data;

                const elementos = [
                    'edit_id_vacante', 'edit_titulo', 'edit_descripcion',
                    'edit_requisitos', 'edit_salario_min', 'edit_salario_max',
                    'edit_salario_confidencial', 'edit_area', 'edit_tipo_contrato',
                    'edit_ubicacion', 'edit_modalidad', 'edit_estado', 'edit_fecha_cierre'
                ];

                let elementosFaltantes = [];
                elementos.forEach(id => {
                    if (!document.getElementById(id)) {
                        elementosFaltantes.push(id);
                    }
                });

                if (elementosFaltantes.length > 0) {
                    console.error('Elementos faltantes en el formulario:', elementosFaltantes);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Faltan elementos en el formulario de edición',
                        confirmButtonColor: '#8b1038'
                    });
                    return;
                }

                document.getElementById('edit_id_vacante').value = vacante.id_vacante;

                document.getElementById('edit_titulo').value = vacante.titulo || '';
                document.getElementById('edit_descripcion').value = vacante.descripcion || '';
                document.getElementById('edit_requisitos').value = vacante.requisitos || '';
                document.getElementById('edit_salario_min').value = vacante.salario_min || '';
                document.getElementById('edit_salario_max').value = vacante.salario_max || '';
                document.getElementById('edit_salario_confidencial').value = vacante.salario_confidencial ? 'true' : 'false';
                document.getElementById('edit_area').value = vacante.area || '';
                document.getElementById('edit_tipo_contrato').value = vacante.tipo_contrato || '';
                document.getElementById('edit_ubicacion').value = vacante.ubicacion || '';
                document.getElementById('edit_modalidad').value = vacante.modalidad || '';

                const selectEstado = document.getElementById('edit_estado');
                if (selectEstado && vacante.estado) {
                    selectEstado.value = vacante.estado;

                    if (selectEstado.value !== vacante.estado) {
                        console.warn('El estado de la vacante no coincide con las opciones disponibles:', vacante.estado);
                        const option = new Option(vacante.estado, vacante.estado, true, true);
                        selectEstado.add(option);
                    }
                }

                if (vacante.fecha_publicacion) {
                    try {
                        const fechaPublicacion = new Date(vacante.fecha_publicacion);
                        const year = fechaPublicacion.getFullYear();
                        const month = String(fechaPublicacion.getMonth() + 1).padStart(2, '0');
                        const day = String(fechaPublicacion.getDate()).padStart(2, '0');
                        const fechaMinima = `${year}-${month}-${day}`;

                        document.getElementById('edit_fecha_cierre').setAttribute('min', fechaMinima);
                    } catch (e) {
                        console.error('Error al establecer fecha mínima:', e);
                    }
                }

                if (vacante.fecha_cierre) {
                    try {
                        let fecha;

                        if (typeof vacante.fecha_cierre === 'string' && vacante.fecha_cierre.includes('/Date(')) {
                            const match = vacante.fecha_cierre.match(/\/Date\((\d+)([+-]\d+)?\)\//);
                            if (match) {
                                const timestamp = parseInt(match[1]);
                                fecha = new Date(timestamp);
                            } else {
                                throw new Error('Formato de fecha inválido');
                            }
                        } else {
                            fecha = new Date(vacante.fecha_cierre);
                        }

                        if (!isNaN(fecha.getTime())) {
                            const year = fecha.getFullYear();
                            const month = String(fecha.getMonth() + 1).padStart(2, '0');
                            const day = String(fecha.getDate()).padStart(2, '0');
                            const fechaFormateada = `${year}-${month}-${day}`;

                            document.getElementById('edit_fecha_cierre').value = fechaFormateada;
                        } else {
                            console.warn('Fecha inválida recibida:', vacante.fecha_cierre);
                        }
                    } catch (e) {
                        console.error('Error al formatear fecha:', e);
                    }
                }

                const modalElement = document.getElementById('modalEditarVacante');
                if (modalElement) {
                    const modal = new bootstrap.Modal(modalElement);
                    modal.show();
                } else {
                    console.error('No se encontró el modal modalEditarVacante');
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'No se encontró el modal de edición',
                        confirmButtonColor: '#8b1038'
                    });
                }

            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: response.message || 'No se pudieron cargar los datos',
                    confirmButtonColor: '#8b1038'
                });
            }
        },
        error: function (xhr, status, error) {
            console.error('Error al cargar datos:', error);
            console.error('Status:', status);
            console.error('Response:', xhr.responseText);

            Swal.fire({
                icon: 'error',
                title: 'Error de conexión',
                text: 'No se pudieron cargar los datos de la vacante',
                confirmButtonColor: '#8b1038'
            });
        }
    });
}
function guardarEdicionVacante() {

    const idVacante = document.getElementById('edit_id_vacante').value;
    const titulo = document.getElementById('edit_titulo').value.trim();
    const descripcion = document.getElementById('edit_descripcion').value.trim();
    const requisitos = document.getElementById('edit_requisitos').value.trim();
    const salarioMin = parseFloat(document.getElementById('edit_salario_min').value);
    const salarioMax = parseFloat(document.getElementById('edit_salario_max').value);
    const salarioConfidencial = document.getElementById('edit_salario_confidencial').value === 'true';
    const area = document.getElementById('edit_area').value.trim();
    const tipoContrato = document.getElementById('edit_tipo_contrato').value;
    const ubicacion = document.getElementById('edit_ubicacion').value.trim();
    const modalidad = document.getElementById('edit_modalidad').value;
    const estado = document.getElementById('edit_estado').value;
    const fechaCierre = document.getElementById('edit_fecha_cierre').value;

    if (!titulo) {
        Toastify({
            text: "⚠️ El título es obligatorio",
            duration: 3000,
            gravity: "top",
            position: "right",
            style: { background: "linear-gradient(to right, #ff9800, #ff6b00)" }
        }).showToast();
        return;
    }

    if (!requisitos) {
        Toastify({
            text: "⚠️ Los requisitos son obligatorios",
            duration: 3000,
            gravity: "top",
            position: "right",
            style: { background: "linear-gradient(to right, #ff9800, #ff6b00)" }
        }).showToast();
        return;
    }

    if (!salarioMin || !salarioMax) {
        Toastify({
            text: "⚠️ Los rangos salariales son obligatorios",
            duration: 3000,
            gravity: "top",
            position: "right",
            style: { background: "linear-gradient(to right, #ff9800, #ff6b00)" }
        }).showToast();
        return;
    }

    if (salarioMin > salarioMax) {
        Toastify({
            text: "⚠️ El salario mínimo no puede ser mayor al máximo",
            duration: 3000,
            gravity: "top",
            position: "right",
            style: { background: "linear-gradient(to right, #ff9800, #ff6b00)" }
        }).showToast();
        return;
    }

    if (!area) {
        Toastify({
            text: "⚠️ El área de trabajo es obligatoria",
            duration: 3000,
            gravity: "top",
            position: "right",
            style: { background: "linear-gradient(to right, #ff9800, #ff6b00)" }
        }).showToast();
        return;
    }

    if (!tipoContrato) {
        Toastify({
            text: "⚠️ El tipo de contrato es obligatorio",
            duration: 3000,
            gravity: "top",
            position: "right",
            style: { background: "linear-gradient(to right, #ff9800, #ff6b00)" }
        }).showToast();
        return;
    }

    if (!ubicacion) {
        Toastify({
            text: "⚠️ La ubicación es obligatoria",
            duration: 3000,
            gravity: "top",
            position: "right",
            style: { background: "linear-gradient(to right, #ff9800, #ff6b00)" }
        }).showToast();
        return;
    }

    if (!modalidad) {
        Toastify({
            text: "⚠️ La modalidad es obligatoria",
            duration: 3000,
            gravity: "top",
            position: "right",
            style: { background: "linear-gradient(to right, #ff9800, #ff6b00)" }
        }).showToast();
        return;
    }

    if (!fechaCierre) {
        Toastify({
            text: "⚠️ La fecha de cierre es obligatoria",
            duration: 3000,
            gravity: "top",
            position: "right",
            style: { background: "linear-gradient(to right, #ff9800, #ff6b00)" }
        }).showToast();
        return;
    }

    Swal.fire({
        title: '¿Guardar cambios?',
        text: "Se actualizará la información de la vacante",
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: '<i class="bi bi-check-circle"></i> Sí, guardar',
        cancelButtonText: '<i class="bi bi-x-circle"></i> Cancelar',
        confirmButtonColor: '#8b1038',
        cancelButtonColor: '#6c757d'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: '/Empresas/ActualizarVacante',
                type: 'POST',
                data: {
                    id_vacante: idVacante,
                    titulo: titulo,
                    descripcion: descripcion,
                    requisitos: requisitos,
                    salario_min: salarioMin,
                    salario_max: salarioMax,
                    salario_confidencial: salarioConfidencial,
                    area: area,
                    tipo_contrato: tipoContrato,
                    ubicacion: ubicacion,
                    modalidad: modalidad,
                    estado: estado,
                    fecha_cierre: fechaCierre
                },
                success: function (response) {
                    if (response.success) {
                        const modal = bootstrap.Modal.getInstance(document.getElementById('modalEditarVacante'));
                        if (modal) {
                            modal.hide();
                        }

                        Swal.fire({
                            icon: 'success',
                            title: '¡Actualizado!',
                            text: response.message,
                            timer: 2000,
                            showConfirmButton: false
                        }).then(() => {
                            cargarVacantes();
                            ObtenerDatos();
                            cargarTopCandidatos();
                        });

                        Toastify({
                            text: `✅ ${response.message}`,
                            duration: 3000,
                            close: true,
                            gravity: "top",
                            position: "right",
                            style: {
                                background: "linear-gradient(to right, #00b09b, #96c93d)"
                            }
                        }).showToast();

                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: response.message,
                            confirmButtonColor: '#8b1038'
                        });
                    }
                },
                error: function (xhr, status, error) {
                    console.error('Error al actualizar:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error de conexión',
                        text: 'No se pudo actualizar la vacante',
                        confirmButtonColor: '#8b1038'
                    });
                },
                beforeSend: function () {
                    Swal.fire({
                        title: 'Guardando cambios...',
                        html: 'Por favor espera',
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        didOpen: () => {
                            Swal.showLoading();
                        }
                    });
                }
            });
        }
    });
}
function establecerFechaMinimaEdicion(fechaPublicacion) {
    const inputFechaCierre = document.getElementById('edit_fecha_cierre');
    if (inputFechaCierre && fechaPublicacion) {
        const fecha = new Date(fechaPublicacion);
        const year = fecha.getFullYear();
        const month = String(fecha.getMonth() + 1).padStart(2, '0');
        const day = String(fecha.getDate()).padStart(2, '0');
        const fechaMinima = `${year}-${month}-${day}`;

        inputFechaCierre.setAttribute('min', fechaMinima);
    }
}

