let trabaja = null;
var nivelExperiencia = null;
let hayDatosSinGuardar = false;
let emailGlobal = null;
let preguntasActuales = [];
hayDatosSinGuardar = false;
let idiomasDisponibles = [];
let idiomasSeleccionados = [];
let respuestasEncuesta = [];
let certificacionesAgregadas = [];
let datosCV = {
    archivo: null,
    experiencia: '',
    habilidades: '',
    ubicacion: '',
    area: ''
};
window.addEventListener('beforeunload', function (e) {
    if (hayDatosSinGuardar) {
        e.preventDefault();
        e.returnValue = ''; 
        return '¿Estás seguro de que deseas salir? Los datos ingresados se perderán.';
    }
});

$(document).ready(function () {
    $('#formEgresado input, #formEgresado select, #formEgresado textarea').on('input change', function () {
        hayDatosSinGuardar = true;
    });
    $(document).on('input change', '.pregunta-campo, #cvFile, #experienciaAnos, #habilidadesPrincipales', function () {
        hayDatosSinGuardar = true;
    });
    $('#welcomeModal').modal('show');

    $('#btnYes').click(function () {
        trabaja = true;
        $('#welcomeModal').modal('hide');
        abrirVerificacion();
    });

    $('#btnNo').click(function () {
        trabaja = false;
        $('#welcomeModal').modal('hide');
        abrirVerificacion();
    });
});

function abrirVerificacion() {
    $('#VerificacionIdentidad').modal('show');
    cargarCarreras();
}

function cargarCarreras() {
    $.ajax({
        url: '/Registrar/ObtenerCarreras',
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            if (response.success) {
                const select = $('#selectCarrera');
                select.empty().append('<option value="">Seleccione...</option>');
                $.each(response.data, function (i, carrera) {
                    select.append(`<option value="${carrera.id_carrera}">${carrera.nombre_carrera}</option>`);
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al cargar carreras: ' + response.message,
                    confirmButtonText: 'Aceptar'
                });
            }
        },
        error: function () {
            Swal.fire({
                icon: 'error',
                title: 'Error de conexión',
                text: 'Error al conectar con el servidor.',
                confirmButtonText: 'Aceptar'
            });
        }
    });
}

function validarContrasena(contrasena) {
    if (contrasena.length < 8) {
        return {
            valida: false,
            mensaje: 'La contraseña debe tener al menos 8 caracteres.'
        };
    }

    if (!/(?=.*[A-Z])/.test(contrasena)) {
        return {
            valida: false,
            mensaje: 'La contraseña debe contener al menos una letra mayúscula.'
        };
    }

    if (!/(?=.*\d)/.test(contrasena)) {
        return {
            valida: false,
            mensaje: 'La contraseña debe contener al menos un número.'
        };
    }

    if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(contrasena)) {
        return {
            valida: false,
            mensaje: 'La contraseña debe contener al menos un carácter especial (!@#$%^&* etc.).'
        };
    }

    return {
        valida: true,
        mensaje: 'Contraseña válida.'
    };
}

function validarCamposNumericos() {
    const promedio = parseFloat($('input[name="promedio_academico"]').val());
    if (promedio !== undefined && !isNaN(promedio)) {
        if (promedio < 6 || promedio > 10) {
            return {
                valido: false,
                mensaje: 'El promedio académico debe estar entre 6.00 y 10.00'
            };
        }
    }

    const anosExperiencia = parseFloat($('input[name="nivel_experiencia"]').val());
    if (trabaja) {
        if (anosExperiencia !== undefined && !isNaN(anosExperiencia) && anosExperiencia !== null && anosExperiencia !== '') {
            if (anosExperiencia === 0 || anosExperiencia < 0) {
                return {
                    valido: false,
                    mensaje: 'Si actualmente trabajas debes de ingresar un valor valido mayor a 0.'
                };
            }
            if (anosExperiencia > 50) {
                return {
                    valido: false,
                    mensaje: 'Los años de experiencia no pueden ser mayores a 50'
                };
            }
        }
    }
    else
    {
        if (anosExperiencia !== undefined && !isNaN(anosExperiencia)) {
            if (anosExperiencia < 0) {
                return {
                    valido: false,
                    mensaje: 'Los años de experiencia no pueden ser negativos'
                };
            }
            if (anosExperiencia > 50) {
                return {
                    valido: false,
                    mensaje: 'Los años de experiencia no pueden ser mayores a 50'
                };
            }
        }
    }

    nivelExperiencia = anosExperiencia;
    return { valido: true };
}

