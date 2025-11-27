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

    if (tipo === 'actualizacion' && mensaje === 'actualizar_dashboard') {
        actualizarDashboardSilenciosamente();
        return;
    }

    const colores = {
        info: { bg: '#3b82f6', sombra: 'rgba(59, 130, 246, 0.2)', grad: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' },
        success: { bg: '#10b981', sombra: 'rgba(16, 185, 129, 0.2)', grad: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
        warning: { bg: '#f59e0b', sombra: 'rgba(245, 158, 11, 0.2)', grad: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
        error: { bg: '#ef4444', sombra: 'rgba(239, 68, 68, 0.2)', grad: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }
    };

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

function actualizarDashboardSilenciosamente() {

    cargarEstadisticas();
    cargarPipelineProcesos();
    cargarAplicacionesRecientes();
    cargarTendencias();

    if (typeof cargarEgresados === 'function') {
        cargarEgresados();
    }

    if ($.fn.DataTable && $('.table').DataTable()) {
        $('.table').DataTable().ajax.reload(null, false);
    }
}

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

$('#EnviarMensajeTodos').on('click', function () {
    Swal.fire({
        title: 'Enviar mensaje a todos los usuarios conectados',
        html: `
            <input id="swal-mensaje" class="swal2-input" placeholder="Escribe el mensaje...">
            <select id="swal-tipo" class="swal2-select">
                <option value="info">Info</option>
                <option value="success">Éxito</option>
                <option value="warning">Advertencia</option>
                <option value="error">Error</option>
            </select>
        `,
        showCancelButton: true,
        confirmButtonText: 'Enviar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#6b7280',
        preConfirm: () => {
            const mensaje = document.getElementById('swal-mensaje').value;
            const tipo = document.getElementById('swal-tipo').value;
            if (!mensaje) {
                Swal.showValidationMessage('Debes escribir un mensaje');
                return false;
            }
            return { mensaje, tipo };
        }
    }).then((result) => {
        if (result.isConfirmed && result.value) {
            const { mensaje, tipo } = result.value;

            $.ajax({
                url: '/Administracion/EnviarNotificacionGeneral',
                method: 'POST',
                data: { mensaje, tipo },
                success: (response) => {
                    if (response.success) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Mensaje enviado',
                            text: 'Se notificó a todos los usuarios conectados.',
                            confirmButtonColor: '#10b981'
                        });
                    }
                },
                error: () => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'No se pudo enviar el mensaje a los usuarios conectados.',
                        confirmButtonColor: '#dc2626'
                    });
                }
            });
        }
    });
});



let estadoSeleccionado = 'En revision';
let paginaActual = 1;
const registrosPorPagina = 5;
let graficoTendenciasInstance = null;
let datosEstadisticas = {};
let datosPipeline = {};
let datosAplicaciones = [];
let datosCandidatos = [];
let modalEmpresas = null;
let isDraggingEmpresas = false;
let isMaximizedEmpresas = false;
let isMinimizedEmpresas = false;
let originalStateEmpresas = {};
let floatingIconEmpresas = null;
let empresasData = [];
let paginaActualEmpresas = 1;
let empresasPorPaginaEmpresas = 20;
let empresasFiltradas = [];
let filtrosActivos = {
    nombre: '',
    ubicacion: '',
    usuario: '',
    sector: '',
    tamano: '',
    vinculada: 'todas',
    nit: ''
};
let egresadosData = [];
let paginaActualEgresados = 1;
let egresadosPorPaginaEgresados = 20;
let egresadosFiltrados = [];
let filtrosActivosEgresados = {
    nombre: '',
    documento: '',
    email: '',
    carrera: '',
    telefono: '',
    anioGraduacion: ''
};

let modalEgresados = null;
let isMaximizedEgresados = false;
let isMinimizedEgresados = false;
let isDraggingEgresados = false;
let originalStateEgresados = {};
let floatingIconEgresados = null;

let vacantesData = [];
let paginaActualVacantes = 1;
let vacantesPorPaginaVacantes = 20;
let vacantesFiltradas = [];
let filtrosActivosVacantes = {
    titulo: '',
    empresa: '',
    area: '',
    modalidad: '',
    tipoContrato: '',
    ubicacion: '',
    estado: ''
};

let modalVacantes = null;
let isMaximizedVacantes = false;
let isMinimizedVacantes = false;
let isDraggingVacantes = false;
let originalStateVacantes = {};
let floatingIconVacantes = null;

$('#AdministrarEmpresas').on('click', abrirModalEmpresas);
$('#AdministrarVacantes').on('click', abrirModalVacantes);
$('#AdministrarEgresados').on('click', abrirModalEgresados);

function cargarEstadisticas() {
    $.ajax({
        url: '/Administracion/ObtenerEstadisticas',
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            if (response.success && response.data) {
                datosEstadisticas = response.data;
                actualizarEstadisticas(response.data);
            }
        },
        error: function (xhr, status, error) {
            console.error('Error al cargar estadísticas:', error);
        }
    });
}

function actualizarEstadisticas(datos) {
    $('.stats-card').eq(0).find('.number').fadeOut(200, function () {
        $(this).text(datos.VacantesActivas || 0).fadeIn(200);
    });

    $('.stats-card').eq(1).find('.number').fadeOut(200, function () {
        $(this).text(datos.AplicacionesUltimos30Dias || 0).fadeIn(200);
    });

    $('.stats-card').eq(2).find('.number').fadeOut(200, function () {
        $(this).text(datos.ContratacionesYTD || 0).fadeIn(200);
    });

    $('.stats-card').eq(3).find('.number').fadeOut(200, function () {
        $(this).text((datos.PromedioEvaluacion || 0).toFixed(1)).fadeIn(200);
    });

    $('.stats-card').eq(4).find('.number').fadeOut(200, function () {
        $(this).text(datos.CVsVistos || 0).fadeIn(200);
    });

    $('.stats-card').eq(5).find('.number').fadeOut(200, function () {
        $(this).text((datos.TimeToHirePromedio || 0) + 'd').fadeIn(200);
    });
}


function cargarPipelineProcesos() {
    const tabActiva = $('.pipeline-tab.active');
    if (tabActiva.length > 0) {
        estadoSeleccionado = tabActiva.data('estado');
    }

    $.ajax({
        url: '/Administracion/ObtenerPipelineProcesos',
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            if (response.success && response.data) {
                datosPipeline = response.data;
                actualizarPipeline(response.data);
            }
        },
        error: function (xhr, status, error) {
            console.error('Error al cargar pipeline:', error);
        }
    });
}

function actualizarPipeline(datos) {
    let htmlTabs = '';
    let htmlContenido = '';

    const estados = {
        'En revision': 0,
        'Entrevista': 0,
        'Oferta': 0,
        'Contratado': 0
    };

    datos.forEach(grupo => {
        if (estados.hasOwnProperty(grupo.Estado)) {
            estados[grupo.Estado] = grupo.Cantidad;

            if (grupo.Candidatos && grupo.Candidatos.length > 0) {
                grupo.Candidatos.sort((a, b) => {
                    const fechaA = new Date(a.fecha_postulacion);
                    const fechaB = new Date(b.fecha_postulacion);
                    return fechaA - fechaB; 
                });
            }
        }
    });

    let grupoActivo = datos.find(g => g.Estado === estadoSeleccionado);

    if (!grupoActivo || !grupoActivo.Candidatos || grupoActivo.Candidatos.length === 0) {
        grupoActivo = datos.find(g => g.Candidatos && g.Candidatos.length > 0) || datos[0];
        if (grupoActivo) {
            estadoSeleccionado = grupoActivo.Estado;
        }
    }

    htmlTabs = `
        <div class="pipeline-tabs">
            <div class="pipeline-tab ${estadoSeleccionado === 'En revision' ? 'active' : ''}" data-estado="En revision">
                <i class="fas fa-search mr-1"></i>
                En revisión 
                <span class="badge text-dark ml-1">${estados['En revision']}</span>
            </div>
            <div class="pipeline-tab ${estadoSeleccionado === 'Entrevista' ? 'active' : ''}" data-estado="Entrevista">
                <i class="fas fa-user-clock mr-1"></i>
                Entrevistas 
                <span class="badge text-dark ml-1">${estados['Entrevista']}</span>
            </div>
            <div class="pipeline-tab ${estadoSeleccionado === 'Oferta' ? 'active' : ''}" data-estado="Oferta">
                <i class="fas fa-file-contract mr-1"></i>
                Ofertas 
                <span class="badge text-dark ml-1">${estados['Oferta']}</span>
            </div>
            <div class="pipeline-tab ${estadoSeleccionado === 'Contratado' ? 'active' : ''}" data-estado="Contratado">
                <i class="fas fa-check-circle mr-1"></i>
                Contratados 
                <span class="badge text-dark ml-1">${estados['Contratado']}</span>
            </div>
        </div>
    `;

    htmlContenido = generarTablaPipeline(grupoActivo);

    const $container = $('#pipeline-container');
    $container.fadeOut(150, function () {
        $container.html(htmlTabs + htmlContenido);
        agregarEventosTabsPipeline();
        $container.fadeIn(150);
    });
}

function generarTablaPipeline(grupo) {
    if (!grupo || !grupo.Candidatos || grupo.Candidatos.length === 0) {
        return `
            <div class="pipeline-table-container mt-3">
                <div class="text-center p-4 text-muted">
                    <i class="fas fa-inbox fa-2x mb-2"></i>
                    <p>No hay candidatos en esta etapa</p>
                </div>
            </div>
        `;
    }

    const candidatos = grupo.Candidatos;
    const totalRegistros = candidatos.length;
    const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina);

    const inicio = (paginaActual - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    const candidatosPaginados = candidatos.slice(inicio, fin);

    let filas = '';

    candidatosPaginados.forEach((candidato, index) => {
        const claseBadge = obtenerClaseBadge(candidato.estado);
        const fechaFormateada = formatearFecha(candidato.fecha_postulacion);

        filas += `
            <tr>
                <td>
                    <div class="font-weight-bold">${candidato.NombreCandidato || 'Sin nombre'}</div>
                </td>
                <td>
                    <div>${candidato.NombreVacante || 'Sin vacante'}</div>
                </td>
                <td>
                    <span class="status-badge ${claseBadge}">${candidato.estado || 'Sin estado'}</span>
                </td>
                <td>
                    <small class="text-muted">${fechaFormateada}</small>
                </td>                
            </tr>
        `;
    });

    let paginacionHTML = '';
    if (totalPaginas > 1) {
        paginacionHTML = `
            <div class="d-flex justify-content-between align-items-center mt-3">
                <div class="text-muted small">
                    Mostrando ${inicio + 1} a ${Math.min(fin, totalRegistros)} de ${totalRegistros} candidato(s)
                </div>
                <div class="pagination-controls">
                    <button class="btn btn-sm btn-outline-secondary ${paginaActual === 1 ? 'disabled' : ''}" 
                            onclick="cambiarPagina(${paginaActual - 1})" 
                            ${paginaActual === 1 ? 'disabled' : ''}>
                        <i class="fas fa-chevron-left"></i> Anterior
                    </button>
                    <span class="mx-3">Página ${paginaActual} de ${totalPaginas}</span>
                    <button class="btn btn-sm btn-outline-secondary ${paginaActual === totalPaginas ? 'disabled' : ''}" 
                            onclick="cambiarPagina(${paginaActual + 1})"
                            ${paginaActual === totalPaginas ? 'disabled' : ''}>
                        Siguiente <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>
        `;
    } else {
        paginacionHTML = `
            <div class="mt-2 text-muted small">
                Mostrando ${totalRegistros} candidato(s)
            </div>
        `;
    }

    return `
        <div class="pipeline-table-container mt-3">
            <div class="table-responsive">
                <table class="pipeline-table table table-hover">
                    <thead>
                        <tr>
                            <th width="25%">Candidato</th>
                            <th width="30%">Vacante</th>
                            <th width="20%">Estado</th>
                            <th width="25%">Fecha</th>                            
                        </tr>
                    </thead>
                    <tbody>
                        ${filas}
                    </tbody>
                </table>
            </div>
            ${paginacionHTML}
        </div>
    `;
}

function cambiarPagina(nuevaPagina) {
    paginaActual = nuevaPagina;
    const grupo = datosPipeline.find(g => g.Estado === estadoSeleccionado);
    const tablaHTML = generarTablaPipeline(grupo);

    $('.pipeline-table-container').fadeOut(100, function () {
        $(this).remove();
        $('.pipeline-tabs').after(tablaHTML);
        $('.pipeline-table-container').hide().fadeIn(100);
    });
}

function agregarEventosTabsPipeline() {
    $('.pipeline-tab').off('click').on('click', function () {
        $('.pipeline-tab').removeClass('active');
        $(this).addClass('active');

        estadoSeleccionado = $(this).data('estado');
        paginaActual = 1;

        const grupo = datosPipeline.find(g => g.Estado === estadoSeleccionado);
        const tablaHTML = generarTablaPipeline(grupo);

        $('.pipeline-table-container').fadeOut(100, function () {
            $(this).remove();
            $('.pipeline-tabs').after(tablaHTML);
            $('.pipeline-table-container').hide().fadeIn(100);
        });
    });
}

function generarHTMLCandidatosPipeline(candidatos) {
    if (!candidatos || candidatos.length === 0) {
        return '<div class="text-center p-4 text-muted">No hay candidatos en esta etapa</div>';
    }

    let html = '<div class="row">';
    const mitad = Math.ceil(candidatos.length / 2);

    html += '<div class="col-md-6">';
    for (let i = 0; i < mitad; i++) {
        html += generarTarjetaCandidato(candidatos[i]);
    }
    html += '</div>';

    html += '<div class="col-md-6">';
    for (let i = mitad; i < candidatos.length; i++) {
        html += generarTarjetaCandidato(candidatos[i]);
    }
    html += '</div>';

    html += '</div>';
    return html;
}

function generarTarjetaCandidato(candidato) {
    const claseBadge = obtenerClaseBadge(candidato.estado);
    return `
        <div class="candidate-card">
            <div class="d-flex align-items-start">
                <div>
                    <div class="candidate-name">${candidato.NombreVacante || 'Sin vacante'}</div>
                    <div class="candidate-role">${candidato.NombreCandidato || 'Sin nombre'} • ${candidato.estado || 'Sin estado'}</div>
                    <span class="status-badge ${claseBadge}">${candidato.estado || 'Sin estado'}</span>
                </div>
            </div>
        </div>
    `;
}

function obtenerClaseBadge(estado) {
    const clases = {
        'En revision': 'status-revision',
        'Entrevista': 'status-tecnica',
        'Oferta': 'status-oferta',
        'Contratado': 'status-contratado',
        'Rechazado': 'status-rechazado'
    };
    return clases[estado] || 'status-revision';
}
function cargarAplicacionesRecientes() {
    $.ajax({
        url: '/Administracion/ObtenerAplicacionesRecientes',
        type: 'GET',
        data: { top: 10 },
        dataType: 'json',
        success: function (response) {
            if (response.success && response.data) {
                datosAplicaciones = response.data;
                actualizarAplicacionesRecientes(response.data);
            }
        },
        error: function (xhr, status, error) {
            console.error('Error al cargar aplicaciones:', error);
        }
    });
}

