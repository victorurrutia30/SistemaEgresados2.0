using SistemaEgresados.DTO;
using SistemaEgresados.Models;
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
                                background: #5D0A28;
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
                                    background: #5D0A28;
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
                                    background: green;
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

        public Resultado EnviarNotificacionPostulacionEmpresa(string emailEmpresa, string nombreReclutador,
            string tituloVacante, string nombreEgresado, string carreraEgresado, DateTime fechaPostulacion)
        {
            try
            {
                string asunto = $"📥 Nueva postulación para: {tituloVacante}";

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
                                padding: 25px;
                                text-align: center;
                            }}
                            .logo {{
                                font-size: 24px;
                                font-weight: bold;
                                margin-bottom: 5px;
                            }}
                            .subtitle {{
                                font-size: 16px;
                                opacity: 0.9;
                            }}
                            .content {{
                                padding: 30px;
                                line-height: 1.6;
                            }}
                            .saludo {{
                                font-size: 18px;
                                color: #0d6efd;
                                margin-bottom: 20px;
                                font-weight: bold;
                            }}
                            .info-postulacion {{
                                background: #f8f9fa;
                                padding: 20px;
                                border-radius: 8px;
                                margin: 20px 0;
                                border-left: 4px solid #0d6efd;
                            }}
                            .info-item {{
                                margin-bottom: 10px;
                                display: flex;
                                align-items: center;
                            }}
                            .info-label {{
                                font-weight: bold;
                                color: #8b1038;
                                min-width: 120px;
                            }}
                            .candidato-info {{
                                background: #e7f3ff;
                                padding: 20px;
                                border-radius: 8px;
                                margin: 20px 0;
                                border: 1px solid #0d6efd;
                            }}
                            .boton {{
                                display: inline-block;
                                background: green;
                                color: white;
                                padding: 12px 30px;
                                text-decoration: none;
                                border-radius: 5px;
                                font-weight: bold;
                                margin: 10px 0;
                            }}
                            .footer {{
                                background: #f1f3f5;
                                padding: 20px;
                                text-align: center;
                                font-size: 12px;
                                color: #6c757d;
                                line-height: 1.5;
                            }}
                            .badge {{
                                background: #8b1038;
                                color: white;
                                padding: 4px 8px;
                                border-radius: 4px;
                                font-size: 12px;
                                font-weight: bold;
                            }}
                            .urgente {{
                                background: #dc3545;
                                color: white;
                                padding: 10px;
                                border-radius: 5px;
                                text-align: center;
                                margin: 15px 0;
                            }}
                        </style>
                    </head>
                    <body>
                        <div class='container'>
                            <div class='header'>
                                <div class='logo'>Sistema de Egresados UTEC</div>
                                <div class='subtitle'>Plataforma de Empleabilidad</div>
                            </div>
                            
                            <div class='content'>
                                <div class='saludo'>¡Hola {WebUtility.HtmlEncode(nombreReclutador)}!</div>
                                
                                <p>Has recibido una nueva postulación para tu vacante a través del Sistema de Egresados UTEC.</p>
                                
                                <div class='info-postulacion'>
                                    <h3 style='color: #8b1038; margin-top: 0;'>📋 Información de la Vacante</h3>
                                    <div class='info-item'>
                                        <span class='info-label'>Puesto:</span>
                                        <span>{WebUtility.HtmlEncode(tituloVacante)}</span>
                                    </div>
                                    <div class='info-item'>
                                        <span class='info-label'>Fecha postulación:</span>
                                        <span>{fechaPostulacion:dd/MM/yyyy 'a las' hh:mm tt}</span>
                                    </div>
                                </div>
                                
                                <div class='candidato-info'>
                                    <h3 style='color: #0d6efd; margin-top: 0;'>Información del Candidato</h3>
                                    <div class='info-item'>
                                        <span class='info-label'>Nombre:</span>
                                        <span>{WebUtility.HtmlEncode(nombreEgresado)}</span>
                                    </div>
                                    <div class='info-item'>
                                        <span class='info-label'>Carrera:</span>
                                        <span>{WebUtility.HtmlEncode(carreraEgresado)}</span>
                                    </div>
                                    <div class='info-item'>
                                        <span class='info-label'>Estatus:</span>
                                        <span class='badge'>Egresado UTEC</span>
                                    </div>
                                </div>
                                
                                <div class='urgente'>
                                    <strong> ¡No dejes esperando al talento!</strong>
                                    <p style='margin: 5px 0 0 0; font-size: 14px;'>
                                        Revisa esta postulación pronto para no perder a un candidato calificado.
                                    </p>
                                </div>
                                
                                <p><strong>Acción recomendada:</strong></p>
                                <p>Te recomendamos revisar el perfil completo del candidato en el sistema para evaluar su postulación.</p>
                                
                                <div style='text-align: center; margin: 25px 0;'>
                                    <a href='#' class='boton'>Revisar Postulación en el Sistema</a>
                                </div>
                                
                                <p style='font-size: 14px; color: #6c757d;'>
                                    <i>Este es un mensaje automático generado por el Sistema de Egresados UTEC. 
                                    Por favor no respondas a este correo.</i>
                                </p>
                            </div>
                            
                            <div class='footer'>
                                <strong>Universidad Tecnológica de El Salvador</strong><br>
                                Final Avenida Norte, San Salvador, El Salvador<br>
                                Teléfono: (503) 2275-8888 | Email: egresados@utec.edu.sv<br>
                                © {DateTime.Now.Year} Universidad Tecnológica de El Salvador — Todos los derechos reservados.
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
                        mensaje.To.Add(emailEmpresa);
                        mensaje.Subject = asunto;
                        mensaje.Body = cuerpo;
                        mensaje.IsBodyHtml = true;

                        cliente.Send(mensaje);
                    }
                }

                return Resultado.exito("Notificación de postulación enviada correctamente.");
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al enviar la notificación de postulación: " + ex.Message);
            }
        }

        public Resultado EnviarCorreoVacanteRecomendada(string email, string nombreEgresado, Vacante vacante, string nombreEmpresa)
        {
            try
            {
                string asunto = $"💼 Nueva vacante recomendada: {vacante.titulo}";

                string rangoSalarial = "";
                if (vacante.salario_confidencial == true)
                {
                    rangoSalarial = "<span style='color: #6c757d;'>Salario confidencial</span>";
                }
                else if (vacante.salario_min.HasValue && vacante.salario_max.HasValue)
                {
                    rangoSalarial = $"<strong>${vacante.salario_min:N2} - ${vacante.salario_max:N2}</strong>";
                }

                string fechaCierre = vacante.fecha_cierre.HasValue
                    ? vacante.fecha_cierre.Value.ToString("dd/MM/yyyy")
                    : "No especificada";

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
                            max-width: 650px;
                            margin: 0 auto;
                            background: #ffffff;
                            border-radius: 8px;
                            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                            overflow: hidden;
                        }}
                        .header {{
                            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                            color: white;
                            padding: 30px;
                            text-align: center;
                        }}
                        .header-icon {{
                            font-size: 48px;
                            margin-bottom: 10px;
                        }}
                        .logo {{
                            font-size: 24px;
                            font-weight: bold;
                            margin-bottom: 5px;
                        }}
                        .subtitle {{
                            font-size: 16px;
                            opacity: 0.9;
                        }}
                        .content {{
                            padding: 30px;
                            line-height: 1.6;
                        }}
                        .saludo {{
                            font-size: 20px;
                            color: #10b981;
                            margin-bottom: 20px;
                            font-weight: bold;
                        }}
                        .vacante-card {{
                            background: #f8f9fa;
                            padding: 25px;
                            border-radius: 8px;
                            margin: 20px 0;
                            border-left: 4px solid #10b981;
                        }}
                        .vacante-titulo {{
                            font-size: 24px;
                            color: #5D0A28;
                            margin: 0 0 10px 0;
                            font-weight: bold;
                        }}
                        .empresa {{
                            font-size: 18px;
                            color: #6c757d;
                            margin-bottom: 20px;
                            font-weight: 500;
                        }}
                        .detalle {{
                            display: flex;
                            align-items: center;
                            margin: 12px 0;
                            padding: 10px;
                            background: white;
                            border-radius: 5px;
                        }}
                        .detalle-icon {{
                            font-size: 20px;
                            margin-right: 10px;
                            min-width: 30px;
                        }}
                        .detalle-label {{
                            font-weight: 600;
                            color: #495057;
                            min-width: 120px;
                        }}
                        .detalle-value {{
                            color: #212529;
                        }}
                        .descripcion {{
                            background: white;
                            padding: 20px;
                            border-radius: 8px;
                            margin: 20px 0;
                            border: 1px solid #dee2e6;
                        }}
                        .descripcion h3 {{
                            color: #5D0A28;
                            margin-top: 0;
                            font-size: 18px;
                        }}
                        .requisitos {{
                            background: #fff3cd;
                            padding: 20px;
                            border-radius: 8px;
                            margin: 20px 0;
                            border: 1px solid #ffc107;
                        }}
                        .requisitos h3 {{
                            color: #856404;
                            margin-top: 0;
                            font-size: 18px;
                        }}
                        .requisitos ul {{
                            margin: 10px 0;
                            padding-left: 20px;
                        }}
                        .requisitos li {{
                            margin-bottom: 8px;
                        }}
                        .cta-section {{
                            background: linear-gradient(135deg, #e7f3ff 0%, #d4edff 100%);
                            padding: 25px;
                            border-radius: 8px;
                            margin: 25px 0;
                            text-align: center;
                            border: 2px solid #0d6efd;
                        }}
                        .cta-section h3 {{
                            color: #5D0A28;
                            margin-top: 0;
                        }}
                        .boton {{
                            display: inline-block;
                            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                            color: white;
                            padding: 15px 40px;
                            text-decoration: none;
                            border-radius: 5px;
                            font-weight: bold;
                            margin: 15px 0;
                            font-size: 16px;
                            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                        }}
                        .alerta {{
                            background: #fff3cd;
                            padding: 15px;
                            border-radius: 5px;
                            margin: 20px 0;
                            border-left: 4px solid #ffc107;
                            font-size: 14px;
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
                            color: #10b981;
                            font-weight: bold;
                        }}
                        .badge {{
                            display: inline-block;
                            padding: 5px 12px;
                            background: #10b981;
                            color: white;
                            border-radius: 20px;
                            font-size: 12px;
                            font-weight: 600;
                            margin: 5px 3px;
                        }}
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <div class='header-icon'>💼</div>
                            <div class='logo'>¡Nueva Oportunidad Laboral!</div>
                            <div class='subtitle'>Vacante que coincide con tu perfil</div>
                        </div>
                        
                        <div class='content'>
                            <div class='saludo'>¡Hola {WebUtility.HtmlEncode(nombreEgresado)}!</div>
                            
                            <p>Tenemos excelentes noticias para ti. Hemos encontrado una <strong>nueva vacante</strong> que coincide con tus preferencias y perfil profesional.</p>
                            
                            <div class='vacante-card'>
                                <div class='vacante-titulo'>{WebUtility.HtmlEncode(vacante.titulo)}</div>
                                <div class='empresa'> {WebUtility.HtmlEncode(nombreEmpresa)}</div>
                                
                                <div class='detalle'>
                                    <span class='detalle-icon'>📍</span>
                                    <span class='detalle-label'>Ubicación:</span>
                                    <span class='detalle-value'>{WebUtility.HtmlEncode(vacante.ubicacion ?? "No especificada")}</span>
                                </div>
                                
                                <div class='detalle'>
                                    <span class='detalle-icon'>💻</span>
                                    <span class='detalle-label'>Modalidad:</span>
                                    <span class='detalle-value'>{WebUtility.HtmlEncode(vacante.modalidad ?? "No especificada")}</span>
                                </div>
                                
                                <div class='detalle'>
                                    <span class='detalle-icon'>📋</span>
                                    <span class='detalle-label'>Tipo de contrato:</span>
                                    <span class='detalle-value'>{WebUtility.HtmlEncode(vacante.tipo_contrato ?? "No especificado")}</span>
                                </div>
                                
                                <div class='detalle'>
                                    <span class='detalle-icon'>🎯</span>
                                    <span class='detalle-label'>Área:</span>
                                    <span class='detalle-value'>{WebUtility.HtmlEncode(vacante.area ?? "No especificada")}</span>
                                </div>
                                
                                <div class='detalle'>
                                    <span class='detalle-icon'>💰</span>
                                    <span class='detalle-label'>Salario:</span>
                                    <span class='detalle-value'>{rangoSalarial}</span>
                                </div>
                                
                                <div class='detalle'>
                                    <span class='detalle-icon'>⏰</span>
                                    <span class='detalle-label'>Cierra:</span>
                                    <span class='detalle-value'>{fechaCierre}</span>
                                </div>
                            </div>
                            
                            {(!string.IsNullOrEmpty(vacante.descripcion) ? $@"
                            <div class='descripcion'>
                                <h3>📄 Descripción del puesto</h3>
                                <p>{WebUtility.HtmlEncode(vacante.descripcion)}</p>
                            </div>
                            " : "")}
                            
                            <div class='requisitos'>
                                <h3>✅ Requisitos</h3>
                                <p>{WebUtility.HtmlEncode(vacante.requisitos)}</p>
                            </div>
                            
                            <div class='cta-section'>
                                <h3>¿Te interesa esta oportunidad?</h3>
                                <p>Ingresa al sistema para ver más detalles y postularte</p>
                                <a href='#' class='boton'>Ver Vacante y Postularme</a>
                                <p style='margin-top: 15px; font-size: 14px; color: #6c757d;'>
                                    <em>No pierdas esta oportunidad, las plazas son limitadas</em>
                                </p>
                            </div>
                            
                            <div class='alerta'>
                                <strong>💡 Consejo:</strong> Asegúrate de que tu CV esté actualizado antes de postularte. 
                                Un perfil completo aumenta tus posibilidades de ser seleccionado.
                            </div>
                            
                            <p>Recuerda que puedes ajustar tus <strong>preferencias de notificación</strong> en cualquier momento desde tu perfil en el sistema.</p>
                            
                            <p style='margin-top: 30px;'>¡Mucho éxito en tu postulación!<br>
                            <strong>Equipo del Sistema de Egresados UTEC</strong></p>
                        </div>
                        
                        <div class='footer'>
                            <strong>Universidad Tecnológica de El Salvador</strong><br>
                            Sistema de Egresados - Conectando talento con oportunidades<br>
                            Final Avenida Norte, San Salvador, El Salvador<br>
                            © {DateTime.Now.Year} Universidad Tecnológica de El Salvador<br>
                            <small>Este correo es automático. Si no deseas recibir estas notificaciones, 
                            puedes desactivarlas desde tu perfil en el sistema.</small>
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

                return Resultado.exito("Correo de vacante recomendada enviado correctamente.");
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al enviar el correo de vacante: " + ex.Message);
            }
        }


        public Resultado EnviarCorreoInvitacionRegistroEmpresa(string email, string nombreEmpresa, string urlRegistro)
        {
            try
            {
                string asunto = "Invitación para registrar su empresa en el Sistema de Egresados UTEC";

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
                            background: #5D0A28;
                            color: white;
                            padding: 25px;
                            text-align: center;
                        }}
                        .logo {{
                            font-size: 24px;
                            font-weight: bold;
                        }}
                        .subtitle {{
                            font-size: 16px;
                            opacity: 0.9;
                        }}
                        .content {{
                            padding: 30px;
                            line-height: 1.6;
                        }}
                        .saludo {{
                            font-size: 20px;
                            color: #0d6efd;
                            font-weight: bold;
                        }}
                        .boton {{
                            display: inline-block;
                            background: green;
                            color: white;
                            padding: 12px 30px;
                            text-decoration: none;
                            border-radius: 5px;
                            font-weight: bold;
                            margin-top: 20px;
                        }}
                        .nota {{
                            font-size: 14px;
                            color: #6c757d;
                            margin-top: 15px;
                            line-height: 1.5;
                        }}
                        .footer {{
                            background: #f1f3f5;
                            padding: 20px;
                            text-align: center;
                            font-size: 12px;
                            color: #6c757d;
                            line-height: 1.5;
                        }}
                        .empresa {{
                            color: #8b1038;
                            font-weight: bold;
                        }}
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <div class='logo'>Sistema de Egresados UTEC</div>
                            <div class='subtitle'>Conectando empresas con el talento UTEC</div>
                        </div>

                        <div class='content'>
                            <p class='saludo'>Estimado representante de <span class='empresa'>{WebUtility.HtmlEncode(nombreEmpresa)}</span>,</p>
                            
                            <p>La <strong>Universidad Tecnológica de El Salvador (UTEC)</strong> le invita a registrar su empresa en nuestra plataforma de empleabilidad y egresados.</p>
                            
                            <p>A través del <strong>Sistema de Egresados UTEC</strong>, podrá publicar vacantes, recibir postulaciones y contactar directamente con profesionales egresados de nuestra universidad.</p>

                            <p>Para completar su registro, haga clic en el siguiente enlace seguro:</p>
                            
                            <div style='text-align:center;'>
                                <a href='{urlRegistro}' class='boton'>Registrar mi empresa</a>
                            </div>

                            <p class='nota'>
                                Si el botón no funciona, puede copiar y pegar este enlace en su navegador:<br/>
                                <a href='{urlRegistro}'>{urlRegistro}</a>
                            </p>

                            <p class='nota'>
                                <strong>Nota:</strong> Este enlace es personal y estará disponible por un tiempo limitado para garantizar la seguridad de su registro.
                            </p>

                            <p>¡Gracias por formar parte de la red de empleadores UTEC!</p>

                            <p>Atentamente,<br/>
                            <strong>Equipo del Sistema de Egresados UTEC</strong></p>
                        </div>

                        <div class='footer'>
                            <strong>Universidad Tecnológica de El Salvador</strong><br/>
                            Final Avenida Norte, San Salvador, El Salvador<br/>
                            Teléfono: (503) 2275-8888 | Email: egresados@utec.edu.sv<br/>
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

                return Resultado.exito("Invitación enviada correctamente.");
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al enviar la invitación: " + ex.Message);
            }
        }

        public Resultado EnviarCorreoBienvenidaEmpresa(string emailEmpresa, string nombreEmpresa, string nombreUsuario)
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
                                background: #5D0A28;
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
                                color: #8b1038;
                                margin-bottom: 20px;
                                font-weight: bold;
                            }}
                            .empresa-nombre {{
                                color: #0d6efd;
                                font-weight: bold;
                            }}
                            .beneficios {{
                                background: #f8f9fa;
                                padding: 20px;
                                border-radius: 8px;
                                margin: 20px 0;
                                border-left: 4px solid #8b1038;
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
                                background: #8b1038;
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
                                <div class='subtitle'>Plataforma de Empleabilidad Empresarial</div>
                            </div>
                            
                            <div class='content'>
                                <div class='saludo'>¡Hola {WebUtility.HtmlEncode(nombreUsuario)}!</div>
                                
                                <p>Es un placer darle la más cordial bienvenida a <span class='empresa-nombre'>{WebUtility.HtmlEncode(nombreEmpresa)}</span> al <strong>Sistema de Egresados de la Universidad Tecnológica de El Salvador</strong>.</p>
                                
                                <p>Su registro ha sido completado exitosamente y ahora forma parte de nuestra red de empresas aliadas, donde podrá conectar con el mejor talento egresado de UTEC.</p>
                                
                                <div class='beneficios'>
                                    <h3> ¿Qué puede hacer en nuestra plataforma?</h3>
                                    <ul>
                                        <li><strong>Publicar vacantes de empleo</strong> dirigidas exclusivamente a egresados UTEC</li>
                                        <li><strong>Recibir postulaciones</strong> de profesionales calificados en tiempo real</li>
                                        <li><strong>Acceder a perfiles profesionales</strong> de egresados con información actualizada</li>
                                        <li><strong>Gestionar su proceso de reclutamiento</strong> desde una sola plataforma</li>
                                        <li><strong>Fortalecer su marca empleadora</strong> entre la comunidad universitaria</li>
                                    </ul>
                                </div>
                                
                                <div class='acciones'>
                                    <h3> Comience ahora</h3>
                                    <p>Le invitamos a iniciar sesión y publicar su primera vacante para comenzar a recibir candidatos:</p>
                                    <a href='#' class='boton'>Ir al Sistema</a>
                                    <p style='margin-top: 10px; font-size: 14px;'><em>Publique vacantes y encuentre al talento que su empresa necesita</em></p>
                                </div>
                                
                                <div class='contacto'>
                                    <h3>📞 ¿Necesita ayuda?</h3>
                                    <p>Si tiene alguna pregunta o necesita asistencia con la plataforma, no dude en contactarnos:</p>
                                    <ul>
                                        <li><strong>Email:</strong> egresados@utec.edu.sv</li>
                                        <li><strong>Teléfono:</strong> (503) 2275-8888</li>
                                        <li><strong>Horario de atención:</strong> Lunes a Viernes de 8:00 AM a 5:00 PM</li>
                                    </ul>
                                </div>
                                
                                <p>Una vez más, <span class='destacado'>¡bienvenido(a) a la red de empresas UTEC!</span> Estamos emocionados de tenerlos con nosotros y esperamos que esta alianza sea de gran beneficio para su organización.</p>
                                
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
                        mensaje.To.Add(emailEmpresa);
                        mensaje.Subject = asunto;
                        mensaje.Body = cuerpo;
                        mensaje.IsBodyHtml = true;

                        cliente.Send(mensaje);
                    }
                }

                return Resultado.exito("Correo de bienvenida enviado correctamente a la empresa.");
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al enviar el correo de bienvenida a la empresa: " + ex.Message);
            }
        }

        public Resultado EnviarCorreoEliminacionVacante(string emailEncargado, string nombreEncargado, string tituloVacante, string motivo)
        {
            try
            {
                string asunto = $"Notificación: Vacante \"{tituloVacante}\" eliminada del sistema";

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
                                background: #8b1538;
                                color: white;
                                padding: 25px;
                                text-align: center;
                            }}
                            .header h1 {{
                                font-size: 24px;
                                margin: 0;
                            }}
                            .content {{
                                padding: 30px;
                                line-height: 1.6;
                            }}
                            .saludo {{
                                font-size: 18px;
                                font-weight: bold;
                                color: #0d6efd;
                                margin-bottom: 15px;
                            }}
                            .detalle {{
                                background: #f8f9fa;
                                padding: 20px;
                                border-left: 5px solid #8b1538;
                                border-radius: 6px;
                                margin-top: 15px;
                            }}
                            .detalle strong {{
                                color: #8b1538;
                            }}
                            .footer {{
                                background: #f1f3f5;
                                padding: 15px;
                                text-align: center;
                                font-size: 12px;
                                color: #6c757d;
                                border-top: 1px solid #dee2e6;
                            }}
                            .footer small {{
                                display: block;
                                margin-top: 5px;
                            }}
                            .motivo {{
                                font-style: italic;
                                color: #333;
                                background: #fff3cd;
                                padding: 15px;
                                border-radius: 6px;
                                border: 1px solid #ffeeba;
                                margin-top: 10px;
                            }}
                        </style>
                    </head>
                    <body>
                        <div class='container'>
                            <div class='header'>
                                <h1>Sistema de Egresados UTEC</h1>
                                <p>Notificación de eliminación de vacante</p>
                            </div>

                            <div class='content'>
                                <div class='saludo'>Estimado(a) {WebUtility.HtmlEncode(nombreEncargado)},</div>

                                <p>Te informamos que la siguiente vacante ha sido <strong>eliminada</strong> del <strong>Sistema de Egresados de la Universidad Tecnológica de El Salvador</strong>:</p>
                                
                                <div class='detalle'>
                                    <p><strong>Título de la vacante:</strong> {WebUtility.HtmlEncode(tituloVacante)}</p>
                                    <p><strong>Fecha de eliminación:</strong> {DateTime.Now:dd/MM/yyyy hh:mm tt}</p>
                                </div>

                                <p style='margin-top:15px;'>El motivo de la eliminación proporcionado por el administrador fue:</p>
                                <div class='motivo'>
                                    {WebUtility.HtmlEncode(motivo)}
                                </div>

                                <p style='margin-top:20px;'>Si consideras que esta eliminación fue un error o necesitas más información, puedes comunicarte con el área de egresados.</p>

                                <p>Atentamente,<br>
                                <strong>Equipo del Sistema de Egresados UTEC</strong></p>
                            </div>

                            <div class='footer'>
                                <strong>Universidad Tecnológica de El Salvador</strong><br>
                                Final Avenida Norte, San Salvador, El Salvador<br>
                                © {DateTime.Now.Year} Universidad Tecnológica de El Salvador<br>
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
                        mensaje.To.Add(emailEncargado);
                        mensaje.Subject = asunto;
                        mensaje.Body = cuerpo;
                        mensaje.IsBodyHtml = true;

                        cliente.Send(mensaje);
                    }
                }

                return Resultado.exito("Correo de notificación de eliminación enviado correctamente.");
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al enviar el correo de eliminación: " + ex.Message);
            }
        }
        public Resultado EnviarCorreoEliminacionVacantePostulados(string emailPostulado, string nombrePostulado, string tituloVacante)
        {
            try
            {
                string asunto = $"Actualización sobre tu postulación a \"{tituloVacante}\"";

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
                                background: #8b1538;
                                color: white;
                                padding: 25px;
                                text-align: center;
                            }}
                            .header h1 {{
                                font-size: 24px;
                                margin: 0;
                            }}
                            .content {{
                                padding: 30px;
                                line-height: 1.6;
                            }}
                            .saludo {{
                                font-size: 18px;
                                font-weight: bold;
                                color: #0d6efd;
                                margin-bottom: 15px;
                            }}
                            .detalle {{
                                background: #f8f9fa;
                                padding: 20px;
                                border-left: 5px solid #8b1538;
                                border-radius: 6px;
                                margin-top: 15px;
                            }}
                            .detalle strong {{
                                color: #8b1538;
                            }}
                            .footer {{
                                background: #f1f3f5;
                                padding: 15px;
                                text-align: center;
                                font-size: 12px;
                                color: #6c757d;
                                border-top: 1px solid #dee2e6;
                            }}
                            .footer small {{
                                display: block;
                                margin-top: 5px;
                            }}
                            .boton {{
                                display: inline-block;
                                background: #0d6efd;
                                color: white;
                                padding: 12px 30px;
                                text-decoration: none;
                                border-radius: 5px;
                                font-weight: bold;
                                margin-top: 20px;
                            }}
                        </style>
                    </head>
                    <body>
                        <div class='container'>
                            <div class='header'>
                                <h1>Sistema de Egresados UTEC</h1>
                                <p>Actualización de postulación</p>
                            </div>

                            <div class='content'>
                                <div class='saludo'>Estimado(a) {WebUtility.HtmlEncode(nombrePostulado)},</div>

                                <p>Te informamos que la vacante a la que aplicaste en el <strong>Sistema de Egresados de la Universidad Tecnológica de El Salvador</strong> ha sido <strong>eliminada por la empresa</strong>.</p>
                                
                                <div class='detalle'>
                                    <p><strong>Título de la vacante:</strong> {WebUtility.HtmlEncode(tituloVacante)}</p>
                                    <p><strong>Fecha de notificación:</strong> {DateTime.Now:dd/MM/yyyy hh:mm tt}</p>
                                </div>

                                <p style='margin-top:15px;'>Agradecemos tu interés en esta oportunidad y te invitamos a seguir explorando otras vacantes disponibles en la plataforma.</p>

                                <a href='#' class='boton'>Ver otras vacantes</a>

                                <p style='margin-top:20px;'>Recuerda mantener tu perfil actualizado para aumentar tus posibilidades de éxito laboral.</p>

                                <p>Atentamente,<br>
                                <strong>Equipo del Sistema de Egresados UTEC</strong></p>
                            </div>

                            <div class='footer'>
                                <strong>Universidad Tecnológica de El Salvador</strong><br>
                                Final Avenida Norte, San Salvador, El Salvador<br>
                                © {DateTime.Now.Year} Universidad Tecnológica de El Salvador<br>
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
                        mensaje.To.Add(emailPostulado);
                        mensaje.Subject = asunto;
                        mensaje.Body = cuerpo;
                        mensaje.IsBodyHtml = true;

                        cliente.Send(mensaje);
                    }
                }

                return Resultado.exito("Correo de notificación enviado correctamente al postulado.");
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al enviar el correo al postulado: " + ex.Message);
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