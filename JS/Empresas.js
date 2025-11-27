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
        ActualizarEstadisticas();
        return;
    }
    if (tipo === 'nueva_Postulacion') {
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

const COLORES_ESTADOS = {
    'Abierta': '#17a2b8',
    'Cerrado': '#dc3545',
    'Cerrada': '#dc3545',
    'Contratado': '#28a745',
    'En Revisión': '#6c757d',
    'En Revision': '#6c757d',
    'Entrevista': '#ffc107',
    'Oferta': '#fd7e14'
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

let paginaActualVacantesRecientes = 1;
let vacantesPorPaginaRecientes = 10;

let todosLosEgresados = [];
let paginaActualEgresados = 1;
const egresadosPorPagina = 10;

$(document).ready(function () {

    setTimeout(function () {
        manejarDropdowns();
        reinicializarBootstrapDropdowns();
    }, 500);

    window.addEventListener('resize', function () {
        document.querySelectorAll('.dropdown-Opciones .dropdown-menu.show').forEach(function (menu) {
            const toggle = menu.previousElementSibling;
            if (toggle && toggle.classList.contains('dropdown-toggle')) {
                posicionarDropdownCorrectamente(toggle);
            }
        });
    });

    window.addEventListener('scroll', function () {
        document.querySelectorAll('.dropdown-Opciones .dropdown-menu.show').forEach(function (menu) {
            const toggle = menu.previousElementSibling;
            if (toggle && toggle.classList.contains('dropdown-toggle')) {
                posicionarDropdownCorrectamente(toggle);
            }
        });
    });


    ObtenerDatos();
    inicializarSliders();
    cargarTopSectores();
    cargarVacantes();
    renderizarControlesPaginacion();
    forzarActualizacionNotificaciones();

    setTimeout(function () {
        manejarDropdowns();
        configurarCierreDropdowns();
        reinicializarBootstrapDropdowns();
    }, 500);


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
                cargarNotificacionesActivas();

            } else {
                Swal.fire('Error', response.message || 'No se pudieron obtener los datos de la empresa.');
            }
        },
        error: function (error) {
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
            Swal.fire('Error', 'No se pudieron obtener los datos de la empresa.');
        }
    });
}

function renderDatosEmpresa(empresa) {
    $('h5.mb-1').text(empresa.razon_social + ' • Panel de Empresa');
    nombreEmpresa = empresa.razon_social;
    const infoEmpresa = `${empresa.sector_economico || 'Sin sector'} • ${empresa.tamano_empresa || 'Sin tamaño'} • ${empresa.nit || 'Sin NIT'}`;
    $('.company-subtitle').text(infoEmpresa);

    renderEstadisticas(empresa.Estadisticas);
    renderVacantesRecientes(empresa.VacantesRecientes);
    renderCandidatosEnProceso(empresa.CandidatosEnProceso);
}


function renderEstadisticas(estadisticas) {
    if (!estadisticas) return;

    $('.stat-card').eq(0).find('.stat-value').text(estadisticas.VacantesActivas || 0);
    $('.stat-card').eq(1).find('.stat-value').text(estadisticas.TotalCandidatos || 0);
    $('.stat-card').eq(2).find('.stat-value').text(estadisticas.NotificacionesActivas || 0);
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
            mostrarLoadingModal(false);
            Swal.fire('Error', 'No se pudieron cargar los egresados', 'error');
            mostrarEstadoVacioModal();
        }
    });
}

function aplicarFiltrosModal() {
    const carrera = $('#filtroCarreraModal').val().trim();
    const habilidad = $('#filtroHabilidadModal').val().trim();

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
            mostrarLoadingModal(false);
            Swal.fire('Error', 'Error al aplicar filtros', 'error');
        }
    });
}

function limpiarFiltrosModal() {
    $('#filtroCarreraModal').val('');
    $('#filtroHabilidadModal').val('');

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
                            <button class="btn btn-sm btn-outline-secondary" onclick="contactarEgresadoDesdeModal(${egresado.id_egresado}, '${egresado.NombreCompleto.replace(/'/g, "\\'")}', '${egresado.email || ''}')">
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
            <button class="btn btn-lg btn-outline-secondary" onclick="contactarEgresadoDesdeModal(${perfil.id_egresado}, '${perfil.NombreCompleto.replace(/'/g, "\\'")}', '${perfil.email || ''}')">
                <i class="bi bi-envelope-fill"></i> Contactar Egresado
            </button>
        </div>
    `;

    $('#contenidoPerfilCompleto').html(contenido);
}

function cargarCVEnModal(rutaArchivo, nombreArchivo, idEgresado) {
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

function contactarEgresadoDesdeModal(idEgresado, nombreEgresado, emailEgresado) {
    if (modalPerfilCompleto) {
        modalPerfilCompleto.hide();
    } else {
        $('#modalPerfilCompleto').modal('hide');
    }

    setTimeout(() => {
        $('#nombreEgresadoContactar').text(nombreEgresado);
        $('#emailEgresadoContactar').text(emailEgresado);

        const empresa = nombreEmpresa;

        const asuntoPredeterminado = `Oportunidad Laboral - ${empresa}`;
        $('#asuntoContactoEgresado').val(asuntoPredeterminado);

        const mensajePredeterminado = `Estimado/a ${nombreEgresado},

            Nos complace informarle que su perfil profesional ha captado nuestro interés. Nos gustaría conocer más sobre su experiencia y habilidades.

            Por favor, indíquenos su disponibilidad para una conversación telefónica o reunión virtual en los próximos días.

            Quedamos atentos a su respuesta.

            Saludos cordiales,
        ${empresa}`;

        $('#mensajeContactoEgresado').val(mensajePredeterminado);

        $('#modalContactarEgresado').attr('data-id-egresado-directo', idEgresado);

        $('#modalContactarEgresado').modal('show');
    }, 300);
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
                mostrarMensajeSectoresVacio(response.message || 'No hay datos de sectores disponibles');
            }
        },
        error: function (xhr, status, error) {
            mostrarMensajeSectoresVacio('Error al cargar los sectores');
        }
    });
}

function actualizarSectoresUI(sectores) {
    const container = $('#sectores-container');
    container.empty();

    if (!sectores || sectores.length === 0) {
        mostrarMensajeSectoresVacio('No hay candidatos postulados a tus vacantes');
        return;
    }

    const totalCandidatos = sectores.reduce((sum, sector) => sum + (sector.Cantidad || 0), 0);

    const coloresSectores = {
        'Tecnología': '#7c2d5e',
        'Ingeniería': '#2563eb',
        'Consultoría': '#059669',
        'Negocios y Administración': '#dc2626',
        'Ciencias Económicas': '#d97706',
        'Salud': '#dc2626',
        'Derecho': '#7c3aed',
        'Humanidades': '#db2777',
        'Arquitectura y Diseño': '#0891b2',
        'Ciencias': '#65a30d',
        'Otros': '#6b7280',
        'Sin especificar': '#9ca3af'
    };

    let porcentajeAcumulado = 0;

    sectores.forEach(function (sector, index) {
        const nombre = sector.Sector || sector.sector || 'Sin especificar';
        const cantidad = sector.Cantidad || sector.cantidad || 0;
        const totalPost = sector.TotalPostulaciones || cantidad;

        let porcentaje = sector.Porcentaje || sector.porcentaje || 0;

        if (index === sectores.length - 1 && porcentajeAcumulado + porcentaje !== 100) {
            porcentaje = Math.max(0, 100 - porcentajeAcumulado);
        } else {
            porcentajeAcumulado += porcentaje;
        }

        const colorBarra = coloresSectores[nombre] || '#7c2d5e';

        const html = `
            <div class="mb-3">
                <div class="d-flex justify-content-between mb-1">
                    <span class="small fw-medium">
                        ${nombre}
                    </span>
                    <span class="small text-muted">
                        ${cantidad} candidato${cantidad !== 1 ? 's' : ''} (${porcentaje}%)
                    </span>
                </div>
                <div class="progress" style="height: 8px; border-radius: 4px;">
                    <div class="progress-bar" 
                         style="width: ${porcentaje}%; background-color: ${colorBarra}; transition: width 0.6s ease;"
                         role="progressbar"
                         aria-valuenow="${porcentaje}"
                         aria-valuemin="0"
                         aria-valuemax="100">
                    </div>
                </div>
                ${totalPost > cantidad ?
                `<small class="text-muted">${totalPost} postulaciones</small>` : ''}
            </div>
        `;
        container.append(html);
    });

    container.prepend(`
        <div class="mb-3">
            <small class="text-muted">Top sectores de candidatos</small>
        </div>
    `);

    container.append(`
        <div class="text-center mt-3 pt-2 border-top">
            <small class="text-muted">
                <strong>Resumen:</strong> ${totalCandidatos} candidato${totalCandidatos !== 1 ? 's' : ''} 
                en ${sectores.reduce((sum, sector) => sum + (sector.TotalPostulaciones || sector.Cantidad || 0), 0)} postulaciones
            </small>
        </div>
    `);
}

function mostrarMensajeSectoresVacio(mensaje = 'No hay datos de sectores disponibles') {
    $('#sectores-container').html(`
        <div class="text-center py-4">
            <i class="bi bi-graph-up text-muted" style="font-size: 2rem;"></i>
            <p class="text-muted small mt-2 mb-0">${mensaje}</p>
            <small class="text-muted">
                Los sectores se basan en las carreras de los candidatos que se han postulado a tus vacantes.
                <br>Actualmente no hay suficientes datos para mostrar la distribución.
            </small>
        </div>
    `);
}

let todosLosCandidatos = [];

function cargarTopCandidatos() {
    $.ajax({
        url: '/Empresas/ObtenerTopCandidatos',
        type: 'GET',
        success: function (response) {
        },
        error: function (xhr, status, error) {
        }
    });
}

function filtrarCandidatos() {
    const filtro = $('#filtroEstadoCandidatos').val();
    const container = $('#candidatos-container');

    let candidatosFiltrados = todosLosCandidatos;

    if (filtro !== 'todos') {
        candidatosFiltrados = todosLosCandidatos.filter(candidato => {
            const estado = candidato.Estado || candidato.estado;
            return estado === filtro;
        });
    }

    container.empty();

    if (candidatosFiltrados.length === 0) {
        mostrarMensajeCandidatosVacio('No hay candidatos con el estado seleccionado');
        return;
    }

    candidatosFiltrados.forEach(function (candidato) {
        const nombre = candidato.Nombre || candidato.nombre || 'Sin nombre';
        const carrera = candidato.Carrera || candidato.carrera || 'Sin carrera';
        const vacante = candidato.Vacante || candidato.vacante || 'Sin vacante';
        const estado = candidato.Estado || candidato.estado || 'En revisión';
        const idPostulacion = candidato.id_postulacion;
        const idEgresado = candidato.id_egresado;

        const estadoClass = obtenerClaseEstadoCandidato(estado);

        if (!idPostulacion || !idEgresado) {
            return;
        }

        let botonesAccion = '';
        if (estado === 'Contratado') {
            botonesAccion = `
                <button class="btn btn-outline-warning btn-sm" 
                        onclick="revertirContratacion(${idPostulacion}, '${escaparComillas(nombre)}')"
                        title="Revertir contratación">
                    <i class="bi bi-arrow-counterclockwise"></i>
                </button>
                <button class="btn btn-outline-warning btn-sm" 
                        onclick="abrirModalCalificar(${idPostulacion}, '${escaparComillas(nombre)}')"
                        title="Calificar">
                    <i class="bi bi-star"></i>
                </button>
            `;
        } else if (estado !== 'Rechazado') {
            botonesAccion = `
                <button class="btn btn-outline-success btn-sm" 
                        onclick="abrirModalContratacion(${idPostulacion}, '${escaparComillas(nombre)}')"
                        title="Contratar">
                    <i class="bi bi-check-circle"></i>
                </button>
                <button class="btn btn-outline-primary btn-sm" 
                        onclick="abrirModalCambiarEstadoPostulacion(${idPostulacion}, '${escaparComillas(nombre)}', '${estado}')"
                        title="Cambiar estado">
                    <i class="bi bi-arrow-repeat"></i>
                </button>
            `;
        }

        botonesAccion += `
            <button class="btn btn-outline-info btn-sm" 
                    onclick="verPerfilCompletoModal(${idEgresado})"
                    title="Ver perfil">
                <i class="bi bi-eye"></i>
            </button>
        `;

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
                <td>
                    <div class="btn-group btn-group-sm" role="group">
                        ${botonesAccion}
                    </div>
                </td>
            </tr>
        `;
        container.append(html);
    });
}
function revertirContratacion(idPostulacion, nombreCandidato) {
    Swal.fire({
        title: '¿Revertir contratación?',
        html: `
            <div class="text-start">
                <p>¿Estás seguro de que deseas revertir la contratación de <strong>${nombreCandidato}</strong>?</p>
                <div class="alert alert-warning">
                    <i class="bi bi-exclamation-triangle"></i>
                    El estado volverá a "Oferta" y el candidato recibirá una notificación.
                </div>
            </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: '<i class="bi bi-arrow-counterclockwise"></i> Sí, revertir',
        cancelButtonText: '<i class="bi bi-x-circle"></i> Cancelar',
        confirmButtonColor: '#ffc107',
        cancelButtonColor: '#6c757d'
    }).then((result) => {
        if (result.isConfirmed) {
            ejecutarRevertirContratacion(idPostulacion, nombreCandidato);
        }
    });
}

function ejecutarRevertirContratacion(idPostulacion, nombreCandidato) {
    Swal.fire({
        title: 'Revertiendo...',
        html: 'Por favor espera',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    $.ajax({
        url: '/Empresas/RevertirContratacion',
        type: 'POST',
        data: { id_postulacion: idPostulacion },
        success: function (response) {
            Swal.close();

            if (response.success) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Contratación revertida!',
                    text: response.message,
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    cargarTopCandidatos();
                    ActualizarEstadisticas();
                });

                Toastify({
                    text: `✅ ${response.message}`,
                    duration: 3000,
                    gravity: "top",
                    position: "right",
                    style: { background: "linear-gradient(to right, #00b09b, #96c93d)" }
                }).showToast();
            } else {
                Swal.fire('Error', response.message, 'error');
            }
        },
        error: function (xhr, status, error) {
            Swal.close();
            Swal.fire('Error', 'No se pudo revertir la contratación', 'error');
        }
    });
}

function mostrarMensajeCandidatosVacio(mensaje = 'No hay candidatos en proceso') {
    $('#candidatos-container').html(`
        <tr>
            <td colspan="5" class="text-center py-4">
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
        'finalista': 'badge-finalista',
        'rechazado': 'badge-rechazado'
    };

    return estados[estadoLower] || 'badge-revision';
}

function verificarRespuestasServidor() {

    $.ajax({
        url: '/Empresas/ObtenerTopSectores',
        type: 'GET',
        success: function (response) {
        },
        error: function (xhr) {
        }
    });

    $.ajax({
        url: '/Empresas/ObtenerTopCandidatos',
        type: 'GET',
        success: function (response) {
        },
        error: function (xhr) {
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
    const estadoNormalizado = estado.toLowerCase().trim().replace(/\s+/g, '');

    const estados = {
        'abierta': 'badge-celeste',
        'cerrada': 'badge-rojo',
        'cerrado': 'badge-rojo',
        'contratado': 'badge-verde',
        'enrevisión': 'badge-gris',
        'enrevision': 'badge-gris',
        'revisión': 'badge-gris',
        'revision': 'badge-gris',
        'entrevista': 'badge-amarillo',
        'oferta': 'badge-naranja',
        'borrador': 'badge-secondary',
        'eliminada': 'badge-eliminada'
    };

    return estados[estadoNormalizado] || 'badge-celeste';
}

function normalizarTextoEstado(estado) {
    const estadoNormalizado = estado.toLowerCase().trim();

    const textosCorrectos = {
        'cerrado': 'Cerrada',
        'cerrada': 'Cerrada',
        'abierta': 'Abierta',
        'abierto': 'Abierta',
        'activa': 'Activa',
        'activo': 'Activa',
        'en revisión': 'En Revisión',
        'revision': 'En Revisión',
        'revisión': 'En Revisión',
        'entrevista': 'Entrevista',
        'oferta': 'Oferta',
        'contratado': 'Contratado',
        'contratada': 'Contratado',
        'eliminada': 'Eliminada',
        'eliminado': 'Eliminada',
        'borrador': 'Borrador'
    };

    return textosCorrectos[estadoNormalizado] || estado;
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
            let mensaje = 'Error al crear la vacante';
            if (xhr.responseJSON && xhr.responseJSON.message) {
                mensaje = xhr.responseJSON.message;
            }
            Swal.fire('Error', mensaje, 'error');
        }
    });
}

var pipelineChart = null;

function inicializarGraficoPipeline() {
    var ctx = document.getElementById('pipelineChart').getContext('2d');

    if (pipelineChart) {
        pipelineChart.destroy();
    }

    pipelineChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Vacantes por Estado',
                data: [],
                backgroundColor: []

            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            var label = context.dataset.label || '';
                            var value = context.parsed.y || 0;
                            var porcentaje = context.raw.porcentaje || 0;
                            return label + ': ' + value + ' (' + porcentaje + '%)';
                        }
                    }
                }
            }
        }
    });

    cargarDatosPipeline();
}