function actualizarAplicacionesRecientes(aplicaciones) {
    aplicaciones.sort((a, b) => {
        const fechaA = new Date(a.fecha_postulacion);
        const fechaB = new Date(b.fecha_postulacion);
        return fechaB - fechaA;
    });

    let html = '';

    aplicaciones.forEach(app => {
        const avatarClass = `avatar-${app.Iniciales.toLowerCase()}`;
        const claseBadge = obtenerClaseBadge(app.estado);
        const fecha = formatearFecha(app.fecha_postulacion);

        html += `
            <tr>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="avatar ${avatarClass}">${app.Iniciales || 'NA'}</div>
                        <div>
                            <div class="candidate-name">${app.NombreCandidato || 'Sin nombre'}</div>
                            <div class="candidate-role">${app.Carrera || 'Sin carrera'}</div>
                        </div>
                    </div>
                </td>
                <td>${app.NombreVacante || 'Sin vacante'}</td>
                <td><span class="status-badge ${claseBadge}">${app.estado || 'Sin estado'}</span></td>
                <td>${fecha}</td>
                <td><span class="score-badge">${(app.Puntuacion || 0).toFixed(1)}</span></td>
                <td style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                    <button class="btn-cv" data-ruta="${app.RutaCV || ''}" ${!app.RutaCV ? 'disabled' : ''}>
                        CV
                    </button>
                    <button class="btn-perfil" data-idegresado="${app.id_egresado}">
                        Ver Perfil
                    </button>                    
                </td>
            </tr>
        `;
    });

    const $tbody = $('#aplicacionesRecientes tbody');
    $tbody.fadeOut(150, function () {
        $tbody.html(html);

        $('.btn-cv').on('click', function () {
            const ruta = $(this).data('ruta');
            if (ruta) {
                descargarCV(ruta);
            }
        });

        $('.btn-perfil').on('click', function () {
            const idEgresado = $(this).data('idegresado');
            cargarPerfil(idEgresado);
        });

        $tbody.fadeIn(150);
    });
}
function cargarPerfil(idEgresado) {
    $('#modalPerfilEgresado').modal('show');

    $.ajax({
        url: '/Administracion/PerfilEgresado',
        type: 'GET',
        data: { idEgresado: idEgresado },
        success: function (response) {
            if (response.success) {
                mostrarPerfil(response.data);
            } else {
                Swal.fire({
                    title: 'Error',
                    text: response.message,
                    icon: 'error'
                });
            }
        },
        error: function (xhr, status, error) {
            Swal.fire({
                title: 'Error al cargar el perfil',
                text: response.message,
                icon: 'error'
            });
        }
    });
}

