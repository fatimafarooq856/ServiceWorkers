using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using WebApplication1.Models;

namespace WebApplication1.Controllers
{
    public class HomeController : Controller
    {
        ServiceModel serviceObj = new ServiceModel();
        public ActionResult Index()
        {
            return View("Info");
        }

        public ActionResult About()
        {
            ViewBag.Message = "Your application description page.";

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }
        public ActionResult Info()
        {
           
            return View();
        }
        public JsonResult GetStudent()
        {
            return Json(serviceObj.GetStudent(), JsonRequestBehavior.AllowGet);
        }
        public JsonResult SaveData(student obj)
        {
            return Json(serviceObj.SaveData(obj), JsonRequestBehavior.AllowGet);
        }
    }
}