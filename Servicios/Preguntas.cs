using SistemaEgresados.DTO;
using SistemaEgresados.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Razor.Generator;

namespace SistemaEgresados.Servicios
{
    public class Preguntas
    {
        private readonly SistemaEgresadosUtecEntities _db = new SistemaEgresadosUtecEntities();

        public Resultado ObtenerPreguntas(bool trabaja)
        {
            try
            {
                var preguntas = _db.Preguntas_Encuesta
                .Where(p => p.id_encuesta == 1 && p.aplica_si_trabaja == (trabaja ? true : false))
                .OrderBy(p => p.orden)
                .Select(p => new
                {
                    p.id_pregunta_encuesta,
                    p.texto_pregunta,
                    p.tipo,
                    p.aplica_si_trabaja,
                    p.orden
                })
                .ToList();
                return Resultado.exito("Preguntas",preguntas);
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al obtener las preguntas: " + ex.Message);
            }
        }
        public Resultado ObtenerIdiomas()
        {
            try
            {
                var idiomas = _db.Idiomas
                    .Select(i => new
                    {
                        i.id_idioma,
                        i.nombre
                    })
                    .ToList();
                return Resultado.exito("Idiomas",idiomas);
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al obtener los idiomas: " + ex.Message);
            }
        }
        public Resultado AgregarIdioma(string idioma)
        {
            try
            {
                var existente = _db.Idiomas.FirstOrDefault(i => i.nombre.ToLower() == idioma.ToLower());
                if (existente != null)
                {
                    return Resultado.error("El idioma ya existe,Por favor seleccionalo!");
                }
                Idioma nuevoIdioma = new Idioma
                {
                    nombre = idioma
                };
                _db.Idiomas.Add(nuevoIdioma);
                _db.SaveChanges();
                return Resultado.exito("Idioma agregado exitosamente.", nuevoIdioma);
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al agregar el idioma: " + ex.Message);
            }
        }
    }
}