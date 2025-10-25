using SistemaEgresados.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace SistemaEgresados.Filters
{
    public class AutorizacionEgresadoAdminFilter : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            if (filterContext.HttpContext.Session["Usuario"] == null)
            {
                RedirigirALogin(filterContext);
                return;
            }

            if (!TienePermisosEgresadoAdmin(filterContext.HttpContext))
            {
                RedirigirAccesoDenegado(filterContext);
                return;
            }

            base.OnActionExecuting(filterContext);
        }

        private bool TienePermisosEgresadoAdmin(HttpContextBase httpContext)
        {
            var usuario = httpContext.Session["Usuario"] as Usuario;            

            if (usuario != null)
            {
                if (usuario.tipo_usuario != null)
                {
                    return usuario.tipo_usuario.Equals("Egresado", StringComparison.OrdinalIgnoreCase) ||
                        usuario.tipo_usuario.Equals("Administrador", StringComparison.OrdinalIgnoreCase);
                }
            }           

            return false;
        }

        private void RedirigirALogin(ActionExecutingContext filterContext)
        {
            filterContext.Result = new RedirectToRouteResult(
                new RouteValueDictionary
                {
                    { "controller", "Bienvenido" },
                    { "action", "Index" }
                }
            );
        }

        private void RedirigirAccesoDenegado(ActionExecutingContext filterContext)
        {
            filterContext.Result = new RedirectToRouteResult(
                new RouteValueDictionary
                {
                    { "controller", "AccesoDenegado" },
                    { "action", "Index" }
                }
            );
        }
    }
}