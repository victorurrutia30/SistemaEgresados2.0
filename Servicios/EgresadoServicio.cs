using Microsoft.Ajax.Utilities;
using SistemaEgresados.DTO;
using SistemaEgresados.Models;
using SistemaEgresados.ServicioWebSocket;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Xml.Linq;

namespace SistemaEgresados.Servicios
{
    public class EgresadoServicio
    {
        private readonly SistemaEgresadosUtecEntities _db = new SistemaEgresadosUtecEntities();
        private readonly GenerarExcel _excelServicio = new GenerarExcel();

        public Resultado ObtenerMisPostulaciones(int idEgresado)
        {
            try
            {
                var misPostulaciones = _db.Postulaciones
                    .Where(p => p.id_egresado == idEgresado && p.estado != "Cancelada Por Egresado")
                    .Select(p => new
                    {
                        p.id_postulacion,
                        Vacante = _db.Vacantes
                            .Where(v => v.id_vacante == p.id_vacante)
                            .Select(v => new
                            {
                                v.id_vacante,
                                v.titulo,
                                v.descripcion,
                                v.requisitos,
                                v.salario_confidencial,
                                v.salario_min,
                                v.salario_max,
                                v.modalidad,
                                v.ubicacion,
                                v.area,
                                v.fecha_publicacion,
                                v.fecha_cierre,
                                v.estado,
                                CreadoPor = _db.Usuarios_Empresa
                                    .Where(u => u.id_usuario_empresa == v.creado_por)
                                    .Select(ue => new
                                    {
                                        ue.id_usuario_empresa,
                                        ue.nombre_usuario,
                                        ue.email,
                                        ue.nombre_completo,
                                        ue.cargo,
                                        ue.rol
                                    })
                                    .FirstOrDefault()
                            })
                            .FirstOrDefault(),
                        p.id_egresado,
                        p.fecha_postulacion,
                        p.estado,
                        p.fecha_actualizacion,
                    })
                    .ToList();
                if(misPostulaciones == null)
                {
                    return Resultado.exito("Aun no hay postulaciones");
                }

                return Resultado.exito("Postulaciones",misPostulaciones);
            }
            catch (Exception ex)
            {
                return Resultado.error(ex.Message);
            }
        }
        public Resultado ObtenerdatosEgresado(int IdEgresado)
        {
            try
            {
                var datosEgresado = _db.Egresados
                    .Where(e => e.id_egresado == IdEgresado)
                    .Select(e => new { 
                        CV = _db.CVs_Egresados
                            .Where(cv => cv.id_egresado == e.id_egresado)
                            .Select(cv => new
                            {
                                cv.id_cv,
                                cv.nombre_archivo,
                                cv.tamano_archivo,
                                cv.fecha_subida,
                                cv.ruta_archivo,
                                cv.privacidad,
                                cv.habilidades_principales,
                                cv.CartaPresentacion
                            }).FirstOrDefault(),
                        Carrera = _db.Carreras
                            .Where(c=> c.id_carrera == e.id_carrera)
                            .Select(c=> new 
                            {
                                c.id_carrera,
                                c.nombre_carrera,
                                promedio = _db.Egresados.Where(p => p.id_egresado == IdEgresado).Select(p=> p.promedio_academico).FirstOrDefault()
                            }).FirstOrDefault(),
                        Experiencia = _db.Respuestas_Encuesta
                            .Where(re => re.id_egresado == e.id_egresado)
                            .Select(re => new
                            {
                                re.id_respuesta_encuesta,
                                re.Preguntas_Encuesta.texto_pregunta,
                                re.Preguntas_Encuesta.aplica_si_trabaja,
                                re.respuesta,
                            }).ToList(),
                        Idiomas = _db.Egresado_Idiomas
                            .Where(ie => ie.id_egresado == e.id_egresado)
                            .Select(ie => new
                            {
                                ie.id_eg_idioma,
                                ie.Idioma.nombre,
                                ie.nivel
                            }).ToList(),
                        Certificaciones = _db.Certificaciones
                            .Where(ce => ce.id_egresado == e.id_egresado)
                            .Select(ce => new
                            {
                                ce.id_certificacion,
                                ce.nombre,
                                ce.entidad_emisora
                            }).ToList(),
                        Preferencia = _db.Preferencias_Egresado
                            .Where(pe => pe.id_egresado == e.id_egresado)
                            .Select(pe => new
                            {
                                pe.notificar,

                            }).FirstOrDefault(),
                        Visualizaciones_CV = _db.Visualizaciones_CV
                            .Where(vc => vc.id_cv == _db.CVs_Egresados.Where(cv=>cv.id_egresado == e.id_egresado).Select(cv=> cv.id_cv).FirstOrDefault())
                            .Select(vc => new
                            {
                                vc.id_visualizacion,
                                vc.fecha_visualizacion,
                                Empresa = _db.Empresas.Where(emp => emp.id_empresa == vc.id_empresa).Select(emp => emp.razon_social),
                                NombreUsuario = _db.Usuarios_Empresa.Where(ue => ue.id_usuario_empresa == vc.id_usuario_empresa).Select(ue => ue.nombre_usuario)
                            }).ToList()
                    }).FirstOrDefault();
                return Resultado.exito("Datos del egresado obtenidos exitosamente", datosEgresado);
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al obtener datos del egresado: " + ex.Message);
            }
        }