$(document).on('click', '#AddCertificaciones', function () {
    const nuevaCertificacionHtml = `
        <div class="input-group mb-2 certificacion-entry">
            <input type="text" name="nombre_certificacion" class="form-control nombre-certificacion" placeholder="Nombre de la certificación *" required />
            <input type="text" name="entidad_certificacion" class="form-control entidad-certificacion" placeholder="Entidad emisora (opcional)" />
            <button type="button" class="btn btn-danger btnRemoveCertificacion" title="Eliminar certificación">
                <i class="fas fa-trash-alt"></i>
            </button>
        </div>
    `;
    $('#certificacionesContainer').append(nuevaCertificacionHtml);
});
$(document).on('click', '.btnRemoveCertificacion', function () {
    const entry = $(this).closest('.certificacion-entry');
    const nombre = entry.find('.nombre-certificacion').val();
    const entidad = entry.find('.entidad-certificacion').val();
    certificacionesAgregadas = certificacionesAgregadas.filter(c =>
        !(c.nombre === nombre && c.entidad_emisora === entidad)
    );
    entry.remove();
});

function guardarCertificaciones() {
    certificacionesAgregadas = [];
    $('#certificacionesContainer .certificacion-entry').each(function () {
        const nombre = $(this).find('.nombre-certificacion').val().trim();
        const entidad = $(this).find('.entidad-certificacion').val().trim();
        if (nombre) {
            certificacionesAgregadas.push({
                nombre: nombre,
                entidad_emisora: entidad
            });
        }
    });
}


