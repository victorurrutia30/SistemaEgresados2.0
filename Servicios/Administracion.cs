using SistemaEgresados.DTO;
using SistemaEgresados.Models;
using SistemaEgresados.ServicioWebSocket;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace SistemaEgresados.Servicios
{
    public class Administracion
    {
        private readonly SistemaEgresadosUtecEntities _db = new SistemaEgresadosUtecEntities();
        private readonly Servicios.Encriptador _encriptadorServicio = new Servicios.Encriptador();
        private readonly Servicios.Email _emailServicio = new Servicios.Email();
        private readonly Servicios.TokenService _tokenServicio = new Servicios.TokenService();
        private readonly Servicios.Registrar _registrarServicio = new Servicios.Registrar();
        private readonly Servicios.ProcesosAutomatizados _procesosServicio = new ProcesosAutomatizados();
        public Resultado Vacantes()
        {
            try
            {
                var vacantes = _db.Vacantes
                    .Select(v => new
                    {
                        v.id_vacante,
                        v.id_empresa,
                        NombreEmpresa = _db.Empresas.Where(e => e.id_empresa == v.id_empresa).Select(e => e.razon_social).FirstOrDefault(),
                        email = _db.Empresas.Where(e => e.id_empresa == v.id_empresa).Select(e => e.email_contacto).FirstOrDefault(),
                        SectorEconomico = _db.Empresas.Where(e => e.id_empresa == v.id_empresa).Select(e => e.sector_economico).FirstOrDefault(),
                        Puntuacion = _db.Puntuaciones_Empresas
                                    .Where(p => p.id_empresa == v.id_empresa)
                                    .Select(p => p.Puntuacion)
                                    .DefaultIfEmpty(0)
                                    .Average(),
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
                        v.creado_por
                    })
                    .ToList();
                if (vacantes == null || vacantes.Count == 0)
                {
                    return Resultado.exito("No hay vacantes registradas");
                }
                return Resultado.exito("Vacantes", vacantes);
            }
            catch (Exception ex)
            {
                return Resultado.error(ex.Message);
            }
        }




        public Resultado postulaciones(DateTime InicioFechaPostulacion, DateTime finfechaPostulacion)
        {
            try
            {
                var postulaciones = _db.Postulaciones
                    .Where(p => p.fecha_postulacion >= InicioFechaPostulacion &&
                               p.fecha_postulacion <= finfechaPostulacion && p.estado != "Cancelada Por Egresado")
                    .Select(p => new
                    {
                        p.id_postulacion,
                        p.id_vacante,
                        NombreVacante = _db.Vacantes.Where(v => v.id_vacante == p.id_vacante).Select(v => v.titulo).FirstOrDefault(),
                        p.id_egresado,
                        NombreCompleto = _db.Egresados
                            .Where(e => e.id_egresado == p.id_egresado)
                            .Select(e => e.nombres + " " + e.apellidos)
                            .FirstOrDefault(),
                        Carrera = _db.Egresados
                            .Where(e => e.id_egresado == p.id_egresado)
                            .Select(e => _db.Carreras.Where(c => c.id_carrera == e.id_carrera).Select(c => c.nombre_carrera).FirstOrDefault())
                            .FirstOrDefault(),
                        p.id_cv,
                        RutaArchivo = _db.CVs_Egresados.Where(c => c.id_cv == p.id_cv).Select(c => c.ruta_archivo).FirstOrDefault(),
                        p.fecha_postulacion,
                        p.estado,
                        p.fecha_actualizacion,
                        p.fue_contactado
                    })
                    .ToList();
                if (postulaciones == null || postulaciones.Count == 0)
                {
                    return Resultado.exito("No hay postulaciones");
                }
                return Resultado.exito("Postulaciones", postulaciones);
            }
            catch (Exception ex)
            {
                return Resultado.error(ex.Message);
            }
        }

        public Resultado ObtenerEstadisticas()
        {
            try
            {
                var hoy = DateTime.Now;
                var hace30Dias = hoy.AddDays(-30);
                var inicioAnio = new DateTime(hoy.Year, 1, 1);
                var hace3Meses = hoy.AddMonths(-3);
                var inicioMesActual = new DateTime(hoy.Year, hoy.Month, 1);

                var stats = new
                {
                    VacantesActivas = _db.Vacantes.Count(v => v.estado == "Abierta"),
                    AplicacionesUltimos30Dias = _db.Postulaciones.Where(p => p.estado != "Cancelada Por Egresado").Count(p => p.fecha_postulacion >= hace30Dias),
                    ContratacionesYTD = _db.Postulaciones.Count(p => p.estado == "Contratado" && p.fecha_actualizacion >= inicioAnio),
                    PromedioEvaluacion = _db.Egresados.Where(e => e.puntuacion_global > 0).Average(e => (double?)e.puntuacion_global) ?? 0,
                    CVsVistos = _db.CVs_Egresados
                        .Where(c => c.fecha_actualizacion >= inicioMesActual)
                        .Sum(c => (int?)c.veces_visualizado) ?? 0,
                    TimeToHirePromedio = CalcularTimeToHirePromedio(hace3Meses)
                };

                return Resultado.exito("Estadísticas obtenidas", stats);
            }
            catch (Exception ex)
            {
                return Resultado.error(ex.Message);
            }
        }

        public Resultado ObtenerPipelineProcesos()
        {
            try
            {
                var pipeline = _db.Postulaciones
                    .Where(p => p.estado != "Rechazado" && p.estado != "Cancelado" && p.estado != "Cancelada Por Egresado")
                    .Select(p => new
                    {
                        p.id_postulacion,
                        NombreVacante = _db.Vacantes.Where(v => v.id_vacante == p.id_vacante).Select(v => v.titulo).FirstOrDefault(),
                        NombreCandidato = _db.Egresados.Where(e => e.id_egresado == p.id_egresado).Select(e => e.nombres + " " + e.apellidos).FirstOrDefault(),
                        p.estado,
                        p.fecha_postulacion
                    })
                    .ToList()
                    .GroupBy(p => p.estado)
                    .Select(g => new
                    {
                        Estado = g.Key,
                        Cantidad = g.Count(),
                        Candidatos = g.ToList()
                    })
                    .ToList();

                return Resultado.exito("Pipeline obtenido", pipeline);
            }
            catch (Exception ex)
            {
                return Resultado.error(ex.Message);
            }
        }

        public Resultado ObtenerCandidatosRecomendados(int top = 10)
        {
            try
            {
                var candidatos = _db.Egresados
                    .Where(e => e.estado_activo == true)
                    .Select(e => new
                    {
                        e.id_egresado,
                        NombreCompleto = e.nombres + " " + e.apellidos,
                        Carrera = _db.Carreras.Where(c => c.id_carrera == e.id_carrera).Select(c => c.nombre_carrera).FirstOrDefault(),
                        ExperienciaAnios = _db.CVs_Egresados.Where(cv => cv.id_egresado == e.id_egresado).Select(cv => cv.experiencia_anos).FirstOrDefault() ?? 0,
                        Habilidades = _db.CVs_Egresados.Where(cv => cv.id_egresado == e.id_egresado).Select(cv => cv.habilidades_principales).FirstOrDefault(),
                        MatchScore = (e.puntuacion_global ?? 0) * 10,
                        Iniciales = (e.nombres.Substring(0, 1) + e.apellidos.Substring(0, 1)).ToUpper()
                    })
                    .OrderByDescending(c => c.MatchScore)
                    .Take(top)
                    .ToList();

                return Resultado.exito("Candidatos recomendados", candidatos);
            }
            catch (Exception ex)
            {
                return Resultado.error(ex.Message);
            }
        }

        public Resultado ObtenerAplicacionesRecientes(int top = 10)
        {
            try
            {
                var aplicaciones = _db.Postulaciones
                    .Where(p => p.estado != "Cancelada Por Egresado")
                    .OrderByDescending(p => p.fecha_postulacion)
                    .Take(top)
                    .Select(p => new
                    {
                        p.id_postulacion,
                        p.id_egresado,
                        NombreCandidato = _db.Egresados.Where(e => e.id_egresado == p.id_egresado).Select(e => e.nombres + " " + e.apellidos).FirstOrDefault(),
                        Carrera = _db.Egresados
                            .Where(e => e.id_egresado == p.id_egresado)
                            .Select(e => _db.Carreras.Where(c => c.id_carrera == e.id_carrera).Select(c => c.nombre_carrera).FirstOrDefault())
                            .FirstOrDefault(),
                        Iniciales = _db.Egresados
                            .Where(e => e.id_egresado == p.id_egresado)
                            .Select(e => e.nombres.Substring(0, 1) + e.apellidos.Substring(0, 1))
                            .FirstOrDefault(),
                        NombreVacante = _db.Vacantes.Where(v => v.id_vacante == p.id_vacante).Select(v => v.titulo).FirstOrDefault(),
                        p.estado,
                        p.fecha_postulacion,
                        Puntuacion = _db.Egresados.Where(e => e.id_egresado == p.id_egresado).Select(e => e.puntuacion_global).FirstOrDefault(),
                        p.id_cv,
                        RutaCV = _db.CVs_Egresados.Where(c => c.id_cv == p.id_cv).Select(c => c.ruta_archivo).FirstOrDefault()
                    })
                    .ToList();

                return Resultado.exito("Aplicaciones recientes", aplicaciones);
            }
            catch (Exception ex)
            {
                return Resultado.error(ex.Message);
            }
        }

        public Resultado ObtenerTendencias(int mesesAtras = 6)
        {
            try
            {
                var fechaInicio = DateTime.Now.AddMonths(-mesesAtras);

                var tendencias = _db.Postulaciones
                    .Where(p => p.fecha_postulacion >= fechaInicio && p.estado != "Cancelada Por Egresado")
                    .GroupBy(p => new
                    {
                        Anio = p.fecha_postulacion.Value.Year,
                        Mes = p.fecha_postulacion.Value.Month
                    })
                    .Select(g => new
                    {
                        Anio = g.Key.Anio,
                        Mes = g.Key.Mes,
                        TotalAplicaciones = g.Count(),
                        EnRevision = g.Count(p => p.estado == "En revision"),
                        Entrevistas = g.Count(p => p.estado == "Entrevista"),
                        Ofertas = g.Count(p => p.estado == "Oferta"),
                        Contratados = g.Count(p => p.estado == "Contratado")
                    })
                    .OrderBy(t => t.Anio)
                    .ThenBy(t => t.Mes)
                    .ToList()
                    .Select(t => new
                    {
                        Periodo = $"{t.Anio}-{t.Mes.ToString().PadLeft(2, '0')}",
                        t.TotalAplicaciones,
                        t.EnRevision,
                        t.Entrevistas,
                        t.Ofertas,
                        t.Contratados
                    })
                    .ToList();

                return Resultado.exito("Tendencias obtenidas", tendencias);
            }
            catch (Exception ex)
            {
                return Resultado.error(ex.Message);
            }
        }

        public Resultado ObtenerConteosPorEstado()
        {
            try
            {
                var conteos = _db.Postulaciones
                    .Where(p => p.estado != "Cancelada Por Egresado")
                    .GroupBy(p => p.estado)
                    .Select(g => new
                    {
                        Estado = g.Key,
                        Cantidad = g.Count()
                    })
                    .ToList();

                return Resultado.exito("Conteos por estado", conteos);
            }
            catch (Exception ex)
            {
                return Resultado.error(ex.Message);
            }
        }

        private int CalcularTimeToHirePromedio(DateTime desde)
        {
            try
            {
                var contrataciones = _db.Postulaciones
                    .Where(p => p.estado == "Contratado" && p.fecha_actualizacion >= desde && p.fecha_postulacion.HasValue && p.fecha_actualizacion.HasValue)
                    .ToList()
                    .Select(p => (p.fecha_actualizacion.Value - p.fecha_postulacion.Value).Days)
                    .ToList();

                return contrataciones.Any() ? (int)contrataciones.Average() : 0;
            }
            catch
            {
                return 0;
            }
        }

        public Resultado VerPerfilEgresado(int idEgresado)
        {
            try
            {
                var perfil = _db.Egresados
                    .Where(p => p.id_egresado == idEgresado)
                    .Select(p => new
                    {
                        p.id_egresado,
                        p.numero_documento,
                        NombreCompleto = p.nombres + " " + p.apellidos,
                        p.email,
                        p.telefono,
                        p.Carrera.nombre_carrera,
                        p.promedio_academico,
                        p.nivel_experiencia,
                        p.puntuacion_global,
                        p.total_estrellas,
                        CartaPresentacion = p.CVs_Egresados.Where(c => c.id_egresado == p.id_egresado).Select(c => c.CartaPresentacion).FirstOrDefault(),
                        habilidades = p.CVs_Egresados.Where(c => c.id_egresado == p.id_egresado).Select(c => c.habilidades_principales).FirstOrDefault(),
                        Idiomas = _db.Egresado_Idiomas
                            .Where(i => i.id_egresado == p.id_egresado)
                            .Select(i => new
                            {
                                i.id_eg_idioma,
                                i.Idioma.nombre,
                                i.nivel
                            })
                            .ToList(),
                        Certificacioness = _db.Certificaciones
                            .Where(c => c.id_egresado == p.id_egresado)
                            .Select(c => new
                            {
                                c.id_certificacion,
                                c.nombre,
                                c.entidad_emisora
                            })
                            .ToList(),
                        Preferencias = _db.Preferencias_Egresado
                        .Where(pf => pf.id_egresado == p.id_egresado)
                        .Select(pf => new
                        {
                            pf.id_pref,
                            pf.disponible_inmediata,
                            pf.modalidad_preferida,
                            pf.jornada_preferida,
                            pf.area_interes,
                            pf.ubicacion_preferida,
                            pf.salario_min,
                            pf.salario_max
                        }).FirstOrDefault(),
                        Visualizaciones = _db.Visualizaciones_CV
                        .Where(vs => vs.id_cv == _db.CVs_Egresados.FirstOrDefault(c => c.id_egresado == p.id_egresado).id_cv)
                        .Select(vs => new
                        {
                            vs.id_visualizacion,
                            vs.id_cv,
                            vs.id_empresa,
                            empresa = _db.Empresas.Where(e => e.id_empresa == vs.id_empresa).Select(e => e.razon_social).FirstOrDefault(),
                            UsuarioEmpres = _db.Usuarios_Empresa.Where(e => e.id_usuario_empresa == vs.id_usuario_empresa).Select(e => e.nombre_completo).FirstOrDefault(),
                            vs.ip_address,
                            vs.navegador,
                            vs.observaciones
                        }).ToList()

                    })
                    .FirstOrDefault();
                if (perfil == null)
                {
                    return Resultado.error("No existe el perfil del Usuario Egresado");
                }

                return Resultado.exito("Perfil", perfil);
            }
            catch (Exception ex)
            {
                return Resultado.error(ex.Message);
            }
        }

        public Resultado ObtenerEmpresas()
        {
            try
            {
                var empresas = _db.Empresas
                    .Where(e => e.estado_activo == true)
                    .Select(e => new
                    {
                        e.id_empresa,
                        e.razon_social,
                        e.nit,
                        e.email_contacto,
                        e.telefono,
                        e.direccion,
                        e.sector_economico,
                        e.tamano_empresa,
                        e.vinculada_universidad,
                        Puntuacion = _db.Puntuaciones_Empresas
                                    .Where(p => p.id_empresa == e.id_empresa)
                                    .Select(p => p.Puntuacion)
                                    .DefaultIfEmpty(0)
                                    .Average(),
                        comentarios = _db.Puntuaciones_Empresas
                                    .Where(p => p.id_empresa == e.id_empresa)
                                    .Select(p => p.comentario)
                                    .ToList(),
                        UsuarioEmpresa = _db.Usuarios_Empresa
                                    .Where(u => u.id_empresa == e.id_empresa)
                                    .Select(u => new
                                    {
                                        u.id_usuario_empresa,
                                        u.id_empresa,
                                        u.nombre_usuario,
                                        u.email,
                                        u.nombre_completo,
                                        u.cargo,
                                        u.rol
                                    }).FirstOrDefault()
                    })
                    .ToList();
                if (empresas == null || empresas.Count == 0)
                {
                    return Resultado.exito("No hay empresas registradas");
                }
                return Resultado.exito("Empresas", empresas);
            }
            catch (Exception ex)
            {
                return Resultado.error(ex.Message);
            }
        }
        public Resultado ObtenerEmpresa(int idEmpresa)
        {
            try
            {
                var empresa = _db.Empresas
                    .Where(e => e.id_empresa == idEmpresa && e.estado_activo == true)
                    .Select(e => new
                    {
                        e.id_empresa,
                        e.razon_social,
                        e.nit,
                        e.email_contacto,
                        e.telefono,
                        e.direccion,
                        e.sector_economico,
                        e.tamano_empresa,
                        e.vinculada_universidad,
                        Puntuacion = _db.Puntuaciones_Empresas
                                    .Where(p => p.id_empresa == e.id_empresa)
                                    .Select(p => p.Puntuacion)
                                    .DefaultIfEmpty(0)
                                    .Average(),
                        UsuarioEmpresa = _db.Usuarios_Empresa
                                    .Where(u => u.id_empresa == e.id_empresa)
                                    .Select(u => new
                                    {
                                        u.id_usuario_empresa,
                                        u.id_empresa,
                                        u.nombre_usuario,
                                        u.email,
                                        u.nombre_completo,
                                        u.cargo,
                                        u.rol
                                    }).FirstOrDefault(),
                        UsuarioPrincipal = _db.Usuarios
                                    .Where(u => u.tipo_usuario == "UsuarioEmpresa" || u.referencia_id == _db.Usuarios_Empresa.FirstOrDefault(ue => ue.id_empresa == idEmpresa).id_usuario_empresa)
                                    .Select(u => new
                                    {
                                        u.id_usuario_global,
                                        u.email,
                                        u.tipo_usuario,
                                        u.password_hash,
                                        u.nombre_completo
                                    }).FirstOrDefault()
                    })
                    .FirstOrDefault();
                if (empresa == null)
                {
                    return Resultado.error("No existe la empresa solicitada");
                }
                return Resultado.exito("Empresa", empresa);
            }
            catch (Exception ex)
            {
                return Resultado.error(ex.Message);
            }
        }

        public Resultado ObtenerComentariosEmpresa(int idEmpresa)
        {
            try
            {
                var comentarios = _db.Puntuaciones_Empresas
                    .Where(p => p.id_empresa == idEmpresa)
                    .Select(p => new
                    {
                        p.id_puntuacion,
                        p.id_empresa,
                        usuario = _db.Egresados.Where(u => u.id_egresado == p.id_Egresado).Select(u => u.nombres +" "+ u.apellidos).FirstOrDefault(),
                        p.Puntuacion,
                        p.comentario,
                        p.FechaPuntuacion
                    })
                    .ToList();
                if (comentarios == null || comentarios.Count == 0)
                {
                    return Resultado.exito("No hay comentarios para esta empresa");
                }
                return Resultado.exito("Comentarios de la empresa", comentarios);
            }
            catch (Exception ex)
            {
                return Resultado.error(ex.Message);
            }
        }

        public Resultado ActualizarEmpresa(int idEmpresa, string razon_social, string nit, string email_contacto,
          string telefono, string direccion, string sector_economico, string tamano_empresa, bool vinculada_universidad,
          string usuario_empresa_nombre_usuario, string usuario_empresa_rol, string usuario_empresa_nombre_completo,
          string usuario_empresa_cargo, string usuario_empresa_email, string usuario_principal_password)
        {
            try
            {
                var empresa = _db.Empresas.FirstOrDefault(e => e.id_empresa == idEmpresa);
                var usuarioEmpresa = _db.Usuarios_Empresa.FirstOrDefault(ue => ue.id_empresa == idEmpresa);
                var usuarioPrincipal = _db.Usuarios.FirstOrDefault(u => u.tipo_usuario == "UsuarioEmpresa" && u.referencia_id == usuarioEmpresa.id_usuario_empresa);
                if (empresa == null || usuarioEmpresa == null || usuarioPrincipal == null)
                {
                    return Resultado.error("No existe la empresa solicitada");
                }
                empresa.razon_social = razon_social;
                empresa.nit = nit;
                empresa.email_contacto = email_contacto;
                empresa.telefono = telefono;
                empresa.direccion = direccion;
                empresa.sector_economico = sector_economico;
                empresa.tamano_empresa = tamano_empresa;
                empresa.vinculada_universidad = vinculada_universidad;
                usuarioEmpresa.nombre_usuario = usuario_empresa_nombre_usuario;
                usuarioEmpresa.email = usuario_empresa_email;
                usuarioEmpresa.nombre_completo = usuario_empresa_nombre_completo;
                usuarioEmpresa.cargo = usuario_empresa_cargo;
                usuarioEmpresa.rol = usuario_empresa_rol;
                usuarioPrincipal.username = usuario_empresa_nombre_usuario;
                usuarioPrincipal.email = usuario_empresa_email;
                if (!string.IsNullOrEmpty(usuario_principal_password))
                {
                    usuarioPrincipal.password_hash = _encriptadorServicio.HashContrasena(usuario_principal_password).Datos.ToString();
                }
                usuarioPrincipal.nombre_completo = usuario_empresa_nombre_completo;
                _db.SaveChanges();
                return Resultado.exito("Empresa actualizada exitosamente");
            }
            catch (Exception ex)
            {
                return Resultado.error(ex.Message);
            }
        }
        public Resultado DesactivarEmpresa(int idEmpresa)
        {
            try
            {
                var empresa = _db.Empresas.FirstOrDefault(e => e.id_empresa == idEmpresa);
                var usuarioEmpresa = _db.Usuarios_Empresa.FirstOrDefault(ue => ue.id_empresa == idEmpresa);
                var usuarioPrincipal = _db.Usuarios.FirstOrDefault(u => u.tipo_usuario == "UsuarioEmpresa" && u.referencia_id == usuarioEmpresa.id_usuario_empresa);
                if (empresa == null || usuarioEmpresa == null || usuarioPrincipal == null)
                {
                    return Resultado.error("No existe la empresa solicitada");
                }
                empresa.estado_activo = false;
                usuarioEmpresa.activo = false;
                usuarioPrincipal.activo = false;
                _db.SaveChanges();
                return Resultado.exito("Empresa desactivada exitosamente");
            }
            catch (Exception ex)
            {
                return Resultado.error(ex.Message);
            }
        }

        public Resultado EnviarInvitacionRegistroEmpresa(string email, string nombreEmpresa,string baseUrl)
        {
            try
            {
                var existente = _db.Empresas.Any(e => e.email_contacto == email && e.estado_activo == true);
                if (existente)
                {
                    return Resultado.error("Ya existe una empresa registrada con este correo electrónico.");
                }
                string token = _tokenServicio.GenerarTokenRegistroEmpresa(email, nombreEmpresa);
                string urlRegistro = $"{baseUrl}/UrlTemp/Index?JWT={HttpUtility.UrlEncode(token)}";
                if(_emailServicio.EnviarCorreoInvitacionRegistroEmpresa(email, nombreEmpresa, urlRegistro).Exito)
                {
                    return Resultado.exito("Invitación enviada exitosamente");
                }
                else
                {
                    return Resultado.error("Error al enviar la invitación por correo electrónico");
                }
            }
            catch (Exception ex)
            {
                return Resultado.error(ex.Message);
            }
        } 
        
        public Resultado ObtenerEgresados()
        {
            try
            {
                var egresados = _db.Egresados
                    .Where(e=>e.estado_activo == true)
                    .Select(e => new
                    {
                        e.id_egresado,
                        e.nombres,
                        e.apellidos,
                        e.numero_documento,
                        e.email,
                        e.telefono,
                        carrera = e.Carrera.nombre_carrera,
                        e.fecha_graduacion,
                        e.promedio_academico,
                        e.puntuacion_global,
                        e.fecha_registro
                    })
                    .ToList();
                if(egresados == null || egresados.Count == 0)
                {
                    return Resultado.exito("Aun no hay egresados registrados");
                }

                return Resultado.exito("Egresados", egresados);

            }
            catch(Exception ex)
            {
                return Resultado.error(ex.Message);
            }
        }
        public Resultado EliminarPerfilEgresado(int idEgresado)
        {
            try
            {
                var existEgresado = _db.Egresados.FirstOrDefault(e => e.id_egresado == idEgresado);
                if (existEgresado == null) {
                    return Resultado.error("No se encontro el egresado");
                }

                existEgresado.estado_activo = false;
                var existUsuario = _db.Usuarios.FirstOrDefault(u => u.referencia_id == existEgresado.id_egresado && u.tipo_usuario == "Egresado" && u.activo == true);
                if (existUsuario == null) {
                    return Resultado.error("Se pudo eliminar el egresado pero no se contro el perfil principal.");
                }
                existUsuario.activo = false;
                _db.SaveChanges();
                _procesosServicio.EliminarPostulaciones(existEgresado.id_egresado);
                WebSocketService.Instance.NotificarEliminacionCuenta(existUsuario.email);
                WebSocketService.Instance.NotificarActualizacionAdministracion();

                return Resultado.exito("Se elimino el egresado");
            }
            catch(Exception ex)
            {
                return Resultado.error(ex.Message);
            }
        }

        public Resultado ObtenerVacantes()
        {
            try
            {
                var vacantes = _db.Vacantes
                    .Where(v => v.estado != "Eliminada")
                    .Select(v => new
                    {
                        v.id_vacante,
                        empresa = _db.Empresas
                            .Where(e => e.id_empresa == v.id_empresa)
                            .Select(e => new {
                                nombre = e.razon_social,
                                e.nit,
                                e.email_contacto,
                                e.telefono,
                                e.direccion,
                                e.sector_economico,
                                e.tamano_empresa,
                                e.vinculada_universidad
                            })
                            .FirstOrDefault(),
                        Puntuacion = _db.Puntuaciones_Empresas
                                    .Where(p => p.id_empresa == v.id_empresa)
                                    .Select(p => p.Puntuacion)
                                    .DefaultIfEmpty(0)
                                    .Average(),
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
                        creadoPor = _db.Usuarios_Empresa
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
                    .ToList();
                if(vacantes == null ||  vacantes.Count == 0)
                {
                    return Resultado.exito("Aun no hay vacantes");
                }

                return Resultado.exito("Vacantes", vacantes);
            }
            catch(Exception ex)
            {
                return Resultado.error(ex.Message);
            }
        }

        public Resultado EliminarVacante(int idVacante, string motivo = null)
        {
            try
            {
                var existVacante = _db.Vacantes.FirstOrDefault(v => v.id_vacante == idVacante);
                
                if (existVacante == null) {
                    return Resultado.error("No existe la vacante");
                }

                existVacante.estado = "Eliminada";
                var postulados = _db.Postulaciones.Where(p => p.id_vacante == existVacante.id_vacante)
                        .Select(p => new
                        {
                            p.Egresado.email,
                            p.Egresado.nombres,
                            p.Egresado.apellidos
                        })
                        .ToList();
                foreach (var p in postulados) {
                    _emailServicio.EnviarCorreoEliminacionVacantePostulados(p.email,_registrarServicio.ObtenerPrimerNombreYApellido(p.nombres, p.apellidos), existVacante.titulo);
                }
                if (motivo != null) {
                    string correoEncargado = _db.Usuarios_Empresa.FirstOrDefault(u => u.id_usuario_empresa == existVacante.creado_por.Value && u.activo == true).email;
                    string nombreEncargado = _db.Usuarios_Empresa.FirstOrDefault(u => u.id_usuario_empresa == existVacante.creado_por.Value && u.activo == true).nombre_completo;
                    _emailServicio.EnviarCorreoEliminacionVacante(correoEncargado, nombreEncargado, existVacante.titulo, motivo);   
                }
                _db.SaveChanges();

                return Resultado.exito("Se elimino con exito la vacante");
            }
            catch(Exception ex)
            {
                return Resultado.error(ex.Message);
            }
        }
    }
}