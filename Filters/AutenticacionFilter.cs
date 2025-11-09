using SistemaEgresados.Models;
using System;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;
using System.Web.Security;
using Newtonsoft.Json;

namespace SistemaEgresados.Filters
{
    public class AutenticacionFilter : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            string controllerName = filterContext.RouteData.Values["controller"].ToString();
            string actionName = filterContext.RouteData.Values["action"].ToString();

            if (controllerName.Equals("Bienvenido", StringComparison.OrdinalIgnoreCase) &&
                (actionName.Equals("Index", StringComparison.OrdinalIgnoreCase) ||
                 actionName.Equals("Autenticar", StringComparison.OrdinalIgnoreCase)))
            {
                if (filterContext.HttpContext.Session["Usuario"] != null)
                {
                    RedirigirSegunTipoUsuario(filterContext);
                    return;
                }

                if (IntentarRestaurarSesionDesdeCookie(filterContext))
                {
                    RedirigirSegunTipoUsuario(filterContext);
                    return;
                }

                base.OnActionExecuting(filterContext);
                return;
            }


            if (filterContext.HttpContext.Session["Usuario"] != null)
            {
                base.OnActionExecuting(filterContext);
                return;
            }

            if (IntentarRestaurarSesionDesdeCookie(filterContext))
            {
                base.OnActionExecuting(filterContext);
                return;
            }

            filterContext.Result = new RedirectToRouteResult(
                new RouteValueDictionary
                {
                { "controller", "Bienvenido" },
                { "action", "Autenticar" }
                }
            );
        }

        private bool IntentarRestaurarSesionDesdeCookie(ActionExecutingContext filterContext)
        {
            HttpCookie authCookie = filterContext.HttpContext.Request.Cookies[FormsAuthentication.FormsCookieName];
            if (authCookie != null && !string.IsNullOrEmpty(authCookie.Value))
            {
                try
                {
                    FormsAuthenticationTicket ticket = FormsAuthentication.Decrypt(authCookie.Value);
                    if (ticket != null && !ticket.Expired)
                    {
                        Usuario usuario = JsonConvert.DeserializeObject<Usuario>(ticket.UserData);

                        if (usuario != null)
                        {
                            filterContext.HttpContext.Session["Usuario"] = usuario;
                            filterContext.HttpContext.Session["UsuarioEmail"] = ticket.Name;
                            filterContext.HttpContext.Session["UsuarioId"] = usuario.referencia_id;

                            if (ticket.IsPersistent)
                            {
                                FormsAuthenticationTicket nuevoTicket = FormsAuthentication.RenewTicketIfOld(ticket);
                                if (nuevoTicket != ticket)
                                {
                                    string ticketEncriptado = FormsAuthentication.Encrypt(nuevoTicket);
                                    HttpCookie nuevaCookie = new HttpCookie(FormsAuthentication.FormsCookieName, ticketEncriptado)
                                    {
                                        HttpOnly = true,
                                        Secure = FormsAuthentication.RequireSSL,
                                        Path = FormsAuthentication.FormsCookiePath,
                                        Expires = nuevoTicket.Expiration
                                    };
                                    filterContext.HttpContext.Response.Cookies.Add(nuevaCookie);
                                }
                            }

                            return true;
                        }
                    }
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine($"Error restaurando sesión: {ex.Message}");
                    FormsAuthentication.SignOut();
                    filterContext.HttpContext.Session.Clear();
                }
            }
            return false;
        }

        private void RedirigirSegunTipoUsuario(ActionExecutingContext filterContext)
        {
            var usuario = filterContext.HttpContext.Session["Usuario"] as Usuario;
            if (usuario == null) return;

            string controllerActual = filterContext.RouteData.Values["controller"].ToString();

            switch (usuario.tipo_usuario)
            {
                case "Egresado":
                    if (!controllerActual.Equals("Egresado", StringComparison.OrdinalIgnoreCase))
                    {
                        filterContext.Result = new RedirectToRouteResult(
                            new RouteValueDictionary
                            {
                            { "controller", "Egresado" },
                            { "action", "Index" }
                            }
                        );
                    }
                    break;

                case "UsuarioEmpresa":
                    if (!controllerActual.Equals("Empresas", StringComparison.OrdinalIgnoreCase))
                    {
                        filterContext.Result = new RedirectToRouteResult(
                            new RouteValueDictionary
                            {
                            { "controller", "Empresas" },
                            { "action", "Index" }
                            }
                        );
                    }
                    break;

                case "Administrador":
                    if (!controllerActual.Equals("Administracion", StringComparison.OrdinalIgnoreCase) &&
                        !controllerActual.Equals("Home", StringComparison.OrdinalIgnoreCase))
                    {
                        filterContext.Result = new RedirectToRouteResult(
                            new RouteValueDictionary
                            {
                            { "controller", "Administracion" },
                            { "action", "Index" }
                            }
                        );
                    }
                    break;
            }
        }
    }
}