function mostrarPerfil(perfil) {
    var contenido = `
        <div class="row">
            <!-- Información Básica -->
            <div class="col-md-6">
                <div class="card mb-3">
                    <div class="card-header">
                        <h6 class="mb-0">Información Personal</h6>
                    </div>
                    <div class="card-body">
                        <p><strong>Nombre:</strong> ${perfil.NombreCompleto}</p>
                        <p><strong>Documento:</strong> ${perfil.numero_documento}</p>
                        <p><strong>Email:</strong> ${perfil.email}</p>
                        <p><strong>Teléfono:</strong> ${perfil.telefono || 'No especificado'}</p>
                    </div>
                </div>
            </div>
            
            <div class="col-md-6">
                <div class="card mb-3">
                    <div class="card-header">
                        <h6 class="mb-0">Información Académica</h6>
                    </div>
                    <div class="card-body">
                        <p><strong>Carrera:</strong> ${perfil.nombre_carrera}</p>
                        <p><strong>Promedio Académico:</strong> ${perfil.promedio_academico || 'No especificado'}</p>
                        <p><strong>Nivel de Experiencia:</strong> ${perfil.nivel_experiencia || 'No especificado'}</p>
                        <p><strong>Puntuación Global:</strong> ${perfil.puntuacion_global || 'Aun no ah sido calificado'}</p>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-12">
                <div class="card mb-3">
                    <div class="card-header">
                        <h6 class="mb-0">Habilidades y Presentación</h6>
                    </div>
                    <div class="card-body">
                        ${perfil.habilidades ? `<p><strong>Habilidades Principales:</strong> ${perfil.habilidades}</p>` : ''}
                        ${perfil.CartaPresentacion ? `<p><strong>Carta de Presentación:</strong><br>${perfil.CartaPresentacion}</p>` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;

    if (perfil.Idiomas && perfil.Idiomas.length > 0) {
        contenido += `
            <div class="card mb-3">
                <div class="card-header">
                    <h6 class="mb-0">Idiomas</h6>
                </div>
                <div class="card-body">
                    <div class="row">
        `;

        perfil.Idiomas.forEach(idioma => {
            contenido += `
                <div class="col-md-4 mb-2">
                    <div class="border p-2 rounded">
                        <strong>${idioma.nombre}</strong><br>
                        <small>Nivel: ${idioma.nivel}</small>
                    </div>
                </div>
            `;
        });

        contenido += `
                    </div>
                </div>
            </div>
        `;
    }

    if (perfil.Certificacioness && perfil.Certificacioness.length > 0) {
        contenido += `
            <div class="card mb-3">
                <div class="card-header bg-secondary text-white">
                    <h6 class="mb-0">Certificaciones</h6>
                </div>
                <div class="card-body">
                    <div class="row">
        `;

        perfil.Certificacioness.forEach(certificacion => {
            contenido += `
                <div class="col-md-6 mb-2">
                    <div class="border p-2 rounded">
                        <strong>${certificacion.nombre}</strong><br>
                        <small>Entidad: ${certificacion.entidad_emisora}</small>
                    </div>
                </div>
            `;
        });

        contenido += `
                    </div>
                </div>
            </div>
        `;
    }

    if (perfil.Preferencias) {
        const pref = perfil.Preferencias;
        contenido += `
            <div class="card mb-3">
                <div class="card-header">
                    <h6 class="mb-0">Preferencias Laborales</h6>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <p><strong>Modalidad Preferida:</strong> ${pref.modalidad_preferida || 'No especificado'}</p>
                            <p><strong>Jornada Preferida:</strong> ${pref.jornada_preferida || 'No especificado'}</p>
                            <p><strong>Área de Interés:</strong> ${pref.area_interes || 'No especificado'}</p>
                        </div>
                        <div class="col-md-6">
                            <p><strong>Ubicación Preferida:</strong> ${pref.ubicacion_preferida || 'No especificado'}</p>
                            <p><strong>Disponibilidad Inmediata:</strong> ${pref.disponible_inmediata ? 'Sí' : 'No'}</p>
                            ${pref.salario_min ? `<p><strong>Salario Mínimo:</strong> $${pref.salario_min}</p>` : ''}
                            ${pref.salario_max ? `<p><strong>Salario Máximo:</strong> $${pref.salario_max}</p>` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    document.getElementById('contenidoPerfil').innerHTML = contenido;
}

function descargarCV(ruta) {
    if (!ruta) {
        Swal.fire({
            icon: 'warning',
            title: 'CV no disponible',
            text: 'Este candidato no ha subido su CV',
            confirmButtonColor: '#8b1538'
        });
        return;
    }

    Swal.fire({
        title: 'Descargando CV',
        text: 'Preparando archivo...',
        icon: 'info',
        showConfirmButton: false,
        timer: 2000
    });

    window.open(ruta, '_blank');
}

function cargarTendencias() {
    const container = document.getElementById('tendencias-container');
    const yaExisteGrafico = container.querySelector('canvas');

    if (!yaExisteGrafico) {
        container.innerHTML = `
            <div class="text-center p-4">
                <i class="fas fa-spinner fa-spin fa-2x"></i>
                <p class="mt-2">Cargando tendencias...</p>
            </div>
        `;
    }

    $.ajax({
        url: '/Administracion/ObtenerTendencias',
        type: 'GET',
        data: { meses: 6 },
        dataType: 'json',
        success: function (response) {
            if (response.success) {
                actualizarGraficoTendencias(response.data || []);
            } else {
                actualizarGraficoTendencias([]);
            }
        },
        error: function (xhr, status, error) {
            console.error('Error al cargar tendencias:', error);
            actualizarGraficoTendencias([]);
        }
    });
}

function actualizarGraficoTendencias(datos) {
    if (!datos || datos.length === 0) {
        mostrarErrorTendencias("No hay datos en este momento");
        return;
    }

    const periodos = datos.map(item => item.Periodo);
    const totalAplicaciones = datos.map(item => item.TotalAplicaciones);
    const enRevision = datos.map(item => item.EnRevision);
    const entrevistas = datos.map(item => item.Entrevistas);
    const ofertas = datos.map(item => item.Ofertas);
    const contratados = datos.map(item => item.Contratados);

    if (graficoTendenciasInstance) {
        graficoTendenciasInstance.data.labels = periodos;
        graficoTendenciasInstance.data.datasets[0].data = totalAplicaciones;
        graficoTendenciasInstance.data.datasets[1].data = enRevision;
        graficoTendenciasInstance.data.datasets[2].data = entrevistas;
        graficoTendenciasInstance.data.datasets[3].data = ofertas;
        graficoTendenciasInstance.data.datasets[4].data = contratados;
        graficoTendenciasInstance.update('none'); 
        return;
    }

    const container = document.getElementById('tendencias-container');
    container.innerHTML = '<canvas id="graficoTendencias" height="250"></canvas>';

    const ctx = document.getElementById('graficoTendencias').getContext('2d');

    graficoTendenciasInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: periodos,
            datasets: [
                {
                    label: 'Total Aplicaciones',
                    data: totalAplicaciones,
                    borderColor: '#3366cc',
                    backgroundColor: 'rgba(51, 102, 204, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'En Revisión',
                    data: enRevision,
                    borderColor: '#ff9900',
                    backgroundColor: 'rgba(255, 153, 0, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Entrevistas',
                    data: entrevistas,
                    borderColor: '#109618',
                    backgroundColor: 'rgba(16, 150, 24, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Ofertas',
                    data: ofertas,
                    borderColor: '#990099',
                    backgroundColor: 'rgba(153, 0, 153, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Contratados',
                    data: contratados,
                    borderColor: '#0099c6',
                    backgroundColor: 'rgba(0, 153, 198, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 0 
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Tendencias de Postulaciones',
                    font: {
                        size: 14
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                },
                legend: {
                    position: 'top',
                    labels: {
                        boxWidth: 12,
                        font: {
                            size: 10
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Periodo'
                    },
                    ticks: {
                        maxRotation: 45
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Cantidad'
                    },
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'nearest'
            }
        }
    });
}

function mostrarErrorTendencias(mensaje) {
    if (graficoTendenciasInstance) {
        graficoTendenciasInstance.destroy();
        graficoTendenciasInstance = null;
    }

    const container = document.getElementById('tendencias-container');
    container.innerHTML = `
        <div class="alert alert-danger text-center">
            <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
            <p class="mb-2">${mensaje}</p>
            <button class="btn btn-sm btn-outline-danger" onclick="cargarTendencias()">
                <i class="fas fa-redo"></i> Reintentar
            </button>
        </div>
    `;
}

function refrescarDashboard() {
    Swal.fire({
        title: 'Actualizando...',
        text: 'Cargando datos del dashboard',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    Promise.all([
        $.ajax({ url: '/Administracion/ObtenerEstadisticas', type: 'GET' }),
        $.ajax({ url: '/Administracion/ObtenerPipelineProcesos', type: 'GET' }),
        $.ajax({ url: '/Administracion/ObtenerAplicacionesRecientes', type: 'GET' })
    ]).then((results) => {
        if (results[0].success) actualizarEstadisticas(results[0].data);
        if (results[1].success) actualizarPipeline(results[1].data);
        if (results[2].success) actualizarAplicacionesRecientes(results[2].data);

        Swal.close();

        Toastify({
            text: "Dashboard actualizado correctamente",
            duration: 3000,
            gravity: "top",
            position: "right",
            backgroundColor: "#10b981",
        }).showToast();
    }).catch((error) => {
        console.error('Error al refrescar dashboard:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo actualizar el dashboard completamente',
            confirmButtonColor: '#8b1538'
        });
    });
}
function formatearFecha(fechaString) {
    const timestamp = parseInt(fechaString.match(/\d+/)[0]);

    const fecha = new Date(timestamp);

    return fecha.toLocaleDateString('es-ES');
}

function abrirModalVacantes() {
    if (modalVacantes) {
        const modal = $(modalVacantes);
        modal.removeClass('animate__backOutRight').addClass('animate__backInRight').show();

        if (isMaximizedVacantes) $('body').css('overflow', 'hidden');
        else $('body').css('overflow', 'auto');

        cargarVacantes();
        return;
    }

    const modal = $(`
        <div class="modal-vacantes-draggable animate__animated" style="top: 50%; left: 50%;">
            <div class="modal-vacantes-header-drag">
                <h6 class="mb-0">
                    <i class="fa-solid fa-briefcase me-2"></i>Vacantes Registradas <label id="TotalVacantes"></label>
                </h6>
                <div class="modal-vacantes-controls">
                    <button id="minimizeModalVacantes" title="Minimizar">
                        <i class="fa-solid fa-minus"></i>
                    </button>
                    <button id="maximizeModalVacantes" title="Maximizar">
                        <i class="fa-solid fa-expand"></i>
                    </button>
                    <button id="closeModalVacantes" title="Cerrar">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            </div>
            <div class="modal-vacantes-body-drag">
                <div class="filtros-vacantes-panel">
                    <div class="filtros-header">
                        <h6><i class="fa-solid fa-filter me-2"></i>Filtros</h6>
                        <button id="limpiarFiltrosVacantes" class="btn-limpiar-filtros" title="Limpiar filtros">
                            <i class="fa-solid fa-eraser"></i> Limpiar
                        </button>
                    </div>
                    <div class="filtros-grid">
                        <div class="filtro-item">
                            <label><i class="fa-solid fa-heading"></i> Título</label>
                            <input type="text" id="filtroTituloVacante" class="filtro-input" placeholder="Buscar por título...">
                        </div>
                        <div class="filtro-item">
                            <label><i class="fa-solid fa-building"></i> Empresa</label>
                            <input type="text" id="filtroEmpresaVacante" class="filtro-input" placeholder="Buscar por empresa...">
                        </div>
                        <div class="filtro-item">
                            <label><i class="fa-solid fa-map-marker-alt"></i> Ubicación</label>
                            <input type="text" id="filtroUbicacionVacante" class="filtro-input" placeholder="Buscar por ubicación...">
                        </div>
                        <div class="filtro-item">
                            <label><i class="fa-solid fa-layer-group"></i> Área</label>
                            <select id="filtroAreaVacante" class="filtro-select">
                                <option value="">Todas las áreas</option>
                            </select>
                        </div>
                        <div class="filtro-item">
                            <label><i class="fa-solid fa-laptop-house"></i> Modalidad</label>
                            <select id="filtroModalidadVacante" class="filtro-select">
                                <option value="">Todas las modalidades</option>
                            </select>
                        </div>
                        <div class="filtro-item">
                            <label><i class="fa-solid fa-file-contract"></i> Tipo de Contrato</label>
                            <select id="filtroTipoContratoVacante" class="filtro-select">
                                <option value="">Todos los tipos</option>
                            </select>
                        </div>
                        <div class="filtro-item">
                            <label><i class="fa-solid fa-toggle-on"></i> Estado</label>
                            <select id="filtroEstadoVacante" class="filtro-select">
                                <option value="">Todos los estados</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="paginacion-container">
                    <div class="paginacion-info">
                        <span id="info-paginacion-vacantes">Mostrando 0-0 de 0 vacantes</span>
                    </div>
                    <div class="paginacion-controles">
                        <button id="btnPrimeraPaginaVacantes" class="btn-paginacion" title="Primera página">
                            <i class="fa-solid fa-angles-left"></i>
                        </button>
                        <button id="btnPaginaAnteriorVacantes" class="btn-paginacion" title="Anterior">
                            <i class="fa-solid fa-angle-left"></i>
                        </button>
                        <div class="paginacion-numeros" id="numerosPaginaVacantes"></div>
                        <button id="btnPaginaSiguienteVacantes" class="btn-paginacion" title="Siguiente">
                            <i class="fa-solid fa-angle-right"></i>
                        </button>
                        <button id="btnUltimaPaginaVacantes" class="btn-paginacion" title="Última página">
                            <i class="fa-solid fa-angles-right"></i>
                        </button>
                        <select id="selectVacantesPorPagina" class="select-por-pagina">
                            <option value="10">10 por página</option>
                            <option value="20" selected>20 por página</option>
                            <option value="50">50 por página</option>
                            <option value="100">100 por página</option>
                        </select>
                    </div>
                </div>

                <div id="contenedor-vacantes">
                    <div class="text-center py-5">
                        <i class="fa-solid fa-spinner fa-spin fa-3x text-primary"></i>
                        <p class="mt-3">Cargando vacantes...</p>
                    </div>
                </div>
            </div>
        </div>
    `);

    $('body').append(modal);
    modalVacantes = modal[0];

    const winW = $(window).width();
    const winH = $(window).height();
    const modalW = modal.outerWidth();
    const modalH = modal.outerHeight();
    modal.css({
        top: (winH - modalH) / 2 + 'px',
        left: (winW - modalW) / 2 + 'px'
    });

    hacerModalVacantesArrastrable();
    configurarControlesModalVacantes();
    configurarFiltrosVacantes();
    configurarPaginacionVacantes();
    modal.addClass('animate__backInRight');
    modal.show();
    cargarVacantes();
}

function configurarFiltrosVacantes() {
    let timeoutId;

    $('#filtroTituloVacante, #filtroEmpresaVacante, #filtroUbicacionVacante').on('input', function () {
        clearTimeout(timeoutId);
        const filtroId = $(this).attr('id');
        const valor = $(this).val().trim();

        timeoutId = setTimeout(() => {
            switch (filtroId) {
                case 'filtroTituloVacante':
                    filtrosActivosVacantes.titulo = valor;
                    break;
                case 'filtroEmpresaVacante':
                    filtrosActivosVacantes.empresa = valor;
                    break;
                case 'filtroUbicacionVacante':
                    filtrosActivosVacantes.ubicacion = valor;
                    break;
            }
            aplicarFiltrosVacantes();
        }, 300);
    });

    $('#filtroAreaVacante').on('change', function () {
        filtrosActivosVacantes.area = $(this).val();
        aplicarFiltrosVacantes();
    });

    $('#filtroModalidadVacante').on('change', function () {
        filtrosActivosVacantes.modalidad = $(this).val();
        aplicarFiltrosVacantes();
    });

    $('#filtroTipoContratoVacante').on('change', function () {
        filtrosActivosVacantes.tipoContrato = $(this).val();
        aplicarFiltrosVacantes();
    });

    $('#filtroEstadoVacante').on('change', function () {
        filtrosActivosVacantes.estado = $(this).val();
        aplicarFiltrosVacantes();
    });

    $('#limpiarFiltrosVacantes').on('click', function () {
        limpiarFiltrosVacantes();
    });
}

function limpiarFiltrosVacantes() {
    filtrosActivosVacantes = {
        titulo: '',
        empresa: '',
        area: '',
        modalidad: '',
        tipoContrato: '',
        ubicacion: '',
        estado: ''
    };

    $('#filtroTituloVacante').val('');
    $('#filtroEmpresaVacante').val('');
    $('#filtroUbicacionVacante').val('');
    $('#filtroAreaVacante').val('');
    $('#filtroModalidadVacante').val('');
    $('#filtroTipoContratoVacante').val('');
    $('#filtroEstadoVacante').val('');

    aplicarFiltrosVacantes();
}

function aplicarFiltrosVacantes() {
    vacantesFiltradas = vacantesData.filter(vacante => {
        if (filtrosActivosVacantes.titulo) {
            const titulo = (vacante.titulo || '').toLowerCase();
            if (!titulo.includes(filtrosActivosVacantes.titulo.toLowerCase())) {
                return false;
            }
        }

        if (filtrosActivosVacantes.empresa) {
            const empresa = (vacante.empresa?.nombre || '').toLowerCase();
            if (!empresa.includes(filtrosActivosVacantes.empresa.toLowerCase())) {
                return false;
            }
        }

        if (filtrosActivosVacantes.ubicacion) {
            const ubicacion = (vacante.ubicacion || '').toLowerCase();
            if (!ubicacion.includes(filtrosActivosVacantes.ubicacion.toLowerCase())) {
                return false;
            }
        }

        if (filtrosActivosVacantes.area) {
            if (vacante.area !== filtrosActivosVacantes.area) {
                return false;
            }
        }

        if (filtrosActivosVacantes.modalidad) {
            if (vacante.modalidad !== filtrosActivosVacantes.modalidad) {
                return false;
            }
        }

        if (filtrosActivosVacantes.tipoContrato) {
            if (vacante.tipo_contrato !== filtrosActivosVacantes.tipoContrato) {
                return false;
            }
        }

        if (filtrosActivosVacantes.estado) {
            if (vacante.estado !== filtrosActivosVacantes.estado) {
                return false;
            }
        }

        return true;
    });

    paginaActualVacantes = 1;
    renderizarPaginaActualVacantes();
    actualizarControlsPaginacionVacantes();
    $('#TotalVacantes').text(`(${vacantesFiltradas.length} de ${vacantesData.length})`);
}

function renderizarPaginaActualVacantes() {
    const inicio = (paginaActualVacantes - 1) * vacantesPorPaginaVacantes;
    const fin = inicio + vacantesPorPaginaVacantes;
    const vacantesPagina = vacantesFiltradas.slice(inicio, fin);

    renderizarVacantes(vacantesPagina);
}

function actualizarControlsPaginacionVacantes() {
    const totalPaginas = Math.ceil(vacantesFiltradas.length / vacantesPorPaginaVacantes);

    $('#btnPrimeraPaginaVacantes, #btnPaginaAnteriorVacantes').prop('disabled', paginaActualVacantes === 1);
    $('#btnUltimaPaginaVacantes, #btnPaginaSiguienteVacantes').prop('disabled', paginaActualVacantes === totalPaginas || totalPaginas === 0);

    const inicio = vacantesFiltradas.length > 0 ? (paginaActualVacantes - 1) * vacantesPorPaginaVacantes + 1 : 0;
    const fin = Math.min(paginaActualVacantes * vacantesPorPaginaVacantes, vacantesFiltradas.length);
    $('#info-paginacion-vacantes').text(`Mostrando ${inicio}-${fin} de ${vacantesFiltradas.length} vacantes`);

    generarNumerosPaginaVacantes(totalPaginas);
}

function generarNumerosPaginaVacantes(totalPaginas) {
    const contenedor = $('#numerosPaginaVacantes');
    contenedor.empty();

    if (totalPaginas === 0) return;

    let inicio = Math.max(1, paginaActualVacantes - 2);
    let fin = Math.min(totalPaginas, inicio + 4);

    if (fin - inicio < 4) {
        inicio = Math.max(1, fin - 4);
    }

    for (let i = inicio; i <= fin; i++) {
        const btn = $(`
            <button class="btn-numero-pagina ${i === paginaActualVacantes ? 'activo' : ''}" data-pagina="${i}">
                ${i}
            </button>
        `);
        contenedor.append(btn);
    }
}

function configurarPaginacionVacantes() {
    $('#btnPrimeraPaginaVacantes').on('click', () => {
        paginaActualVacantes = 1;
        renderizarPaginaActualVacantes();
        actualizarControlsPaginacionVacantes();
    });

    $('#btnPaginaAnteriorVacantes').on('click', () => {
        if (paginaActualVacantes > 1) {
            paginaActualVacantes--;
            renderizarPaginaActualVacantes();
            actualizarControlsPaginacionVacantes();
        }
    });

    $('#btnPaginaSiguienteVacantes').on('click', () => {
        const totalPaginas = Math.ceil(vacantesFiltradas.length / vacantesPorPaginaVacantes);
        if (paginaActualVacantes < totalPaginas) {
            paginaActualVacantes++;
            renderizarPaginaActualVacantes();
            actualizarControlsPaginacionVacantes();
        }
    });

    $('#btnUltimaPaginaVacantes').on('click', () => {
        const totalPaginas = Math.ceil(vacantesFiltradas.length / vacantesPorPaginaVacantes);
        paginaActualVacantes = totalPaginas;
        renderizarPaginaActualVacantes();
        actualizarControlsPaginacionVacantes();
    });

    $(document).on('click', '#numerosPaginaVacantes .btn-numero-pagina', function () {
        paginaActualVacantes = parseInt($(this).data('pagina'));
        renderizarPaginaActualVacantes();
        actualizarControlsPaginacionVacantes();
    });

    $('#selectVacantesPorPagina').on('change', function () {
        vacantesPorPaginaVacantes = parseInt($(this).val());
        paginaActualVacantes = 1;
        renderizarPaginaActualVacantes();
        actualizarControlsPaginacionVacantes();
    });
}

function cargarVacantes() {
    $('#contenedor-vacantes').html(`
        <div class="text-center py-5">
            <i class="fa-solid fa-spinner fa-spin fa-3x text-primary"></i>
            <p class="mt-3">Cargando vacantes...</p>
        </div>
    `);

    $.ajax({
        url: '/Administracion/ObtenerDetallesVacantes',
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            if (response.success) {
                if (response.data === null || response.data.length === 0) {
                    vacantesData = [];
                    vacantesFiltradas = [];
                    renderizarVacantes([]);
                    $('#TotalVacantes').text('(0)');
                    $('#info-paginacion-vacantes').text('Mostrando 0-0 de 0 vacantes');
                    return;
                }

                vacantesData = response.data;
                popularFiltrosSelectVacantes();
                aplicarFiltrosVacantes();
            } else {
                mostrarMensajeVacantes('warning', response.message || 'No se pudieron cargar las vacantes');
            }
        },
        error: function (xhr, status, error) {
            console.error('Error al cargar vacantes:', error);
            mostrarMensajeVacantes('danger', 'Error al cargar las vacantes. Por favor, intente nuevamente.');
        }
    });
}

function popularFiltrosSelectVacantes() {
    const areas = [...new Set(vacantesData
        .map(v => v.area)
        .filter(a => a && a !== 'No especificada')
    )].sort();

    const modalidades = [...new Set(vacantesData
        .map(v => v.modalidad)
        .filter(m => m)
    )].sort();

    const tiposContrato = [...new Set(vacantesData
        .map(v => v.tipo_contrato)
        .filter(t => t)
    )].sort();

    const estados = [...new Set(vacantesData
        .map(v => v.estado)
        .filter(e => e)
    )].sort();

    const selectArea = $('#filtroAreaVacante');
    selectArea.html('<option value="">Todas las áreas</option>');
    areas.forEach(area => {
        selectArea.append(`<option value="${area}">${area}</option>`);
    });

    const selectModalidad = $('#filtroModalidadVacante');
    selectModalidad.html('<option value="">Todas las modalidades</option>');
    modalidades.forEach(modalidad => {
        selectModalidad.append(`<option value="${modalidad}">${modalidad}</option>`);
    });

    const selectTipo = $('#filtroTipoContratoVacante');
    selectTipo.html('<option value="">Todos los tipos</option>');
    tiposContrato.forEach(tipo => {
        selectTipo.append(`<option value="${tipo}">${tipo}</option>`);
    });

    const selectEstado = $('#filtroEstadoVacante');
    selectEstado.html('<option value="">Todos los estados</option>');
    estados.forEach(estado => {
        selectEstado.append(`<option value="${estado}">${estado}</option>`);
    });
}

function hacerModalVacantesArrastrable() {
    const modal = $(modalVacantes);
    const header = modal.find('.modal-vacantes-header-drag');
    let startX, startY, startLeft, startTop;

    header.on('mousedown', function (e) {
        if (isMaximizedVacantes || isMinimizedVacantes || $(e.target).closest('.modal-vacantes-controls').length) return;

        isDraggingVacantes = true;
        startX = e.clientX;
        startY = e.clientY;
        startLeft = parseInt(modal.css('left'), 10);
        startTop = parseInt(modal.css('top'), 10);

        $(document).on('mousemove.modalVacantesDrag', function (e) {
            if (isDraggingVacantes) {
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;

                let newLeft = startLeft + dx;
                let newTop = startTop + dy;

                const modalWidth = modal.outerWidth();
                const modalHeight = modal.outerHeight();
                const windowWidth = $(window).width();
                const windowHeight = $(window).height();

                const minVisible = 50;
                const maxLeft = windowWidth - minVisible;
                const maxTop = windowHeight - minVisible;
                const minLeft = -(modalWidth - minVisible);
                const minTop = 0;

                newLeft = Math.max(minLeft, Math.min(newLeft, maxLeft));
                newTop = Math.max(minTop, Math.min(newTop, maxTop));

                modal.css({
                    left: newLeft + 'px',
                    top: newTop + 'px'
                });
            }
        });

        $(document).on('mouseup.modalVacantesDrag', function () {
            isDraggingVacantes = false;
            $(document).off('mousemove.modalVacantesDrag mouseup.modalVacantesDrag');
        });
    });
}

function configurarControlesModalVacantes() {
    $('#minimizeModalVacantes').on('click', function () {
        const modal = $(modalVacantes);
        modal.removeClass('animate__bounceIn animate__zoomIn animate__backInRight')
            .addClass('animate__backOutRight');
        if (!isMinimizedVacantes) {
            modal.one('animationend', function () {
                modal.hide();
                crearIconoFlotanteVacantes();
                isMinimizedVacantes = true;
                $('body').css('overflow', 'auto');
            });
        } else {
            restaurarDesdeIconoVacantes();
        }
    });

    $('#maximizeModalVacantes').on('click', function () {
        const modal = $(modalVacantes);
        const btn = $(this).find('i');
        modal.removeClass('animate__backOutRight animate__backInRight');

        if (!isMaximizedVacantes) {
            modal.removeClass('animate__bounceIn').addClass('animate__zoomIn');
            originalStateVacantes = {
                width: modal.width(),
                height: modal.height(),
                top: modal.css('top'),
                left: modal.css('left')
            };

            modal.addClass('maximized-vacantes');
            $('body').css('overflow', 'hidden');
            btn.removeClass('fa-expand').addClass('fa-compress');
            isMaximizedVacantes = true;
        } else {
            modal.removeClass('animate__zoomIn').addClass('animate__bounceIn');
            modal.removeClass('maximized-vacantes');
            modal.css({
                width: originalStateVacantes.width,
                height: originalStateVacantes.height,
                top: originalStateVacantes.top,
                left: originalStateVacantes.left,
                right: 'auto',
                bottom: 'auto'
            });
            $('body').css('overflow', 'auto');
            btn.removeClass('fa-compress').addClass('fa-expand');
            isMaximizedVacantes = false;
        }
    });

    $('#closeModalVacantes').on('click', function () {
        const modal = $(modalVacantes);
        modal.removeClass('animate__bounceIn animate__zoomIn animate__backInRight')
            .addClass('animate__backOutRight');
        modal.one('animationend', function () {
            modal.hide();
            eliminarIconoFlotanteVacantes();
            $('body').css('overflow', 'auto');
            isMaximizedVacantes = false;
            isMinimizedVacantes = false;
        });
    });
}

function crearIconoFlotanteVacantes() {
    eliminarIconoFlotanteVacantes();
    floatingIconVacantes = $(`
        <div class="floating-icon-vacantes" title="Restaurar ventana de vacantes">
            <i class="fa-solid fa-briefcase"></i>
        </div>
    `);
    $('body').append(floatingIconVacantes);
    floatingIconVacantes.on('click', restaurarDesdeIconoVacantes);
}

function eliminarIconoFlotanteVacantes() {
    if (floatingIconVacantes) {
        floatingIconVacantes.remove();
        floatingIconVacantes = null;
    }
}

function restaurarDesdeIconoVacantes() {
    const modal = $(modalVacantes);
    modal.removeClass('animate__backOutRight').addClass('animate__backInRight').show();

    if (isMaximizedVacantes) {
        modal.addClass('maximized-vacantes');
        $('#maximizeModalVacantes i').removeClass('fa-expand').addClass('fa-compress');
        $('body').css('overflow', 'hidden');
    } else {
        modal.removeClass('maximized-vacantes');
        if (originalStateVacantes.width) {
            modal.css({
                width: originalStateVacantes.width,
                height: originalStateVacantes.height,
                top: originalStateVacantes.top,
                left: originalStateVacantes.left,
                right: 'auto',
                bottom: 'auto'
            });
        }
        $('#maximizeModalVacantes i').removeClass('fa-compress').addClass('fa-expand');
        $('body').css('overflow', 'auto');
    }

    eliminarIconoFlotanteVacantes();
    isMinimizedVacantes = false;
}

function renderizarVacantes(vacantes) {
    const contenedor = $('#contenedor-vacantes');

    if (!vacantes || vacantes.length === 0) {
        contenedor.html(`
            <div class="alert alert-info text-center">
                <i class="fa-solid fa-info-circle fa-2x mb-3"></i>
                <p class="mb-0">No se encontraron vacantes con los filtros aplicados</p>
            </div>
        `);
        return;
    }

    let html = '<div class="vacantes-grid">';

    vacantes.forEach(vacante => {
        const empresa = vacante.empresa?.nombre || 'Empresa no especificada';
        const puntuacion = vacante.Puntuacion ? vacante.Puntuacion.toFixed(1) : '0.0';
        const estrellas = generarEstrellasVacante(vacante.Puntuacion || 0);
        const salario = formatearSalario(vacante);
        const fechaPublicacion = formatearFecha(vacante.fecha_publicacion);
        const fechaCierre = formatearFecha(vacante.fecha_cierre);
        const estadoBadge = obtenerBadgeEstado(vacante.estado);
        const creadoPor = vacante.creadoPor?.nombre_completo || vacante.creadoPor?.nombre_usuario || 'No especificado';

        html += `
            <div class="vacante-card">
                <div class="vacante-card-header">
                    <div class="vacante-info-principal">
                        <h5 class="vacante-titulo">${vacante.titulo || 'Sin título'}</h5>
                        <div class="vacante-meta">
                            <span class="vacante-empresa">
                                <i class="fa-solid fa-building me-1"></i>${empresa}
                            </span>
                            ${estadoBadge}
                        </div>
                    </div>
                    <div class="vacante-rating">
                        <div class="estrellas">${estrellas}</div>
                        <span class="puntuacion-numero">${puntuacion}</span>
                    </div>
                </div>
                
                <div class="vacante-card-body">
                    <div class="vacante-detalle">
                        <i class="fa-solid fa-layer-group text-primary"></i>
                        <span>${vacante.area || 'Área no especificada'}</span>
                    </div>
                    <div class="vacante-detalle">
                        <i class="fa-solid fa-map-marker-alt text-danger"></i>
                        <span>${vacante.ubicacion || 'Ubicación no especificada'}</span>
                    </div>
                    <div class="vacante-detalle">
                        <i class="fa-solid fa-laptop-house text-info"></i>
                        <span>${vacante.modalidad || 'No especificada'}</span>
                    </div>
                    <div class="vacante-detalle">
                        <i class="fa-solid fa-file-contract text-success"></i>
                        <span>${vacante.tipo_contrato || 'No especificado'}</span>
                    </div>
                    <div class="vacante-caracteristicas">
                        <span class="caracteristica salario">
                            <i class="fa-solid fa-dollar-sign"></i>
                            ${salario}
                        </span>
                        <span class="caracteristica fecha-publicacion">
                            <i class="fa-solid fa-calendar-plus"></i>
                            Publicado: ${fechaPublicacion}
                        </span>
                        <span class="caracteristica fecha-cierre">
                            <i class="fa-solid fa-calendar-times"></i>
                            Cierre: ${fechaCierre}
                        </span>
                        <span class="caracteristica creado-por">
                            <i class="fa-solid fa-user"></i>
                            Por: ${creadoPor}
                        </span>
                    </div>
                </div>
                
                <div class="vacante-acciones">
                    <button class="btn-accion btn-ver-detalle" onclick="verDetalleOferta('${vacante.id_vacante}')" title="Ver detalle completo">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                    <!---<button class="btn-accion btn-editar" onclick="editarVacante('${vacante.id_vacante}')" title="Editar">
                        <i class="fa-solid fa-edit"></i>
                    </button>----->
                    <button class="btn-accion btn-eliminar" onclick="confirmarEliminarVacante('${vacante.id_vacante}')" title="Eliminar">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                    <button class="btn-accion btn-postulantes" onclick="verPostulantesVacante('${vacante.id_vacante}')" title="Ver postulantes">
                        <i class="fa-solid fa-users"></i>
                    </button>
                </div>
            </div>
        `;
    });

    html += '</div>';
    contenedor.html(html);
}

function generarEstrellasVacante(puntuacion) {
    let html = '';
    const puntuacionRedondeada = Math.round(puntuacion * 2) / 2;

    for (let i = 1; i <= 5; i++) {
        if (i <= puntuacionRedondeada) {
            html += '<i class="fa-solid fa-star estrella-llena"></i>';
        } else if (i - 0.5 === puntuacionRedondeada) {
            html += '<i class="fa-solid fa-star-half-stroke estrella-media"></i>';
        } else {
            html += '<i class="fa-regular fa-star estrella-vacia"></i>';
        }
    }

    return html;
}

function formatearSalario(vacante) {
    if (vacante.salario_confidencial) {
        return 'Confidencial';
    }

    if (vacante.salario_min && vacante.salario_max) {
        return `${vacante.salario_min.toLocaleString()} - ${vacante.salario_max.toLocaleString()}`;
    } else if (vacante.salario_min) {
        return `Desde ${vacante.salario_min.toLocaleString()}`;
    } else if (vacante.salario_max) {
        return `Hasta ${vacante.salario_max.toLocaleString()}`;
    }

    return 'No especificado';
}

function obtenerBadgeEstado(estado) {
    const estados = {
        'Activa': 'badge-estado-activa',
        'Cerrada': 'badge-estado-cerrada',
        'Pausada': 'badge-estado-pausada',
        'Borrador': 'badge-estado-borrador'
    };

    const claseEstado = estados[estado] || 'badge-estado-default';
    return `<span class="badge-estado ${claseEstado}">${estado || 'Sin estado'}</span>`;
}

function formatearFecha(fechaJson) {
    if (!fechaJson) return 'No especificada';

    try {
        const match = fechaJson.match(/\d+/);
        if (!match) return 'Fecha inválida';

        const fecha = new Date(parseInt(match[0]));
        if (isNaN(fecha.getTime())) return 'Fecha inválida';

        const dia = fecha.getDate().toString().padStart(2, '0');
        const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const anio = fecha.getFullYear();

        return `${dia}/${mes}/${anio}`;
    } catch (e) {
        return 'Fecha inválida';
    }
}

function mostrarMensajeVacantes(tipo, mensaje) {
    const contenedor = $('#contenedor-vacantes');
    const iconos = {
        success: 'fa-check-circle',
        danger: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };

    contenedor.html(`
        <div class="alert alert-${tipo} text-center">
            <i class="fa-solid ${iconos[tipo]} fa-2x mb-3"></i>
            <p class="mb-0">${mensaje}</p>
        </div>
    `);
}

function verDetalleOferta(idVacante) {
    $.ajax({
        url: '/Egresado/ObtenerDetalleOferta',
        data: { idVacante: idVacante },
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            if (response.success && response.data) {
                mostrarModalDetalle(response.data);
            }
        }
    });
}

