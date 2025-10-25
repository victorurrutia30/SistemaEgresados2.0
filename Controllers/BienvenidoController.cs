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
    [AutenticacionFilter]
    public class BienvenidoController : Controller
    {
        private readonly Servicios.Autenticar _servicioAutenticar = new Servicios.Autenticar();
        private readonly Servicios.Email _servicioEmail = new Servicios.Email();
        private readonly Servicios.TokenService _servicioToken = new Servicios.TokenService();
        public ActionResult Index()
        {
            return View();
        }
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
                    Session["Usuario"] = resultado.Datos;
                    Session["UsuarioEmail"] = email;
                    Session["UsuarioId"] = resultado.Datos;                    


                    if (recordarSesion)
                    {
                        Session.Timeout = 10080; 
                    }
                    else
                    {
                        Session.Timeout = 1440; 
                    }

                    int duracionMinutos = recordarSesion ? 10080 : 1440;

                    FormsAuthenticationTicket ticket = new FormsAuthenticationTicket(
                        1,                                     
                        email,                                  
                        DateTime.Now,                           
                        DateTime.Now.AddMinutes(duracionMinutos), 
                        recordarSesion,                         
                        resultado.Datos.ToString(),             
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
                    var usuario = resultado.Datos as Usuario;
                    Session["UsuarioNombre"] = _servicioAutenticar.NombreyApellido(email).Datos;
                    if (usuario.tipo_usuario == "Egresado")
                    {
                        url = "/Egresado/Index";
                    }
                    else if (usuario.tipo_usuario == "Administrador")
                    {
                        url = "/Admin/Index";
                    }
                    else if (usuario.tipo_usuario == "UsuarioEmpresa")
                    {
                        url = "/Empresas/Index";
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
                    return Json(new { success = false, message = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Error al autenticar usuario: " + ex.Message }, JsonRequestBehavior.AllowGet);
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

            return RedirectToAction("Autenticar");
        }
    }
}