        public Resultado ActualizarVisualizaciones(int idEgresado)
        {
            try
            {
                var visualizaciones = _db.Visualizaciones_CV
                            .Where(vc => vc.id_cv == _db.CVs_Egresados.Where(cv => cv.id_egresado == idEgresado).Select(cv => cv.id_cv).FirstOrDefault())
                            .Select(vc => new
                            {
                                vc.id_visualizacion,
                                vc.fecha_visualizacion,
                                Empresa = _db.Empresas.Where(emp => emp.id_empresa == vc.id_empresa).Select(emp => emp.razon_social),
                                NombreUsuario = _db.Usuarios_Empresa.Where(ue => ue.id_usuario_empresa == vc.id_usuario_empresa).Select(ue => ue.nombre_usuario)
                            }).ToList();
                return Resultado.exito("Nuevas Visualizaciones", visualizaciones);
            }
            catch (Exception ex)
            {
                return Resultado.error(ex.Message);
            }
        }

        public Resultado ActualizarPreferenciaNotificacion(int idEgresado, bool recibeNotificaciones)
        {
            try
            {
                var preferencia = _db.Preferencias_Egresado.FirstOrDefault(pe => pe.id_egresado == idEgresado);
                if (preferencia != null)
                {
                    preferencia.notificar = recibeNotificaciones;
                    _db.SaveChanges();
                    return Resultado.exito("Preferencia de notificación actualizada exitosamente");
                }
                else
                {
                    return Resultado.error("Preferencia de egresado no encontrada");
                }
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al actualizar preferencia de notificación: " + ex.Message);
            }
        }
        public Resultado ActualizarPreferenciaPrivacidadCV(int idEgresado, int idCV, string privacidad)
        {
            try
            {
                var cv = _db.CVs_Egresados.FirstOrDefault(c => c.id_cv == idCV && c.id_egresado == idEgresado);
                if (cv != null)
                {
                    cv.privacidad = privacidad;
                    _db.SaveChanges();
                    return Resultado.exito("Preferencia de privacidad del CV actualizada exitosamente");
                }
                else
                {
                    return Resultado.error("CV no encontrado para el egresado especificado");
                }
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al actualizar preferencia de privacidad del CV: " + ex.Message);
            }
        }
        public Resultado ActualizarCartaPresentacion(int idEgresado, int idCV, string carta_presentacion)
        {
            try
            {
                var cv = _db.CVs_Egresados.FirstOrDefault(c => c.id_cv == idCV && c.id_egresado == idEgresado);
                if(carta_presentacion == null || carta_presentacion == "")
                {
                    return Resultado.error("La carta de presentación no puede estar vacia");
                }
                if (cv != null)
                {
                    cv.CartaPresentacion = carta_presentacion;
                    _db.SaveChanges();
                    return Resultado.exito("Carta de presentación actualizada exitosamente");
                }
                else
                {
                    return Resultado.error("CV no encontrado para el egresado especificado");
                }
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al actualizar carta de presentación: " + ex.Message);
            }
        }
        public Resultado ObtenerOfertas(int idEgresado)
        {
            try
            {
                var preferencias = _db.Preferencias_Egresado
                    .FirstOrDefault(p => p.id_egresado == idEgresado);

                var vacantesPostuladas = idEgresado > 0
                    ? _db.Postulaciones
                         .Where(p => p.id_egresado == idEgresado && p.estado != "Cancelada Por Egresado")
                         .Select(p => p.id_vacante)
                         .ToList()
                    : new List<int>();

                var añoActual = DateTime.Now.Year;

                var vacantesQuery = _db.Vacantes
                    .Where(v => v.estado != "Cerrado" && v.estado != "Eliminada" &&
                           !vacantesPostuladas.Contains(v.id_vacante) &&
                           v.fecha_publicacion.Value.Year == añoActual &&
                           (v.fecha_cierre == null || v.fecha_cierre >= DateTime.Now))
                    .Select(v => new {
                        v.id_vacante,
                        empresa = _db.Empresas
                            .Where(e => e.id_empresa == v.id_empresa)
                            .Select(e => new
                            {
                                e.id_empresa,
                                e.razon_social,
                                e.email_contacto,
                                e.telefono,
                                e.direccion,
                                e.sector_economico,
                                e.tamano_empresa,
                                puntuacion_empresa = _db.Puntuaciones_Empresas
                                    .Where(p => p.id_empresa == e.id_empresa)
                                    .Select(p => p.Puntuacion)
                                    .DefaultIfEmpty(0)
                                    .Average()
                            }).FirstOrDefault(),
                        v.titulo,
                        v.descripcion,
                        v.requisitos,
                        v.salario_min,
                        v.salario_max,
                        v.salario_confidencial,
                        v.modalidad,
                        v.tipo_contrato,
                        v.ubicacion,
                        v.area,
                        v.fecha_publicacion,
                        v.fecha_cierre,
                        v.estado,
                        CreadoPor = _db.Usuarios_Empresa
                            .Where(u => u.id_usuario_empresa == v.creado_por)
                            .Select(u => new {
                                u.id_usuario_empresa,
                                u.id_empresa,
                                u.nombre_usuario,
                                u.email,
                                u.nombre_completo,
                                u.cargo
                            }).FirstOrDefault(),
                        YaPostulado = false
                    })
                    .ToList();

                var todasVacantes = vacantesQuery.Select(v => new
                {
                    v.id_vacante,
                    v.empresa,
                    v.titulo,
                    v.descripcion,
                    v.requisitos,
                    v.salario_min,
                    v.salario_max,
                    v.salario_confidencial,
                    v.modalidad,
                    v.tipo_contrato,
                    v.ubicacion,
                    v.area,
                    v.fecha_publicacion,
                    v.fecha_cierre,
                    v.estado,
                    v.CreadoPor,
                    v.YaPostulado,
                    PuntuacionCompatibilidad = preferencias != null
                        ? CalcularCompatibilidad(v, preferencias)
                        : 0
                }).ToList();

                if (preferencias != null)
                {
                    const int UMBRAL_MINIMO = 30;

                    var vacantesRecomendadas = todasVacantes
                        .Where(v => v.PuntuacionCompatibilidad >= UMBRAL_MINIMO)
                        .OrderByDescending(v => v.PuntuacionCompatibilidad)
                        .ThenByDescending(v => v.fecha_publicacion)
                        .ToList();

                    if (vacantesRecomendadas.Count == 0)
                    {
                        return Resultado.exito("No hay vacantes que coincidan con tus preferencias en este momento");
                    }

                    return Resultado.exito("Vacantes recomendadas para ti", vacantesRecomendadas);
                }
                else
                {
                    todasVacantes = todasVacantes
                        .OrderByDescending(v => v.fecha_publicacion)
                        .ToList();

                    if (todasVacantes.Count == 0)
                    {
                        return Resultado.exito("Aún no hay vacantes activas");
                    }

                    return Resultado.exito("Vacantes", todasVacantes);
                }
            }
            catch (Exception ex)
            {
                return Resultado.error(ex.Message);
            }
        }

