using SistemaEgresados.DTO;
using SistemaEgresados.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SistemaEgresados.Servicios
{
    public class Empresas
    {
        private readonly SistemaEgresadosUtecEntities _db = new SistemaEgresadosUtecEntities();

        public Resultado ObtenerDatosEmpresa(int IdEmpresa)
        {
            try
            {
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
                            VacantesActivas = _db.Vacantes
                                .Count(v => v.id_empresa == emp.id_empresa && v.estado == "Abierta"),
                            CandidatosEvaluados = _db.Postulaciones
                                .Count(p => p.Vacante.id_empresa == emp.id_empresa && p.estado != "Pendiente"),
                            Contrataciones = _db.Postulaciones
                                .Count(p => p.Vacante.id_empresa == emp.id_empresa && p.estado == "Contratado"),
                            PromedioEvaluacion = _db.Postulaciones
                                .Where(p => p.Vacante.id_empresa == emp.id_empresa)
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
                                NumeroPostulantes = _db.Postulaciones.Count(p => p.id_vacante == v.id_vacante)
                            }).ToList(),
                        CandidatosEnProceso = _db.Postulaciones
                            .Where(p => p.Vacante.id_empresa == emp.id_empresa &&
                                       p.estado != "Rechazado" && p.estado != "Contratado")
                            .OrderByDescending(p => p.fecha_postulacion)
                            .Take(4)
                            .Select(p => new
                            {
                                NombreCandidato = p.Egresado.nombres,
                                TituloVacante = p.Vacante.titulo,
                                p.estado
                            }).ToList()
                    }).FirstOrDefault();

                if (datosEmpresa == null)
                {
                    return Resultado.error("Empresa no encontrada");
                }

                return Resultado.exito("Datos de la empresa obtenidos exitosamente", datosEmpresa);
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al obtener datos de la empresa: " + ex.Message);
            }
        }

        // ============================================================
        // MÉTODOS PARA ACTUALIZACIÓN DEL PERFIL DE EMPRESA
        // ============================================================

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

                _db.SaveChanges();

                return Resultado.exito("Perfil actualizado correctamente", empresa);
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al actualizar perfil: " + ex.Message);
            }
        }

        // ============================================================
        // MÉTODOS PARA GESTIÓN DE PUBLICACIONES (VACANTES)
        // ============================================================

        public Resultado ObtenerPublicaciones(int idEmpresa)
        {
            try
            {
                var publicaciones = _db.Vacantes
                    .Where(v => v.id_empresa == idEmpresa)
                    .OrderByDescending(v => v.fecha_publicacion)
                    .Select(v => new
                    {
                        v.id_vacante,
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
                        NumeroPostulantes = v.Postulaciones.Count()
                    })
                    .ToList();

                return Resultado.exito("Publicaciones obtenidas", publicaciones);
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al obtener publicaciones: " + ex.Message);
            }
        }

        public Resultado CrearPublicacion(Vacante vacante)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(vacante.titulo))
                {
                    return Resultado.error("El título es obligatorio");
                }

                if (string.IsNullOrWhiteSpace(vacante.descripcion))
                {
                    return Resultado.error("La descripción es obligatoria");
                }

                vacante.fecha_publicacion = DateTime.Now;
                vacante.estado = "Activa";

                if (vacante.fecha_cierre.HasValue && vacante.fecha_cierre.Value <= DateTime.Now)
                {
                    return Resultado.error("La fecha de cierre debe ser posterior a la fecha actual");
                }

                _db.Vacantes.Add(vacante);
                _db.SaveChanges();

                return Resultado.exito("Publicación creada correctamente", vacante);
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al crear publicación: " + ex.Message);
            }
        }

        public Resultado ActualizarPublicacion(Vacante vacanteActualizada)
        {
            try
            {
                var vacante = _db.Vacantes.FirstOrDefault(v => v.id_vacante == vacanteActualizada.id_vacante && v.id_empresa == vacanteActualizada.id_empresa);

                if (vacante == null)
                {
                    return Resultado.error("Publicación no encontrada");
                }

                vacante.titulo = vacanteActualizada.titulo;
                vacante.descripcion = vacanteActualizada.descripcion;
                vacante.requisitos = vacanteActualizada.requisitos;
                vacante.salario_min = vacanteActualizada.salario_min;
                vacante.salario_max = vacanteActualizada.salario_max;
                vacante.salario_confidencial = vacanteActualizada.salario_confidencial;
                vacante.modalidad = vacanteActualizada.modalidad;
                vacante.tipo_contrato = vacanteActualizada.tipo_contrato;
                vacante.ubicacion = vacanteActualizada.ubicacion;
                vacante.area = vacanteActualizada.area;
                vacante.fecha_cierre = vacanteActualizada.fecha_cierre;

                _db.SaveChanges();

                return Resultado.exito("Publicación actualizada correctamente");
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al actualizar publicación: " + ex.Message);
            }
        }

        public Resultado CambiarEstadoPublicacion(int idVacante, int idEmpresa, string nuevoEstado)
        {
            try
            {
                var vacante = _db.Vacantes.FirstOrDefault(v => v.id_vacante == idVacante && v.id_empresa == idEmpresa);

                if (vacante == null)
                {
                    return Resultado.error("Publicación no encontrada");
                }

                string[] estadosValidos = { "Activa", "Pausada", "Cerrada", "Cancelada" };
                if (!estadosValidos.Contains(nuevoEstado))
                {
                    return Resultado.error("Estado no válido");
                }

                vacante.estado = nuevoEstado;
                _db.SaveChanges();

                return Resultado.exito("Estado actualizado correctamente");
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al cambiar estado: " + ex.Message);
            }
        }

        public Resultado EliminarPublicacion(int idVacante, int idEmpresa)
        {
            try
            {
                var vacante = _db.Vacantes.FirstOrDefault(v => v.id_vacante == idVacante && v.id_empresa == idEmpresa);

                if (vacante == null)
                {
                    return Resultado.error("Publicación no encontrada");
                }

                if (vacante.Postulaciones.Any())
                {
                    return Resultado.error("No se puede eliminar una publicación con postulantes. Cambia el estado a 'Cancelada' en su lugar");
                }

                _db.Vacantes.Remove(vacante);
                _db.SaveChanges();

                return Resultado.exito("Publicación eliminada correctamente");
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al eliminar publicación: " + ex.Message);
            }
        }

        public Resultado ObtenerDetallePublicacion(int idVacante, int idEmpresa)
        {
            try
            {
                var vacante = _db.Vacantes.FirstOrDefault(v => v.id_vacante == idVacante && v.id_empresa == idEmpresa);

                if (vacante == null)
                {
                    return Resultado.error("Publicación no encontrada");
                }

                return Resultado.exito("Detalle obtenido", vacante);
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al obtener detalle: " + ex.Message);
            }
        }
    }
}