$('#formEgresado').on('submit', function (e) {
    e.preventDefault();
    
    const validacionNumericos = validarCamposNumericos();
    if (!validacionNumericos.valido) {
        Swal.fire({
            icon: 'error',
            title: 'Datos inválidos',
            text: validacionNumericos.mensaje,
            confirmButtonText: 'Aceptar'
        });
        return;
    }

    const contra = $('input[name="password_hash"]').val();
    const contra2 = $('#confirmarPSW').val();
    if (contra !== contra2) {
        Swal.fire({
            icon: 'error',
            title: 'Contraseñas no coinciden',
            text: 'Las contraseñas ingresadas no coinciden.',
            confirmButtonText: 'Aceptar'
        });
        return;
    }

    const validacionContra = validarContrasena(contra);
    if (!validacionContra.valida) {
        Swal.fire({
            icon: 'error',
            title: 'Contraseña inválida',
            text: validacionContra.mensaje,
            confirmButtonText: 'Aceptar'
        });
        return;
    }

    const formData = $(this).serializeArray();
    guardarCertificaciones();
    const data = {};
    formData.forEach(item => data[item.name] = item.value);
    data['Trabaja'] = trabaja;
    data['Certificaciones'] = certificacionesAgregadas;
    Swal.fire({
        title: 'Registrando...',
        text: 'Por favor espere',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    $.ajax({
        url: '/Registrar/RegistrarEgresado',
        type: 'POST',
        data: data,
        success: function (response) {
            Swal.close();

            if (response.success) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Registro exitoso!',
                    text: response.message,
                    confirmButtonText: 'Aceptar'
                }).then((result) => {
                    if (result.isConfirmed) {
                        $('#ConfirmarCodigoModal').modal('show');
                    }
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error en el registro',
                    text: 'Error: ' + response.message,
                    confirmButtonText: 'Aceptar'
                });
            }
        },
        error: function (xhr, status, error) {
            Swal.close();

            let mensajeError = 'Error al registrar el egresado.';

            if (xhr.responseJSON && xhr.responseJSON.message) {
                mensajeError += ' ' + xhr.responseJSON.message;
            }

            Swal.fire({
                icon: 'error',
                title: 'Error del servidor',
                text: mensajeError,
                confirmButtonText: 'Aceptar'
            });

            console.error('Error detallado:', error);
        }
    });
});
$('#btnVerificarCodigo').click(function () {
    const email = $('input[name="email"]').val();
    const codigo = $('#codigoVerificacion').val();

    if (codigo.trim() === '') {
        Swal.fire({
            icon: 'warning',
            title: 'Código requerido',
            text: 'Por favor ingrese el código que recibió en su correo.'
        });
        return;
    }

    $.ajax({
        url: '/Registrar/ValidarCodigo',
        type: 'POST',
        data: { email: email, codigo: codigo },
        success: function (response) {
            if (response.success) {
                emailGlobal = email;
                Swal.fire({
                    icon: 'success',
                    title: '¡Correo verificado!',
                    text: 'Tu cuenta ha sido autenticada correctamente.'
                }).then(() => {
                    $('#ConfirmarCodigoModal').modal('hide');
                    $('#VerificacionIdentidad').modal('hide');
                    $('#PreferenciasYPrivacidad').modal('show');
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: response.message
                });
            }
        },
        error: function () {
            Swal.fire({
                icon: 'error',
                title: 'Error del servidor',
                text: 'No se pudo validar el código.'
            });
        }
    });
});
$('#btnReenviarCodigo').click(function () {
    const email = $('input[name="email"]').val(); 

    $.ajax({
        url: '/Registrar/ReenviarCodigoVerificacion',
        type: 'POST',
        data: { email: email},
        success: function (response) {
            if (response.success) {                
                Swal.fire({
                    icon: 'success',
                    title: '¡Correo Enviado!',
                    text: response.message,
                    confirmButtonText: 'Aceptar'
                })
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: response.message
                });
            }
        },
        error: function () {
            Swal.fire({
                icon: 'error',
                title: 'Error del servidor',
                text: 'No se pudo validar el código.'
            });
        }
    });
});
$('#chkConsentimiento').change(function () {
    if ($(this).is(':checked')) {
        $('#btnGuardarPreferencias').prop('disabled', false);
    } else {
        $('#btnGuardarPreferencias').prop('disabled', true);
    }
});
$('#formPreferencias').on('submit', function (e) {
    e.preventDefault();

    if (!$('#chkConsentimiento').is(':checked')) {
        Swal.fire({
            icon: 'warning',
            title: 'Consentimiento requerido',
            text: 'Debe aceptar la política de privacidad para continuar.'
        });         
        return;
    }

    $.ajax({
        url: '/Registrar/RegistrarPreferencias',
        type: 'POST',
        data: { email: emailGlobal },
        success: function (response) {
            if (response.success) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Preferencias guardadas!',
                    text: response.message,
                    confirmButtonText: 'Aceptar'
                }).then(() => {
                    $('#PreferenciasYPrivacidad').modal('hide');
                    cargarPreguntas(trabaja);
                });               
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al guardar preferencias: ' + response.message,
                    confirmButtonText: 'Aceptar'
                });
            }
        },
        error: function () {
            Swal.fire({
                icon: 'error',
                title: 'Error de conexión',
                text: 'Error al conectar con el servidor.',
                confirmButtonText: 'Aceptar'
            });
        }
    });
});


function cargarPreguntas(trabajaActualmente) {
    trabaja = trabajaActualmente;

    $.ajax({
        url: '/Registrar/ObtenerPreguntas',
        type: 'GET',
        data: { trabaja: trabaja },
        success: function (response) {
            if (response.success) {
                preguntasActuales = response.data;
                mostrarModalPreguntas();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: response.message,
                    confirmButtonText: 'Aceptar'
                });
            }
        },
        error: function () {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al obtener las preguntas. Inténtelo de nuevo.',
                confirmButtonText: 'Aceptar'
            });
        }
    });
}

