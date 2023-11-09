using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace NTWebTraderPro
{
    public partial class Default : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            var forceSSL = true;
            bool.TryParse(System.Configuration.ConfigurationManager.AppSettings["ForceSSL"], out forceSSL);
            if ((forceSSL) && (!Request.IsLocal && !Request.IsSecureConnection))
            {
                string redirectUrl = Request.Url.ToString().Replace("http:", "https:");
                Response.Redirect(redirectUrl, false);
            }
        }

        public static string GetVersion()
        {
            try
            {
                return System.Reflection.Assembly.GetExecutingAssembly().GetName().Version.ToString();
            }
            catch (Exception)
            {
                return "1.0";
            }           
        }
    }
}