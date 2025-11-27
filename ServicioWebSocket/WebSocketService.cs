using Fleck;
using Newtonsoft.Json;
using SistemaEgresados.DTO;
using SistemaEgresados.Models;
using SistemaEgresados.Servicios;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Threading;

namespace SistemaEgresados.ServicioWebSocket
{
    public class WebSocketService
    {
        private static WebSocketService _instance;
        private readonly SistemaEgresadosUtecEntities _db = new SistemaEgresadosUtecEntities();
        private readonly TokenService _tokenService = new TokenService();
        private readonly ReaderWriterLockSlim _socketsLock = new ReaderWriterLockSlim();

        public static WebSocketService Instance => _instance ?? (_instance = new WebSocketService());

        private WebSocketServer _server;
        private readonly List<IWebSocketConnection> _allSockets = new List<IWebSocketConnection>();

        public void Start(string url = "ws://0.0.0.0:9999")
        {
            _server = new WebSocketServer(url);
            _server.Start(socket =>
            {
                socket.OnOpen = () =>
                {
                    string path = socket.ConnectionInfo.Path;
                    string token = null;

                    if (path.Contains("?"))
                    {
                        var query = path.Split('?')[1];
                        var parametros = System.Web.HttpUtility.ParseQueryString(query);
                        token = parametros["token"];
                    }

                    if (string.IsNullOrEmpty(token))
                    {
                        socket.Send(CrearMensajeJson("error", "Error: No se proporcionó token.","Sistema"));
                        socket.Close();
                        return;
                    }

                    var validacion = ValidarTokenUsuario(token);
                    if (!validacion.Exito)
                    {
                        socket.Send(CrearMensajeJson("error", "Token inválido: " + validacion.Mensaje,"Sistema"));
                        socket.Close();
                        return;
                    }

                    _socketsLock.EnterWriteLock();
                    try
                    {
                        _allSockets.Add(socket);
                    }
                    finally
                    {
                        _socketsLock.ExitWriteLock();
                    }

                    socket.Send(CrearMensajeJson("success", "Conectado al sistema correctamente.", "Sistema"));
                };

                socket.OnClose = () =>
                {
                    _socketsLock.EnterWriteLock();
                    try
                    {
                        _allSockets.Remove(socket);
                    }
                    finally
                    {
                        _socketsLock.ExitWriteLock();
                    }

                    Console.WriteLine($"❌ Usuario desconectado: {socket.ConnectionInfo.ClientIpAddress}");
                };

                socket.OnMessage = message =>
                {
                    List<IWebSocketConnection> socketsToSend;

                    _socketsLock.EnterReadLock();
                    try
                    {
                        socketsToSend = _allSockets.ToList();
                    }
                    finally
                    {
                        _socketsLock.ExitReadLock();
                    }

                    foreach (var s in socketsToSend)
                    {
                        try
                        {
                            if (s.IsAvailable)
                            {
                                s.Send(CrearMensajeJson("info", $"Eco del servidor: {message}","Sistema"));
                            }
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"⚠️ Error enviando eco: {ex.Message}");
                        }
                    }
                };
            });

        }

        public void EnviarMensajeGeneral(string mensaje, string tipo = "info",string por = "")
        {
            var payload = CrearMensajeJson(tipo, mensaje,por);

            List<IWebSocketConnection> socketsToSend;

            _socketsLock.EnterReadLock();
            try
            {
                socketsToSend = _allSockets.ToList();
            }
            finally
            {
                _socketsLock.ExitReadLock();
            }

            foreach (var socket in socketsToSend)
            {
                try
                {
                    if (socket.IsAvailable)
                    {
                        socket.Send(payload);
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"⚠️ Error enviando mensaje general: {ex.Message}");
                }
            }

        }

