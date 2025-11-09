$(document).ready(function () {
    $('.form-wrapper').css('opacity', '0').animate({ opacity: 1 }, 600);

    $('.form-control').on('input change', function () {
        $(this).removeClass('is-invalid');
    });

    $('#formRegistro').on('submit', function (e) {
        e.preventDefault();

        let isValid = true;
        $(this).find('[required]').each(function () {
            if (!$(this).val() || $(this).val().trim() === '') {
                isValid = false;
                $(this).addClass('is-invalid');
            } else {
                $(this).removeClass('is-invalid');
            }
        });

        if (!isValid) {
            Swal.fire({
                icon: 'error',
                title: 'Campos incompletos',
                text: 'Por favor complete todos los campos requeridos',
                confirmButtonColor: '#5D0A28',
                confirmButtonText: 'Entendido'
            });
            return;
        }

        const nit = $('input[name="nit"]').val();
        const nitPattern = /^[0-9]{4}-[0-9]{6}-[0-9]{3}-[0-9]{1}$/;
        if (!nitPattern.test(nit)) {
            Swal.fire({
                icon: 'error',
                title: 'NIT inválido',
                text: 'El formato del NIT debe ser: 0000-000000-000-0',
                confirmButtonColor: '#5D0A28'
            });
            $('input[name="nit"]').addClass('is-invalid').focus();
            return;
        }

        const telefono = $('input[name="telefono"]').val();
        const telefonoPattern = /^[0-9]{4}-[0-9]{4}$/;
        if (!telefonoPattern.test(telefono)) {
            Swal.fire({
                icon: 'error',
                title: 'Teléfono inválido',
                text: 'El formato del teléfono debe ser: 2222-2222',
                confirmButtonColor: '#5D0A28'
            });
            $('input[name="telefono"]').addClass('is-invalid').focus();
            return;
        }

        const password = $('input[name="usuario_principal_password"]').val();
        const confirmarPassword = $('input[name="confirmar_password"]').val();

        if (password !== confirmarPassword) {
            Swal.fire({
                icon: 'error',
                title: 'Contraseñas no coinciden',
                text: 'La contraseña y su confirmación deben ser iguales',
                confirmButtonColor: '#5D0A28'
            });
            $('input[name="confirmar_password"]').addClass('is-invalid').focus();
            return;
        }

        if (password.length < 8) {
            Swal.fire({
                icon: 'error',
                title: 'Contraseña muy corta',
                text: 'La contraseña debe tener al menos 8 caracteres',
                confirmButtonColor: '#5D0A28'
            });
            $('input[name="usuario_principal_password"]').addClass('is-invalid').focus();
            return;
        }

        Swal.fire({
            title: 'Procesando...',
            text: 'Registrando empresa y usuario, por favor espere',
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        var formData = {
            __RequestVerificationToken: $('input[name="__RequestVerificationToken"]').val(),
            razon_social: $('input[name="razon_social"]').val().trim(),
            nit: $('input[name="nit"]').val().trim(),
            email_contacto: $('input[name="email_contacto"]').val().trim(),
            telefono: $('input[name="telefono"]').val().trim(),
            direccion: $('textarea[name="direccion"]').val().trim(),
            sector_economico: $('select[name="sector_economico"]').val(),
            tamano_empresa: $('select[name="tamano_empresa"]').val(),
            vinculada_universidad: $('input[name="vinculada_universidad"]').is(':checked'),
            usuario_empresa_nombre_usuario: $('input[name="usuario_empresa_nombre_usuario"]').val().trim(),
            usuario_empresa_rol: $('select[name="usuario_empresa_rol"]').val(),
            usuario_empresa_nombre_completo: $('input[name="usuario_empresa_nombre_completo"]').val().trim(),
            usuario_empresa_cargo: $('input[name="usuario_empresa_cargo"]').val().trim(),
            usuario_empresa_email: $('input[name="usuario_empresa_email"]').val().trim(),
            usuario_principal_password: password
        };

        $.ajax({
            url: '/UrlTemp/RegistrarEmpresa',
            type: 'POST',
            data: formData,
            dataType: 'json',
            success: function (response) {
                if (response.success) {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Registro Exitoso!',
                        html: `
                            <p>${response.mensaje || 'La empresa y el usuario han sido registrados correctamente'}</p>
                            <div style="margin-top: 15px; padding: 15px; background: #f8f9fa; border-radius: 8px; text-align: left;">
                                <strong style="color: #5D0A28;">Datos de acceso:</strong><br>
                                <strong>Usuario:</strong> ${formData.usuario_empresa_nombre_usuario}<br>
                                <strong>Email:</strong> ${formData.usuario_empresa_email}<br>
                                <small style="color: #666;">*Se ha enviado un correo de bienvenida con los detalles de acceso</small>
                            </div>
                        `,
                        confirmButtonColor: '#5D0A28',
                        confirmButtonText: 'Ir al inicio',
                        allowOutsideClick: false
                    }).then((result) => {
                        if (result.isConfirmed) {
                            window.location.href = '/Home/Index';
                        }
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error en el registro',
                        text: response.mensaje || 'No se pudo completar el registro. Intente nuevamente.',
                        confirmButtonColor: '#5D0A28',
                        confirmButtonText: 'Reintentar'
                    });
                }
            },
            error: function (xhr, status, error) {
                let errorMessage = 'Ocurrió un error al procesar la solicitud.';

                if (xhr.responseJSON && xhr.responseJSON.mensaje) {
                    errorMessage = xhr.responseJSON.mensaje;
                } else if (xhr.status === 400) {
                    errorMessage = 'Datos inválidos. Verifique la información ingresada.';
                } else if (xhr.status === 401) {
                    errorMessage = 'No autorizado. Verifique sus credenciales.';
                } else if (xhr.status === 403) {
                    errorMessage = 'Acceso denegado. Por favor contacte al administrador.';
                } else if (xhr.status === 409) {
                    errorMessage = 'Esta empresa o usuario ya se encuentra registrado.';
                } else if (xhr.status === 500) {
                    errorMessage = 'Error del servidor. Por favor contacte al administrador.';
                }

                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: errorMessage,
                    confirmButtonColor: '#5D0A28',
                    confirmButtonText: 'Entendido'
                });
            }
        });
    });

    $('input[name="nit"]').on('input', function (e) {
        let value = $(this).val().replace(/[^0-9]/g, '');
        if (value.length > 14) value = value.substr(0, 14);

        let formatted = '';
        if (value.length > 0) formatted += value.substr(0, 4);
        if (value.length > 4) formatted += '-' + value.substr(4, 6);
        if (value.length > 10) formatted += '-' + value.substr(10, 3);
        if (value.length > 13) formatted += '-' + value.substr(13, 1);

        $(this).val(formatted);
    });

    $('input[name="telefono"]').on('input', function (e) {
        let value = $(this).val().replace(/[^0-9]/g, '');
        if (value.length > 8) value = value.substr(0, 8);

        let formatted = '';
        if (value.length > 0) formatted += value.substr(0, 4);
        if (value.length > 4) formatted += '-' + value.substr(4, 4);

        $(this).val(formatted);
    });

    

    $('input[name="usuario_principal_password"]').on('input', function () {
        const password = $(this).val();
        let strength = 0;
        let hints = [];

        if (password.length >= 8) strength++;
        else hints.push('al menos 8 caracteres');

        if (/[a-z]/.test(password)) strength++;
        else hints.push('una minúscula');

        if (/[A-Z]/.test(password)) strength++;
        else hints.push('una mayúscula');

        if (/[0-9]/.test(password)) strength++;
        else hints.push('un número');

        if (/[^a-zA-Z0-9]/.test(password)) strength++;

        $(this).parent().find('.password-strength').remove();

        if (password.length > 0) {
            let strengthText = '';
            let strengthColor = '';

            if (strength <= 2) {
                strengthText = 'Débil';
                strengthColor = '#dc3545';
            } else if (strength === 3) {
                strengthText = 'Media';
                strengthColor = '#ffc107';
            } else if (strength === 4) {
                strengthText = 'Fuerte';
                strengthColor = '#28a745';
            } else {
                strengthText = 'Muy fuerte';
                strengthColor = '#28a745';
            }

            const hintText = hints.length > 0 ? `Incluya: ${hints.join(', ')}` : '¡Excelente contraseña!';

            $(this).after(`
                <small class="password-strength" style="display: block; margin-top: 5px; color: ${strengthColor}; font-weight: 600;">
                    Fortaleza: ${strengthText} - ${hintText}
                </small>
            `);
        }
    });

    $('input[name="confirmar_password"]').on('input', function () {
        const password = $('input[name="usuario_principal_password"]').val();
        const confirm = $(this).val();

        $(this).parent().find('.password-match').remove();

        if (confirm.length > 0) {
            if (password === confirm) {
                $(this).after('<small class="password-match" style="display: block; margin-top: 5px; color: #28a745; font-weight: 600;"><i class="fas fa-check-circle"></i> Las contraseñas coinciden</small>');
                $(this).removeClass('is-invalid');
            } else {
                $(this).after('<small class="password-match" style="display: block; margin-top: 5px; color: #dc3545; font-weight: 600;"><i class="fas fa-times-circle"></i> Las contraseñas no coinciden</small>');
            }
        }
    });
});