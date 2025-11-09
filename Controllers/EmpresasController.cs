using SistemaEgresados.Filters;
using SistemaEgresados.Models;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;

namespace SistemaEgresados.Controllers
{
    [AutorizacionRolesFilter("UsuarioEmpresa")]
    public class EmpresasController : Controller
    {
        private readonly Servicios.Empresas _empresaServicio = new Servicios.Empresas();
        private readonly SistemaEgresadosUtecEntities _db = new SistemaEgresadosUtecEntities();

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

        [HttpGet]
        public JsonResult ActualizarEstadisticas()
        {
            var resultado = _empresaServicio.ActualizarEstadisticas(((Usuario)Session["Usuario"]).referencia_id.Value);
            if (resultado.Exito)
            {
                return Json(new {success = true, message = resultado.Mensaje, data = resultado.Datos}, JsonRequestBehavior.AllowGet);
            }
            return Json(new { success = false, message = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public JsonResult ObtenerDatosEmpresa()
        {
            try
            {
                if (Session["Usuario"] == null)
                {
                    return Json(new { success = false, message = "Sesión expirada" }, JsonRequestBehavior.AllowGet);
                }

                int idEmpresa = ((Usuario)Session["Usuario"]).referencia_id.Value;
                var resultado = _empresaServicio.ObtenerDatosEmpresaCompletos(idEmpresa);

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
                return Json(new
                {
                    success = false,
                    message = "Error al obtener datos: " + ex.Message
                }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public JsonResult BuscarEgresadosPublicos()
        {
            var resultado = _empresaServicio.BuscarEgresadosPublicos();

            if (resultado.Exito)
            {
                return Json(new { success = true, data = resultado.Datos }, JsonRequestBehavior.AllowGet);
            }
            else
            {
                return Json(new { success = false, message = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
            }
        }


        [HttpGet]
        public JsonResult FiltrarEgresadosCVPublico(string carrera = null, string habilidad = null)
        {
            try
            {
                var query = from cv in _db.CVs_Egresados
                            join e in _db.Egresados on cv.id_egresado equals e.id_egresado
                            join c in _db.Carreras on e.id_carrera equals c.id_carrera into carreraJoin
                            from c in carreraJoin.DefaultIfEmpty()
                            where (cv.privacidad.ToLower() == "publico" || cv.privacidad.ToLower() == "publica")
                            select new
                            {
                                id_egresado = e.id_egresado,
                                id_cv = cv.id_cv,
                                NombreCompleto = e.nombres + " " + e.apellidos,
                                carrera = c != null ? c.nombre_carrera : "Sin carrera",
                                id_carrera = e.id_carrera,
                                email = e.email,
                                telefono = e.telefono,
                                habilidades = cv.habilidades_principales,
                                carta_presentacion = cv.CartaPresentacion,
                                anio_graduacion = e.fecha_graduacion,
                                promedio = e.promedio_academico,
                                numero_documento = e.numero_documento
                            };

                var egresados = query.ToList();

                if (!string.IsNullOrEmpty(carrera))
                {
                    egresados = egresados.Where(e =>
                        e.carrera != null &&
                        e.carrera.ToLower().Contains(carrera.ToLower())
                    ).ToList();
                }

                if (!string.IsNullOrEmpty(habilidad))
                {
                    egresados = egresados.Where(e =>
                        e.habilidades != null &&
                        e.habilidades.ToLower().Contains(habilidad.ToLower())
                    ).ToList();
                }

                return Json(new { success = true, data = egresados }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    success = false,
                    message = "Error al filtrar egresados: " + ex.Message
                }, JsonRequestBehavior.AllowGet);
            }
        }


        [HttpGet]
        public JsonResult DiagnosticoDatos()
        {
            var resultado = _empresaServicio.ObtenerDiagnosticoDatos();

            if (resultado.Exito)
            {
                return Json(new { success = true, data = resultado.Datos }, JsonRequestBehavior.AllowGet);
            }
            else
            {
                return Json(new { success = false, message = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public ActionResult DescargarCVEgresado(int idEgresado)
        {
            try
            {
                var resultado = _empresaServicio.ObtenerCVParaDescargar(idEgresado);

                if (!resultado.Exito)
                {
                    TempData["Error"] = resultado.Mensaje;
                    return RedirectToAction("Index");
                }

                dynamic datos = resultado.Datos;
                string rutaCompleta = Server.MapPath(datos.ruta_archivo);

                if (!System.IO.File.Exists(rutaCompleta))
                {
                    TempData["Error"] = "El archivo CV no existe en el servidor";
                    return RedirectToAction("Index");
                }

                byte[] fileBytes = System.IO.File.ReadAllBytes(rutaCompleta);
                return File(fileBytes, "application/pdf", datos.nombre_archivo);
            }
            catch (Exception ex)
            {
                TempData["Error"] = "Error al descargar CV: " + ex.Message;
                return RedirectToAction("Index");
            }
        }

        [HttpGet]
        public JsonResult VerPerfilEgresadoCompleto(int idEgresado)
        {
            try
            {
                var resultado = _empresaServicio.VerPerfilEgresadoCompleto(idEgresado);

                if (!resultado.Exito)
                {
                    return Json(new { success = false, message = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
                }               

                return Json(new { success = true, data = resultado.Datos }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    success = false,
                    message = "Error al obtener el perfil: " + ex.Message
                }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public JsonResult AgregarVisualizacion(int idEgresado)
        {
            var resultado = _empresaServicio.RegistrarVisualizacionCV(idEgresado, ((Usuario)Session["Usuario"]).referencia_id.Value,Request.UserHostAddress, 
                ExtraerNombreNavegador(Request.UserAgent));
            if (resultado.Exito)
            {
                return Json(new { success = true, mensaje = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
            }
            return Json(new { success = true, mensaje = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
        }

        private string ExtraerNombreNavegador(string userAgent)
        {
            if (string.IsNullOrEmpty(userAgent))
                return "Desconocido";

            userAgent = userAgent.ToLower();

            if (userAgent.Contains("edg"))
                return "Microsoft Edge";
            else if (userAgent.Contains("chrome") && !userAgent.Contains("edg"))
                return "Google Chrome";
            else if (userAgent.Contains("firefox"))
                return "Mozilla Firefox";
            else if (userAgent.Contains("safari") && !userAgent.Contains("chrome"))
                return "Safari";
            else if (userAgent.Contains("opera") || userAgent.Contains("opr"))
                return "Opera";
            else if (userAgent.Contains("trident") || userAgent.Contains("msie"))
                return "Internet Explorer";
            else
                return "Otro";
        }

        [HttpGet]
        public JsonResult ObtenerHistorialVisualizaciones()
        {
            try
            {
                var usuario = (Usuario)Session["Usuario"];
                var idEmpresa = usuario.referencia_id.Value;

                var resultado = _empresaServicio.ObtenerHistorialVisualizaciones(idEmpresa);

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
                return Json(new
                {
                    success = false,
                    message = "Error al obtener historial: " + ex.Message
                }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public JsonResult ObtenerEstadisticasVisualizaciones()
        {
            try
            {
                var usuario = (Usuario)Session["Usuario"];
                var idEmpresa = usuario.referencia_id.Value;

                var resultado = _empresaServicio.ObtenerEstadisticasVisualizaciones(idEmpresa);

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
                return Json(new
                {
                    success = false,
                    message = "Error al obtener estadísticas: " + ex.Message
                }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public JsonResult ObtenerVacantes()
        {
            try
            {
                if (Session["Usuario"] == null)
                {
                    return Json(new { success = false, message = "Sesión expirada" }, JsonRequestBehavior.AllowGet);
                }

                int idEmpresa = ((Usuario)Session["Usuario"]).referencia_id.Value;
                var resultado = _empresaServicio.ObtenerVacantes(idEmpresa);

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
                return Json(new
                {
                    success = false,
                    message = "Error al obtener vacantes: " + ex.Message
                }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public JsonResult ObtenerDetalleVacante(int id_vacante)
        {
            try
            {
                if (Session["Usuario"] == null)
                {
                    return Json(new { success = false, message = "Sesión expirada" }, JsonRequestBehavior.AllowGet);
                }

                int idEmpresa = ((Usuario)Session["Usuario"]).referencia_id.Value;
                var resultado = _empresaServicio.ObtenerDetalleVacante(id_vacante, idEmpresa);

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
                return Json(new
                {
                    success = false,
                    message = "Error al obtener detalles: " + ex.Message
                }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public JsonResult ActualizarVacante(int id_vacante, string titulo, string descripcion,
            string requisitos, decimal salario_min, decimal salario_max, bool salario_confidencial,
            string tipo_contrato, string ubicacion, string area, DateTime fecha_cierre,
            string estado, string modalidad)
        {
            try
            {
                if (Session["Usuario"] == null)
                {
                    return Json(new { success = false, message = "Sesión expirada" });
                }

                int idEmpresa = ((Usuario)Session["Usuario"]).referencia_id.Value;
                var vacante = _db.Vacantes.Find(id_vacante);

                if (vacante == null)
                {
                    return Json(new { success = false, message = "Vacante no encontrada" });
                }

                if (vacante.id_empresa != idEmpresa)
                {
                    return Json(new { success = false, message = "No tienes permiso para modificar esta vacante" });
                }

                var vacanteActualizada = new Vacante
                {
                    id_vacante = id_vacante,
                    titulo = titulo,
                    descripcion = descripcion,
                    requisitos = requisitos,
                    salario_min = salario_min,
                    salario_max = salario_max,
                    salario_confidencial = salario_confidencial,
                    tipo_contrato = tipo_contrato,
                    ubicacion = ubicacion,
                    area = area,
                    fecha_cierre = fecha_cierre,
                    estado = estado,
                    modalidad = modalidad
                };

                var resultado = _empresaServicio.ActualizarVacante(vacanteActualizada);

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
                return Json(new
                {
                    success = false,
                    message = "Error al actualizar: " + ex.Message
                });
            }
        }

        [HttpPost]
        public JsonResult EliminarVacante(int id_vacante)
        {
            try
            {
                if (Session["Usuario"] == null)
                {
                    return Json(new { success = false, message = "Sesión expirada" });
                }

                int idEmpresa = ((Usuario)Session["Usuario"]).referencia_id.Value;
                var vacante = _db.Vacantes.Find(id_vacante);

                if (vacante == null)
                {
                    return Json(new { success = false, message = "Vacante no encontrada" });
                }

                if (vacante.id_empresa != idEmpresa)
                {
                    return Json(new { success = false, message = "No tienes permiso para eliminar esta vacante" });
                }

                var resultado = _empresaServicio.DesactivarVacante(id_vacante);

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
                return Json(new
                {
                    success = false,
                    message = "Error al eliminar la vacante: " + ex.Message
                });
            }
        }

        [HttpGet]
        public JsonResult ObtenerTopSectores()
        {
            var resultado = _empresaServicio.ObtenerTopSectoresCandidatos(0);

            if (resultado.Exito)
            {
                return Json(new { success = true, data = resultado.Datos }, JsonRequestBehavior.AllowGet);
            }
            else
            {
                return Json(new { success = false, message = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public JsonResult ActualizarPerfil(string razon_social, string nit, string email_contacto,
              string telefono, string direccion, string sector_economico, string tamano_empresa)
        {
            try
            {

                if (Session["Usuario"] == null)
                {
                    return Json(new { success = false, message = "Sesión expirada" });
                }

                int idEmpresa = ((Usuario)Session["Usuario"]).referencia_id.Value;

                var empresa = _db.Empresas.Find(idEmpresa);

                if (empresa == null)
                {
                    return Json(new { success = false, message = "Empresa no encontrada" });
                }

                empresa.razon_social = razon_social;
                empresa.nit = nit;
                empresa.email_contacto = email_contacto;
                empresa.telefono = telefono;
                empresa.direccion = direccion;
                empresa.sector_economico = sector_economico;
                empresa.tamano_empresa = tamano_empresa;

                _db.SaveChanges();

                return Json(new
                {
                    success = true,
                    message = "Perfil actualizado correctamente"
                });
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    success = false,
                    message = "Error al actualizar: " + ex.Message
                });
            }
        }


        [HttpGet]
        public JsonResult ObtenerTopCandidatos()
        {
            var idEmpresa = ((Usuario)Session["Usuario"]).referencia_id.Value;
            var resultado = _empresaServicio.ObtenerTopCandidatosEnProceso(idEmpresa);

            if (resultado.Exito)
            {
                return Json(new { success = true, data = resultado.Datos }, JsonRequestBehavior.AllowGet);
            }
            else
            {
                return Json(new { success = false, message = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public JsonResult CrearVacante(string titulo, string descripcion, string area, string requisitos,
            string tipo_contrato, string modalidad, string ubicacion, decimal? salario_min,
            decimal? salario_max, bool salario_confidencial, string fecha_cierre)
        {
            try
            {
                if (Session["Usuario"] == null)
                {
                    return Json(new { success = false, message = "Sesión expirada" });
                }

                var usuario = (Usuario)Session["Usuario"];

                if (usuario.tipo_usuario != "UsuarioEmpresa")
                {
                    return Json(new { success = false, message = "Solo empresas pueden crear vacantes" });
                }

                if (!usuario.referencia_id.HasValue)
                {
                    return Json(new { success = false, message = "Usuario sin empresa asociada" });
                }

                var vacante = new Vacante
                {
                    titulo = titulo,
                    descripcion = descripcion,
                    area = area,
                    requisitos = requisitos,
                    tipo_contrato = tipo_contrato,
                    modalidad = modalidad,
                    ubicacion = ubicacion,
                    salario_min = salario_min,
                    salario_max = salario_max,
                    salario_confidencial = salario_confidencial,
                    creado_por = usuario.referencia_id.Value
                };

                if (!string.IsNullOrEmpty(fecha_cierre))
                {
                    DateTime fechaCierreDate;
                    if (DateTime.TryParse(fecha_cierre, out fechaCierreDate))
                    {
                        vacante.fecha_cierre = fechaCierreDate;
                    }
                }

                var resultado = _empresaServicio.CrearVacante(vacante);

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
                return Json(new { success = false, message = "Error al crear vacante: " + ex.Message });
            }
        }

        [HttpGet]
        public JsonResult ObtenerPipelinePorEstado()
        {
            int idEmpresa = ((Usuario)Session["Usuario"]).referencia_id.Value;
            var resultado = _empresaServicio.ObtenerPipelinePorEstado(idEmpresa);

            if (resultado.Exito)
            {
                return Json(new { success = true, data = resultado.Datos }, JsonRequestBehavior.AllowGet);
            }
            else
            {
                return Json(new { success = false, message = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public JsonResult CambiarEstadoVacante(int id_vacante, string nuevo_estado)
        {
            try
            {
                if (Session["Usuario"] == null)
                {
                    return Json(new { success = false, message = "Sesión expirada" });
                }

                int idEmpresa = ((Usuario)Session["Usuario"]).referencia_id.Value;

                if (id_vacante <= 0)
                {
                    return Json(new { success = false, message = "ID de vacante inválido" });
                }

                if (string.IsNullOrEmpty(nuevo_estado))
                {
                    return Json(new { success = false, message = "Debe especificar un estado" });
                }

                var vacante = _db.Vacantes.Find(id_vacante);

                if (vacante == null)
                {
                    return Json(new { success = false, message = "Vacante no encontrada" });
                }

                if (vacante.id_empresa != idEmpresa)
                {
                    return Json(new { success = false, message = "No tienes permiso para modificar esta vacante" });
                }

                var resultado = _empresaServicio.ActualizarEstadoVacante(id_vacante, nuevo_estado);

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
                return Json(new
                {
                    success = false,
                    message = "Error al actualizar el estado: " + ex.Message
                });
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

            return RedirectToAction("Index", "Bienvenido");
        }
    }

}