function mostrarModalDetalle(oferta) {
    const salario = oferta.salario_confidencial
        ? '<span class="badge bg-secondary">Confidencial</span>'
        : `$${formatearNumero(oferta.salario_min)} - $${formatearNumero(oferta.salario_max)}`;

    const estrellas = generarEstrellasMostrar(oferta.empresa?.Puntuacion || 0);

    const html = `
        <div class="modal fade" style="z-index:1058" id="modalDetalleOferta" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${oferta.titulo}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-4">
                            <h6><i class="fa-solid fa-building"></i> ${oferta.empresa?.razon_social}</h6>
                            <span class="ms-2">${estrellas}</span>
                            
                            <p class="text-muted">${oferta.empresa?.sector_economico} • ${oferta.empresa?.tamano_empresa}</p>
                        </div>

                        <div class="row mb-3">
                            <div class="col-md-6">
                                <strong><i class="fa-solid fa-money-bill-wave"></i> Salario:</strong><br>
                                ${salario}
                            </div>
                            <div class="col-md-6">
                                <strong><i class="fa-solid fa-briefcase"></i> Tipo de contrato:</strong><br>
                                ${oferta.tipo_contrato}
                            </div>
                        </div>

                        <div class="mb-3">
                            <strong><i class="fa-solid fa-file-alt"></i> Descripción:</strong>
                            <p>${oferta.descripcion}</p>
                        </div>

                        <div class="mb-3">
                            <strong><i class="fa-solid fa-list-check"></i> Requisitos:</strong>
                            <p>${oferta.requisitos || 'No especificado'}</p>
                        </div>

                        <div class="row">
                            <div class="col-md-6">
                                <strong><i class="fa-solid fa-location-dot"></i> Ubicación:</strong><br>
                                ${oferta.ubicacion || 'No especificada'}
                            </div>
                            <div class="col-md-6">
                                <strong><i class="fa-solid fa-laptop-house"></i> Modalidad:</strong><br>
                                ${oferta.modalidad}
                            </div>
                        </div>

                        <hr>

                        <div class="mb-3">
                            <strong><i class="fa-solid fa-user-tie"></i> Contacto:</strong><br>
                            ${oferta.CreadoPor?.nombre_completo || 'No disponible'} - ${oferta.CreadoPor?.cargo || ''}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>                        
                    </div>
                </div>
            </div>
        </div>
    `;

    $('#modalDetalleOferta').remove();
    $('body').append(html);
    $('#modalDetalleOferta').modal('show');
}
function generarEstrellasMostrar(puntuacion) {
    let estrellas = '';
    const puntuacionRedondeada = Math.round(puntuacion * 2) / 2;

    for (let i = 1; i <= 5; i++) {
        if (i <= puntuacionRedondeada) {
            estrellas += '<i class="fa-solid fa-star text-warning"></i>';
        } else if (i - 0.5 === puntuacionRedondeada) {
            estrellas += '<i class="fa-solid fa-star-half-stroke text-warning"></i>';
        } else {
            estrellas += '<i class="fa-regular fa-star text-warning"></i>';
        }
    }

    estrellas += ` <span class="text-muted">${puntuacion.toFixed(1)}</span>`;
    return estrellas;
}
function formatearNumero(num) {
    return new Intl.NumberFormat('es-SV').format(num);
}

function editarVacante(idVacante) {
    console.log('Editar vacante:', idVacante);
}


function confirmarEliminarVacante(idVacante) {
    Swal.fire({
        title: '¿Estás seguro de eliminar la vacante?',
        text: 'Se les notificará a los egresados que la vacante ha sido eliminada.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, Eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#8b1538'
    }).then((result) => {
        if (!result.isConfirmed) return;

        Swal.fire({
            title: '¿Deseas detallar el motivo de la eliminación?',
            html: '<p style="text-align:left;">El motivo solo se enviará al encargado de la vacante, no a los postulantes.</p>',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, detallar',
            cancelButtonText: 'No, eliminar sin detalle',
            confirmButtonColor: '#8b1538',
            cancelButtonColor: '#6b7280'
        }).then((choice) => {
            if (choice.isConfirmed) {
                Swal.fire({
                    title: 'Detalle de la eliminación',
                    html:
                        '<p style="text-align:left; margin-bottom:8px;">El motivo solo se enviará al encargado de la vacante, no a los postulantes.</p>' +
                        '<textarea id="motivoEliminacion" class="swal2-textarea" placeholder="Escribe el motivo"></textarea>',
                    showCancelButton: true,
                    confirmButtonText: 'Enviar y Eliminar',
                    cancelButtonText: 'Cancelar',
                    preConfirm: () => {
                        const motivo = Swal.getPopup().querySelector('#motivoEliminacion').value.trim();

                        if (!motivo) {
                            Swal.showValidationMessage('El motivo es obligatorio.');
                            return false;
                        }                       

                        return motivo;
                    },
                    allowOutsideClick: () => !Swal.isLoading()
                }).then((formResult) => {
                    if (formResult.isConfirmed && formResult.value) {                        
                        Swal.fire({
                            title: 'Eliminando vacante...',
                            text: 'Por favor espera',
                            allowOutsideClick: false,
                            didOpen: () => Swal.showLoading()
                        });

                        $.ajax({
                            url: '/Administracion/EliminarVacante',
                            type: 'POST',
                            data: { idVacante: idVacante, motivo: formResult.value },
                            success: function (response) {
                                Swal.close();
                                if (response.success) {
                                    Swal.fire({
                                        icon: 'success',
                                        title: 'Vacante eliminada',
                                        text: response.message || 'La vacante fue eliminada correctamente.',
                                        confirmButtonColor: '#10b981'
                                    });
                                    if (typeof cargarVacantes === 'function') cargarVacantes();
                                } else {
                                    Swal.fire({
                                        icon: 'error',
                                        title: 'Error',
                                        text: (response && response.message) ? response.message : 'No se pudo eliminar la vacante.',
                                        confirmButtonColor: '#8b1538'
                                    });
                                }
                            },
                            error: function (xhr, status, error) {
                                Swal.close();
                                console.error('Error al eliminar vacante:', error);
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Error de conexión',
                                    text: 'No se pudo conectar con el servidor. Por favor intenta de nuevo.',
                                    confirmButtonColor: '#8b1538'
                                });
                            }
                        });
                    }
                });
            } else if (choice.dismiss === Swal.DismissReason.cancel) {
                Swal.fire({
                    title: 'Eliminando vacante...',
                    text: 'Por favor espera',
                    allowOutsideClick: false,
                    didOpen: () => Swal.showLoading()
                });

                $.ajax({
                    url: '/Administracion/EliminarVacante',
                    type: 'POST',
                    data: { idVacante: idVacante },
                    success: function (response) {
                        Swal.close();
                        if (response && response.success) {
                            Swal.fire({
                                icon: 'success',
                                title: 'Vacante eliminada',
                                text: response.message || 'La vacante fue eliminada correctamente.',
                                confirmButtonColor: '#10b981'
                            });
                            if (typeof cargarVacantes === 'function') cargarVacantes();
                        } else {
                            Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: (response && response.message) ? response.message : 'No se pudo eliminar la vacante.',
                                confirmButtonColor: '#8b1538'
                            });
                        }
                    },
                    error: function (xhr, status, error) {
                        Swal.close();
                        console.error('Error al eliminar vacante:', error);
                        Swal.fire({
                            icon: 'error',
                            title: 'Error de conexión',
                            text: 'No se pudo conectar con el servidor. Por favor intenta de nuevo.',
                            confirmButtonColor: '#8b1538'
                        });
                    }
                });
            }
        });
    });
}

function verPostulantesVacante(idVacante) {
    console.log('Ver postulantes de vacante:', idVacante);
    // Implementa tu lógica aquí
}


