using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApplication1
{
    public static class Static
    {
        public static testEntities DbContext { get { return new testEntities(); } }
    }
}