function mostrarModalPreguntas() {
    let html = '';

    if (preguntasActuales.length === 0) {
        mostrarFormularioCV();
        return;
    }

    preguntasActuales.forEach(function (p, index) {
        html += generarCampo(p, index);
    });

    html += `
        <div class="d-grid gap-2 mt-4">
            <button type="button" id="btnSiguienteCV" class="btn btn-primary btn-lg">
                <i class="fas fa-arrow-right me-2"></i>Siguiente: Subir CV
            </button>
        </div>
    `;

    $('#preguntasContainer').html(html);
    $('#modalEncuesta').modal('show');

    restaurarRespuestasEncuesta();

    $('#btnSiguienteCV').click(validarYContinuarCV);
}

function generarCampo(p, index) {
    let campo = '';
    const preguntaLower = p.texto_pregunta.toLowerCase();

    switch (p.tipo) {
        case 'Texto':
            if (preguntaLower.includes('compensación') || preguntaLower.includes('rango')) {
                campo = `
                    <select class="form-select pregunta-campo" data-id="${p.id_pregunta_encuesta}" 
                            name="p_${p.id_pregunta_encuesta}" required>
                        <option value="">Seleccione un rango</option>
                        <option value="0-600">$0 - $600</option>
                        <option value="600-1200">$600 - $1,200</option>
                        <option value="1200-2000">$1,200 - $2,000</option>
                        <option value="2000+">$2,000+</option>
                    </select>`;
            }
            else if (preguntaLower.includes('modalidad')) {
                campo = `
                    <select class="form-select pregunta-campo" data-id="${p.id_pregunta_encuesta}" 
                            name="p_${p.id_pregunta_encuesta}" required>
                        <option value="">Seleccione</option>
                        <option value="Remoto">Remoto</option>
                        <option value="Presencial">Presencial</option>
                        <option value="Mixto">Mixto</option>
                    </select>`;
            }
            else if (preguntaLower.includes('jornada') || preguntaLower.includes('tiempo')) {
                campo = `
                    <select class="form-select pregunta-campo" data-id="${p.id_pregunta_encuesta}" 
                            name="p_${p.id_pregunta_encuesta}" required>
                        <option value="">Seleccione</option>
                        <option value="Tiempo completo">Tiempo completo</option>
                        <option value="Medio tiempo">Medio tiempo</option>
                    </select>`;
            }
            else {
                campo = `<input type="text" class="form-control pregunta-campo" data-id="${p.id_pregunta_encuesta}" 
                         name="p_${p.id_pregunta_encuesta}" placeholder="Escriba su respuesta" required />`;
            }
            break;

        case 'Numero':
            campo = `<input type="number" class="form-control pregunta-campo" data-id="${p.id_pregunta_encuesta}" 
                     name="p_${p.id_pregunta_encuesta}" placeholder="Ingrese un número" min="0" required />`;
            break;

        case 'SiNo':
            campo = `
                <select class="form-select pregunta-campo" data-id="${p.id_pregunta_encuesta}" 
                        name="p_${p.id_pregunta_encuesta}" required>
                    <option value="">Seleccione</option>
                    <option value="1">Sí</option>
                    <option value="0">No</option>
                </select>`;
            break;
    }

    return `
        <div class="mb-3">
            <label class="form-label fw-semibold">${index + 1}. ${p.texto_pregunta}</label>
            ${campo}
        </div>
    `;
}

function guardarRespuestasEncuesta() {
    respuestasEncuesta = [];
    $('.pregunta-campo').each(function () {
        const idPregunta = $(this).data('id');
        const valorRespuesta = $(this).val();

        if (idPregunta) {
            respuestasEncuesta.push({
                id_pregunta_encuesta: idPregunta,
                respuesta: valorRespuesta
            });
        }
    });
}

