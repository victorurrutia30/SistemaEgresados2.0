using SistemaEgresados.DTO;
using SistemaEgresados.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Helpers;

namespace SistemaEgresados.Servicios
{
    public class Registrar
    {
        private readonly SistemaEgresadosUtecEntities _db = new SistemaEgresadosUtecEntities();
        private readonly Encriptador _encriptador = new Encriptador();
        private readonly Email _email = new Email();
        public Resultado Carreras()
        {
            try
            {
                var carreras = _db.Carreras
                    .Select(c => new
                    {
                        c.id_carrera,
                        c.nombre_carrera
                    })
                    .ToList();
                return Resultado.exito("Carreras",carreras);
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al obtener las carreras: " + ex.Message);
            }
        }
        public Resultado RegistrarEgresado(Egresado egresado)
        {
            try
            {
                var existente = _db.Egresados.FirstOrDefault(e => e.numero_documento == egresado.numero_documento || e.email == egresado.email);
                if (existente != null)
                {
                    return Resultado.error("El número de documento o el correo electrónico ya están registrados.");
                }

                if (_encriptador.VerificarSeguridad(egresado.password_hash).Exito == false)
                {
                    return Resultado.error(_encriptador.VerificarSeguridad(egresado.password_hash).Mensaje);
                }
                var usuarioPrincipal = _db.Usuarios.FirstOrDefault(u=>u.email == egresado.email && u.activo == true && u.tipo_usuario == "Egresado");
                if (usuarioPrincipal != null) {
                    return Resultado.error("No se pudo crear el usuario principal,Ya existe un usuario con ese correo");
                }
                 
                egresado.password_hash = _encriptador.HashContrasena(egresado.password_hash).Datos.ToString();
                egresado.fecha_registro = DateTime.Now;
                egresado.estado_activo = true;                
                _db.Egresados.Add(egresado);
                _db.SaveChanges();
                Usuario usuario = new Usuario
                {
                    username = ObtenerPrimerNombreYApellido(egresado.nombres, egresado.apellidos),
                    email = egresado.email,
                    password_hash = egresado.password_hash,
                    tipo_usuario = "Egresado",
                    referencia_id = egresado.id_egresado,
                    nombre_completo = egresado.nombres + " " + egresado.apellidos,
                    activo = true,
                    fecha_creacion = DateTime.Now
                };
                _db.Usuarios.Add(usuario);
                _db.SaveChanges();

                if (!_email.EnviarMensajeAutentificacion(egresado.email).Exito)
                {
                    return Resultado.error("Error al enviar el correo de verificación.");
                }

                return Resultado.exito($"Registro Exitoso, Se mando un codigo a tu correo, Verificate que eres tu tienes 5 minutos antes de que caduque el codigo!!.");
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al registrar el egresado: " + ex.Message);
            }
        }
        public Resultado ValidarCodigo(string email, string codigo)
        {
            try
            {
                var resultado = _email.ValidarMensajeAutentificacion(email, codigo);
                if (!resultado.Exito)
                {
                    return Resultado.error(resultado.Mensaje);
                }
                
                return Resultado.exito("Código verificado correctamente.");
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al validar el código: " + ex.Message);
            }
        }
        public Resultado Privacidad(string email)
        {
            try
            {
                var egresado = _db.Egresados.FirstOrDefault(e => e.email == email);
                egresado.consentimiento_datos = true;
                _db.SaveChanges();
                return Resultado.exito("Preferencias de privacidad actualizadas correctamente.");                
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al obtener las preferencias de privacidad: " + ex.Message);
            }
        }

