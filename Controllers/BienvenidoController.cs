using Newtonsoft.Json;
using SistemaEgresados.Filters;
using SistemaEgresados.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;

namespace SistemaEgresados.Controllers
{
    
    public class BienvenidoController : Controller
    {
        private readonly Servicios.Autenticar _servicioAutenticar = new Servicios.Autenticar();
        private readonly Servicios.Email _servicioEmail = new Servicios.Email();
        private readonly Servicios.TokenService _servicioToken = new Servicios.TokenService();
        [AutenticacionFilter]
        public ActionResult Index()
        {
            return View();
        }
        [AutenticacionFilter]
        public ActionResult Autenticar()
        {
            return View();
        }

        [HttpPost]
        public JsonResult AutenticarUsuario(string email, string password, bool recordarSesion = false)
        {
            try
            {
                var resultado = _servicioAutenticar.AutenticarUsuario(email, password);
                string url = "";

                if (resultado.Exito)
                {
                    var usuario = resultado.Datos as Usuario;

                    Session["Usuario"] = usuario;
                    Session["UsuarioEmail"] = email;
                    Session["UsuarioId"] = usuario.referencia_id;
                    Session["UsuarioNombre"] = _servicioAutenticar.NombreyApellido(email).Datos;

                    Session.Timeout = 30; 

                    string usuarioJson = JsonConvert.SerializeObject(usuario);

                    int duracionMinutos = recordarSesion ? 10080 : 1440; 

                    FormsAuthenticationTicket ticket = new FormsAuthenticationTicket(
                        1,
                        email,
                        DateTime.Now,
                        DateTime.Now.AddMinutes(duracionMinutos),
                        recordarSesion, 
                        usuarioJson,    
                        FormsAuthentication.FormsCookiePath
                    );

                    string ticketEncriptado = FormsAuthentication.Encrypt(ticket);

                    HttpCookie cookie = new HttpCookie(FormsAuthentication.FormsCookieName, ticketEncriptado);
                    cookie.HttpOnly = true;
                    cookie.Secure = FormsAuthentication.RequireSSL;
                    cookie.Path = FormsAuthentication.FormsCookiePath;

                    if (recordarSesion)
                    {
                        cookie.Expires = DateTime.Now.AddMinutes(duracionMinutos);
                    }

                    Response.Cookies.Add(cookie);

                    var tokenJWT = _servicioToken.GenerarToken(email, duracionMinutos);
                    Session["TokenJWT"] = tokenJWT;
                    HttpCookie tokenCookie = new HttpCookie("TokenJWT", tokenJWT);
                    tokenCookie.HttpOnly = true;
                    tokenCookie.Secure = true;
                    tokenCookie.Secure = FormsAuthentication.RequireSSL;
                    tokenCookie.SameSite = SameSiteMode.Strict;
                    tokenCookie.Path = "/";

                    if (recordarSesion)
                    {
                        tokenCookie.Expires = DateTime.Now.AddMinutes(duracionMinutos);
                    }

                    Response.Cookies.Add(tokenCookie);
                    switch (usuario.tipo_usuario)
                    {
                        case "Egresado":
                            url = "/Egresado/Index";
                            break;
                        case "Administrador":
                            url = "/Administracion/Index";
                            break;
                        case "UsuarioEmpresa":
                            url = "/Empresas/Index";
                            break;
                        default:
                            url = "/Bienvenido/Index";
                            break;
                    }

                    return Json(new
                    {
                        success = true,
                        mensaje = resultado.Mensaje,
                        usuario = resultado.Datos,
                        redirigir = url
                    }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Json(new
                    {
                        success = false,
                        message = resultado.Mensaje
                    }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    success = false,
                    message = "Error al autenticar usuario: " + ex.Message
                }, JsonRequestBehavior.AllowGet);
            }
        }
        [HttpPost]
        public JsonResult ObtenerCodigoRestablecer(string email)
        {
            _servicioEmail.LimpiarTokensExpirados();
            var resultadoUsuario = _servicioAutenticar.ObtenerUsuario(email);
            if (!resultadoUsuario.Exito)
            {
                return Json(new { success = false, message = resultadoUsuario.Mensaje }, JsonRequestBehavior.AllowGet);
            }
            var resultado = _servicioEmail.EnviarMensajeRecuperacionContrasena(email);
            if (resultado.Exito)
            {
                return Json(new { success = true, message = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
            }
            else
            {
                return Json(new { success = false, message = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
            }
        }
        [HttpPost]
        public JsonResult ValidarCodigo(string email, string codigo)
        {
            var resultado = _servicioEmail.ValidarCodigoRecuperacion(email, codigo);

            if (resultado.Exito)
            {
                string tokenJWT = resultado.Datos?.ToString();

                Session["TokenRecuperacion"] = tokenJWT;
                Session["EmailRecuperacion"] = email;

                return Json(new
                {
                    success = true,
                    message = resultado.Mensaje,
                    token = tokenJWT
                }, JsonRequestBehavior.AllowGet);
            }
            else
            {
                return Json(new
                {
                    success = false,
                    message = resultado.Mensaje
                }, JsonRequestBehavior.AllowGet);
            }
        }
        [HttpPost]
        public JsonResult CambiarContra(string email, string contrasena, string token)
        {
            try
            {
                var validacionToken = _servicioEmail.ValidarTokenJWT(token, email);
                if (!validacionToken.Exito)
                {
                    return Json(new
                    {
                        success = false,
                        message = validacionToken.Mensaje
                    }, JsonRequestBehavior.AllowGet);
                }

                var response = _servicioAutenticar.CambiarContra(email, contrasena);

                if (response.Exito)
                {
                    _servicioEmail.RemoverToken(email);
                    Session.Remove("TokenRecuperacion");
                    Session.Remove("EmailRecuperacion");

                    return Json(new
                    {
                        success = true,
                        message = response.Mensaje
                    }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Json(new
                    {
                        success = false,
                        message = response.Mensaje
                    }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    success = false,
                    message = "Error al cambiar la contraseña: " + ex.Message
                }, JsonRequestBehavior.AllowGet);
            }
        }
        public ActionResult CerrarSesion()
        {
            Session.Clear();
            Session.Abandon();

            FormsAuthentication.SignOut();

            if (Request.Cookies[FormsAuthentication.FormsCookieName] != null)
            {
                HttpCookie cookie = new HttpCookie(FormsAuthentication.FormsCookieName);
                cookie.Expires = DateTime.Now.AddDays(-1);
                Response.Cookies.Add(cookie);
            }
            if (Response.Cookies["TokenJWT"] != null)
            {
                Response.Cookies["TokenJWT"].Expires = DateTime.Now.AddDays(-1);
            }

            return RedirectToAction("Autenticar");
        }
    }
}