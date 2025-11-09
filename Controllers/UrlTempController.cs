using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace SistemaEgresados.Controllers
{
    public class UrlTempController : Controller
    {
        private readonly Servicios.UrlTemp _urlTempServicio = new Servicios.UrlTemp();
        public ActionResult Index(string JWT)
        {
            if (string.IsNullOrEmpty(JWT))
            {
                return RedirectToAction("Index", "AccesoDenegado");
            }
            var resultado = _urlTempServicio.ValidarJWT(JWT,obtenerIPAddress());
            if (!resultado.Exito)
            {
                return RedirectToAction("Index", "AccesoDenegado");
            }
            ViewBag.JWT = JWT;
            return View();
        }

        private string obtenerIPAddress()
        {
            string ipAddress = Request.ServerVariables["HTTP_X_FORWARDED_FOR"];
            if (string.IsNullOrEmpty(ipAddress))
            {
                ipAddress = Request.ServerVariables["REMOTE_ADDR"];
            }
            return ipAddress;
        }
        [HttpPost]
        [ValidateAntiForgeryToken]
        public JsonResult RegistrarEmpresa(string razon_social, string nit, string email_contacto,
          string telefono, string direccion, string sector_economico, string tamano_empresa, bool vinculada_universidad,
          string usuario_empresa_nombre_usuario, string usuario_empresa_rol, string usuario_empresa_nombre_completo,
          string usuario_empresa_cargo, string usuario_empresa_email, string usuario_principal_password)
        {
            var resultado = _urlTempServicio.agregarEmpresa(razon_social,  nit,  email_contacto,
                telefono,  direccion,  sector_economico,  tamano_empresa,  vinculada_universidad,
                usuario_empresa_nombre_usuario,  usuario_empresa_rol,  usuario_empresa_nombre_completo,
                usuario_empresa_cargo,  usuario_empresa_email,  usuario_principal_password);
            if (!resultado.Exito)
            {
                return Json(new { success = false, mensaje = resultado.Mensaje },JsonRequestBehavior.AllowGet);
            }
            return Json(new { success = true, mensaje = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
        }
    }
}