function abrirModalEgresados() {
    if (modalEgresados) {
        const modal = $(modalEgresados);
        modal.removeClass('animate__backOutRight').addClass('animate__backInRight').show();

        if (isMaximizedEgresados) $('body').css('overflow', 'hidden');
        else $('body').css('overflow', 'auto');

        cargarEgresados();
        return;
    }

    const modal = $(`
        <div class="modal-egresados-draggable animate__animated" style="top: 50%; left: 50%;">
            <div class="modal-egresados-header-drag">
                <h6 class="mb-0">
                    <i class="fa-solid fa-user-graduate me-2"></i>Egresados Registrados <label id="TotalEgresados"></label>
                </h6>
                <div class="modal-egresados-controls">
                    <button id="minimizeModalEgresados" title="Minimizar">
                        <i class="fa-solid fa-minus"></i>
                    </button>
                    <button id="maximizeModalEgresados" title="Maximizar">
                        <i class="fa-solid fa-expand"></i>
                    </button>
                    <button id="closeModalEgresados" title="Cerrar">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            </div>
            <div class="modal-egresados-body-drag">
                <div class="filtros-egresados-panel">
                    <div class="filtros-header">
                        <h6><i class="fa-solid fa-filter me-2"></i>Filtros</h6>
                        <button id="limpiarFiltrosEgresados" class="btn-limpiar-filtros" title="Limpiar filtros">
                            <i class="fa-solid fa-eraser"></i> Limpiar
                        </button>
                    </div>
                    <div class="filtros-grid">
                        <div class="filtro-item">
                            <label><i class="fa-solid fa-user"></i> Nombre/Apellido</label>
                            <input type="text" id="filtroNombreEgresado" class="filtro-input" placeholder="Buscar por nombre...">
                        </div>
                        <div class="filtro-item">
                            <label><i class="fa-solid fa-id-card"></i> Documento</label>
                            <input type="text" id="filtroDocumento" class="filtro-input" placeholder="Buscar por documento...">
                        </div>
                        <div class="filtro-item">
                            <label><i class="fa-solid fa-envelope"></i> Email</label>
                            <input type="text" id="filtroEmailEgresado" class="filtro-input" placeholder="Buscar por email...">
                        </div>
                        <div class="filtro-item">
                            <label><i class="fa-solid fa-phone"></i> Teléfono</label>
                            <input type="text" id="filtroTelefonoEgresado" class="filtro-input" placeholder="Buscar por teléfono...">
                        </div>
                        <div class="filtro-item">
                            <label><i class="fa-solid fa-graduation-cap"></i> Carrera</label>
                            <select id="filtroCarrera" class="filtro-select">
                                <option value="">Todas las carreras</option>
                            </select>
                        </div>
                        <div class="filtro-item">
                            <label><i class="fa-solid fa-calendar"></i> Año de Graduación</label>
                            <select id="filtroAnioGraduacion" class="filtro-select">
                                <option value="">Todos los años</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="paginacion-container">
                    <div class="paginacion-info">
                        <span id="info-paginacion-egresados">Mostrando 0-0 de 0 egresados</span>
                    </div>
                    <div class="paginacion-controles">
                        <button id="btnPrimeraPaginaEgresados" class="btn-paginacion" title="Primera página">
                            <i class="fa-solid fa-angles-left"></i>
                        </button>
                        <button id="btnPaginaAnteriorEgresados" class="btn-paginacion" title="Anterior">
                            <i class="fa-solid fa-angle-left"></i>
                        </button>
                        <div class="paginacion-numeros" id="numerosPaginaEgresados"></div>
                        <button id="btnPaginaSiguienteEgresados" class="btn-paginacion" title="Siguiente">
                            <i class="fa-solid fa-angle-right"></i>
                        </button>
                        <button id="btnUltimaPaginaEgresados" class="btn-paginacion" title="Última página">
                            <i class="fa-solid fa-angles-right"></i>
                        </button>
                        <select id="selectEgresadosPorPagina" class="select-por-pagina">
                            <option value="10">10 por página</option>
                            <option value="20" selected>20 por página</option>
                            <option value="50">50 por página</option>
                            <option value="100">100 por página</option>
                        </select>
                    </div>
                </div>

                <div id="contenedor-egresados">
                    <div class="text-center py-5">
                        <i class="fa-solid fa-spinner fa-spin fa-3x text-primary"></i>
                        <p class="mt-3">Cargando egresados...</p>
                    </div>
                </div>
            </div>
        </div>
    `);

    $('body').append(modal);
    modalEgresados = modal[0];

    const winW = $(window).width();
    const winH = $(window).height();
    const modalW = modal.outerWidth();
    const modalH = modal.outerHeight();
    modal.css({
        top: (winH - modalH) / 2 + 'px',
        left: (winW - modalW) / 2 + 'px'
    });

    hacerModalEgresadosArrastrable();
    configurarControlesModalEgresados();
    configurarFiltrosEgresados();
    configurarPaginacionEgresados();
    modal.addClass('animate__backInRight');
    modal.show();
    cargarEgresados();
}

function configurarFiltrosEgresados() {
    let timeoutId;

    $('#filtroNombreEgresado, #filtroDocumento, #filtroEmailEgresado, #filtroTelefonoEgresado').on('input', function () {
        clearTimeout(timeoutId);
        const filtroId = $(this).attr('id');
        const valor = $(this).val().trim();

        timeoutId = setTimeout(() => {
            switch (filtroId) {
                case 'filtroNombreEgresado':
                    filtrosActivosEgresados.nombre = valor;
                    break;
                case 'filtroDocumento':
                    filtrosActivosEgresados.documento = valor;
                    break;
                case 'filtroEmailEgresado':
                    filtrosActivosEgresados.email = valor;
                    break;
                case 'filtroTelefonoEgresado':
                    filtrosActivosEgresados.telefono = valor;
                    break;
            }
            aplicarFiltrosEgresados();
        }, 300);
    });

    $('#filtroCarrera').on('change', function () {
        filtrosActivosEgresados.carrera = $(this).val();
        aplicarFiltrosEgresados();
    });

    $('#filtroAnioGraduacion').on('change', function () {
        filtrosActivosEgresados.anioGraduacion = $(this).val();
        aplicarFiltrosEgresados();
    });

    $('#limpiarFiltrosEgresados').on('click', function () {
        limpiarFiltrosEgresados();
    });
}

function limpiarFiltrosEgresados() {
    filtrosActivosEgresados = {
        nombre: '',
        documento: '',
        email: '',
        carrera: '',
        telefono: '',
        anioGraduacion: ''
    };

    $('#filtroNombreEgresado').val('');
    $('#filtroDocumento').val('');
    $('#filtroEmailEgresado').val('');
    $('#filtroTelefonoEgresado').val('');
    $('#filtroCarrera').val('');
    $('#filtroAnioGraduacion').val('');

    aplicarFiltrosEgresados();
}

function aplicarFiltrosEgresados() {
    egresadosFiltrados = egresadosData.filter(egresado => {
        if (filtrosActivosEgresados.nombre) {
            const nombreCompleto = `${egresado.nombres || ''} ${egresado.apellidos || ''}`.toLowerCase();
            if (!nombreCompleto.includes(filtrosActivosEgresados.nombre.toLowerCase())) {
                return false;
            }
        }

        if (filtrosActivosEgresados.documento) {
            const documento = (egresado.numero_documento || '').toLowerCase();
            if (!documento.includes(filtrosActivosEgresados.documento.toLowerCase())) {
                return false;
            }
        }

        if (filtrosActivosEgresados.email) {
            const email = (egresado.email || '').toLowerCase();
            if (!email.includes(filtrosActivosEgresados.email.toLowerCase())) {
                return false;
            }
        }

        if (filtrosActivosEgresados.telefono) {
            const telefono = (egresado.telefono || '').toLowerCase();
            if (!telefono.includes(filtrosActivosEgresados.telefono.toLowerCase())) {
                return false;
            }
        }

        if (filtrosActivosEgresados.carrera) {
            if (egresado.carrera !== filtrosActivosEgresados.carrera) {
                return false;
            }
        }

        if (filtrosActivosEgresados.anioGraduacion) {
            let anioGraduacion = '';
            if (egresado.fecha_graduacion) {
                const match = egresado.fecha_graduacion.match(/\d+/);
                if (match) {
                    const fecha = new Date(parseInt(match[0]));
                    const anio = fecha.getFullYear();
                    anioGraduacion = isNaN(anio) ? '' : anio.toString();
                }
            }

            if (anioGraduacion !== filtrosActivosEgresados.anioGraduacion) {
                return false;
            }
        }

        return true;
    });

    paginaActualEgresados = 1;
    renderizarPaginaActualEgresados();
    actualizarControlsPaginacionEgresados();
    $('#TotalEgresados').text(`(${egresadosFiltrados.length} de ${egresadosData.length})`);
}

function renderizarPaginaActualEgresados() {
    const inicio = (paginaActualEgresados - 1) * egresadosPorPaginaEgresados;
    const fin = inicio + egresadosPorPaginaEgresados;
    const egresadosPagina = egresadosFiltrados.slice(inicio, fin);

    renderizarEgresados(egresadosPagina);
}

function actualizarControlsPaginacionEgresados() {
    const totalPaginas = Math.ceil(egresadosFiltrados.length / egresadosPorPaginaEgresados);

    $('#btnPrimeraPaginaEgresados, #btnPaginaAnteriorEgresados').prop('disabled', paginaActualEgresados === 1);
    $('#btnUltimaPaginaEgresados, #btnPaginaSiguienteEgresados').prop('disabled', paginaActualEgresados === totalPaginas || totalPaginas === 0);

    const inicio = egresadosFiltrados.length > 0 ? (paginaActualEgresados - 1) * egresadosPorPaginaEgresados + 1 : 0;
    const fin = Math.min(paginaActualEgresados * egresadosPorPaginaEgresados, egresadosFiltrados.length);
    $('#info-paginacion-egresados').text(`Mostrando ${inicio}-${fin} de ${egresadosFiltrados.length} egresados`);

    generarNumerosPaginaEgresados(totalPaginas);
}

function generarNumerosPaginaEgresados(totalPaginas) {
    const contenedor = $('#numerosPaginaEgresados');
    contenedor.empty();

    if (totalPaginas === 0) return;

    let inicio = Math.max(1, paginaActualEgresados - 2);
    let fin = Math.min(totalPaginas, inicio + 4);

    if (fin - inicio < 4) {
        inicio = Math.max(1, fin - 4);
    }

    for (let i = inicio; i <= fin; i++) {
        const btn = $(`
            <button class="btn-numero-pagina ${i === paginaActualEgresados ? 'activo' : ''}" data-pagina="${i}">
                ${i}
            </button>
        `);
        contenedor.append(btn);
    }
}

function configurarPaginacionEgresados() {
    $('#btnPrimeraPaginaEgresados').on('click', () => {
        paginaActualEgresados = 1;
        renderizarPaginaActualEgresados();
        actualizarControlsPaginacionEgresados();
    });

    $('#btnPaginaAnteriorEgresados').on('click', () => {
        if (paginaActualEgresados > 1) {
            paginaActualEgresados--;
            renderizarPaginaActualEgresados();
            actualizarControlsPaginacionEgresados();
        }
    });

    $('#btnPaginaSiguienteEgresados').on('click', () => {
        const totalPaginas = Math.ceil(egresadosFiltrados.length / egresadosPorPaginaEgresados);
        if (paginaActualEgresados < totalPaginas) {
            paginaActualEgresados++;
            renderizarPaginaActualEgresados();
            actualizarControlsPaginacionEgresados();
        }
    });

    $('#btnUltimaPaginaEgresados').on('click', () => {
        const totalPaginas = Math.ceil(egresadosFiltrados.length / egresadosPorPaginaEgresados);
        paginaActualEgresados = totalPaginas;
        renderizarPaginaActualEgresados();
        actualizarControlsPaginacionEgresados();
    });

    $(document).on('click', '#numerosPaginaEgresados .btn-numero-pagina', function () {
        paginaActualEgresados = parseInt($(this).data('pagina'));
        renderizarPaginaActualEgresados();
        actualizarControlsPaginacionEgresados();
    });

    $('#selectEgresadosPorPagina').on('change', function () {
        egresadosPorPaginaEgresados = parseInt($(this).val());
        paginaActualEgresados = 1;
        renderizarPaginaActualEgresados();
        actualizarControlsPaginacionEgresados();
    });
}

function cargarEgresados() {
    $('#contenedor-egresados').html(`
        <div class="text-center py-5">
            <i class="fa-solid fa-spinner fa-spin fa-3x text-primary"></i>
            <p class="mt-3">Cargando egresados...</p>
        </div>
    `);

    $.ajax({
        url: '/Administracion/ObtenerEgresados',
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            if (response.success) {
                if (response.data === null || response.data.length === 0) {
                    egresadosData = [];
                    egresadosFiltrados = [];
                    renderizarEgresados([]);
                    $('#TotalEgresados').text('(0)');
                    $('#info-paginacion-egresados').text('Mostrando 0-0 de 0 egresados');
                    return;
                }

                egresadosData = response.data;
                popularFiltrosSelectEgresados();
                aplicarFiltrosEgresados();
            } else {
                mostrarMensajeEgresados('warning', response.message || 'No se pudieron cargar los egresados');
            }
        },
        error: function (xhr, status, error) {
            console.error('Error al cargar egresados:', error);
            mostrarMensajeEgresados('danger', 'Error al cargar los egresados. Por favor, intente nuevamente.');
        }
    });
}

function popularFiltrosSelectEgresados() {
    const carreras = [...new Set(egresadosData
        .map(e => e.carrera)
        .filter(c => c && c !== 'No especificado')
    )].sort();

    const anios = [...new Set(egresadosData
        .map(e => {
            if (!e.fecha_graduacion) return null;

            const match = e.fecha_graduacion.match(/\d+/);
            if (!match) return null;

            const fecha = new Date(parseInt(match[0]));
            const anio = fecha.getFullYear();

            return isNaN(anio) ? null : anio;
        })
        .filter(a => a !== null)
    )].sort((a, b) => b - a);

    const selectCarrera = $('#filtroCarrera');
    selectCarrera.html('<option value="">Todas las carreras</option>');
    carreras.forEach(carrera => {
        selectCarrera.append(`<option value="${carrera}">${carrera}</option>`);
    });

    const selectAnio = $('#filtroAnioGraduacion');
    selectAnio.html('<option value="">Todos los años</option>');
    anios.forEach(anio => {
        selectAnio.append(`<option value="${anio}">${anio}</option>`);
    });
}

function hacerModalEgresadosArrastrable() {
    const modal = $(modalEgresados);
    const header = modal.find('.modal-egresados-header-drag');
    let startX, startY, startLeft, startTop;

    header.on('mousedown', function (e) {
        if (isMaximizedEgresados || isMinimizedEgresados || $(e.target).closest('.modal-egresados-controls').length) return;

        isDraggingEgresados = true;
        startX = e.clientX;
        startY = e.clientY;
        startLeft = parseInt(modal.css('left'), 10);
        startTop = parseInt(modal.css('top'), 10);

        $(document).on('mousemove.modalEgresadosDrag', function (e) {
            if (isDraggingEgresados) {
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;

                let newLeft = startLeft + dx;
                let newTop = startTop + dy;

                const modalWidth = modal.outerWidth();
                const modalHeight = modal.outerHeight();
                const windowWidth = $(window).width();
                const windowHeight = $(window).height();

                const minVisible = 50;
                const maxLeft = windowWidth - minVisible;
                const maxTop = windowHeight - minVisible;
                const minLeft = -(modalWidth - minVisible);
                const minTop = 0;

                newLeft = Math.max(minLeft, Math.min(newLeft, maxLeft));
                newTop = Math.max(minTop, Math.min(newTop, maxTop));

                modal.css({
                    left: newLeft + 'px',
                    top: newTop + 'px'
                });
            }
        });

        $(document).on('mouseup.modalEgresadosDrag', function () {
            isDraggingEgresados = false;
            $(document).off('mousemove.modalEgresadosDrag mouseup.modalEgresadosDrag');
        });
    });
}

