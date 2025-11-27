using SistemaEgresados.DTO;
using SistemaEgresados.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SistemaEgresados.Servicios
{
    public class UrlTemp
    {
        private readonly Servicios.TokenService _tokenServicio = new Servicios.TokenService();
        private readonly SistemaEgresadosUtecEntities _db = new SistemaEgresadosUtecEntities();
        private readonly Servicios.Email _servicioEmail = new Servicios.Email();
        private readonly Servicios.Encriptador _encriptadorServicio = new Servicios.Encriptador();

        public Resultado ValidarJWT(string JWT,string ip)
        {
            try
            {
                if (string.IsNullOrEmpty(JWT))
                {
                    return Resultado.error("El token JWT no puede estar vacío.");
                }
                var resultado = _tokenServicio.ValidarTokenRegistroEmpresa(JWT);
                if (!resultado.Exito)
                {
                    return Resultado.error(resultado.Mensaje);
                }
                if(!_tokenServicio.VerificarYMarcarTokenUsado(JWT,ip).Exito)
                {
                    return Resultado.error("El token ya ha sido utilizado.");
                }

                return Resultado.exito("Token válido.");

            }
            catch (Exception ex)
            {
               return Resultado.error("Error al validar el token: " + ex.Message);
            }
        }
        public Resultado agregarEmpresa(
            string razon_social, string nit, string email_contacto,
            string telefono, string direccion, string sector_economico, string tamano_empresa, bool vinculada_universidad,
            string usuario_empresa_nombre_usuario, string usuario_empresa_rol, string usuario_empresa_nombre_completo,
            string usuario_empresa_cargo, string usuario_empresa_email, string usuario_principal_password)
        {
            try
            {
                var existente = _db.Empresas.Any(e => e.email_contacto == email_contacto && e.estado_activo == true);
                var existenteUsuario = _db.Usuarios_Empresa.Any(ue => ue.nombre_usuario == usuario_empresa_nombre_usuario && ue.activo == true);
                var existenteUsuarioPrincipal = _db.Usuarios.Any(u => u.username == usuario_empresa_nombre_usuario && u.activo == true);

                if (existente || existenteUsuario || existenteUsuarioPrincipal)
                {
                    return Resultado.error("Ya existe una empresa o usuario registrado con este correo electrónico o nombre de usuario.");
                }

                Empresa nuevaEmpresa = new Empresa
                {
                    razon_social = razon_social,
                    nit = nit,
                    email_contacto = email_contacto,
                    telefono = telefono,
                    direccion = direccion,
                    sector_economico = sector_economico,
                    tamano_empresa = tamano_empresa,
                    vinculada_universidad = vinculada_universidad,
                    estado_activo = true,
                    fecha_registro = DateTime.Now
                };
                _db.Empresas.Add(nuevaEmpresa);
                _db.SaveChanges();
                string passwordhas = _encriptadorServicio.HashContrasena(usuario_principal_password).Datos.ToString();
                Usuarios_Empresa nuevoUsuarioEmpresa = new Usuarios_Empresa
                {
                    id_empresa = nuevaEmpresa.id_empresa,
                    nombre_usuario = usuario_empresa_nombre_usuario,
                    email = usuario_empresa_email,
                    nombre_completo = usuario_empresa_nombre_completo,
                    cargo = usuario_empresa_cargo,
                    rol = usuario_empresa_rol,
                    activo = true,
                    fecha_creacion = DateTime.Now,
                    password_hash = passwordhas
                };
                _db.Usuarios_Empresa.Add(nuevoUsuarioEmpresa);
                _db.SaveChanges();

                

                Usuario nuevoUsuarioPrincipal = new Usuario
                {
                    username = usuario_empresa_nombre_usuario,
                    email = usuario_empresa_email,
                    password_hash = passwordhas,
                    tipo_usuario = "UsuarioEmpresa",
                    referencia_id = nuevoUsuarioEmpresa.id_usuario_empresa,
                    nombre_completo = usuario_empresa_nombre_completo,
                    activo = true,
                    fecha_creacion = DateTime.Now
                };
                _db.Usuarios.Add(nuevoUsuarioPrincipal);
                _db.SaveChanges();

                _servicioEmail.EnviarCorreoBienvenidaEmpresa(email_contacto, razon_social, usuario_empresa_nombre_usuario);

                return Resultado.exito("Empresa y usuario creados exitosamente. Se ha enviado un correo de bienvenida.");
            }
            catch (System.Data.Entity.Validation.DbEntityValidationException ex)
            {
                var errorMessages = ex.EntityValidationErrors
                    .SelectMany(x => x.ValidationErrors)
                    .Select(x => x.PropertyName + ": " + x.ErrorMessage);

                var fullErrorMessage = string.Join("; ", errorMessages);
                var exceptionMessage = string.Concat(ex.Message, " Los errores de validación son: ", fullErrorMessage);

                return Resultado.error("Error de validación: " + exceptionMessage);
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al registrar empresa: " + ex.Message);
            }
        }

    }
}