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

    if (tipo === 'cuenta_eliminada') {
        manejarCuentaEliminada(data);
        return;
    }

    if (tipo === 'se_VisualizoCV') {
        ActualizarYNotificarVZ(data);
        return;
    }

    const duracion = (Por.toLowerCase() === 'admin') ? 15000 : 7000;
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

function ActualizarYNotificarVZ(data) {
    ActualizarVisualizaciones();
    const colores = {
        info: { bg: '#3b82f6', sombra: 'rgba(59, 130, 246, 0.2)', grad: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' },
        success: { bg: '#10b981', sombra: 'rgba(16, 185, 129, 0.2)', grad: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
        warning: { bg: '#f59e0b', sombra: 'rgba(245, 158, 11, 0.2)', grad: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
        error: { bg: '#ef4444', sombra: 'rgba(239, 68, 68, 0.2)', grad: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }
    };

    const tipo = data.tipo || 'success';
    const color = colores[tipo] || colores.success;

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
                        ">📄 VISUALIZACIÓN DE CV</div>
                        <div style="
                            font-size: 11px;
                            color: #6b7280;
                            background: #f3f4f6;
                            padding: 2px 8px;
                            border-radius: 12px;
                            font-weight: 500;
                        ">Por: ${data.Por || 'Sistema'}</div>
                    </div>
                    <div style="
                        font-size: 14px; 
                        color: #374151;
                        font-weight: 500;
                        line-height: 1.4;
                    ">${data.mensaje}</div>
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
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
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
        duration: 10000, 
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
}

function manejarCuentaEliminada(data) {
    Swal.fire({
        icon: 'error',
        title: 'Cuenta Eliminada',
        html: `
            <div style="text-align: center; padding: 10px;">
                <div style="font-size: 48px; color: #ef4444; margin-bottom: 15px;">🚫</div>
                <div style="font-size: 18px; color: #1f2937; font-weight: 600; margin-bottom: 10px;">
                    Su cuenta ha sido eliminada
                </div>
                <div style="font-size: 14px; color: #6b7280; line-height: 1.5;">
                    ${data.mensaje || 'Ya no podrá acceder al sistema de egresados.'}
                </div>
            </div>
        `,
        showConfirmButton: true,
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#ef4444',
        allowOutsideClick: false,
        allowEscapeKey: false,
        customClass: {
            popup: 'swal-custom-popup'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            document.getElementById('CerrarSesion').click();
        }
    });
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
hayDatosSinGuardar = false;
let visualizacionesData = [];
let paginaActual = 1;
const registrosPorPagina = 5;
let modalDraggable = null;
let isDragging = false;
let isMaximized = false;
let isMinimized = false;
let previousState = {}; 
let originalState = {}; 
let floatingIcon = null;
let vacantesData = [];
let paginaActualVacantes = 1;
let vacantesPorPaginaVacantes = 20;
let vacantesFiltradas = [];
let filtrosActivosVacantes = {
    titulo: '',
    empresa: '',
    ubicacion: '',
    tipoContrato: '',
    modalidad: '',
    estado: '',
    postulado: 'todas'
};
let datosEgresado = null;
let idiomasDisponibles = [];

let postulacionesData = [];
let paginaActualPostulaciones = 1;
let postulacionesPorPaginaPostulaciones = 20;
let postulacionesFiltradas = [];
let filtrosActivosPostulaciones = {
    tituloVacante: '',
    area: '',
    modalidad: '',
    ubicacion: '',
    estadoPostulacion: '',
    estadoVacante: ''
};

let modalPostulaciones = null;
let isMaximizedPostulaciones = false;
let isMinimizedPostulaciones = false;
let isDraggingPostulaciones = false;
let originalStatePostulaciones = {};
let floatingIconPostulaciones = null;





window.addEventListener('beforeunload', function (e) {
    if (hayDatosSinGuardar) {
        e.preventDefault();
        e.returnValue = '';
        return '¿Estás seguro de que deseas salir? Los datos ingresados se perderán.';
    }
});

$(document).ready(function () {
    ObtenerDatos();    
});
$(document).on('click', '#abrirModalOfertas', abrirModalDraggable);
$(document).on('click', '#MisPostulaciones', abrirModalPostulaciones);

function ObtenerDatos() {
    $.ajax({
        url: '/Egresado/DatosEgresado',
        type: 'GET',
        success: function (response) {
            if (response.success) {
                if (response.data.length < 0) {
                    swal.fire('Error', 'No se pudieron obtener los datos del egresado.');
                }
                var info = response.data.Carrera;
                renderInfo(info);
                var CV = response.data.CV;
                renderCV(CV);
                var idiomas = response.data.Idiomas;
                renderIdiomas(idiomas); 
                var certificaciones = response.data.Certificaciones;
                renderCertificaciones(certificaciones);
                var Visualizaciones = response.data.Visualizaciones_CV;
                renderVisualizaciones(Visualizaciones);
                $('#NotificarEmail').prop('checked', response.data.Preferencia.notificar);

            }
        },
        error: function (error) {
            swal.fire('Error', 'No se pudieron obtener los datos del egresado.', error);
        }
    });
}

function ActualizarVisualizaciones() {
    $.ajax({
        url: '/Egresado/ActualizarVisualizaciones',
        type: 'GET',
        success: function (response) {
            if (response.success) {
                var Visualizaciones = response.data;
                renderVisualizaciones(Visualizaciones);
            }
        },
        error: function (error) {
            swal.fire('Error', 'No se pudieron obtener los datos del egresado.', error);
        }
    });
}

$('#EditCartaPresentacion').on('click', function () {
    $('#CartaPresentacionEgresado').prop('disabled', false);
    Toastify({
        text: 'Ahora puedes editar tu carta de presentación.',
        duration: 4000,
        gravity: "top",
        position: "right",
        style: {
            background: "#8b1538",
        },
    }).showToast();
    $('#TerminarEdicion').prop('hidden', false);
    $('#cancelarEdicion').prop('hidden', false);
});
$('#CartaPresentacionEgresado').on('input', function () {
    if ($(this).val().trim().length > 0) {
        hayDatosSinGuardar = true;
        Toastify({
            text: 'Recomendacion : Se puntual al escribir una carta de presentación tiene que ser clara y concisa que resalte tus habilidades y experiencia relevantes para el trabajo que estás buscando.\nMUCHO EXITO Y SUERTE!!!',
            duration: 10000,
            gravity: "top",
            position: "right",
            style: {
                background: "#8b1538",
            },
        }).showToast();
    }
    $(this).off('input');
    
});
$('#cancelarEdicion').on('click', function () {
    swal.fire({
        title: 'Cancelar edición',
        text: '¿Estás seguro de que deseas cancelar la edición de tu carta de presentación? Los cambios no guardados se perderán.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#8b1538',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, cancelar',
        cancelButtonText: 'Continuar editando'
    })
    .then((result) => {
        if (result.isConfirmed) {
            hayDatosSinGuardar = false;
            var cartaOriginal = $('#CartaPresentacionEgresado').data('original');
            $('#CartaPresentacionEgresado').val(cartaOriginal);
            $('#CartaPresentacionEgresado').prop('disabled', true);
            $('#TerminarEdicion').prop('hidden', true);
            $('#cancelarEdicion').prop('hidden', true);
            Toastify({
                text: 'Edición cancelada. Los cambios no guardados se han descartado.',
                duration: 4000,
                gravity: "top",
                position: "right",
                style: {
                    background: "#8b1538",
                },
            }).showToast();
        }
    });
});
$('#TerminarEdicion').on('click', function () {
    swal.fire({
        title: 'Quieres guardar los cambios en tu carta de presentación?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#8b1538',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, guardar',
        cancelButtonText: 'Cancelar'
    })
    .then((result) => {
        if (result.isConfirmed) {
            hayDatosSinGuardar = false;
            const nuevaCarta = $('#CartaPresentacionEgresado').val();
            var id_cv = $('#PrivacidadCV').data('id_cv');
            swal.fire({
                title: 'Actualizando carta de presentación',
                text: 'Estamos actualizando su carta de presentación, esto puede tardar unos momentos.',
                allowOutsideClick: false,
                showConfirmButton: false,
                didOpen: () => {
                    swal.showLoading();
                }
            });
            $.ajax({
                url: '/Egresado/ActualizarCartaPresentacion',
                type: 'POST',
                data: { carta_presentacion: nuevaCarta, id_cv: id_cv },
                success: function (response) {
                    if (response.success) {
                        swal.close();
                        swal.fire('Éxito', 'Su carta de presentación ha sido actualizada.', 'success');
                        $('#CartaPresentacionEgresado').prop('disabled', true);
                        $('#TerminarEdicion').prop('hidden', true);
                        $('#cancelarEdicion').prop('hidden', true);
                        $('#CartaEgresadoContainer').removeClass('carta-vacia');
                        $('#CartaPresentacionEgresado').popover('dispose');
                    } else {
                        swal.close();
                        swal.fire('Error', response.message,'error');
                    }
                },
                error: function (error) {
                    swal.close();
                    swal.fire('Error', 'No se pudo actualizar su carta de presentación.', error);
                }
            });
        }
    });
});

$('#PrivacidadCV').on('change', function () {
    const nuevaPrivacidad = $(this).val();
    var id_cv = $(this).data('id_cv');
    swal.fire({
        title: 'Actualizando privacidad del CV',
        text: 'Estamos actualizando la privacidad de su CV, esto puede tardar unos momentos.',
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
            swal.showLoading();
        }
    });
    $.ajax({
        url: '/Egresado/ActualizarPreferenciaPrivacidadCV',
        type: 'POST',
        data: { privacidad: nuevaPrivacidad, id_cv: id_cv },
        success: function (response) {
            if (response.success) {
                swal.close();
                swal.fire('Éxito', 'La privacidad de su CV ha sido actualizada.', 'success');
            } else {
                swal.close();
                swal.fire('Error', 'No se pudo actualizar la privacidad de su CV.');
            }
        },
        error: function (error) {
            swal.close();
            swal.fire('Error', 'No se pudo actualizar la privacidad de su CV.', error);
        }
    });
});

$('#NotificarEmail').on('change', function () {
    if (this.checked) {
        swal.fire({
            title: 'Activando las notificaciones',
            text: 'Estamos Activando las notificaciones esto puede tardar unos momentos',
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => {
                swal.showLoading();
            }
        });

        const notificar = $('#NotificarEmail').is(':checked');

        $.ajax({
            url: '/Egresado/ActualizarPreferenciaNotificacion',
            type: 'POST',
            data: { recibeNotificaciones: notificar },
            success: function (response) {
                if (response.success) {
                    swal.close();
                    swal.fire('Éxito', 'La preferencia de notificación ha sido actualizada.', 'success');
                } else {
                    swal.close();
                    swal.fire('Error', 'No se pudo actualizar la preferencia de notificación.');
                    $('#NotificarEmail').prop('checked', !notificar);
                }
            },
            error: function (error) {
                swal.close();
                swal.fire('Error', 'No se pudo actualizar la preferencia de notificación.', error);
                $('#NotificarEmail').prop('checked', !notificar);
            }
        });
    } else {
        swal.fire({
            title: 'Desea desactivar las notificaciones por email?',
            text: "Si desactiva esta opción, no recibirá notificaciones por correo electrónico sobre nuevas visualizaciones de su CV.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#8b1538',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, desactivar',
            cancelButtonText: 'Cancelar'
        })
        .then((result) => {
            if (result.isConfirmed) {
                const notificar = $('#NotificarEmail').is(':checked');
                $.ajax({
                    url: '/Egresado/ActualizarPreferenciaNotificacion',
                    type: 'POST',
                    data: { recibeNotificaciones: notificar },
                    success: function (response) {
                        if (response.success) {                            
                            swal.fire('Éxito', 'La preferencia de notificación ha sido actualizada.', 'success');
                        } else {
                            swal.fire('Error', 'No se pudo actualizar la preferencia de notificación.');
                            $('#NotificarEmail').prop('checked', !notificar);
                        }
                    },
                    error: function (error) {
                        swal.fire('Error', 'No se pudo actualizar la preferencia de notificación.', error);
                        $('#NotificarEmail').prop('checked', !notificar);
                    }
                });
            } else {
                $('#NotificarEmail').prop('checked', !$('#NotificarEmail').is(':checked'));
            }
        });
    }
});
function renderInfo(info) {
    $('#carreraText').text(info.nombre_carrera);
    $('#PromedioGlobal').text('Promedio Global de graduacion: ' + info.promedio);
}
function renderCV(CV) {
    $('#NombreCV').text(CV.nombre_archivo);
    $('#CVPeso').text(convertirBytes(CV.tamano_archivo));
    $('#CVFecha').text(formatearFecha(CV.fecha_subida));
    $('#VerCV').attr('data-ruta', CV.ruta_archivo);
    $('#DescargarCV').attr('data-ruta', CV.ruta_archivo);
    $('#DescargarCV').attr('data-nombre', CV.nombre_archivo);
    $('#PrivacidadCV').attr('data-id_cv', CV.id_cv);
    $('#PrivacidadCV').val(CV.privacidad);

    const cartaVacia = !CV.CartaPresentacion || CV.CartaPresentacion.trim() === "";

    if (!cartaVacia) {
        $('#textBtnCarta').text('Editar Carta De Presentación');
        $('#CartaPresentacionEgresado').val(CV.CartaPresentacion);
        $('#CartaEgresadoContainer').removeClass('carta-vacia');
        $('#CartaPresentacionEgresado').popover('dispose');
    } else {
        $('#textBtnCarta').text('Agregar Carta De Presentación');
        $('#CartaPresentacionEgresado').val('');
        $('#CartaEgresadoContainer').addClass('carta-vacia');

        $('#CartaPresentacionEgresado').popover({
            content: '💡 ¡Bienvenido! Es la primera vez que accedes a la plataforma. Por favor, agrega tu carta de presentación para causar una excelente impresión a los empleadores y completar tu perfil.',
            trigger: 'hover',
            placement: 'top',
            html: true,
            container: 'body'
        });
    }

    renderHabilidades(CV.habilidades_principales);
}

function renderVisualizaciones(visualizaciones) {
    visualizacionesData = visualizaciones;
    paginaActual = 1;

    $('#NumeroVisualizaciones').text(visualizaciones.length);
    mostrarPagina(1);
}

function mostrarPagina(pagina) {
    const tbody = $('#TablaVisualizaciones tbody');
    tbody.empty();

    if (visualizacionesData.length === 0) {
        const filaVacia = `
            <tr>
                <td colspan="3" class="text-center">No hay visualizaciones para mostrar.</td>
            </tr>
        `;
        tbody.append(filaVacia);
        $('#paginacionVisualizaciones').hide();
        return;
    }

    $('#paginacionVisualizaciones').show();

    const inicio = (pagina - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    const registrosPagina = visualizacionesData.slice(inicio, fin);

    registrosPagina.forEach(vis => {
        const fila = `
            <tr>
                <td>${formatearFecha(vis.fecha_visualizacion)}</td>
                <td>${vis.Empresa}</td>
                <td>${vis.NombreUsuario}</td>
            </tr>
        `;
        tbody.append(fila);
    });

    actualizarControlesPaginacion(pagina);
}

function actualizarControlesPaginacion(pagina) {
    const totalPaginas = Math.ceil(visualizacionesData.length / registrosPorPagina);
    const $paginacion = $('#paginacionVisualizaciones');

    $('#paginaActual').text(pagina);
    $('#totalPaginas').text(totalPaginas);

    $('#btnAnterior').prop('disabled', pagina === 1);
    $('#btnSiguiente').prop('disabled', pagina === totalPaginas);

    const inicio = ((pagina - 1) * registrosPorPagina) + 1;
    const fin = Math.min(pagina * registrosPorPagina, visualizacionesData.length);
    $('#infoPaginacion').text(`Mostrando ${inicio}-${fin} de ${visualizacionesData.length} registros`);
}

function paginaAnterior() {
    if (paginaActual > 1) {
        paginaActual--;
        mostrarPagina(paginaActual);
    }
}

function paginaSiguiente() {
    const totalPaginas = Math.ceil(visualizacionesData.length / registrosPorPagina);
    if (paginaActual < totalPaginas) {
        paginaActual++;
        mostrarPagina(paginaActual);
    }
}

$(document).on('click', '#VerCV', function () {
    const rutaCV = $(this).data('ruta');
    const nombreCV = $('#NombreCV').text();

    $('#VerMiCV').modal('show');

    cargarCVEnModal(rutaCV, nombreCV);
});
$(document).on('click', '#DescargarCV', function () {
    const rutaCV = $(this).data('ruta');
    const nombreCV = $(this).data('nombre');
    descargarCV(rutaCV, nombreCV);
});
function cargarCVEnModal(rutaArchivo, nombreArchivo) {
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

    if (extension === 'pdf') {
        mostrarPDF(rutaArchivo, cvContainer);
    } else if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
        mostrarImagen(rutaArchivo, cvContainer);
    } else if (['doc', 'docx'].includes(extension)) {
        mostrarDocumentoWord(rutaArchivo, cvContainer, nombreArchivo);
    } 
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
function descargarCV(rutaArchivo, nombreArchivo) {
    const link = document.createElement('a');
    link.href = rutaArchivo;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function renderHabilidades(habilidadesString) {
    const titleHabilidades = $('#titleHabilidades');
    const containerHabilidades = titleHabilidades.parent();

    const habilidadesArray = habilidadesString.split(',')
        .map(habilidad => habilidad.trim())
        .filter(habilidad => habilidad !== '');

    titleHabilidades.text(`Habilidades • ${habilidadesArray.length}`);

    containerHabilidades.find('.skill-badge').remove();

    habilidadesArray.forEach(habilidad => {
        const skillBadge = `<span class="skill-badge">${habilidad}</span>`;
        containerHabilidades.append(skillBadge);
    });
}
function renderIdiomas(idiomas) {
    $('#NumeroIdiomas').text('Idiomas• '+idiomas.length);
    const sectionIdiomas = $('#SectionIdiomas');

    sectionIdiomas.find('.section-title').text(`Idiomas • ${idiomas.length}`);

    sectionIdiomas.find('.lang-badge').remove();

    idiomas.forEach(idioma => {
        const banderaSrc = obtenerBandera(idioma.nombre);
        const nivelTexto = obtenerNivelTexto(idioma.nivel);

        const langBadge = `
            <div class="lang-badge">
                <img src="${banderaSrc}" alt="${idioma.nombre.substring(0, 2).toUpperCase()}">
                <span><strong>${idioma.nombre}</strong> — ${nivelTexto}</span>
            </div>
        `;

        sectionIdiomas.append(langBadge);
    });
}
function renderCertificaciones(certificaciones) {
    $('#TitleCertificaciones').text('Certificaciones • ' + certificaciones.length);
    const sectionCertificaciones = $('#CertificacionesContainer');
    sectionCertificaciones.find('.cert-badge').remove();
    certificaciones.forEach(certi => {
        const certBadge = `
            <div class="cert-badge mb-2 p-2 border rounded bg-light">
                <strong>${certi.nombre}</strong>
                <br>
                <span class="text-muted small">Emitida por: ${certi.entidad_emisora || 'No especificado'}</span>
            </div>
        `;
        sectionCertificaciones.append(certBadge);
    });
}


function obtenerBandera(nombreIdioma) {
    const mapeoIdiomasPaises = {
        'Español': 'es',
        'Inglés': 'gb',
        'Ingles': 'gb',
        'Francés': 'fr',
        'Frances': 'fr',
        'Alemán': 'de',
        'Aleman': 'de',
        'Portugués': 'pt',
        'Portugues': 'pt',
        'Italiano': 'it',
        'Chino': 'cn',
        'Japonés': 'jp',
        'Japones': 'jp',
        'Coreano': 'kr',
        'Ruso': 'ru',
        'Árabe': 'sa',
        'Arabe': 'sa',
        'Hindi': 'in',
        'Holandés': 'nl',
        'Holandes': 'nl',
        'Sueco': 'se',
        'Noruego': 'no',
        'Danés': 'dk',
        'Danes': 'dk',
        'Finlandés': 'fi',
        'Finlandes': 'fi',
        'Griego': 'gr',
        'Turco': 'tr',
        'Polaco': 'pl',
        'Checo': 'cz',
        'Húngaro': 'hu',
        'Hungaro': 'hu',
        'Rumano': 'ro',
        'Búlgaro': 'bg',
        'Bulgaro': 'bg',
        'Ucraniano': 'ua',
        'Hebreo': 'il',
        'Tailandés': 'th',
        'Tailandes': 'th',
        'Vietnamita': 'vn',
        'Indonesio': 'id',
        'Malayo': 'my'
    };

    const codigoPais = mapeoIdiomasPaises[nombreIdioma] || 'un';

    try {
        return `https://flagcdn.com/w40/${codigoPais}.png`;

        // return `https://countryflagsapi.com/png/${codigoPais}`;

        // return `https://restcountries.com/data/${codigoPais}.svg`;

    } catch (error) {
        console.warn(`Error cargando bandera para ${nombreIdioma}:`, error);
        return `https://flagcdn.com/w40/un.png`; 
    }
}
function obtenerNivelTexto(nivel) {
    const niveles = {
        'A1': 'Básico',
        'A2': 'Elemental',
        'B1': 'Intermedio',
        'B2': 'Intermedio Alto',
        'C1': 'Avanzado',
        'C2': 'Proficiente',
        'Nativo': 'Nativo'
    };

    return niveles[nivel] || (nivel ? nivel : 'Sin especificar');
}
function convertirBytes(bytes) {
    return (bytes / 1024).toFixed(2) + ' KB';
}
function formatearFecha(fechaString) {
    const timestamp = parseInt(fechaString.match(/\d+/)[0]);

    const fecha = new Date(timestamp);

    return fecha.toLocaleDateString('es-ES');
}



function abrirModalPostulaciones() {
    if (modalPostulaciones) {
        const modal = $(modalPostulaciones);
        modal.removeClass('animate__backOutRight').addClass('animate__backInRight').show();

        if (isMaximizedPostulaciones) $('body').css('overflow', 'hidden');
        else $('body').css('overflow', 'auto');

        cargarPostulaciones();
        return;
    }

    const modal = $(`
        <div class="modal-postulaciones-draggable animate__animated" style="top: 50%; left: 50%;">
            <div class="modal-postulaciones-header-drag">
                <h6 class="mb-0">
                    <i class="fa-solid fa-file-alt me-2"></i>Mis Postulaciones <label id="TotalPostulaciones"></label>
                </h6>
                <div class="modal-postulaciones-controls">
                    <button id="minimizeModalPostulaciones" title="Minimizar">
                        <i class="fa-solid fa-minus"></i>
                    </button>
                    <button id="maximizeModalPostulaciones" title="Maximizar">
                        <i class="fa-solid fa-expand"></i>
                    </button>
                    <button id="closeModalPostulaciones" title="Cerrar">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            </div>
            <div class="modal-postulaciones-body-drag">
                <div class="filtros-postulaciones-panel">
                    <div class="filtros-header">
                        <h6><i class="fa-solid fa-filter me-2"></i>Filtros</h6>
                        <button id="limpiarFiltrosPostulaciones" class="btn-limpiar-filtros" title="Limpiar filtros">
                            <i class="fa-solid fa-eraser"></i> Limpiar
                        </button>
                    </div>
                    <div class="filtros-grid">
                        <div class="filtro-item">
                            <label><i class="fa-solid fa-briefcase"></i> Título de Vacante</label>
                            <input type="text" id="filtroTituloVacantePost" class="filtro-input" placeholder="Buscar por título...">
                        </div>
                        <div class="filtro-item">
                            <label><i class="fa-solid fa-map-marker-alt"></i> Ubicación</label>
                            <input type="text" id="filtroUbicacionPost" class="filtro-input" placeholder="Buscar por ubicación...">
                        </div>
                        <div class="filtro-item">
                            <label><i class="fa-solid fa-layer-group"></i> Área</label>
                            <select id="filtroAreaPost" class="filtro-select">
                                <option value="">Todas las áreas</option>
                            </select>
                        </div>
                        <div class="filtro-item">
                            <label><i class="fa-solid fa-laptop-house"></i> Modalidad</label>
                            <select id="filtroModalidadPost" class="filtro-select">
                                <option value="">Todas las modalidades</option>
                            </select>
                        </div>
                        <div class="filtro-item">
                            <label><i class="fa-solid fa-clipboard-check"></i> Estado Postulación</label>
                            <select id="filtroEstadoPostulacion" class="filtro-select">
                                <option value="">Todos los estados</option>
                            </select>
                        </div>
                        <div class="filtro-item">
                            <label><i class="fa-solid fa-toggle-on"></i> Estado Vacante</label>
                            <select id="filtroEstadoVacantePost" class="filtro-select">
                                <option value="">Todos los estados</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="paginacion-container">
                    <div class="paginacion-info">
                        <span id="info-paginacion-postulaciones">Mostrando 0-0 de 0 postulaciones</span>
                    </div>
                    <div class="paginacion-controles">
                        <button id="btnPrimeraPaginaPostulaciones" class="btn-paginacion" title="Primera página">
                            <i class="fa-solid fa-angles-left"></i>
                        </button>
                        <button id="btnPaginaAnteriorPostulaciones" class="btn-paginacion" title="Anterior">
                            <i class="fa-solid fa-angle-left"></i>
                        </button>
                        <div class="paginacion-numeros" id="numerosPaginaPostulaciones"></div>
                        <button id="btnPaginaSiguientePostulaciones" class="btn-paginacion" title="Siguiente">
                            <i class="fa-solid fa-angle-right"></i>
                        </button>
                        <button id="btnUltimaPaginaPostulaciones" class="btn-paginacion" title="Última página">
                            <i class="fa-solid fa-angles-right"></i>
                        </button>
                        <select id="selectPostulacionesPorPagina" class="select-por-pagina">
                            <option value="10">10 por página</option>
                            <option value="20" selected>20 por página</option>
                            <option value="50">50 por página</option>
                            <option value="100">100 por página</option>
                        </select>
                    </div>
                </div>

                <div id="contenedor-postulaciones">
                    <div class="text-center py-5">
                        <i class="fa-solid fa-spinner fa-spin fa-3x text-primary"></i>
                        <p class="mt-3">Cargando postulaciones...</p>
                    </div>
                </div>
            </div>
        </div>
    `);

    $('body').append(modal);
    modalPostulaciones = modal[0];

    const winW = $(window).width();
    const winH = $(window).height();
    const modalW = modal.outerWidth();
    const modalH = modal.outerHeight();
    modal.css({
        top: (winH - modalH) / 2 + 'px',
        left: (winW - modalW) / 2 + 'px'
    });

    hacerModalPostulacionesArrastrable();
    configurarControlesModalPostulaciones();
    configurarFiltrosPostulaciones();
    configurarPaginacionPostulaciones();
    modal.addClass('animate__backInRight');
    modal.show();
    cargarPostulaciones();
}

function configurarFiltrosPostulaciones() {
    let timeoutId;

    $('#filtroTituloVacantePost, #filtroUbicacionPost').on('input', function () {
        clearTimeout(timeoutId);
        const filtroId = $(this).attr('id');
        const valor = $(this).val().trim();

        timeoutId = setTimeout(() => {
            switch (filtroId) {
                case 'filtroTituloVacantePost':
                    filtrosActivosPostulaciones.tituloVacante = valor;
                    break;
                case 'filtroUbicacionPost':
                    filtrosActivosPostulaciones.ubicacion = valor;
                    break;
            }
            aplicarFiltrosPostulaciones();
        }, 300);
    });

    $('#filtroAreaPost').on('change', function () {
        filtrosActivosPostulaciones.area = $(this).val();
        aplicarFiltrosPostulaciones();
    });

    $('#filtroModalidadPost').on('change', function () {
        filtrosActivosPostulaciones.modalidad = $(this).val();
        aplicarFiltrosPostulaciones();
    });

    $('#filtroEstadoPostulacion').on('change', function () {
        filtrosActivosPostulaciones.estadoPostulacion = $(this).val();
        aplicarFiltrosPostulaciones();
    });

    $('#filtroEstadoVacantePost').on('change', function () {
        filtrosActivosPostulaciones.estadoVacante = $(this).val();
        aplicarFiltrosPostulaciones();
    });

    $('#limpiarFiltrosPostulaciones').on('click', function () {
        limpiarFiltrosPostulaciones();
    });
}

function limpiarFiltrosPostulaciones() {
    filtrosActivosPostulaciones = {
        tituloVacante: '',
        area: '',
        modalidad: '',
        ubicacion: '',
        estadoPostulacion: '',
        estadoVacante: ''
    };

    $('#filtroTituloVacantePost').val('');
    $('#filtroUbicacionPost').val('');
    $('#filtroAreaPost').val('');
    $('#filtroModalidadPost').val('');
    $('#filtroEstadoPostulacion').val('');
    $('#filtroEstadoVacantePost').val('');

    aplicarFiltrosPostulaciones();
}

function aplicarFiltrosPostulaciones() {
    postulacionesFiltradas = postulacionesData.filter(postulacion => {
        const vacante = postulacion.Vacante;

        if (filtrosActivosPostulaciones.tituloVacante) {
            const titulo = (vacante?.titulo || '').toLowerCase();
            if (!titulo.includes(filtrosActivosPostulaciones.tituloVacante.toLowerCase())) {
                return false;
            }
        }

        if (filtrosActivosPostulaciones.ubicacion) {
            const ubicacion = (vacante?.ubicacion || '').toLowerCase();
            if (!ubicacion.includes(filtrosActivosPostulaciones.ubicacion.toLowerCase())) {
                return false;
            }
        }

        if (filtrosActivosPostulaciones.area) {
            if (vacante?.area !== filtrosActivosPostulaciones.area) {
                return false;
            }
        }

        if (filtrosActivosPostulaciones.modalidad) {
            if (vacante?.modalidad !== filtrosActivosPostulaciones.modalidad) {
                return false;
            }
        }

        if (filtrosActivosPostulaciones.estadoPostulacion) {
            if (postulacion.estado !== filtrosActivosPostulaciones.estadoPostulacion) {
                return false;
            }
        }

        if (filtrosActivosPostulaciones.estadoVacante) {
            if (vacante?.estado !== filtrosActivosPostulaciones.estadoVacante) {
                return false;
            }
        }

        return true;
    });

    paginaActualPostulaciones = 1;
    renderizarPaginaActualPostulaciones();
    actualizarControlsPaginacionPostulaciones();
    $('#TotalPostulaciones').text(`(${postulacionesFiltradas.length} de ${postulacionesData.length})`);
}

function renderizarPaginaActualPostulaciones() {
    const inicio = (paginaActualPostulaciones - 1) * postulacionesPorPaginaPostulaciones;
    const fin = inicio + postulacionesPorPaginaPostulaciones;
    const postulacionesPagina = postulacionesFiltradas.slice(inicio, fin);

    renderizarPostulaciones(postulacionesPagina);
}

function actualizarControlsPaginacionPostulaciones() {
    const totalPaginas = Math.ceil(postulacionesFiltradas.length / postulacionesPorPaginaPostulaciones);

    $('#btnPrimeraPaginaPostulaciones, #btnPaginaAnteriorPostulaciones').prop('disabled', paginaActualPostulaciones === 1);
    $('#btnUltimaPaginaPostulaciones, #btnPaginaSiguientePostulaciones').prop('disabled', paginaActualPostulaciones === totalPaginas || totalPaginas === 0);

    const inicio = postulacionesFiltradas.length > 0 ? (paginaActualPostulaciones - 1) * postulacionesPorPaginaPostulaciones + 1 : 0;
    const fin = Math.min(paginaActualPostulaciones * postulacionesPorPaginaPostulaciones, postulacionesFiltradas.length);
    $('#info-paginacion-postulaciones').text(`Mostrando ${inicio}-${fin} de ${postulacionesFiltradas.length} postulaciones`);

    generarNumerosPaginaPostulaciones(totalPaginas);
}

function generarNumerosPaginaPostulaciones(totalPaginas) {
    const contenedor = $('#numerosPaginaPostulaciones');
    contenedor.empty();

    if (totalPaginas === 0) return;

    let inicio = Math.max(1, paginaActualPostulaciones - 2);
    let fin = Math.min(totalPaginas, inicio + 4);

    if (fin - inicio < 4) {
        inicio = Math.max(1, fin - 4);
    }

    for (let i = inicio; i <= fin; i++) {
        const btn = $(`
            <button class="btn-numero-pagina ${i === paginaActualPostulaciones ? 'activo' : ''}" data-pagina="${i}">
                ${i}
            </button>
        `);
        contenedor.append(btn);
    }
}

function configurarPaginacionPostulaciones() {
    $('#btnPrimeraPaginaPostulaciones').on('click', () => {
        paginaActualPostulaciones = 1;
        renderizarPaginaActualPostulaciones();
        actualizarControlsPaginacionPostulaciones();
    });

    $('#btnPaginaAnteriorPostulaciones').on('click', () => {
        if (paginaActualPostulaciones > 1) {
            paginaActualPostulaciones--;
            renderizarPaginaActualPostulaciones();
            actualizarControlsPaginacionPostulaciones();
        }
    });

    $('#btnPaginaSiguientePostulaciones').on('click', () => {
        const totalPaginas = Math.ceil(postulacionesFiltradas.length / postulacionesPorPaginaPostulaciones);
        if (paginaActualPostulaciones < totalPaginas) {
            paginaActualPostulaciones++;
            renderizarPaginaActualPostulaciones();
            actualizarControlsPaginacionPostulaciones();
        }
    });

    $('#btnUltimaPaginaPostulaciones').on('click', () => {
        const totalPaginas = Math.ceil(postulacionesFiltradas.length / postulacionesPorPaginaPostulaciones);
        paginaActualPostulaciones = totalPaginas;
        renderizarPaginaActualPostulaciones();
        actualizarControlsPaginacionPostulaciones();
    });

    $(document).on('click', '#numerosPaginaPostulaciones .btn-numero-pagina', function () {
        paginaActualPostulaciones = parseInt($(this).data('pagina'));
        renderizarPaginaActualPostulaciones();
        actualizarControlsPaginacionPostulaciones();
    });

    $('#selectPostulacionesPorPagina').on('change', function () {
        postulacionesPorPaginaPostulaciones = parseInt($(this).val());
        paginaActualPostulaciones = 1;
        renderizarPaginaActualPostulaciones();
        actualizarControlsPaginacionPostulaciones();
    });
}

function cargarPostulaciones() {
    $('#contenedor-postulaciones').html(`
        <div class="text-center py-5">
            <i class="fa-solid fa-spinner fa-spin fa-3x text-primary"></i>
            <p class="mt-3">Cargando postulaciones...</p>
        </div>
    `);

    $.ajax({
        url: '/Egresado/ObtenerMisPostulaciones',
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            if (response.success) {
                if (response.data === null || response.data.length === 0) {
                    postulacionesData = [];
                    postulacionesFiltradas = [];
                    renderizarPostulaciones([]);
                    $('#TotalPostulaciones').text('(0)');
                    $('#info-paginacion-postulaciones').text('Mostrando 0-0 de 0 postulaciones');
                    return;
                }

                postulacionesData = response.data;
                popularFiltrosSelectPostulaciones();
                aplicarFiltrosPostulaciones();
            } else {
                mostrarMensajePostulaciones('warning', response.message || 'No se pudieron cargar las postulaciones');
            }
        },
        error: function (xhr, status, error) {
            console.error('Error al cargar postulaciones:', error);
            mostrarMensajePostulaciones('danger', 'Error al cargar las postulaciones. Por favor, intente nuevamente.');
        }
    });
}

function popularFiltrosSelectPostulaciones() {
    const areas = [...new Set(postulacionesData
        .map(p => p.Vacante?.area)
        .filter(a => a && a !== 'No especificada')
    )].sort();

    const modalidades = [...new Set(postulacionesData
        .map(p => p.Vacante?.modalidad)
        .filter(m => m)
    )].sort();

    const estadosPostulacion = [...new Set(postulacionesData
        .map(p => p.estado)
        .filter(e => e)
    )].sort();

    const estadosVacante = [...new Set(postulacionesData
        .map(p => p.Vacante?.estado)
        .filter(e => e)
    )].sort();

    const selectArea = $('#filtroAreaPost');
    selectArea.html('<option value="">Todas las áreas</option>');
    areas.forEach(area => {
        selectArea.append(`<option value="${area}">${area}</option>`);
    });

    const selectModalidad = $('#filtroModalidadPost');
    selectModalidad.html('<option value="">Todas las modalidades</option>');
    modalidades.forEach(modalidad => {
        selectModalidad.append(`<option value="${modalidad}">${modalidad}</option>`);
    });

    const selectEstadoPost = $('#filtroEstadoPostulacion');
    selectEstadoPost.html('<option value="">Todos los estados</option>');
    estadosPostulacion.forEach(estado => {
        selectEstadoPost.append(`<option value="${estado}">${estado}</option>`);
    });

    const selectEstadoVac = $('#filtroEstadoVacantePost');
    selectEstadoVac.html('<option value="">Todos los estados</option>');
    estadosVacante.forEach(estado => {
        selectEstadoVac.append(`<option value="${estado}">${estado}</option>`);
    });
}

function hacerModalPostulacionesArrastrable() {
    const modal = $(modalPostulaciones);
    const header = modal.find('.modal-postulaciones-header-drag');
    let startX, startY, startLeft, startTop;

    header.on('mousedown', function (e) {
        if (isMaximizedPostulaciones || isMinimizedPostulaciones || $(e.target).closest('.modal-postulaciones-controls').length) return;

        isDraggingPostulaciones = true;
        startX = e.clientX;
        startY = e.clientY;
        startLeft = parseInt(modal.css('left'), 10);
        startTop = parseInt(modal.css('top'), 10);

        $(document).on('mousemove.modalPostulacionesDrag', function (e) {
            if (isDraggingPostulaciones) {
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

        $(document).on('mouseup.modalPostulacionesDrag', function () {
            isDraggingPostulaciones = false;
            $(document).off('mousemove.modalPostulacionesDrag mouseup.modalPostulacionesDrag');
        });
    });
}

function configurarControlesModalPostulaciones() {
    $('#minimizeModalPostulaciones').on('click', function () {
        const modal = $(modalPostulaciones);
        modal.removeClass('animate__bounceIn animate__zoomIn animate__backInRight')
            .addClass('animate__backOutRight');
        if (!isMinimizedPostulaciones) {
            modal.one('animationend', function () {
                modal.hide();
                crearIconoFlotantePostulaciones();
                isMinimizedPostulaciones = true;
                $('body').css('overflow', 'auto');
            });
        } else {
            restaurarDesdeIconoPostulaciones();
        }
    });

    $('#maximizeModalPostulaciones').on('click', function () {
        const modal = $(modalPostulaciones);
        const btn = $(this).find('i');
        modal.removeClass('animate__backOutRight animate__backInRight');

        if (!isMaximizedPostulaciones) {
            modal.removeClass('animate__bounceIn').addClass('animate__zoomIn');
            originalStatePostulaciones = {
                width: modal.width(),
                height: modal.height(),
                top: modal.css('top'),
                left: modal.css('left')
            };

            modal.addClass('maximized-postulaciones');
            $('body').css('overflow', 'hidden');
            btn.removeClass('fa-expand').addClass('fa-compress');
            isMaximizedPostulaciones = true;
        } else {
            modal.removeClass('animate__zoomIn').addClass('animate__bounceIn');
            modal.removeClass('maximized-postulaciones');
            modal.css({
                width: originalStatePostulaciones.width,
                height: originalStatePostulaciones.height,
                top: originalStatePostulaciones.top,
                left: originalStatePostulaciones.left,
                right: 'auto',
                bottom: 'auto'
            });
            $('body').css('overflow', 'auto');
            btn.removeClass('fa-compress').addClass('fa-expand');
            isMaximizedPostulaciones = false;
        }
    });

    $('#closeModalPostulaciones').on('click', function () {
        const modal = $(modalPostulaciones);
        modal.removeClass('animate__bounceIn animate__zoomIn animate__backInRight')
            .addClass('animate__backOutRight');
        modal.one('animationend', function () {
            modal.hide();
            eliminarIconoFlotantePostulaciones();
            $('body').css('overflow', 'auto');
            isMaximizedPostulaciones = false;
            isMinimizedPostulaciones = false;
        });
    });
}

function crearIconoFlotantePostulaciones() {
    eliminarIconoFlotantePostulaciones();
    floatingIconPostulaciones = $(`
        <div class="floating-icon-postulaciones" title="Restaurar ventana de postulaciones">
            <i class="fa-solid fa-file-alt"></i>
        </div>
    `);
    $('body').append(floatingIconPostulaciones);
    floatingIconPostulaciones.on('click', restaurarDesdeIconoPostulaciones);
}

function eliminarIconoFlotantePostulaciones() {
    if (floatingIconPostulaciones) {
        floatingIconPostulaciones.remove();
        floatingIconPostulaciones = null;
    }
}

function restaurarDesdeIconoPostulaciones() {
    const modal = $(modalPostulaciones);
    modal.removeClass('animate__backOutRight').addClass('animate__backInRight').show();

    if (isMaximizedPostulaciones) {
        modal.addClass('maximized-postulaciones');
        $('#maximizeModalPostulaciones i').removeClass('fa-expand').addClass('fa-compress');
        $('body').css('overflow', 'hidden');
    } else {
        modal.removeClass('maximized-postulaciones');
        if (originalStatePostulaciones.width) {
            modal.css({
                width: originalStatePostulaciones.width,
                height: originalStatePostulaciones.height,
                top: originalStatePostulaciones.top,
                left: originalStatePostulaciones.left,
                right: 'auto',
                bottom: 'auto'
            });
        }
        $('#maximizeModalPostulaciones i').removeClass('fa-compress').addClass('fa-expand');
        $('body').css('overflow', 'auto');
    }
    cargarPostulaciones();
    eliminarIconoFlotantePostulaciones();
    isMinimizedPostulaciones = false;
}

function renderizarPostulaciones(postulaciones) {
    const contenedor = $('#contenedor-postulaciones');

    if (!postulaciones || postulaciones.length === 0) {
        contenedor.html(`
            <div class="alert alert-info text-center">
                <i class="fa-solid fa-info-circle fa-2x mb-3"></i>
                <p class="mb-0">No se encontraron postulaciones con los filtros aplicados</p>
            </div>
        `);
        return;
    }

    let html = '<div class="postulaciones-grid">';

    postulaciones.forEach(postulacion => {
        const vacante = postulacion.Vacante;
        const tituloVacante = vacante?.titulo || 'Título no disponible';
        const salario = formatearSalarioPost(vacante);
        const fechaPostulacion = formatearFechaPost(postulacion.fecha_postulacion);
        const fechaActualizacion = formatearFechaPost(postulacion.fecha_actualizacion);
        const fechaCierre = formatearFechaPost(vacante?.fecha_cierre);
        const estadoPostBadge = obtenerBadgeEstadoPostulacion(postulacion.estado);
        const estadoVacBadge = obtenerBadgeEstadoVacante(vacante?.estado);
        const creadoPor = vacante?.CreadoPor?.nombre_completo || vacante?.CreadoPor?.nombre_usuario || 'No especificado';

        html += `
            <div class="postulacion-card">
                <div class="postulacion-card-header">
                    <div class="postulacion-info-principal">
                        <h5 class="postulacion-titulo">${tituloVacante}</h5>
                        <div class="postulacion-meta">                            
                            ${estadoPostBadge}
                        </div>
                    </div>
                    <div class="postulacion-estado-vacante">
                        ${estadoVacBadge}
                    </div>
                </div>
                
                <div class="postulacion-card-body">
                    <div class="postulacion-detalle">
                        <i class="fa-solid fa-layer-group text-primary"></i>
                        <span>${vacante?.area || 'Área no especificada'}</span>
                    </div>
                    <div class="postulacion-detalle">
                        <i class="fa-solid fa-map-marker-alt text-danger"></i>
                        <span>${vacante?.ubicacion || 'Ubicación no especificada'}</span>
                    </div>
                    <div class="postulacion-detalle">
                        <i class="fa-solid fa-laptop-house text-info"></i>
                        <span>${vacante?.modalidad || 'No especificada'}</span>
                    </div>
                    <div class="postulacion-detalle">
                        <i class="fa-solid fa-dollar-sign text-success"></i>
                        <span>${salario}</span>
                    </div>
                    <div class="postulacion-caracteristicas">
                        <span class="caracteristica fecha-postulacion">
                            <i class="fa-solid fa-calendar-plus"></i>
                            Postulado: ${fechaPostulacion}
                        </span>
                        <span class="caracteristica fecha-actualizacion">
                            <i class="fa-solid fa-sync-alt"></i>
                            Actualizado: ${fechaActualizacion}
                        </span>
                        <span class="caracteristica fecha-cierre">
                            <i class="fa-solid fa-calendar-times"></i>
                            Cierre: ${fechaCierre}
                        </span>
                        <span class="caracteristica creado-por">
                            <i class="fa-solid fa-user"></i>
                            Contacto: ${creadoPor}
                        </span>
                    </div>
                </div>
                
                <div class="postulacion-acciones">
                    <button class="btn-accion btn-ver-vacante" 
                            onclick="verDetalleOferta(${vacante.id_vacante}, true)" 
                            title="Ver vacante completa (ya postulada)">
                        <i class="fa-solid fa-eye text-primary"></i>
                    </button>                    

                    <button class="btn-accion btn-cancelar" 
                            onclick="confirmarCancelarPostulacion(${postulacion.id_postulacion})" 
                            title="Cancelar postulación">
                        <i class="fa-solid fa-times-circle text-danger"></i>
                    </button>
                </div>
            </div>
        `;
    });

    html += '</div>';
    contenedor.html(html);
}


function obtenerBadgeEstadoPostulacion(estado) {
    const estados = {
        'Pendiente': 'badge-postulacion-pendiente',
        'En Revisión': 'badge-postulacion-revision',
        'Preseleccionado': 'badge-postulacion-preseleccionado',
        'Entrevista': 'badge-postulacion-entrevista',
        'Aceptado': 'badge-postulacion-aceptado',
        'Rechazado': 'badge-postulacion-rechazado',
        'Cancelado': 'badge-postulacion-cancelado'
    };

    const claseEstado = estados[estado] || 'badge-postulacion-default';
    return `<span class="badge-postulacion ${claseEstado}">${estado || 'Sin estado'}</span>`;
}

function obtenerBadgeEstadoVacante(estado) {
    const estados = {
        'Activa': 'badge-vacante-activa',
        'Cerrada': 'badge-vacante-cerrada',
        'Pausada': 'badge-vacante-pausada'
    };

    const claseEstado = estados[estado] || 'badge-vacante-default';
    return `<span class="badge-vacante ${claseEstado}"><i class="fa-solid fa-briefcase me-1"></i>${estado || 'Sin estado'}</span>`;
}

function formatearSalarioPost(vacante) {
    if (!vacante) return 'No especificado';

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

function formatearFechaPost(fechaJson) {
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

function mostrarMensajePostulaciones(tipo, mensaje) {
    const contenedor = $('#contenedor-postulaciones');
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

function confirmarCancelarPostulacion(idPostulacion) {
    swal.fire({
        title: 'Estas seguro de cancelar tu postulacion??',
        text: 'Esta accion no se podra deshacer!',
        icon:'question',
        showCancelButton: true,
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Si, Eliminar postulacion',
        confirmButtonColor: '#8b1538'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: '/Egresado/CancelarPostulacion',
                type: 'POST',
                data: { IdPostulacion: idPostulacion },
                success: function (response) {
                    if (response.success) {
                        swal.fire({
                            title: 'Cancelacion Exitosa',
                            text: response.message,
                            icon: 'success'
                        }).then(() => {
                            cargarPostulaciones();
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
                    swal.fire('Error', 'No se pudo cancelar la postulacion.', error);
                }
            });
        } 

    })
}


function abrirModalDraggable() {
    if (modalDraggable) {
        const modal = $(modalDraggable);
        modal.removeClass('animate__backOutRight').addClass('animate__backInRight').show();
        cargarOfertas(true);
        if (isMaximized) $('body').css('overflow', 'hidden');
        else $('body').css('overflow', 'auto');
        return;
    }

    const modal = $(`
        <div class="modal-draggable animate__animated" style="top: 50%; left: 50%;">
            <div class="modal-header-drag">
                <h6 class="mb-0">
                    <i class="fa-solid fa-briefcase me-2"></i>Ofertas Laborales Disponibles <label id="TotalOfertas"></label>
                </h6>
                <div class="modal-controls">
                    <button id="minimizeModal" title="Minimizar">
                        <i class="fa-solid fa-minus"></i>
                    </button>
                    <button id="maximizeModal" title="Maximizar">
                        <i class="fa-solid fa-expand"></i>
                    </button>
                    <button id="closeModal" title="Cerrar">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            </div>
            <div class="modal-body-drag">
                <div class="filtros-vacantes-panel">
                    <div class="filtros-header">
                        <h6><i class="fa-solid fa-filter me-2"></i>Filtros</h6>
                        <button id="limpiarFiltrosVacantes" class="btn-limpiar-filtros" title="Limpiar filtros">
                            <i class="fa-solid fa-eraser"></i> Limpiar
                        </button>
                    </div>
                    <div class="filtros-grid">
                        <div class="filtro-item">
                            <label><i class="fa-solid fa-briefcase"></i> Título</label>
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
                            <label><i class="fa-solid fa-file-contract"></i> Tipo de Contrato</label>
                            <select id="filtroTipoContrato" class="filtro-select">
                                <option value="">Todos</option>
                            </select>
                        </div>
                        <div class="filtro-item">
                            <label><i class="fa-solid fa-laptop-house"></i> Modalidad</label>
                            <select id="filtroModalidad" class="filtro-select">
                                <option value="">Todas</option>
                            </select>
                        </div>
                        <div class="filtro-item">
                            <label><i class="fa-solid fa-toggle-on"></i> Estado</label>
                            <select id="filtroEstadoVacante" class="filtro-select">
                                <option value="">Todos</option>
                                <option value="Activo">Activo</option>
                                <option value="Pendiente">Pendiente</option>
                                <option value="Cerrado">Cerrado</option>
                                <option value="Pausado">Pausado</option>
                            </select>
                        </div>
                        <div class="filtro-item" hidden>
                            <label><i class="fa-solid fa-paper-plane"></i> Postulación</label>
                            <select id="filtroPostulado" class="filtro-select">
                                <option value="todas">Todas</option>
                                <option value="postuladas">Solo postuladas</option>
                                <option value="no-postuladas">No postuladas</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="paginacion-container">
                    <div class="paginacion-info">
                        <span id="info-paginacion-vacantes">Mostrando 0-0 de 0 ofertas</span>
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

                <div id="contenedor-ofertas">
                    <div class="text-center py-5">
                        <i class="fa-solid fa-spinner fa-spin fa-3x text-primary"></i>
                        <p class="mt-3">Cargando ofertas laborales...</p>
                    </div>
                </div>
            </div>
        </div>
    `);

    $('body').append(modal);
    modalDraggable = modal[0];

    const winW = $(window).width();
    const winH = $(window).height();
    const modalW = modal.outerWidth();
    const modalH = modal.outerHeight();
    modal.css({
        top: (winH - modalH) / 2 + 'px',
        left: (winW - modalW) / 2 + 'px'
    });

    hacerModalArrastrable();
    configurarControlesModal();
    configurarFiltrosVacantes();
    configurarPaginacionVacantes();
    modal.addClass('animate__backInRight');
    modal.show();
    cargarOfertas();
}
function cargarOfertas(silencioso = false) {
    if (!silencioso) {
        $('#contenedor-ofertas').html(`
            <div class="text-center py-5">
                <i class="fa-solid fa-spinner fa-spin fa-3x text-primary"></i>
                <p class="mt-3">Cargando ofertas...</p>
            </div>
        `);
    }

    $.ajax({
        url: '/Egresado/ObtenerOfertas',
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            if (response.success && response.data) {
                if (response.data === null || response.data.length === 0) {
                    vacantesData = [];
                    vacantesFiltradas = [];
                    renderizarOfertas([]);
                    $('#TotalOfertas').text('(0)');
                    $('#info-paginacion-vacantes').text('Mostrando 0-0 de 0 ofertas');
                    return;
                }

                vacantesData = response.data;
                popularFiltrosSelectVacantes();
                aplicarFiltrosVacantes();
            } else {
                if (!silencioso) {
                    mostrarMensaje(response.message || 'No hay ofertas disponibles', 'info');
                }
            }
        },
        error: function (xhr, status, error) {
            if (!silencioso) {
                mostrarMensaje('Error al cargar las ofertas: ' + error, 'danger');
            }
        }
    });
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

    $('#filtroTipoContrato').on('change', function () {
        filtrosActivosVacantes.tipoContrato = $(this).val();
        aplicarFiltrosVacantes();
    });

    $('#filtroModalidad').on('change', function () {
        filtrosActivosVacantes.modalidad = $(this).val();
        aplicarFiltrosVacantes();
    });

    $('#filtroEstadoVacante').on('change', function () {
        filtrosActivosVacantes.estado = $(this).val();
        aplicarFiltrosVacantes();
    });

    $('#filtroPostulado').on('change', function () {
        filtrosActivosVacantes.postulado = $(this).val();
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
        ubicacion: '',
        tipoContrato: '',
        modalidad: '',
        estado: '',
        postulado: 'todas'
    };

    $('#filtroTituloVacante').val('');
    $('#filtroEmpresaVacante').val('');
    $('#filtroUbicacionVacante').val('');
    $('#filtroTipoContrato').val('');
    $('#filtroModalidad').val('');
    $('#filtroEstadoVacante').val('');
    $('#filtroPostulado').val('todas');

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
            const empresa = (vacante.empresa?.razon_social || '').toLowerCase();
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

        if (filtrosActivosVacantes.tipoContrato) {
            if (vacante.tipo_contrato !== filtrosActivosVacantes.tipoContrato) {
                return false;
            }
        }

        if (filtrosActivosVacantes.modalidad) {
            if (vacante.modalidad !== filtrosActivosVacantes.modalidad) {
                return false;
            }
        }

        if (filtrosActivosVacantes.estado) {
            if (vacante.estado !== filtrosActivosVacantes.estado) {
                return false;
            }
        }

        if (filtrosActivosVacantes.postulado !== 'todas') {
            const estaPostulado = vacante.yaPostulado === true;
            if (filtrosActivosVacantes.postulado === 'postuladas' && !estaPostulado) {
                return false;
            }
            if (filtrosActivosVacantes.postulado === 'no-postuladas' && estaPostulado) {
                return false;
            }
        }

        return true;
    });

    paginaActualVacantes = 1;
    renderizarPaginaActualVacantes();
    actualizarControlsPaginacionVacantes();
    $('#TotalOfertas').text(`(${vacantesFiltradas.length} de ${vacantesData.length})`);
}

function popularFiltrosSelectVacantes() {
    const tiposContrato = [...new Set(vacantesData
        .map(v => v.tipo_contrato)
        .filter(t => t && t !== 'No especificado')
    )].sort();

    const modalidades = [...new Set(vacantesData
        .map(v => v.modalidad)
        .filter(m => m && m !== 'No especificado')
    )].sort();

    const selectTipoContrato = $('#filtroTipoContrato');
    selectTipoContrato.html('<option value="">Todos</option>');
    tiposContrato.forEach(tipo => {
        selectTipoContrato.append(`<option value="${tipo}">${tipo}</option>`);
    });

    const selectModalidad = $('#filtroModalidad');
    selectModalidad.html('<option value="">Todas</option>');
    modalidades.forEach(modalidad => {
        selectModalidad.append(`<option value="${modalidad}">${modalidad}</option>`);
    });
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

    $(document).on('click', '.btn-numero-pagina-vacante', function () {
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

function renderizarPaginaActualVacantes() {
    const inicio = (paginaActualVacantes - 1) * vacantesPorPaginaVacantes;
    const fin = inicio + vacantesPorPaginaVacantes;
    const vacantesPagina = vacantesFiltradas.slice(inicio, fin);

    renderizarOfertas(vacantesPagina);
}

function actualizarControlsPaginacionVacantes() {
    const totalPaginas = Math.ceil(vacantesFiltradas.length / vacantesPorPaginaVacantes);

    $('#btnPrimeraPaginaVacantes, #btnPaginaAnteriorVacantes').prop('disabled', paginaActualVacantes === 1);
    $('#btnUltimaPaginaVacantes, #btnPaginaSiguienteVacantes').prop('disabled', paginaActualVacantes === totalPaginas || totalPaginas === 0);

    const inicio = vacantesFiltradas.length > 0 ? (paginaActualVacantes - 1) * vacantesPorPaginaVacantes + 1 : 0;
    const fin = Math.min(paginaActualVacantes * vacantesPorPaginaVacantes, vacantesFiltradas.length);
    $('#info-paginacion-vacantes').text(`Mostrando ${inicio}-${fin} de ${vacantesFiltradas.length} ofertas`);

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
            <button class="btn-numero-pagina btn-numero-pagina-vacante ${i === paginaActualVacantes ? 'activo' : ''}" data-pagina="${i}">
                ${i}
            </button>
        `);
        contenedor.append(btn);
    }
}

function renderizarOfertas(ofertas, silencioso = false) {
    const contenedor = $('#contenedor-ofertas');

    if (!ofertas || ofertas.length === 0) {
        contenedor.fadeOut(200, function () {
            contenedor.html(`
                <div class="alert alert-info text-center">
                    <i class="fa-solid fa-info-circle fa-2x mb-3"></i>
                    <p class="mb-0">No hay ofertas laborales disponibles en este momento</p>
                </div>
            `).fadeIn(200);
        });
        return;
    }

    let html = '<div class="ofertas-grid">';

    ofertas.forEach(function (oferta) {
        const salario = oferta.salario_confidencial
            ? '<span class="badge bg-secondary">Confidencial</span>'
            : `$${formatearNumero(oferta.salario_min)} - $${formatearNumero(oferta.salario_max)}`;

        const diasPublicada = calcularDiasDesde(oferta.fecha_publicacion);

        let textoCierre = '';
        let claseCierre = 'muted';

        if (oferta.fecha_cierre && oferta.fecha_cierre !== "null") {
            const diasCierre = calcularDiasHasta(oferta.fecha_cierre);
            textoCierre = diasCierre.texto;
            claseCierre = diasCierre.urgente ? 'danger' : 'muted';
        } else {
            textoCierre = 'Activa';
            claseCierre = 'success';
        }

        const badgeCompatibilidad = oferta.puntuacionCompatibilidad > 50
            ? `<span class="badge bg-success ms-2" title="Alta compatibilidad con tus preferencias">
                   <i class="fa-solid fa-heart"></i> ${oferta.puntuacionCompatibilidad}%
               </span>`
            : oferta.puntuacionCompatibilidad > 25
                ? `<span class="badge bg-warning ms-2" title="Compatibilidad media con tus preferencias">
                   <i class="fa-solid fa-thumbs-up"></i> ${oferta.puntuacionCompatibilidad}%
               </span>`
                : '';

        const botonOferta = oferta.yaPostulado
            ? `<button class="btn btn-success btn-sm" disabled>
                   <i class="fa-solid fa-check"></i> Ya postulado
               </button>`
            : `<button class="btn btn-outline-primary btn-sm ver-detalle" onclick="verDetalleOferta(${oferta.id_vacante})">
                   <i class="fa-solid fa-eye"></i> Ver detalle
               </button>`;

        html += `
            <div class="oferta-card ${oferta.puntuacionCompatibilidad > 50 ? 'alta-compatibilidad' : ''}" data-oferta-id="${oferta.id_vacante}">
                <div class="oferta-header">
                    <div class="empresa-info">
                        <div class="empresa-logo">
                            <i class="fa-solid fa-building"></i>
                        </div>
                        <div>
                            <h5 class="oferta-titulo">${oferta.titulo} ${badgeCompatibilidad}</h5>
                            <p class="empresa-nombre">
                                ${oferta.empresa?.razon_social || 'Empresa sin nombre'}
                                ${oferta.empresa?.puntuacion_empresa
            ? `<span class="ms-2 text-warning">⭐${oferta.empresa.puntuacion_empresa}</span>`
            : `<span class="ms-2 text-warning">⭐0</span>`}
                            </p>
                        </div>
                    </div>
                    <div class="oferta-estado">
                        <span class="badge ${obtenerClaseEstado(oferta.estado)}">${oferta.estado}</span>
                    </div>
                </div>
        
                <p class="oferta-descripcion">${truncarTexto(oferta.descripcion, 160)}</p>
        
                <div class="oferta-detalles">
                    <div class="detalle-item"><i class="fa-solid fa-money-bill-wave"></i> ${salario}</div>
                    <div class="detalle-item"><i class="fa-solid fa-briefcase"></i> ${oferta.tipo_contrato || 'No especificado'}</div>
                    <div class="detalle-item"><i class="fa-solid fa-laptop-house"></i> ${oferta.modalidad || 'No especificado'}</div>
                    <div class="detalle-item"><i class="fa-solid fa-location-dot"></i> ${oferta.ubicacion || 'No especificado'}</div>
                </div>
        
                <div class="oferta-empresa-extra">
                    <i class="fa-solid fa-industry"></i> ${oferta.empresa?.sector_economico || 'No definido'} • 
                    <i class="fa-solid fa-users"></i> ${oferta.empresa?.tamano_empresa || 'N/A'}
                </div>
        
                <div class="oferta-footer">
                    <div class="oferta-fechas">
                        <small class="text-muted"><i class="fa-solid fa-clock"></i> Publicada hace ${diasPublicada}</small>
                        <small class="text-${claseCierre}">
                            <i class="fa-solid ${textoCierre === 'Activa' ? 'fa-circle-check' : 'fa-calendar-xmark'}"></i> ${textoCierre}
                        </small>
                    </div>
                    ${botonOferta}
                </div>
            </div>
        `;
    });

    html += '</div>';

    if (silencioso) {
        actualizarContenidoInteligente(contenedor, html);
    } else {
        contenedor.fadeOut(300, function () {
            contenedor.html(html).fadeIn(400);
        });
    }
}

function actualizarContenidoInteligente(contenedor, nuevoHtml) {
    const tempDiv = $('<div>').html(nuevoHtml);
    const nuevasOfertas = tempDiv.find('.oferta-card');
    const ofertasActuales = contenedor.find('.oferta-card');

    if (ofertasActuales.length === 0) {
        contenedor.html(nuevoHtml);
        return;
    }

    nuevasOfertas.each(function (index) {
        const nuevaOferta = $(this);
        const idOferta = nuevaOferta.data('oferta-id');
        const ofertaExistente = contenedor.find(`.oferta-card[data-oferta-id="${idOferta}"]`);

        if (ofertaExistente.length > 0) {
            if (ofertaExistente.html() !== nuevaOferta.html()) {
                ofertaExistente.fadeOut(150, function () {
                    ofertaExistente.html(nuevaOferta.html()).fadeIn(150);
                });
            }
        } else {
            nuevaOferta.hide();
            if (index === 0) {
                contenedor.find('.ofertas-grid').prepend(nuevaOferta);
            } else {
                contenedor.find('.ofertas-grid').append(nuevaOferta);
            }
            nuevaOferta.fadeIn(400);
        }
    });

    ofertasActuales.each(function () {
        const idOferta = $(this).data('oferta-id');
        const existeEnNuevas = tempDiv.find(`.oferta-card[data-oferta-id="${idOferta}"]`).length > 0;

        if (!existeEnNuevas) {
            $(this).fadeOut(300, function () {
                $(this).remove();
            });
        }
    });
}

function mostrarCargandoSutil() {
    const contenedor = $('#contenedor-ofertas');

    if ($('.loading-indicator').length === 0) {
        $('body').append(`
            <div class="loading-indicator">
                <i class="fa-solid fa-sync fa-spin"></i>
            </div>
        `);

        setTimeout(() => {
            $('.loading-indicator').fadeOut(200, function () {
                $(this).remove();
            });
        }, 1000);
    }
}


function verDetalleOferta(idVacante, Postulado = false) {
    $.ajax({
        url: '/Egresado/ObtenerDetalleOferta',
        data: { idVacante: idVacante },
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            if (response.success && response.data) {
                mostrarModalDetalle(response.data, Postulado);
            }
        }
    });
}

function mostrarModalDetalle(oferta, Postulado = false) {
    const salario = oferta.salario_confidencial
        ? '<span class="badge bg-secondary">Confidencial</span>'
        : `$${formatearNumero(oferta.salario_min)} - $${formatearNumero(oferta.salario_max)}`;

    const estrellas = generarEstrellasMostrar(oferta.empresa?.Puntuacion || 0);

    const botonPostular = Postulado
        ? `<button type="button" class="btn btn-primary" disabled data-bs-toggle="tooltip" data-bs-placement="top" title="Ya te has postulado a esta vacante">
                <i class="fa-solid fa-check"></i> Ya estás postulado
           </button>`
        : `<button type="button" class="btn btn-primary" onclick="postularOferta(${oferta.id_vacante})">
                <i class="fa-solid fa-paper-plane"></i> Postularme
           </button>`;

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
                            <button type="button" class="btn btn-sm btn-outline-warning" onclick="calificarEmpresa(${oferta.empresa?.id_empresa}, '${oferta.empresa?.razon_social}', ${oferta.id_vacante})">
                                <i class="fa-solid fa-star"></i> Calificar empresa
                            </button>
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
                        ${botonPostular}
                    </div>
                </div>
            </div>
        </div>
    `;

    $('#modalDetalleOferta').remove();
    $('body').append(html);
    $('#modalDetalleOferta').modal('show');

    $('[data-bs-toggle="tooltip"]').tooltip();
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
function calificarEmpresa(idEmpresa, nombreEmpresa,idVacante) {
    let calificacionSeleccionada = 0;
    $('#modalDetalleOferta').modal('hide');
    Swal.fire({
        title: `Calificar a ${nombreEmpresa}`,
        html: `
            <div class="text-center mb-3">
                <p class="mb-3">Selecciona tu calificación:</p>
                <div class="rating-selector" style="font-size: 2rem; cursor: pointer;">
                    <i class="fa-regular fa-star" data-rating="1" onmouseover="hoverEstrellas(1)" onmouseout="resetEstrellas()" onclick="seleccionarEstrella(1)"></i>
                    <i class="fa-regular fa-star" data-rating="2" onmouseover="hoverEstrellas(2)" onmouseout="resetEstrellas()" onclick="seleccionarEstrella(2)"></i>
                    <i class="fa-regular fa-star" data-rating="3" onmouseover="hoverEstrellas(3)" onmouseout="resetEstrellas()" onclick="seleccionarEstrella(3)"></i>
                    <i class="fa-regular fa-star" data-rating="4" onmouseover="hoverEstrellas(4)" onmouseout="resetEstrellas()" onclick="seleccionarEstrella(4)"></i>
                    <i class="fa-regular fa-star" data-rating="5" onmouseover="hoverEstrellas(5)" onmouseout="resetEstrellas()" onclick="seleccionarEstrella(5)"></i>
                </div>
                <div class="mt-2">
                    <span id="rating-value" style="font-size: 1.2rem; font-weight: bold;">0.0</span>
                    <span class="text-muted"> de 5.0</span>
                </div>
            </div>
            <textarea id="comentario-calificacion" class="form-control mt-3" rows="3" placeholder="Escribe un comentario (opcional)..."></textarea>
        `,
        showCancelButton: true,
        confirmButtonText: 'Guardar calificación',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#ffc107',
        preConfirm: () => {
            if (calificacionSeleccionada === 0) {
                Swal.showValidationMessage('Por favor selecciona una calificación');
                return false;
            }
            return {
                puntuacion: calificacionSeleccionada,
                comentario: document.getElementById('comentario-calificacion').value
            };
        },
        didOpen: () => {
            window.calificacionTemp = 0;
            window.calificacionFinal = 0;

            window.hoverEstrellas = function (rating) {
                window.calificacionTemp = rating;
                actualizarEstrellas(rating);
            };

            window.resetEstrellas = function () {
                actualizarEstrellas(window.calificacionFinal);
            };

            window.seleccionarEstrella = function (rating) {
                window.calificacionFinal = rating;
                calificacionSeleccionada = rating;
                actualizarEstrellas(rating);
                document.getElementById('rating-value').textContent = rating.toFixed(1);
            };

            function actualizarEstrellas(rating) {
                const estrellas = document.querySelectorAll('.rating-selector i');
                estrellas.forEach((estrella, index) => {
                    if (index < rating) {
                        estrella.className = 'fa-solid fa-star text-warning';
                    } else {
                        estrella.className = 'fa-regular fa-star text-muted';
                    }
                });
            }
        }
    }).then((result) => {
        if (result.isConfirmed) {
            guardarCalificacion(idEmpresa, result.value.puntuacion, result.value.comentario, idVacante);
        } else {
            $('#modalDetalleOferta').modal('show');
        }
    });
}

function guardarCalificacion(idEmpresa, puntuacion, comentario,idVacante) {
    $.ajax({
        url: '/Egresado/GuardarCalificacionEmpresa',
        type: 'POST',
        data: {
            idEmpresa: idEmpresa,
            puntuacion: puntuacion,
            comentario: comentario
        },
        success: function (response) {
            if (response.success) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Calificación guardada!',
                    text: response.message,
                    timer: 2000,
                    showConfirmButton: false,
                    didClose: () => {
                        verDetalleOferta(idVacante);
                        cargarOfertas(true);
                    }
                });

            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: response.message || 'No se pudo guardar la calificación'
                });
            }
        },
        error: function () {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ocurrió un error al guardar la calificación'
            });
        }
    });
}
function formatearNumero(num) {
    return new Intl.NumberFormat('es-SV').format(num);
}

function truncarTexto(texto, maxLength) {
    if (!texto) return 'Sin descripción';
    return texto.length > maxLength ? texto.substring(0, maxLength) + '...' : texto;
}

function calcularDiasDesde(fecha) {
    if (!fecha) return 'Fecha no válida';

    const match = /\/Date\((\d+)\)\//.exec(fecha);
    if (!match) return 'Fecha no válida';

    const fechaPub = new Date(parseInt(match[1], 10));
    const hoy = new Date();

    const diffMs = hoy - fechaPub;
    const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (dias === 0) return 'Hoy';
    if (dias === 1) return '1 día';
    if (dias < 7) return dias + ' días';
    if (dias < 30) return Math.floor(dias / 7) + ' semanas';
    return Math.floor(dias / 30) + ' meses';
}

function calcularDiasHasta(fecha) {
    if (!fecha) return { texto: 'Fecha no válida', urgente: false };

    const match = /\/Date\((\d+)\)\//.exec(fecha);
    if (!match) return { texto: 'Fecha no válida', urgente: false };

    const hoy = new Date();
    const fechaCierre = new Date(parseInt(match[1], 10));
    const dias = Math.floor((fechaCierre - hoy) / (1000 * 60 * 60 * 24));

    if (dias < 0) return { texto: 'Cerrada', urgente: true };
    if (dias === 0) return { texto: 'Cierra hoy', urgente: true };
    if (dias === 1) return { texto: 'Cierra mañana', urgente: true };
    if (dias <= 3) return { texto: `Cierra en ${dias} días`, urgente: true };
    if (dias <= 7) return { texto: `Cierra en ${dias} días`, urgente: false };
    return { texto: `Cierra en ${Math.floor(dias / 7)} semanas`, urgente: false };
}
function obtenerClaseEstado(estado) {
    const estados = {
        'Activo': 'bg-success',
        'Pendiente': 'bg-warning',
        'Cerrado': 'bg-secondary',
        'Pausado': 'bg-info'
    };
    return estados[estado] || 'bg-primary';
}

function mostrarMensaje(mensaje, tipo) {
    const contenedor = $('#contenedor-ofertas');
    contenedor.html(`
        <div class="alert alert-${tipo} text-center">
            <i class="fa-solid fa-${tipo === 'danger' ? 'exclamation-triangle' : 'info-circle'} fa-2x mb-3"></i>
            <p class="mb-0">${mensaje}</p>
        </div>
    `);
}

function postularOferta(idVacante) {
    swal.fire({
        title: 'Enviando postulación',
        text: 'Por favor, espere mientras procesamos su solicitud...',
        allowOutsideClick: false,
        didOpen: () => {
            swal.showLoading();
        }
    });

    $.ajax({
        url: '/Egresado/PostularOferta',
        data: { idVacante: idVacante },
        type: 'POST',
        dataType: 'json',
        success: function (response) {
            swal.close();
            if (response.success) {
                $('#modalDetalleOferta').modal('hide');
                swal.fire({
                    title: 'Felicidades te has postulado exitosamente!!',
                    icon: 'success',
                    text: response.message,
                    confirmButtonText: 'Aceptar'
                }).then(() => {
                    cargarOfertas(true);
                });
            } else {
                swal.fire({
                    title: 'Error',
                    icon: 'error',
                    text: response.message || 'No se pudo hacer la postulación a la oferta'
                });
            }
        },
        error: function (error) {
            swal.close();
            swal.fire({
                title: 'Error',
                icon: 'error',
                text: 'Opps... ocurrió un error al procesar la solicitud. Intente nuevamente.'
            });
            console.error('Error en postularOferta:', error);
        }
    });
}
function hacerModalArrastrable() {
    const modal = $(modalDraggable);
    const header = modal.find('.modal-header-drag');
    let startX, startY, startLeft, startTop;

    header.on('mousedown', function (e) {
        if (isMaximized || isMinimized || $(e.target).closest('.modal-controls').length) return;

        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        startLeft = parseInt(modal.css('left'), 10);
        startTop = parseInt(modal.css('top'), 10);

        $(document).on('mousemove.modalDrag', function (e) {
            if (isDragging) {
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                modal.css({
                    left: startLeft + dx + 'px',
                    top: startTop + dy + 'px'
                });
            }
        });

        $(document).on('mouseup.modalDrag', function () {
            isDragging = false;
            $(document).off('mousemove.modalDrag mouseup.modalDrag');
        });
    });
}

function configurarControlesModal() {
    $('#minimizeModal').on('click', function () {
        const modal = $(modalDraggable);
        modal.removeClass('animate__bounceIn animate__zoomIn animate__backInRight')
            .addClass('animate__backOutRight');
        if (!isMinimized) {
            modal.one('animationend', function () {
                modal.hide();
                crearIconoFlotante();
                isMinimized = true;
                $('body').css('overflow', 'auto');
            });            
        } else {
            restaurarDesdeIcono();
        }
    });

    $('#maximizeModal').on('click', function () {
        const modal = $(modalDraggable);
        const btn = $(this).find('i');
        modal.removeClass('animate__backOutRight animate__backInRight');
        if (!isMaximized) {
            modal.removeClass('animate__bounceIn').addClass('animate__zoomIn');
            originalState = {
                width: modal.width(),
                height: modal.height(),
                top: modal.css('top'),
                left: modal.css('left')
            };

            modal.addClass('maximized');
            $('body').css('overflow', 'hidden'); 
            btn.removeClass('fa-expand').addClass('fa-compress');
            isMaximized = true;
        } else {
            modal.removeClass('animate__zoomIn').addClass('animate__bounceIn');
            modal.removeClass('maximized');
            modal.css({
                width: originalState.width,
                height: originalState.height,
                top: originalState.top,
                left: originalState.left,
                right: 'auto',
                bottom: 'auto'
            });
            $('body').css('overflow', 'auto');
            btn.removeClass('fa-compress').addClass('fa-expand');
            isMaximized = false;
        }
    });

    $('#closeModal').on('click', function () {
        const modal = $(modalDraggable);
        modal.removeClass('animate__bounceIn animate__zoomIn animate__backInRight')
            .addClass('animate__backOutRight');
        modal.one('animationend', function () {
            modal.hide();
            eliminarIconoFlotante();
            $('body').css('overflow', 'auto');
            isMaximized = false;
            isMinimized = false;
        });        
    });
}

function crearIconoFlotante() {
    eliminarIconoFlotante();
    floatingIcon = $(`
        <div class="floating-icon" title="Restaurar ventana">
            <i class="fa-solid fa-briefcase"></i>
        </div>
    `);
    $('body').append(floatingIcon);
    floatingIcon.on('click', restaurarDesdeIcono);
}

function eliminarIconoFlotante() {
    if (floatingIcon) {
        floatingIcon.remove();
        floatingIcon = null;
    }
}

function restaurarDesdeIcono() {
    const modal = $(modalDraggable);
    modal.removeClass('animate__backOutRight').addClass('animate__backInRight').show();
    if (isMaximized) {
        modal.addClass('maximized');
        $('#maximizeModal i').removeClass('fa-expand').addClass('fa-compress');
        $('body').css('overflow', 'hidden');
    } else {
        modal.removeClass('maximized');
        if (originalState.width) {
            modal.css({
                width: originalState.width,
                height: originalState.height,
                top: originalState.top,
                left: originalState.left,
                right: 'auto',
                bottom: 'auto'
            });
        }
        $('#maximizeModal i').removeClass('fa-compress').addClass('fa-expand');
        $('body').css('overflow', 'auto');
    }
    cargarOfertas();
    eliminarIconoFlotante();
    isMinimized = false;
}
(function () {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('InputCV');
    const maxSize = 5 * 1024 * 1024;

    function preventDefault(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(evt => {
        dropZone.addEventListener(evt, preventDefault, false);
    });

    dropZone.addEventListener('dragover', function () {
        dropZone.classList.add('dragover');
    }, false);

    dropZone.addEventListener('dragleave', function () {
        dropZone.classList.remove('dragover');
    }, false);

    dropZone.addEventListener('drop', function (e) {
        dropZone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleFile(files[0]);
        }
    }, false);

    dropZone.addEventListener('click', function () {
        fileInput.click();
    }, false);

    fileInput.addEventListener('change', function () {
        if (fileInput.files && fileInput.files.length > 0) {
            handleFile(fileInput.files[0]);
        }
    }, false);

    function resetearCV() {
        fileInput.value = '';

        if (window.currentCVFile) {
            delete window.currentCVFile;
        }

        const cvContainer = document.getElementById('cv-container');
        if (cvContainer) {
            cvContainer.innerHTML = '';
        }

        const dropZoneText = document.getElementById('dropZoneText');
        if (dropZoneText) {
            dropZoneText.textContent = 'Arrastra tu CV (PDF) aquí o haz clic';
        }

    }

    function handleFile(file) {
        const name = file.name || '';
        const isPdf = file.type === 'application/pdf' || name.toLowerCase().endsWith('.pdf');

        if (!isPdf) {
            Swal.fire({
                icon: 'error',
                title: 'Formato no válido',
                text: 'Solo se permiten archivos en formato PDF.',
                confirmButtonColor: '#d33'
            });
            resetearCV();
            return;
        }

        if (file.size > maxSize) {
            Swal.fire({
                icon: 'warning',
                title: 'Archivo demasiado grande',
                text: 'El archivo supera el tamaño máximo permitido de 5 MB.',
                confirmButtonColor: '#f0ad4e'
            });
            resetearCV();
            return;
        }

        const pesoEl = document.getElementById('CVPeso');
        const fechaEl = document.getElementById('CVFecha');
        const dropZoneText = document.getElementById('dropZoneText');

        if (pesoEl) pesoEl.textContent = (file.size / 1024).toFixed(1) + ' KB';
        if (fechaEl) fechaEl.textContent = new Date().toLocaleDateString();
        if (dropZoneText) dropZoneText.textContent = `Archivo seleccionado: ${name}`;

        window.currentCVFile = file;

        try {
            const url = URL.createObjectURL(file);
            const cvContainer = document.getElementById('cv-container');
            if (cvContainer) {
                cvContainer.innerHTML = `
                    <div class="text-center mb-2">
                        <a class="btn btn-sm btn-outline-secondary" href="${url}" target="_blank">
                            Abrir PDF en nueva pestaña
                        </a>
                        <button class="btn btn-sm btn-outline-danger ms-2" onclick="window.resetearCVTemporal()">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                    </div>
                    <embed src="${url}" type="application/pdf" width="100%" height="600px" />
                `;
            }
        } catch (err) {
            console.error("Error al mostrar el PDF:", err);
        }

        Swal.fire({
            icon: 'success',
            title: 'CV cargado correctamente',
            html: `
                <p><strong>${name}</strong> está listo para subir.</p>                
            `,
            confirmButtonColor: '#28a745'
        }).then(() => {
            Swal.fire({
                icon: 'question',
                title: '¿Estás seguro de reemplazar tu CV?',
                text: '¡Esta acción no se podrá deshacer!',
                confirmButtonColor: '#28a745',
                cancelButtonColor: '#d33',
                showCancelButton: true,
                confirmButtonText: 'Sí, Reemplazar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    const formData = new FormData();
                    formData.append('NuevoCV', file);

                    Swal.fire({
                        title: 'Subiendo CV...',
                        text: 'Por favor espera',
                        allowOutsideClick: false,
                        didOpen: () => {
                            Swal.showLoading();
                        }
                    });

                    $.ajax({
                        url: '/Egresado/ReemplazarCV',
                        type: 'POST',
                        data: formData,
                        processData: false,
                        contentType: false,
                        dataType: 'json',
                        success: function (response) {
                            if (response.success) {
                                $('#NombreCV').text(response.nombre_archivo);

                                $('#VerCV').attr('data-ruta', response.ruta_archivo);
                                $('#VerCV').data('ruta', response.ruta_archivo);

                                $('#DescargarCV').attr('data-ruta', response.ruta_archivo);
                                $('#DescargarCV').attr('data-nombre', response.nombre_archivo);
                                $('#DescargarCV').data('ruta', response.ruta_archivo);
                                $('#DescargarCV').data('nombre', response.nombre_archivo);

                                resetearCV();

                                Swal.fire({
                                    title: 'CV Actualizado correctamente',
                                    text: response.message,
                                    icon: 'success',
                                    confirmButtonColor: '#28a745'
                                });
                            } else {
                                Swal.fire({
                                    title: 'Oops Ocurrió un error',
                                    text: response.message,
                                    icon: 'error',
                                    confirmButtonColor: '#d33'
                                });
                            }
                        },
                        error: function (error) {
                            Swal.fire({
                                title: 'Oops Ocurrió un error',
                                text: 'No se pudo subir el archivo',
                                icon: 'error',
                                confirmButtonColor: '#d33'
                            });
                        }
                    });
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    resetearCV();
                    Swal.fire({
                        title: 'Cancelado',
                        text: 'No se realizaron cambios',
                        icon: 'info',
                        confirmButtonColor: '#3085d6'
                    });
                }
            });
        });
    }

    window.resetearCVTemporal = resetearCV;
})();



$('#editarPerfil').on('click', function () {
    $('#VerMiInformacion').modal('show');
    $('#loadingSpinner').show();

    $.ajax({
        url: '/Egresado/ObtenerInformacion',
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            if (response.success) {
                $('#loadingSpinner').hide();
                datosEgresado = response.data;
                renderizarInformacion(response.data);
            } else {
                $('#VerMiInformacion').modal('hide');
                Swal.fire({
                    title: 'Error',
                    text: response.message,
                    icon: 'error',
                    confirmButtonColor: '#d33'
                });
            }
        },
        error: function (xhr, status, error) {
            $('#VerMiInformacion').modal('hide');
            Swal.fire({
                title: 'Oops! Ocurrió un error',
                text: 'No se pudo cargar la información',
                icon: 'error',
                confirmButtonColor: '#d33'
            });
        }
    });
});

function renderizarInformacion(data) {
    let fechaGraduacion = formatearFecha(data.fecha_graduacion);

    let html = `
        <div class="container-fluid">
            <div class="card mb-3 border border-dark-subtle">
                <div class="card-header card-infogeneral d-flex justify-content-between align-items-center">
                    <h6 class="mb-0"><i class="fas fa-user"></i> Información Personal</h6>
                    <button class="btn btn-sm btn-light" onclick="abrirEditarInformacionPersonal()">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <p><strong>Nombres:</strong> ${data.nombres}</p>
                            <p><strong>Apellidos:</strong> ${data.apellidos}</p>
                            <p><strong>Documento:</strong> ${data.numero_documento}</p>
                        </div>
                        <div class="col-md-6">
                            <p><strong>Email:</strong> ${data.email}</p>
                            <p><strong>Carrera:</strong> ${data.nombre_carrera}</p>
                            <p><strong>Fecha Graduación:</strong> ${fechaGraduacion}</p>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <p><strong>Promedio Académico:</strong> ${data.promedio_academico || 'No disponible'}</p>
                        </div>
                        <div class="col-md-6">
                            <p><strong>Puntuación Global:</strong> ${data.puntuacion_global || 'Sin puntuacion'}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card mb-3 border border-dark-subtle">
                <div class="card-header card-infogeneral  d-flex justify-content-between align-items-center">
                    <h6 class="mb-0"><i class="fas fa-language"></i> Idiomas</h6>
                    <button class="btn btn-sm btn-light" onclick="abrirEditarIdiomas()">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                </div>
                <div class="card-body">
                    ${data.Idiomas && data.Idiomas.length > 0 ?
            `<div class="table-responsive">
                            <table class="table table-striped table-sm">
                                <thead>
                                    <tr>
                                        <th>Idioma</th>
                                        <th>Nivel</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${data.Idiomas.map(idioma => `
                                        <tr>
                                            <td>${idioma.nombre}</td>
                                            <td>${idioma.nivel}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>`
            : '<p class="text-muted">No hay idiomas registrados</p>'
        }
                </div>
            </div>

            <div class="card mb-3 border border-dark-subtle">
                <div class="card-header card-infogeneral d-flex justify-content-between align-items-center">
                    <h6 class="mb-0"><i class="fas fa-certificate"></i> Certificaciones</h6>
                    <button class="btn btn-sm btn-light" onclick="abrirEditarCertificaciones()">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                </div>
                <div class="card-body">
                    ${data.Certificaciones && data.Certificaciones.length > 0 ?
            `<div class="table-responsive">
                            <table class="table table-striped table-sm">
                                <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Entidad Emisora</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${data.Certificaciones.map(cert => `
                                        <tr>
                                            <td>${cert.nombre}</td>
                                            <td>${cert.entidad_emisora}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>`
            : '<p class="text-muted">No hay certificaciones registradas</p>'
        }
                </div>
            </div>

            <div class="card mb-3 border border-dark-subtle">
                <div class="card-header card-infogeneral d-flex justify-content-between align-items-center">
                    <h6 class="mb-0"><i class="fas fa-cog"></i> Preferencias Laborales</h6>
                    <button class="btn btn-sm btn-light" onclick="abrirEditarPreferencias()">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                </div>
                <div class="card-body">
                    ${data.Preferencias ?
            `<div class="row">
                            <div class="col-md-6">
                                <p><strong>Modalidad Preferida:</strong> ${data.Preferencias.modalidad_preferida || 'No especificada'}</p>
                                <p><strong>Jornada Preferida:</strong> ${data.Preferencias.jornada_preferida || 'No especificada'}</p>
                                <p><strong>Área de Interés:</strong> ${data.Preferencias.area_interes || 'No especificada'}</p>
                            </div>
                            <div class="col-md-6">
                                <p><strong>Ubicación Preferida:</strong> ${data.Preferencias.ubicacion_preferida || 'No especificada'}</p>
                                <p><strong>Salario Mínimo:</strong> ${data.Preferencias.salario_min || '0'}</p>
                                <p><strong>Salario Máximo:</strong> ${data.Preferencias.salario_max || '0'}</p>
                            </div>
                        </div>`
            : '<p class="text-muted">No hay preferencias registradas</p>'
        }
                </div>
            </div>

            <div class="card mb-3 border border-dark-subtle">
                <div class="card-header card-infogeneral d-flex justify-content-between align-items-center">
                    <h6 class="mb-0"><i class="fas fa-star"></i> Habilidades Principales</h6>
                    <button class="btn btn-sm btn-light" onclick="abrirEditarHabilidades()">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                </div>
                <div class="card-body">
                    ${data.Habilidades && data.Habilidades.habilidades_principales ?
            `<p style="white-space: pre-wrap;">${data.Habilidades.habilidades_principales}</p>`
            : '<p class="text-muted">No hay habilidades registradas</p>'
        }
                </div>
            </div>
        </div>
    `;

    $('#modalBodyContent').html(html);
}



function abrirEditarInformacionPersonal() {
    if (!datosEgresado) return;

    $('#edit_id_egresado').val(datosEgresado.id_egresado);
    $('#edit_numero_documento').val(datosEgresado.numero_documento);
    $('#edit_nombres').val(datosEgresado.nombres);
    $('#edit_apellidos').val(datosEgresado.apellidos);
    $('#edit_telefono').val(datosEgresado.telefono || '');

    if (datosEgresado.fecha_graduacion) {
        const fechaFormateada = formatearFecha(datosEgresado.fecha_graduacion);
        $('#edit_fecha_graduacion').val(formatearFechaParaInput(fechaFormateada));
    }

    $('#edit_promedio_academico').val(datosEgresado.promedio_academico || '');

    $('#EditarInformacionPersonal').modal('show');
}
function formatearFechaParaInput(fechaString) {
    let partes = fechaString.split('/');
    if (partes.length === 3) {
        let dia = partes[0].padStart(2, '0');
        let mes = partes[1].padStart(2, '0');
        let año = partes[2];
        return `${año}-${mes}-${dia}`;
    }
    return fechaString; 
}

function guardarInformacionPersonal() {
    const datos = {
        numero_documento: $('#edit_numero_documento').val(),
        nombres: $('#edit_nombres').val(),
        apellidos: $('#edit_apellidos').val(),
        telefono: $('#edit_telefono').val(),
        fecha_graduacion: $('#edit_fecha_graduacion').val(),
        promedio_academico: parseFloat($('#edit_promedio_academico').val()) || null
    };

    $.ajax({
        url: '/Egresado/ActualizarInformacionPersonal',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(datos),
        success: function (response) {
            if (response.success) {
                $('#EditarInformacionPersonal').modal('hide');
                Swal.fire({
                    title: '¡Éxito!',
                    text: response.message,
                    icon: 'success',
                    confirmButtonColor: '#28a745'
                }).then(() => {
                    ObtenerDatos();
                    $('#editarPerfil').click();
                });
            } else {
                Swal.fire({
                    title: 'Error',
                    text: response.message,
                    icon: 'error',
                    confirmButtonColor: '#d33'
                });
            }
        },
        error: function (xhr, status, error) {
            Swal.fire({
                title: 'Error',
                text: 'No se pudo actualizar la información',
                icon: 'error',
                confirmButtonColor: '#d33'
            });
        }
    });
}


function abrirEditarIdiomas() {
    if (!datosEgresado) return;

    $.ajax({
        url: '/Egresado/ObteneIdiomasDisponibles',
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            if (response.success) {
                idiomasDisponibles = response.data;
                cargarIdiomasEnTabla();
                ObtenerDatos();
                $('#EditarIdiomas').modal('show');
            } else {
                Swal.fire({
                    title: 'Error',
                    text: 'No se pudieron cargar los idiomas disponibles',
                    icon: 'error',
                    confirmButtonColor: '#d33'
                });
            }
        },
        error: function () {
            Swal.fire({
                title: 'Error',
                text: 'No se pudieron cargar los idiomas disponibles',
                icon: 'error',
                confirmButtonColor: '#d33'
            });
        }
    });
}

function cargarIdiomasEnTabla() {
    $('#idiomasBody').empty();

    if (datosEgresado.Idiomas && datosEgresado.Idiomas.length > 0) {
        datosEgresado.Idiomas.forEach(idioma => {
            agregarIdiomaFila(idioma);
        });
    }
}

function agregarIdiomaFila(idioma = null) {
    const idUnico = 'idioma_' + Date.now() + '_' + Math.random();

    let opcionesIdiomas = '<option value="">Seleccione un idioma...</option>';
    idiomasDisponibles.forEach(i => {
        const selected = idioma && i.id_idioma === idioma.id_idioma ? 'selected' : '';
        opcionesIdiomas += `<option value="${i.id_idioma}" ${selected}>${i.nombre}</option>`;
    });

    const nivelSeleccionado = idioma ? idioma.nivel : '';

    const fila = `
        <tr data-id="${idUnico}" data-id-original="${idioma ? idioma.id_eg_idioma : 0}">
            <td>
                <select class="form-select form-select-sm idioma-select" name="id_idioma">
                    ${opcionesIdiomas}
                </select>
            </td>
            <td>
                <select class="form-select form-select-sm" name="nivel">
                    <option value="">Nivel</option>
                    <option value="A1" ${nivelSeleccionado === 'A1' ? 'selected' : ''}>A1</option>
                    <option value="A2" ${nivelSeleccionado === 'A2' ? 'selected' : ''}>A2</option>
                    <option value="B1" ${nivelSeleccionado === 'B1' ? 'selected' : ''}>B1</option>
                    <option value="B2" ${nivelSeleccionado === 'B2' ? 'selected' : ''}>B2</option>
                    <option value="C1" ${nivelSeleccionado === 'C1' ? 'selected' : ''}>C1</option>
                    <option value="C2" ${nivelSeleccionado === 'C2' ? 'selected' : ''}>C2</option>
                    <option value="Nativo" ${nivelSeleccionado === 'Nativo' ? 'selected' : ''}>Nativo</option>
                </select>
            </td>
            <td>
                <button type="button" class="btn btn-danger btn-sm" onclick="eliminarIdiomaFila('${idUnico}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `;

    $('#idiomasBody').append(fila);
}

function eliminarIdiomaFila(id) {
    $(`tr[data-id="${id}"]`).remove();
}

function guardarIdiomas() {
    const idiomas = [];
    let valido = true;

    $('#idiomasBody tr').each(function () {
        const idIdioma = parseInt($(this).find('select[name="id_idioma"]').val());
        const nivel = $(this).find('select[name="nivel"]').val();
        const idOriginal = parseInt($(this).attr('data-id-original'));

        if (!idIdioma || !nivel) {
            valido = false;
            return false;
        }

        const idioma = {
            id_idioma: idIdioma,
            nivel: nivel
        };

        if (idOriginal > 0) {
            idioma.id_eg_idioma = idOriginal;
        }

        idiomas.push(idioma);
    });

    if (!valido) {
        Swal.fire({
            title: 'Validación',
            text: 'Por favor complete todos los campos de idiomas',
            icon: 'warning',
            confirmButtonColor: '#ffc107'
        });
        return;
    }

    $.ajax({
        url: '/Egresado/ActualizarIdiomas',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(idiomas),
        success: function (response) {
            if (response.success) {
                $('#EditarIdiomas').modal('hide');
                Swal.fire({
                    title: '¡Éxito!',
                    text: response.message,
                    icon: 'success',
                    confirmButtonColor: '#28a745'
                }).then(() => {
                    ObtenerDatos();
                    $('#editarPerfil').click();
                });
            } else {
                Swal.fire({
                    title: 'Error',
                    text: response.message,
                    icon: 'error',
                    confirmButtonColor: '#d33'
                });
            }
        },
        error: function () {
            Swal.fire({
                title: 'Error',
                text: 'No se pudieron actualizar los idiomas',
                icon: 'error',
                confirmButtonColor: '#d33'
            });
        }
    });
}


function abrirEditarCertificaciones() {
    if (!datosEgresado) return;

    cargarCertificacionesEnTabla();
    $('#EditarCertificaciones').modal('show');
}

function cargarCertificacionesEnTabla() {
    $('#certificacionesBody').empty();

    if (datosEgresado.Certificaciones && datosEgresado.Certificaciones.length > 0) {
        datosEgresado.Certificaciones.forEach(cert => {
            agregarCertificacionFila(cert);
        });
    }
}

function agregarCertificacionFila(cert = null) {
    const idUnico = 'cert_' + Date.now() + '_' + Math.random();

    const fila = `
        <tr data-id="${idUnico}" data-id-original="${cert ? cert.id_certificacion : 0}">
            <td>
                <input type="text" class="form-control form-control-sm" name="nombre" 
                       value="${cert ? cert.nombre : ''}" placeholder="Nombre de la certificación" required>
            </td>
            <td>
                <input type="text" class="form-control form-control-sm" name="entidad_emisora" 
                       value="${cert ? cert.entidad_emisora : ''}" placeholder="Entidad emisora" required>
            </td>
            <td>
                <button type="button" class="btn btn-danger btn-sm" onclick="eliminarCertificacionFila('${idUnico}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `;

    $('#certificacionesBody').append(fila);
}

function eliminarCertificacionFila(id) {
    $(`tr[data-id="${id}"]`).remove();
}

function guardarCertificaciones() {
    const certificaciones = [];
    let valido = true;

    $('#certificacionesBody tr').each(function () {
        const nombre = $(this).find('input[name="nombre"]').val().trim();
        const entidadEmisora = $(this).find('input[name="entidad_emisora"]').val().trim();
        const idOriginal = parseInt($(this).attr('data-id-original'));

        if (!nombre || !entidadEmisora) {
            valido = false;
            return false;
        }

        const certificacion = {
            nombre: nombre,
            entidad_emisora: entidadEmisora
        };

        if (idOriginal > 0) {
            certificacion.id_certificacion = idOriginal;
        }

        certificaciones.push(certificacion);
    });

    if (!valido) {
        Swal.fire({
            title: 'Validación',
            text: 'Por favor complete todos los campos de certificaciones',
            icon: 'warning',
            confirmButtonColor: '#ffc107'
        });
        return;
    }

    $.ajax({
        url: '/Egresado/ActualizarCertificados',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(certificaciones),
        success: function (response) {
            if (response.success) {
                $('#EditarCertificaciones').modal('hide');
                Swal.fire({
                    title: '¡Éxito!',
                    text: response.message,
                    icon: 'success',
                    confirmButtonColor: '#28a745'
                }).then(() => {
                    ObtenerDatos();
                    $('#editarPerfil').click();
                });
            } else {
                Swal.fire({
                    title: 'Error',
                    text: response.message,
                    icon: 'error',
                    confirmButtonColor: '#d33'
                });
            }
        },
        error: function () {
            Swal.fire({
                title: 'Error',
                text: 'No se pudieron actualizar las certificaciones',
                icon: 'error',
                confirmButtonColor: '#d33'
            });
        }
    });
}

function abrirEditarHabilidades() {
    if (!datosEgresado || !datosEgresado.Habilidades) {
        Swal.fire({
            title: 'Información',
            text: 'No se encontró información de habilidades',
            icon: 'info',
            confirmButtonColor: '#3085d6'
        });
        return;
    }

    const habilidades = datosEgresado.Habilidades;

    $('#habilidades_id_cv').val(habilidades.id_cv || '');
    $('#habilidades_principales').val(habilidades.habilidades_principales || '');

    $('#EditarHabilidades').modal('show');
}

function guardarHabilidades() {
    const habilidades = $('#habilidades_principales').val().trim();

    if (!habilidades) {
        Swal.fire({
            title: 'Validación',
            text: 'Por favor ingrese al menos una habilidad',
            icon: 'warning',
            confirmButtonColor: '#ffc107'
        });
        return;
    }

    $.ajax({
        url: '/Egresado/ActualizarHabilidades',
        type: 'POST',
        data: { habilidades: habilidades },
        success: function (response) {
            if (response.success) {
                $('#EditarHabilidades').modal('hide');
                Swal.fire({
                    title: '¡Éxito!',
                    text: response.message,
                    icon: 'success',
                    confirmButtonColor: '#28a745'
                }).then(() => {
                    ObtenerDatos();
                    $('#editarPerfil').click();
                });
            } else {
                Swal.fire({
                    title: 'Error',
                    text: response.message,
                    icon: 'error',
                    confirmButtonColor: '#d33'
                });
            }
        },
        error: function () {
            Swal.fire({
                title: 'Error',
                text: 'No se pudieron actualizar las habilidades',
                icon: 'error',
                confirmButtonColor: '#d33'
            });
        }
    });
}

function abrirEditarPreferencias() {
    if (!datosEgresado || !datosEgresado.Preferencias) return;

    const pref = datosEgresado.Preferencias;

    $('#pref_id_pref').val(pref.id_pref);
    $('#pref_modalidad_preferida').val(pref.modalidad_preferida || '');
    $('#pref_jornada_preferida').val(pref.jornada_preferida || '');
    $('#pref_area_interes').val(pref.area_interes || '');
    $('#pref_ubicacion_preferida').val(pref.ubicacion_preferida || '');
    $('#pref_salario_min').val(pref.salario_min || '');
    $('#pref_salario_max').val(pref.salario_max || '');

    $('#EditarPreferencias').modal('show');
}

function guardarPreferencias() {
    const datos = {
        id_pref: parseInt($('#pref_id_pref').val()),
        modalidad_preferida: $('#pref_modalidad_preferida').val(),
        jornada_preferida: $('#pref_jornada_preferida').val(),
        area_interes: $('#pref_area_interes').val(),
        ubicacion_preferida: $('#pref_ubicacion_preferida').val(),
        salario_min: parseFloat($('#pref_salario_min').val()) || null,
        salario_max: parseFloat($('#pref_salario_max').val()) || null
    };

    $.ajax({
        url: '/Egresado/ActualizarPreferencia',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(datos),
        success: function (response) {
            if (response.success) {
                $('#EditarPreferencias').modal('hide');
                Swal.fire({
                    title: '¡Éxito!',
                    text: response.message,
                    icon: 'success',
                    confirmButtonColor: '#28a745'
                }).then(() => {
                    ObtenerDatos();
                    $('#editarPerfil').click();
                });
            } else {
                Swal.fire({
                    title: 'Error',
                    text: response.message,
                    icon: 'error',
                    confirmButtonColor: '#d33'
                });
            }
        },
        error: function () {
            Swal.fire({
                title: 'Error',
                text: 'No se pudieron actualizar las preferencias',
                icon: 'error',
                confirmButtonColor: '#d33'
            });
        }
    });
}