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

            if (filterContext.HttpContext.Session["Usuario"] != null)
            {
                RedirigirSegunTipoUsuario(filterContext);
                return;
            }

            if (IntentarRestaurarSesionDesdeCookie(filterContext))
            {
                if (actionName.Equals("Autenticar", StringComparison.OrdinalIgnoreCase))
                {
                    RedirigirSegunTipoUsuario(filterContext);
                    return;
                }

                base.OnActionExecuting(filterContext);
                return;
            }

            if (actionName.Equals("Autenticar", StringComparison.OrdinalIgnoreCase))
            {
                base.OnActionExecuting(filterContext);
                return;
            }

            if (controllerName.Equals("Bienvenido", StringComparison.OrdinalIgnoreCase))
            {
                base.OnActionExecuting(filterContext);
                return;
            }

            filterContext.Result = new RedirectToRouteResult(
                new RouteValueDictionary
                {
                    { "controller", "Bienvenido" },
                    { "action", "Index" }
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

                        filterContext.HttpContext.Session["Usuario"] = usuario;
                        filterContext.HttpContext.Session["UsuarioEmail"] = ticket.Name;

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
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine($"Error restaurando sesión: {ex.Message}");
                    FormsAuthentication.SignOut();
                }
            }
            return false;
        }

        private void RedirigirSegunTipoUsuario(ActionExecutingContext filterContext)
        {
            var usuario = filterContext.HttpContext.Session["Usuario"] as Usuario;
            if (usuario == null) return;

            string controllerName = filterContext.RouteData.Values["controller"].ToString();
            string actionName = filterContext.RouteData.Values["action"].ToString();

            if ((usuario.tipo_usuario == "Egresado" && controllerName.Equals("Egresado", StringComparison.OrdinalIgnoreCase)) ||
                (usuario.tipo_usuario == "Administrador" && controllerName.Equals("Home", StringComparison.OrdinalIgnoreCase)))
            {
                base.OnActionExecuting(filterContext);
                return;
            }

            if (usuario.tipo_usuario == "Egresado")
            {
                filterContext.Result = new RedirectToRouteResult(
                    new RouteValueDictionary
                    {
                        { "controller", "Egresado" },
                        { "action", "Index" }
                    }
                );
            }
            else if (usuario.tipo_usuario == "UsuarioEmpresa")
            {
                filterContext.Result = new RedirectToRouteResult(
                    new RouteValueDictionary
                    {
                        { "controller", "Empresas" },
                        { "action", "Index" }
                    }
                );
            }
            else if (usuario.tipo_usuario == "Administrador")
            {
                filterContext.Result = new RedirectToRouteResult(
                    new RouteValueDictionary
                    {
                        { "controller", "Home" },
                        { "action", "Index" }
                    }
                );
            }
        }
    }
}