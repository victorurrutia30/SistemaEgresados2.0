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
    }
}