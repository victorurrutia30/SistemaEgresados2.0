using SistemaEgresados.DTO;
using SistemaEgresados.Models;
using SistemaEgresados.ServicioWebSocket;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SistemaEgresados.Servicios
{
    public class ProcesosAutomatizados
    {
        private readonly SistemaEgresadosUtecEntities _db = new SistemaEgresadosUtecEntities();
        private readonly Servicios.Email _servicioEmail = new Email();
        public Resultado CerrarVacantes()
        {
            try
            {
                var ahora = DateTime.Now;

                var vacantesPorCerrar = _db.Vacantes
                    .Where(v => v.fecha_cierre < ahora && v.estado != "Cerrado")
                    .ToList();

                foreach (var vacante in vacantesPorCerrar)
                {
                    vacante.estado = "Cerrado";
                }

                if (vacantesPorCerrar.Any())
                    _db.SaveChanges();

                return Resultado.exito($"{vacantesPorCerrar.Count} vacantes cerradas automáticamente.");
            }
            catch (Exception ex)
            {
                return Resultado.error(ex.Message);
            }
        }
        public Resultado EliminarPostulaciones(int IdEgresado)
        {
            try
            {
                var postulaciones = _db.Postulaciones
                    .Where(p => p.id_egresado == IdEgresado)
                    .ToList();

                if (postulaciones.Count > 0)
                {
                    foreach (var postulacion in postulaciones)
                    {
                        _db.Postulaciones.Remove(postulacion);
                    }

                    _db.SaveChanges();

                    return Resultado.exito($"Se eliminaron {postulaciones.Count} postulaciones del egresado.");
                }
                else
                {
                    return Resultado.exito("No se encontraron postulaciones para eliminar.");
                }
            }
            catch (Exception ex)
            {
                return Resultado.error(ex.Message);
            }
        }
        
        public void NotificarEgresadosVacanteRecomendada(Vacante vacante)
        {
            try
            {
                var egresadosCoincidentes = _db.Egresados
                    .Include("Preferencias_Egresado")
                    .Where(e => e.estado_activo == true &&
                               e.Preferencias_Egresado.Any(p => p.notificar == true))
                    .ToList()
                    .Where(e =>
                    {
                        var pref = e.Preferencias_Egresado.FirstOrDefault(p => p.notificar == true);
                        if (pref == null) return false;

                        bool coincideModalidad = string.IsNullOrEmpty(pref.modalidad_preferida) ||
                                                pref.modalidad_preferida.Equals(vacante.modalidad, StringComparison.OrdinalIgnoreCase);

                        bool coincideArea = string.IsNullOrEmpty(pref.area_interes) ||
                                           pref.area_interes.Split(',')
                                               .Any(area => vacante.area.IndexOf(area.Trim(), StringComparison.OrdinalIgnoreCase) >= 0);

                        bool coincideUbicacion = string.IsNullOrEmpty(pref.ubicacion_preferida) ||
                                                vacante.modalidad.Equals("Remoto", StringComparison.OrdinalIgnoreCase) ||
                                                pref.ubicacion_preferida.Split(',')
                                                    .Any(ub => vacante.ubicacion.IndexOf(ub.Trim(), StringComparison.OrdinalIgnoreCase) >= 0);

                        bool coincideSalario = true;
                        if (vacante.salario_min.HasValue && pref.salario_min.HasValue)
                        {
                            coincideSalario = vacante.salario_max >= pref.salario_min;
                        }

                        int puntuacion = 0;
                        if (coincideModalidad) puntuacion++;
                        if (coincideArea) puntuacion++;
                        if (coincideUbicacion) puntuacion++;
                        if (coincideSalario) puntuacion++;

                        return puntuacion >= 2;
                    })
                    .ToList();

                var empresa = _db.Empresas.FirstOrDefault(emp => emp.id_empresa == vacante.id_empresa);
                string nombreEmpresa = empresa?.razon_social ?? "Una empresa";

                foreach (var egresado in egresadosCoincidentes)
                {
                    string mensaje = $"¡Nueva vacante recomendada! {nombreEmpresa} publicó: {vacante.titulo} - {vacante.area}";
                    _servicioEmail.EnviarCorreoVacanteRecomendada(egresado.email, ObtenerPrimerNombreYApellido(egresado.nombres, egresado.apellidos), vacante,empresa.razon_social);

                }

                _db.SaveChanges();

                Console.WriteLine($"✅ {egresadosCoincidentes.Count} egresados notificados sobre la vacante: {vacante.titulo}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"⚠️ Error al notificar egresados: {ex.Message}");
            }
        }
        public string ObtenerPrimerNombreYApellido(string nombres, string apellidos)
        {
            var primerNombre = nombres?.Split(' ').FirstOrDefault() ?? string.Empty;
            var primerApellido = apellidos?.Split(' ').FirstOrDefault() ?? string.Empty;
            return $"{primerNombre} {primerApellido}".Trim();
        }
    }
}