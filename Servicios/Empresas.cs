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

                var entrevistas = _db.Postulaciones
                    .Count(p => p.Vacante.id_empresa == IdEmpresa &&
                           p.estado == "Entrevista");

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
                            Entrevistas = entrevistas,
                            PromedioCandidatosPorVacante = promedioCandidatosPorVacante
                        },

                        VacantesRecientes = _db.Vacantes
                            .Where(v => v.id_empresa == emp.id_empresa)
                            .OrderByDescending(v => v.fecha_publicacion)
                            .Take(4)
                            .Select(v => new
                            {
                                v.id_vacante,
                                v.titulo,
                                v.estado,
                                v.fecha_publicacion,
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

                var entrevistas = _db.Postulaciones
                    .Count(p => p.Vacante.id_empresa == IdEmpresa &&
                           p.estado == "Entrevista");

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
                        Entrevistas = entrevistas,
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



        public Resultado RegistrarVisualizacionCV(int idEgresado, int idEmpresa, string ipAddress, string navegador)
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
                var empresa = _db.Empresas.FirstOrDefault(emp => emp.id_empresa == usuarioEmpresa.id_empresa);

                _db.SP_RegistrarVisualizacionCV1(
                    cv.id_cv,
                    usuarioEmpresa.id_empresa,
                    idEmpresa,
                    ipAddress,
                    navegador,
                    ""
                );

                if (egresado != null)
                {
                    WebSocketService.Instance.NotificarVisualizacion(
                        egresado.email,
                        empresa?.razon_social
                    );
                }

                return Resultado.exito("Visualización registrada exitosamente");
            }
            catch (Exception ex)
            {
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
                var todasLasCarreras = _db.Carreras
                    .Where(c => c.activo == true)
                    .Select(c => new
                    {
                        c.id_carrera,
                        c.nombre_carrera
                    })
                    .ToList();

                if (todasLasCarreras.Count == 0)
                {
                    return Resultado.exito("No hay carreras registradas", new List<object>());
                }

                var sectoresAgrupados = todasLasCarreras
                    .GroupBy(c => ClasificarCarreraPorSector(c.nombre_carrera))
                    .Select(g => new
                    {
                        Sector = g.Key,
                        Cantidad = g.Count()
                    })
                    .OrderByDescending(s => s.Cantidad)
                    .ToList();

                var totalCarreras = sectoresAgrupados.Sum(s => s.Cantidad);

                var sectoresConPorcentaje = sectoresAgrupados.Select(s => new
                {
                    s.Sector,
                    s.Cantidad,
                    Porcentaje = totalCarreras > 0 ? Math.Round((decimal)s.Cantidad / totalCarreras * 100, 0) : 0
                }).ToList();

                return Resultado.exito("Sectores obtenidos exitosamente", sectoresConPorcentaje);
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al obtener sectores: " + ex.Message);
            }
        }

        private string ClasificarCarreraPorSector(string nombreCarrera)
        {
            if (string.IsNullOrEmpty(nombreCarrera))
                return "Otros";

            nombreCarrera = nombreCarrera.ToLower();

            if (nombreCarrera.Contains("software") ||
                nombreCarrera.Contains("redes") ||
                nombreCarrera.Contains("diseño"))
            {
                return "Tecnología";
            }
            else if (nombreCarrera.Contains("industrial") ||
                     nombreCarrera.Contains("sistemas"))
            {
                return "Ingeniería";
            }
            else if (nombreCarrera.Contains("administracion"))
            {
                return "Consultoría";
            }
            else
            {
                return "Otros";
            }
        }

        public Resultado ObtenerTopCandidatosEnProceso(int idEmpresa)
        {
            try
            {
                var topCandidatos = (from p in _db.Postulaciones
                                     join e in _db.Egresados on p.id_egresado equals e.id_egresado
                                     join c in _db.Carreras on e.id_carrera equals c.id_carrera
                                     join v in _db.Vacantes on p.id_vacante equals v.id_vacante
                                     where v.id_empresa == idEmpresa
                                           && p.estado != "Rechazado"
                                           && p.estado != "Contratado"
                                           && p.estado != "Cancelada Por Egresado"
                                     orderby p.fecha_postulacion descending
                                     select new
                                     {
                                         Nombre = e.nombres + " " + e.apellidos,
                                         Carrera = c.nombre_carrera,
                                         Vacante = v.titulo,
                                         Estado = p.estado
                                     })
                                     .Take(5)
                                     .ToList();

                return Resultado.exito("Candidatos obtenidos exitosamente", topCandidatos);
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al obtener los candidatos: " + ex.Message);
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
                    "Activa", "En Revisión", "Entrevista", "Oferta",
                    "Contratado", "Cerrada", "Borrador", "Abierta"
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

        public Resultado ObtenerPipelinePorEstado(int idEmpresa)
        {
            try
            {
                var pipeline = _db.Postulaciones
                    .Where(p => p.Vacante.id_empresa == idEmpresa)
                    .GroupBy(p => p.estado)
                    .Select(g => new
                    {
                        Estado = g.Key,
                        Cantidad = g.Count()
                    })
                    .ToList();

                if (!pipeline.Any())
                {
                    return Resultado.exito("No hay postulaciones registradas.", new List<object>());
                }

                int total = pipeline.Sum(x => x.Cantidad);
                var resultado = pipeline.Select(x => new
                {
                    x.Estado,
                    x.Cantidad,
                    Porcentaje = total > 0 ? Math.Round((decimal)x.Cantidad / total * 100, 1) : 0
                }).ToList();

                return Resultado.exito("Pipeline generado exitosamente", resultado);
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al generar pipeline: " + ex.Message);
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
                        modalidad = v.modalidad
                    })
                    .ToList();

                return Resultado.exito("Vacantes obtenidas exitosamente", vacantes);
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al obtener vacantes: " + ex.Message);
            }
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
    }
}