function configurarControlesModalEgresados() {
    $('#minimizeModalEgresados').on('click', function () {
        const modal = $(modalEgresados);
        modal.removeClass('animate__bounceIn animate__zoomIn animate__backInRight')
            .addClass('animate__backOutRight');
        if (!isMinimizedEgresados) {
            modal.one('animationend', function () {
                modal.hide();
                crearIconoFlotanteEgresados();
                isMinimizedEgresados = true;
                $('body').css('overflow', 'auto');
            });
        } else {
            restaurarDesdeIconoEgresados();
        }
    });

    $('#maximizeModalEgresados').on('click', function () {
        const modal = $(modalEgresados);
        const btn = $(this).find('i');
        modal.removeClass('animate__backOutRight animate__backInRight');

        if (!isMaximizedEgresados) {
            modal.removeClass('animate__bounceIn').addClass('animate__zoomIn');
            originalStateEgresados = {
                width: modal.width(),
                height: modal.height(),
                top: modal.css('top'),
                left: modal.css('left')
            };

            modal.addClass('maximized-egresados');
            $('body').css('overflow', 'hidden');
            btn.removeClass('fa-expand').addClass('fa-compress');
            isMaximizedEgresados = true;
        } else {
            modal.removeClass('animate__zoomIn').addClass('animate__bounceIn');
            modal.removeClass('maximized-egresados');
            modal.css({
                width: originalStateEgresados.width,
                height: originalStateEgresados.height,
                top: originalStateEgresados.top,
                left: originalStateEgresados.left,
                right: 'auto',
                bottom: 'auto'
            });
            $('body').css('overflow', 'auto');
            btn.removeClass('fa-compress').addClass('fa-expand');
            isMaximizedEgresados = false;
        }
    });

    $('#closeModalEgresados').on('click', function () {
        const modal = $(modalEgresados);
        modal.removeClass('animate__bounceIn animate__zoomIn animate__backInRight')
            .addClass('animate__backOutRight');
        modal.one('animationend', function () {
            modal.hide();
            eliminarIconoFlotanteEgresados();
            $('body').css('overflow', 'auto');
            isMaximizedEgresados = false;
            isMinimizedEgresados = false;
        });
    });
}

function crearIconoFlotanteEgresados() {
    eliminarIconoFlotanteEgresados();
    floatingIconEgresados = $(`
        <div class="floating-icon-egresados" title="Restaurar ventana de egresados">
            <i class="fa-solid fa-user-graduate"></i>
        </div>
    `);
    $('body').append(floatingIconEgresados);
    floatingIconEgresados.on('click', restaurarDesdeIconoEgresados);
}

function eliminarIconoFlotanteEgresados() {
    if (floatingIconEgresados) {
        floatingIconEgresados.remove();
        floatingIconEgresados = null;
    }
}

function restaurarDesdeIconoEgresados() {
    const modal = $(modalEgresados);
    modal.removeClass('animate__backOutRight').addClass('animate__backInRight').show();

    if (isMaximizedEgresados) {
        modal.addClass('maximized-egresados');
        $('#maximizeModalEgresados i').removeClass('fa-expand').addClass('fa-compress');
        $('body').css('overflow', 'hidden');
    } else {
        modal.removeClass('maximized-egresados');
        if (originalStateEgresados.width) {
            modal.css({
                width: originalStateEgresados.width,
                height: originalStateEgresados.height,
                top: originalStateEgresados.top,
                left: originalStateEgresados.left,
                right: 'auto',
                bottom: 'auto'
            });
        }
        $('#maximizeModalEgresados i').removeClass('fa-compress').addClass('fa-expand');
        $('body').css('overflow', 'auto');
    }

    eliminarIconoFlotanteEgresados();
    isMinimizedEgresados = false;
}