function restaurarRespuestasEncuesta() {
    respuestasEncuesta.forEach(function (resp) {
        const campo = $(`.pregunta-campo[data-id="${resp.id_pregunta_encuesta}"]`);
        if (campo.length > 0) {
            campo.val(resp.respuesta);
        }
    });
}

function validarYContinuarCV() {
    const camposRequeridos = $('#preguntasContainer').find('.pregunta-campo');
    let formularioValido = true;

    camposRequeridos.each(function () {
        if ($(this).val() === '' || $(this).val() === null) {
            $(this).addClass('is-invalid');
            formularioValido = false;
        } else {
            $(this).removeClass('is-invalid');
        }
    });

    if (!formularioValido) {
        Swal.fire({
            icon: 'warning',
            title: 'Campos incompletos',
            text: 'Por favor complete todas las preguntas requeridas.',
            confirmButtonText: 'Aceptar'
        });
        return;
    }

    let hayErrores = false;
    camposRequeridos.each(function () {
        if ($(this).is('input[type="number"]')) {
            const valor = parseFloat($(this).val());

            if (isNaN(valor) || valor < 0) {
                $(this).addClass('is-invalid');
                Swal.fire({
                    icon: 'error',
                    title: 'Valor inválido',
                    text: 'Los valores numéricos no pueden ser negativos.',
                    confirmButtonText: 'Aceptar'
                });
                hayErrores = true;
                return false;
            }
        }
    });

    if (hayErrores) return;

    guardarRespuestasEncuesta();
    mostrarFormularioCV();
}

function mostrarFormularioCV() {
    const html = `
        <div class="mb-3">
            <label class="form-label fw-semibold">
                <i class="fas fa-file-pdf me-2"></i>Subir CV (PDF) *
            </label>
            <input type="file" class="form-control" id="cvFile" accept=".pdf" required />
            <small class="text-muted">Formato: PDF, Tamaño máximo: 5MB</small>
        </div>
        
        <div class="mb-3">
            <label class="form-label fw-semibold">
                <i class="fas fa-briefcase me-2"></i>Años de experiencia *
            </label>
            <input type="number" step="0.5" min="0" class="form-control" hidden id="experienciaAnos"
                   placeholder="Ej: 2.5" value="${nivelExperiencia}" required />
            <small class="text-muted" hidden>Incluye experiencia laboral relevante</small>
        </div>
        
        <div class="mb-3">
            <label class="form-label fw-semibold">
                <i class="fas fa-tools me-2"></i>Habilidades principales *
            </label>
            <textarea class="form-control" id="habilidadesPrincipales" rows="3" 
                      placeholder="Ej: JavaScript, SQL, C#, trabajo en equipo..." required>${datosCV.habilidades}</textarea>
            <small class="text-muted">Separe las habilidades con comas</small>
        </div>        
        
        <div class="d-flex gap-2 mt-4">
            <button type="button" id="btnVolverPreguntas" class="btn btn-secondary flex-fill">
                <i class="fas fa-arrow-left me-2"></i>Volver
            </button>
            <button type="button" id="btnSiguienteIdiomas" class="btn btn-primary flex-fill">
                <i class="fas fa-arrow-right me-2"></i>Siguiente: Idiomas
            </button>
        </div>
    `;

    $('#preguntasContainer').html(html);

    if (datosCV.archivo) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(datosCV.archivo);
        $('#cvFile')[0].files = dataTransfer.files;
    }

    $('#btnVolverPreguntas').click(function () {
        guardarDatosCV();
        mostrarModalPreguntas();
    });

    $('#btnSiguienteIdiomas').click(validarYContinuarIdiomas);
}

function guardarDatosCV() {
    const cvFileElement = $('#cvFile')[0];
    const cvFile = cvFileElement && cvFileElement.files.length > 0 ? cvFileElement.files[0] : null;

    if (cvFile) {
        datosCV.archivo = cvFile;
    }

    datosCV.experiencia = $('#experienciaAnos').val() || '';
    datosCV.habilidades = $('#habilidadesPrincipales').val() || '';
}

