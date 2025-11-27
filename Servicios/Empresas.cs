using SistemaEgresados.DTO;
using SistemaEgresados.Models;
using SistemaEgresados.ServicioWebSocket;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SistemaEgresados.Servicios
{
    public class Empresas
    {
        private readonly SistemaEgresadosUtecEntities _db = new SistemaEgresadosUtecEntities();
        private readonly Servicios.ProcesosAutomatizados _procesosService = new ProcesosAutomatizados();
        private readonly GenerarExcel _excelServicio = new GenerarExcel();
        private readonly Email _emailServicio = new Email();


        public Resultado ObtenerDatosEmpresa(int IdEmpresa)
        {
            try
            {
                var vacantesActivas = _db.Vacantes
                    .Count(v => v.id_empresa == IdEmpresa &&
                           (v.estado == "Abierta" || v.estado == "Activa"));

                var totalCandidatos = _db.Postulaciones
                    .Where(p => p.Vacante.id_empresa == IdEmpresa &&
                           p.estado != "Cancelada Por Egresado")
                    .Select(p => p.id_egresado)
                    .Distinct()
                    .Count();

                var estadosNotificaciones = new List<string> { "En Revisión", "Activa" };
                var notificacionesActivas = _db.Postulaciones
                    .Count(p => p.Vacante.id_empresa == IdEmpresa &&
                           estadosNotificaciones.Contains(p.estado));

                var totalPostulaciones = _db.Postulaciones
                    .Count(p => p.Vacante.id_empresa == IdEmpresa);

                var promedioCandidatosPorVacante = vacantesActivas > 0
                    ? Math.Round((double)totalPostulaciones / vacantesActivas, 1)
                    : 0;

                var datosEmpresa = _db.Empresas
                    .Where(emp => emp.id_empresa == IdEmpresa)
                    .Select(emp => new
                    {
                        emp.id_empresa,
                        emp.razon_social,
                        emp.nit,
                        emp.email_contacto,
                        emp.telefono,
                        emp.direccion,
                        emp.sector_economico,
                        emp.tamano_empresa,
                        emp.vinculada_universidad,
                        emp.puntuacion_empresa,
                        emp.estado_activo,
                        emp.fecha_registro,

                        Estadisticas = new
                        {
                            VacantesActivas = vacantesActivas,
                            TotalCandidatos = totalCandidatos,
                            NotificacionesActivas = notificacionesActivas,
                            PromedioCandidatosPorVacante = promedioCandidatosPorVacante
                        },

                        VacantesRecientes = _db.Vacantes
                            .Where(v => v.id_empresa == emp.id_empresa)
                            .OrderByDescending(v => v.fecha_publicacion)
                            .Take(10)
                            .Select(v => new
                            {
                                v.id_vacante,
                                v.titulo,
                                v.estado,
                                v.fecha_publicacion,
                                v.fecha_cierre,
                                v.area,
                                NumeroPostulantes = _db.Postulaciones
                                    .Count(p => p.id_vacante == v.id_vacante)
                            }).ToList(),

                        CandidatosEnProceso = _db.Postulaciones
                            .Where(p => p.Vacante.id_empresa == emp.id_empresa &&
                                       p.estado != "Rechazado" &&
                                       p.estado != "Contratado" &&
                                       p.estado != "Eliminada")
                            .OrderByDescending(p => p.fecha_postulacion)
                            .Take(5)
                            .Select(p => new
                            {
                                p.id_postulacion,
                                NombreCandidato = (p.Egresado.nombres ?? "") + " " + (p.Egresado.apellidos ?? ""),
                                TituloVacante = p.Vacante.titulo ?? "Sin título",
                                Carrera = p.Egresado.Carrera != null ? p.Egresado.Carrera.nombre_carrera : "Sin carrera",
                                estado = p.estado ?? "En revisión",
                                p.fecha_postulacion
                            }).ToList(),

                        TopSectores = _db.Postulaciones
                            .Where(p => p.Vacante.id_empresa == emp.id_empresa)
                            .GroupBy(p => p.Egresado.Carrera.nombre_carrera)
                            .Select(g => new
                            {
                                Sector = g.Key ?? "Sin especificar",
                                Cantidad = g.Count(),
                                Porcentaje = 0
                            })
                            .OrderByDescending(x => x.Cantidad)
                            .Take(3)
                            .ToList()
                    }).FirstOrDefault();

                if (datosEmpresa == null)
                {
                    return Resultado.error("Empresa no encontrada");
                }

                var totalCandidatosCarreras = datosEmpresa.TopSectores.Sum(s => s.Cantidad);
                if (totalCandidatosCarreras > 0)
                {
                    var sectoresConPorcentaje = datosEmpresa.TopSectores.Select(s => new
                    {
                        s.Sector,
                        s.Cantidad,
                        Porcentaje = Math.Round((double)s.Cantidad / totalCandidatosCarreras * 100, 0)
                    }).ToList();

                    var resultado = new
                    {
                        datosEmpresa.id_empresa,
                        datosEmpresa.razon_social,
                        datosEmpresa.nit,
                        datosEmpresa.email_contacto,
                        datosEmpresa.telefono,
                        datosEmpresa.direccion,
                        datosEmpresa.sector_economico,
                        datosEmpresa.tamano_empresa,
                        datosEmpresa.vinculada_universidad,
                        datosEmpresa.puntuacion_empresa,
                        datosEmpresa.estado_activo,
                        datosEmpresa.fecha_registro,
                        datosEmpresa.Estadisticas,
                        datosEmpresa.VacantesRecientes,
                        datosEmpresa.CandidatosEnProceso,
                        TopSectores = sectoresConPorcentaje
                    };

                    return Resultado.exito("Datos de la empresa obtenidos exitosamente", resultado);
                }

                return Resultado.exito("Datos de la empresa obtenidos exitosamente", datosEmpresa);
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al obtener datos de la empresa: " + ex.Message);
            }
        }


        public Resultado ActualizarEstadisticas(int IdEmpresa)
        {
            try
            {
                var empresa = _db.Empresas.FirstOrDefault(e => e.id_empresa == IdEmpresa);
                if (empresa == null)
                {
                    return Resultado.error("Empresa no encontrada");
                }

                var vacantesActivas = _db.Vacantes
                    .Count(v => v.id_empresa == IdEmpresa &&
                           (v.estado == "Abierta" || v.estado == "Activa"));

                var totalCandidatos = _db.Postulaciones
                    .Where(p => p.Vacante.id_empresa == IdEmpresa &&
                           p.estado != "Cancelada Por Egresado")
                    .Select(p => p.id_egresado)
                    .Distinct()
                    .Count();

                var estadosNotificaciones = new List<string> { "En Revisión", "Activa" };
                var notificacionesActivas = _db.Postulaciones
                    .Count(p => p.Vacante.id_empresa == IdEmpresa &&
                           estadosNotificaciones.Contains(p.estado));

                var totalPostulaciones = _db.Postulaciones
                    .Count(p => p.Vacante.id_empresa == IdEmpresa);

                var promedioCandidatosPorVacante = vacantesActivas > 0
                    ? Math.Round((double)totalPostulaciones / vacantesActivas, 1)
                    : 0;

                var datosEmpresa = new
                {
                    id_empresa = IdEmpresa,
                    Estadisticas = new
                    {
                        VacantesActivas = vacantesActivas,
                        TotalCandidatos = totalCandidatos,
                        NotificacionesActivas = notificacionesActivas,
                        PromedioCandidatosPorVacante = promedioCandidatosPorVacante
                    }
                };

                return Resultado.exito("Estadisticas", datosEmpresa);
            }
            catch (Exception ex)
            {
                return Resultado.error($"Error al actualizar estadísticas: {ex.Message}");
            }
        }

        public Resultado ObtenerDatosEmpresaCompletos(int idEmpresa)
        {
            try
            {
                var empresa = _db.Empresas.Find(idEmpresa);

                if (empresa == null)
                {
                    return Resultado.error("Empresa no encontrada");
                }

                var usuario = _db.Usuarios
                    .FirstOrDefault(u => u.referencia_id == idEmpresa && u.tipo_usuario == "Empresa");

                var datosCompletos = new
                {
                    razon_social = empresa.razon_social,
                    nit = empresa.nit,
                    email_contacto = empresa.email_contacto,
                    telefono = empresa.telefono,
                    direccion = empresa.direccion,
                    sector_economico = empresa.sector_economico,
                    tamano_empresa = empresa.tamano_empresa,
                    nombre_usuario = usuario?.nombre_completo,
                    email_usuario = usuario?.email
                };

                return Resultado.exito("Datos obtenidos exitosamente", datosCompletos);
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al obtener datos: " + ex.Message);
            }
        }

        public Resultado BuscarEgresadosPublicos()
        {
            try
            {
                var egresados = (from e in _db.Egresados
                                 join c in _db.CVs_Egresados on e.id_egresado equals c.id_egresado
                                 where c.privacidad.ToLower() == "publica"
                                 select new
                                 {
                                     e.id_egresado,
                                     NombreCompleto = e.nombres + " " + e.apellidos,
                                     e.email,
                                     e.telefono,
                                     c.CartaPresentacion
                                 }).ToList();

                if (egresados.Count == 0)
                {
                    return Resultado.error("No hay egresados con CV público.");
                }

                return Resultado.exito("Egresados obtenidos exitosamente", egresados);
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al obtener egresados: " + ex.Message);
            }
        }

        public Resultado FiltrarEgresadosCVPublico(string carrera, string habilidad)
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

                return Resultado.exito("Filtrado exitoso", egresados);
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al filtrar egresados: " + ex.Message);
            }
        }

        public Resultado ObtenerDiagnosticoDatos()
        {
            try
            {
                var totalEgresados = _db.Egresados.Count();
                var totalCVs = _db.CVs_Egresados.Count();

                var valoresPrivacidad = _db.CVs_Egresados
                    .Select(cv => cv.privacidad)
                    .Distinct()
                    .ToList();

                var ejemploCompleto = (from cv in _db.CVs_Egresados
                                       join e in _db.Egresados on cv.id_egresado equals e.id_egresado
                                       join c in _db.Carreras on e.id_carrera equals c.id_carrera into carreraJoin
                                       from c in carreraJoin.DefaultIfEmpty()
                                       select new
                                       {
                                           e.id_egresado,
                                           e.nombres,
                                           e.apellidos,
                                           e.email,
                                           e.numero_documento,
                                           cv.privacidad,
                                           carrera = c != null ? c.nombre_carrera : null,
                                           tiene_carrera = c != null
                                       }).FirstOrDefault();

                var datos = new
                {
                    totalEgresados,
                    totalCVs,
                    valoresPrivacidad,
                    ejemploCompleto
                };

                return Resultado.exito("Diagnóstico obtenido exitosamente", datos);
            }
            catch (Exception ex)
            {
                return Resultado.error(ex.Message);
            }
        }

        public Resultado ObtenerCVParaDescargar(int idEgresado)
        {
            try
            {
                var cv = _db.CVs_Egresados
                    .FirstOrDefault(c => c.id_egresado == idEgresado &&
                        (c.privacidad.ToLower() == "publico" || c.privacidad.ToLower() == "publica"));

                if (cv == null)
                {
                    return Resultado.error("CV no disponible");
                }

                if (string.IsNullOrEmpty(cv.ruta_archivo))
                {
                    return Resultado.error("Archivo no encontrado");
                }

                var datos = new
                {
                    ruta_archivo = cv.ruta_archivo,
                    nombre_archivo = cv.nombre_archivo ?? $"CV_{idEgresado}.pdf"
                };

                return Resultado.exito("CV encontrado", datos);
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al obtener CV: " + ex.Message);
            }
        }

        public Resultado VerPerfilEgresadoCompleto(int idEgresado)
        {
            try
            {
                var perfil = (from cv in _db.CVs_Egresados
                              join e in _db.Egresados on cv.id_egresado equals e.id_egresado
                              join c in _db.Carreras on e.id_carrera equals c.id_carrera into carreraJoin
                              from c in carreraJoin.DefaultIfEmpty()
                              where cv.id_egresado == idEgresado &&
                                    (cv.privacidad.ToLower() == "publico" || cv.privacidad.ToLower() == "publica")
                              select new
                              {
                                  id_egresado = e.id_egresado,
                                  id_cv = cv.id_cv,
                                  NombreCompleto = e.nombres + " " + e.apellidos,
                                  carrera = c != null ? c.nombre_carrera : "Sin carrera",
                                  email = e.email,
                                  telefono = e.telefono,
                                  numero_documento = e.numero_documento,
                                  carta_presentacion = cv.CartaPresentacion,
                                  habilidades = cv.habilidades_principales,
                                  ruta_archivo = cv.ruta_archivo,
                                  nombre_archivo = cv.nombre_archivo,
                                  anio_graduacion = e.fecha_graduacion,
                                  promedio_academico = e.promedio_academico
                              }).FirstOrDefault();

                if (perfil == null)
                {
                    return Resultado.error("No se encontró el perfil del egresado o su CV no es público");
                }

                return Resultado.exito("Perfil obtenido exitosamente", perfil);
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al obtener el perfil: " + ex.Message);
            }
        }

        public Resultado RegistrarVisualizacionCV(int idEgresado, int idEmpresa, string ipAddress, string navegador, int? idVacante = null)
        {
            try
            {
                var cv = _db.CVs_Egresados.FirstOrDefault(c => c.id_egresado == idEgresado);
                if (cv == null)
                {
                    return Resultado.error("No se encontró el CV del egresado");
                }

                var usuarioEmpresa = _db.Usuarios_Empresa.FirstOrDefault(ue => ue.id_usuario_empresa == idEmpresa);
                if (usuarioEmpresa == null)
                {
                    return Resultado.error("No se encontró el usuario de la empresa");
                }

                var egresado = _db.Egresados.FirstOrDefault(e => e.id_egresado == idEgresado);
                if (egresado == null)
                {
                    return Resultado.error("No se encontró el egresado");
                }

                var empresa = _db.Empresas.FirstOrDefault(emp => emp.id_empresa == usuarioEmpresa.id_empresa);
                if (empresa == null)
                {
                    return Resultado.error("No se encontró la empresa");
                }

                _db.SP_RegistrarVisualizacionCV1(
                    cv.id_cv,
                    usuarioEmpresa.id_empresa,
                    idEmpresa,
                    ipAddress,
                    navegador,
                    ""
                );

                WebSocketService.Instance.NotificarVisualizacion(
                    egresado.email,
                    empresa.razon_social
                );

                string nombreVacante = null;
                if (idVacante.HasValue)
                {
                    var vacante = _db.Vacantes.Find(idVacante.Value);
                    nombreVacante = vacante?.titulo;
                }

                try
                {
                    var resultadoEmail = _emailServicio.EnviarNotificacionVisualizacionCV(
                        emailEgresado: egresado.email,
                        nombreEgresado: egresado.nombres + " " + egresado.apellidos,
                        nombreEmpresa: empresa.razon_social,
                        vacante: nombreVacante
                    );

                    if (!resultadoEmail.Exito)
                    {
                        Console.WriteLine($"⚠️ Advertencia: No se pudo enviar el correo de notificación: {resultadoEmail.Mensaje}");
                    }
                    else
                    {
                        Console.WriteLine($"✅ Correo de notificación enviado exitosamente a {egresado.email}");
                    }
                }
                catch (Exception emailEx)
                {
                    Console.WriteLine($"⚠️ Error al enviar correo de notificación: {emailEx.Message}");
                }

                return Resultado.exito("Visualización registrada exitosamente");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ ERROR CRÍTICO al registrar visualización: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");
                return Resultado.error("Error al registrar visualización: " + ex.Message);
            }
        }

        public Resultado ObtenerHistorialVisualizaciones(int idEmpresa)
        {
            try
            {
                var visualizaciones = (from v in _db.Visualizaciones_CV
                                       join cv in _db.CVs_Egresados on v.id_cv equals cv.id_cv
                                       join e in _db.Egresados on cv.id_egresado equals e.id_egresado
                                       join c in _db.Carreras on e.id_carrera equals c.id_carrera into carreraJoin
                                       from c in carreraJoin.DefaultIfEmpty()
                                       where v.id_empresa == idEmpresa
                                       orderby v.fecha_visualizacion descending
                                       select new
                                       {
                                           id_visualizacion = v.id_visualizacion,
                                           NombreEgresado = e.nombres + " " + e.apellidos,
                                           Carrera = c != null ? c.nombre_carrera : "Sin carrera",
                                           fecha_visualizacion = v.fecha_visualizacion,
                                           navegador = v.navegador,
                                           ip_address = v.ip_address
                                       }).Take(50).ToList();

                return Resultado.exito("Historial obtenido exitosamente", visualizaciones);
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al obtener historial: " + ex.Message);
            }
        }
        public Resultado ObtenerEstadisticas(int idEmpresa)
        {
            try
            {
                var estadisticas = new
                {
                    VacantesActivas = _db.Vacantes.Count(v =>
                        v.id_empresa == idEmpresa &&
                        v.estado == "Activa"),

                    TotalCandidatos = _db.Postulaciones
                        .Where(p => p.Vacante.id_empresa == idEmpresa)
                        .Select(p => p.id_egresado)
                        .Distinct()
                        .Count(),

                    Entrevistas = _db.Vacantes.Count(v =>
                        v.id_empresa == idEmpresa &&
                        v.estado == "Entrevista")
                };

                return Resultado.exito("Estadísticas obtenidas exitosamente", estadisticas);
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al obtener estadísticas: " + ex.Message);
            }
        }


        public Resultado ObtenerEstadisticasVisualizaciones(int idEmpresa)
        {
            try
            {
                var estadisticas = new
                {
                    TotalVisualizaciones = _db.Visualizaciones_CV.Count(v => v.id_empresa == idEmpresa),

                    VisualizacionesHoy = _db.Visualizaciones_CV.Count(v =>
                        v.id_empresa == idEmpresa &&
                        System.Data.Entity.DbFunctions.TruncateTime(v.fecha_visualizacion) == System.Data.Entity.DbFunctions.TruncateTime(DateTime.Now)),

                    VisualizacionesEsteMes = _db.Visualizaciones_CV.Count(v =>
                        v.id_empresa == idEmpresa &&
                        v.fecha_visualizacion.Month == DateTime.Now.Month &&
                        v.fecha_visualizacion.Year == DateTime.Now.Year),

                    PerfilesUnicos = _db.Visualizaciones_CV
                        .Where(v => v.id_empresa == idEmpresa)
                        .Select(v => v.id_cv)
                        .Distinct()
                        .Count(),

                    NavegadoresMasUsados = _db.Visualizaciones_CV
                        .Where(v => v.id_empresa == idEmpresa)
                        .GroupBy(v => v.navegador)
                        .Select(g => new
                        {
                            Navegador = g.Key,
                            Cantidad = g.Count()
                        })
                        .OrderByDescending(x => x.Cantidad)
                        .Take(5)
                        .ToList()
                };

                return Resultado.exito("Estadísticas obtenidas exitosamente", estadisticas);
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al obtener estadísticas: " + ex.Message);
            }
        }


        public Resultado ObtenerTopSectoresCandidatos(int IdEmpresa)
        {
            try
            {
                var postulacionesPorCarrera = (from p in _db.Postulaciones
                                               join v in _db.Vacantes on p.id_vacante equals v.id_vacante
                                               join e in _db.Egresados on p.id_egresado equals e.id_egresado
                                               join c in _db.Carreras on e.id_carrera equals c.id_carrera into carreraJoin
                                               from c in carreraJoin.DefaultIfEmpty()
                                               where v.id_empresa == IdEmpresa
                                                  && p.estado != "Rechazado"
                                                  && p.estado != "Cancelado por Egresado"
                                               select new
                                               {
                                                   p.id_postulacion,
                                                   p.id_egresado,
                                                   p.estado,
                                                   Carrera = c != null ? c.nombre_carrera : "Sin carrera",
                                                   NombreEgresado = e.nombres + " " + e.apellidos
                                               }).ToList();

                if (postulacionesPorCarrera.Count == 0)
                {
                    return Resultado.exito("No hay postulaciones para esta empresa", new List<object>());
                }

                var sectores = postulacionesPorCarrera
                    .GroupBy(p => p.Carrera)
                    .Select(g => new
                    {
                        Sector = g.Key,
                        Cantidad = g.Select(x => x.id_egresado).Distinct().Count(),
                        TotalPostulaciones = g.Count(),
                        Estados = g.GroupBy(x => x.estado)
                                  .Select(e => new { Estado = e.Key, Cantidad = e.Count() })
                                  .ToList()
                    })
                    .OrderByDescending(s => s.Cantidad)
                    .Take(5)
                    .ToList();

                var totalEgresados = sectores.Sum(s => s.Cantidad);

                var resultado = sectores.Select(s => new
                {
                    s.Sector,
                    s.Cantidad,
                    s.TotalPostulaciones,
                    Porcentaje = totalEgresados > 0
                        ? Math.Round((decimal)s.Cantidad / totalEgresados * 100, 0)
                        : 0
                }).ToList();

                return Resultado.exito("Sectores de postulantes obtenidos exitosamente", resultado);
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al obtener sectores: " + ex.Message);
            }
        }


        public Resultado ObtenerTopCarrerasContratadas(int idEmpresa)
        {
            try
            {
                var carrerasContratadas = (from p in _db.Postulaciones
                                           join v in _db.Vacantes on p.id_vacante equals v.id_vacante
                                           join e in _db.Egresados on p.id_egresado equals e.id_egresado
                                           join c in _db.Carreras on e.id_carrera equals c.id_carrera into carreraJoin
                                           from c in carreraJoin.DefaultIfEmpty()
                                           where v.id_empresa == idEmpresa && p.estado == "Contratado"
                                           select new
                                           {
                                               Carrera = c != null ? c.nombre_carrera : "Sin carrera",
                                               IdEgresado = e.id_egresado
                                           }).ToList();

                if (carrerasContratadas.Count == 0)
                {
                    return Resultado.exito("No hay contrataciones registradas", new List<object>());
                }

                var topCarreras = carrerasContratadas
                    .GroupBy(x => x.Carrera)
                    .Select(g => new
                    {
                        NombreCarrera = g.Key,
                        TotalContratados = g.Select(x => x.IdEgresado).Distinct().Count()
                    })
                    .OrderByDescending(x => x.TotalContratados)
                    .Take(5)
                    .ToList();

                var totalContratados = topCarreras.Sum(x => x.TotalContratados);

                var resultado = topCarreras.Select(x => new
                {
                    x.NombreCarrera,
                    x.TotalContratados,
                    Porcentaje = totalContratados > 0
                        ? Math.Round((decimal)x.TotalContratados / totalContratados * 100, 0)
                        : 0
                }).ToList();

                var totalPostulaciones = _db.Postulaciones
                    .Count(p => p.Vacante.id_empresa == idEmpresa);

                return Resultado.exito("Top carreras contratadas obtenido exitosamente", new
                {
                    carreras = resultado,
                    totalContratados = totalContratados,
                    totalPostulaciones = totalPostulaciones
                });
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al obtener top carreras contratadas: " + ex.Message);
            }
        }

        public Resultado ActualizarPerfil(Empresa empresaActualizada)
        {
            try
            {
                var empresa = _db.Empresas.Find(empresaActualizada.id_empresa);

                if (empresa == null)
                {
                    return Resultado.error("Empresa no encontrada");
                }

                empresa.razon_social = empresaActualizada.razon_social;
                empresa.nit = empresaActualizada.nit;
                empresa.email_contacto = empresaActualizada.email_contacto;
                empresa.telefono = empresaActualizada.telefono;
                empresa.direccion = empresaActualizada.direccion;
                empresa.sector_economico = empresaActualizada.sector_economico;
                empresa.tamano_empresa = empresaActualizada.tamano_empresa;

                int registrosAfectados = _db.SaveChanges();

                return Resultado.exito("Perfil actualizado correctamente", empresa);
            }
            catch (Exception ex)
            {
                if (ex.InnerException != null)
                {
                    System.Diagnostics.Debug.WriteLine($"InnerException: {ex.InnerException.Message}");
                }

                return Resultado.error("Error al actualizar perfil: " + ex.Message);
            }
        }

        public Resultado CrearVacante(Vacante vacante)
        {
            try
            {
                if (string.IsNullOrEmpty(vacante.titulo))
                    return Resultado.error("El título es requerido");

                if (string.IsNullOrEmpty(vacante.area))
                    return Resultado.error("El área es requerida");

                if (string.IsNullOrEmpty(vacante.requisitos))
                    return Resultado.error("Los requisitos son requeridos");

                if (string.IsNullOrEmpty(vacante.tipo_contrato))
                    return Resultado.error("El tipo de contrato es requerido");
                var empresa = _db.Empresas.FirstOrDefault(e => e.id_empresa == _db.Usuarios_Empresa.FirstOrDefault(ue => ue.id_usuario_empresa == vacante.creado_por.Value).id_empresa);
                if (empresa == null)
                {
                    return Resultado.error("Error");
                }
                vacante.id_empresa = empresa.id_empresa;
                vacante.fecha_publicacion = DateTime.Now;
                vacante.estado = "Abierta";

                if (!vacante.fecha_cierre.HasValue)
                {
                    vacante.fecha_cierre = DateTime.Now.AddDays(30);
                }

                _db.Vacantes.Add(vacante);
                _db.SaveChanges();
                _procesosService.NotificarEgresadosVacanteRecomendada(vacante);
                return Resultado.exito("Vacante creada exitosamente", new { vacante.id_vacante });
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al crear la vacante: " + ex.Message);
            }
        }

        public Resultado ActualizarEstadoVacante(int idVacante, string nuevoEstado)
        {
            try
            {
                var vacante = _db.Vacantes.Find(idVacante);

                if (vacante == null)
                {
                    return Resultado.error("Vacante no encontrada");
                }

                var estadosValidos = new List<string>
                {
                    "En Revisión", "Entrevista", "Oferta",
                    "Contratado", "Cerrado", "Borrador", "Abierta"
                };

                if (!estadosValidos.Contains(nuevoEstado))
                {
                    return Resultado.error("Estado no válido");
                }

                vacante.estado = nuevoEstado;
                _db.SaveChanges();

                return Resultado.exito($"Estado actualizado a: {nuevoEstado}");
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al actualizar el estado: " + ex.Message);
            }
        }

        public Resultado DesactivarVacante(int idVacante)
        {
            try
            {
                var vacante = _db.Vacantes.Find(idVacante);

                if (vacante == null)
                {
                    return Resultado.error("Vacante no encontrada");
                }

                vacante.estado = "Eliminada";
                _db.SaveChanges();

                return Resultado.exito("Vacante eliminada correctamente");
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al eliminar la vacante: " + ex.Message);
            }
        }

        public Resultado ObtenerPipelineVacantesPorEstado(int idEmpresa)
        {
            try
            {
                var pipeline = _db.Vacantes
                    .Where(v => v.id_empresa == idEmpresa && v.estado != "Eliminada")
                    .GroupBy(v => v.estado)
                    .Select(g => new
                    {
                        Estado = g.Key,
                        Cantidad = g.Count()
                    })
                    .ToList();

                if (!pipeline.Any())
                {
                    return Resultado.exito("No hay vacantes registradas.", new List<object>());
                }

                int total = pipeline.Sum(x => x.Cantidad);
                var resultado = pipeline.Select(x => new
                {
                    x.Estado,
                    x.Cantidad,
                    Porcentaje = total > 0 ? Math.Round((decimal)x.Cantidad / total * 100, 1) : 0
                }).ToList();

                return Resultado.exito("Pipeline de vacantes generado exitosamente", resultado);
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al generar pipeline de vacantes: " + ex.Message);
            }
        }

        public Resultado ObtenerVacantes(int idEmpresa)
        {
            try
            {
                var vacantes = _db.Vacantes
                    .Where(v => v.id_empresa == idEmpresa && v.estado != "Eliminada")
                    .OrderByDescending(v => v.fecha_publicacion)
                    .ToList()
                    .Select(v => new
                    {
                        id_vacante = v.id_vacante,
                        titulo = v.titulo,
                        descripcion = v.descripcion,
                        requisitos = v.requisitos,
                        salario_min = v.salario_min,
                        salario_max = v.salario_max,
                        salario_confidencial = v.salario_confidencial,
                        tipo_contrato = v.tipo_contrato,
                        ubicacion = v.ubicacion,
                        area = v.area,
                        fecha_publicacion = v.fecha_publicacion.HasValue ?
                            v.fecha_publicacion.Value.ToString("yyyy-MM-dd") : null,
                        fecha_cierre = v.fecha_cierre.HasValue ?
                            v.fecha_cierre.Value.ToString("yyyy-MM-dd") : null,
                        estado = v.estado,
                        modalidad = v.modalidad,
                        total_postulaciones = _db.Postulaciones
                            .Count(p => p.id_vacante == v.id_vacante
                                && p.estado != "Rechazado"
                                && p.estado != "Cancelada Por Egresado")
                    })
                    .ToList();

                return Resultado.exito("Vacantes obtenidas exitosamente", vacantes);
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al obtener vacantes: " + ex.Message);
            }
        }

        public Resultado ObtenerVacantesFiltradas(int idEmpresa, string titulo = null,
        string estado = null, string area = null, DateTime? fechaPublicacion = null)
        {
            try
            {
                var query = _db.Vacantes
                    .Where(v => v.id_empresa == idEmpresa && v.estado != "Eliminada");

                if (!string.IsNullOrEmpty(titulo))
                {
                    titulo = titulo.Trim().ToLower();
                    query = query.Where(v => v.titulo.ToLower().Contains(titulo));
                }

                if (!string.IsNullOrEmpty(estado))
                {
                    string estadoNormalizado = NormalizarEstado(estado);
                    query = query.Where(v =>
                        v.estado == estado ||
                        v.estado == estadoNormalizado ||
                        v.estado.Replace(" ", "").ToLower() == estado.Replace(" ", "").ToLower()
                    );
                }

                if (!string.IsNullOrEmpty(area))
                {
                    query = query.Where(v => v.area == area);
                }

                if (fechaPublicacion.HasValue)
                {
                    query = query.Where(v => v.fecha_publicacion.HasValue &&
                        System.Data.Entity.DbFunctions.TruncateTime(v.fecha_publicacion) ==
                        System.Data.Entity.DbFunctions.TruncateTime(fechaPublicacion));
                }

                var vacantes = query
                    .OrderByDescending(v => v.fecha_publicacion)
                    .ToList()
                    .Select(v => new
                    {
                        id_vacante = v.id_vacante,
                        titulo = v.titulo,
                        descripcion = v.descripcion,
                        requisitos = v.requisitos,
                        salario_min = v.salario_min,
                        salario_max = v.salario_max,
                        salario_confidencial = v.salario_confidencial,
                        tipo_contrato = v.tipo_contrato,
                        ubicacion = v.ubicacion,
                        area = v.area,
                        fecha_publicacion = v.fecha_publicacion.HasValue ?
                            v.fecha_publicacion.Value.ToString("yyyy-MM-dd") : null,
                        fecha_cierre = v.fecha_cierre.HasValue ?
                            v.fecha_cierre.Value.ToString("yyyy-MM-dd") : null,
                        estado = v.estado,
                        modalidad = v.modalidad,
                        total_postulaciones = _db.Postulaciones
                            .Count(p => p.id_vacante == v.id_vacante
                                && p.estado != "Rechazado"
                                && p.estado != "Cancelada Por Egresado")
                    })
                    .ToList();

                System.Diagnostics.Debug.WriteLine($"🔍 Filtro título: '{titulo}' - Resultados: {vacantes.Count}");

                return Resultado.exito("Vacantes filtradas exitosamente", vacantes);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"❌ Error en filtro: {ex.Message}");
                return Resultado.error("Error al filtrar vacantes: " + ex.Message);
            }
        }

        private string NormalizarEstado(string estado)
        {
            if (string.IsNullOrEmpty(estado)) return estado;

            var equivalencias = new Dictionary<string, string>
            {
                { "Cerrado", "Cerrada" },
                { "Cerrada", "Cerrado" },
                { "En Revisión", "En Revision" },
                { "En Revision", "En Revisión" },
                { "Revision", "En Revisión" },
                { "Revisión", "En Revisión" }
            };

            if (equivalencias.ContainsKey(estado))
            {
                return equivalencias[estado];
            }

            return estado;
        }

        public Resultado ObtenerDetalleVacante(int idVacante, int idEmpresa)
        {
            try
            {
                var vacante = _db.Vacantes
                    .Where(v => v.id_vacante == idVacante && v.id_empresa == idEmpresa)
                    .Select(v => new
                    {
                        id_vacante = v.id_vacante,
                        titulo = v.titulo,
                        descripcion = v.descripcion,
                        requisitos = v.requisitos,
                        salario_min = v.salario_min,
                        salario_max = v.salario_max,
                        salario_confidencial = v.salario_confidencial,
                        tipo_contrato = v.tipo_contrato,
                        ubicacion = v.ubicacion,
                        area = v.area,
                        fecha_publicacion = v.fecha_publicacion,
                        fecha_cierre = v.fecha_cierre,
                        estado = v.estado,
                        modalidad = v.modalidad
                    })
                    .FirstOrDefault();

                if (vacante == null)
                {
                    return Resultado.error("Vacante no encontrada");
                }

                return Resultado.exito("Detalle obtenido correctamente", vacante);
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al obtener detalles: " + ex.Message);
            }
        }
        public Resultado ActualizarVacante(Vacante vacanteActualizada)
        {
            try
            {
                var vacante = _db.Vacantes.Find(vacanteActualizada.id_vacante);

                if (vacante == null)
                {
                    return Resultado.error("Vacante no encontrada");
                }
                if (vacanteActualizada.fecha_cierre < vacante.fecha_publicacion)
                {
                    return Resultado.error("La fecha de cierre no puede ser anterior a la fecha de publicación");
                }
                vacante.titulo = vacanteActualizada.titulo;
                vacante.descripcion = vacanteActualizada.descripcion;
                vacante.requisitos = vacanteActualizada.requisitos;
                vacante.salario_min = vacanteActualizada.salario_min;
                vacante.salario_max = vacanteActualizada.salario_max;
                vacante.salario_confidencial = vacanteActualizada.salario_confidencial;
                vacante.tipo_contrato = vacanteActualizada.tipo_contrato;
                vacante.ubicacion = vacanteActualizada.ubicacion;
                vacante.area = vacanteActualizada.area;
                vacante.fecha_cierre = vacanteActualizada.fecha_cierre;
                vacante.estado = vacanteActualizada.estado;
                vacante.modalidad = vacanteActualizada.modalidad;

                _db.SaveChanges();

                return Resultado.exito("Vacante actualizada correctamente");
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al actualizar: " + ex.Message);
            }
        }

        public Resultado RechazarPostulacion(int idPostulacion, int idEmpresa, string motivoRechazo = "", bool enviarCorreo = true)
        {
            try
            {
                var postulacion = _db.Postulaciones
                    .Include("Egresado")
                    .Include("Vacante")
                    .Include("Vacante.Empresa")
                    .FirstOrDefault(p => p.id_postulacion == idPostulacion);

                if (postulacion == null)
                {
                    return Resultado.error("Postulación no encontrada");
                }

                if (postulacion.Vacante.id_empresa != idEmpresa)
                {
                    return Resultado.error("No tienes permisos para rechazar esta postulación");
                }

                if (postulacion.estado == "Rechazado")
                {
                    return Resultado.error("Esta postulación ya fue rechazada anteriormente");
                }

                var egresado = postulacion.Egresado;
                var vacante = postulacion.Vacante;
                var empresa = postulacion.Vacante.Empresa;

                postulacion.estado = "Rechazado";
                postulacion.fecha_actualizacion = DateTime.Now;

                if (!string.IsNullOrWhiteSpace(motivoRechazo))
                {
                    postulacion.motivo_rechazo = motivoRechazo;
                }

                _db.SaveChanges();

                Console.WriteLine($"✅ Postulación {idPostulacion} rechazada correctamente");

                if (enviarCorreo)
                {
                    try
                    {
                        bool incluirMotivo = !string.IsNullOrWhiteSpace(motivoRechazo);

                        var resultadoEmail = _emailServicio.EnviarCorreoRechazoPostulacion(
                            emailEgresado: egresado.email,
                            nombreEgresado: egresado.nombres + " " + egresado.apellidos,
                            nombreEmpresa: empresa.razon_social,
                            tituloVacante: vacante.titulo,
                            motivoRechazo: motivoRechazo,
                            incluirMotivo: incluirMotivo
                        );

                        if (resultadoEmail.Exito)
                        {
                            Console.WriteLine($"✅ Correo de rechazo enviado a {egresado.email}");
                        }
                        else
                        {
                            Console.WriteLine($"⚠️ No se pudo enviar el correo: {resultadoEmail.Mensaje}");
                        }
                    }
                    catch (Exception emailEx)
                    {
                        Console.WriteLine($"⚠️ Error al enviar correo de rechazo: {emailEx.Message}");
                    }
                }

                string mensaje = !string.IsNullOrWhiteSpace(motivoRechazo)
                    ? "Postulación rechazada y notificación enviada con retroalimentación"
                    : "Postulación rechazada y notificación enviada correctamente";

                return Resultado.exito(mensaje);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ ERROR CRÍTICO al rechazar postulación: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");
                return Resultado.error("Error al rechazar postulación: " + ex.Message);
            }
        }

        public Resultado ObtenerPostulacionesPorVacante(int idVacante, int idEmpresa)
        {
            try
            {
                var vacante = _db.Vacantes.FirstOrDefault(v => v.id_vacante == idVacante && v.id_empresa == idEmpresa);

                if (vacante == null)
                {
                    return Resultado.error("Vacante no encontrada o no tienes permisos");
                }

                var postulaciones = (from p in _db.Postulaciones
                                     join e in _db.Egresados on p.id_egresado equals e.id_egresado
                                     join c in _db.Carreras on e.id_carrera equals c.id_carrera into carreraJoin
                                     from c in carreraJoin.DefaultIfEmpty()
                                     where p.id_vacante == idVacante
                                         && p.estado != "Rechazado" && p.estado != "Cancelada Por Egresado"
                                     orderby p.fecha_postulacion descending
                                     select new
                                     {
                                         p.id_postulacion,
                                         p.id_egresado,
                                         NombreCompleto = e.nombres + " " + e.apellidos,
                                         Carrera = c != null ? c.nombre_carrera : "Sin carrera",
                                         Email = e.email,
                                         Telefono = e.telefono,
                                         Estado = p.estado,
                                         FechaPostulacion = p.fecha_postulacion,
                                         PromedioAcademico = e.promedio_academico,
                                         Calificacion = e.total_estrellas
                                     }).ToList();

                return Resultado.exito("Postulaciones obtenidas exitosamente", new
                {
                    postulaciones = postulaciones,
                    total = postulaciones.Count,
                    nombreVacante = vacante.titulo
                });
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al obtener postulaciones: " + ex.Message);
            }
        }

        public Resultado CambiarEstadoPostulacion(int idPostulacion, string nuevoEstado, int idEmpresa)
        {
            try
            {
                var postulacion = _db.Postulaciones
                    .Include("Vacante")
                    .FirstOrDefault(p => p.id_postulacion == idPostulacion);

                if (postulacion == null)
                {
                    return Resultado.error("Postulación no encontrada");
                }

                if (postulacion.Vacante.id_empresa != idEmpresa)
                {
                    return Resultado.error("No tienes permisos para modificar esta postulación");
                }

                var estadosValidos = new List<string>
                {
                    "En Revisión", "Entrevista", "Oferta", "Contratado", "Rechazado", "Finalista"
                };

                if (!estadosValidos.Contains(nuevoEstado))
                {
                    return Resultado.error("Estado no válido");
                }

                postulacion.estado = nuevoEstado;
                _db.SaveChanges();

                return Resultado.exito($"Estado actualizado a: {nuevoEstado}");
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al cambiar estado: " + ex.Message);
            }
        }
        public Resultado CalificarEgresado(int idPostulacion, int calificacion, string comentario, int idEmpresa)
        {
            try
            {
                if (calificacion < 1 || calificacion > 5)
                {
                    return Resultado.error("La calificación debe estar entre 1 y 5");
                }

                var postulacion = _db.Postulaciones
                    .Include("Vacante")
                    .FirstOrDefault(p => p.id_postulacion == idPostulacion);
                if (postulacion == null)
                {
                    return Resultado.error("Postulación no encontrada");
                }
                if (postulacion.Vacante.id_empresa != idEmpresa)
                {
                    return Resultado.error("No tienes permisos para calificar esta postulación");
                }
                if (postulacion.estado != "Contratado")
                {
                    return Resultado.error("Solo puedes calificar candidatos contratados");
                }
                return Resultado.exito("Calificación registrada exitosamente");
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al calificar: " + ex.Message);
            }
        }
        public Resultado ContratarEgresado(int idPostulacion, int idEmpresa)
        {
            try
            {
                var postulacion = _db.Postulaciones
                    .Include("Vacante")
                    .FirstOrDefault(p => p.id_postulacion == idPostulacion);
                if (postulacion == null)
                {
                    return Resultado.error("Postulación no encontrada");
                }
                if (postulacion.Vacante.id_empresa != idEmpresa)
                {
                    return Resultado.error("No tienes permisos");
                }
                postulacion.estado = "Contratado";
                _db.SaveChanges();

                return Resultado.exito("Candidato contratado exitosamente");
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al contratar: " + ex.Message);
            }
        }

        public void ContactarEgresadoPorPostulacion(int idPostulacion, int idEmpresa, string asunto, string mensaje)
        {
            try
            {
                var postulacion = _db.Postulaciones
                    .Include("Egresado")
                    .Include("Vacante")
                    .Include("Vacante.Empresa")
                    .FirstOrDefault(p => p.id_postulacion == idPostulacion);

                if (postulacion == null)
                {
                    Console.WriteLine("❌ ERROR: Postulación no encontrada");
                    throw new Exception("Postulación no encontrada");
                }

                if (postulacion.Vacante.id_empresa != idEmpresa)
                {
                    Console.WriteLine("❌ ERROR: Sin permisos para contactar");
                    throw new Exception("No tienes permisos para contactar a este candidato");
                }

                var empresa = postulacion.Vacante.Empresa;
                var egresado = postulacion.Egresado;
                var vacante = postulacion.Vacante;

                var resultado = _emailServicio.EnviarCorreoContactoDirecto(
                    emailEgresado: egresado.email,
                    nombreEgresado: egresado.nombres + " " + egresado.apellidos,
                    nombreEmpresa: empresa.razon_social,
                    emailEmpresa: empresa.email_contacto,
                    telefonoEmpresa: empresa.telefono,
                    nombreVacante: vacante.titulo,
                    asunto: asunto,
                    mensaje: mensaje
                );

                if (!resultado.Exito)
                {
                    throw new Exception(resultado.Mensaje);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ ERROR CRÍTICO al contactar egresado: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");
                throw;
            }
        }

        public void ContactarEgresadoDirecto(int idEgresado, int idEmpresa, string asunto, string mensaje)
        {
            try
            {
                var egresado = _db.Egresados.Find(idEgresado);
                if (egresado == null)
                {
                    Console.WriteLine("❌ ERROR: Egresado no encontrado");
                    throw new Exception("Egresado no encontrado");
                }

                var empresa = _db.Empresas.Find(idEmpresa);
                if (empresa == null)
                {
                    Console.WriteLine("❌ ERROR: Empresa no encontrada");
                    throw new Exception("Empresa no encontrada");
                }

                var resultado = _emailServicio.EnviarCorreoContactoDirectoBusqueda(
                    emailEgresado: egresado.email,
                    nombreEgresado: egresado.nombres + " " + egresado.apellidos,
                    nombreEmpresa: empresa.razon_social,
                    emailEmpresa: empresa.email_contacto,
                    telefonoEmpresa: empresa.telefono,
                    asunto: asunto,
                    mensaje: mensaje
                );

                if (!resultado.Exito)
                {
                    throw new Exception(resultado.Mensaje);
                }

                Console.WriteLine($"✅ Correo enviado exitosamente a {egresado.email}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ ERROR CRÍTICO al contactar egresado directo: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");
                throw;
            }
        }

        public Resultado reportePostulacionesVacantes(int idEmpresa)
        {
            try
            {
                var reportePostulaciones = from p in _db.Postulaciones
                                           join v in _db.Vacantes on p.id_vacante equals v.id_vacante
                                           join e in _db.Egresados on p.id_egresado equals e.id_egresado
                                           join c in _db.Carreras on e.id_carrera equals c.id_carrera
                                           where v.id_empresa == idEmpresa
                                           orderby p.fecha_postulacion descending
                                           select new
                                           {
                                               Vacante = v.titulo,
                                               Egresado = e.nombres + " " + e.apellidos,
                                               Carrera = c.nombre_carrera,
                                               FechaPostulacion = p.fecha_postulacion,
                                               Estado = p.estado
                                           };

                if (reportePostulaciones == null || reportePostulaciones.Count() == 0)
                {
                    return Resultado.exito("No hay postulaciones registradas");
                }

                var excel = _excelServicio.CrearExcel(reportePostulaciones, "Postulaciones", "Detalle de Postulaciones");
                return Resultado.exito("Postulaciones", null, excel, "ReportePostulaciones.xlsx");
            }
            catch (Exception ex)
            {
                return Resultado.error(ex.Message);
            }
        }

        public Resultado reporteVisualizacionesCV(int idEmpresa)
        {
            try
            {
                var reporteVisualizaciones = from vc in _db.Visualizaciones_CV
                                             join cv in _db.CVs_Egresados on vc.id_cv equals cv.id_cv
                                             join e in _db.Egresados on cv.id_egresado equals e.id_egresado
                                             where vc.id_empresa == idEmpresa
                                             group vc by new { e.nombres, e.apellidos, e.id_egresado } into g
                                             orderby g.Count() descending
                                             select new
                                             {
                                                 Egresado = g.Key.nombres + " " + g.Key.apellidos,
                                                 TotalVisualizaciones = g.Count(),
                                                 UltimaVisualizacion = g.Max(x => x.fecha_visualizacion)
                                             };

                if (reporteVisualizaciones == null || reporteVisualizaciones.Count() == 0)
                {
                    return Resultado.exito("No hay visualizaciones registradas");
                }

                var excel = _excelServicio.CrearExcel(reporteVisualizaciones, "Visualizaciones", "Visualizaciones de CV");
                return Resultado.exito("Visualizaciones", null, excel, "ReporteVisualizacionesCV.xlsx");
            }
            catch (Exception ex)
            {
                return Resultado.error(ex.Message);
            }
        }

        public Resultado reporteVacantesPorEstado(int idEmpresa, string estado)
        {
            try
            {
                var reporteVacantes = from v in _db.Vacantes
                                      where v.id_empresa == idEmpresa && v.estado == estado
                                      orderby v.fecha_publicacion descending
                                      select new
                                      {
                                          Titulo = v.titulo,
                                          FechaPublicacion = v.fecha_publicacion,
                                          Estado = v.estado
                                      };

                if (reporteVacantes == null || reporteVacantes.Count() == 0)
                {
                    return Resultado.exito($"No hay vacantes en estado {estado}");
                }

                var nombreHoja = estado == "Abierta" ? "Vacantes Abiertas" : "Vacantes Cerradas";
                var excel = _excelServicio.CrearExcel(reporteVacantes, nombreHoja, $"Vacantes {estado}");
                return Resultado.exito("Vacantes", null, excel, $"ReporteVacantes{estado}.xlsx");
            }
            catch (Exception ex)
            {
                return Resultado.error(ex.Message);
            }
        }

        public Resultado reporteTopVacantes(int idEmpresa)
        {
            try
            {
                var reporteTop = from v in _db.Vacantes
                                 where v.id_empresa == idEmpresa
                                 join p in _db.Postulaciones on v.id_vacante equals p.id_vacante into postulaciones
                                 select new
                                 {
                                     Titulo = v.titulo,
                                     TotalPostulaciones = postulaciones.Count()
                                 } into resultado
                                 orderby resultado.TotalPostulaciones descending
                                 select resultado;

                var top10 = reporteTop.Take(10);

                if (top10 == null || top10.Count() == 0)
                {
                    return Resultado.exito("No hay vacantes con postulaciones");
                }

                var excel = _excelServicio.CrearExcel(top10, "Top Vacantes", "Top 10 Vacantes más Postuladas");
                return Resultado.exito("TopVacantes", null, excel, "ReporteTopVacantes.xlsx");
            }
            catch (Exception ex)
            {
                return Resultado.error(ex.Message);
            }
        }

        public Resultado reporteEgresadosContratados(int idEmpresa)
        {
            try
            {
                var reporteContratados = from p in _db.Postulaciones
                                         join v in _db.Vacantes on p.id_vacante equals v.id_vacante
                                         join e in _db.Egresados on p.id_egresado equals e.id_egresado
                                         join c in _db.Carreras on e.id_carrera equals c.id_carrera
                                         where v.id_empresa == idEmpresa && p.estado == "Contratado"
                                         orderby p.fecha_postulacion descending
                                         select new
                                         {
                                             Egresado = e.nombres + " " + e.apellidos,
                                             Carrera = c.nombre_carrera,
                                             Vacante = v.titulo,
                                             FechaContratacion = p.fecha_postulacion
                                         };

                if (reporteContratados == null || reporteContratados.Count() == 0)
                {
                    return Resultado.exito("No hay egresados contratados");
                }

                var excel = _excelServicio.CrearExcel(reporteContratados, "Contratados", "Egresados Contratados");
                return Resultado.exito("Contratados", null, excel, "ReporteEgresadosContratados.xlsx");
            }
            catch (Exception ex)
            {
                return Resultado.error(ex.Message);
            }
        }

        public Resultado reporteCarrerasMasPostulaciones(int idEmpresa)
        {
            try
            {
                var reporteCarreras = from p in _db.Postulaciones
                                      join v in _db.Vacantes on p.id_vacante equals v.id_vacante
                                      join e in _db.Egresados on p.id_egresado equals e.id_egresado
                                      join c in _db.Carreras on e.id_carrera equals c.id_carrera
                                      where v.id_empresa == idEmpresa
                                      group p by c.nombre_carrera into g
                                      orderby g.Count() descending
                                      select new
                                      {
                                          NombreCarrera = g.Key,
                                          TotalPostulaciones = g.Count()
                                      };

                if (reporteCarreras == null || reporteCarreras.Count() == 0)
                {
                    return Resultado.exito("No hay postulaciones por carrera");
                }

                var excel = _excelServicio.CrearExcel(reporteCarreras, "Carreras", "Postulaciones por Carrera");
                return Resultado.exito("Carreras", null, excel, "ReporteCarrerasPostulaciones.xlsx");
            }
            catch (Exception ex)
            {
                return Resultado.error(ex.Message);
            }
        }

        public Resultado reporteVacantesSinPostulaciones(int idEmpresa)
        {
            try
            {
                var reporteVacantes = from v in _db.Vacantes
                                      where v.id_empresa == idEmpresa
                                      join p in _db.Postulaciones on v.id_vacante equals p.id_vacante into postulaciones
                                      from p in postulaciones.DefaultIfEmpty()
                                      where p == null
                                      select new
                                      {
                                          Titulo = v.titulo,
                                          FechaPublicacion = v.fecha_publicacion,
                                          Estado = v.estado
                                      };

                if (reporteVacantes == null || reporteVacantes.Count() == 0)
                {
                    return Resultado.exito("Todas las vacantes tienen postulaciones");
                }

                var excel = _excelServicio.CrearExcel(reporteVacantes, "Sin Postulaciones", "Vacantes Sin Postulaciones");
                return Resultado.exito("VacantesSinPostulaciones", null, excel, "ReporteVacantesSinPostulaciones.xlsx");
            }
            catch (Exception ex)
            {
                return Resultado.error(ex.Message);
            }
        }

        public Resultado reporteEgresadosNoVistos(int idEmpresa)
        {
            try
            {
                var egresadosVistos = from vc in _db.Visualizaciones_CV
                                      join cv in _db.CVs_Egresados on vc.id_cv equals cv.id_cv
                                      where vc.id_empresa == idEmpresa
                                      select cv.id_egresado;

                var reporteNoVistos = from e in _db.Egresados
                                      join c in _db.Carreras on e.id_carrera equals c.id_carrera
                                      where !egresadosVistos.Contains(e.id_egresado)
                                      select new
                                      {
                                          Egresado = e.nombres + " " + e.apellidos,
                                          NombreCarrera = c.nombre_carrera
                                      };

                if (reporteNoVistos == null || reporteNoVistos.Count() == 0)
                {
                    return Resultado.exito("Todos los egresados han sido vistos");
                }

                var excel = _excelServicio.CrearExcel(reporteNoVistos, "No Vistos", "Egresados No Vistos");
                return Resultado.exito("EgresadosNoVistos", null, excel, "ReporteEgresadosNoVistos.xlsx");
            }
            catch (Exception ex)
            {
                return Resultado.error(ex.Message);
            }
        }

        public Resultado reporteEstadosPorVacante(int idEmpresa)
        {
            try
            {
                var reporteEstados = from p in _db.Postulaciones
                                     join v in _db.Vacantes on p.id_vacante equals v.id_vacante
                                     where v.id_empresa == idEmpresa
                                     group p by new { v.titulo, p.estado } into g
                                     orderby g.Key.titulo, g.Count() descending
                                     select new
                                     {
                                         Titulo = g.Key.titulo,
                                         Estado = g.Key.estado,
                                         TotalEnEstado = g.Count()
                                     };

                if (reporteEstados == null || reporteEstados.Count() == 0)
                {
                    return Resultado.exito("No hay estados registrados");
                }

                var excel = _excelServicio.CrearExcel(reporteEstados, "Estados", "Estados por Vacante");
                return Resultado.exito("EstadosVacante", null, excel, "ReporteEstadosVacante.xlsx");
            }
            catch (Exception ex)
            {
                return Resultado.error(ex.Message);
            }
        }

        public Resultado reporteEgresadosMasActivos(int idEmpresa)
        {
            try
            {
                var reporteActivos = from p in _db.Postulaciones
                                     join v in _db.Vacantes on p.id_vacante equals v.id_vacante
                                     join e in _db.Egresados on p.id_egresado equals e.id_egresado
                                     where v.id_empresa == idEmpresa
                                     group p by new { e.nombres, e.apellidos } into g
                                     orderby g.Count() descending
                                     select new
                                     {
                                         Egresado = g.Key.nombres + " " + g.Key.apellidos,
                                         CantidadPostulaciones = g.Count()
                                     };

                if (reporteActivos == null || reporteActivos.Count() == 0)
                {
                    return Resultado.exito("No hay postulaciones de egresados");
                }

                var excel = _excelServicio.CrearExcel(reporteActivos, "Ranking", "Egresados Más Activos");
                return Resultado.exito("RankingEgresados", null, excel, "ReporteEgresadosActivos.xlsx");
            }
            catch (Exception ex)
            {
                return Resultado.error(ex.Message);
            }
        }

        public Resultado ObtenerNotificacionesActivas(int idEmpresa)
        {
            try
            {
                var estadosNotificaciones = new List<string> { "En Revisión", "Activa" };

                var notificacionesActivas = _db.Postulaciones
                    .Count(p => p.Vacante.id_empresa == idEmpresa &&
                           estadosNotificaciones.Contains(p.estado));

                return Resultado.exito("Notificaciones activas obtenidas", new
                {
                    total = notificacionesActivas,
                    mensaje = notificacionesActivas > 0 ?
                        $"Tienes {notificacionesActivas} notificaciones activas" :
                        "No hay notificaciones activas"
                });
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al obtener notificaciones activas: " + ex.Message);
            }
        }



    }
}