        public Resultado ResponderPreguntas(List<Respuestas_Encuesta> respuestas, int idEgresado,
            HttpPostedFileBase CV, List<Egresado_Idiomas> IdsIdiomas, decimal experiencia, string habilidades, bool trabaja)
        {
            using (var transaction = _db.Database.BeginTransaction())
            {
                try
                {
                    foreach (var respuesta in respuestas)
                    {
                        _db.Respuestas_Encuesta.Add(new Respuestas_Encuesta
                        {
                            id_pregunta_encuesta = respuesta.id_pregunta_encuesta,
                            id_egresado = idEgresado,
                            respuesta = respuesta.respuesta,
                            fecha_respuesta = DateTime.Now
                        });
                    }
                    _db.SaveChanges();

                    var pref = _db.Preferencias_Egresado
                        .FirstOrDefault(p => p.id_egresado == idEgresado);

                    if (pref == null)
                    {
                        pref = new Preferencias_Egresado
                        {
                            id_egresado = idEgresado,
                            fecha_actualizacion = DateTime.Now
                        };
                        _db.Preferencias_Egresado.Add(pref);
                    }

                    var idsPreguntas = respuestas.Select(r => r.id_pregunta_encuesta).ToList();
                    var preguntasRespondidas = _db.Preguntas_Encuesta
                        .Where(p => idsPreguntas.Contains(p.id_pregunta_encuesta))
                        .ToList();

                    foreach (var resp in respuestas)
                    {
                        var pregunta = preguntasRespondidas.FirstOrDefault(p => p.id_pregunta_encuesta == resp.id_pregunta_encuesta);
                        if (pregunta == null) continue;

                        var textoLower = pregunta.texto_pregunta.ToLower();

                        if (textoLower.Contains("disponibilidad") && textoLower.Contains("inmediata"))
                        {
                            pref.disponible_inmediata = resp.respuesta == "1";
                        }
                        else if (textoLower.Contains("modalidad") && !textoLower.Contains("trabajo"))
                        {
                            pref.modalidad_preferida = resp.respuesta;
                        }
                        else if (textoLower.Contains("jornada") && textoLower.Contains("preferida"))
                        {
                            pref.jornada_preferida = resp.respuesta;
                        }
                        else if (textoLower.Contains("salario") && textoLower.Contains("minimo"))
                        {
                            if (decimal.TryParse(resp.respuesta, out decimal min))
                                pref.salario_min = min;
                        }
                        else if (textoLower.Contains("salario") && textoLower.Contains("maximo"))
                        {
                            if (decimal.TryParse(resp.respuesta, out decimal max))
                                pref.salario_max = max;
                        }                        
                        else if (textoLower.Contains("area") && textoLower.Contains("interes?"))
                        {
                            pref.area_interes = resp.respuesta;
                        }
                        else if (textoLower.Contains("preferencia") && textoLower.Contains("ubicacion"))
                        {
                            pref.ubicacion_preferida = resp.respuesta;
                        }
                        else if (textoLower.Contains("recibir") && textoLower.Contains("notificaciones"))                        {
                            
                            if(resp.respuesta == "1")
                            {
                                pref.notificar = true;
                            }
                            else
                            {
                                pref.notificar = false;
                            }
                        }
                    }

                    pref.fecha_actualizacion = DateTime.Now;
                    _db.SaveChanges();

                    var resultadoIdiomas = AgregarIdiomasEgresado(idEgresado, IdsIdiomas);
                    if (!resultadoIdiomas.Exito)
                    {
                        transaction.Rollback();
                        return Resultado.error(resultadoIdiomas.Mensaje);
                    }
                    if (!trabaja)
                    {
                        var resultadoCV = SubirCV(CV, idEgresado, experiencia, habilidades);
                        if (!resultadoCV.Exito)
                        {
                            transaction.Rollback();
                            return Resultado.error(resultadoCV.Mensaje);
                        }
                    }

                    transaction.Commit();
                    var egresadoName = ObtenerPrimerNombreYApellido(_db.Egresados.Find(idEgresado).nombres, _db.Egresados.Find(idEgresado).apellidos);
                    var emialBienvenido = _email.EnviarCorreoBienvenida(_db.Egresados.Find(idEgresado).email,egresadoName);
                    return Resultado.exito("Registro completado exitosamente. ¡Bienvenido!");
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    return Resultado.error("Error al procesar el registro: " + ex.Message);
                }
            }
        }

