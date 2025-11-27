$(document).ready(function () {
    cargarDatosEmpresa();
    configurarEventos();
});


function cargarDatosEmpresa() {
    $.ajax({
        url: '/Empresas/DatosEmpresa',
        type: 'GET',
        success: function (response) {
            if (response.success) {
                llenarFormulario(response.data);
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
                text: 'No se pudieron cargar los datos de la empresa'
            });
        }
    });
}


function llenarFormulario(empresa) {
    $('#razonSocial').val(empresa.razon_social || '');
    $('#nit').val(empresa.nit || '');
    $('#emailContacto').val(empresa.email_contacto || '');
    $('#telefono').val(empresa.telefono || '');
    $('#direccion').val(empresa.direccion || '');
    $('#sectorEconomico').val(empresa.sector_economico || '');
    $('#tamanoEmpresa').val(empresa.tamano_empresa || '');
}


function configurarEventos() {
    $('#formPerfil').on('submit', function (e) {
        e.preventDefault();
        guardarPerfil();
    });
}


function guardarPerfil() {
    if (!validarFormulario()) {
        return;
    }

    const formData = {
        razon_social: $('#razonSocial').val().trim(),
        nit: $('#nit').val().trim(),
        email_contacto: $('#emailContacto').val().trim(),
        telefono: $('#telefono').val().trim(),
        direccion: $('#direccion').val().trim(),
        sector_economico: $('#sectorEconomico').val(),
        tamano_empresa: $('#tamanoEmpresa').val()
    };

    $.ajax({
        url: '/Empresas/ActualizarPerfil',
        type: 'POST',
        data: formData,
        success: function (response) {
            if (response.success) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Perfil Actualizado!',
                    text: response.message,
                    confirmButtonText: 'Aceptar'
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
                text: 'No se pudo actualizar el perfil'
            });
        }
    });
}


function validarFormulario() {
    const razonSocial = $('#razonSocial').val().trim();
    const nit = $('#nit').val().trim();
    const email = $('#emailContacto').val().trim();
    const telefono = $('#telefono').val().trim();
    const direccion = $('#direccion').val().trim();

    if (!razonSocial || !nit || !email || !telefono || !direccion) {
        Swal.fire({
            icon: 'warning',
            title: 'Campos Incompletos',
            text: 'Por favor completa todos los campos obligatorios'
        });
        return false;
    }

    if (!validarEmail(email)) {
        Swal.fire({
            icon: 'warning',
            title: 'Email Inválido',
            text: 'Por favor ingresa un email válido'
        });
        return false;
    }

    return true;
}


function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}