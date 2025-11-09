using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace SistemaEgresados.Controllers
{
    public class AccesoDenegadoController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }
        public ActionResult RecursoNoEncontrado()
        {
            Response.StatusCode = 404;
            Response.TrySkipIisCustomErrors = true;

            string urlSolicitada = Request.Url.PathAndQuery;

            const string parametroAspx = "aspxerrorpath=";
            if (urlSolicitada.Contains(parametroAspx))
            {
                int index = urlSolicitada.IndexOf(parametroAspx) + parametroAspx.Length;
                urlSolicitada = urlSolicitada.Substring(index);
            }

            const string parametro404 = "?404;";
            if (urlSolicitada.Contains(parametro404))
            {
                int index = urlSolicitada.IndexOf(parametro404) + parametro404.Length;
                urlSolicitada = urlSolicitada.Substring(index);
            }

            urlSolicitada = Server.UrlDecode(urlSolicitada.Trim());

            ViewBag.UrlSolicitada = urlSolicitada;

            return View();
        }


    }
}