function cargarDatosPipeline() {
    $.ajax({
        url: '/Empresas/ObtenerPipelineVacantesPorEstado',
        method: 'GET',
        success: function (response) {
            if (response.exito && response.data) {
                actualizarGraficoPipeline(response.data);
            } else {
                mostrarGraficoPipelineVacio();
            }
        },
        error: function (xhr, status, error) {
            mostrarGraficoPipelineVacio();
        }
    });
}

function actualizarGraficoPipeline(datos) {
    if (!pipelineChart) {
        return;
    }

    if (!datos || datos.length === 0) {
        mostrarGraficoPipelineVacio();
        return;
    }

    var labels = datos.map(item => item.Estado);
    var valores = datos.map(item => item.Cantidad);
    var colores = labels.map(estado => obtenerColorPorEstado(estado));

    pipelineChart.data.labels = labels;
    pipelineChart.data.datasets[0].data = valores;
    pipelineChart.data.datasets[0].backgroundColor = colores;

    pipelineChart.update();
}


function obtenerColorPorEstado(estado) {
    var colores = {
        'Abierta': '#17a2b8',
        'Activa': '#17a2b8',
        'Cerrada': '#dc3545',
        'Cerrado': '#dc3545',
        'Contratado': '#28a745',
        'En Revisión': '#6c757d',
        'En Revision': '#6c757d',
        'Revision': '#6c757d',
        'Revisión': '#6c757d',
        'Entrevista': '#ffc107',
        'Oferta': '#fd7e14',
        'Borrador': '#6c757d'
    };

    return colores[estado] || '#6c757d';
}


function mostrarGraficoPipelineVacio() {
    if (!pipelineChart) return;

    pipelineChart.data.labels = ['Sin datos'];
    pipelineChart.data.datasets[0].data = [1];
    pipelineChart.data.datasets[0].backgroundColor = ['#e0e0e0'];
    pipelineChart.update();
}


function obtenerIdEmpresa() {
    return sessionStorage.getItem('idEmpresa') ||
        document.getElementById('idEmpresa')?.value ||
        window.idEmpresaGlobal;
}

$(document).ready(function () {
    inicializarGraficoPipeline();

    setInterval(cargarDatosPipeline, 60000);
});

