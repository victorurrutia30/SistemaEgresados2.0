using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Web;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;

namespace SistemaEgresados
{
    public class MvcApplication : System.Web.HttpApplication
    {
        private static Timer _cleanupTimer;
        private readonly Servicios.Email _serviceEmail = new Servicios.Email();
        private static readonly object _lock = new object();
        private readonly ServicioWebSocket.WebSocketService _webSocketService = ServicioWebSocket.WebSocketService.Instance;
        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);
            _webSocketService.Start();
            IniciarLimpiezaAutomatica();
        }
        private void IniciarLimpiezaAutomatica()
        {
            int intervaloMinutos = 10;
            TimeSpan intervalo = TimeSpan.FromMinutes(intervaloMinutos);

            _cleanupTimer = new Timer(
                callback: LimpiarMemoria,
                state: null,
                dueTime: intervalo, 
                period: intervalo   
            );

        }

        private void LimpiarMemoria(object state)
        {
            lock (_lock)
            {
                try
                {
                    System.Diagnostics.Debug.WriteLine(
                        $"[{DateTime.Now}] Ejecutando limpieza de tokens y códigos expirados..."
                    );

                    _serviceEmail.LimpiarTokensExpirados();

                    _serviceEmail.LimpiarCodigosExpirados();

                    System.Diagnostics.Debug.WriteLine(
                        $"[{DateTime.Now}] Limpieza completada exitosamente."
                    );
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine(
                        $"[{DateTime.Now}] Error durante la limpieza: {ex.Message}"
                    );
                }
            }
        }

        protected void Application_End()
        {
            if (_cleanupTimer != null)
            {
                _cleanupTimer.Dispose();
                System.Diagnostics.Debug.WriteLine(
                    $"[{DateTime.Now}] Sistema de limpieza detenido."
                );
            }
        }
    }
}