function renderizarEgresados(egresados) {
    const contenedor = $('#contenedor-egresados');

    if (!egresados || egresados.length === 0) {
        contenedor.html(`
            <div class="alert alert-info text-center">
                <i class="fa-solid fa-info-circle fa-2x mb-3"></i>
                <p class="mb-0">No se encontraron egresados con los filtros aplicados</p>
            </div>
        `);
        return;
    }

    let html = '<div class="egresados-grid">';

    egresados.forEach(egresado => {
        const nombreCompleto = `${egresado.nombres || ''} ${egresado.apellidos || ''}`;
        const puntuacion = egresado.puntuacion_global ? egresado.puntuacion_global.toFixed(1) : '0.0';
        const estrellas = generarEstrellasEgresado(egresado.puntuacion_global || 0);
        const promedio = egresado.promedio_academico ? egresado.promedio_academico.toFixed(2) : 'N/A';
        const fechaGraduacion = formatearFecha(egresado.fecha_graduacion);
        const fechaRegistro = formatearFecha(egresado.fecha_registro);

        html += `
            <div class="egresado-card">
                <div class="egresado-card-header">
                    <div class="egresado-info-principal">
                        <h5 class="egresado-nombre">${nombreCompleto}</h5>
                        <div class="egresado-meta">
                            <span class="egresado-documento">
                                <i class="fa-solid fa-id-card me-1"></i>${egresado.numero_documento || 'N/A'}
                            </span>
                            <span class="badge-carrera">
                                <i class="fa-solid fa-graduation-cap me-1"></i>${egresado.carrera || 'No especificada'}
                            </span>
                        </div>
                    </div>
                    <div class="egresado-rating">
                        <div class="estrellas">${estrellas}</div>
                        <span class="puntuacion-numero">${puntuacion}</span>
                    </div>
                </div>
                
                <div class="egresado-card-body">
                    <div class="egresado-detalle">
                        <i class="fa-solid fa-envelope text-primary"></i>
                        <span>${egresado.email || 'No especificado'}</span>
                    </div>
                    <div class="egresado-detalle">
                        <i class="fa-solid fa-phone text-success"></i>
                        <span>${egresado.telefono || 'No especificado'}</span>
                    </div>
                    <div class="egresado-detalle">
                        <i class="fa-solid fa-calendar-check text-info"></i>
                        <span>Graduado: ${fechaGraduacion}</span>
                    </div>
                    <div class="egresado-caracteristicas">
                        <span class="caracteristica promedio">
                            <i class="fa-solid fa-chart-line"></i>
                            Promedio: ${promedio}
                        </span>
                        <span class="caracteristica fecha-registro">
                            <i class="fa-solid fa-clock"></i>
                            Registro: ${fechaRegistro}
                        </span>
                    </div>
                </div>
                
                <div class="egresado-acciones">
                    <button class="btn-accion btn-ver-perfil" onclick="cargarPerfil('${egresado.id_egresado}')" title="Ver perfil completo">
                        <i class="fa-solid fa-eye"></i>
                    </button>                    
                    <button class="btn-accion btn-eliminar" onclick="confirmarEliminarEgresado('${egresado.id_egresado}')" title="Eliminar">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });

    html += '</div>';
    contenedor.html(html);
}

function generarEstrellasEgresado(puntuacion) {
    let html = '';
    const puntuacionRedondeada = Math.round(puntuacion * 2) / 2;

    for (let i = 1; i <= 5; i++) {
        if (i <= puntuacionRedondeada) {
            html += '<i class="fa-solid fa-star estrella-llena"></i>';
        } else if (i - 0.5 === puntuacionRedondeada) {
            html += '<i class="fa-solid fa-star-half-stroke estrella-media"></i>';
        } else {
            html += '<i class="fa-regular fa-star estrella-vacia"></i>';
        }
    }

    return html;
}

function mostrarMensajeEgresados(tipo, mensaje) {
    const contenedor = $('#contenedor-egresados');
    const iconos = {
        success: 'fa-check-circle',
        danger: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };

    contenedor.html(`
        <div class="alert alert-${tipo} text-center">
            <i class="fa-solid ${iconos[tipo]} fa-2x mb-3"></i>
            <p class="mb-0">${mensaje}</p>
        </div>
    `);
}

function confirmarEliminarEgresado(idEgresado) {
    swal.fire({
        title: 'Estas seguro de elimar el perfil??',
        text: 'Esta accion no se podra deshacer!',
        icon: 'question',
        showCancelButton: true,
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Si, Eliminar',
        confirmButtonColor: '#8b1538'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: '/Administracion/EliminarEgresado',
                type: 'POST',
                data: { idEgresado: idEgresado },
                success: function (response) {
                    if (response.success) {
                        swal.fire({
                            title: 'Eliminacion Completa',
                            text: response.message,
                            icon: 'success'
                        }).then(() => {
                            cargarEgresados();
                        })
                    } else {
                        swal.fire({
                            title: 'Oops Ocurrio un error',
                            text: response.message,
                            icon: 'error'
                        });
                    }
                },
                error: function (error) {
                    swal.fire('Error', 'No se pudo eliminar el egresado.', error);
                }
            });
        }

    })
}


function abrirModalEmpresas() {
    if (modalEmpresas) {
        const modal = $(modalEmpresas);
        modal.removeClass('animate__backOutRight').addClass('animate__backInRight').show();

        if (isMaximizedEmpresas) $('body').css('overflow', 'hidden');
        else $('body').css('overflow', 'auto');

        cargarEmpresas();
        return;
    }

    const modal = $(`
        <div class="modal-empresas-draggable animate__animated" style="top: 50%; left: 50%;">
            <div class="modal-empresas-header-drag">
                <h6 class="mb-0">
                    <i class="fa-solid fa-building me-2"></i>Empresas Registradas <label id="TotalEmpresas"></label>
                </h6>
                <div class="modal-empresas-controls">
                    <button id="minimizeModalEmpresas" title="Minimizar">
                        <i class="fa-solid fa-minus"></i>
                    </button>
                    <button id="maximizeModalEmpresas" title="Maximizar">
                        <i class="fa-solid fa-expand"></i>
                    </button>
                    <button id="closeModalEmpresas" title="Cerrar">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            </div>
            <div class="modal-empresas-body-drag">
                <div class="filtros-empresas-panel">
                    <div class="filtros-header">
                        <h6><i class="fa-solid fa-filter me-2"></i>Filtros</h6>
                        <button id="limpiarFiltros" class="btn-limpiar-filtros" title="Limpiar filtros">
                            <i class="fa-solid fa-eraser"></i> Limpiar
                        </button>
                    </div>
                    <div class="filtros-grid">
                        <div class="filtro-item">
                            <label><i class="fa-solid fa-building"></i> Nombre/Razón Social</label>
                            <input type="text" id="filtroNombre" class="filtro-input" placeholder="Buscar por nombre...">
                        </div>
                        <div class="filtro-item">
                            <label><i class="fa-solid fa-id-card"></i> NIT</label>
                            <input type="text" id="filtroNit" class="filtro-input" placeholder="Buscar por NIT...">
                        </div>
                        <div class="filtro-item">
                            <label><i class="fa-solid fa-map-marker-alt"></i> Ubicación</label>
                            <input type="text" id="filtroUbicacion" class="filtro-input" placeholder="Buscar por dirección...">
                        </div>
                        <div class="filtro-item">
                            <label><i class="fa-solid fa-user-tie"></i> Usuario Asignado</label>
                            <input type="text" id="filtroUsuario" class="filtro-input" placeholder="Buscar por usuario...">
                        </div>
                        <div class="filtro-item">
                            <label><i class="fa-solid fa-industry"></i> Sector Económico</label>
                            <select id="filtroSector" class="filtro-select">
                                <option value="">Todos los sectores</option>
                            </select>
                        </div>
                        <div class="filtro-item">
                            <label><i class="fa-solid fa-building"></i> Tamaño Empresa</label>
                            <select id="filtroTamano" class="filtro-select">
                                <option value="">Todos los tamaños</option>
                            </select>
                        </div>
                        <div class="filtro-item">
                            <label><i class="fa-solid fa-graduation-cap"></i> Vinculación Universidad</label>
                            <select id="filtroVinculada" class="filtro-select">
                                <option value="todas">Todas</option>
                                <option value="vinculadas">Solo vinculadas</option>
                                <option value="no-vinculadas">No vinculadas</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="paginacion-container">
                    <div class="paginacion-info">
                        <span id="info-paginacion">Mostrando 0-0 de 0 empresas</span>
                    </div>
                    <div class="paginacion-controles">
                        <button id="btnPrimeraPagina" class="btn-paginacion" title="Primera página">
                            <i class="fa-solid fa-angles-left"></i>
                        </button>
                        <button id="btnPaginaAnterior" class="btn-paginacion" title="Anterior">
                            <i class="fa-solid fa-angle-left"></i>
                        </button>
                        <div class="paginacion-numeros" id="numerosPagina"></div>
                        <button id="btnPaginaSiguiente" class="btn-paginacion" title="Siguiente">
                            <i class="fa-solid fa-angle-right"></i>
                        </button>
                        <button id="btnUltimaPagina" class="btn-paginacion" title="Última página">
                            <i class="fa-solid fa-angles-right"></i>
                        </button>
                        <select id="selectEmpresasPorPagina" class="select-por-pagina">
                            <option value="10">10 por página</option>
                            <option value="20" selected>20 por página</option>
                            <option value="50">50 por página</option>
                            <option value="100">100 por página</option>
                        </select>
                    </div>
                </div>

                <div id="contenedor-empresas">
                    <div class="text-center py-5">
                        <i class="fa-solid fa-spinner fa-spin fa-3x text-primary"></i>
                        <p class="mt-3">Cargando empresas...</p>
                    </div>
                </div>
            </div>
        </div>
    `);

    $('body').append(modal);
    modalEmpresas = modal[0];

    const winW = $(window).width();
    const winH = $(window).height();
    const modalW = modal.outerWidth();
    const modalH = modal.outerHeight();
    modal.css({
        top: (winH - modalH) / 2 + 'px',
        left: (winW - modalW) / 2 + 'px'
    });

    hacerModalEmpresasArrastrable();
    configurarControlesModalEmpresas();
    configurarFiltrosEmpresas();
    configurarPaginacion();
    modal.addClass('animate__backInRight');
    modal.show();
    cargarEmpresas();
}

function configurarFiltrosEmpresas() {
    let timeoutId;

    $('#filtroNombre, #filtroNit, #filtroUbicacion, #filtroUsuario').on('input', function () {
        clearTimeout(timeoutId);
        const filtroId = $(this).attr('id');
        const valor = $(this).val().trim();

        timeoutId = setTimeout(() => {
            switch (filtroId) {
                case 'filtroNombre':
                    filtrosActivos.nombre = valor;
                    break;
                case 'filtroNit':
                    filtrosActivos.nit = valor;
                    break;
                case 'filtroUbicacion':
                    filtrosActivos.ubicacion = valor;
                    break;
                case 'filtroUsuario':
                    filtrosActivos.usuario = valor;
                    break;
            }
            aplicarFiltros();
        }, 300);
    });

    $('#filtroSector').on('change', function () {
        filtrosActivos.sector = $(this).val();
        aplicarFiltros();
    });

    $('#filtroTamano').on('change', function () {
        filtrosActivos.tamano = $(this).val();
        aplicarFiltros();
    });

    $('#filtroVinculada').on('change', function () {
        filtrosActivos.vinculada = $(this).val();
        aplicarFiltros();
    });

    $('#limpiarFiltros').on('click', function () {
        limpiarFiltros();
    });
}

function limpiarFiltros() {
    filtrosActivos = {
        nombre: '',
        ubicacion: '',
        usuario: '',
        sector: '',
        tamano: '',
        vinculada: 'todas',
        nit: ''
    };

    $('#filtroNombre').val('');
    $('#filtroNit').val('');
    $('#filtroUbicacion').val('');
    $('#filtroUsuario').val('');
    $('#filtroSector').val('');
    $('#filtroTamano').val('');
    $('#filtroVinculada').val('todas');

    aplicarFiltros();
}

function aplicarFiltros() {
    empresasFiltradas = empresasData.filter(empresa => {
        if (filtrosActivos.nombre) {
            const nombre = (empresa.razon_social || '').toLowerCase();
            if (!nombre.includes(filtrosActivos.nombre.toLowerCase())) {
                return false;
            }
        }

        if (filtrosActivos.nit) {
            const nit = (empresa.nit || '').toLowerCase();
            if (!nit.includes(filtrosActivos.nit.toLowerCase())) {
                return false;
            }
        }

        if (filtrosActivos.ubicacion) {
            const direccion = (empresa.direccion || '').toLowerCase();
            if (!direccion.includes(filtrosActivos.ubicacion.toLowerCase())) {
                return false;
            }
        }

        if (filtrosActivos.usuario) {
            const nombreUsuario = (empresa.UsuarioEmpresa?.nombre_completo || '').toLowerCase();
            const cargoUsuario = (empresa.UsuarioEmpresa?.cargo || '').toLowerCase();
            const busqueda = filtrosActivos.usuario.toLowerCase();
            if (!nombreUsuario.includes(busqueda) && !cargoUsuario.includes(busqueda)) {
                return false;
            }
        }

        if (filtrosActivos.sector) {
            if (empresa.sector_economico !== filtrosActivos.sector) {
                return false;
            }
        }

        if (filtrosActivos.tamano) {
            if (empresa.tamano_empresa !== filtrosActivos.tamano) {
                return false;
            }
        }

        if (filtrosActivos.vinculada !== 'todas') {
            const esVinculada = empresa.vinculada_universidad === true || empresa.vinculada_universidad === 1;
            if (filtrosActivos.vinculada === 'vinculadas' && !esVinculada) {
                return false;
            }
            if (filtrosActivos.vinculada === 'no-vinculadas' && esVinculada) {
                return false;
            }
        }

        return true;
    });

    paginaActualEmpresas = 1;

    renderizarPaginaActual();

    actualizarControlsPaginacion();

    $('#TotalEmpresas').text(`(${empresasFiltradas.length} de ${empresasData.length})`);
}
function renderizarPaginaActual() {
    const inicio = (paginaActualEmpresas - 1) * empresasPorPaginaEmpresas;
    const fin = inicio + empresasPorPaginaEmpresas;
    const empresasPagina = empresasFiltradas.slice(inicio, fin);

    renderizarEmpresas(empresasPagina);
}
function actualizarControlsPaginacion() {
    const totalPaginas = Math.ceil(empresasFiltradas.length / empresasPorPaginaEmpresas);

    $('#btnPrimeraPagina, #btnPaginaAnterior').prop('disabled', paginaActualEmpresas === 1);
    $('#btnUltimaPagina, #btnPaginaSiguiente').prop('disabled', paginaActualEmpresas === totalPaginas || totalPaginas === 0);

    const inicio = empresasFiltradas.length > 0 ? (paginaActualEmpresas - 1) * empresasPorPaginaEmpresas + 1 : 0;
    const fin = Math.min(paginaActualEmpresas * empresasPorPaginaEmpresas, empresasFiltradas.length);
    $('#info-paginacion').text(`Mostrando ${inicio}-${fin} de ${empresasFiltradas.length} empresas`);

    generarNumerosPagina(totalPaginas);
}

function generarNumerosPagina(totalPaginas) {
    const contenedor = $('#numerosPagina');
    contenedor.empty();

    if (totalPaginas === 0) return;

    let inicio = Math.max(1, paginaActualEmpresas - 2);
    let fin = Math.min(totalPaginas, inicio + 4);

    if (fin - inicio < 4) {
        inicio = Math.max(1, fin - 4);
    }

    for (let i = inicio; i <= fin; i++) {
        const btn = $(`
            <button class="btn-numero-pagina ${i === paginaActualEmpresas ? 'activo' : ''}" data-pagina="${i}">
                ${i}
            </button>
        `);
        contenedor.append(btn);
    }
}
function configurarPaginacion() {
    $('#btnPrimeraPagina').on('click', () => {
        paginaActualEmpresas = 1;
        renderizarPaginaActual();
        actualizarControlsPaginacion();
    });

    $('#btnPaginaAnterior').on('click', () => {
        if (paginaActualEmpresas > 1) {
            paginaActualEmpresas--;
            renderizarPaginaActual();
            actualizarControlsPaginacion();
        }
    });

    $('#btnPaginaSiguiente').on('click', () => {
        const totalPaginas = Math.ceil(empresasFiltradas.length / empresasPorPaginaEmpresas);
        if (paginaActualEmpresas < totalPaginas) {
            paginaActualEmpresas++;
            renderizarPaginaActual();
            actualizarControlsPaginacion();
        }
    });

    $('#btnUltimaPagina').on('click', () => {
        const totalPaginas = Math.ceil(empresasFiltradas.length / empresasPorPaginaEmpresas);
        paginaActualEmpresas = totalPaginas;
        renderizarPaginaActual();
        actualizarControlsPaginacion();
    });

    $(document).on('click', '.btn-numero-pagina', function () {
        paginaActualEmpresas = parseInt($(this).data('pagina'));
        renderizarPaginaActual();
        actualizarControlsPaginacion();
    });

    $('#selectEmpresasPorPagina').on('change', function () {
        empresasPorPaginaEmpresas = parseInt($(this).val());
        paginaActualEmpresas = 1; 
        renderizarPaginaActual();
        actualizarControlsPaginacion();
    });
}
function cargarEmpresas() {
    $('#contenedor-empresas').html(`
        <div class="text-center py-5">
            <i class="fa-solid fa-spinner fa-spin fa-3x text-primary"></i>
            <p class="mt-3">Cargando empresas...</p>
        </div>
    `);

    $.ajax({
        url: '/Administracion/ObtenerEmpresas',
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            if (response.success) {
                if (response.data === null || response.data.length === 0) {
                    empresasData = [];
                    empresasFiltradas = [];
                    renderizarEmpresas([]);
                    $('#TotalEmpresas').text('(0)');
                    $('#info-paginacion').text('Mostrando 0-0 de 0 empresas');
                    return;
                }

                empresasData = response.data;
                popularFiltrosSelect();
                aplicarFiltros(); 
            } else {
                mostrarMensajeEmpresas('warning', response.message || 'No se pudieron cargar las empresas');
            }
        },
        error: function (xhr, status, error) {
            console.error('Error al cargar empresas:', error);
            mostrarMensajeEmpresas('danger', 'Error al cargar las empresas. Por favor, intente nuevamente.');
        }
    });
}

function popularFiltrosSelect() {
    const sectores = [...new Set(empresasData
        .map(e => e.sector_economico)
        .filter(s => s && s !== 'No especificado')
    )].sort();

    const tamanos = [...new Set(empresasData
        .map(e => e.tamano_empresa)
        .filter(t => t && t !== 'No especificado')
    )].sort();

    const selectSector = $('#filtroSector');
    selectSector.html('<option value="">Todos los sectores</option>');
    sectores.forEach(sector => {
        selectSector.append(`<option value="${sector}">${sector}</option>`);
    });

    const selectTamano = $('#filtroTamano');
    selectTamano.html('<option value="">Todos los tamaños</option>');
    tamanos.forEach(tamano => {
        selectTamano.append(`<option value="${tamano}">${tamano}</option>`);
    });
}

function hacerModalEmpresasArrastrable() {
    const modal = $(modalEmpresas);
    const header = modal.find('.modal-empresas-header-drag');
    let startX, startY, startLeft, startTop;

    header.on('mousedown', function (e) {
        if (isMaximizedEmpresas || isMinimizedEmpresas || $(e.target).closest('.modal-empresas-controls').length) return;

        isDraggingEmpresas = true;
        startX = e.clientX;
        startY = e.clientY;
        startLeft = parseInt(modal.css('left'), 10);
        startTop = parseInt(modal.css('top'), 10);

        $(document).on('mousemove.modalEmpresasDrag', function (e) {
            if (isDraggingEmpresas) {
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;

                let newLeft = startLeft + dx;
                let newTop = startTop + dy;

                const modalWidth = modal.outerWidth();
                const modalHeight = modal.outerHeight();
                const windowWidth = $(window).width();
                const windowHeight = $(window).height();

                const minVisible = 50;
                const maxLeft = windowWidth - minVisible;
                const maxTop = windowHeight - minVisible;
                const minLeft = -(modalWidth - minVisible);
                const minTop = 0;

                newLeft = Math.max(minLeft, Math.min(newLeft, maxLeft));
                newTop = Math.max(minTop, Math.min(newTop, maxTop));

                modal.css({
                    left: newLeft + 'px',
                    top: newTop + 'px'
                });
            }
        });

        $(document).on('mouseup.modalEmpresasDrag', function () {
            isDraggingEmpresas = false;
            $(document).off('mousemove.modalEmpresasDrag mouseup.modalEmpresasDrag');
        });
    });
}
function configurarControlesModalEmpresas() {
    $('#minimizeModalEmpresas').on('click', function () {
        const modal = $(modalEmpresas);
        modal.removeClass('animate__bounceIn animate__zoomIn animate__backInRight')
            .addClass('animate__backOutRight');
        if (!isMinimizedEmpresas) {
            modal.one('animationend', function () {
                modal.hide();
                crearIconoFlotanteEmpresas();
                isMinimizedEmpresas = true;
                $('body').css('overflow', 'auto');
            });
        } else {
            restaurarDesdeIconoEmpresas();
        }
    });

    $('#maximizeModalEmpresas').on('click', function () {
        const modal = $(modalEmpresas);
        const btn = $(this).find('i');
        modal.removeClass('animate__backOutRight animate__backInRight');

        if (!isMaximizedEmpresas) {
            modal.removeClass('animate__bounceIn').addClass('animate__zoomIn');
            originalStateEmpresas = {
                width: modal.width(),
                height: modal.height(),
                top: modal.css('top'),
                left: modal.css('left')
            };

            modal.addClass('maximized-empresas');
            $('body').css('overflow', 'hidden');
            btn.removeClass('fa-expand').addClass('fa-compress');
            isMaximizedEmpresas = true;
        } else {
            modal.removeClass('animate__zoomIn').addClass('animate__bounceIn');
            modal.removeClass('maximized-empresas');
            modal.css({
                width: originalStateEmpresas.width,
                height: originalStateEmpresas.height,
                top: originalStateEmpresas.top,
                left: originalStateEmpresas.left,
                right: 'auto',
                bottom: 'auto'
            });
            $('body').css('overflow', 'auto');
            btn.removeClass('fa-compress').addClass('fa-expand');
            isMaximizedEmpresas = false;
        }
    });

    $('#closeModalEmpresas').on('click', function () {
        const modal = $(modalEmpresas);
        modal.removeClass('animate__bounceIn animate__zoomIn animate__backInRight')
            .addClass('animate__backOutRight');
        modal.one('animationend', function () {
            modal.hide();
            eliminarIconoFlotanteEmpresas();
            $('body').css('overflow', 'auto');
            isMaximizedEmpresas = false;
            isMinimizedEmpresas = false;
        });
    });
}

function crearIconoFlotanteEmpresas() {
    eliminarIconoFlotanteEmpresas();
    floatingIconEmpresas = $(`
        <div class="floating-icon-empresas" title="Restaurar ventana de empresas">
            <i class="fa-solid fa-building"></i>
        </div>
    `);
    $('body').append(floatingIconEmpresas);
    floatingIconEmpresas.on('click', restaurarDesdeIconoEmpresas);
}

function eliminarIconoFlotanteEmpresas() {
    if (floatingIconEmpresas) {
        floatingIconEmpresas.remove();
        floatingIconEmpresas = null;
    }
}

function restaurarDesdeIconoEmpresas() {
    const modal = $(modalEmpresas);
    modal.removeClass('animate__backOutRight').addClass('animate__backInRight').show();

    if (isMaximizedEmpresas) {
        modal.addClass('maximized-empresas');
        $('#maximizeModalEmpresas i').removeClass('fa-expand').addClass('fa-compress');
        $('body').css('overflow', 'hidden');
    } else {
        modal.removeClass('maximized-empresas');
        if (originalStateEmpresas.width) {
            modal.css({
                width: originalStateEmpresas.width,
                height: originalStateEmpresas.height,
                top: originalStateEmpresas.top,
                left: originalStateEmpresas.left,
                right: 'auto',
                bottom: 'auto'
            });
        }
        $('#maximizeModalEmpresas i').removeClass('fa-compress').addClass('fa-expand');
        $('body').css('overflow', 'auto');
    }

    eliminarIconoFlotanteEmpresas();
    isMinimizedEmpresas = false;
}

function renderizarEmpresas(empresas) {
    const contenedor = $('#contenedor-empresas');

    if (!empresas || empresas.length === 0) {
        contenedor.html(`
            <div class="alert alert-info text-center">
                <i class="fa-solid fa-info-circle fa-2x mb-3"></i>
                <p class="mb-0">No se encontraron empresas con los filtros aplicados</p>
            </div>
        `);
        return;
    }

    let html = '<div class="empresas-grid">';

    empresas.forEach(empresa => {
        const puntuacion = empresa.Puntuacion ? empresa.Puntuacion.toFixed(1) : '0.0';
        const estrellas = generarEstrellas(empresa.Puntuacion || 0);
        const totalComentarios = empresa.comentarios ? empresa.comentarios.filter(c => c).length : 0;
        const vinculada = empresa.vinculada_universidad ?
            '<span class="badge-vinculada"><i class="fa-solid fa-graduation-cap me-1"></i>Vinculada</span>' : '';

        html += `
            <div class="empresa-card" data-id="${empresa.id_empresa}">
                <div class="empresa-card-header">
                    <div class="empresa-info-principal">
                        <h5 class="empresa-nombre">${empresa.razon_social || 'Sin nombre'}</h5>
                        <div class="empresa-meta">
                            <span class="empresa-nit"><i class="fa-solid fa-id-card me-1"></i>${empresa.nit || 'N/A'}</span>
                            ${vinculada}
                        </div>
                    </div>
                    <div class="empresa-rating">
                        <div class="estrellas">${estrellas}</div>
                        <span class="puntuacion-numero">${puntuacion}</span>
                    </div>
                </div>
                
                <div class="empresa-card-body">
                    <div class="empresa-detalle">
                        <i class="fa-solid fa-envelope text-primary"></i>
                        <span>${empresa.email_contacto || 'No especificado'}</span>
                    </div>
                    <div class="empresa-detalle">
                        <i class="fa-solid fa-phone text-success"></i>
                        <span>${empresa.telefono || 'No especificado'}</span>
                    </div>
                    <div class="empresa-detalle">
                        <i class="fa-solid fa-map-marker-alt text-danger"></i>
                        <span>${empresa.direccion || 'No especificada'}</span>
                    </div>
                    <div class="empresa-caracteristicas">
                        <span class="caracteristica sector">
                            <i class="fa-solid fa-industry"></i>
                            ${empresa.sector_economico || 'No especificado'}
                        </span>
                        <span class="caracteristica tamano">
                            <i class="fa-solid fa-building"></i>
                            ${empresa.tamano_empresa || 'No especificado'}
                        </span>
                    </div>
                </div>
                
                ${empresa.UsuarioEmpresa ? `
                <div class="empresa-card-footer">
                    <div class="usuario-empresa-info">
                        <i class="fa-solid fa-user-tie me-2"></i>
                        <div class="usuario-detalles">
                            <small>Usuario Asignado</small>
                            <strong>${empresa.UsuarioEmpresa.nombre_completo || 'No asignado'}</strong>
                            <small>${empresa.UsuarioEmpresa.cargo || 'Sin cargo'} - ${empresa.UsuarioEmpresa.rol || ''}</small>
                        </div>
                    </div>
                </div>
                ` : ''}
                
                <div class="empresa-acciones">
                    <button class="btn-accion btn-ver-comentarios" onclick="verComentariosEmpresa(${empresa.id_empresa})" title="Ver comentarios (${totalComentarios})">
                        <i class="fa-solid fa-comments"></i>
                        <span>${totalComentarios}</span>
                    </button>
                    <button class="btn-accion btn-editar" onclick="editarEmpresa(${empresa.id_empresa})" title="Editar">
                        <i class="fa-solid fa-edit"></i>
                    </button>
                    <button class="btn-accion btn-eliminar" onclick="confirmarEliminarEmpresa(${empresa.id_empresa})" title="Eliminar">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });

    html += '</div>';
    contenedor.html(html);
}

function generarEstrellas(puntuacion) {
    let html = '';
    const puntuacionRedondeada = Math.round(puntuacion * 2) / 2;

    for (let i = 1; i <= 5; i++) {
        if (i <= puntuacionRedondeada) {
            html += '<i class="fa-solid fa-star estrella-llena"></i>';
        } else if (i - 0.5 === puntuacionRedondeada) {
            html += '<i class="fa-solid fa-star-half-stroke estrella-media"></i>';
        } else {
            html += '<i class="fa-regular fa-star estrella-vacia"></i>';
        }
    }

    return html;
}

function mostrarMensajeEmpresas(tipo, mensaje) {
    const contenedor = $('#contenedor-empresas');
    const iconos = {
        success: 'fa-check-circle',
        danger: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };

    contenedor.html(`
        <div class="alert alert-${tipo} text-center">
            <i class="fa-solid ${iconos[tipo]} fa-2x mb-3"></i>
            <p class="mb-0">${mensaje}</p>
        </div>
    `);
}

