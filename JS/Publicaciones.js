let publicaciones = [];
let modoEdicion = false;

$(document).ready(function () {
    cargarPublicaciones();
    configurarEventos();
});

function configurarEventos() {
    $('#salarioConfidencial').on('change', function () {
        if ($(this).is(':checked')) {
            $('#rangoSalarial').hide();
            $('#salarioMin').val('').prop('required', false);
            $('#salarioMax').val('').prop('required', false);
        } else {
            $('#rangoSalarial').show();
            $('#salarioMin').prop('required', true);
            $('#salarioMax').prop('required', true);
        }
    });

    $('#buscarPublicacion').on('keyup', function () {
        filtrarPublicaciones($(this).val());
    });

    const today = new Date().toISOString().split('T')[0];
    $('#fechaCierre').attr('min', today);
}

function cargarPublicaciones() {
    $.ajax({
        url: '/Empresas/ObtenerPublicaciones',
        type: 'GET',
        success: function (response) {
            if (response.success) {
                publicaciones = response.data;
                renderizarPublicaciones(publicaciones);
            } else {
                mostrarError(response.message);
            }
        },
        error: function () {
            mostrarError('No se pudieron cargar las publicaciones');
        }
    });
}

function renderizarPublicaciones(datos) {
    const tbody = $('#bodyPublicaciones');
    tbody.empty();

    if (datos.length === 0) {
        tbody.append(`
            <tr>
                <td colspan="7" class="text-center text-muted py-4">
                    <i class="fas fa-inbox fa-3x mb-3"></i>
                    <p>No hay publicaciones todavía</p>
                </td>
            </tr>
        `);
        return;
    }

    datos.forEach(function (pub) {
        const fila = `
            <tr>
                <td>
                    <strong>${pub.titulo}</strong>
                    <br><small class="text-muted">${pub.area || 'Sin área'}</small>
                </td>
                <td>${pub.modalidad || '-'}</td>
                <td>${pub.ubicacion || '-'}</td>
                <td>
                    <span class="badge bg-info">${pub.NumeroPostulantes}</span>
                </td>
                <td>${renderEstado(pub.estado)}</td>
                <td>${formatearFecha(pub.fecha_publicacion)}</td>
                <td>
                    <div class="btn-group btn-group-sm" role="group">
                        <button class="btn btn-outline-primary" onclick="abrirModalEditar(${pub.id_vacante})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-secondary" onclick="cambiarEstado(${pub.id_vacante}, '${pub.estado}')" title="Cambiar estado">
                            <i class="fas fa-toggle-on"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="confirmarEliminar(${pub.id_vacante})" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
        tbody.append(fila);
    });
}

// abrir modal para crear
function abrirModalCrear() {
    modoEdicion = false;
    $('#tituloModal').html('<i class="fas fa-briefcase me-2"></i>Nueva Publicación');
    $('#formPublicacion')[0].reset();
    $('#idVacante').val('');
    $('#rangoSalarial').show();
    $('#salarioMin').prop('required', true);
    $('#salarioMax').prop('required', true);
    $('#modalPublicacion').modal('show');
}

function abrirModalEditar(idVacante) {
    modoEdicion = true;
    $('#tituloModal').html('<i class="fas fa-edit me-2"></i>Editar Publicación');

    $.ajax({
        url: '/Empresas/ObtenerDetallePublicacion',
        type: 'GET',
        data: { idVacante: idVacante },
        success: function (response) {
            if (response.success) {
                llenarFormulario(response.data);
                $('#modalPublicacion').modal('show');
            } else {
                mostrarError(response.message);
            }
        },
        error: function () {
            mostrarError('No se pudo cargar el detalle de la publicación');
        }
    });
}

function llenarFormulario(pub) {
    $('#idVacante').val(pub.id_vacante);
    $('#titulo').val(pub.titulo);
    $('#area').val(pub.area);
    $('#ubicacion').val(pub.ubicacion);
    $('#modalidad').val(pub.modalidad);
    $('#tipoContrato').val(pub.tipo_contrato);
    $('#descripcion').val(pub.descripcion);
    $('#requisitos').val(pub.requisitos);

    if (pub.salario_confidencial) {
        $('#salarioConfidencial').prop('checked', true);
        $('#rangoSalarial').hide();
    } else {
        $('#salarioConfidencial').prop('checked', false);
        $('#rangoSalarial').show();
        $('#salarioMin').val(pub.salario_min);
        $('#salarioMax').val(pub.salario_max);
    }

    if (pub.fecha_cierre) {
        const fecha = new Date(pub.fecha_cierre).toISOString().split('T')[0];
        $('#fechaCierre').val(fecha);
    }
}

function guardarPublicacion() {
    if (!validarFormulario()) {
        return;
    }

    const formData = obtenerDatosFormulario();
    const url = modoEdicion ? '/Empresas/ActualizarPublicacion' : '/Empresas/CrearPublicacion';

    $.ajax({
        url: url,
        type: 'POST',
        data: formData,
        success: function (response) {
            if (response.success) {
                $('#modalPublicacion').modal('hide');
                Swal.fire({
                    icon: 'success',
                    title: '¡Éxito!',
                    text: response.message,
                    confirmButtonText: 'Aceptar'
                }).then(() => {
                    cargarPublicaciones();
                });
            } else {
                mostrarError(response.message);
            }
        },
        error: function () {
            mostrarError('No se pudo guardar la publicación');
        }
    });
}

function obtenerDatosFormulario() {
    const data = {
        titulo: $('#titulo').val().trim(),
        area: $('#area').val(),
        ubicacion: $('#ubicacion').val().trim(),
        modalidad: $('#modalidad').val(),
        tipo_contrato: $('#tipoContrato').val(),
        descripcion: $('#descripcion').val().trim(),
        requisitos: $('#requisitos').val().trim(),
        salario_confidencial: $('#salarioConfidencial').is(':checked'),
        fecha_cierre: $('#fechaCierre').val() || null
    };

    if (modoEdicion) {
        data.id_vacante = $('#idVacante').val();
    }

    if (!data.salario_confidencial) {
        data.salario_min = $('#salarioMin').val();
        data.salario_max = $('#salarioMax').val();
    }

    return data;
}

function validarFormulario() {
    const titulo = $('#titulo').val().trim();
    const descripcion = $('#descripcion').val().trim();
    const requisitos = $('#requisitos').val().trim();

    if (!titulo || !descripcion || !requisitos) {
        Swal.fire({
            icon: 'warning',
            title: 'Campos Incompletos',
            text: 'Por favor completa todos los campos obligatorios'
        });
        return false;
    }

    if (!$('#salarioConfidencial').is(':checked')) {
        const salarioMin = parseFloat($('#salarioMin').val());
        const salarioMax = parseFloat($('#salarioMax').val());

        if (salarioMin && salarioMax && salarioMin >= salarioMax) {
            Swal.fire({
                icon: 'warning',
                title: 'Rango Salarial Inválido',
                text: 'El salario mínimo debe ser menor que el salario máximo'
            });
            return false;
        }
    }

    return true;
}

function cambiarEstado(idVacante, estadoActual) {
    const opciones = {
        'Activa': ['Pausada', 'Cerrada'],
        'Pausada': ['Activa', 'Cerrada'],
        'Cerrada': ['Activa'],
        'Cancelada': []
    };

    if (!opciones[estadoActual] || opciones[estadoActual].length === 0) {
        Swal.fire({
            icon: 'info',
            title: 'Sin Opciones',
            text: 'No se puede cambiar el estado de esta publicación'
        });
        return;
    }

    const inputOptions = {};
    opciones[estadoActual].forEach(estado => {
        inputOptions[estado] = estado;
    });

    Swal.fire({
        title: 'Cambiar Estado',
        text: 'Selecciona el nuevo estado de la publicación:',
        input: 'select',
        inputOptions: inputOptions,
        showCancelButton: true,
        confirmButtonText: 'Cambiar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed && result.value) {
            ejecutarCambioEstado(idVacante, result.value);
        }
    });
}

function ejecutarCambioEstado(idVacante, nuevoEstado) {
    $.ajax({
        url: '/Empresas/CambiarEstadoPublicacion',
        type: 'POST',
        data: { idVacante: idVacante, nuevoEstado: nuevoEstado },
        success: function (response) {
            if (response.success) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Estado Actualizado!',
                    text: response.message,
                    confirmButtonText: 'Aceptar'
                }).then(() => {
                    cargarPublicaciones();
                });
            } else {
                mostrarError(response.message);
            }
        },
        error: function () {
            mostrarError('No se pudo cambiar el estado');
        }
    });
}

function confirmarEliminar(idVacante) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: 'Esta acción no se puede deshacer',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#d33'
    }).then((result) => {
        if (result.isConfirmed) {
            eliminarPublicacion(idVacante);
        }
    });
}

function eliminarPublicacion(idVacante) {
    $.ajax({
        url: '/Empresas/EliminarPublicacion',
        type: 'POST',
        data: { idVacante: idVacante },
        success: function (response) {
            if (response.success) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Eliminada!',
                    text: response.message,
                    confirmButtonText: 'Aceptar'
                }).then(() => {
                    cargarPublicaciones();
                });
            } else {
                mostrarError(response.message);
            }
        },
        error: function () {
            mostrarError('No se pudo eliminar la publicación');
        }
    });
}

function filtrarPublicaciones(termino) {
    const filtradas = publicaciones.filter(pub =>
        pub.titulo.toLowerCase().includes(termino.toLowerCase())
    );
    renderizarPublicaciones(filtradas);
}

function renderEstado(estado) {
    const colores = {
        'Activa': 'success',
        'Pausada': 'warning',
        'Cerrada': 'secondary',
        'Cancelada': 'danger'
    };
    const color = colores[estado] || 'secondary';
    return `<span class="badge bg-${color}">${estado}</span>`;
}

function formatearFecha(fecha) {
    if (!fecha) return '-';
    const date = new Date(fecha);
    const opciones = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('es-ES', opciones);
}

function mostrarError(mensaje) {
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: mensaje
    });
}