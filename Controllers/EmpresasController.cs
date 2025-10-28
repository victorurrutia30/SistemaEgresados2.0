using SistemaEgresados.Filters;
using SistemaEgresados.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace SistemaEgresados.Controllers
{
    [AutorizacionEmpresas]
    public class EmpresasController : Controller
    {
        private readonly Servicios.Empresas _empresaServicio = new Servicios.Empresas();

        public ActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public JsonResult DatosEmpresa()
        {
            var resultado = _empresaServicio.ObtenerDatosEmpresa(((Usuario)Session["Usuario"]).referencia_id.Value);
            if (resultado.Exito)
            {
                return Json(new { success = true, message = resultado.Mensaje, data = resultado.Datos }, JsonRequestBehavior.AllowGet);
            }
            else
            {
                return Json(new { success = false, message = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
            }
        }

        // ============================================================
        // MÉTODOS PARA ACTUALIZACIÓN DEL PERFIL DE EMPRESA
        // ============================================================

        [HttpGet]
        public ActionResult Perfil()
        {
            return View();
        }

        [HttpPost]
        public JsonResult ActualizarPerfil(Empresa empresa)
        {
            try
            {
                if (Session["Usuario"] == null)
                {
                    return Json(new { success = false, message = "Sesión expirada" });
                }

                int idEmpresa = ((Usuario)Session["Usuario"]).referencia_id.Value;
                empresa.id_empresa = idEmpresa;

                var resultado = _empresaServicio.ActualizarPerfil(empresa);

                if (resultado.Exito)
                {
                    return Json(new { success = true, message = resultado.Mensaje });
                }
                else
                {
                    return Json(new { success = false, message = resultado.Mensaje });
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Error al actualizar perfil: " + ex.Message });
            }
        }

        // ============================================================
        // MÉTODOS PARA GESTIÓN DE PUBLICACIONES (VACANTES)
        // ============================================================

        [HttpGet]
        public ActionResult Publicaciones()
        {
            return View();
        }

        [HttpGet]
        public JsonResult ObtenerPublicaciones()
        {
            try
            {
                if (Session["Usuario"] == null)
                {
                    return Json(new { success = false, message = "Sesión expirada" }, JsonRequestBehavior.AllowGet);
                }

                int idEmpresa = ((Usuario)Session["Usuario"]).referencia_id.Value;
                var resultado = _empresaServicio.ObtenerPublicaciones(idEmpresa);

                if (resultado.Exito)
                {
                    return Json(new { success = true, data = resultado.Datos }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Json(new { success = false, message = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Error al obtener publicaciones: " + ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public JsonResult CrearPublicacion(Vacante vacante)
        {
            try
            {
                if (Session["Usuario"] == null)
                {
                    return Json(new { success = false, message = "Sesión expirada" });
                }

                int idEmpresa = ((Usuario)Session["Usuario"]).referencia_id.Value;
                vacante.id_empresa = idEmpresa;

                var resultado = _empresaServicio.CrearPublicacion(vacante);

                if (resultado.Exito)
                {
                    return Json(new { success = true, message = resultado.Mensaje, data = resultado.Datos });
                }
                else
                {
                    return Json(new { success = false, message = resultado.Mensaje });
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Error al crear publicación: " + ex.Message });
            }
        }

        [HttpPost]
        public JsonResult ActualizarPublicacion(Vacante vacante)
        {
            try
            {
                if (Session["Usuario"] == null)
                {
                    return Json(new { success = false, message = "Sesión expirada" });
                }

                int idEmpresa = ((Usuario)Session["Usuario"]).referencia_id.Value;
                vacante.id_empresa = idEmpresa;

                var resultado = _empresaServicio.ActualizarPublicacion(vacante);

                if (resultado.Exito)
                {
                    return Json(new { success = true, message = resultado.Mensaje });
                }
                else
                {
                    return Json(new { success = false, message = resultado.Mensaje });
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Error al actualizar publicación: " + ex.Message });
            }
        }

        [HttpPost]
        public JsonResult CambiarEstadoPublicacion(int idVacante, string nuevoEstado)
        {
            try
            {
                if (Session["Usuario"] == null)
                {
                    return Json(new { success = false, message = "Sesión expirada" });
                }

                int idEmpresa = ((Usuario)Session["Usuario"]).referencia_id.Value;
                var resultado = _empresaServicio.CambiarEstadoPublicacion(idVacante, idEmpresa, nuevoEstado);

                if (resultado.Exito)
                {
                    return Json(new { success = true, message = resultado.Mensaje });
                }
                else
                {
                    return Json(new { success = false, message = resultado.Mensaje });
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Error al cambiar estado: " + ex.Message });
            }
        }

        [HttpPost]
        public JsonResult EliminarPublicacion(int idVacante)
        {
            try
            {
                if (Session["Usuario"] == null)
                {
                    return Json(new { success = false, message = "Sesión expirada" });
                }

                int idEmpresa = ((Usuario)Session["Usuario"]).referencia_id.Value;
                var resultado = _empresaServicio.EliminarPublicacion(idVacante, idEmpresa);

                if (resultado.Exito)
                {
                    return Json(new { success = true, message = resultado.Mensaje });
                }
                else
                {
                    return Json(new { success = false, message = resultado.Mensaje });
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Error al eliminar publicación: " + ex.Message });
            }
        }

        [HttpGet]
        public JsonResult ObtenerDetallePublicacion(int idVacante)
        {
            try
            {
                if (Session["Usuario"] == null)
                {
                    return Json(new { success = false, message = "Sesión expirada" }, JsonRequestBehavior.AllowGet);
                }

                int idEmpresa = ((Usuario)Session["Usuario"]).referencia_id.Value;
                var resultado = _empresaServicio.ObtenerDetallePublicacion(idVacante, idEmpresa);

                if (resultado.Exito)
                {
                    return Json(new { success = true, data = resultado.Datos }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Json(new { success = false, message = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Error al obtener detalle: " + ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
    }
}