function verComentariosEmpresa(idEmpresa) {
    $.ajax({
        url: '/Administracion/ObtenerComentariosEmpresa',
        type: 'GET',
        data: { idEmpresa: idEmpresa },
        dataType: 'json',
        beforeSend: function () {
            Swal.fire({
                title: 'Cargando comentarios...',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });
        },
        success: function (response) {
            Swal.close();
            if (response.success && response.data && response.data !== null) {
                const totalComentarios = response.data.length;
                const promedioCalificacion = (response.data.reduce((sum, c) => sum + (c.Puntuacion || 0), 0) / totalComentarios).toFixed(1);

                let html = `
                    <style>
                        .comentarios-container {
                            max-height: 500px;
                            overflow-y: auto;
                            padding: 10px;
                        }
                        .comentario-card {
                            background: #f8f9fa;
                            border-radius: 12px;
                            padding: 16px;
                            margin-bottom: 12px;
                            border-left: 4px solid #6c757d;
                            transition: all 0.3s ease;
                        }
                        .comentario-card:hover {
                            background: #e9ecef;
                            transform: translateX(4px);
                        }
                        .comentario-header {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            margin-bottom: 8px;
                        }
                        .comentario-usuario {
                            font-weight: 600;
                            color: #2c3e50;
                            font-size: 15px;
                        }
                        .comentario-fecha {
                            color: #6c757d;
                            font-size: 13px;
                        }
                        .comentario-estrellas {
                            margin-bottom: 8px;
                            font-size: 18px;
                        }
                        .estrella-llena {
                            color: #ffc107;
                        }
                        .estrella-vacia {
                            color: #dee2e6;
                        }
                        .comentario-texto {
                            color: #495057;
                            line-height: 1.5;
                            font-size: 14px;
                        }
                        .estadisticas-box {
                            background: linear-gradient(90deg, #8b1038, #b31646);
                            color: white;
                            padding: 20px;
                            border-radius: 12px;
                            margin-bottom: 20px;
                            text-align: center;
                        }
                        .estadisticas-box h3 {
                            margin: 0;
                            font-size: 32px;
                            font-weight: bold;
                        }
                        .estadisticas-box p {
                            margin: 5px 0 0 0;
                            opacity: 0.9;
                        }
                        .sin-comentarios {
                            text-align: center;
                            padding: 40px;
                            color: #6c757d;
                        }
                        .sin-comentarios i {
                            font-size: 48px;
                            margin-bottom: 16px;
                            opacity: 0.5;
                        }
                    </style>
                    <div class="estadisticas-box">
                        <h3>⭐ ${promedioCalificacion}</h3>
                        <p>${totalComentarios} ${totalComentarios === 1 ? 'comentario' : 'comentarios'}</p>
                    </div>
                    <div class="comentarios-container">
                `;

                response.data.forEach(comentario => {
                    const puntuacion = comentario.Puntuacion || 0;
                    let estrellas = '';
                    for (let i = 1; i <= 5; i++) {
                        estrellas += `<span class="${i <= puntuacion ? 'estrella-llena' : 'estrella-vacia'}">★</span>`;
                    }

                    html += `
                        <div class="comentario-card">
                            <div class="comentario-header">
                                <span class="comentario-usuario">👤 ${comentario.usuario || 'Anónimo'}</span>
                                <span class="comentario-fecha">📅 ${formatearFecha(comentario.FechaPuntuacion)}</span>
                            </div>
                            <div class="comentario-estrellas">${estrellas}</div>
                            <div class="comentario-texto">${comentario.comentario || 'Sin comentario escrito'}</div>
                        </div>
                    `;
                });

                html += '</div>';

                Swal.fire({
                    title: 'Comentarios de la Empresa',
                    html: html,
                    width: 700,
                    confirmButtonText: 'Cerrar',
                    confirmButtonColor: '#667eea',
                    showClass: {
                        popup: 'animate__animated animate__fadeInDown'
                    },
                    hideClass: {
                        popup: 'animate__animated animate__fadeOutUp'
                    }
                });
            } else {
                Swal.fire({
                    icon: 'info',
                    title: 'Sin comentarios',
                    html: '<div class="sin-comentarios"><i>💬</i><p>Esta empresa aún no tiene comentarios.</p></div>',
                    confirmButtonText: 'Cerrar',
                    confirmButtonColor: '#667eea'
                });
            }
        },
        error: function () {
            Swal.close();
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron cargar los comentarios.',
                confirmButtonText: 'Cerrar',
                confirmButtonColor: '#dc3545'
            });
        }
    });
}

function editarEmpresa(idEmpresa) {
    cargarDatosEmpresa(idEmpresa);
}

function cargarDatosEmpresa(idEmpresa) {
    $.ajax({
        url: '/Administracion/ObtenerEmpresa',
        type: 'GET',
        data: { idEmpresa: idEmpresa },
        dataType: 'json',
        success: function (response) {
            if (response.success && response.data) {
                llenarFormularioEdicion(response.data);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: response.message || 'No se pudo cargar la información de la empresa',
                    confirmButtonColor: '#8b1538'
                });
            }
        },
        error: function (xhr, status, error) {
            console.error('Error al cargar datos de la empresa:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo cargar la información de la empresa',
                confirmButtonColor: '#8b1538'
            });
        }
    });
}
function llenarFormularioEdicion(empresa) {
    $('#modalEditarEmpresa').remove();

    const usuarioPrincipal = empresa.UsuarioPrincipal || {};
    const usuarioEmpresa = empresa.UsuarioEmpresa || {};

    const roles = [
        { value: 'Reclutador', label: 'Reclutador' },
    ];

    const modalHtml = `
    <div class="modal fade" id="modalEditarEmpresa" tabindex="-1" aria-labelledby="modalEditarEmpresaLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <form id="formEditarEmpresa">
            <div class="modal-header">
              <h5 class="modal-title" id="modalEditarEmpresaLabel">
                <i class="fa-solid fa-building me-2"></i>Editar Empresa
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div class="modal-body">
              <input type="hidden" name="idEmpresa" value="${empresa.id_empresa}">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Razón Social</label>
                  <input type="text" class="form-control" name="razon_social" value="${empresa.razon_social || ''}" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label">NIT</label>
                  <input type="text" class="form-control" name="nit" value="${empresa.nit || ''}" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Email de Contacto</label>
                  <input type="email" class="form-control" name="email_contacto" value="${empresa.email_contacto || ''}" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Teléfono</label>
                  <input type="text" class="form-control" name="telefono" value="${empresa.telefono || ''}">
                </div>
                <div class="col-md-12">
                  <label class="form-label">Dirección</label>
                  <input type="text" class="form-control" name="direccion" value="${empresa.direccion || ''}">
                </div>
                <div class="col-md-6">
                  <label class="form-label">Sector Económico</label>
                  <input type="text" class="form-control" name="sector_economico" value="${empresa.sector_economico || ''}">
                </div>
                <div class="col-md-6">
                  <label class="form-label">Tamaño de Empresa</label>
                  <input type="text" class="form-control" name="tamano_empresa" value="${empresa.tamano_empresa || ''}">
                </div>
                <div class="col-md-6">
                  <label class="form-label">Vinculada a Universidad</label>
                  <select class="form-select" name="vinculada_universidad">
                    <option value="true" ${empresa.vinculada_universidad ? 'selected' : ''}>Sí</option>
                    <option value="false" ${!empresa.vinculada_universidad ? 'selected' : ''}>No</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Puntuación Promedio</label>
                  <input type="text" class="form-control" value="${empresa.Puntuacion ? empresa.Puntuacion.toFixed(1) : '0.0'}" disabled>
                </div>
                <div class="col-12">
                  <hr>
                  <h6 class="mb-2"><i class="fa-solid fa-user-tie me-2"></i>Usuario Asignado a la Empresa</h6>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Nombre a mostrar</label>
                  <input type="text" class="form-control" name="usuario_empresa_nombre_usuario" value="${usuarioEmpresa.nombre_usuario || ''}">
                </div>
                <div class="col-md-6">
                  <label class="form-label">Rol</label>
                  <select class="form-select" name="usuario_empresa_rol">
                    ${roles.map(r => `<option value="${r.value}" ${usuarioEmpresa.rol === r.value ? 'selected' : ''}>${r.label}</option>`).join('')}
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Nombre Completo</label>
                  <input type="text" class="form-control" name="usuario_empresa_nombre_completo" value="${usuarioEmpresa.nombre_completo || ''}">
                </div>
                <div class="col-md-6">
                  <label class="form-label">Cargo</label>
                  <input type="text" class="form-control" name="usuario_empresa_cargo" value="${usuarioEmpresa.cargo || ''}">
                </div>
                <div class="col-md-6">
                  <label class="form-label">Email</label>
                  <input type="email" class="form-control" name="usuario_empresa_email" value="${usuarioEmpresa.email || ''}">
                </div>
                <div class="col-md-6">
                  <label class="form-label">Contraseña (dejar en blanco para no cambiar)</label>
                  <input type="password" class="form-control" name="usuario_principal_password" autocomplete="new-password">
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
              <button type="submit" class="btn btn-primary">Guardar Cambios</button>
            </div>
          </form>
        </div>
      </div>
    </div>
    `;

    $('body').append(modalHtml);

    const modal = new bootstrap.Modal(document.getElementById('modalEditarEmpresa'));
    modal.show();

    $('#formEditarEmpresa').on('submit', function (e) {
        e.preventDefault();
        const datos = $(this).serialize();

        $.ajax({
            url: '/Administracion/ActualizarEmpresa',
            type: 'POST',
            data: datos,
            success: function (response) {
                if (response.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Empresa actualizada',
                        text: response.message,
                        confirmButtonColor: '#10b981'
                    });
                    modal.hide();
                    cargarEmpresas();
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: response.message || 'No se pudo actualizar la empresa',
                        confirmButtonColor: '#8b1538'
                    });
                }
            },
            error: function () {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo actualizar la empresa',
                    confirmButtonColor: '#8b1538'
                });
            }
        });
    });

    $('#modalEditarEmpresa').on('hidden.bs.modal', function () {
        $(this).remove();
    });
}

function confirmarEliminarEmpresa(idEmpresa) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: 'Esta acción eliminará la empresa de forma permanente.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            eliminarEmpresa(idEmpresa);
        }
    });
}

function eliminarEmpresa(idEmpresa) {
    Swal.fire({
        title: 'Eliminando...',
        text: 'Por favor espera mientras se elimina la empresa.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    $.ajax({
        url: '/Administracion/EliminarEmpresa',
        type: 'POST',
        data: { idEmpresa: idEmpresa },
        success: function (response) {
            Swal.close();
            if (response.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Empresa eliminada',
                    text: response.message,
                    confirmButtonColor: '#10b981'
                });
                cargarEmpresas();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: response.message || 'No se pudo eliminar la empresa',
                    confirmButtonColor: '#8b1538'
                });
            }
        },
        error: function () {
            Swal.close();
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo eliminar la empresa',
                confirmButtonColor: '#8b1538'
            });
        }
    });
}

$('#InvitarEmpresa').on('click', function () {
    Swal.fire({
        title: '<strong>Invitar Nueva Empresa</strong>',
        html: `
            <div style="text-align: left; margin: 20px 0;">
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; color: #374151; font-weight: 500; font-size: 14px;">
                        <i class="fas fa-envelope" style="color: #8b1038; margin-right: 8px;"></i>
                        Correo electrónico
                    </label>
                    <input type="email" id="emailInvitacion" class="swal2-input" 
                           placeholder="ejemplo@empresa.com" 
                           style="margin: 0; width: 100%; box-sizing: border-box;"
                           required>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 8px; color: #374151; font-weight: 500; font-size: 14px;">
                        <i class="fas fa-building" style="color: #8b1038; margin-right: 8px;"></i>
                        Nombre de la empresa
                    </label>
                    <input type="text" id="nombreEmpresa" class="swal2-input" 
                           placeholder="Ingrese el nombre de la empresa"
                           style="margin: 0; width: 100%; box-sizing: border-box;"
                           required>
                </div>
            </div>
        `,
        iconHtml: '<i class="fas fa-paper-plane" style="font-size: 48px; color: #8b1038;"></i>',
        confirmButtonText: '<i class="fas fa-paper-plane" style="margin-right: 8px;"></i>Enviar Invitación',
        confirmButtonColor: '#8b1038',
        showCancelButton: true,
        cancelButtonText: '<i class="fas fa-times" style="margin-right: 8px;"></i>Cancelar',
        cancelButtonColor: '#6b7280',
        customClass: {
            popup: 'swal-empresa-popup',
            confirmButton: 'swal-confirm-btn',
            cancelButton: 'swal-cancel-btn'
        },
        width: '550px',
        padding: '2em',
        backdrop: 'rgba(0, 0, 0, 0.4)',
        showClass: {
            popup: 'animate__animated animate__fadeInDown'
        },
        hideClass: {
            popup: 'animate__animated animate__fadeOutUp'
        },
        didOpen: () => {
            document.getElementById('emailInvitacion').focus();
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const emailInput = Swal.getPopup().querySelector('#emailInvitacion');
            const nombreInput = Swal.getPopup().querySelector('#nombreEmpresa');

            if (!emailInput.value.trim() || !nombreInput.value.trim()) {
                Swal.fire({
                    icon: 'error',
                    title: '<strong>Campos incompletos</strong>',
                    html: '<p style="color: #6b7280;">Por favor, completa todos los campos para continuar.</p>',
                    confirmButtonText: 'Entendido',
                    confirmButtonColor: '#ef4444',
                    customClass: {
                        popup: 'swal-empresa-popup'
                    }
                });
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailInput.value.trim())) {
                Swal.fire({
                    icon: 'warning',
                    title: '<strong>Email inválido</strong>',
                    html: '<p style="color: #6b7280;">Por favor, ingresa un correo electrónico válido.</p>',
                    confirmButtonText: 'Entendido',
                    confirmButtonColor: '#f59e0b',
                    customClass: {
                        popup: 'swal-empresa-popup'
                    }
                });
                return;
            }

            Swal.fire({
                title: 'Enviando invitación...',
                html: '<p style="color: #6b7280;">Por favor espera un momento</p>',
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            $.ajax({
                url: '/Administracion/EnviarInvitacionRegistroEmpresa',
                type: 'POST',
                data: {
                    email: emailInput.value.trim(),
                    nombreEmpresa: nombreInput.value.trim()
                },
                success: function (response) {
                    if (response.success) {
                        Swal.fire({
                            icon: 'success',
                            title: '<strong>¡Invitación enviada!</strong>',
                            html: `<p style="color: #6b7280;">${response.message}</p>`,
                            confirmButtonText: 'Perfecto',
                            confirmButtonColor: '#10b981',
                            customClass: {
                                popup: 'swal-empresa-popup'
                            }
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: '<strong>Error al enviar</strong>',
                            html: `<p style="color: #6b7280;">${response.message || 'No se pudo enviar la invitación'}</p>`,
                            confirmButtonText: 'Entendido',
                            confirmButtonColor: '#ef4444',
                            customClass: {
                                popup: 'swal-empresa-popup'
                            }
                        });
                    }
                },
                error: function (xhr, status, error) {
                    Swal.fire({
                        icon: 'error',
                        title: '<strong>Error de conexión</strong>',
                        html: '<p style="color: #6b7280;">No se pudo conectar con el servidor. Por favor, intenta nuevamente.</p>',
                        confirmButtonText: 'Entendido',
                        confirmButtonColor: '#ef4444',
                        customClass: {
                            popup: 'swal-empresa-popup'
                        }
                    });
                }
            });
        }
    });
});
$(document).ready(function () {
    cargarEstadisticas();
    cargarPipelineProcesos();
    cargarAplicacionesRecientes();
    cargarTendencias();    
});