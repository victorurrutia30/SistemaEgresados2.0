using SistemaEgresados.Filters;
using SistemaEgresados.Models;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
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

        private readonly string connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["SistemaEgresadosUtecEntities"].ConnectionString;

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
                return Json(new { success = true, message = resultado.Mensaje, data = resultado.Datos }, JsonRequestBehavior.AllowGet);
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
            var resultado = _empresaServicio.RegistrarVisualizacionCV(idEgresado, ((Usuario)Session["Usuario"]).referencia_id.Value, Request.UserHostAddress,
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
        public JsonResult ObtenerVacantesFiltradas(string titulo = null, string estado = null,
        string area = null, string fecha = null)
        {
            try
            {
                if (Session["Usuario"] == null)
                {
                    return Json(new { success = false, message = "Sesión expirada" },
                        JsonRequestBehavior.AllowGet);
                }

                int idEmpresa = ((Usuario)Session["Usuario"]).referencia_id.Value;

                System.Diagnostics.Debug.WriteLine($"📥 Filtros recibidos - Título: '{titulo}', Estado: '{estado}', Área: '{area}', Fecha: '{fecha}'");

                DateTime? fechaPublicacion = null;
                if (!string.IsNullOrEmpty(fecha))
                {
                    DateTime parsedDate;
                    if (DateTime.TryParse(fecha, out parsedDate))
                    {
                        fechaPublicacion = parsedDate;
                    }
                }

                var resultado = _empresaServicio.ObtenerVacantesFiltradas(
                    idEmpresa, titulo, estado, area, fechaPublicacion);

                if (resultado.Exito)
                {
                    return Json(new { success = true, data = resultado.Datos },
                        JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Json(new { success = false, message = resultado.Mensaje },
                        JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"❌ Error en controller: {ex.Message}");
                return Json(new
                {
                    success = false,
                    message = "Error al filtrar vacantes: " + ex.Message
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
            try
            {
                if (Session["Usuario"] == null)
                {
                    return Json(new { success = false, message = "Sesión expirada" }, JsonRequestBehavior.AllowGet);
                }

                int idEmpresa = ((Usuario)Session["Usuario"]).referencia_id.Value;
                var resultado = _empresaServicio.ObtenerTopSectoresCandidatos(idEmpresa);

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
                    message = "Error al obtener sectores: " + ex.Message
                }, JsonRequestBehavior.AllowGet);
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
        public JsonResult ObtenerTopCarrerasContratadas()
        {
            try
            {
                if (Session["Usuario"] == null)
                {
                    return Json(new { success = false, message = "Sesión expirada" }, JsonRequestBehavior.AllowGet);
                }

                int idEmpresa = ((Usuario)Session["Usuario"]).referencia_id.Value;
                var resultado = _empresaServicio.ObtenerTopCarrerasContratadas(idEmpresa);

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
                    message = "Error al obtener top carreras contratadas: " + ex.Message
                }, JsonRequestBehavior.AllowGet);
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
        public JsonResult ObtenerPipelineVacantesPorEstado()
        {
            try
            {
                if (Session["Usuario"] == null)
                {
                    return Json(new { success = false, message = "Sesión expirada" }, JsonRequestBehavior.AllowGet);
                }

                int idEmpresa = ((Usuario)Session["Usuario"]).referencia_id.Value;

                var resultado = _empresaServicio.ObtenerPipelineVacantesPorEstado(idEmpresa);

                if (resultado.Exito)
                {
                    return Json(new { exito = true, data = resultado.Datos }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Json(new { exito = false, message = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    exito = false,
                    message = "Error al obtener pipeline: " + ex.Message
                }, JsonRequestBehavior.AllowGet);
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


        [HttpGet]
        public JsonResult ObtenerPostulacionesPorVacante(int id_vacante)
        {
            try
            {
                if (Session["Usuario"] == null)
                {
                    return Json(new { success = false, message = "Sesión expirada" }, JsonRequestBehavior.AllowGet);
                }

                int idEmpresa = ((Usuario)Session["Usuario"]).referencia_id.Value;
                var resultado = _empresaServicio.ObtenerPostulacionesPorVacante(id_vacante, idEmpresa);

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
                return Json(new { success = false, message = "Error: " + ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public JsonResult CambiarEstadoPostulacion(int id_postulacion, string nuevo_estado)
        {
            try
            {
                if (Session["Usuario"] == null)
                {
                    return Json(new { success = false, message = "Sesión expirada" });
                }

                int idEmpresa = ((Usuario)Session["Usuario"]).referencia_id.Value;
                var resultado = _empresaServicio.CambiarEstadoPostulacion(id_postulacion, nuevo_estado, idEmpresa);

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
                return Json(new { success = false, message = "Error: " + ex.Message });
            }
        }

        [HttpPost]
        public JsonResult CalificarEgresado(int id_postulacion, int calificacion, string comentario = "")
        {
            try
            {
                if (Session["Usuario"] == null)
                {
                    return Json(new { success = false, message = "Sesión expirada" });
                }

                if (calificacion < 1 || calificacion > 5)
                {
                    return Json(new { success = false, message = "La calificación debe estar entre 1 y 5 estrellas" });
                }

                int idEmpresa = ((Usuario)Session["Usuario"]).referencia_id.Value;

                var postulacion = _db.Postulaciones
                    .Include("Vacante")
                    .Include("Egresado")
                    .FirstOrDefault(p => p.id_postulacion == id_postulacion);

                if (postulacion == null)
                {
                    return Json(new { success = false, message = "Postulación no encontrada" });
                }

                if (postulacion.Vacante.id_empresa != idEmpresa)
                {
                    return Json(new { success = false, message = "No tienes permisos para calificar esta postulación" });
                }

                var egresado = _db.Egresados.Find(postulacion.id_egresado);
                if (egresado == null)
                {
                    return Json(new { success = false, message = "Egresado no encontrado" });
                }

                egresado.total_estrellas = calificacion;
                _db.SaveChanges();

                return Json(new
                {
                    success = true,
                    message = $"Calificación de {calificacion} estrellas guardada exitosamente",
                    data = new
                    {
                        id_egresado = egresado.id_egresado,
                        calificacion = calificacion,
                        comentario = comentario
                    }
                });
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    success = false,
                    message = "Error al calificar egresado: " + ex.Message
                });
            }
        }

        [HttpGet]
        public JsonResult ObtenerCalificacionPostulacion(int id_postulacion)
        {
            try
            {
                if (Session["Usuario"] == null)
                {
                    return Json(new { success = false, message = "Sesión expirada" }, JsonRequestBehavior.AllowGet);
                }

                var postulacion = _db.Postulaciones
                    .Include("Egresado")
                    .Include("Vacante")
                    .FirstOrDefault(p => p.id_postulacion == id_postulacion);

                if (postulacion == null)
                {
                    return Json(new { success = false, message = "Postulación no encontrada" }, JsonRequestBehavior.AllowGet);
                }

                int idEmpresa = ((Usuario)Session["Usuario"]).referencia_id.Value;
                if (postulacion.Vacante.id_empresa != idEmpresa)
                {
                    return Json(new { success = false, message = "No tienes permisos" }, JsonRequestBehavior.AllowGet);
                }

                var calificacionActual = postulacion.Egresado.total_estrellas ?? 0;

                return Json(new
                {
                    success = true,
                    data = new
                    {
                        id_postulacion = id_postulacion,
                        id_egresado = postulacion.id_egresado,
                        calificacion = calificacionActual,
                        nombre_egresado = postulacion.Egresado.nombres + " " + postulacion.Egresado.apellidos
                    }
                }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    success = false,
                    message = "Error al obtener calificación: " + ex.Message
                }, JsonRequestBehavior.AllowGet);
            }
        }


        [HttpPost]
        public JsonResult ContratarEgresado(int id_postulacion)
        {
            try
            {
                if (Session["Usuario"] == null)
                {
                    return Json(new { success = false, message = "Sesión expirada" });
                }

                int idEmpresa = ((Usuario)Session["Usuario"]).referencia_id.Value;
                var resultado = _empresaServicio.ContratarEgresado(id_postulacion, idEmpresa);

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
                return Json(new { success = false, message = "Error: " + ex.Message });
            }
        }


        [HttpGet]
        public JsonResult ObtenerCandidatosContratados()
        {
            try
            {
                if (Session["Usuario"] == null)
                {
                    return Json(new { success = false, message = "Sesión expirada" }, JsonRequestBehavior.AllowGet);
                }

                int idEmpresa = ((Usuario)Session["Usuario"]).referencia_id.Value;

                var candidatosContratados = (from p in _db.Postulaciones
                                             join e in _db.Egresados on p.id_egresado equals e.id_egresado
                                             join v in _db.Vacantes on p.id_vacante equals v.id_vacante
                                             join c in _db.Carreras on e.id_carrera equals c.id_carrera into carreraJoin
                                             from c in carreraJoin.DefaultIfEmpty()
                                             where p.estado == "Contratado" && v.id_empresa == idEmpresa
                                             select new
                                             {
                                                 id_postulacion = p.id_postulacion,
                                                 id_egresado = e.id_egresado,
                                                 Nombre = e.nombres + " " + e.apellidos,
                                                 Carrera = c != null ? c.nombre_carrera : "Sin carrera",
                                                 Vacante = v.titulo,
                                                 Estado = p.estado,
                                                 FechaContratacion = p.fecha_postulacion
                                             }).ToList();

                return Json(new
                {
                    success = true,
                    data = candidatosContratados
                }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    success = false,
                    message = "Error al obtener candidatos contratados: " + ex.Message
                }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public JsonResult RevertirContratacion(int id_postulacion, string nuevo_estado)
        {
            try
            {
                if (Session["Usuario"] == null)
                {
                    return Json(new { success = false, message = "Sesión expirada" });
                }

                int idEmpresa = ((Usuario)Session["Usuario"]).referencia_id.Value;
                var postulacion = _db.Postulaciones.Find(id_postulacion);
                if (postulacion == null)
                {
                    return Json(new { success = false, message = "Postulación no encontrada" });
                }
                var vacante = _db.Vacantes.Find(postulacion.id_vacante);
                if (vacante == null || vacante.id_empresa != idEmpresa)
                {
                    return Json(new { success = false, message = "No tienes permiso para modificar esta postulación" });
                }
                if (postulacion.estado != "Contratado")
                {
                    return Json(new { success = false, message = "Solo se pueden revertir candidatos contratados" });
                }
                postulacion.estado = nuevo_estado;
                _db.SaveChanges();

                return Json(new
                {
                    success = true,
                    message = "Candidato devuelto a revisión exitosamente"
                });
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    success = false,
                    message = "Error al revertir contratación: " + ex.Message
                });
            }
        }

        [HttpPost]
        public JsonResult RechazarPostulacion(int id_postulacion, string motivo_rechazo = "")
        {
            try
            {
                if (Session["Usuario"] == null)
                {
                    return Json(new { success = false, message = "Sesión expirada" });
                }

                int idEmpresa = ((Usuario)Session["Usuario"]).referencia_id.Value;

                var resultado = _empresaServicio.RechazarPostulacion(
                    id_postulacion,
                    idEmpresa,
                    motivo_rechazo,
                    enviarCorreo: true
                );

                if (!resultado.Exito)
                {
                    return Json(new { success = false, message = resultado.Mensaje });
                }

                return Json(new
                {
                    success = true,
                    message = resultado.Mensaje,
                    data = new
                    {
                        id_postulacion = id_postulacion,
                        estado = "Rechazado",
                        motivo_guardado = !string.IsNullOrWhiteSpace(motivo_rechazo)
                    }
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ ERROR en RechazarPostulacion: {ex.Message}");
                return Json(new
                {
                    success = false,
                    message = "Error al rechazar postulación: " + ex.Message
                });
            }
        }

        [HttpPost]
        public JsonResult ContactarEgresado(int id_postulacion, string asunto, string mensaje)
        {
            try
            {
                if (Session["Usuario"] == null)
                {
                    return Json(new { success = false, message = "Sesión expirada" });
                }

                if (string.IsNullOrWhiteSpace(asunto))
                {
                    return Json(new { success = false, message = "El asunto es obligatorio" });
                }

                if (string.IsNullOrWhiteSpace(mensaje) || mensaje.Length < 50)
                {
                    return Json(new { success = false, message = "El mensaje debe tener al menos 50 caracteres" });
                }

                int idEmpresa = ((Usuario)Session["Usuario"]).referencia_id.Value;

                _empresaServicio.ContactarEgresadoPorPostulacion(
                    id_postulacion,
                    idEmpresa,
                    asunto,
                    mensaje
                );

                return Json(new
                {
                    success = true,
                    message = "Mensaje enviado exitosamente al candidato"
                });
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"❌ Error en ContactarEgresado: {ex.Message}");
                System.Diagnostics.Debug.WriteLine($"StackTrace: {ex.StackTrace}");

                return Json(new
                {
                    success = false,
                    message = "Error al enviar el mensaje: " + ex.Message
                });
            }
        }


        [HttpPost]
        public JsonResult ContactarEgresadoDirecto(int idEgresado, string asunto, string mensaje)
        {
            try
            {
                if (Session["Usuario"] == null)
                {
                    return Json(new { success = false, message = "Sesión expirada" });
                }

                if (string.IsNullOrWhiteSpace(asunto))
                {
                    return Json(new { success = false, message = "El asunto es obligatorio" });
                }

                if (string.IsNullOrWhiteSpace(mensaje) || mensaje.Length < 50)
                {
                    return Json(new { success = false, message = "El mensaje debe tener al menos 50 caracteres" });
                }

                int idEmpresa = ((Usuario)Session["Usuario"]).referencia_id.Value;

                _empresaServicio.ContactarEgresadoDirecto(
                    idEgresado,
                    idEmpresa,
                    asunto,
                    mensaje
                );

                return Json(new
                {
                    success = true,
                    message = "Mensaje enviado exitosamente al candidato"
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ ERROR al contactar egresado directo: {ex.Message}");
                return Json(new
                {
                    success = false,
                    message = "Error al enviar el mensaje: " + ex.Message
                });
            }
        }

        [HttpGet]
        public ActionResult DescargarPostulacionesVacantes(int idEmpresa)
        {
            var resultado = _empresaServicio.reportePostulacionesVacantes(idEmpresa);
            if (!resultado.Exito || resultado.ArchivoContenido == null)
                return Content("No se pudo generar el archivo.");

            return File(
                resultado.ArchivoContenido,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                resultado.NombreArchivo
            );
        }

        [HttpGet]
        public ActionResult DescargarVisualizacionesCV(int idEmpresa)
        {
            var resultado = _empresaServicio.reporteVisualizacionesCV(idEmpresa);
            if (!resultado.Exito || resultado.ArchivoContenido == null)
                return Content("No se pudo generar el archivo.");

            return File(
                resultado.ArchivoContenido,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                resultado.NombreArchivo
            );
        }

        [HttpGet]
        public ActionResult DescargarVacantesPorEstado(int idEmpresa, string estado)
        {
            var resultado = _empresaServicio.reporteVacantesPorEstado(idEmpresa, estado);
            if (!resultado.Exito || resultado.ArchivoContenido == null)
                return Content("No se pudo generar el archivo.");

            return File(
                resultado.ArchivoContenido,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                resultado.NombreArchivo
            );
        }

        [HttpGet]
        public ActionResult DescargarTopVacantes(int idEmpresa)
        {
            var resultado = _empresaServicio.reporteTopVacantes(idEmpresa);
            if (!resultado.Exito || resultado.ArchivoContenido == null)
                return Content("No se pudo generar el archivo.");

            return File(
                resultado.ArchivoContenido,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                resultado.NombreArchivo
            );
        }

        [HttpGet]
        public ActionResult DescargarEgresadosContratados(int idEmpresa)
        {
            var resultado = _empresaServicio.reporteEgresadosContratados(idEmpresa);
            if (!resultado.Exito || resultado.ArchivoContenido == null)
                return Content("No se pudo generar el archivo.");

            return File(
                resultado.ArchivoContenido,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                resultado.NombreArchivo
            );
        }

        [HttpGet]
        public ActionResult DescargarCarrerasPostulaciones(int idEmpresa)
        {
            var resultado = _empresaServicio.reporteCarrerasMasPostulaciones(idEmpresa);
            if (!resultado.Exito || resultado.ArchivoContenido == null)
                return Content("No se pudo generar el archivo.");

            return File(
                resultado.ArchivoContenido,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                resultado.NombreArchivo
            );
        }

        [HttpGet]
        public ActionResult DescargarVacantesSinPostulaciones(int idEmpresa)
        {
            var resultado = _empresaServicio.reporteVacantesSinPostulaciones(idEmpresa);
            if (!resultado.Exito || resultado.ArchivoContenido == null)
                return Content("No se pudo generar el archivo.");

            return File(
                resultado.ArchivoContenido,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                resultado.NombreArchivo
            );
        }

        [HttpGet]
        public ActionResult DescargarEgresadosNoVistos(int idEmpresa)
        {
            var resultado = _empresaServicio.reporteEgresadosNoVistos(idEmpresa);
            if (!resultado.Exito || resultado.ArchivoContenido == null)
                return Content("No se pudo generar el archivo.");

            return File(
                resultado.ArchivoContenido,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                resultado.NombreArchivo
            );
        }

        [HttpGet]
        public ActionResult DescargarEstadosPorVacante(int idEmpresa)
        {
            var resultado = _empresaServicio.reporteEstadosPorVacante(idEmpresa);
            if (!resultado.Exito || resultado.ArchivoContenido == null)
                return Content("No se pudo generar el archivo.");

            return File(
                resultado.ArchivoContenido,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                resultado.NombreArchivo
            );
        }

        [HttpGet]
        public ActionResult DescargarEgresadosActivos(int idEmpresa)
        {
            var resultado = _empresaServicio.reporteEgresadosMasActivos(idEmpresa);
            if (!resultado.Exito || resultado.ArchivoContenido == null)
                return Content("No se pudo generar el archivo.");

            return File(
                resultado.ArchivoContenido,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                resultado.NombreArchivo
            );
        }
        [HttpGet]
        public JsonResult ObtenerIdEmpresa()
        {
            try
            {
                if (Session["Usuario"] == null)
                {
                    return Json(new { success = false, message = "Sesión expirada" }, JsonRequestBehavior.AllowGet);
                }

                int idEmpresa = ((Usuario)Session["Usuario"]).referencia_id.Value;

                return Json(new
                {
                    success = true,
                    idEmpresa = idEmpresa
                }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    success = false,
                    message = "Error al obtener ID de empresa: " + ex.Message
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

            return RedirectToAction("Index", "Bienvenido");
        }


        [HttpGet]
        public JsonResult ObtenerNotificacionesActivas()
        {
            try
            {
                if (Session["Usuario"] == null)
                {
                    return Json(new { success = false, message = "Sesión expirada" }, JsonRequestBehavior.AllowGet);
                }

                int idEmpresa = ((Usuario)Session["Usuario"]).referencia_id.Value;
                var resultado = _empresaServicio.ObtenerNotificacionesActivas(idEmpresa);

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
                    message = "Error al obtener notificaciones activas: " + ex.Message
                }, JsonRequestBehavior.AllowGet);
            }
        }


    }
}