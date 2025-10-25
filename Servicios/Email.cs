using SistemaEgresados.DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Web;
using System.Web.UI.WebControls;

namespace SistemaEgresados.Servicios
{
    public class Email
    {
        private static Dictionary<string, (string tokenJwt, string tokenSimple, DateTime expiracion, string email)> _tokensRecuperacion =
            new Dictionary<string, (string, string, DateTime, string)>();
        private static Dictionary<string, (string codigo, DateTime fecha, string mails)> codigos = new Dictionary<string, (string, DateTime, string)>();
        private readonly TokenService _tokenService;
        private const string remitente = "sportempresa0@gmail.com";
        private const string contraseña = "vmxizxayodmcvhkw";

        public Email()
        {
            _tokenService = new TokenService();
        }
        public Resultado EnviarMensajeAutentificacion(string email)
        {
            try
            {
                string codigo = new Random().Next(100000, 999999).ToString();

                codigos[email] = (codigo, DateTime.Now, email);

                string asunto = "Verificación de cuenta - Sistema Egresados UTEC";

                string cuerpo = $@"
                    <html>
                    <head>
                        <style>
                            body {{
                                font-family: 'Segoe UI', Arial, sans-serif;
                                background-color: #f8f9fa;
                                color: #212529;
                                padding: 30px;
                            }}
                            .container {{
                                max-width: 600px;
                                margin: 0 auto;
                                background: #ffffff;
                                border-radius: 8px;
                                box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                                overflow: hidden;
                            }}
                            .header {{
                                background: #0d6efd;
                                color: white;
                                padding: 20px;
                                text-align: center;
                                font-size: 20px;
                                font-weight: bold;
                            }}
                            .content {{
                                padding: 30px;
                                text-align: center;
                            }}
                            .codigo {{
                                font-size: 36px;
                                font-weight: bold;
                                color: #0d6efd;
                                margin: 20px 0;
                                letter-spacing: 3px;
                            }}
                            .footer {{
                                background: #f1f3f5;
                                padding: 15px;
                                text-align: center;
                                font-size: 12px;
                                color: #6c757d;
                            }}
                        </style>
                    </head>
                    <body>
                        <div class='container'>
                            <div class='header'>
                                Sistema de Egresados - UTEC
                            </div>
                            <div class='content'>
                                <p>Estimado(a) egresado(a),</p>
                                <p>Gracias por registrarte en el <strong>Sistema de Egresados UTEC</strong>.</p>
                                <p>Para completar tu registro, por favor introduce el siguiente código de verificación:</p>

                                <div class='codigo'>{codigo}</div>

                                <p> Este código es válido por <strong>5 Minutos</strong>.</p>
                                <p>Si tú no solicitaste este código, por favor ignora este mensaje.</p>
                            </div>
                            <div class='footer'>
                                © {DateTime.Now.Year} Universidad Tecnológica de El Salvador — Todos los derechos reservados.
                            </div>
                        </div>
                    </body>
                    </html>";

                SmtpClient cliente = new SmtpClient("smtp.gmail.com", 587)
                {
                    Credentials = new NetworkCredential(remitente, contraseña),
                    EnableSsl = true
                };

                MailMessage mensaje = new MailMessage();
                mensaje.From = new MailAddress(remitente, "Sistema de Egresados UTEC");
                mensaje.To.Add(email);
                mensaje.Subject = asunto;
                mensaje.Body = cuerpo;
                mensaje.IsBodyHtml = true;

                cliente.Send(mensaje);

                return Resultado.exito("Correo de verificación enviado correctamente.");
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al enviar el correo de verificación: " + ex.Message);
            }
        }

