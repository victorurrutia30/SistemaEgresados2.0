let emailGlobal = '';
let tokenJWT = '';

$(document).ready(function () {
    $('.form-control').on('focus', function () {
        $(this).parent().find('.input-icon').css('color', '#5D0A28');
    }).on('blur', function () {
        if (!$(this).val()) {
            $(this).parent().find('.input-icon').css('color', '#666');
        }
    });

    $('.btn-login').on('click', function (e) {
        e.preventDefault();

        var username = $('#username').val().trim();
        var password = $('#password').val().trim();
        var recordar = $('#remember').is(':checked');

        if (!username || !password) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos incompletos',
                text: 'Por favor, completa todos los campos.',
                confirmButtonColor: '#5D0A28'
            });
            return false;
        }

        $('.btn-login').addClass('loading').prop('disabled', true);
        $('.btn-login').html('<i class="fas fa-spinner fa-spin"></i> Autenticando...');

        $.ajax({
            url: '/Bienvenido/AutenticarUsuario',
            type: 'POST',
            data: {
                email: username,
                password: password,
                recordarSesion: recordar
            },
            dataType: 'json',
            success: function (response) {
                if (response.success) {
                    $('.btn-login').removeClass('loading').prop('disabled', false);
                    $('.btn-login').html('<i class="fas fa-sign-in-alt"></i> Iniciar Sesión');

                    Swal.fire({
                        icon: 'success',
                        title: '¡Bienvenido!',
                        text: response.mensaje || 'Inicio de sesión exitoso',
                        timer: 1500,
                        showConfirmButton: false,
                        confirmButtonColor: '#5D0A28'
                    }).then(function () {
                        window.location.href = response.redirigir;
                    });
                }
                else if (response.message.includes("disponibles")) {
                    $('.btn-login').removeClass('loading').prop('disabled', false);
                    $('.btn-login').html('<i class="fas fa-sign-in-alt"></i> Iniciar Sesión'); 
                    Swal.fire({
                        icon: 'warning',
                        title: 'Atención',
                        text: response.message,
                        confirmButtonColor: '#5D0A28',
                        confirmButtonText: 'Actualizar mi informacion',
                        showCancelButton: true,
                        cancelButtonText: 'Cancelar'
                    })
                }
                else {
                    $('.btn-login').removeClass('loading').prop('disabled', false);
                    $('.btn-login').html('<i class="fas fa-sign-in-alt"></i> Iniciar Sesión');                    
                    Swal.fire({
                        icon: 'error',
                        title: 'Error de autenticación',
                        text: response.mensaje || 'Usuario o contraseña incorrectos',
                        confirmButtonColor: '#5D0A28'
                    });

                    $('.btn-login').removeClass('loading').prop('disabled', false);
                    $('.btn-login').html('<i class="fas fa-sign-in-alt"></i> Iniciar Sesión');
                }
            },
            error: function (xhr, status, error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error del servidor',
                    text: 'Ocurrió un error al procesar tu solicitud. Por favor, intenta de nuevo.',
                    confirmButtonColor: '#5D0A28'
                });

                $('.btn-login').removeClass('loading').prop('disabled', false);
                $('.btn-login').html('<i class="fas fa-sign-in-alt"></i> Iniciar Sesión');
            }
        });
    });

    $('#loginForm').on('keypress', function (e) {
        if (e.which === 13) { 
            e.preventDefault();
            $('.btn-login').click();
        }
    });

    $('.form-control').on('input', function () {
        $(this).removeClass('is-invalid');
    });
    $('#btnRestablecer').on('click', function () {
        $('#ConfirmarCodigoModal').modal('show');
    });
    $('#btnEmail').on('click', function () {
        emailGlobal = $('#emailRecuperar').val();
        if (emailGlobal === '') {
            Swal.fire({
                icon: 'warning',
                title: 'Correo requerido',
                text: 'Por favor ingrese su correo electrónico.'
            });
            return;
        }
        $.ajax({
            url: '/Bienvenido/ObtenerCodigoRestablecer',
            type: 'POST',
            data: { email: emailGlobal },
            success: function (response) {
                if (response.success) {
                    Toastify({
                        text: response.message,
                        duration: 6000,
                        gravity: "top", 
                        position: "right",
                        style: {
                            background: "#8b1038",
                        },
                    }).showToast();
                    $('#btnEmail').prop('disabled', true);
                    $('#btnVerificarCodigo').prop('disabled', false);
                    $('#btnReenviarCodigo').prop('disabled', false);
                    $('#codigoVerificacion').focus();
                }
                else {
                    Swal.fire({
                        title: 'error',
                        icon:'error',
                        text: response.message
                    });
                }
            }, error: function () {
                Swal.fire({
                    icon: 'error',
                    title: 'Error del servidor',
                    text: 'No se pudo validar el código.'
                });
            }
        });
    });
    $('#btnVerificarCodigo').click(function () {
        const email = emailGlobal;
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
            url: '/Bienvenido/ValidarCodigo',
            type: 'POST',
            data: { email: email, codigo: codigo },
            success: function (response) {
                if (response.success) {
                    tokenJWT = response.token;
                    Swal.fire({
                        icon: 'success',
                        title: '¡Correo verificado!',
                        text: 'Tu cuenta ha sido autenticada correctamente.'
                    }).then(() => {
                        $('#ConfirmarCodigoModal').modal('hide');
                        $('#ConfirmarContrasena').modal('show');

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
        $('#btnEmail').click(); 
    });
    $('#btnCambiar').on('click', function () {
        var contra = $('#contrasena').val();
        var contra2 = $('#confirmarContrasena').val();

        if (contra !== contra2) {
            Swal.fire({
                icon: 'error',
                title: 'Contraseñas no coinciden',
                text: 'Las contraseñas ingresadas no coinciden.',
                confirmButtonText: 'Aceptar'
            });
            return;
        }

        $.ajax({
            url: '/Bienvenido/CambiarContra',
            type: 'POST',
            data: { email: emailGlobal, contrasena: contra, token: tokenJWT },
            success: function (response) {
                if (response.success) {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Cambio verificado!',
                        text: response.message,
                    }).then(() => {
                        $('#ConfirmarContrasena').modal('hide');
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
});