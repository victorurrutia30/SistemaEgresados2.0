using SistemaEgresados.Filters;
using SistemaEgresados.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace SistemaEgresados.Controllers
{
    [AutorizacionEgresadoAdminFilter]
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
    }
}