function validarYContinuarIdiomas() {
    const cvFileElement = $('#cvFile')[0];
    const cvFile = cvFileElement ? cvFileElement.files[0] : null;
    const experiencia = $('#experienciaAnos').val();
    const habilidades = $('#habilidadesPrincipales').val();
    if (trabaja) {
        Toastify({
            text: "En tu caso que actualmente estes trabajo es opcional subir el CV!",
            duration: 6000,
            gravity: "top",
            position: "right",
            style: {
                background: "#8b1038",
            },
        }).showToast();
    } else {
        if (!cvFile) {
            Swal.fire({
                icon: 'warning',
                title: 'CV requerido',
                text: 'Por favor seleccione un archivo PDF.',
                confirmButtonText: 'Aceptar'
            });
            $('#cvFile').addClass('is-invalid');
            return;
        }
        if (cvFile.type !== 'application/pdf') {
            Swal.fire({
                icon: 'error',
                title: 'Formato inválido',
                text: 'Solo se permiten archivos PDF.',
                confirmButtonText: 'Aceptar'
            });
            $('#cvFile').addClass('is-invalid');
            return;
        }

        if (cvFile.size > 5 * 1024 * 1024) {
            Swal.fire({
                icon: 'error',
                title: 'Archivo muy grande',
                text: 'El archivo no debe superar los 5MB.',
                confirmButtonText: 'Aceptar'
            });
            $('#cvFile').addClass('is-invalid');
            return;
        }
    }
    

    

    if (!experiencia || parseFloat(experiencia) < 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Experiencia requerida',
            text: 'Por favor ingrese los años de experiencia (mínimo 0).',
            confirmButtonText: 'Aceptar'
        });
        $('#experienciaAnos').addClass('is-invalid');
        return;
    }

    if (!habilidades.trim()) {
        Swal.fire({
            icon: 'warning',
            title: 'Habilidades requeridas',
            text: 'Por favor ingrese sus habilidades principales.',
            confirmButtonText: 'Aceptar'
        });
        $('#habilidadesPrincipales').addClass('is-invalid');
        return;
    }

    datosCV.archivo = cvFile;
    datosCV.experiencia = experiencia;
    datosCV.habilidades = habilidades;

    cargarIdiomas();
}

function cargarIdiomas() {
    Swal.fire({
        title: 'Cargando idiomas...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    $.ajax({
        url: '/Registrar/ObtenerIdiomas',
        type: 'GET',
        success: function (response) {
            Swal.close();

            if (response.success) {
                idiomasDisponibles = response.data;
                mostrarSeleccionIdiomas();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: response.message,
                    confirmButtonText: 'Aceptar'
                });
            }
        },
        error: function () {
            Swal.close();
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al obtener los idiomas. Inténtelo de nuevo.',
                confirmButtonText: 'Aceptar'
            });
        }
    });
}

