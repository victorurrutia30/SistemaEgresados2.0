using Fleck;
using SistemaEgresados.DTO;
using SistemaEgresados.Models;
using SistemaEgresados.Servicios;
using System;
using System.Collections.Generic;
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
                        socket.Send("Error: No se proporcionó token.");
                        socket.Close();
                        return;
                    }

                    var validacion = ValidarTokenUsuario(token);
                    if (!validacion.Exito)
                    {
                        socket.Send("Token inválido: " + validacion.Mensaje);
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

                    Console.WriteLine($"Usuario conectado: {validacion.Datos} desde {socket.ConnectionInfo.ClientIpAddress}");
                    socket.Send("Usuario en linea!");
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
                    Console.WriteLine($"Usuario desconectado: {socket.ConnectionInfo.ClientIpAddress}");
                };

                socket.OnMessage = message =>
                {
                    Console.WriteLine($"Mensaje recibido: {message}");

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
                                s.Send($"Eco: {message}");
                            }
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"Error enviando mensaje: {ex.Message}");
                        }
                    }
                };
            });

            Console.WriteLine($"Servidor WebSocket iniciado en {url}");
        }

        private Resultado ValidarTokenUsuario(string token)
        {
            try
            {
                var tokenHandler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
                var jwtToken = tokenHandler.ReadJwtToken(token);
                var email = jwtToken.Claims.FirstOrDefault(c => c.Type == "email" || c.Type == System.Security.Claims.ClaimTypes.Email)?.Value;

                if (string.IsNullOrEmpty(email))
                    return Resultado.error("El token no contiene correo electrónico");

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
    }
}