        private int CalcularCompatibilidad(dynamic vacante, Preferencias_Egresado preferencias)
        {
            int puntuacion = 0;

            if (!string.IsNullOrEmpty(preferencias.area_interes))
            {
                var areasInteres = preferencias.area_interes.ToLower()
                    .Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries)
                    .Select(a => a.Trim())
                    .ToList();

                string titulo = (vacante.titulo ?? "").ToLower();
                string descripcion = (vacante.descripcion ?? "").ToLower();
                string area = (vacante.area ?? "").ToLower();

                int maxPuntos = 0;

                foreach (var areaInteres in areasInteres)
                {
                    int puntosArea = 0;

                    if (titulo.Contains(areaInteres))
                        puntosArea = 35; 
                    else if (area.Contains(areaInteres))
                        puntosArea = 30; 
                    else if (descripcion.Contains(areaInteres))
                        puntosArea = 25; 

                    if (puntosArea > maxPuntos)
                        maxPuntos = puntosArea;
                }

                puntuacion += maxPuntos;
            }

            if (vacante.salario_confidencial != true && preferencias.salario_min.HasValue)
            {
                decimal salarioMinVacante = vacante.salario_min ?? 0;
                decimal salarioMaxVacante = vacante.salario_max ?? 0;

                if (salarioMinVacante >= preferencias.salario_min &&
                    salarioMaxVacante <= (preferencias.salario_max ?? decimal.MaxValue))
                    puntuacion += 25;
                else if (salarioMinVacante >= preferencias.salario_min)
                    puntuacion += 20;
                else if (salarioMaxVacante >= preferencias.salario_min)
                    puntuacion += 15;
                else if (salarioMaxVacante >= preferencias.salario_min * 0.85m)
                    puntuacion += 10;
            }

