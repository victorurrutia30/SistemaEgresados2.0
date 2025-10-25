using SistemaEgresados.Filters;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace SistemaEgresados.Controllers
{
    [AutenticacionFilter]
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();

        }
        public ActionResult About()
        {
            return View();
        }
        public ActionResult Contact()
        {
            return View();
        }
    }
}