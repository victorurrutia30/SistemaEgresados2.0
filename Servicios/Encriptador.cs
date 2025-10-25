using SistemaEgresados.DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SistemaEgresados.Servicios
{
    public class Encriptador
    {
        public Resultado HashContrasena(string contrasena)
        {
            try
            {
                var hashed = BCrypt.Net.BCrypt.HashPassword(contrasena);
                return Resultado.exito("HashedPassword", hashed);
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al encriptar la contraseña: " + ex.Message);
            }
        }
        public Resultado VerificarContrasena(string contrasena, string hashed)
        {
            try
            {
                bool verificado = BCrypt.Net.BCrypt.Verify(contrasena, hashed);
                if (!verificado)
                {
                    return Resultado.error("No verificado", verificado);
                }
                return Resultado.exito("Verificado", verificado);
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al verificar la contraseña: " + ex.Message);
            }
        }
        public Resultado VerificarSeguridad(string contrasena) {             try
            {
                if (contrasena.Length < 8)
                {
                    return Resultado.error("La contraseña debe tener al menos 8 caracteres.");
                }
                if (!contrasena.Any(char.IsUpper))
                {
                    return Resultado.error("La contraseña debe contener al menos una letra mayúscula.");
                }
                if (!contrasena.Any(char.IsLower))
                {
                    return Resultado.error("La contraseña debe contener al menos una letra minúscula.");
                }
                if (!contrasena.Any(char.IsDigit))
                {
                    return Resultado.error("La contraseña debe contener al menos un número.");
                }
                if (!contrasena.Any(ch => !char.IsLetterOrDigit(ch)))
                {
                    return Resultado.error("La contraseña debe contener al menos un carácter especial.");
                }
                return Resultado.exito("La contraseña es segura.");
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al verificar la seguridad de la contraseña: " + ex.Message);
            }
        }
    }
}