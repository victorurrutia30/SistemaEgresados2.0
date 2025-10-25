const ws = new WebSocket(`ws://${window.location.hostname}:9999/?token=${JWT_TOKEN}`);

ws.onmessage = (event) => {
    Toastify({
        text: `
            <div style="display: flex; align-items: center; gap: 14px;">
                <div style="
                    width: 10px; 
                    height: 10px; 
                    background: #10b981; 
                    border-radius: 50%; 
                    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
                    animation: pulse 2s ease-in-out infinite;
                    flex-shrink: 0;
                "></div>
                <div style="flex: 1;">
                    <div style="
                        font-weight: 600; 
                        font-size: 13px; 
                        margin-bottom: 3px;
                        color: #1f2937;
                        letter-spacing: 0.3px;
                    ">INFORMACION:</div>
                    <div style="
                        font-size: 14px; 
                        color: #4b5563;
                        font-weight: 500;
                    ">${event.data}</div>
                </div>
                <div style="
                    width: 32px;
                    height: 32px;
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
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
            border: "1px solid #e5e7eb",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        },
    }).showToast();
};

ws.onerror = (err) => {
    swal.fire({
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

function ObtenerDatos() {
    $.ajax({
        url: '/Egresado/DatosEgresado',
        type: 'GET',
        success: function (response) {
            console.log(response);
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
                <span class="text-muted small">Emitida por: ${certi.entidad_emisora}</span>
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