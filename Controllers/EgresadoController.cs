using SistemaEgresados.DTO;
using SistemaEgresados.Filters;
using SistemaEgresados.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;

namespace SistemaEgresados.Controllers
{
    [AutorizacionRolesFilter("Egresado")]
    public class EgresadoController : Controller
    {
        private readonly Servicios.EgresadoServicio _egresadoServicio = new Servicios.EgresadoServicio();
        public ActionResult Index()
        {
            return View();
        }
        [HttpGet]
        public JsonResult DatosEgresado()
        {
            var resultado = _egresadoServicio.ObtenerdatosEgresado(((Usuario)Session["Usuario"]).referencia_id.Value);
            if(resultado.Exito)
            {
                return Json(new { success = true, message = resultado.Mensaje, data = resultado.Datos }, JsonRequestBehavior.AllowGet);
            }
            else
            {
                return Json(new { success = false, message = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
            }
        }
        [HttpGet]
        public JsonResult ActualizarVisualizaciones()
        {
            var resultado = _egresadoServicio.ActualizarVisualizaciones(((Usuario)Session["Usuario"]).referencia_id.Value);
            if (resultado.Exito)
            {
                return Json(new { success = true, message = resultado.Mensaje, data = resultado.Datos }, JsonRequestBehavior.AllowGet);
            }
            return Json(new { success = false, message = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
        }
        [HttpPost]
        public JsonResult ActualizarPreferenciaNotificacion(bool recibeNotificaciones)
        {
            var resultado = _egresadoServicio.ActualizarPreferenciaNotificacion(((Usuario)Session["Usuario"]).referencia_id.Value, recibeNotificaciones);
            if (resultado.Exito)
            {
                return Json(new { success = true, message = resultado.Mensaje });
            }
            else
            {
                return Json(new { success = false, message = resultado.Mensaje });
            }
        }
        [HttpPost]
        public JsonResult ActualizarPreferenciaPrivacidadCV(string privacidad,int id_cv)
        {
            var resultado = _egresadoServicio.ActualizarPreferenciaPrivacidadCV(((Usuario)Session["Usuario"]).referencia_id.Value, id_cv,privacidad);
            if (resultado.Exito)
            {
                return Json(new { success = true, message = resultado.Mensaje });
            }
            else
            {
                return Json(new { success = false, message = resultado.Mensaje });
            }
        }
        [HttpPost]
        public JsonResult ActualizarCartaPresentacion(string carta_presentacion, int id_cv) { 
            var resultado = _egresadoServicio.ActualizarCartaPresentacion(((Usuario)Session["Usuario"]).referencia_id.Value, id_cv, carta_presentacion);
            if (resultado.Exito)
            {
                return Json(new { success = true, message = resultado.Mensaje });
            }
            else
            {
                return Json(new { success = false, message = resultado.Mensaje });
            }
        }
        [HttpGet]
        public JsonResult ObtenerOfertas()
        {
            var resultado = _egresadoServicio.ObtenerOfertas(((Usuario)Session["Usuario"]).referencia_id.Value);
            if (resultado.Exito) { 
                return Json(new { success = true,message = resultado.Mensaje, data = resultado.Datos },JsonRequestBehavior.AllowGet);
            }
            return Json(new { success = false,message = resultado.Mensaje },JsonRequestBehavior.AllowGet);
        }
        [HttpGet]
        public JsonResult ObtenerDetalleOferta(int idVacante)
        {
            var resultado = _egresadoServicio.DetallesOferta(idVacante);
            if (resultado.Exito)
            {
                return Json(new { success = true, message = resultado.Mensaje, data = resultado.Datos }, JsonRequestBehavior.AllowGet);
            }
            return Json(new { success = false, message = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
        }
        [HttpPost]
        public JsonResult PostularOferta(int idVacante)
        {
            var resultado = _egresadoServicio.PostularOferta(idVacante, ((Usuario)Session["Usuario"]).referencia_id.Value);
            if (resultado.Exito)
            {
                return Json(new { success = true, message = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
            }

            return Json(new { success = false, message = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
        }
        [HttpPost]
        public JsonResult GuardarCalificacionEmpresa(int idEmpresa,decimal puntuacion,string comentario)
        {
            var resultado = _egresadoServicio.GuardarCalificacionEmpresa(idEmpresa, ((Usuario)Session["Usuario"]).referencia_id.Value, puntuacion, comentario);
            if (resultado.Exito) {
                return Json(new { success = true, message = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
            }
            return Json(new { success = false, message = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public JsonResult ReemplazarCV(HttpPostedFileBase NuevoCV)
        {
            var resultado = _egresadoServicio.ReemplazarCV(NuevoCV, ((Usuario)Session["Usuario"]).referencia_id.Value);
            if (resultado.Exito) {
                var cv = resultado.Datos as CVs_Egresados;
                return Json(new { success = true, message = resultado.Mensaje, ruta_archivo = cv.ruta_archivo, nombre_archivo = cv.nombre_archivo }, JsonRequestBehavior.AllowGet);
            }
            return Json(new { success = false, message = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public JsonResult ObtenerInformacion()
        {
            var resultado = _egresadoServicio.ObtenerInformacion(((Usuario)Session["Usuario"]).referencia_id.Value);
            if (!resultado.Exito) {
                return Json(new { success = false, message = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
            }
            return Json(new { success = true, message = resultado.Mensaje, data = resultado.Datos }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public JsonResult ObteneIdiomasDisponibles()
        {
            var resultado = _egresadoServicio.ObteneIdiomasDisponibles();
            if (!resultado.Exito)
            {
                return Json(new { success = false, message = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
            }
            return Json(new { success = true, message = resultado.Mensaje, data = resultado.Datos }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public JsonResult ActualizarCertificados(List<Certificacione> certificaciones)
        {
            var resultado = _egresadoServicio.ActualizarCertificados(((Usuario)Session["Usuario"]).referencia_id.Value, certificaciones);
            if (!resultado.Exito) {
                return Json(new { success = false, message = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
            }
            return Json(new { success = true, message = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public JsonResult ActualizarIdiomas(List<Egresado_Idiomas> idiomas)
        {
            var resultado = _egresadoServicio.ActualizarIdiomas(((Usuario)Session["Usuario"]).referencia_id.Value, idiomas);
            if (!resultado.Exito) {
                return Json(new { success = false, message = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
            }
            return Json(new { success = true, message = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public JsonResult ActualizarPreferencia(Preferencias_Egresado preferencias)
        {
            var resultado = _egresadoServicio.ActualizarPreferencia(((Usuario)Session["Usuario"]).referencia_id.Value, preferencias);
            if (!resultado.Exito) {
                return Json(new { success = false, message = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
            }
            return Json(new { success = true, message = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public JsonResult ActualizarInformacionPersonal(Egresado informacion)
        {
            var resultado = _egresadoServicio.ActualizarInformacionPersonal(((Usuario)Session["Usuario"]).referencia_id.Value, informacion);
            if (!resultado.Exito) {
                return Json(new { success = false, message = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
            }
            return Json(new { success = true, message = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public JsonResult ActualizarHabilidades(string habilidades)
        {
            var resultado = _egresadoServicio.ActualizarHabilidades(((Usuario)Session["Usuario"]).referencia_id.Value, habilidades);
            if (!resultado.Exito) {
                return Json(new { success = false, message = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
            }
            return Json(new { success = true, message = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public JsonResult ObtenerMisPostulaciones()
        {
            var resultado = _egresadoServicio.ObtenerMisPostulaciones(((Usuario)Session["Usuario"]).referencia_id.Value);
            if (!resultado.Exito) {
                return Json(new { success = false, message = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
            }
            return Json(new { success = true, message = resultado.Mensaje, data = resultado.Datos }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public JsonResult CancelarPostulacion(int IdPostulacion)
        {
            var resultado = _egresadoServicio.CancelarPostulacion(((Usuario)Session["Usuario"]).referencia_id.Value, IdPostulacion);
            if (!resultado.Exito) {
                return Json(new { success = false, message = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
            }
            return Json(new { success = true, message = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
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

            return RedirectToAction("Index","Bienvenido");
        }
    }
}