function getBadgeClass(estado) {
    const badges = {
        "Abierta": "badge-celeste",
        "Activa": "badge-celeste",
        "Cerrada": "badge-rojo",
        "Cerrado": "badge-rojo",
        "Contratado": "badge-verde",
        "En Revisión": "badge-gris",
        "Revision": "badge-gris",
        "Entrevista": "badge-amarillo",
        "Oferta": "badge-naranja",
        "Borrador": "badge-secondary",
        "Eliminada": "badge-eliminada"
    };
    return badges[estado] || "badge-celeste";
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
            reinicializarDropdowns();

        },
        error: function (xhr, status, error) {
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

    if (window.innerWidth <= 768) {
        const table = document.querySelector('#tablaVacantes');
        if (table) {
            table.style.tableLayout = 'auto';
            const headers = table.querySelectorAll('th');
            headers.forEach((th, index) => {
                if (index === 0) th.style.minWidth = '120px';
                else if (index === 1) th.style.minWidth = '80px';
                else if (index === 2) th.style.minWidth = '100px';
                else if (index === 3) th.style.minWidth = '100px';
            });
        }
    }

    vacantesParaMostrar.forEach((vacante, index) => {
        const tr = document.createElement('tr');
        const estadoClass = getBadgeClass(vacante.estado);
        const fechaPublicacion = formatearFecha(vacante.fecha_publicacion);
        const fechaCierre = formatearFecha(vacante.fecha_cierre);

        const totalPostulaciones = vacante.total_postulaciones || 0;

        const dropdownOpciones = `
    <div class="dropdown dropdown-Opciones">
        <button class="btn btn-outline-secondary btn-sm dropdown-toggle"
                type="button"
                id="dropdownOpciones${vacante.id_vacante}" 
                data-bs-toggle="dropdown" 
                aria-expanded="false"
                style="position: relative; padding: 6px 12px;">
            <i class="bi bi-three-dots-vertical"></i> Opciones
            ${totalPostulaciones > 0 ? `
                <span class="badge-postulaciones">${totalPostulaciones}</span>
            ` : ''}
        </button>
        <ul class="dropdown-menu dropdown-menu-end shadow" aria-labelledby="dropdownOpciones${vacante.id_vacante}">
            <li>
                <a class="dropdown-item item-verde" href="javascript:void(0)" 
                   onclick="abrirModalGestionPostulaciones(${vacante.id_vacante}, '${escaparComillas(vacante.titulo)}')">
                    <i class="bi bi-people"></i>
                    <span>Ver Postulaciones ${totalPostulaciones > 0 ? `<strong>(${totalPostulaciones})</strong>` : ''}</span>
                </a>
            </li>
            <li><hr class="dropdown-divider"></li>
            <li>
                <a class="dropdown-item item-azul" href="javascript:void(0)" 
                   onclick="abrirModalCambiarEstado(${vacante.id_vacante}, '${escaparComillas(vacante.titulo)}', '${vacante.estado}')">
                    <i class="bi bi-arrow-repeat"></i>
                    <span>Cambiar Estado</span>
                </a>
            </li>
            <li>
                <a class="dropdown-item item-celeste" href="javascript:void(0)" 
                   onclick="verDetallesVacante(${vacante.id_vacante})">
                    <i class="bi bi-eye"></i>
                    <span>Ver Detalles</span>
                </a>
            </li>
            <li>
                <a class="dropdown-item item-amarillo" href="javascript:void(0)" 
                   onclick="editarVacante(${vacante.id_vacante})">
                    <i class="bi bi-pencil"></i>
                    <span>Editar</span>
                </a>
            </li>
            <li><hr class="dropdown-divider"></li>
            <li>
                <a class="dropdown-item item-rojo" href="javascript:void(0)" 
                   onclick="abrirEliminarVacante(${vacante.id_vacante}, '${escaparComillas(vacante.titulo)}')">
                    <i class="bi bi-trash"></i>
                    <span>Eliminar</span>
                </a>
            </li>
        </ul>
    </div>
`;

        tr.innerHTML = `
            <td>
                <strong>${vacante.titulo}</strong><br>
                <small class="text-muted"><i class="bi bi-briefcase"></i> ${vacante.area || 'N/A'}</small>
            </td>
            <td>
                <span class="badge-custom ${estadoClass}">${vacante.estado}</span>
            </td>
            <td>
                <small>
                    <i class="bi bi-calendar-plus"></i> ${fechaPublicacion}<br>
                    <i class="bi bi-calendar-x"></i> ${fechaCierre}
                </small>
            </td>
            <td>
                ${dropdownOpciones}
            </td>
        `;
        tbody.appendChild(tr);
    });

    setTimeout(() => {
        reinicializarDropdowns();
    }, 200);

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



function cambiarPagina(numeroPagina) {
    const totalPaginas = Math.ceil(todasLasVacantes.length / registrosPorPagina);
    if (numeroPagina >= 1 && numeroPagina <= totalPaginas) {
        paginaActual = numeroPagina;
        renderizarVacantes();
        renderizarControlesPaginacion();
        scrollearArriba();

        setTimeout(() => {
            reinicializarDropdowns();
        }, 300);
    }
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
                    cargarDatosPipeline();

                    if (typeof ActualizarEstadisticas === 'function') {
                        ActualizarEstadisticas();
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
                }

                const modalElement = document.getElementById('modalVerDetalles');
                if (modalElement) {
                    const modal = new bootstrap.Modal(modalElement);
                    modal.show();
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
                        }
                    } catch (e) {
                    }
                }

                const modalElement = document.getElementById('modalEditarVacante');
                if (modalElement) {
                    const modal = new bootstrap.Modal(modalElement);
                    modal.show();
                } else {
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

let postulacionSeleccionadaId = null;
let calificacionActual = 0;
function verPostulantes(idVacante) {
    $('#modalVerPostulaciones').modal('show');
    cargarPostulaciones(idVacante);
}

function cargarPostulaciones(idVacante) {
    $('#loadingPostulaciones').show();
    $('#contenidoPostulaciones').hide();

    $.ajax({
        url: '/Empresas/ObtenerPostulacionesPorVacante',
        type: 'GET',
        data: { id_vacante: idVacante },
        success: function (response) {
            $('#loadingPostulaciones').hide();

            if (response.success && response.data) {
                const datos = response.data;
                $('#nombreVacantePostulaciones').text(datos.nombreVacante);
                $('#totalPostulaciones').text(datos.total);

                if (datos.postulaciones && datos.postulaciones.length > 0) {
                    renderizarPostulaciones(datos.postulaciones);
                    $('#contenidoPostulaciones').show();
                    $('#emptyStatePostulaciones').hide();
                } else {
                    $('#contenidoPostulaciones').show();
                    $('#emptyStatePostulaciones').show();
                    $('#tablaPostulaciones').empty();
                }
            } else {
                Swal.fire('Error', response.message || 'No se pudieron cargar las postulaciones', 'error');
                $('#contenidoPostulaciones').show();
                $('#emptyStatePostulaciones').show();
            }
        },
        error: function (xhr, status, error) {
            $('#loadingPostulaciones').hide();
            Swal.fire('Error', 'No se pudieron cargar las postulaciones', 'error');
        }
    });
}

function renderizarPostulaciones(postulaciones) {
    const tbody = $('#tablaPostulaciones tbody');
    tbody.empty();

    postulaciones.forEach(function (post) {
        const fechaFormateada = formatearFecha(post.FechaPostulacion);
        const estadoClass = obtenerClaseEstadoPostulacion(post.Estado);
        const promedio = post.PromedioAcademico ? post.PromedioAcademico.toFixed(2) : 'N/A';

        const tr = `
            <tr>
                <td>
                    <strong>${post.NombreCompleto}</strong>
                    ${post.Calificacion ? `<br><small class="text-warning">⭐ ${post.Calificacion}/5</small>` : ''}
                </td>
                <td>${post.Carrera}</td>
                <td>
                    <small>
                        <i class="bi bi-envelope"></i> ${post.Email}<br>
                        <i class="bi bi-telephone"></i> ${post.Telefono || 'N/A'}
                    </small>
                </td>
                <td>
                    <span class="badge bg-info">${promedio}</span>
                </td>
                <td>
                    <span class="badge-custom ${estadoClass}">${post.Estado}</span>
                </td>
                <td>
                    <small>${fechaFormateada}</small>
                </td>
                <td>
                    <div class="dropdown">
                        <button class="btn btn-outline-secondary btn-sm dropdown-toggle" 
                                type="button" 
                                id="dropdownPostulacion${post.id_postulacion}" 
                                data-bs-toggle="dropdown" 
                                data-bs-auto-close="true"
                                aria-expanded="false">
                            <i class="bi bi-three-dots-vertical"></i> Opciones
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end" 
                            aria-labelledby="dropdownPostulacion${post.id_postulacion}"
                            style="z-index: 9999;">
                            <li>
                                <a class="dropdown-item" 
                                   href="#" 
                                   onclick="abrirModalCambiarEstadoPostulacion(${post.id_postulacion}, '${escaparComillas(post.NombreCompleto)}', '${post.Estado}'); return false;">
                                    <i class="bi bi-arrow-repeat"></i> Cambiar Estado
                                </a>
                            </li>
                            ${post.Estado !== 'Contratado' ? `
                            <li>
                                <a class="dropdown-item" 
                                   href="#" 
                                   onclick="abrirModalContratacion(${post.id_postulacion}, '${escaparComillas(post.NombreCompleto)}'); return false;">
                                    <i class="bi bi-check-circle text-success"></i> Contratar
                                </a>
                            </li>
                            ` : ''}
                            ${post.Estado === 'Contratado' ? `
                            <li>
                                <a class="dropdown-item" 
                                   href="#" 
                                   onclick="abrirModalCalificar(${post.id_postulacion}, '${escaparComillas(post.NombreCompleto)}'); return false;">
                                    <i class="bi bi-star text-warning"></i> Calificar Candidato
                                </a>
                            </li>
                            ` : ''}
                            <li><hr class="dropdown-divider"></li>
                            <li>
                                <a class="dropdown-item" 
                                   href="#" 
                                   onclick="verPerfilCompletoModal(${post.id_egresado}); return false;">
                                    <i class="bi bi-eye text-info"></i> Ver Perfil Completo
                                </a>
                            </li>
                            <li>
                                <a class="dropdown-item" 
                                   href="#" 
                                   onclick="abrirModalContactarPostulacion(${post.id_postulacion}, '${escaparComillas(post.NombreCompleto)}', '${post.Email}'); return false;">
                                    <i class="bi bi-envelope text-primary"></i> Contactar
                                </a>
                            </li>
                        </ul>
                    </div>
                </td>
            </tr>
        `;
        tbody.append(tr);
    });
}
function obtenerClaseEstadoPostulacion(estado) {
    const estados = {
        'En Revisión': 'badge-revision',
        'Finalista': 'badge-finalista',
        'Entrevista': 'badge-entrevista',
        'Oferta': 'badge-oferta',
        'Contratado': 'badge-contratado',
        'Rechazado': 'badge-rechazado'
    };
    return estados[estado] || 'badge-revision';
}
function abrirModalCambiarEstadoPostulacion(idPostulacion, nombreCandidato, estadoActual) {
    $('#idPostulacionCambioEstado').val(idPostulacion);
    $('#nombreCandidatoCambioEstado').text(nombreCandidato);
    $('#estadoActualPostulacion').text(estadoActual);
    $('#estadoActualPostulacion').attr('class', 'badge-custom ' + obtenerClaseEstadoPostulacion(estadoActual));
    $('#selectEstadoPostulacion').val('');

    const modal = new bootstrap.Modal(document.getElementById('modalCambiarEstadoPostulacion'));
    modal.show();
}

function confirmarCambioEstadoPostulacion() {
    const idPostulacion = $('#idPostulacionCambioEstado').val();
    const nuevoEstado = $('#selectEstadoPostulacion').val();
    const nombreCandidato = $('#nombreCandidatoCambioEstado').text();

    if (!nuevoEstado) {
        Toastify({
            text: "⚠️ Debes seleccionar un estado",
            duration: 3000,
            gravity: "top",
            position: "right",
            style: { background: "linear-gradient(to right, #ff9800, #ff6b00)" }
        }).showToast();
        return;
    }

    Swal.fire({
        title: '¿Confirmar cambio?',
        html: `
            <div class="text-start">
                <p>Cambiarás el estado de <strong>${nombreCandidato}</strong></p>
                <p class="mb-0">Nuevo estado: <span class="badge bg-primary">${nuevoEstado}</span></p>
            </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: '<i class="bi bi-check-circle"></i> Sí, cambiar',
        cancelButtonText: '<i class="bi bi-x-circle"></i> Cancelar',
        confirmButtonColor: '#8b1038',
        cancelButtonColor: '#6c757d'
    }).then((result) => {
        if (result.isConfirmed) {
            ejecutarCambioEstadoPostulacion(idPostulacion, nuevoEstado);
        }
    });
}

function ejecutarCambioEstadoPostulacion(idPostulacion, nuevoEstado) {
    Swal.fire({
        title: 'Actualizando...',
        html: 'Por favor espera',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    $.ajax({
        url: '/Empresas/CambiarEstadoPostulacion',
        type: 'POST',
        data: {
            id_postulacion: idPostulacion,
            nuevo_estado: nuevoEstado
        },
        success: function (response) {
            Swal.close();

            if (response.success) {
                $('#modalCambiarEstadoPostulacion').modal('hide');

                Swal.fire({
                    icon: 'success',
                    title: '¡Estado actualizado!',
                    text: response.message,
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    const idVacante = $('#modalVerPostulaciones').data('idVacante');
                    if (idVacante) {
                        cargarPostulaciones(idVacante);
                    }

                    ActualizarEstadisticas();
                });

                Toastify({
                    text: `✅ ${response.message}`,
                    duration: 3000,
                    gravity: "top",
                    position: "right",
                    style: { background: "linear-gradient(to right, #00b09b, #96c93d)" }
                }).showToast();
            } else {
                Swal.fire('Error', response.message, 'error');
            }
        },
        error: function (xhr, status, error) {
            Swal.close();
            Swal.fire('Error', 'No se pudo actualizar el estado', 'error');
        }
    });
}
function abrirModalContratacion(idPostulacion, nombreCandidato) {
    cerrarTodosLosDropdowns();

    setTimeout(() => {
        const modalElement = document.getElementById('modalConfirmarContratacion');
        if (modalElement) {
            modalElement.style.zIndex = '10600';

            $('#idPostulacionContratar').val(idPostulacion);
            $('#nombreCandidatoContratar').text(nombreCandidato);

            const modal = new bootstrap.Modal(modalElement);
            modal.show();

            $(modalElement).on('shown.bs.modal', function () {
                const backdrops = document.querySelectorAll('.modal-backdrop');
                if (backdrops.length > 0) {
                    const lastBackdrop = backdrops[backdrops.length - 1];
                    lastBackdrop.style.zIndex = '10599';
                }
                cerrarTodosLosDropdowns();
            });
        }
    }, 50);
}

function confirmarContratacion() {
    const idPostulacion = $('#idPostulacionContratar').val();

    Swal.fire({
        title: 'Procesando...',
        html: 'Por favor espera',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    $.ajax({
        url: '/Empresas/ContratarEgresado',
        type: 'POST',
        data: { id_postulacion: idPostulacion },
        success: function (response) {
            Swal.close();

            if (response.success) {
                $('#modalConfirmarContratacion').modal('hide');

                Swal.fire({
                    icon: 'success',
                    title: '¡Felicitaciones!',
                    text: response.message,
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    const idVacante = $('#modalVerPostulaciones').data('idVacante');
                    if (idVacante) {
                        cargarPostulaciones(idVacante);
                    }

                    ActualizarEstadisticas();
                });

                Toastify({
                    text: "✅ Candidato contratado exitosamente",
                    duration: 3000,
                    gravity: "top",
                    position: "right",
                    style: { background: "linear-gradient(to right, #00b09b, #96c93d)" }
                }).showToast();
            } else {
                Swal.fire('Error', response.message, 'error');
            }
        },
        error: function (xhr, status, error) {
            Swal.close();
            Swal.fire('Error', 'No se pudo contratar al candidato', 'error');
        }
    });
}



function abrirModalCalificar(idPostulacion, nombreEgresado) {
    const modalElement = document.getElementById('modalCalificarEgresado');
    if (modalElement) {
        modalElement.style.zIndex = '10600';

        $('#idPostulacionCalificar').val(idPostulacion);
        $('#nombreEgresadoCalificar').text(nombreEgresado);

        const modal = new bootstrap.Modal(modalElement);
        modal.show();

        $(modalElement).on('shown.bs.modal', function () {
            const backdrops = document.querySelectorAll('.modal-backdrop');
            if (backdrops.length > 0) {
                const lastBackdrop = backdrops[backdrops.length - 1];
                lastBackdrop.style.zIndex = '10599';
            }
        });
    }
}



function seleccionarCalificacion(calificacion) {
    calificacionActual = calificacion;
    $('#calificacionSeleccionada').val(calificacion);

    $('.btn-calificacion').removeClass('active');
    $('.btn-calificacion').each(function (index) {
        if ((index + 1) <= calificacion) {
            $(this).addClass('active');
        }
    });
}

function guardarCalificacion() {
    const idPostulacion = $('#idPostulacionCalificar').val();
    const calificacion = parseInt($('#calificacionSeleccionada').val());

    if (!idPostulacion || idPostulacion === '0') {
        Toastify({
            text: "⚠️ Error: No se identificó la postulación",
            duration: 3000,
            gravity: "top",
            position: "right",
            style: { background: "linear-gradient(to right, #ff9800, #ff6b00)" }
        }).showToast();
        return;
    }

    if (calificacion === 0 || isNaN(calificacion)) {
        Toastify({
            text: "⚠️ Debes seleccionar una calificación",
            duration: 3000,
            gravity: "top",
            position: "right",
            style: { background: "linear-gradient(to right, #ff9800, #ff6b00)" }
        }).showToast();
        return;
    }

    Swal.fire({
        title: 'Guardando calificación...',
        html: 'Por favor espera',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    $.ajax({
        url: '/Empresas/CalificarEgresado',
        type: 'POST',
        data: {
            id_postulacion: idPostulacion,
            calificacion: calificacion,
            comentario: ''
        },
        success: function (response) {
            Swal.close();

            if (response.success) {
                $('#modalCalificarEgresado').modal('hide');
                const estrellas = '⭐'.repeat(calificacion);
                $('#textoCalificacionActual').html(`${estrellas} <strong>${calificacion} estrella${calificacion > 1 ? 's' : ''}</strong>`);
                $('#calificacionActualMensaje').removeClass('d-none');

                Swal.fire({
                    icon: 'success',
                    title: '¡Calificación guardada!',
                    text: response.message,
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    if (idVacanteActual) {
                        cargarPostulacionesVacante(idVacanteActual);
                    }
                    ActualizarEstadisticas();
                });

                Toastify({
                    text: `✅ Calificación de ${calificacion} estrellas guardada correctamente`,
                    duration: 3000,
                    gravity: "top",
                    position: "right",
                    style: { background: "linear-gradient(to right, #00b09b, #96c93d)" }
                }).showToast();
            } else {
                Swal.fire('Error', response.message, 'error');
            }
        },
        error: function (xhr, status, error) {
            Swal.close();
            Swal.fire('Error', 'No se pudo guardar la calificación', 'error');
        }
    });
}

$(document).on('shown.bs.modal', '#modalVerPostulaciones', function (e) {
    const button = $(e.relatedTarget);
    const idVacante = button.data('id-vacante');
    if (idVacante) {
        $(this).data('idVacante', idVacante);
    }
});
function ejecutarRevertirContratacion(idPostulacion, nombreCandidato) {
    Swal.fire({
        title: 'Procesando...',
        html: 'Devolviendo a revisión',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    $.ajax({
        url: '/Empresas/RevertirContratacion',
        type: 'POST',
        data: {
            id_postulacion: idPostulacion,
            nuevo_estado: 'En Revisión'
        },
        success: function (response) {
            Swal.close();

            if (response.success) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Candidato devuelto!',
                    text: response.message,
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    cargarCandidatosEnProceso();
                    cargarCandidatosContratados();
                    ActualizarEstadisticas();
                });

                Toastify({
                    text: `✅ ${nombreCandidato} devuelto a candidatos en proceso`,
                    duration: 3000,
                    gravity: "top",
                    position: "right",
                    style: { background: "linear-gradient(to right, #00b09b, #96c93d)" }
                }).showToast();
            } else {
                Swal.fire('Error', response.message, 'error');
            }
        },
        error: function (xhr, status, error) {
            Swal.close();
            Swal.fire('Error', 'No se pudo devolver el candidato', 'error');
        }
    });
}

function mostrarMensajeCandidatosProcesoVacio(mensaje = 'No hay candidatos en proceso') {
    $('#candidatos-proceso-container').html(`
        <tr>
            <td colspan="5" class="text-center py-4">
                <i class="bi bi-people text-muted" style="font-size: 2rem;"></i>
                <p class="text-muted small mt-2 mb-0">${mensaje}</p>
            </td>
        </tr>
    `);
}
function mostrarMensajeCandidatosContratadosVacio(mensaje = 'No hay candidatos contratados') {
    $('#candidatos-contratados-container').html(`
        <tr>
            <td colspan="5" class="text-center py-4">
                <i class="bi bi-person-check text-muted" style="font-size: 2rem;"></i>
                <p class="text-muted small mt-2 mb-0">${mensaje}</p>
                <small class="text-muted">Los candidatos que contrates aparecerán aquí</small>
            </td>
        </tr>
    `);
}

let idVacanteActual = null;
let nombreVacanteActual = '';

function abrirModalGestionPostulaciones(idVacante, nombreVacante) {
    idVacanteActual = idVacante;
    nombreVacanteActual = nombreVacante;

    $('#nombreVacantePostulaciones').text(nombreVacante);
    $('.modal').modal('hide');

    setTimeout(() => {
        $('#modalVerPostulaciones').modal('show');
        cargarPostulacionesVacante(idVacante);
    }, 300);
}

function cargarPostulacionesVacante(idVacante) {
    $('#loadingPostulaciones').show();
    $('#contenidoPostulaciones').parent().parent().hide();
    $('#emptyStatePostulaciones').hide();
    $('#contenidoContratados').parent().parent().hide();
    $('#emptyStateContratados').hide();

    $.ajax({
        url: '/Empresas/ObtenerPostulacionesPorVacante',
        type: 'GET',
        data: { id_vacante: idVacante },
        success: function (response) {
            $('#loadingPostulaciones').hide();

            if (response.success && response.data) {
                const datos = response.data;
                $('#totalPostulaciones').text(datos.total || 0);

                if (datos.postulaciones && datos.postulaciones.length > 0) {
                    const enProceso = datos.postulaciones.filter(p => p.Estado !== 'Contratado');
                    const contratados = datos.postulaciones.filter(p => p.Estado === 'Contratado');

                    $('#contadorProceso').text(enProceso.length);
                    $('#contadorContratados').text(contratados.length);

                    renderizarCandidatosEnProceso(enProceso);
                    renderizarCandidatosContratados(contratados);
                } else {
                    $('#contadorProceso').text(0);
                    $('#contadorContratados').text(0);
                    mostrarEstadoVacioPostulaciones();
                }
            } else {
                Toastify({
                    text: response.message || 'No se pudieron cargar las postulaciones',
                    duration: 3000,
                    gravity: "top",
                    position: "right",
                    style: { background: "#dc3545" }
                }).showToast();
                mostrarEstadoVacioPostulaciones();
            }
        },
        error: function (xhr, status, error) {
            $('#loadingPostulaciones').hide();
            Toastify({
                text: 'Error al cargar las postulaciones',
                duration: 3000,
                gravity: "top",
                position: "right",
                style: { background: "#dc3545" }
            }).showToast();
            mostrarEstadoVacioPostulaciones();
        }
    });
}

function rechazarPostulacion(idPostulacion, nombreCandidato) {
    $('#modalVerPostulaciones').modal('hide');
    Swal.fire({
        title: '¿Rechazar postulación?',
        html: `
            <div class="text-start">
                <p>¿Estás seguro de rechazar a <strong>${nombreCandidato}</strong>?</p>
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle-fill"></i>
                    Esta acción marcará la postulación como rechazada y el candidato ya no aparecerá en esta lista
                </div>
                
                <div class="form-group mt-3">
                    <label for="motivoRechazo" class="form-label fw-bold">
                        <i class="bi bi-chat-left-text"></i> Motivo del rechazo (Opcional):
                    </label>
                    <textarea 
                        id="motivoRechazo" 
                        class="form-control" 
                        rows="4" 
                        maxlength="500"
                        placeholder="Ej: El perfil no cumple con los requisitos de experiencia solicitados..."
                        style="resize: none; font-size: 14px;"
                    ></textarea>
                    <small class="text-muted">
                        <i class="bi bi-info-circle"></i> Este motivo será guardado en el sistema (máximo 500 caracteres)
                    </small>
                </div>
            </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: '<i class="bi bi-x-circle"></i> Sí, rechazar',
        cancelButtonText: '<i class="bi bi-arrow-counterclockwise"></i> Cancelar',
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        width: '600px',
        customClass: {
            popup: 'swal-wide'
        },
        didOpen: () => {
            document.getElementById('motivoRechazo').focus();
        },
        preConfirm: () => {
            const motivo = document.getElementById('motivoRechazo').value.trim();
            return { motivo: motivo };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const motivoRechazo = result.value.motivo;
            ejecutarRechazo(idPostulacion, nombreCandidato, motivoRechazo);
        }
        $('#modalVerPostulaciones').modal('show');
    });
}



function actualizarNotificacionesPostulaciones() {
    $.ajax({
        url: '/Empresas/ObtenerVacantes',
        type: 'GET',
        success: function (response) {
            if (response.success && response.data) {
                actualizarBadgesPostulaciones(response.data);
            }
        },
        error: function (xhr, status, error) {
            console.error('Error al actualizar notificaciones:', error);
        }
    });
}

function actualizarBadgesPostulaciones(vacantes) {
    vacantes.forEach(vacante => {
        const badge = document.querySelector(`#dropdownOpciones${vacante.id_vacante} .badge-postulaciones`);
        if (badge) {
            const totalPostulaciones = vacante.total_postulaciones || 0;
            if (totalPostulaciones > 0) {
                badge.textContent = totalPostulaciones;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }

        const dropdownItem = document.querySelector(`[onclick*="abrirModalGestionPostulaciones(${vacante.id_vacante}"] strong`);
        if (dropdownItem) {
            const totalPostulaciones = vacante.total_postulaciones || 0;
            if (totalPostulaciones > 0) {
                dropdownItem.textContent = `(${totalPostulaciones})`;
                dropdownItem.parentElement.style.display = 'block';
            } else {
                dropdownItem.parentElement.style.display = 'none';
            }
        }
    });

    ActualizarEstadisticas();
}


function ejecutarRechazo(idPostulacion, nombreCandidato, motivoRechazo) {
    Swal.fire({
        title: 'Procesando...',
        html: 'Rechazando postulación',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    $.ajax({
        url: '/Empresas/RechazarPostulacion',
        type: 'POST',
        data: {
            id_postulacion: idPostulacion,
            nuevo_estado: 'Rechazado',
            motivo_rechazo: motivoRechazo || ''
        },
        success: function (response) {
            Swal.close();

            if (response.success) {
                $('#modalVerPostulaciones').modal('show');
                actualizarNotificacionesPostulaciones();

                Swal.fire({
                    icon: 'success',
                    title: '¡Postulación rechazada!',
                    text: response.message,
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    cargarPostulacionesVacante(idVacanteActual);
                    ActualizarEstadisticas();

                    if (typeof cargarVacantes === 'function') {
                        cargarVacantes();
                    }
                });

                Toastify({
                    text: `✅ Postulación de ${nombreCandidato} rechazada`,
                    duration: 3000,
                    gravity: "top",
                    position: "right",
                    style: { background: "linear-gradient(to right, #ff5f6d, #ffc371)" }
                }).showToast();
            } else {
                Swal.fire('Error', response.message, 'error');
            }
        },
        error: function (xhr, status, error) {
            Swal.close();
            Swal.fire('Error', 'No se pudo rechazar la postulación', 'error');
        }
    });
}

function abrirVerPerfilSinCerrarModal(idEgresado) {
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
            Swal.fire('Error', 'No se pudo cargar el perfil del egresado', 'error');
            if (modalPerfilCompleto) {
                modalPerfilCompleto.hide();
            } else {
                $('#modalPerfilCompleto').modal('hide');
            }
        }
    });
}

function renderizarCandidatosEnProceso(postulaciones) {
    const tbody = $('#contenidoPostulaciones');
    tbody.empty();

    if (!postulaciones || postulaciones.length === 0) {
        tbody.parent().parent().hide();
        $('#emptyStatePostulaciones').show();
        return;
    }

    tbody.parent().parent().show();
    $('#emptyStatePostulaciones').hide();

    postulaciones.forEach(function (post) {
        const fechaFormateada = formatearFechaPostulacion(post.FechaPostulacion);
        const estadoClass = obtenerClaseEstadoPostulacion(post.Estado);
        const promedio = post.PromedioAcademico ? post.PromedioAcademico.toFixed(2) : 'N/A';
        const mostrarCalificacion = post.Calificacion && post.Calificacion > 0;

        const tr = `
            <tr>
                <td>
                    <strong>${post.NombreCompleto}</strong>
                    ${mostrarCalificacion ?
                `<br><small class="text-warning">${'⭐'.repeat(post.Calificacion)} (${post.Calificacion}/5)</small>`
                : ''}
                </td>
                <td>${post.Carrera}</td>
                <td>
                    <small>
                        <i class="bi bi-envelope"></i> ${post.Email}<br>
                        <i class="bi bi-telephone"></i> ${post.Telefono || 'N/A'}
                    </small>
                </td>
                <td>
                    <span class="badge bg-info">${promedio}</span>
                </td>
                <td>
                    <span class="badge-custom ${estadoClass}">${post.Estado}</span>
                </td>
                <td>
                    <small>${fechaFormateada}</small>
                </td>
               <td>
                    <div class="dropdown dropdown-Opciones">
                        <button class="btn btn-outline-secondary btn-sm dropdown-toggle"
                                type="button"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                                style="position: relative; padding: 6px 12px;">
                            <i class="bi bi-three-dots-vertical"></i> Opciones
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end shadow">
                            <li>
                                <a class="dropdown-item" href="#"
                                   onclick="abrirModalContactarEgresado(${post.id_postulacion}, '${escaparComillas(post.NombreCompleto)}', '${escaparComillas(post.Email)}'); return false;">
                                    <i class="bi bi-envelope-fill text-primary"></i>
                                    <span class="text-primary">Contactar</span>
                                </a>
                            </li>
                            <li>
                                <a class="dropdown-item" href="#" 
                                   onclick="confirmarContratacionDirecta(${post.id_postulacion}, '${escaparComillas(post.NombreCompleto)}'); return false;">
                                    <i class="bi bi-check-circle-fill text-success"></i>
                                    <span class="text-success">Contratar</span>
                                </a>
                            </li>
                            <li>
                                <a class="dropdown-item" href="#" 
                                   onclick="abrirModalCalificar(${post.id_postulacion}, '${escaparComillas(post.NombreCompleto)}'); return false;">
                                    <i class="bi bi-star-fill text-warning"></i>
                                    <span class="text-warning">${mostrarCalificacion ? 'Editar Calificación' : 'Calificar'}</span>
                                </a>
                            </li>
                            <li><hr class="dropdown-divider"></li>
                            <li>
                                <a class="dropdown-item" href="#" 
                                   onclick="abrirVerPerfilSinCerrarModal(${post.id_egresado}); return false;">
                                    <i class="bi bi-eye-fill text-info"></i>
                                    <span class="text-info">Ver Perfil</span>
                                </a>
                            </li>
                            <li><hr class="dropdown-divider"></li>
                            <li>
                                <a class="dropdown-item" href="#" 
                                   onclick="rechazarPostulacion(${post.id_postulacion}, '${escaparComillas(post.NombreCompleto)}'); return false;">
                                    <i class="bi bi-x-circle-fill text-danger"></i>
                                    <span class="text-danger">Rechazar</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </td>
            </tr>
        `;
        tbody.append(tr);
    });
}

function renderizarCandidatosContratados(postulaciones) {
    const tbody = $('#contenidoContratados');
    tbody.empty();

    if (!postulaciones || postulaciones.length === 0) {
        tbody.parent().parent().hide();
        $('#emptyStateContratados').show();
        return;
    }

    tbody.parent().parent().show();
    $('#emptyStateContratados').hide();

    postulaciones.forEach(function (post) {
        const fechaContratacion = formatearFechaPostulacion(post.FechaPostulacion);
        const promedio = post.PromedioAcademico ? post.PromedioAcademico.toFixed(2) : 'N/A';
        const estadoClass = obtenerClaseEstadoPostulacion(post.Estado);

        const mostrarCalificacion = post.Calificacion && post.Calificacion > 0;

        const tr = `
            <tr>
                <td>
                    <strong>${post.NombreCompleto}</strong>
                    ${mostrarCalificacion ?
                `<br><small class="text-warning">${'⭐'.repeat(post.Calificacion)} (${post.Calificacion}/5)</small>`
                : ''}
                </td>
                <td>${post.Carrera}</td>
                <td>
                    <span class="badge bg-info">${promedio}</span>
                </td>
                <td>
                    <span class="badge-custom ${estadoClass}">${post.Estado}</span>
                </td>
                <td>
                    <small>${fechaContratacion}</small>
                </td>
               <td>
                    <div class="dropdown dropdown-Opciones">
                        <button class="btn btn-outline-secondary btn-sm dropdown-toggle"
                                type="button"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                                style="position: relative; padding: 6px 12px;">
                            <i class="bi bi-three-dots-vertical"></i> Opciones
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end shadow">
                            <li>
                                <a class="dropdown-item" href="#"
                                   onclick="devolverCandidatoAProceso(${post.id_postulacion}, '${escaparComillas(post.NombreCompleto)}'); return false;">
                                    <i class="bi bi-arrow-counterclockwise text-warning"></i>
                                    <span class="text-warning">Devolver a Proceso</span>
                                </a>
                            </li>
                            <li><hr class="dropdown-divider"></li>
                            <li>
                                <a class="dropdown-item" href="#" 
                                   onclick="abrirModalCalificar(${post.id_postulacion}, '${escaparComillas(post.NombreCompleto)}'); return false;">
                                    <i class="bi bi-star-fill text-warning"></i>
                                    <span class="text-warning">${mostrarCalificacion ? 'Editar Calificación' : 'Calificar'}</span>
                                </a>
                            </li>
                            <li><hr class="dropdown-divider"></li>
                            <li>
                                <a class="dropdown-item" href="#" 
                                   onclick="abrirVerPerfilSinCerrarModal(${post.id_egresado}); return false;">
                                    <i class="bi bi-eye-fill text-info"></i>
                                    <span class="text-info">Ver CV</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </td>
            </tr>
        `;
        tbody.append(tr);
    });
}

function formatearFechaPostulacion(fechaString) {
    if (!fechaString) return 'No especificada';

    try {
        let fecha;

        if (typeof fechaString === 'string' && fechaString.includes('/Date(')) {
            const match = fechaString.match(/\/Date\((\d+)([+-]\d+)?\)\//);
            if (match) {
                const timestamp = parseInt(match[1]);
                fecha = new Date(timestamp);
            }
        } else {
            fecha = new Date(fechaString);
        }

        if (isNaN(fecha.getTime())) return 'Fecha inválida';

        const dia = fecha.getDate().toString().padStart(2, '0');
        const mes = fecha.toLocaleDateString('es-ES', { month: 'short' });
        const año = fecha.getFullYear();

        return `${dia} ${mes}, ${año}`;
    } catch (error) {
        return 'Fecha inválida';
    }
}

function confirmarContratacionDirecta(idPostulacion, nombreCandidato) {
    Swal.fire({
        title: '¿Contratar candidato?',
        html: `
            <div class="text-start">
                <p>¿Estás seguro de contratar a <strong>${nombreCandidato}</strong>?</p>
                <div class="alert alert-success">
                    <i class="bi bi-check-circle-fill"></i>
                    El candidato será marcado como contratado
                </div>
            </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: '<i class="bi bi-check-circle"></i> Sí, contratar',
        cancelButtonText: '<i class="bi bi-x-circle"></i> Cancelar',
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#6c757d',
        customClass: {
            container: 'swal-overlay-top'
        },
        didOpen: () => {
            const swalContainer = document.querySelector('.swal2-container');
            if (swalContainer) {
                swalContainer.style.zIndex = '10000';
            }
        }
    }).then((result) => {
        if (result.isConfirmed) {
            ejecutarContratacion(idPostulacion, nombreCandidato);
        }
    });
}

function ejecutarContratacion(idPostulacion, nombreCandidato) {
    Swal.fire({
        title: 'Procesando...',
        html: 'Contratando candidato',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    $.ajax({
        url: '/Empresas/ContratarEgresado',
        type: 'POST',
        data: { id_postulacion: idPostulacion },
        success: function (response) {
            Swal.close();

            actualizarNotificacionesPostulaciones();

            if (response.success) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Candidato contratado!',
                    text: response.message,
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    cargarPostulacionesVacante(idVacanteActual);
                    ActualizarEstadisticas();
                    cargarTopCarrerasContratadas();
                });

                Toastify({
                    text: `✅ ${nombreCandidato} ha sido contratado exitosamente`,
                    duration: 3000,
                    gravity: "top",
                    position: "right",
                    style: { background: "linear-gradient(to right, #00b09b, #96c93d)" }
                }).showToast();
            } else {
                Swal.fire('Error', response.message, 'error');
            }
        },
        error: function (xhr, status, error) {
            Swal.close();
            Swal.fire('Error', 'No se pudo contratar al candidato', 'error');
        }
    });
}

function devolverCandidatoAProceso(idPostulacion, nombreCandidato) {
    Swal.fire({
        title: '¿Devolver a proceso?',
        html: `
            <div class="text-start">
                <p>¿Estás seguro de devolver a <strong>${nombreCandidato}</strong> a candidatos en proceso?</p>
                <div class="alert alert-warning">
                    <i class="bi bi-exclamation-triangle"></i>
                    El estado cambiará a "En Revisión"
                </div>
            </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: '<i class="bi bi-arrow-counterclockwise"></i> Sí, devolver',
        cancelButtonText: '<i class="bi bi-x-circle"></i> Cancelar',
        confirmButtonColor: '#ffc107',
        cancelButtonColor: '#6c757d',
        customClass: {
            container: 'swal-overlay-top'
        },
        didOpen: () => {
            const swalContainer = document.querySelector('.swal2-container');
            if (swalContainer) {
                swalContainer.style.zIndex = '10000';
            }
        }
    }).then((result) => {
        if (result.isConfirmed) {
            ejecutarDevolucionAProceso(idPostulacion);
        }
    });
}

function ejecutarDevolucionAProceso(idPostulacion) {
    Swal.fire({
        title: 'Procesando...',
        html: 'Devolviendo a proceso',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    $.ajax({
        url: '/Empresas/RevertirContratacion',
        type: 'POST',
        data: {
            id_postulacion: idPostulacion,
            nuevo_estado: 'En Revisión'
        },
        success: function (response) {
            Swal.close();

            actualizarNotificacionesPostulaciones();

            if (response.success) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Candidato devuelto!',
                    text: response.message,
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    cargarPostulacionesVacante(idVacanteActual);
                    ActualizarEstadisticas();
                    cargarTopCarrerasContratadas();
                });

                Toastify({
                    text: `✅ Candidato devuelto a proceso`,
                    duration: 3000,
                    gravity: "top",
                    position: "right",
                    style: { background: "linear-gradient(to right, #00b09b, #96c93d)" }
                }).showToast();
            } else {
                Swal.fire('Error', response.message, 'error');
            }
        },
        error: function (xhr, status, error) {
            Swal.close();
            Swal.fire('Error', 'No se pudo devolver el candidato', 'error');
        }
    });
}


function forzarActualizacionNotificaciones() {
    actualizarNotificacionesPostulaciones();

    setInterval(actualizarNotificacionesPostulaciones, 30000);
}


function abrirVerPerfilDesdeGestion(idEgresado) {
    $('#modalVerPostulaciones').modal('hide');

    setTimeout(() => {
        verPerfilCompletoModal(idEgresado);
    }, 300);
}

function mostrarEstadoVacioPostulaciones() {
    $('#contenidoPostulaciones').empty().parent().parent().hide();
    $('#emptyStatePostulaciones').show();
    $('#contenidoContratados').empty().parent().parent().hide();
    $('#emptyStateContratados').show();
}

function escaparComillas(texto) {
    if (!texto) return '';
    return texto.replace(/'/g, "\\'").replace(/"/g, "&quot;");
}

function abrirModalContratacionDesdePostulaciones(idPostulacion, nombreCandidato) {
    $('#idPostulacionContratar').val(idPostulacion);
    $('#nombreCandidatoContratar').text(nombreCandidato);

    const modal = new bootstrap.Modal(document.getElementById('modalConfirmarContratacion'));
    modal.show();

    $('#modalConfirmarContratacion').off('click', 'button[onclick="confirmarContratacion()"]');
    $('#modalConfirmarContratacion').on('click', 'button[onclick="confirmarContratacion()"]', function () {
        confirmarContratacionDesdePostulaciones(idPostulacion);
    });
}

function confirmarContratacionDesdePostulaciones(idPostulacion) {
    Swal.fire({
        title: 'Procesando...',
        html: 'Por favor espera',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    $.ajax({
        url: '/Empresas/ContratarEgresado',
        type: 'POST',
        data: { id_postulacion: idPostulacion },
        success: function (response) {
            Swal.close();

            if (response.success) {
                $('#modalConfirmarContratacion').modal('hide');

                Swal.fire({
                    icon: 'success',
                    title: '¡Contratación exitosa!',
                    text: response.message,
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    cargarPostulacionesVacante(idVacanteActual);
                    ActualizarEstadisticas();
                });

                Toastify({
                    text: "✅ Candidato contratado exitosamente",
                    duration: 3000,
                    gravity: "top",
                    position: "right",
                    style: { background: "linear-gradient(to right, #00b09b, #96c93d)" }
                }).showToast();
            } else {
                Swal.fire('Error', response.message, 'error');
            }
        },
        error: function (xhr, status, error) {
            Swal.close();
            Swal.fire('Error', 'No se pudo contratar al candidato', 'error');
        }
    });
}

function devolverCandidatoAProceso(idPostulacion, nombreCandidato) {
    Swal.fire({
        title: '¿Devolver a proceso?',
        html: `
            <div class="text-start">
                <p>¿Estás seguro de devolver a <strong>${nombreCandidato}</strong> a candidatos en proceso?</p>
                <div class="alert alert-warning">
                    <i class="bi bi-exclamation-triangle"></i>
                    El estado cambiará a "En Revisión"
                </div>
            </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: '<i class="bi bi-arrow-counterclockwise"></i> Sí, devolver',
        cancelButtonText: '<i class="bi bi-x-circle"></i> Cancelar',
        confirmButtonColor: '#ffc107',
        cancelButtonColor: '#6c757d'
    }).then((result) => {
        if (result.isConfirmed) {
            ejecutarDevolucionAProceso(idPostulacion);
            cargarTopCarrerasContratadas();
        }
    });
}

function ejecutarDevolucionAProceso(idPostulacion) {
    Swal.fire({
        title: 'Procesando...',
        html: 'Devolviendo a proceso',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    $.ajax({
        url: '/Empresas/RevertirContratacion',
        type: 'POST',
        data: {
            id_postulacion: idPostulacion,
            nuevo_estado: 'En Revisión'
        },
        success: function (response) {
            Swal.close();

            if (response.success) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Candidato devuelto!',
                    text: response.message,
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    cargarPostulacionesVacante(idVacanteActual);
                    ActualizarEstadisticas();
                    cargarTopCarrerasContratadas();
                });

                Toastify({
                    text: `✅ Candidato devuelto a proceso`,
                    duration: 3000,
                    gravity: "top",
                    position: "right",
                    style: { background: "linear-gradient(to right, #00b09b, #96c93d)" }
                }).showToast();
            } else {
                Swal.fire('Error', response.message, 'error');
            }
        },
        error: function (xhr, status, error) {
            Swal.close();
            Swal.fire('Error', 'No se pudo devolver el candidato', 'error');
        }
    });
}

let calificacionVacanteActual = 0;


function abrirModalCalificar(idPostulacion, nombreEgresado) {
    $('#idPostulacionCalificar').val(idPostulacion);
    $('#nombreEgresadoCalificar').text(nombreEgresado);
    $('#comentarioCalificacion').val('');
    $('#calificacionSeleccionada').val('0');
    $('.btn-calificacion').removeClass('active');
    calificacionActual = 0;

    const modalElement = document.getElementById('modalCalificarEgresado');
    if (modalElement) {
        modalElement.style.zIndex = '9999';
        modalElement.style.display = 'block';

        const modalInstance = new bootstrap.Modal(modalElement, {
            backdrop: true,
            keyboard: true,
            focus: true
        });

        $(modalElement).on('shown.bs.modal', function () {
            const backdrops = document.querySelectorAll('.modal-backdrop');
            if (backdrops.length > 0) {
                const lastBackdrop = backdrops[backdrops.length - 1];
                lastBackdrop.style.zIndex = '9998';
                lastBackdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
            }

            modalElement.style.zIndex = '9999';
        });

        modalInstance.show();
    }
}

function seleccionarCalificacionVacante(calificacion) {
    calificacionVacanteActual = calificacion;
    $('#calificacionVacanteSeleccionada').val(calificacion);

    $('.btn-calificacion-vacante').removeClass('active');
    $('.btn-calificacion-vacante').each(function (index) {
        if ((index + 1) <= calificacion) {
            $(this).addClass('active');
        }
    });
}

function guardarCalificacionVacante() {
    const idVacante = $('#idVacanteCalificar').val();
    const calificacion = parseInt($('#calificacionVacanteSeleccionada').val());

    if (calificacion === 0) {
        Toastify({
            text: "⚠️ Debes seleccionar una calificación",
            duration: 3000,
            gravity: "top",
            position: "right",
            style: { background: "linear-gradient(to right, #ff9800, #ff6b00)" }
        }).showToast();
        return;
    }

    Swal.fire({
        title: '¿Guardar calificación?',
        html: `
            <div class="text-start">
                <p>Calificarás esta vacante con <strong>${calificacion} estrellas</strong></p>
                <div class="alert alert-info">
                    <i class="bi bi-info-circle"></i>
                    Esta calificación te ayudará a organizar y priorizar tus mejores vacantes
                </div>
            </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: '<i class="bi bi-check-circle"></i> Sí, guardar',
        cancelButtonText: '<i class="bi bi-x-circle"></i> Cancelar',
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#6c757d'
    }).then((result) => {
        if (result.isConfirmed) {
            
            Toastify({
                text: `✅ Vacante calificada con ${calificacion} estrellas`,
                duration: 3000,
                gravity: "top",
                position: "right",
                style: { background: "linear-gradient(to right, #00b09b, #96c93d)" }
            }).showToast();

            $('#modalCalificarEgresado').modal('hide');
        }
    });
}

function cargarTopCarrerasContratadas() {
    var container = document.getElementById('carreras-contratadas-container');

    if (!container) {
        return;
    }

    mostrarCargando(container);

    fetch('/Empresas/ObtenerTopCarrerasContratadas', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            if (data.success) {
                renderizarCarreras(data.data, container);
            } else {
                mostrarError(container, data.message || 'Error al cargar las carreras');
            }
        })
        .catch(function (error) {
            mostrarError(container, 'Error de conexión al cargar las carreras');
        });
}

function mostrarCargando(container) {
    container.innerHTML =
        '<div class="text-center py-3">' +
        '<div class="spinner-border spinner-border-sm text-muted" role="status">' +
        '<span class="visually-hidden">Cargando...</span>' +
        '</div>' +
        '<p class="text-muted small mt-2">Cargando carreras contratadas...</p>' +
        '</div>';
}

function mostrarError(container, mensaje) {
    container.innerHTML =
        '<div class="alert alert-warning" role="alert">' +
        '<i class="bi bi-exclamation-triangle me-2"></i>' + mensaje +
        '</div>';
}

function renderizarCarreras(datos, container) {
    if (!datos.carreras || datos.carreras.length === 0) {
        container.innerHTML =
            '<div class="text-center py-4">' +
            '<i class="bi bi-inbox text-muted" style="font-size: 2rem;"></i>' +
            '<p class="text-muted mt-2 mb-0">No hay contrataciones registradas</p>' +
            '</div>';
        return;
    }

    var html = '';

    for (var i = 0; i < datos.carreras.length; i++) {
        var carrera = datos.carreras[i];
        var candidatoTexto = carrera.TotalContratados === 1 ? 'candidato' : 'candidatos';

        html += '<div class="carrera-item mb-3">' +
            '<div class="d-flex justify-content-between align-items-center mb-1">' +
            '<span class="fw-semibold text-dark">' + carrera.NombreCarrera + '</span>' +
            '<span class="text-muted small">' + carrera.TotalContratados + ' ' + candidatoTexto + ' (' + carrera.Porcentaje + '%)</span>' +
            '</div>' +
            '<div class="progress" style="height: 10px;">' +
            '<div class="progress-bar bg-primary" role="progressbar" ' +
            'style="width: 0%" ' +
            'data-porcentaje="' + carrera.Porcentaje + '">' +
            '</div>' +
            '</div>' +
            '</div>';
    }

    var contratadosTexto = datos.totalContratados === 1 ? 'candidato contratado' : 'candidatos contratados';

    html += '<div class="mt-3 pt-3 border-top">' +
        '<p class="text-muted small mb-0">' +
        '<strong>Resumen:</strong> ' + datos.totalContratados + ' ' + contratadosTexto +
        '</p>' +
        '</div>';

    container.innerHTML = html;

    animarBarras();
}

function animarBarras() {
    var barras = document.querySelectorAll('.progress-bar[data-porcentaje]');

    for (var i = 0; i < barras.length; i++) {
        var barra = barras[i];
        var porcentaje = barra.getAttribute('data-porcentaje');

        setTimeout(function (elemento, valor) {
            return function () {
                elemento.style.width = valor + '%';
            };
        }(barra, porcentaje), 100 * (i + 1));
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cargarTopCarrerasContratadas);
} else {
    cargarTopCarrerasContratadas();
}


function renderVacantesRecientes(vacantes) {
    const tbody = $('#tablaVacantes tbody');
    tbody.empty();

    if (!vacantes || vacantes.length === 0) {
        tbody.html(`
            <tr>
                <td colspan="4" class="text-center py-4">
                    <i class="bi bi-briefcase text-muted" style="font-size: 2rem;"></i>
                    <p class="text-muted small mt-2 mb-0">No hay vacantes recientes</p>
                    <small class="text-muted">Publica tu primera vacante para empezar</small>
                </td>
            </tr>
        `);
        return;
    }

    window.vacantesRecientesGlobal = vacantes;
    window.vacantesFiltradas = vacantes;

    if ($('#filtrosVacantesRecientes').children().length === 0) {
        const areasUnicas = [...new Set(vacantes.map(v => v.area).filter(a => a))];
        let optionsArea = '<option value="">💼 Todas las áreas</option>';
        areasUnicas.forEach(area => {
            optionsArea += `<option value="${area}">${area}</option>`;
        });

        const filtrosHTML = `
            <div class="row g-2 mb-3">
                <div class="col-md-3">
                    <input type="text" 
                           id="filtroTituloVacante" 
                           class="form-control form-control-sm" 
                           placeholder="🔍 Buscar por título...">
                </div>
                <div class="col-md-2">
                    <select id="filtroEstadoVacante" class="form-select form-select-sm">
                        <option value="">📊 Todos los estados</option>
                        <option value="Abierta">Abierta</option>
                        <option value="En Revisión">En Revisión</option>
                        <option value="Entrevista">Entrevista</option>
                        <option value="Oferta">Oferta</option>
                        <option value="Contratado">Contratado</option>
                        <option value="Cerrada">Cerrada</option>
                    </select>
                </div>
                <div class="col-md-2">
                    <input type="date" 
                           id="filtroFechaVacante" 
                           class="form-control form-control-sm" 
                           placeholder="📅 Fecha">
                </div>
                <div class="col-md-3">
                    <select id="filtroAreaVacante" class="form-select form-select-sm">
                        ${optionsArea}
                    </select>
                </div>
                <div class="col-md-2">
                    <button onclick="aplicarFiltrosVacantesRecientes()" 
                            class="btn btn-primary btn-sm w-100 mb-1">
                        <i class="bi bi-search"></i> Buscar
                    </button>
                    <button onclick="limpiarFiltrosVacantesRecientes()" 
                            class="btn btn-outline-secondary btn-sm w-100">
                        <i class="bi bi-x-circle"></i> Limpiar
                    </button>
                </div>
            </div>
        `;

        $('#filtrosVacantesRecientes').html(filtrosHTML);

        $('#filtroTituloVacante').on('keypress', function (e) {
            if (e.which === 13) {
                aplicarFiltrosVacantesRecientes();
            }
        });

        $('#filtroEstadoVacante, #filtroFechaVacante, #filtroAreaVacante').on('change', function () {
            aplicarFiltrosVacantesRecientes();
        });
    }

    renderizarTablaVacantesRecientes(vacantes);
}

function renderizarTablaVacantesRecientes(vacantes) {
    const tbody = $('#tablaVacantes tbody');
    tbody.empty();

    const FILAS_MINIMAS = 10;

    const inicio = (paginaActualVacantesRecientes - 1) * vacantesPorPaginaRecientes;
    const fin = inicio + vacantesPorPaginaRecientes;
    const vacantesPagina = vacantes.slice(inicio, fin);

    if (vacantes.length === 0) {
        const filasVacias = FILAS_MINIMAS;
        for (let i = 0; i < filasVacias; i++) {
            if (i === Math.floor(filasVacias / 2)) {
                tbody.append(`
                    <tr>
                        <td colspan="4" class="text-center py-4">
                            <i class="bi bi-search text-muted" style="font-size: 2rem;"></i>
                            <p class="text-muted small mt-2 mb-0">No se encontraron vacantes con esos filtros</p>
                            <button onclick="limpiarFiltrosVacantesRecientes()" class="btn btn-sm btn-outline-primary mt-2">
                                <i class="bi bi-x-circle"></i> Limpiar filtros
                            </button>
                        </td>
                    </tr>
                `);
            } else {
                tbody.append(`
                    <tr>
                        <td colspan="4" style="height: 60px;">&nbsp;</td>
                    </tr>
                `);
            }
        }
        return;
    }

    vacantesPagina.forEach(vacante => {
        const estadoClass = obtenerClaseEstadoVacante(vacante.estado);
        const fechaPublicacion = formatearFechaCorta(vacante.fecha_publicacion);
        const fechaCierre = formatearFechaCorta(vacante.fecha_cierre);
        const totalPostulaciones = vacante.total_postulaciones || 0;

        const dropdownOpciones = `
            <div class="dropdown dropdown-Opciones">
                <button class="btn btn-outline-secondary btn-sm dropdown-toggle" 
                        type="button" 
                        id="dropdownOpciones${vacante.id_vacante}" 
                        data-bs-toggle="dropdown" 
                        aria-expanded="false"
                        style="position: relative; padding: 6px 12px;">
                    <span class="dropdown-toggle-text">
                        <i class="bi bi-three-dots-vertical"></i> Opciones
                    </span>
                    ${totalPostulaciones > 0 ? `
                        <span class="badge-postulaciones">${totalPostulaciones}</span>
                    ` : ''}
                </button>
                <ul class="dropdown-menu dropdown-menu-end shadow" aria-labelledby="dropdownOpciones${vacante.id_vacante}">
                   <li>
                        <a class="dropdown-item d-flex align-items-center gap-2" href="#"
                           onclick="cerrarTodosLosDropdowns(); abrirModalGestionPostulaciones(${vacante.id_vacante}, '${escaparComillas(vacante.titulo)}'); return false;">
                            <i class="bi bi-people text-success"></i>
                            <span class="flex-grow-1">Ver Postulaciones</span>
                            ${totalPostulaciones > 0 ? `<span class="badge bg-success">${totalPostulaciones}</span>` : ''}
                        </a>
                    </li>


                    <li><hr class="dropdown-divider"></li>
                    <li>
                        <a class="dropdown-item" href="#" 
                           onclick="cerrarTodosLosDropdowns(); abrirModalCambiarEstado(${vacante.id_vacante}, '${escaparComillas(vacante.titulo)}', '${vacante.estado}'); return false;">
                            <i class="bi bi-arrow-repeat text-primary"></i>
                            <span>Cambiar Estado</span>
                        </a>
                    </li>
                    <li>
                        <a class="dropdown-item" href="#" 
                           onclick="cerrarTodosLosDropdowns(); verDetallesVacante(${vacante.id_vacante}); return false;">
                            <i class="bi bi-eye text-info"></i>
                            <span>Ver Detalles</span>
                        </a>
                    </li>
                    <li>
                        <a class="dropdown-item" href="#" 
                           onclick="cerrarTodosLosDropdowns(); editarVacante(${vacante.id_vacante}); return false;">
                            <i class="bi bi-pencil text-warning"></i>
                            <span>Editar</span>
                        </a>
                    </li>
                    <li><hr class="dropdown-divider"></li>
                    <li>
                        <a class="dropdown-item text-danger" href="#" 
                           onclick="cerrarTodosLosDropdowns(); abrirEliminarVacante(${vacante.id_vacante}, '${escaparComillas(vacante.titulo)}'); return false;">
                            <i class="bi bi-trash"></i>
                            <span>Eliminar</span>
                        </a>
                    </li>
                </ul>
            </div>
        `;

        const row = `
            <tr>
                <td>
                    <strong>${vacante.titulo}</strong><br>
                    <small class="text-muted">
                        <i class="bi bi-briefcase"></i> ${vacante.area || 'Sin área'}
                    </small>
                </td>
                <td>
                    <span class="badge-custom ${estadoClass}">
                        ${vacante.estado}
                    </span>
                </td>
                <td>
                    <small>
                        <i class="bi bi-calendar-plus"></i> ${fechaPublicacion}<br>
                        <i class="bi bi-calendar-x"></i> ${fechaCierre}
                    </small>
                </td>
                <td>
                    ${dropdownOpciones}
                </td>
            </tr>
        `;
        tbody.append(row);
    });

    const filasRestantes = FILAS_MINIMAS - vacantesPagina.length;
    if (filasRestantes > 0) {
        for (let i = 0; i < filasRestantes; i++) {
            tbody.append(`
                <tr>
                    <td colspan="4" style="height: 60px;">&nbsp;</td>
                </tr>
            `);
        }
    }
    renderizarPaginacionVacantesRecientes(vacantes.length);
}

function renderizarPaginacionVacantesRecientes(totalVacantes) {
    let contenedorPaginacion = $('#paginacionVacantesRecientesInferior');

    if (contenedorPaginacion.length === 0) {
        const tablaContainer = $('.table-responsive').last();
        tablaContainer.after('<div id="paginacionVacantesRecientesInferior" class="mt-3"></div>');
        contenedorPaginacion = $('#paginacionVacantesRecientesInferior');
    }

    $('.paginacion-vacantes-recientes').not('#paginacionVacantesRecientesInferior').remove();

    if (totalVacantes <= vacantesPorPaginaRecientes) {
        contenedorPaginacion.empty();
        return;
    }

    const totalPaginas = Math.ceil(totalVacantes / vacantesPorPaginaRecientes);

    let paginacionContenido = `
        <div class="d-flex justify-content-between align-items-center">
            <div class="text-muted small">
                Mostrando ${((paginaActualVacantesRecientes - 1) * vacantesPorPaginaRecientes) + 1} - 
                ${Math.min(paginaActualVacantesRecientes * vacantesPorPaginaRecientes, totalVacantes)} 
                de ${totalVacantes} vacantes
            </div>
            <nav>
                <ul class="pagination pagination-sm mb-0">
                    <li class="page-item ${paginaActualVacantesRecientes === 1 ? 'disabled' : ''}">
                        <a class="page-link" href="#" onclick="cambiarPaginaVacantesRecientes(1); return false;">
                            <i class="bi bi-chevron-bar-left"></i>
                        </a>
                    </li>
                    <li class="page-item ${paginaActualVacantesRecientes === 1 ? 'disabled' : ''}">
                        <a class="page-link" href="#" onclick="cambiarPaginaVacantesRecientes(${paginaActualVacantesRecientes - 1}); return false;">
                            <i class="bi bi-chevron-left"></i>
                        </a>
                    </li>`;

    for (let i = 1; i <= totalPaginas; i++) {
        if (i === 1 || i === totalPaginas || (i >= paginaActualVacantesRecientes - 1 && i <= paginaActualVacantesRecientes + 1)) {
            paginacionContenido += `
                <li class="page-item ${i === paginaActualVacantesRecientes ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="cambiarPaginaVacantesRecientes(${i}); return false;">${i}</a>
                </li>`;
        } else if (i === paginaActualVacantesRecientes - 2 || i === paginaActualVacantesRecientes + 2) {
            paginacionContenido += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
    }

    paginacionContenido += `
                    <li class="page-item ${paginaActualVacantesRecientes === totalPaginas ? 'disabled' : ''}">
                        <a class="page-link" href="#" onclick="cambiarPaginaVacantesRecientes(${paginaActualVacantesRecientes + 1}); return false;">
                            <i class="bi bi-chevron-right"></i>
                        </a>
                    </li>
                    <li class="page-item ${paginaActualVacantesRecientes === totalPaginas ? 'disabled' : ''}">
                        <a class="page-link" href="#" onclick="cambiarPaginaVacantesRecientes(${totalPaginas}); return false;">
                            <i class="bi bi-chevron-bar-right"></i>
                        </a>
                    </li>
                </ul>
            </nav>
        </div>
    `;
    contenedorPaginacion.html(paginacionContenido);
}

function cambiarPaginaVacantesRecientes(numeroPagina) {
    const totalPaginas = Math.ceil(window.vacantesFiltradas.length / vacantesPorPaginaRecientes);

    if (numeroPagina >= 1 && numeroPagina <= totalPaginas) {
        paginaActualVacantesRecientes = numeroPagina;
        renderizarTablaVacantesRecientes(window.vacantesFiltradas);

        const contenedorTabla = document.querySelector(".table-responsive");
        if (contenedorTabla) {
            contenedorTabla.scrollTop = 0;
        }
    }
}

function aplicarFiltrosVacantesRecientes() {
    const filtroTitulo = $('#filtroTituloVacante').val().trim();
    const filtroEstado = $('#filtroEstadoVacante').val();
    const filtroFecha = $('#filtroFechaVacante').val();
    const filtroArea = $('#filtroAreaVacante').val();

    paginaActualVacantesRecientes = 1;

    const tbody = $('#tablaVacantes tbody');
    tbody.html(`
        <tr>
            <td colspan="4" class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
                <p class="mt-3 text-muted">Filtrando vacantes...</p>
            </td>
        </tr>
    `);

    const contenedorTabla = document.querySelector(".table-responsive");
    if (contenedorTabla) {
        contenedorTabla.scrollTop = 0;
    }

    $.ajax({
        url: '/Empresas/ObtenerVacantesFiltradas',
        type: 'GET',
        data: {
            titulo: filtroTitulo || null,
            estado: filtroEstado || null,
            area: filtroArea || null,
            fecha: filtroFecha || null
        },
        success: function (response) {
            if (response.success && response.data) {
                window.vacantesRecientesGlobal = response.data;
                window.vacantesFiltradas = response.data;

                renderizarTablaVacantesRecientes(response.data);

                const mensaje = response.data.length === 0
                    ? 'No se encontraron vacantes con esos filtros'
                    : `Se encontraron ${response.data.length} vacante(s)`;

                Toastify({
                    text: `✅ ${mensaje}`,
                    duration: 3000,
                    gravity: "top",
                    position: "right",
                    style: {
                        background: response.data.length === 0 ? "#ffc107" : "#28a745"
                    }
                }).showToast();

                setTimeout(() => {
                    if (contenedorTabla) {
                        contenedorTabla.scrollTop = 0;
                    }
                }, 100);
            }
        },
        error: function (xhr, status, error) {
            Toastify({
                text: "❌ Error al aplicar filtros",
                duration: 3000,
                gravity: "top",
                position: "right",
                style: { background: "#dc3545" }
            }).showToast();
        }
    });
}

function limpiarFiltrosVacantesRecientes() {
    $('#filtroTituloVacante').val('');
    $('#filtroEstadoVacante').val('');
    $('#filtroFechaVacante').val('');
    $('#filtroAreaVacante').val('');

    paginaActualVacantesRecientes = 1;

    const tbody = $('#tablaVacantes tbody');
    tbody.html(`
        <tr>
            <td colspan="4" class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
                <p class="mt-3 text-muted">Cargando todas las vacantes...</p>
            </td>
        </tr>
    `);

    $('.paginacion-vacantes-recientes').remove();
    $('#paginacionVacantesRecientesInferior').remove();

    const contenedorTabla = document.querySelector(".table-responsive");
    if (contenedorTabla) {
        contenedorTabla.scrollTop = 0;
    }

    $.ajax({
        url: '/Empresas/ObtenerVacantesFiltradas',
        type: 'GET',
        data: {},
        success: function (response) {
            if (response.success && response.data) {
                window.vacantesRecientesGlobal = response.data;
                window.vacantesFiltradas = response.data;

                renderizarTablaVacantesRecientes(response.data);

                Toastify({
                    text: `✅ Mostrando ${response.data.length} vacante(s)`,
                    duration: 3000,
                    gravity: "top",
                    position: "right",
                    style: { background: "#6c757d" }
                }).showToast();

                setTimeout(() => {
                    if (contenedorTabla) {
                        contenedorTabla.scrollTop = 0;
                    }
                }, 100);
            }
        },
        error: function (xhr, status, error) {
            Toastify({
                text: "❌ Error al cargar vacantes",
                duration: 3000,
                gravity: "top",
                position: "right",
                style: { background: "#dc3545" }
            }).showToast();
        }
    });
}

function abrirModalContactarEgresado(idPostulacion, nombreEgresado, emailEgresado) {
    $('#idPostulacionContactar').val(idPostulacion);
    $('#nombreEgresadoContactar').text(nombreEgresado);
    $('#emailEgresadoContactar').text(emailEgresado);

    const asuntoPredeterminado = `Oportunidad Laboral - ${nombreEmpresa}`;
    $('#asuntoContactoEgresado').val(asuntoPredeterminado);

    const mensajePredeterminado = `Estimado/a ${nombreEgresado},

    Nos complace informarle que su postulación ha captado nuestro interés. Nos gustaría conocer más sobre su perfil profesional y discutir la oportunidad laboral con mayor detalle.

    Por favor, indíquenos su disponibilidad para una conversación telefónica o reunión virtual en los próximos días.

    Quedamos atentos a su respuesta.

    Saludos cordiales,
    ${nombreEmpresa}`;

    $('#mensajeContactoEgresado').val(mensajePredeterminado);

    $('#modalContactarEgresado').modal('show');
}


function enviarContactoEgresado() {
    const idPostulacion = $('#idPostulacionContactar').val();
    const idEgresadoDirecto = $('#modalContactarEgresado').attr('data-id-egresado-directo');
    const asunto = $('#asuntoContactoEgresado').val().trim();
    const mensaje = $('#mensajeContactoEgresado').val().trim();

    if (!asunto) {
        Toastify({
            text: "⚠️ Debe ingresar un asunto",
            duration: 3000,
            gravity: "top",
            position: "right",
            style: { background: "#ff9800" }
        }).showToast();
        return;
    }

    if (!mensaje) {
        Toastify({
            text: "⚠️ Debe escribir un mensaje",
            duration: 3000,
            gravity: "top",
            position: "right",
            style: { background: "#ff9800" }
        }).showToast();
        return;
    }

    if (mensaje.length < 50) {
        Toastify({
            text: "⚠️ El mensaje debe tener al menos 50 caracteres",
            duration: 3000,
            gravity: "top",
            position: "right",
            style: { background: "#ff9800" }
        }).showToast();
        return;
    }

    const esContactoDirecto = !idPostulacion && idEgresadoDirecto;
    const url = esContactoDirecto ? '/Empresas/ContactarEgresadoDirecto' : '/Empresas/ContactarEgresado';
    const datos = esContactoDirecto
        ? { idEgresado: idEgresadoDirecto, asunto: asunto, mensaje: mensaje }
        : { id_postulacion: idPostulacion, asunto: asunto, mensaje: mensaje };

    Swal.fire({
        title: '¿Enviar mensaje al candidato?',
        html: `
            <div class="text-start">
                <p><strong>Asunto:</strong> ${asunto}</p>
                <p>Se enviará un correo electrónico a:</p>
                <strong>${$('#nombreEgresadoContactar').text()}</strong>
                <p class="text-muted small mt-2">${$('#emailEgresadoContactar').text()}</p>
            </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: '<i class="bi bi-send"></i> Sí, enviar',
        cancelButtonText: '<i class="bi bi-x-circle"></i> Cancelar',
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#6c757d'
    }).then((result) => {
        if (result.isConfirmed) {
            ejecutarEnvioContacto(url, datos);
        }
    });
}

function ejecutarEnvioContacto(url, datos) {
    Swal.fire({
        title: 'Enviando mensaje...',
        html: 'Por favor espera',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    $.ajax({
        url: url,
        type: 'POST',
        data: datos,
        success: function (response) {
            Swal.close();

            if (response.success) {
                $('#modalContactarEgresado').modal('hide');

                $('#modalContactarEgresado').removeAttr('data-id-egresado-directo');

                Swal.fire({
                    icon: 'success',
                    title: '¡Mensaje enviado!',
                    text: response.message,
                    timer: 2000,
                    showConfirmButton: false
                });

                Toastify({
                    text: "✅ Correo enviado exitosamente al candidato",
                    duration: 3000,
                    gravity: "top",
                    position: "right",
                    style: { background: "linear-gradient(to right, #00b09b, #96c93d)" }
                }).showToast();
            } else {
                Swal.fire('Error', response.message, 'error');
            }
        },
        error: function (xhr, status, error) {
            Swal.close();
            Swal.fire('Error', 'No se pudo enviar el mensaje', 'error');
        }
    });
}
function inicializarDropdownsTablas() {
    $('.table-responsive').on('scroll', function () {
        cerrarTodosLosDropdowns();
    });

    $(document).on('click', '.dropdown-Opciones .dropdown-toggle', function (e) {
        e.preventDefault();
        e.stopPropagation();

        const dropdownToggle = $(this)[0];
        const dropdownMenu = $(this).next('.dropdown-menu')[0];

        if (!dropdownMenu) return;

        const isShowing = $(dropdownMenu).hasClass('show');

        cerrarTodosLosDropdowns();

        if (!isShowing) {
            $(dropdownMenu).addClass('show');
            $(dropdownToggle).addClass('show');
            dropdownToggle.setAttribute('aria-expanded', 'true');

            posicionarDropdownEnTabla(dropdownToggle, dropdownMenu);
        }
    });
}

function posicionarDropdownEnTabla(dropdownToggle, dropdownMenu) {
    const toggleRect = dropdownToggle.getBoundingClientRect();
    const menuHeight = dropdownMenu.offsetHeight || 200;
    const menuWidth = dropdownMenu.offsetWidth || 260;

    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    let top, left;

    if (toggleRect.bottom + menuHeight + 10 <= viewportHeight) {
        top = toggleRect.bottom + 5;
    } else {
        top = Math.max(10, toggleRect.top - menuHeight - 5);
    }

    left = Math.max(10, Math.min(toggleRect.left, viewportWidth - menuWidth - 10));

    dropdownMenu.style.cssText = `
        position: fixed !important;
        top: ${top}px !important;
        left: ${left}px !important;
        z-index: 10000 !important;
        display: block !important;
    `;
}
function cerrarTodosLosDropdowns() {
    $('.dropdown-Opciones .dropdown-menu').each(function () {
        $(this).removeClass('show');
        $(this).css({
            'position': '',
            'top': '',
            'left': '',
            'z-index': '',
            'display': 'none',
            'opacity': '0',
            'visibility': 'hidden'
        });
    });

    $('.dropdown-Opciones .dropdown-toggle').each(function () {
        $(this).removeClass('show');
        $(this).attr('aria-expanded', 'false');
        $(this).blur();
    });

    document.querySelectorAll('.dropdown-Opciones').forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        if (toggle) {
            const bsDropdown = bootstrap.Dropdown.getInstance(toggle);
            if (bsDropdown) {
                bsDropdown.hide();
            }
        }
    });
}
$(document).ready(function () {
    inicializarDropdownsTablas();

    $(document).on('click', function (e) {
        if (!$(e.target).closest('.dropdown-Opciones').length) {
            cerrarTodosLosDropdowns();
        }
    });
});



function posicionarDropdownCorrectamente(dropdownToggle, dropdownMenu) {
    if (!dropdownToggle || !dropdownMenu) return;

    const toggleRect = dropdownToggle.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const isMobile = viewportWidth <= 768;

    const menuWidth = isMobile ? 180 : 200;
    const menuHeight = 220;

    let top;
    let left;

    if (isMobile) {
        top = toggleRect.top - menuHeight - 5;

        if (top < 10) {
            top = 10;
        }

        left = viewportWidth - menuWidth - 10;

        if (left < 5) {
            left = 5;
        }
    } else {
        top = toggleRect.top - menuHeight - 5;
        left = toggleRect.right - menuWidth;

        if (top < -100) {
            top = 10;
        }

        if (left < 10) {
            left = 10;
        }
        if (left + menuWidth > viewportWidth - 10) {
            left = viewportWidth - menuWidth - 10;
        }
    }

    dropdownMenu.style.cssText = `
        position: fixed !important;
        top: ${top}px !important;
        left: ${left}px !important;
        z-index: 9999999 !important;
        display: block !important;
        opacity: 1 !important;
        visibility: visible !important;
        width: ${menuWidth}px !important;
        max-height: ${isMobile ? 'calc(100vh - 80px)' : 'auto'} !important;
        overflow-y: ${isMobile ? 'auto' : 'visible'} !important;
        background-color: white !important;
        border: 1px solid #dee2e6 !important;
        border-radius: 0.25rem !important;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
        padding: 0 !important;
        margin: 0 !important;
    `;
}

function manejarDropdowns() {
    $('.table-responsive').on('scroll', function () {
        cerrarTodosLosDropdowns();
    });

    $(window).on('scroll', function () {
        cerrarTodosLosDropdowns();
    });

    $(document).on('click', '.dropdown-Opciones .dropdown-toggle', function (e) {
        e.preventDefault();
        e.stopPropagation();

        const $toggle = $(this);
        const $menu = $toggle.next('.dropdown-menu');

        if (!$menu.length) return;

        const isShowing = $menu.hasClass('show');

        cerrarTodosLosDropdowns();

        if (!isShowing) {
            $menu.addClass('show');
            $toggle.addClass('show');
            $toggle.attr('aria-expanded', 'true');

            $menu.data('toggleElement', $toggle[0]);

            setTimeout(() => {
                posicionarDropdownCorrectamente($toggle[0], $menu[0]);
            }, 10);
        }
    });

    $(document).on('click', function (e) {
        if (!$(e.target).closest('.dropdown-Opciones').length) {
            cerrarTodosLosDropdowns();
        }
    });

    $(window).on('resize', function () {
        cerrarTodosLosDropdowns();
    });
}

function manejarClickDropdown(e) {
    e.preventDefault();
    e.stopPropagation();

    const dropdownToggle = this;
    const dropdownMenu = dropdownToggle.nextElementSibling;

    if (!dropdownMenu || !dropdownMenu.classList.contains('dropdown-menu')) {
        return;
    }

    const isShowing = dropdownMenu.classList.contains('show');

    cerrarTodosLosDropdowns();

    if (!isShowing) {
        dropdownMenu.classList.add('show');
        dropdownToggle.classList.add('show');
        dropdownToggle.setAttribute('aria-expanded', 'true');

        setTimeout(() => {
            posicionarDropdownCorrectamente(dropdownToggle);
        }, 10);
    }
}

function cerrarTodosLosDropdowns() {
    $('.dropdown-Opciones .dropdown-menu').removeClass('show').removeAttr('style');
    $('.dropdown-Opciones .dropdown-toggle').removeClass('show').attr('aria-expanded', 'false');
}


function reinicializarDropdowns() {
    setTimeout(function () {
        document.querySelectorAll('.dropdown-Opciones .dropdown-toggle').forEach(function (toggle) {
            const newToggle = toggle.cloneNode(true);
            toggle.parentNode.replaceChild(newToggle, toggle);
        });

        manejarDropdowns();
        reinicializarBootstrapDropdowns();
    }, 100);
}

function reinicializarBootstrapDropdowns() {
    var dropdownElements = document.querySelectorAll('.dropdown-Opciones');
    dropdownElements.forEach(function (dropdownElement) {
        var dropdownInstance = bootstrap.Dropdown.getInstance(dropdownElement);
        if (!dropdownInstance) {
            new bootstrap.Dropdown(dropdownElement);
        }
    });
}
function asegurarZIndexModal(idModal, zIndex) {
    const modal = document.getElementById(idModal);
    if (modal) {
        modal.style.zIndex = zIndex;

        $(modal).on('shown.bs.modal', function () {
            const backdrop = document.querySelector('.modal-backdrop:last-of-type');
            if (backdrop) {
                backdrop.style.zIndex = zIndex - 1;
            }
        });
    }
}


function configurarCierreDropdowns() {
    document.addEventListener('click', function (e) {
        if (e.target.closest('.dropdown-Opciones .dropdown-toggle')) {
            return;
        }

        if (e.target.closest('button') || e.target.closest('.btn')) {
            cerrarTodosLosDropdowns();
        }
    });
}


//$(document).ready(function () {
//    const modalesConfig = {
//        'modalVerPostulaciones': 1000,
//        'modalCalificarEgresado': 9999,
//        'modalCambiarEstadoPostulacion': 9999,
//        'modalConfirmarContratacion': 9999,
//        'modalContactarEgresado': 1060,
//        'modalPerfilCompleto': 9999,
//        'VerCV': 10000
//    };

//    Object.keys(modalesConfig).forEach(modalId => {
//        const modal = document.getElementById(modalId);
//        if (modal) {
//            modal.style.zIndex = modalesConfig[modalId];

//            $(modal).on('shown.bs.modal', function () {
//                const backdrops = document.querySelectorAll('.modal-backdrop');
//                if (backdrops.length > 0) {
//                    const lastBackdrop = backdrops[backdrops.length - 1];
//                    lastBackdrop.style.zIndex = modalesConfig[modalId] - 1;
//                }
//            });
//        }
//    });
//});

function inicializarDropdownsInteligentes() {
    $('.table-responsive').on('scroll', function () {
        $('.dropdown-Opciones .dropdown-menu').removeClass('show');
        $('.dropdown-Opciones .dropdown-toggle').removeClass('show');
    });

    $(document).on('click', '.dropdown-Opciones .dropdown-toggle', function (e) {
        e.preventDefault();
        e.stopPropagation();

        const $toggle = $(this);
        const $dropdown = $toggle.closest('.dropdown-Opciones');
        const $menu = $dropdown.find('.dropdown-menu');

        $('.dropdown-Opciones .dropdown-menu').not($menu).removeClass('show');
        $('.dropdown-Opciones .dropdown-toggle').not($toggle).removeClass('show');

        const isShowing = $menu.hasClass('show');

        if (!isShowing) {
            $menu.addClass('show');
            $toggle.addClass('show');
            $toggle.attr('aria-expanded', 'true');

            posicionarDropdownInteligente($dropdown);
        } else {
            $menu.removeClass('show');
            $toggle.removeClass('show');
            $toggle.attr('aria-expanded', 'false');
        }
    });

    $(document).on('click', function (e) {
        if (!$(e.target).closest('.dropdown-Opciones').length) {
            $('.dropdown-Opciones .dropdown-menu').removeClass('show');
            $('.dropdown-Opciones .dropdown-toggle').removeClass('show');
        }
    });
}

function posicionarDropdownInteligente($dropdown) {
    const $menu = $dropdown.find('.dropdown-menu');
    const $toggle = $dropdown.find('.dropdown-toggle');

    $menu.removeClass('dropdown-menu-left dropdown-menu-top');

    const toggleRect = $toggle[0].getBoundingClientRect();
    const menuRect = $menu[0].getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    const spaceBelow = viewportHeight - toggleRect.bottom;
    const spaceAbove = toggleRect.top;
    const spaceRight = viewportWidth - toggleRect.right;
    const spaceLeft = toggleRect.left;

    if (spaceBelow < menuRect.height && spaceAbove > spaceBelow) {
        $menu.addClass('dropdown-menu-top');
    }

    if (spaceRight < menuRect.width && spaceLeft > spaceRight) {
        $menu.addClass('dropdown-menu-left');
    }
}

$(document).ready(function () {
    inicializarDropdownsInteligentes();

    $(window).on('resize', function () {
        $('.dropdown-Opciones .dropdown-menu.show').each(function () {
            const $dropdown = $(this).closest('.dropdown-Opciones');
            posicionarDropdownInteligente($dropdown);
        });
    });
});

function reinicializarDropdownsTablas() {
    setTimeout(function () {
        inicializarDropdownsInteligentes();
    }, 100);
}


const reportesDisponibles = [
    { id: 1, nombre: 'Detalle de Postulaciones a Vacantes', action: 'DescargarPostulacionesVacantes', requiereEstado: false },
    { id: 2, nombre: 'Vacantes por Estado', action: 'DescargarVacantesPorEstado', requiereEstado: true },
    { id: 3, nombre: 'Top 10 Vacantes con Más Postulaciones', action: 'DescargarTopVacantes', requiereEstado: false },
    { id: 4, nombre: 'Egresados Contratados', action: 'DescargarEgresadosContratados', requiereEstado: false },
    { id: 5, nombre: 'Carreras con Más Postulaciones', action: 'DescargarCarrerasPostulaciones', requiereEstado: false },
    { id: 6, nombre: 'Vacantes Sin Postulaciones', action: 'DescargarVacantesSinPostulaciones', requiereEstado: false },
    { id: 7, nombre: 'Egresados No Vistos por la Empresa', action: 'DescargarEgresadosNoVistos', requiereEstado: false },
    { id: 8, nombre: 'Historial de Estados por Vacante', action: 'DescargarEstadosPorVacante', requiereEstado: false },
    { id: 9, nombre: 'Ranking de Egresados Más Activos', action: 'DescargarEgresadosActivos', requiereEstado: false }
];

function obtenerIdEmpresa() {
    const idSession = sessionStorage.getItem('idEmpresa');
    if (idSession) {
        console.log('✅ ID obtenido desde sessionStorage:', idSession);
        return idSession;
    }

    let idEmpresa = null;

    $.ajax({
        url: '/Empresas/ObtenerIdEmpresa',
        type: 'GET',
        async: false,
        success: function (response) {
            if (response.success && response.idEmpresa) {
                idEmpresa = response.idEmpresa;
                sessionStorage.setItem('idEmpresa', idEmpresa);
                console.log('✅ ID obtenido del servidor:', idEmpresa);
            } else {
                console.error('❌ Error en respuesta:', response.message);
            }
        },
        error: function (xhr, status, error) {
            console.error('❌ Error al obtener ID:', error);
        }
    });

    if (!idEmpresa) {
        Swal.fire({
            icon: 'error',
            title: 'Error de sesión',
            text: 'No se pudo obtener la información de la empresa. Por favor, inicia sesión nuevamente.',
            confirmButtonColor: '#8b1038'
        }).then(() => {
            window.location.href = '/Bienvenido/Index';
        });
    }

    return idEmpresa;
}

function abrirModalReportes() {
    cargarSelectoresReportes();
    const modalReportes = new bootstrap.Modal(document.getElementById('modalReportes'));
    modalReportes.show();
}

function cargarSelectoresReportes() {
    const selectReporte = document.getElementById('tipoReporte');

    if (!selectReporte) {
        console.error('No se encontró el selector de reportes');
        return;
    }

    selectReporte.innerHTML = '';

    const optionDefault = document.createElement('option');
    optionDefault.value = '';
    optionDefault.textContent = '📊 Seleccione un reporte...';
    optionDefault.selected = true;
    optionDefault.disabled = true;
    selectReporte.appendChild(optionDefault);

    reportesDisponibles.forEach(reporte => {
        const option = document.createElement('option');
        option.value = reporte.id;
        option.textContent = reporte.nombre;
        selectReporte.appendChild(option);
    });

    selectReporte.removeEventListener('change', mostrarOpcionesAdicionales);
    selectReporte.addEventListener('change', mostrarOpcionesAdicionales);
}

function mostrarOpcionesAdicionales() {
    const selectReporte = document.getElementById('tipoReporte');
    const reporteId = parseInt(selectReporte.value);

    if (!reporteId) {
        const containerOpciones = document.getElementById('contenedorOpcionesReporte');
        if (containerOpciones) {
            containerOpciones.innerHTML = '';
        }
        return;
    }

    let reporteSeleccionado = null;
    for (let i = 0; i < reportesDisponibles.length; i++) {
        if (reportesDisponibles[i].id === reporteId) {
            reporteSeleccionado = reportesDisponibles[i];
            break;
        }
    }

    let containerOpciones = document.getElementById('contenedorOpcionesReporte');

    if (!containerOpciones) {
        containerOpciones = document.createElement('div');
        containerOpciones.id = 'contenedorOpcionesReporte';
        containerOpciones.className = 'mb-4';
        const selectorDiv = selectReporte.parentElement;
        selectorDiv.parentElement.insertBefore(containerOpciones, selectorDiv.nextSibling);
    }

    containerOpciones.innerHTML = '';

    if (reporteSeleccionado && reporteSeleccionado.requiereEstado) {
        const html =
            '<label for="estadoVacante" class="form-label fw-bold">' +
            '<i class="bi bi-tag"></i> Estado de Vacante' +
            '</label>' +
            '<select class="form-select" id="estadoVacante">' +
            '<option value="Abierta">Abierta</option>' +
            '<option value="Cerrado">Cerrada</option>' +
            '</select>';

        containerOpciones.innerHTML = html;
    }
}

function obtenerReporteSeleccionado() {
    const selectReporte = document.getElementById('tipoReporte');
    if (!selectReporte || !selectReporte.value) {
        return null;
    }

    const reporteId = parseInt(selectReporte.value);

    for (let i = 0; i < reportesDisponibles.length; i++) {
        if (reportesDisponibles[i].id === reporteId) {
            return reportesDisponibles[i];
        }
    }

    return null;
}

function construirUrlReporte(reporte, idEmpresa) {
    let url = '/Empresas/' + reporte.action + '?idEmpresa=' + idEmpresa;

    if (reporte.requiereEstado) {
        const estadoSelect = document.getElementById('estadoVacante');
        const estado = estadoSelect ? estadoSelect.value : 'Abierta';
        url += '&estado=' + encodeURIComponent(estado);
    }

    return url;
}

function descargarReporte() {
    const idEmpresa = obtenerIdEmpresa();

    if (!idEmpresa) {
        mostrarAlerta('No se pudo obtener el ID de empresa. Intenta cerrar sesión y volver a entrar.', 'error');
        return;
    }

    const reporteSeleccionado = obtenerReporteSeleccionado();

    if (!reporteSeleccionado) {
        mostrarAlerta('Por favor selecciona un reporte', 'warning');
        return;
    }

    const url = construirUrlReporte(reporteSeleccionado, idEmpresa);
    console.log('📥 Descargando desde:', url);

    Swal.fire({
        title: 'Preparando descarga...',
        html: `
            <div class="text-center">
                <div class="spinner-border text-primary mb-3" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
                <p>Generando reporte: <strong>${reporteSeleccionado.nombre}</strong></p>
                <small class="text-muted">La descarga comenzará en un momento...</small>
            </div>
        `,
        allowOutsideClick: false,
        showConfirmButton: false,
        timer: 2000
    });

    setTimeout(() => {
        const link = document.createElement('a');
        link.href = url;
        link.download = obtenerNombreArchivo(reporteSeleccionado);
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
            document.body.removeChild(link);

            Swal.fire({
                icon: 'success',
                title: '¡Descarga iniciada!',
                text: 'Revisa tu carpeta de descargas',
                timer: 2000,
                showConfirmButton: false
            });
        }, 100);
    }, 500);
}

function obtenerNombreArchivo(reporte) {
    const fecha = new Date().toISOString().split('T')[0];
    const nombreBase = reporte.nombre.replace(/\s+/g, '_');
    return nombreBase + '_' + fecha + '.xlsx';
}

function mostrarAlerta(mensaje, tipo) {
    let icono = '';
    let claseAlerta = '';

    switch (tipo) {
        case 'success':
            icono = 'bi-check-circle-fill';
            claseAlerta = 'alert-success';
            break;
        case 'error':
            icono = 'bi-x-circle-fill';
            claseAlerta = 'alert-danger';
            break;
        case 'warning':
            icono = 'bi-exclamation-triangle-fill';
            claseAlerta = 'alert-warning';
            break;
        case 'info':
            icono = 'bi-info-circle-fill';
            claseAlerta = 'alert-info';
            break;
        default:
            icono = 'bi-info-circle-fill';
            claseAlerta = 'alert-info';
    }

    const alertaHtml =
        '<div class="alert ' + claseAlerta + ' alert-dismissible fade show position-fixed" ' +
        'style="top: 20px; right: 20px; z-index: 10000; min-width: 300px;" role="alert">' +
        '<i class="bi ' + icono + ' me-2"></i>' +
        mensaje +
        '<button type="button" class="btn-close" data-bs-dismiss="alert"></button>' +
        '</div>';

    document.body.insertAdjacentHTML('beforeend', alertaHtml);
    setTimeout(function () {
        const alertas = document.querySelectorAll('.alert.position-fixed');
        if (alertas.length > 0) {
            const ultimaAlerta = alertas[alertas.length - 1];
            const bsAlert = bootstrap.Alert.getInstance(ultimaAlerta);
            if (bsAlert) {
                bsAlert.close();
            }
        }
    }, 5000);
}


function cargarNotificacionesActivas() {
    try {
        $.ajax({
            url: '/Empresas/ObtenerNotificacionesActivas',
            type: 'GET',
            success: function (response) {
                if (response.success) {
                    const contadorNotificaciones = document.querySelector('.stat-card:nth-child(3) .stat-value');
                    if (contadorNotificaciones) {
                        contadorNotificaciones.textContent = response.data.total || '0';
                    }

                    if (response.data.total !== undefined) {
                        console.log('Postulaciones activas:', response.data.total);
                    }
                } else {
                    console.error('Error al cargar Postulaciones:', response.message);
                    actualizarContadorNotificaciones(0);
                }
            },
            error: function (error) {
                console.error('Error en cargar Postulaciones Activas:', error);
                actualizarContadorNotificaciones(0);
            }
        });
    } catch (error) {
        console.error('Error en cargar Postulaciones Activas: ', error);
        actualizarContadorNotificaciones(0);
    }
}

function actualizarContadorNotificaciones(cantidad) {
    const contador = document.querySelector('.stat-card:nth-child(3) .stat-value');
    if (contador) {
        contador.textContent = cantidad;
    }
}