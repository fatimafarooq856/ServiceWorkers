
using Newtonsoft.Json;
using System;
using System.Collections;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Data;
using System.Data.Common;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using System.Web.Configuration;
using System.Web.Mvc;
using System.Web.Routing;
using WebApplication1;

namespace WebApplication1.Models
{
    public static class Static
    {
        public static testEntities DbContext { get { return new testEntities(); } }
        public static string ConnectionString { get { return DbContext.Database.Connection.ConnectionString; } }
        public static string ApplicationSource { get { return WebConfigurationManager.AppSettings["ApplicationSource"]; } }
       
    }    
    public class Message
    {
        public static string ErrorMessage = "Something went wrong. Please try again";
        public bool Success = true;

        public bool Info { get; set; }
        public bool Warning { get; set; }
        public string Detail = "Request processed successfully";
        public static string DeleteError = "009 Unable to processe this request.";
        public dynamic Data { get; set; }
    }
    public class Paging
    {
        public int Draw { get; set; }
        public int DisplayStart { get; set; }
        public int DisplayLength { get; set; }
        public int SortColumn { get; set; }
        public string SortOrder { get; set; }
        public string Search { get; set; }
        public string Description { get; set; }
        public string SearchJson { get; set; }
    }
    public class CallBackData
    {
        public Message msg = new Message();

        public JqueryDataTable Data = new JqueryDataTable();
    }
    public class JqueryDataTable
    {
        public int draw { get; set; }
        public int recordsTotal { get; set; }
        public int recordsFiltered { get; set; }
        public dynamic data { get; set; }
    }
    public class ReturnData
    {
        public Message msg = new Message();
        public dynamic Data { get; set; }
    } 
    
    
}