            if (!string.IsNullOrEmpty(preferencias.modalidad_preferida) &&
                !string.IsNullOrEmpty(vacante.modalidad))
            {
                var modalidadPref = preferencias.modalidad_preferida.ToLower().Trim();
                var modalidadVac = vacante.modalidad.ToLower().Trim();

                if (modalidadPref == modalidadVac)
                    puntuacion += 20;
                else if ((modalidadPref.Contains("mixto") || modalidadPref.Contains("híbrido")) &&
                         (modalidadVac.Contains("mixto") || modalidadVac.Contains("híbrido")))
                    puntuacion += 20;
                else if (modalidadPref.Contains("remoto") &&
                         (modalidadVac.Contains("mixto") || modalidadVac.Contains("híbrido")))
                    puntuacion += 12;
                else if ((modalidadPref.Contains("mixto") || modalidadPref.Contains("híbrido")) &&
                         modalidadVac.Contains("presencial"))
                    puntuacion += 8;
            }

            if (!string.IsNullOrEmpty(preferencias.ubicacion_preferida) &&
                !string.IsNullOrEmpty(vacante.ubicacion))
            {
                var ubicacionPref = preferencias.ubicacion_preferida.ToLower().Trim();
                var ubicacionVac = vacante.ubicacion.ToLower().Trim();

                if (ubicacionPref == ubicacionVac)
                    puntuacion += 15;
                else if (MismaAreaMetropolitana(ubicacionPref, ubicacionVac))
                    puntuacion += 12;
                else if (MismoDepartamento(ubicacionPref, ubicacionVac))
                    puntuacion += 10;
                else if (DepartamentosCercanos(ubicacionPref, ubicacionVac))
                    puntuacion += 5;
            }

            if (!string.IsNullOrEmpty(preferencias.jornada_preferida) &&
                !string.IsNullOrEmpty(vacante.tipo_contrato))
            {
                var jornadaPref = preferencias.jornada_preferida.ToLower().Trim();
                var contratoVac = vacante.tipo_contrato.ToLower().Trim();

                if ((jornadaPref.Contains("medio") && contratoVac.Contains("medio")) ||
                    (jornadaPref.Contains("medio tiempo") && contratoVac.Contains("medio tiempo")))
                    puntuacion += 15;
                else if ((jornadaPref.Contains("tiempo completo") && contratoVac.Contains("tiempo completo")) ||
                         (jornadaPref.Contains("completo") && contratoVac.Contains("completo")))
                    puntuacion += 15;
                else if (jornadaPref.Contains("medio") && contratoVac.Contains("completo"))
                    puntuacion += 5;
            }

            if (preferencias.disponible_inmediata == true && vacante.fecha_cierre != null)
            {
                var diasParaCierre = ((DateTime)vacante.fecha_cierre - DateTime.Now).Days;
                if (diasParaCierre <= 15 && diasParaCierre > 0)
                    puntuacion += 5;
            }

            return puntuacion;
        }

        private bool MismaAreaMetropolitana(string ubicacion1, string ubicacion2)
        {
            var areasMetropolitanas = new Dictionary<string, List<string>>
            {
                { "amss", new List<string> { "san salvador", "santa tecla", "antiguo cuscatlán",
                                              "nuevo cuscatlán", "soyapango", "mejicanos", "apopa",
                                              "delgado", "ciudad delgado", "ilopango", "san marcos",
                                              "tonacatepeque", "ayutuxtepeque", "cuscatancingo",
                                              "san martín", "nejapa" }},
                { "santa_ana_metro", new List<string> { "santa ana", "chalchuapa", "metapán" }},
                { "san_miguel_metro", new List<string> { "san miguel", "ciudad barrios", "moncagua" }}
            };

            foreach (var area in areasMetropolitanas.Values)
            {
                if (area.Any(u => ubicacion1.Contains(u)) && area.Any(u => ubicacion2.Contains(u)))
                    return true;
            }
            return false;
        }

        private bool MismoDepartamento(string ubicacion1, string ubicacion2)
        {
            var departamentos = new Dictionary<string, List<string>>
            {
                { "Ahuachapán", new List<string> { "ahuachapán", "ahuachapan", "atiquizaya", "apaneca", "tacuba" }},
                { "Santa Ana", new List<string> { "santa ana", "metapán", "metapan", "chalchuapa", "coatepeque" }},
                { "Sonsonate", new List<string> { "sonsonate", "acajutla", "izalco", "armenia", "juayúa", "juayua" }},
                { "La Libertad", new List<string> { "la libertad", "santa tecla", "nuevo cuscatlán", "antiguo cuscatlán",
                                                     "san juan opico", "quezaltepeque", "comasagua" }},
                { "San Salvador", new List<string> { "san salvador", "soyapango", "mejicanos", "apopa", "delgado",
                                                      "ilopango", "san marcos", "tonacatepeque", "cuscatancingo", "nejapa" }},
                { "Chalatenango", new List<string> { "chalatenango", "nueva concepción", "la palma", "tejutla" }},
                { "Cuscatlán", new List<string> { "cuscatlán", "cuscatlan", "cojutepeque", "suchitoto" }},
                { "La Paz", new List<string> { "la paz", "zacatecoluca", "santiago nonualco", "olocuilta" }},
                { "Cabañas", new List<string> { "cabañas", "cabanas", "sensuntepeque", "ilobasco" }},
                { "San Vicente", new List<string> { "san vicente", "apastepeque", "tecoluca", "verapaz" }},
                { "Usulután", new List<string> { "usulután", "usulutan", "jiquilisco", "santiago de maría", "berlín" }},
                { "San Miguel", new List<string> { "san miguel", "ciudad barrios", "sesori", "chinameca" }},
                { "Morazán", new List<string> { "morazán", "morazan", "san francisco gotera", "jocoaitique" }},
                { "La Unión", new List<string> { "la unión", "la union", "santa rosa de lima", "pasaquina", "conchagua" }}
            };

            foreach (var depto in departamentos.Values)
            {
                if (depto.Any(u => ubicacion1.Contains(u)) && depto.Any(u => ubicacion2.Contains(u)))
                    return true;
            }
            return false;
        }

