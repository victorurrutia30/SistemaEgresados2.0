using SistemaEgresados.Filters;
using SistemaEgresados.Models;
using SistemaEgresados.ServicioWebSocket;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;

namespace SistemaEgresados.Controllers
{
    [AutorizacionRolesFilter("Administrador")]
    public class AdministracionController : Controller
    {
        private readonly Servicios.Administracion _administracionServicio = new Servicios.Administracion();

        public ActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public JsonResult ObtenerVacantes()
        {
            var resultado = _administracionServicio.Vacantes();
            return Json(new
            {
                success = resultado.Exito,
                message = resultado.Mensaje,
                data = resultado.Datos
            }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public JsonResult ObtenerEstadisticas()
        {
            var resultado = _administracionServicio.ObtenerEstadisticas();
            return Json(new
            {
                success = resultado.Exito,
                message = resultado.Mensaje,
                data = resultado.Datos
            }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public JsonResult ObtenerPipelineProcesos()
        {
            var resultado = _administracionServicio.ObtenerPipelineProcesos();
            return Json(new
            {
                success = resultado.Exito,
                message = resultado.Mensaje,
                data = resultado.Datos
            }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public JsonResult ObtenerCandidatosRecomendados(int top = 10)
        {
            var resultado = _administracionServicio.ObtenerCandidatosRecomendados(top);
            return Json(new
            {
                success = resultado.Exito,
                message = resultado.Mensaje,
                data = resultado.Datos
            }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public JsonResult ObtenerAplicacionesRecientes(int top = 10)
        {
            var resultado = _administracionServicio.ObtenerAplicacionesRecientes(top);
            return Json(new
            {
                success = resultado.Exito,
                message = resultado.Mensaje,
                data = resultado.Datos
            }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public JsonResult ObtenerTendencias(int meses = 6)
        {
            var resultado = _administracionServicio.ObtenerTendencias(meses);
            return Json(new
            {
                success = resultado.Exito,
                message = resultado.Mensaje,
                data = resultado.Datos
            }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public JsonResult ObtenerConteosPorEstado()
        {
            var resultado = _administracionServicio.ObtenerConteosPorEstado();
            return Json(new
            {
                success = resultado.Exito,
                message = resultado.Mensaje,
                data = resultado.Datos
            }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public JsonResult ObtenerPostulaciones(DateTime? fechaInicio = null, DateTime? fechaFin = null)
        {
            fechaInicio = fechaInicio ?? DateTime.Now.AddMonths(-1);
            fechaFin = fechaFin ?? DateTime.Now;

            var resultado = _administracionServicio.postulaciones(fechaInicio.Value, fechaFin.Value);
            return Json(new
            {
                success = resultado.Exito,
                message = resultado.Mensaje,
                data = resultado.Datos
            }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public JsonResult PerfilEgresado(int idEgresado)
        {
            var resultado = _administracionServicio.VerPerfilEgresado(idEgresado);
            if (resultado.Exito)
            {
                return Json(new { success = true, message = resultado.Mensaje, data = resultado.Datos }, JsonRequestBehavior.AllowGet);
            }

            return Json(new { success = false, message = resultado.Mensaje },JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public JsonResult ObtenerEmpresas()
        {
            var resultado = _administracionServicio.ObtenerEmpresas();
            if(resultado.Exito)
            {
                return Json(new { success = true, message = resultado.Mensaje, data = resultado.Datos }, JsonRequestBehavior.AllowGet);
            }
            return Json(new { success = false, message = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public JsonResult ObtenerEgresados()
        {
            var resultado = _administracionServicio.ObtenerEgresados();
            if (resultado.Exito)
            {
                return Json(new { success = true, message = resultado.Mensaje, data = resultado.Datos }, JsonRequestBehavior.AllowGet);
            }
            return Json(new { success = false, message = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public JsonResult ObtenerDetallesVacantes()
        {
            var resultado = _administracionServicio.ObtenerVacantes();
            if (resultado.Exito)
            {
                return Json(new { success = true, message = resultado.Mensaje, data = resultado.Datos }, JsonRequestBehavior.AllowGet);
            }
            return Json(new { success = false, message = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public JsonResult EliminarVacante(int idVacante, string motivo = null)
        {
            var resultado = _administracionServicio.EliminarVacante(idVacante,motivo);
            if (resultado.Exito)
            {
                return Json(new { success = true, message = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
            }
            return Json(new { success = false, message = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public JsonResult ObtenerEmpresa(int idEmpresa)
        {
            var resultado = _administracionServicio.ObtenerEmpresa(idEmpresa);
            if(resultado.Exito)
            {
                return Json(new { success = true, message = resultado.Mensaje, data = resultado.Datos }, JsonRequestBehavior.AllowGet);
            }
            return Json(new { success = false, message = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public JsonResult ObtenerComentariosEmpresa(int idEmpresa)
        {
            var resultado = _administracionServicio.ObtenerComentariosEmpresa(idEmpresa);
            if (resultado.Exito)
            {
                return Json(new { success = true, message = resultado.Mensaje, data = resultado.Datos }, JsonRequestBehavior.AllowGet);
            }
            return Json(new { success = false, message = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public JsonResult ActualizarEmpresa(int idEmpresa, string razon_social, string nit, string email_contacto,
          string telefono, string direccion, string sector_economico, string tamano_empresa, bool vinculada_universidad,
          string usuario_empresa_nombre_usuario, string usuario_empresa_rol, string usuario_empresa_nombre_completo,
          string usuario_empresa_cargo, string usuario_empresa_email, string usuario_principal_password)
        {
            var resultado = _administracionServicio.ActualizarEmpresa(idEmpresa, razon_social, nit, email_contacto,
              telefono, direccion, sector_economico, tamano_empresa, vinculada_universidad,
              usuario_empresa_nombre_usuario, usuario_empresa_rol, usuario_empresa_nombre_completo,
              usuario_empresa_cargo, usuario_empresa_email, usuario_principal_password);
            if (resultado.Exito)
            {
                return Json(new { success = true, message = resultado.Mensaje },JsonRequestBehavior.AllowGet);
            }
            return Json(new { success = false, message = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public JsonResult EliminarEmpresa(int idEmpresa)
        {
            var resultado = _administracionServicio.DesactivarEmpresa(idEmpresa);
            if (resultado.Exito)
            {
                return Json(new { success = true, message = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
            }
            return Json(new { success = false, message = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
        }
        [HttpPost]
        public JsonResult EnviarInvitacionRegistroEmpresa(string email,string nombreEmpresa)
        {
            string baseUrl = Request.Url.GetLeftPart(UriPartial.Authority);
            var resultado = _administracionServicio.EnviarInvitacionRegistroEmpresa(email, nombreEmpresa,baseUrl);
            if (resultado.Exito)
            {
                return Json(new { success = true, message = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
            }
            return Json(new { success = false, message = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public JsonResult EnviarNotificacionGeneral(string mensaje, string tipo)
        {
            WebSocketService.Instance.EnviarMensajeGeneral(mensaje,tipo, ((Usuario)Session["Usuario"]).nombre_completo.ToString());
            return Json(new { success = true, message = "Se mando el mensaje correctamente" }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public JsonResult EliminarEgresado(int idEgresado)
        {
            var resultado = _administracionServicio.EliminarPerfilEgresado(idEgresado);
            if (resultado.Exito)
            {
                return Json(new { success = true, message = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
            }
            return Json(new { success = false, message = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
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

            return RedirectToAction("Index", "Bienvenido");
        }
    }
}