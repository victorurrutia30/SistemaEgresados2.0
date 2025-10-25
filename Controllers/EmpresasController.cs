using SistemaEgresados.Filters;
using SistemaEgresados.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace SistemaEgresados.Controllers
{
    [AutorizacionEmpresas]
    public class EmpresasController : Controller
    {
        private readonly Servicios.Empresas _empresaServicio = new Servicios.Empresas();
        public ActionResult Index()
        {
            return View();
        }
        [HttpGet]
        public JsonResult DatosEmpresa()
        {
            var resultado = _empresaServicio.ObtenerDatosEmpresa(((Usuario)Session["Usuario"]).referencia_id.Value);
            if (resultado.Exito)
            {
                return Json(new { success = true, message = resultado.Mensaje, data = resultado.Datos }, JsonRequestBehavior.AllowGet);
            }
            else
            {
                return Json(new { success = false, message = resultado.Mensaje }, JsonRequestBehavior.AllowGet);
            }
        }
    }
}