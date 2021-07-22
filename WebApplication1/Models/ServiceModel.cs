using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;


namespace WebApplication1.Models
{
    public class ServiceModel
    {
        private testEntities db = Static.DbContext;
        public Message GetStudent()
        {
            Message msg = new Message();
             try
            {
                db.Configuration.ProxyCreationEnabled = false;
                var form = db.students.ToList();                
                msg.Data = new { Form = form };

            }
            catch (Exception ex)
            {
                msg.Success = false;
                msg.Detail = Message.ErrorMessage;                
            }
            return msg;
        }
        public Message SaveData(student obj)
        {
            Message msg = new Message();
            try
            {
                db.Configuration.ProxyCreationEnabled = false;
                student stu = new student();
                stu.name = obj.name;
                stu.email = obj.email;
                stu.phonenumber = obj.phonenumber;
                db.students.Add(stu);
                db.SaveChanges();

            }
            catch (Exception ex)
            {
                msg.Success = false;
                msg.Detail = Message.ErrorMessage;
            }
            return msg;
        }
    }
}