        public Resultado EnviarMensajeRecuperacionContrasena(string email)
        {
            try
            {
                string tokenJwt = _tokenService.GenerarTokenRecuperacion(email);

                string tokenSimple = _tokenService.GenerarTokenUnico().Substring(0, 8).ToUpper();

                _tokensRecuperacion[email] = (tokenJwt, tokenSimple, DateTime.Now.AddMinutes(30), email);

                string asunto = "Código de Recuperación - Sistema Egresados UTEC";

                string cuerpo = $@"
                    <html>
                    <head>
                        <style>
                            body {{
                                font-family: 'Segoe UI', Arial, sans-serif;
                                background-color: #f8f9fa;
                                color: #212529;
                                padding: 30px;
                            }}
                            .container {{
                                max-width: 600px;
                                margin: 0 auto;
                                background: #ffffff;
                                border-radius: 8px;
                                box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                                overflow: hidden;
                            }}
                            .header {{
                                background: #8b1038;
                                color: white;
                                padding: 20px;
                                text-align: center;
                                font-size: 20px;
                                font-weight: bold;
                            }}
                            .content {{
                                padding: 30px;
                                text-align: center;
                            }}
                            .codigo {{
                                font-size: 36px;
                                font-weight: bold;
                                color: #8b1038;
                                margin: 20px 0;
                                letter-spacing: 3px;
                                background: #f8f9fa;
                                padding: 15px;
                                border-radius: 5px;
                                border: 2px dashed #8b1038;
                            }}
                            .footer {{
                                background: #f1f3f5;
                                padding: 15px;
                                text-align: center;
                                font-size: 12px;
                                color: #6c757d;
                            }}
                            .advertencia {{
                                color: #dc3545;
                                font-size: 12px;
                                margin-top: 10px;
                            }}
                        </style>
                    </head>
                    <body>
                        <div class='container'>
                            <div class='header'>
                                Recuperación de Contraseña - UTEC
                            </div>
                            <div class='content'>
                                <p>Estimado(a) egresado(a),</p>
                                
                                <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en el <strong>Sistema de Egresados UTEC</strong>.</p>
                                
                                <p>Utiliza el siguiente código de verificación en el sistema:</p>

                                <div class='codigo'>{tokenSimple}</div>

                                <p><strong>Este código es válido por 30 minutos.</strong></p>
                                
                                <div class='advertencia'>
                                    <strong>Seguridad:</strong> Nunca compartas este código con otras personas. 
                                    El personal de UTEC nunca te pedirá este código.
                                </div>
                                
                                <p>Si no solicitaste este cambio, por favor ignora este mensaje.</p>
                            </div>
                            <div class='footer'>
                                © {DateTime.Now.Year} Universidad Tecnológica de El Salvador — Todos los derechos reservados.<br/>
                                <small>Este es un mensaje automático, por favor no respondas a este correo.</small>
                            </div>
                        </div>
                    </body>
                    </html>";

                using (SmtpClient cliente = new SmtpClient("smtp.gmail.com", 587))
                {
                    cliente.Credentials = new NetworkCredential(remitente, contraseña);
                    cliente.EnableSsl = true;

                    using (MailMessage mensaje = new MailMessage())
                    {
                        mensaje.From = new MailAddress(remitente, "Sistema de Egresados UTEC");
                        mensaje.To.Add(email);
                        mensaje.Subject = asunto;
                        mensaje.Body = cuerpo;
                        mensaje.IsBodyHtml = true;

                        cliente.Send(mensaje);
                    }
                }

                return Resultado.exito("Código de recuperación enviado correctamente.");
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al enviar el código de recuperación: " + ex.Message);
            }
        }
        public Resultado EnviarCorreoBienvenida(string email, string nombreUsuario)
        {
            try
            {
                string asunto = "¡Bienvenido(a) al Sistema de Egresados UTEC!";

                string cuerpo = $@"
                        <html>
                        <head>
                            <style>
                                body {{
                                    font-family: 'Segoe UI', Arial, sans-serif;
                                    background-color: #f8f9fa;
                                    color: #212529;
                                    padding: 30px;
                                }}
                                .container {{
                                    max-width: 600px;
                                    margin: 0 auto;
                                    background: #ffffff;
                                    border-radius: 8px;
                                    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                                    overflow: hidden;
                                }}
                                .header {{
                                    background: linear-gradient(135deg, #0d6efd, #8b1038);
                                    color: white;
                                    padding: 30px;
                                    text-align: center;
                                }}
                                .logo {{
                                    font-size: 28px;
                                    font-weight: bold;
                                    margin-bottom: 10px;
                                }}
                                .subtitle {{
                                    font-size: 18px;
                                    opacity: 0.9;
                                }}
                                .content {{
                                    padding: 30px;
                                    line-height: 1.6;
                                }}
                                .saludo {{
                                    font-size: 20px;
                                    color: #0d6efd;
                                    margin-bottom: 20px;
                                    font-weight: bold;
                                }}
                                .beneficios {{
                                    background: #f8f9fa;
                                    padding: 20px;
                                    border-radius: 8px;
                                    margin: 20px 0;
                                    border-left: 4px solid #0d6efd;
                                }}
                                .beneficios h3 {{
                                    color: #8b1038;
                                    margin-top: 0;
                                }}
                                .beneficios ul {{
                                    margin: 10px 0;
                                    padding-left: 20px;
                                }}
                                .beneficios li {{
                                    margin-bottom: 8px;
                                }}
                                .acciones {{
                                    background: #e7f3ff;
                                    padding: 20px;
                                    border-radius: 8px;
                                    margin: 20px 0;
                                    border: 1px solid #0d6efd;
                                }}
                                .boton {{
                                    display: inline-block;
                                    background: #0d6efd;
                                    color: white;
                                    padding: 12px 30px;
                                    text-decoration: none;
                                    border-radius: 5px;
                                    font-weight: bold;
                                    margin: 10px 0;
                                }}
                                .contacto {{
                                    background: #fff3cd;
                                    padding: 15px;
                                    border-radius: 5px;
                                    margin: 20px 0;
                                    border: 1px solid #ffc107;
                                }}
                                .footer {{
                                    background: #f1f3f5;
                                    padding: 20px;
                                    text-align: center;
                                    font-size: 12px;
                                    color: #6c757d;
                                    line-height: 1.5;
                                }}
                                .destacado {{
                                    color: #8b1038;
                                    font-weight: bold;
                                }}
                            </style>
                        </head>
                        <body>
                            <div class='container'>
                                <div class='header'>
                                    <div class='logo'>Sistema de Egresados UTEC</div>
                                    <div class='subtitle'>Conectando talento, construyendo futuro</div>
                                </div>
                                
                                <div class='content'>
                                    <div class='saludo'>¡Hola {WebUtility.HtmlEncode(nombreUsuario)}!</div>
                                    
                                    <p>Es un honor darte la más cordial bienvenida al <strong>Sistema de Egresados de la Universidad Tecnológica de El Salvador</strong>.</p>
                                    
                                    <p>Tu registro ha sido exitoso y ahora formas parte de nuestra comunidad de egresados UTEC, donde podrás mantenerte conectado con tu alma máter y con tus compañeros.</p>
                                    
                                    <div class='beneficios'>
                                        <h3> ¿Qué puedes hacer en nuestra plataforma?</h3>
                                        <ul>
                                            <li><strong>Actualizar tu información profesional</strong> y mantener tu perfil actualizado</li>
                                            <li><strong>Acceder a oportunidades laborales</strong> exclusivas para egresados UTEC</li>                                                                                    
                                            <li><strong>Recibir noticias</strong> sobre la universidad y tu área profesional</li>                                            
                                        </ul>
                                    </div>
                                    
                                    <div class='acciones'>
                                        <h3>Comienza ahora</h3>
                                        <p>Te invitamos a completar tu perfil para aprovechar al máximo todos los beneficios:</p>
                                        <a href='#' class='boton'>Ir al Sistema</a>
                                        <p style='margin-top: 10px; font-size: 14px;'><em>Completa tu información profesional y comienza a explorar</em></p>
                                    </div>
                                    
                                    <div class='contacto'>
                                        <h3>📞 ¿Necesitas ayuda?</h3>
                                        <p>Si tienes alguna pregunta o necesitas asistencia, no dudes en contactarnos:</p>
                                        <ul>
                                            <li><strong>Email:</strong> egresados@utec.edu.sv</li>
                                            <li><strong>Teléfono:</strong> (503) 2275-8888</li>
                                            <li><strong>Horario de atención:</strong> Lunes a Viernes de 8:00 AM a 5:00 PM</li>
                                        </ul>
                                    </div>
                                    
                                    <p>Una vez más, <span class='destacado'>¡bienvenido(a) a la familia UTEC!</span> Estamos emocionados de tenerte con nosotros y esperamos que esta plataforma sea un puente para tu crecimiento profesional y personal.</p>
                                    
                                    <p>Atentamente,<br>
                                    <strong>Equipo del Sistema de Egresados UTEC</strong></p>
                                </div>
                                
                                <div class='footer'>
                                    <strong>Universidad Tecnológica de El Salvador</strong><br>
                                    Final Avenida Norte, San Salvador, El Salvador<br>
                                    © {DateTime.Now.Year} Universidad Tecnológica de El Salvador — Todos los derechos reservados.<br>
                                    <small>Este es un mensaje automático, por favor no respondas a este correo.</small>
                                </div>
                            </div>
                        </body>
                        </html>";

                using (SmtpClient cliente = new SmtpClient("smtp.gmail.com", 587))
                {
                    cliente.Credentials = new NetworkCredential(remitente, contraseña);
                    cliente.EnableSsl = true;

                    using (MailMessage mensaje = new MailMessage())
                    {
                        mensaje.From = new MailAddress(remitente, "Sistema de Egresados UTEC");
                        mensaje.To.Add(email);
                        mensaje.Subject = asunto;
                        mensaje.Body = cuerpo;
                        mensaje.IsBodyHtml = true;

                        cliente.Send(mensaje);
                    }
                }

                return Resultado.exito("Correo de bienvenida enviado correctamente.");
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al enviar el correo de bienvenida: " + ex.Message);
            }
        }
        public Resultado ValidarMensajeAutentificacion(string email, string codigo)
        {
            try
            {
                if (!codigos.ContainsKey(email))
                    return Resultado.error("No se ha enviado un código a este correo.");

                var (codigoGuardado, fecha, correo) = codigos[email];
                var tiempoTranscurrido = DateTime.Now - fecha;

                if (tiempoTranscurrido.TotalSeconds > 300)
                {
                    codigos.Remove(email);
                    return Resultado.error("El código ha expirado. Solicita uno nuevo.");
                }

                if (codigoGuardado != codigo)
                    return Resultado.error("El código ingresado no es válido.");

                codigos.Remove(email);

                return Resultado.exito("Código verificado correctamente.");
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al validar el código: " + ex.Message);
            }
        }

        public Resultado ValidarCodigoRecuperacion(string email, string codigo)
        {
            try
            {
                if (!_tokensRecuperacion.ContainsKey(email))
                    return Resultado.error("No se ha enviado un código a este correo.");

                var (tokenJwt, tokenSimple, expiracion, emailGuardado) = _tokensRecuperacion[email];

                if (DateTime.Now > expiracion)
                {
                    _tokensRecuperacion.Remove(email);
                    return Resultado.error("El código ha expirado. Solicita uno nuevo.");
                }

                if (tokenSimple != codigo.ToUpper()) 
                    return Resultado.error("El código ingresado no es válido.");

                return Resultado.exito("Código verificado correctamente", tokenJwt); 
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al validar el código: " + ex.Message);
            }
        }

        public Resultado ValidarTokenJWT(string tokenJwt, string email)
        {
            try
            {
                var resultado = _tokenService.ValidarTokenRecuperacion(tokenJwt,email);
                if (!resultado.Exito)
                    return Resultado.error(resultado.Mensaje);

                if (resultado.Datos?.ToString() != email)
                    return Resultado.error("Token inválido para este usuario.");

                return Resultado.exito("Token válido");
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al validar el token: " + ex.Message);
            }
        }
        public Resultado ReenviarCodigoVerificacion(string email)
        {
            try
            {
                return EnviarMensajeAutentificacion(email);
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al reenviar el código de verificación: " + ex.Message);
            }
        }

        public void RemoverToken(string email)
        {
            if (_tokensRecuperacion.ContainsKey(email))
            {
                _tokensRecuperacion.Remove(email);
            }
        }

        public void LimpiarTokensExpirados()
        {
            var tokensExpirados = _tokensRecuperacion
                .Where(x => DateTime.Now > x.Value.expiracion)
                .Select(x => x.Key)
                .ToList();

            foreach (var token in tokensExpirados)
            {
                _tokensRecuperacion.Remove(token);
            }
        }
        public void LimpiarCodigosExpirados()
        {
            var codigosExpirados = codigos
                .Where(x => (DateTime.Now - x.Value.fecha).TotalSeconds > 300)
                .Select(x => x.Key)
                .ToList();

            foreach (var email in codigosExpirados)
            {
                codigos.Remove(email);
            }

            if (codigosExpirados.Count > 0)
            {
                System.Diagnostics.Debug.WriteLine(
                    $"[{DateTime.Now}] Se limpiaron {codigosExpirados.Count} códigos de verificación expirados."
                );
            }
        }
    }
}