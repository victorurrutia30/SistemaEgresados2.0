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
    public class RegistrarController : Controller
    {
        private readonly Servicios.Preguntas _servicioPreguntas = new Servicios.Preguntas();
        private readonly Servicios.Registrar _servicioRegistro = new Servicios.Registrar();
        private readonly Servicios.Email _servicioEmail = new Servicios.Email();
        private readonly Servicios.Autenticar _servicioAutenticar = new Servicios.Autenticar();
        private readonly Servicios.TokenService _servicioToken = new Servicios.TokenService();
        public ActionResult Index()
        {
            if (Session["Usuario"] != null)
            {
                return RedirectToAction("Index", "Home");
            }
            return View();
        }

        [HttpGet]
        public JsonResult ObtenerPreguntas(bool trabaja)
        {
            var resultado = _servicioPreguntas.ObtenerPreguntas(trabaja);
            if (!resultado.Exito)
            {
                return Json(new { success = false, message = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
            }
            return Json(new { success = true, data = resultado.Datos }, JsonRequestBehavior.AllowGet);
        }
        [HttpGet]
        public JsonResult ObtenerIdiomas()
        {
            var resultado = _servicioPreguntas.ObtenerIdiomas();
            if (!resultado.Exito)
            {
                return Json(new { success = false, message = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
            }
            return Json(new { success = true, data = resultado.Datos }, JsonRequestBehavior.AllowGet);
        }
        [HttpPost]
        public JsonResult AgregarIdioma(string idioma)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(idioma))
                {
                    return Json(new { success = false, message = "El nombre del idioma es requerido" });
                }

                var resultado = _servicioPreguntas.AgregarIdioma(idioma.Trim());

                if (!resultado.Exito)
                {
                    return Json(new { success = false, message = resultado.Mensaje });
                }

                return Json(new { success = true, message = resultado.Mensaje, data = resultado.Datos });
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    success = false,
                    message = "Error al agregar el idioma: " + ex.Message
                });
            }
        }
        [HttpGet]
        public JsonResult ObtenerCarreras()
        {
            var resultado = _servicioRegistro.Carreras();
            if (!resultado.Exito)
            {
                return Json(new { success = false, message = resultado.Mensaje,data = resultado.Datos }, JsonRequestBehavior.AllowGet);
            }
            return Json(new { success = true, message = resultado.Mensaje ,data = resultado.Datos }, JsonRequestBehavior.AllowGet);
        }
        [HttpPost]
        [ValidateAntiForgeryToken]
        public JsonResult RegistrarEgresado(Egresado egresado)
        {
            var resultado = _servicioRegistro.RegistrarEgresado(egresado);
            if (!resultado.Exito)
            {
                return Json(new { success = false, message = resultado.Mensaje },JsonRequestBehavior.AllowGet);
            }
            return Json(new { success = true, message = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
        }
        [HttpPost]
        public JsonResult EnviarCodigo(string email)
        {
            var resultado = _servicioEmail.EnviarMensajeAutentificacion(email);
            if (!resultado.Exito)
            {
                return Json(new { success = false, message = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
            }
            return Json(new { success = true, message = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
        }
        [HttpPost]
        public JsonResult ValidarCodigo(string codigo,string email)
        {
            var resultado = _servicioRegistro.ValidarCodigo(email, codigo);
            if (!resultado.Exito)
            {
                return Json(new { success = false, message = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
            }
            var usuario = _servicioAutenticar.ObtenerUsuario(email).Datos as Usuario;
            Session["Usuario"] = usuario;
            Session["UsuarioEmail"] = email;
            Session["UsuarioId"] = usuario.referencia_id;
            bool recordarSesion = false;
            int duracionMinutos = recordarSesion ? 10080 : 1440;
            var ticket = new FormsAuthenticationTicket(
                1,
                email,
                DateTime.Now,
                DateTime.Now.AddMinutes(duracionMinutos),
                recordarSesion,
                usuario.tipo_usuario,
                FormsAuthentication.FormsCookiePath
            );

            string ticketEncriptado = FormsAuthentication.Encrypt(ticket);

            var cookie = new HttpCookie(FormsAuthentication.FormsCookieName, ticketEncriptado)
            {
                HttpOnly = true,
                Secure = FormsAuthentication.RequireSSL,
                Path = FormsAuthentication.FormsCookiePath
            };

            if (recordarSesion)
                cookie.Expires = DateTime.Now.AddMinutes(duracionMinutos);

            Response.Cookies.Add(cookie);
            var tokenJWT = _servicioToken.GenerarToken(email, duracionMinutos);
            Session["TokenJWT"] = tokenJWT;
            return Json(new { success = true, message = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
        }
        [HttpPost]        
        public JsonResult ReenviarCodigoVerificacion(string email)
        {
            var resultado = _servicioEmail.ReenviarCodigoVerificacion(email);
            if (!resultado.Exito)
            {
                return Json(new { success = false, message = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
            }
            return Json(new { success = true, message = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
        }
        [HttpPost]
        public JsonResult RegistrarPreferencias(string email)
        {
            var resultado = _servicioRegistro.Privacidad(email);
            if (!resultado.Exito)
            {
                return Json(new { success = false, message = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
            }
            return Json(new { success = true, message = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
        }
        [HttpPost]
        public JsonResult ResponderPreguntas(string respuestas, HttpPostedFileBase CV, string idiomasJson,
            decimal experiencia, string habilidades, bool trabaja)
        {
            try
            {
                if (Session["Usuario"] == null)
                {
                    return Json(new { success = false, message = "Sesión expirada" });
                }

                int idEgresado = (Session["Usuario"] as Usuario).referencia_id.Value;

                var respuestasEncuesta = JsonConvert.DeserializeObject<List<Respuestas_Encuesta>>(respuestas);
                List<Egresado_Idiomas> IdsIdiomas = JsonConvert.DeserializeObject<List<Egresado_Idiomas>>(idiomasJson);
                if (respuestasEncuesta == null || respuestasEncuesta.Count == 0)
                {
                    return Json(new { success = false, message = "No se recibieron respuestas de la encuesta" });
                }

                if (!trabaja)
                {
                    if (CV == null || CV.ContentLength == 0)
                    {
                        return Json(new { success = false, message = "El CV es requerido" });
                    }
                }

                if (IdsIdiomas == null || IdsIdiomas.Count == 0)
                {
                    return Json(new { success = false, message = "Debe seleccionar al menos un idioma" });
                }

                if (experiencia < 0)
                {
                    return Json(new { success = false, message = "La experiencia no puede ser negativa" });
                }

                if (string.IsNullOrWhiteSpace(habilidades))
                {
                    return Json(new { success = false, message = "Las habilidades son requeridas" });
                }

                var resultado = _servicioRegistro.ResponderPreguntas(
                    respuestasEncuesta,
                    idEgresado,
                    CV,
                    IdsIdiomas,
                    experiencia,
                    habilidades,
                    trabaja
                );

                if (!resultado.Exito)
                {
                    return Json(new { success = false, message = resultado.Mensaje });
                }

                return Json(new { success = true, message = resultado.Mensaje });
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    success = false,
                    message = "Error al procesar la solicitud: " + ex.Message
                });
            }
        }
    }
}