        private bool DepartamentosCercanos(string ubicacion1, string ubicacion2)
        {
            var gruposCercanos = new List<List<string>>
            {
                new List<string> { "ahuachapán", "ahuachapan", "santa ana", "sonsonate" },
                new List<string> { "san salvador", "la libertad", "cuscatlán", "cuscatlan", "la paz" }, 
                new List<string> { "chalatenango", "cabañas", "cabanas", "san vicente" },
                new List<string> { "usulután", "usulutan", "san miguel", "morazán", "morazan", "la unión", "la union" }
            };

            foreach (var grupo in gruposCercanos)
            {
                if (grupo.Any(d => ubicacion1.Contains(d)) && grupo.Any(d => ubicacion2.Contains(d)))
                    return true;
            }
            return false;
        }
        public Resultado DetallesOferta(int idVacante)
        {
            try
            {
                var existOferta = _db.Vacantes
                    .Where(o => o.id_vacante == idVacante)
                    .Select(o => new
                    {
                        o.id_vacante,
                        o.salario_confidencial,
                        o.salario_min,
                        o.salario_max,
                        o.titulo,
                        empresa = _db.Empresas
                            .Where(e => e.id_empresa == o.id_empresa)
                            .Select(e => new
                            {
                                e.id_empresa,
                                e.razon_social,
                                e.sector_economico,
                                e.tamano_empresa,
                                Puntuacion = _db.Puntuaciones_Empresas
                                    .Where(p => p.id_empresa == e.id_empresa)
                                    .Select(p => p.Puntuacion)
                                    .DefaultIfEmpty(0)
                                    .Average(),
                                e.email_contacto
                            })
                            .FirstOrDefault(),
                        o.tipo_contrato,
                        o.descripcion,
                        o.requisitos,
                        o.ubicacion,
                        o.modalidad,
                        CreadoPor = _db.Usuarios_Empresa
                            .Where(u => u.id_usuario_empresa == o.creado_por)
                            .Select(u => new
                            {
                                u.id_usuario_empresa,
                                u.id_empresa,
                                u.nombre_usuario,
                                u.email,
                                u.nombre_completo,
                                u.cargo
                            }).FirstOrDefault()
                    }).FirstOrDefault();
                    
                if(existOferta == null)
                {
                    return Resultado.error("La oferta no existe");
                }
                return Resultado.exito("Oferta", existOferta);
            }
            catch (Exception ex) 
            {
                return Resultado.error(ex.Message);
            }
        }

        public Resultado PostularOferta(int idVacante, int Id_egresado)
        {
            try
            {
                var idCV = _db.CVs_Egresados.FirstOrDefault(cv => cv.id_egresado == Id_egresado);
                if (idCV == null)
                {
                    return Resultado.error("No puedes postularte sin CV");
                }

                var vacanteInfo = _db.Vacantes
                    .Where(v => v.id_vacante == idVacante)
                    .Select(v => new {
                        v.titulo,
                        v.id_empresa,
                        Creador = _db.Usuarios_Empresa
                            .Where(u => u.id_usuario_empresa == v.creado_por)
                            .Select(u => new {
                                u.email,
                                u.id_usuario_empresa,
                                u.nombre_completo
                            }).FirstOrDefault()
                    }).FirstOrDefault();

                if (vacanteInfo == null)
                {
                    return Resultado.error("Vacante no encontrada");
                }

                var egresadoInfo = _db.Egresados
                    .Where(e => e.id_egresado == Id_egresado)
                    .Select(e => new {
                        e.nombres,
                        e.apellidos,
                        carrera_egresado = e.Carrera.nombre_carrera
                    }).FirstOrDefault();

                if (egresadoInfo == null)
                {
                    return Resultado.error("Egresado no encontrado");
                }

                Postulacione postulacion = new Postulacione
                {
                    id_vacante = idVacante,
                    id_egresado = Id_egresado,
                    id_cv = idCV.id_cv,
                    fecha_postulacion = DateTime.Now,
                    fecha_actualizacion = DateTime.Now,
                    estado = "En revision"
                };
                WebSocketService.Instance.NotificarActualizacionAdministracion();
                WebSocketService.Instance.NotificarNuevaPostulacion(_db.Usuarios_Empresa.FirstOrDefault(ue => ue.id_usuario_empresa == vacanteInfo.Creador.id_usuario_empresa).email);
                _db.Postulaciones.Add(postulacion);
                _db.SaveChanges();

                if (!string.IsNullOrEmpty(vacanteInfo.Creador?.email))
                {
                    var emailService = new Email();
                    string nombreCompletoEgresado = $"{egresadoInfo.nombres} {egresadoInfo.apellidos}";

                    emailService.EnviarNotificacionPostulacionEmpresa(
                        emailEmpresa: vacanteInfo.Creador.email,
                        nombreReclutador: vacanteInfo.Creador.nombre_completo ?? "Reclutador",
                        tituloVacante: vacanteInfo.titulo,
                        nombreEgresado: nombreCompletoEgresado,
                        carreraEgresado: egresadoInfo.carrera_egresado ?? "No especificada",
                        fechaPostulacion: DateTime.Now
                    );
                }

                return Resultado.exito("Postulación Exitosa");
            }
            catch (Exception ex)
            {
                return Resultado.error(ex.Message);
            }
        }