        public void NotificarEliminacionCuenta(string emailUsuario)
        {
            var mensaje = "Su cuenta ha sido eliminada. Ya no podrá seguir utilizando el sistema.";
            var payload = CrearMensajeJson("cuenta_eliminada", mensaje, "Sistema");

            List<IWebSocketConnection> socketsToNotify;

            _socketsLock.EnterReadLock();
            try
            {
                socketsToNotify = _allSockets.Where(socket =>
                {
                    try
                    {
                        string path = socket.ConnectionInfo.Path;
                        if (path.Contains("?"))
                        {
                            var query = path.Split('?')[1];
                            var parametros = System.Web.HttpUtility.ParseQueryString(query);
                            var token = parametros["token"];

                            if (!string.IsNullOrEmpty(token))
                            {
                                var validacion = ValidarTokenUsuario(token);
                                if (validacion.Exito && validacion.Datos?.ToString() == emailUsuario)
                                {
                                    return true;
                                }
                            }
                        }
                        return false;
                    }
                    catch
                    {
                        return false;
                    }
                }).ToList();
            }
            finally
            {
                _socketsLock.ExitReadLock();
            }

            foreach (var socket in socketsToNotify)
            {
                try
                {
                    if (socket.IsAvailable)
                    {
                        socket.Send(payload);

                        socket.Close();
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"⚠️ Error enviando notificación de eliminación: {ex.Message}");
                }
            }

            CleanupDisconnectedSockets();
        }
        public void NotificarVisualizacion(string emailUsuario, string nombreEmpresa = null)
        {
            var mensaje = !string.IsNullOrEmpty(nombreEmpresa)
                ? $"¡Buenas noticias! La empresa {nombreEmpresa} ha visualizado tu CV"
                : "¡Buenas noticias! Una empresa ha visualizado tu CV";

            var payload = CrearMensajeJson("se_VisualizoCV", mensaje, "Sistema");

            List<IWebSocketConnection> socketsToNotify;

            _socketsLock.EnterReadLock();
            try
            {
                socketsToNotify = _allSockets.Where(socket =>
                {
                    try
                    {
                        string path = socket.ConnectionInfo.Path;
                        if (path.Contains("?"))
                        {
                            var query = path.Split('?')[1];
                            var parametros = System.Web.HttpUtility.ParseQueryString(query);
                            var token = parametros["token"];

                            if (!string.IsNullOrEmpty(token))
                            {
                                var validacion = ValidarTokenUsuario(token);
                                if (validacion.Exito && validacion.Datos?.ToString() == emailUsuario)
                                {
                                    return true;
                                }
                            }
                        }
                        return false;
                    }
                    catch
                    {
                        return false;
                    }
                }).ToList();
            }
            finally
            {
                _socketsLock.ExitReadLock();
            }

            foreach (var socket in socketsToNotify)
            {
                try
                {
                    if (socket.IsAvailable)
                    {
                        socket.Send(payload);
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"⚠️ Error enviando notificación de visualización: {ex.Message}");
                }
            }
        }
        public void NotificarCancelacionPostulacion(string emailUsuario)
        {
            var mensaje = "Actualizar Postulaciones";

            var payload = CrearMensajeJson("se_canceloPostulacion", mensaje, "Sistema");

            List<IWebSocketConnection> socketsToNotify;

            _socketsLock.EnterReadLock();
            try
            {
                socketsToNotify = _allSockets.Where(socket =>
                {
                    try
                    {
                        string path = socket.ConnectionInfo.Path;
                        if (path.Contains("?"))
                        {
                            var query = path.Split('?')[1];
                            var parametros = System.Web.HttpUtility.ParseQueryString(query);
                            var token = parametros["token"];

                            if (!string.IsNullOrEmpty(token))
                            {
                                var validacion = ValidarTokenUsuario(token);
                                if (validacion.Exito && validacion.Datos?.ToString() == emailUsuario)
                                {
                                    return true;
                                }
                            }
                        }
                        return false;
                    }
                    catch
                    {
                        return false;
                    }
                }).ToList();
            }
            finally
            {
                _socketsLock.ExitReadLock();
            }

            foreach (var socket in socketsToNotify)
            {
                try
                {
                    if (socket.IsAvailable)
                    {
                        socket.Send(payload);
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"⚠️ Error enviando notificación de visualización: {ex.Message}");
                }
            }
        }
        public void NotificarNuevaPostulacion(string emailUsuario)
        {
            var mensaje = "Actualizar Postulaciones";

            var payload = CrearMensajeJson("nueva_Postulacion", mensaje, "Sistema");

            List<IWebSocketConnection> socketsToNotify;

            _socketsLock.EnterReadLock();
            try
            {
                socketsToNotify = _allSockets.Where(socket =>
                {
                    try
                    {
                        string path = socket.ConnectionInfo.Path;
                        if (path.Contains("?"))
                        {
                            var query = path.Split('?')[1];
                            var parametros = System.Web.HttpUtility.ParseQueryString(query);
                            var token = parametros["token"];

                            if (!string.IsNullOrEmpty(token))
                            {
                                var validacion = ValidarTokenUsuario(token);
                                if (validacion.Exito && validacion.Datos?.ToString() == emailUsuario)
                                {
                                    return true;
                                }
                            }
                        }
                        return false;
                    }
                    catch
                    {
                        return false;
                    }
                }).ToList();
            }
            finally
            {
                _socketsLock.ExitReadLock();
            }

            foreach (var socket in socketsToNotify)
            {
                try
                {
                    if (socket.IsAvailable)
                    {
                        socket.Send(payload);
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"⚠️ Error enviando notificación de visualización: {ex.Message}");
                }
            }
        }
        public void NotificarActualizacionAdministracion()
        {
            var mensaje = "actualizar_dashboard";
            var payload = CrearMensajeJson("actualizacion", mensaje, "Sistema");

            List<IWebSocketConnection> socketsToNotify;

            _socketsLock.EnterReadLock();
            try
            {
                socketsToNotify = _allSockets.Where(socket =>
                {
                    try
                    {
                        string path = socket.ConnectionInfo.Path;
                        if (path.Contains("?"))
                        {
                            var query = path.Split('?')[1];
                            var parametros = System.Web.HttpUtility.ParseQueryString(query);
                            var token = parametros["token"];

                            if (!string.IsNullOrEmpty(token))
                            {
                                var validacion = ValidarTokenUsuario(token);
                                if (validacion.Exito)
                                {
                                    var usuario = _db.Usuarios.FirstOrDefault(u => u.email == validacion.Datos.ToString());
                                    return usuario?.tipo_usuario == "Administrador";
                                }
                            }
                        }
                        return false;
                    }
                    catch
                    {
                        return false;
                    }
                }).ToList();
            }
            finally
            {
                _socketsLock.ExitReadLock();
            }

            foreach (var socket in socketsToNotify)
            {
                try
                {
                    if (socket.IsAvailable)
                    {
                        socket.Send(payload);
                        Console.WriteLine($"✅ Notificación de actualización enviada a admin");
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"⚠️ Error enviando notificación a admin: {ex.Message}");
                }
            }
        }

