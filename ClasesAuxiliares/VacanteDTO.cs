using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SistemaEgresados.ClasesAuxiliares
{
    public class VacanteDTO
    {
        public int id_vacante { get; set; }
        public dynamic empresa { get; set; }
        public string titulo { get; set; }
        public string descripcion { get; set; }
        public string requisitos { get; set; }
        public decimal? salario_min { get; set; }
        public decimal? salario_max { get; set; }
        public bool? salario_confidencial { get; set; }
        public string modalidad { get; set; }
        public string tipo_contrato { get; set; }
        public string ubicacion { get; set; }
        public string area { get; set; }
        public DateTime? fecha_publicacion { get; set; }
        public DateTime? fecha_cierre { get; set; }
        public string estado { get; set; }
        public dynamic CreadoPor { get; set; }
        public bool YaPostulado { get; set; }
        public int PuntuacionCompatibilidad { get; set; }
    }
}