        public Resultado GuardarCalificacionEmpresa(int idEmpresa,int idEgresado, decimal puntuacion, string comentario)
        {
            try
            {
                Puntuaciones_Empresas Puntuaci = new Puntuaciones_Empresas
                {
                    id_empresa = idEmpresa,
                    id_Egresado = idEgresado,
                    Puntuacion = puntuacion,
                    comentario = comentario,
                    FechaPuntuacion = DateTime.Now
                };

                _db.Puntuaciones_Empresas.Add(Puntuaci);
                _db.SaveChanges();

                return Resultado.exito("Se registro tu calificacion correctamente\nGracias por calificacion y/o comentarios\nNos ayuda a crecer y a mejorar!");
            }
            catch(Exception ex)
            {
                return Resultado.error(ex.Message);
            }
        }

        public Resultado ReemplazarCV(HttpPostedFileBase NuevoCV,int IdEgresado)
        {
            try
            {
                if (NuevoCV == null || NuevoCV.ContentLength <= 0)
                {
                    return Resultado.error("El archivo está vacío.");
                }

                string extension = System.IO.Path.GetExtension(NuevoCV.FileName).ToLower();
                if (extension != ".pdf")
                {
                    return Resultado.error("Solo se permiten archivos PDF.");
                }

                if (NuevoCV.ContentLength > 5 * 1024 * 1024)
                {
                    return Resultado.error("El archivo no debe superar los 5MB.");
                }

                var egresado = _db.Egresados.FirstOrDefault(e => e.id_egresado == IdEgresado);
                if (egresado == null)
                {
                    return Resultado.error("Egresado no encontrado.");
                }

                string rutaCarpeta = HttpContext.Current.Server.MapPath("~/Archivos/CVs/");
                if (!System.IO.Directory.Exists(rutaCarpeta))
                {
                    System.IO.Directory.CreateDirectory(rutaCarpeta);
                }
                string nombreArchivo = $"CV_{egresado.nombres}_{egresado.apellidos}_{DateTime.Now.Ticks}{extension}";
                string rutaCompleta = System.IO.Path.Combine(rutaCarpeta, nombreArchivo);

                NuevoCV.SaveAs(rutaCompleta);

                var cvAnterior = _db.CVs_Egresados.FirstOrDefault(c => c.id_egresado == IdEgresado);
                if (cvAnterior != null)
                {
                    string rutaAnterior = HttpContext.Current.Server.MapPath("~" + cvAnterior.ruta_archivo);
                    if (System.IO.File.Exists(rutaAnterior))
                    {
                        System.IO.File.Delete(rutaAnterior);
                    }

                    cvAnterior.nombre_archivo = nombreArchivo;
                    cvAnterior.ruta_archivo = "/Archivos/CVs/" + nombreArchivo;
                    cvAnterior.extension = extension;
                    cvAnterior.tamano_archivo = NuevoCV.ContentLength;
                    cvAnterior.fecha_actualizacion = DateTime.Now;
                }
                CVs_Egresados actualizado = new CVs_Egresados
                {
                    nombre_archivo = nombreArchivo,
                    ruta_archivo = "/Archivos/CVs/" + nombreArchivo
                };
                _db.SaveChanges();
                return Resultado.exito("CV subido exitosamente.",actualizado);

            }
            catch (Exception ex)
            {
                return Resultado.error(ex.Message);
            }
        }