function mostrarSeleccionIdiomas() {
    let idiomasHtml = '';

    idiomasDisponibles.forEach(function (idioma) {
        const checked = idiomasSeleccionados.some(sel => sel.id === idioma.id_idioma) ? 'checked' : '';
        const nivelSeleccionado = (idiomasSeleccionados.find(sel => sel.id === idioma.id_idioma) || {}).nivel || '';
        idiomasHtml += `
            <div class="form-check mb-2 d-flex align-items-center">
                <input class="form-check-input idioma-checkbox me-2" type="checkbox" 
                       value="${idioma.id_idioma}" id="idioma_${idioma.id_idioma}" ${checked}>
                <label class="form-check-label me-3" for="idioma_${idioma.id_idioma}">
                    ${idioma.nombre}
                </label>
                <select class="form-select form-select-sm ms-2 nivel-idioma-select" 
                        id="nivel_${idioma.id_idioma}" data-idioma="${idioma.id_idioma}" style="width: auto;" ${checked ? '' : 'disabled'}>
                    <option value="">Nivel</option>
                    <option value="A1" ${nivelSeleccionado === 'A1' ? 'selected' : ''}>A1</option>
                    <option value="A2" ${nivelSeleccionado === 'A2' ? 'selected' : ''}>A2</option>
                    <option value="B1" ${nivelSeleccionado === 'B1' ? 'selected' : ''}>B1</option>
                    <option value="B2" ${nivelSeleccionado === 'B2' ? 'selected' : ''}>B2</option>
                    <option value="C1" ${nivelSeleccionado === 'C1' ? 'selected' : ''}>C1</option>
                    <option value="C2" ${nivelSeleccionado === 'C2' ? 'selected' : ''}>C2</option>
                    <option value="Nativo" ${nivelSeleccionado === 'Nativo' ? 'selected' : ''}>Nativo</option>
                </select>
            </div>
        `;
    });

    const html = `
        <div class="mb-4">
            <h5 class="mb-3">
                <i class="fas fa-language me-2"></i>Selecciona los idiomas que dominas y su nivel
            </h5>
            <div class="border rounded p-3" style="max-height: 300px; overflow-y: auto;">
                ${idiomasHtml}
            </div>
        </div>
        
        <div class="mb-3">
            <label class="form-label fw-semibold">
                <i class="fas fa-plus-circle me-2"></i>¿No encuentras tu idioma? Agrégalo aquí
            </label>
            <div class="input-group">
                <input type="text" class="form-control" id="nuevoIdioma" 
                       placeholder="Nombre del idioma" />
                <button type="button" class="btn btn-outline-primary" id="btnAgregarIdioma">
                    <i class="fas fa-plus me-1"></i>Agregar
                </button>
            </div>
        </div>
        
        <div class="d-flex gap-2 mt-4">
            <button type="button" id="btnVolverCV" class="btn btn-secondary flex-fill">
                <i class="fas fa-arrow-left me-2"></i>Volver
            </button>
            <button type="button" id="btnEnviarTodo" class="btn btn-success flex-fill">
                <i class="fas fa-check me-2"></i>Finalizar y Enviar
            </button>
        </div>
    `;

    $('#preguntasContainer').html(html);

    $('#btnVolverCV').click(mostrarFormularioCV);
    $('#btnAgregarIdioma').click(agregarNuevoIdioma);
    $('#btnEnviarTodo').click(enviarTodoElFormulario);

    $('.idioma-checkbox').change(function () {
        const idiomaId = parseInt($(this).val());
        const selectNivel = $(`#nivel_${idiomaId}`);
        if ($(this).is(':checked')) {
            selectNivel.prop('disabled', false);
        } else {
            selectNivel.prop('disabled', true).val('');
        }
        actualizarIdiomasSeleccionados();
    });

    $('.nivel-idioma-select').change(function () {
        actualizarIdiomasSeleccionados();
    });
}

function actualizarIdiomasSeleccionados() {
    idiomasSeleccionados = [];
    $('.idioma-checkbox:checked').each(function () {
        const idiomaId = parseInt($(this).val());
        const nivel = $(`#nivel_${idiomaId}`).val();
        idiomasSeleccionados.push({ id_idioma: idiomaId, nivel: nivel });
    });
}

function agregarNuevoIdioma() {
    const nombreIdioma = $('#nuevoIdioma').val().trim();

    if (!nombreIdioma) {
        Swal.fire({
            icon: 'warning',
            title: 'Campo vacío',
            text: 'Por favor ingrese el nombre del idioma.',
            confirmButtonText: 'Aceptar'
        });
        return;
    }

    Swal.fire({
        title: 'Agregando idioma...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    $.ajax({
        url: '/Registrar/AgregarIdioma',
        type: 'POST',
        data: { idioma: nombreIdioma },
        success: function (response) {
            Swal.close();

            if (response.success) {
                $('#nuevoIdioma').val('');
                Swal.fire({
                    icon: 'success',
                    title: '¡Idioma agregado!',
                    text: response.message,
                    timer: 1500,
                    showConfirmButton: false
                });
                cargarIdiomas();
            } else {
                Swal.fire({
                    icon: 'info',
                    title: 'Información',
                    text: response.message,
                    confirmButtonText: 'Aceptar'
                });
            }
        },
        error: function () {
            Swal.close();
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al agregar el idioma. Inténtelo de nuevo.',
                confirmButtonText: 'Aceptar'
            });
        }
    });
}

