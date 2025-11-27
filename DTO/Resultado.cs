using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SistemaEgresados.DTO
{
    public class Resultado
    {
        public bool Exito { get; }
        public string Mensaje { get; }
        public object Datos { get; }

        public byte[] ArchivoContenido { get; }
        public string NombreArchivo { get; }

        public Resultado(bool exito, string mensaje = null, object datos = null, byte[] archivo = null, string nombreArchivo = null)
        {
            Exito = exito;
            Mensaje = mensaje;
            Datos = datos;
            ArchivoContenido = archivo;
            NombreArchivo = nombreArchivo;
        }

        public static Resultado exito(string mensaje = null, object datos = null, byte[] archivo = null, string nombreArchivo = null)
        {
            return new Resultado(true, mensaje, datos, archivo, nombreArchivo);
        }

        public static Resultado error(string mensaje = null,object datos = null)
        {
            return new Resultado(false, mensaje,datos);
        }
    }

}