        public Resultado ObtenerInformacion(int idEgresado)
        {
            try
            {
                var informacionCompleta = _db.Egresados
                    .Where(e => e.id_egresado == idEgresado)
                    .Select(e => new
                    {
                        e.id_egresado,
                        e.numero_documento,
                        e.nombres,
                        e.apellidos,
                        e.email,
                        e.telefono,
                        e.Carrera.nombre_carrera,
                        e.fecha_graduacion,
                        e.promedio_academico,
                        e.puntuacion_global,
                        Idiomas = _db.Egresado_Idiomas
                            .Where(i => i.id_egresado == idEgresado)
                            .Select(i => new
                            {
                                i.id_eg_idioma,
                                i.id_idioma,
                                i.Idioma.nombre,
                                i.nivel
                            })
                            .ToList(),
                        Certificaciones = _db.Certificaciones
                            .Where(c => c.id_egresado == idEgresado)
                            .Select(c => new
                            {
                                c.id_certificacion,
                                c.nombre,
                                c.entidad_emisora                                
                            })
                            .ToList(),
                        Preferencias = _db.Preferencias_Egresado
                            .Where(p => p.id_egresado == idEgresado)
                            .Select(p => new
                            {
                                p.id_pref,
                                p.modalidad_preferida,
                                p.jornada_preferida,
                                p.area_interes,
                                p.ubicacion_preferida,
                                p.salario_min,
                                p.salario_max
                            })
                            .FirstOrDefault(),
                        Habilidades = _db.CVs_Egresados
                            .Where(h => h.id_egresado == idEgresado)
                            .Select(h => new
                            {
                                h.id_cv,
                                h.habilidades_principales
                            })
                            .FirstOrDefault()
                    })
                    .FirstOrDefault();
                if(informacionCompleta == null)
                {
                    return Resultado.error("No se encontro informacion de tu usuario");
                }

                return Resultado.exito("Informacion", informacionCompleta);
            }
            catch (Exception ex)
            {
                return Resultado.error(ex.Message);
            }
        }

        public Resultado ObteneIdiomasDisponibles()
        {
            try
            {
                var Idiomas = _db.Idiomas
                    .Select(i => new
                    {
                        i.id_idioma,
                        i.nombre
                    })
                    .ToList();
                if(Idiomas == null)
                {
                    return Resultado.exito("No hay idiomas disponibles en este momento");
                }
                return Resultado.exito("Idiomas", Idiomas);
            }
            catch (Exception ex)
            {
                return Resultado.error(ex.Message);
            }
        }