        private Resultado ValidarTokenUsuario(string token)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var jwtToken = tokenHandler.ReadJwtToken(token);
                var email = jwtToken.Claims.FirstOrDefault(c =>
                    c.Type == "email" || c.Type == System.Security.Claims.ClaimTypes.Email)?.Value;

                if (string.IsNullOrEmpty(email))
                    return Resultado.error("El token no contiene correo electrónico.");

                var resultado = _tokenService.ValidarTokenAutenticacion(token, email);
                if (!resultado.Exito)
                    return resultado;

                var usuario = _db.Usuarios.FirstOrDefault(u => u.email == email);
                if (usuario == null)
                    return Resultado.error("El usuario no existe en la base de datos.");

                return Resultado.exito("Token válido", email);
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al validar token: " + ex.Message);
            }
        }

        public void CleanupDisconnectedSockets()
        {
            _socketsLock.EnterWriteLock();
            try
            {
                _allSockets.RemoveAll(socket => !socket.IsAvailable);
            }
            finally
            {
                _socketsLock.ExitWriteLock();
            }
        }
        private string CrearMensajeJson(string tipo, string mensaje,string por)
        {
            var objeto = new
            {
                tipo = tipo,
                Por = por,
                mensaje = mensaje,
                fecha = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss")
            };

            return JsonConvert.SerializeObject(objeto);
        }
    }
}