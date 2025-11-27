using SistemaEgresados.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace SistemaEgresados.Filters
{
    public class AutorizacionRolesFilter : ActionFilterAttribute
    {
        private readonly string[] _rolesPermitidos;
        private readonly string _controllerRedireccionLogin;
        private readonly string _actionRedireccionLogin;

        public AutorizacionRolesFilter(params string[] rolesPermitidos)
        {
            _rolesPermitidos = rolesPermitidos ?? new string[0];
            _controllerRedireccionLogin = "Bienvenido";
            _actionRedireccionLogin = "Index";
        }

        public AutorizacionRolesFilter(string controllerLogin, string actionLogin, params string[] rolesPermitidos)
        {
            _rolesPermitidos = rolesPermitidos ?? new string[0];
            _controllerRedireccionLogin = controllerLogin;
            _actionRedireccionLogin = actionLogin;
        }

        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            if (filterContext.HttpContext.Session["Usuario"] == null)
            {
                RedirigirALogin(filterContext);
                return;
            }

            if (!TienePermisosNecesarios(filterContext.HttpContext))
            {
                RedirigirAccesoDenegado(filterContext);
                return;
            }

            base.OnActionExecuting(filterContext);
        }

        private bool TienePermisosNecesarios(HttpContextBase httpContext)
        {
            var usuario = httpContext.Session["Usuario"] as Usuario;

            if (usuario?.tipo_usuario == null)
                return false;

            return _rolesPermitidos.Any(rol =>
                rol.Equals(usuario.tipo_usuario, StringComparison.OrdinalIgnoreCase));
        }

        private void RedirigirALogin(ActionExecutingContext filterContext)
        {
            filterContext.Result = new RedirectToRouteResult(
                new RouteValueDictionary
                {
                { "controller", _controllerRedireccionLogin },
                { "action", _actionRedireccionLogin }
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