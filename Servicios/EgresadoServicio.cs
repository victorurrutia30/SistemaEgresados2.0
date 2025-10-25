using SistemaEgresados.DTO;
using SistemaEgresados.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SistemaEgresados.Servicios
{
    public class EgresadoServicio
    {
        private readonly SistemaEgresadosUtecEntities _db = new SistemaEgresadosUtecEntities();

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
    }
}