function enviarTodoElFormulario() {
    actualizarIdiomasSeleccionados();   
    if (!idiomasSeleccionados || !Array.isArray(idiomasSeleccionados) || idiomasSeleccionados.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Selecciona al menos un idioma',
            text: 'Debes seleccionar al menos un idioma y elegir su nivel.',
            confirmButtonText: 'Aceptar'
        });
        return;
    }

    if (respuestasEncuesta.length === 0 && preguntasActuales.length > 0) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se encontraron las respuestas de la encuesta. Por favor regrese y complete las preguntas.',
            confirmButtonText: 'Aceptar'
        });
        return;
    }

    const formData = new FormData();

    if (trabaja) {
        Toastify({
            text: "En tu caso que actualmente estes trabajo es opcional subir el CV!",
            duration: 6000,
            gravity: "top",
            position: "right",
            style: {
                background: "#8b1038",
            },
        }).showToast();
    } else
    {
        if (datosCV.archivo) {
            formData.append('CV', datosCV.archivo);
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se encontró el archivo CV. Por favor regrese y selecciónelo nuevamente.',
                confirmButtonText: 'Aceptar'
            });
            return;
        }
    }

    formData.append('experiencia', datosCV.experiencia);
    formData.append('habilidades', datosCV.habilidades);
    formData.append('trabaja', trabaja);
    formData.append('respuestas', JSON.stringify(respuestasEncuesta));

    formData.append('idiomasJson', JSON.stringify(idiomasSeleccionados));

    Swal.fire({
        title: 'Enviando información...',
        text: 'Por favor espere, esto puede tomar unos segundos',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    $.ajax({
        url: '/Registrar/ResponderPreguntas',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
            Swal.close();

            if (response.success) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Registro completado!',
                    text: response.message,
                    confirmButtonText: 'Aceptar'
                }).then((result) => {
                    if (result.isConfirmed) {
                        $('#modalEncuesta').modal('hide');                        
                        preguntasActuales = [];
                        idiomasDisponibles = [];
                        idiomasSeleccionados = [];
                        respuestasEncuesta = [];
                        datosCV = {
                            archivo: null,
                            experiencia: '',
                            habilidades: ''
                        };
                        if (trabaja) {
                            hayDatosSinGuardar = false;
                            Swal.fire({
                                title: '¡Registro completado!',
                                text: 'Gracias por registrarte!',
                                icon: 'success',
                                showCancelButton: true,
                                cancelButtonText: 'Salir'
                            }).then((result) => {
                                if (result.dismiss === Swal.DismissReason.cancel) {
                                    window.location.href = '/Bienvenido/Index';
                                }
                            });
                        } else
                        {
                            hayDatosSinGuardar = false;
                            Swal.fire({
                                title: '¡Registro completado!',
                                text: 'Gracias por registrarte. Ahora puede ver las vacantes disponibles en este momento!!.',
                                icon: 'success',
                                confirmButtonText: 'Ir'
                            }).then(() => {
                                window.location.href = '/Egresado/Index';
                            });
                        }
                    }
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: response.message,
                    confirmButtonText: 'Aceptar'
                });
            }
        },
        error: function (xhr, status, error) {
            Swal.close();
            Swal.fire({
                icon: 'error',
                title: 'Error del servidor',
                text: 'No se pudo completar el registro. Inténtelo de nuevo.',
                confirmButtonText: 'Aceptar'
            });
            console.error('Error:', error);
            console.error('Response:', xhr.responseText);
        }
    });
}