        public Resultado AgregarIdiomasEgresado(int idEgresado, List<Egresado_Idiomas> IdsIdiomas)
        {
            try
            {
                var idiomasExistentes = _db.Egresado_Idiomas
                    .Where(ei => ei.id_egresado == idEgresado)
                    .Select(ei => ei.id_idioma)
                    .ToList();
                foreach (var idioma in IdsIdiomas)
                {
                    if (!idiomasExistentes.Contains(idioma.id_idioma))
                    {
                        Egresado_Idiomas nuevoIdioma = new Egresado_Idiomas
                        {
                            id_egresado = idEgresado,
                            id_idioma = idioma.id_idioma,
                            nivel = idioma.nivel
                        };
                        _db.Egresado_Idiomas.Add(nuevoIdioma);
                    }
                }
                _db.SaveChanges();
                return Resultado.exito("Idiomas agregados exitosamente.");
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al agregar idiomas: " + ex.Message);
            }
        }

        public Resultado SubirCV(HttpPostedFileBase cv, int IdEgresado, decimal experiencia, string habilidades)
        {
            try
            {
                if (cv == null || cv.ContentLength <= 0)
                {
                    return Resultado.error("El archivo está vacío.");
                }

                string extension = System.IO.Path.GetExtension(cv.FileName).ToLower();
                if (extension != ".pdf")
                {
                    return Resultado.error("Solo se permiten archivos PDF.");
                }

                if (cv.ContentLength > 5 * 1024 * 1024)
                {
                    return Resultado.error("El archivo no debe superar los 5MB.");
                }

                var egresado = _db.Egresados.FirstOrDefault(e => e.id_egresado == IdEgresado);
                if (egresado == null)
                {
                    return Resultado.error("Egresado no encontrado.");
                }

                string rutaCarpeta = HttpContext.Current.Server.MapPath("~/Archivos/CVs/");
                if (!System.IO.Directory.Exists(rutaCarpeta))
                {
                    System.IO.Directory.CreateDirectory(rutaCarpeta);
                }

                string nombreArchivo = $"CV_{egresado.nombres}_{egresado.apellidos}_{DateTime.Now.Ticks}{extension}";
                string rutaCompleta = System.IO.Path.Combine(rutaCarpeta, nombreArchivo);

                cv.SaveAs(rutaCompleta);

                var cvAnterior = _db.CVs_Egresados.FirstOrDefault(c => c.id_egresado == IdEgresado);
                if (cvAnterior != null)
                {
                    string rutaAnterior = HttpContext.Current.Server.MapPath("~" + cvAnterior.ruta_archivo);
                    if (System.IO.File.Exists(rutaAnterior))
                    {
                        System.IO.File.Delete(rutaAnterior);
                    }

                    cvAnterior.nombre_archivo = nombreArchivo;
                    cvAnterior.ruta_archivo = "/Archivos/CVs/" + nombreArchivo;
                    cvAnterior.extension = extension;
                    cvAnterior.tamano_archivo = cv.ContentLength;
                    cvAnterior.experiencia_anos = experiencia;
                    cvAnterior.habilidades_principales = habilidades;
                    cvAnterior.fecha_actualizacion = DateTime.Now;
                }
                else
                {
                    CVs_Egresados cvEgresado = new CVs_Egresados
                    {
                        id_egresado = IdEgresado,
                        nombre_archivo = nombreArchivo,
                        ruta_archivo = "/Archivos/CVs/" + nombreArchivo,
                        extension = extension,
                        tamano_archivo = cv.ContentLength,
                        experiencia_anos = experiencia,
                        habilidades_principales = habilidades,
                        disponible_busqueda = true,
                        privacidad = "Publica",
                        fecha_subida = DateTime.Now,
                        fecha_actualizacion = DateTime.Now,
                        veces_visualizado = 0
                    };
                    _db.CVs_Egresados.Add(cvEgresado);
                }

                _db.SaveChanges();
                return Resultado.exito("CV subido exitosamente.");
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al subir CV: " + ex.Message);
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