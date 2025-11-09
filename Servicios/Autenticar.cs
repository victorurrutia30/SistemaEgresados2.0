using SistemaEgresados.DTO;
using SistemaEgresados.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SistemaEgresados.Servicios
{
    public class Autenticar
    {
        private readonly SistemaEgresadosUtecEntities _db = new SistemaEgresadosUtecEntities();
        private readonly Encriptador _encriptar = new Encriptador();
        private readonly Servicios.Registrar _servicioRegistrar = new Servicios.Registrar();

        public Resultado AutenticarUsuario(string email,string password)
        {
            try
            {
                var existeUsuario = _db.Usuarios.FirstOrDefault(u => u.email == email && u.activo == true);
                if (existeUsuario == null)
                {
                    return Resultado.error("El usuario no existe.");
                }
                if(existeUsuario.activo == false)
                {
                    return Resultado.error("La cuenta de usuario está inactiva. Por favor, contacte al administrador.");
                }
                var passwordHash = _encriptar.VerificarContrasena(password, existeUsuario.password_hash);
                if (!passwordHash.Mensaje.Equals("No verificado") && passwordHash.Exito == false)
                {
                    return Resultado.error("Contraseña incorrecta.");
                }
                if(existeUsuario.tipo_usuario == "Egresado")
                {
                    var existeEgresado = _db.Egresados.FirstOrDefault(e => e.email == email);
                    if(existeEgresado.estado_activo == false)
                    {
                        return Resultado.error("La cuenta de egresado está inactiva. Por favor, contacte al administrador.");
                    }
                    if(existeEgresado.Trabaja == null || existeEgresado.Trabaja == true)
                    {
                        return Resultado.error("Actualmente no puedes ver las vacantes disponibles,las vacantes son prioritarias para egresados que no estan laborando actualmente,\n" +
                            "Si necesitas actualizar tu estado por favor haga click en actualizar mi informacion");
                    }
                }
                else if(existeUsuario.tipo_usuario == "UsuarioEmpresa")
                {
                    var existeEmpresa = _db.Usuarios_Empresa.FirstOrDefault(e => e.id_usuario_empresa == existeUsuario.referencia_id);
                    if(existeEmpresa == null)
                    {
                        return Resultado.error("El Usuario de empresa no existe");
                    }
                }
                else if(existeUsuario.tipo_usuario == "Administrador")
                {
                    return Resultado.exito("Usuario autenticado",existeUsuario);
                }
                else
                {
                    return Resultado.error("El Usuario no existe");
                }

                return Resultado.exito("Usuario autenticado.", existeUsuario);
                
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al autenticar usuario: " + ex.Message);
            }
        }
        public Resultado ObtenerUsuario(string email)
        {
            try
            {
                var existeUsuario = _db.Usuarios.FirstOrDefault(u => u.email == email && u.activo == true && u.tipo_usuario == "Egresado");
                if(existeUsuario == null)
                {
                    return Resultado.error("No se pudo encontrar el usuario");
                }
                return Resultado.exito("Usuario encontrado", existeUsuario);
            }
            catch (Exception ex)
            {
                return Resultado.error(ex.Message);
            }
        }
        public Resultado CambiarContra(string email, string password) 
        {
            try
            {
                var existeUsuariu = _db.Usuarios.FirstOrDefault(u=>u.email == email);
                if(existeUsuariu == null)
                {
                    return Resultado.error("No se encontro el usuario");
                }
                switch (existeUsuariu.tipo_usuario)
                {
                    case "Egresado":
                        var existEgresado = _db.Egresados.FirstOrDefault(u=>u.email == email);
                        existEgresado.password_hash = _encriptar.HashContrasena(password).Datos.ToString();
                        existeUsuariu.password_hash = existEgresado.password_hash;
                        _db.SaveChanges();
                        break;
                    case "UsuarioEmpresa":
                        var existUEmpresa = _db.Usuarios_Empresa.FirstOrDefault(u=>u.email == email);
                        existUEmpresa.password_hash = _encriptar.HashContrasena(password).Datos.ToString();
                        existeUsuariu.password_hash = existUEmpresa.password_hash;
                        _db.SaveChanges(); 
                        break;
                    case "Administrador":
                        existeUsuariu.password_hash = _encriptar.HashContrasena(password).Datos.ToString();
                        _db.SaveChanges();
                        break;
                    default:
                        break;
                }
                return Resultado.exito("Contraseña cambiada exitosamente");
            }
            catch (Exception ex) 
            {
                return Resultado.error(ex.Message);
            }
        }
        public Resultado NombreyApellido(string email)
        {
            try
            {
                var existeUsuario = _db.Usuarios.FirstOrDefault(u => u.email == email);
                if (existeUsuario == null)
                {
                    return Resultado.error("No se pudo encontrar el usuario");
                }
                string nombreCompleto = "";
                switch (existeUsuario.tipo_usuario)
                {
                    case "Egresado":
                        var existEgresado = _db.Egresados.FirstOrDefault(u => u.email == email);
                        nombreCompleto = _servicioRegistrar.ObtenerPrimerNombreYApellido(existEgresado.nombres,existEgresado.apellidos);
                        break;
                    case "UsuarioEmpresa":
                        var existUEmpresa = _db.Usuarios_Empresa.FirstOrDefault(u => u.email == email && u.activo == true);
                        nombreCompleto = existUEmpresa.nombre_completo;
                        break;
                    case "Administrador":
                        nombreCompleto = "Administrador";
                        break;
                    default:
                        break;
                }
                return Resultado.exito("Nombre obtenido", nombreCompleto);
            }
            catch (Exception ex)
            {
                return Resultado.error(ex.Message);
            }
        }

    }
}