        public Resultado ActualizarCertificados(int idEgresado, List<Certificacione> certificaciones)
        {
            try
            {
                var certificacionesExistentes = _db.Certificaciones
                    .Where(c => c.id_egresado == idEgresado)
                    .ToList();

                foreach (var certificacion in certificaciones)
                {
                    var certificacionExistente = certificacionesExistentes
                        .FirstOrDefault(c => c.id_certificacion == certificacion.id_certificacion && certificacion.id_certificacion > 0);

                    if (certificacionExistente != null)
                    {
                        certificacionExistente.nombre = certificacion.nombre;
                        certificacionExistente.entidad_emisora = certificacion.entidad_emisora;
                    }
                    else
                    {
                        certificacion.id_egresado = idEgresado;
                        _db.Certificaciones.Add(certificacion);
                    }
                }

                var idsCertificacionesEnviadas = certificaciones
                    .Where(c => c.id_certificacion > 0)
                    .Select(c => c.id_certificacion)
                    .ToList();

                var certificacionesAEliminar = certificacionesExistentes
                    .Where(c => !idsCertificacionesEnviadas.Contains(c.id_certificacion))
                    .ToList();

                foreach (var certificacionAEliminar in certificacionesAEliminar)
                {
                    _db.Certificaciones.Remove(certificacionAEliminar);
                }

                _db.SaveChanges();
                return Resultado.exito("Certificaciones actualizadas correctamente");
            }
            catch (Exception e)
            {
                return Resultado.error(e.Message);
            }
        }
        public Resultado ActualizarIdiomas(int idEgresado, List<Egresado_Idiomas> idiomas)
        {
            try
            {
                var idiomasExistentes = _db.Egresado_Idiomas
                    .Where(i => i.id_egresado == idEgresado)
                    .ToList();

                foreach (var idioma in idiomas)
                {
                    var idiomaExistente = idiomasExistentes
                        .FirstOrDefault(i => i.id_eg_idioma == idioma.id_eg_idioma && idioma.id_eg_idioma > 0);

                    if (idiomaExistente != null)
                    {
                        idiomaExistente.id_idioma = idioma.id_idioma;
                        idiomaExistente.nivel = idioma.nivel;
                    }
                    else
                    {
                        idioma.id_egresado = idEgresado;
                        _db.Egresado_Idiomas.Add(idioma);
                    }
                }

                var idsIdiomasEnviados = idiomas
                    .Where(i => i.id_eg_idioma > 0)
                    .Select(i => i.id_eg_idioma)
                    .ToList();

                var idiomasAEliminar = idiomasExistentes
                    .Where(i => !idsIdiomasEnviados.Contains(i.id_eg_idioma))
                    .ToList();

                foreach (var idiomaAEliminar in idiomasAEliminar)
                {
                    _db.Egresado_Idiomas.Remove(idiomaAEliminar);
                }

                _db.SaveChanges();
                return Resultado.exito("Idiomas actualizados correctamente");
            }
            catch (Exception e)
            {
                return Resultado.error(e.Message);
            }
        }
        public Resultado ActualizarPreferencia(int idEgresado, Preferencias_Egresado preferencias)
        {
            try
            {
                var existPreferencia = _db.Preferencias_Egresado.FirstOrDefault(p => p.id_egresado == idEgresado);
                if (existPreferencia != null) {
                    existPreferencia.modalidad_preferida = preferencias.modalidad_preferida;
                    existPreferencia.jornada_preferida = preferencias.jornada_preferida;
                    existPreferencia.area_interes = preferencias.area_interes;
                    existPreferencia.ubicacion_preferida = preferencias.ubicacion_preferida;
                    existPreferencia.salario_min = preferencias.salario_min;
                    existPreferencia.salario_max = preferencias.salario_max;
                    _db.SaveChanges();

                    return Resultado.exito("Preferencias Actualizadas correctamente");
                }

                return Resultado.error("No se encontro las preferencias");
            }
            catch (Exception e)
            {
                return Resultado.error(e.Message);
            }
        }
        public Resultado ActualizarInformacionPersonal(int idEgresado, Egresado egresado)
        {
            try
            {
                var existEgresado = _db.Egresados.FirstOrDefault(e => e.id_egresado == idEgresado);
                if(existEgresado == null)
                {
                    return Resultado.error("No se pudo encontrar el egresado");
                }
                
                existEgresado.numero_documento = egresado.numero_documento;
                existEgresado.nombres = egresado.nombres;
                existEgresado.apellidos = egresado.apellidos;
                existEgresado.telefono = egresado.telefono;
                existEgresado.fecha_graduacion = egresado.fecha_graduacion;
                existEgresado.promedio_academico = egresado.promedio_academico;
                _db.SaveChanges();
                return Resultado.exito("Preferencias Actualizadas Correctamente");
            }
            catch (Exception e)
            {
                return Resultado.error(e.Message);
            }
        }
        public Resultado ActualizarHabilidades(int idEgresado,string habilidades)
        {
            try
            {
                var existHabilidades = _db.CVs_Egresados.FirstOrDefault(h => h.id_egresado == idEgresado);
                if(existHabilidades == null)
                {
                    return Resultado.error("No se puedo encontrar el egresado");
                }
                existHabilidades.habilidades_principales = habilidades;
                _db.SaveChanges();
                return Resultado.exito("Se actualizaron las habilidades correctamente");
            }
            catch(Exception ex)
            {
                return Resultado.error(ex.Message);
            }
        }
        public Resultado CancelarPostulacion(int idEgresado,int IdPostulacion)
        {
            try
            {
                var existVacante = _db.Postulaciones.FirstOrDefault(p => p.id_postulacion == IdPostulacion);
                if( existVacante == null)
                {
                    return Resultado.error("La postulacion no existe");
                }
                WebSocketService.Instance.NotificarActualizacionAdministracion();
                WebSocketService.Instance.NotificarCancelacionPostulacion(_db.Usuarios_Empresa.FirstOrDefault(ue => ue.id_usuario_empresa == existVacante.Vacante.creado_por.Value).email);
                existVacante.estado = "Cancelada Por Egresado";
                existVacante.fecha_actualizacion = DateTime.Now;
                _db.SaveChanges();
                return Resultado.exito("Se cancelo tu postulacion");
            }
            catch(Exception ex)
            {
                return Resultado.error(ex.Message);
            }
        }

        public Resultado reporteHistorialPostulaciones(int idEgresado)
        {
            try
            {
                var historialPostulaciones = from p in _db.Postulaciones
                                             join v in _db.Vacantes on p.id_vacante equals v.id_vacante
                                             where p.id_egresado == idEgresado
                                             select new
                                             {
                                                 Vacante = v.titulo,
                                                 Empresa = v.Empresa.razon_social,
                                                 p.estado,
                                                 p.fecha_postulacion,
                                                 p.fecha_actualizacion
                                             };
                if(historialPostulaciones == null || historialPostulaciones.Count() == 0)
                {
                    return Resultado.exito("Aun no te haz postulado");
                }
                var excel = _excelServicio.CrearExcel(historialPostulaciones, "Mi Historial", "Mis Postulaciones");

                return Resultado.exito("Historial", null,excel,"MiHistorial.xlsx");

            }
            catch (Exception ex)
            {
                return Resultado.error(ex.Message);
            }
        }
    }
}