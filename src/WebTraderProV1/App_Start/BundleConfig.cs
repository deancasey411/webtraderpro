using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Optimization;

namespace NTWebTraderPro.App_Start
{
    public class BundleConfig
    {
        public static void RegisterBundles(BundleCollection bundles)
        {
            IItemTransform cssFixer = new CssRewriteUrlTransform();
            // bundling and minifying Nutcracker angularjs scripts
            bundles.Add(new ScriptBundle("~/js/app").
                Include("~/app/startup.js").
                Include("~/app/app.js").
                IncludeDirectory("~/app/directives", "*.js").
                Include("~/app/factories/authInterceptorService.js").
                Include("~/app/factories/authService.js").
                Include("~/app/factories/ntDataStore.js").
                Include("~/app/factories/ntLightstreamer.js").
                IncludeDirectory("~/app/controllers", "*.js").
                IncludeDirectory("~/app/pages", "*.js"));

            bundles.Add(new ScriptBundle("~/js/app-analytics").
                Include("~/app/startup.js").
                Include("~/app/app-analytics.js").
                IncludeDirectory("~/app/directives", "*.js").
                Include("~/app/factories/authInterceptorService.js").
                Include("~/app/factories/authService.js").
                Include("~/app/factories/ntDataStore.js").
                Include("~/app/factories/ntLightstreamer.js").
                IncludeDirectory("~/app/controllers", "*.js").
                IncludeDirectory("~/app/pages", "*.js"));

            // bundling and minifying default angularjs scripts
            bundles.Add(new ScriptBundle("~/js/main").
                Include("~/scripts/angular.js").
                Include("~/scripts/angular-touch.js").
                Include("~/scripts/angular-route.js").
                Include("~/scripts/angular-resource.js").
                Include("~/scripts/angular-animate.js").
                Include("~/scripts/ngStorage.js").
                Include("~/scripts/toaster.js").
                Include("~/scripts/loading-bar.js").
                Include("~/scripts/angular-ui/ui-bootstrap.js").
                Include("~/scripts/lightstreamer.js").
                Include("~/scripts/angular-ui/ui-bootstrap-tpls.js"));
            // bundling and minifying app startup stylesheets
            bundles.Add(new StyleBundle("~/css/startup").
               Include("~/Content/bootstrap.css"));
            // bundling and minifying app stylesheets
            bundles.Add(new StyleBundle("~/css/app").
               Include("~/Content/bootstrap.css").
               Include("~/Content/angular-csp.css").
               Include("~/Content/ui-bootstrap-csp.css").
               Include("~/Content/toaster.css").
               Include("~/Content/loading-bar.css"));
            // bundling and minifying default site stylesheets
            bundles.Add(new StyleBundle("~/css/default").
                  Include("~/content/bootstrap-theme.css").
                  Include("~/Content/site.css").
                  Include("~/Content/generic.css"));
            // bundling and minifying Intrepid site stylesheets
            bundles.Add(new StyleBundle("~/css/intrepid").
                  Include("~/content/bootstrap-theme.intrepid.css").
                  Include("~/Content/site.intrepid.css").
                  Include("~/Content/generic.css"));
            // bundling and minifying Computershare site stylesheets
            bundles.Add(new StyleBundle("~/css/computershare").
                  Include("~/content/boostrap-theme.computershare.css").
                  Include("~/Content/site.computershare.css").
                  Include("~/Content/generic.css"));
            // bundling and minifying default site stylesheets
            bundles.Add(new StyleBundle("~/css/kestrel").
                  Include("~/content/bootstrap-theme.kestrel.css").
                  Include("~/Content/site.kestrel.css").
                  Include("~/Content/generic.css"));
            // bundling and minifying default site stylesheets
            bundles.Add(new StyleBundle("~/css/apex").
                  Include("~/content/bootstrap-theme.apex.css").
                  Include("~/Content/site.apex.css").
                  Include("~/Content/generic.css"));
            // bundling and minifying default site stylesheets
            bundles.Add(new StyleBundle("~/css/citadel").
                  Include("~/content/bootstrap-theme.citadel.css").
                  Include("~/Content/site.citadel.css").
                  Include("~/Content/generic.css"));
            // bundling and minifying default site stylesheets
            bundles.Add(new StyleBundle("~/css/bayhill").
                  Include("~/content/bootstrap-theme.bayhill.css").
                  Include("~/Content/site.bayhill.css").
                  Include("~/Content/generic.css"));
            // bundling and minifying default site stylesheets
            bundles.Add(new StyleBundle("~/css/dyerblair").
                  Include("~/content/bootstrap-theme.dyerblair.css").
                  Include("~/Content/site.dyerblair.css").
                  Include("~/Content/generic.css"));
            // bundling and minifying default site stylesheets
            bundles.Add(new StyleBundle("~/css/fnb").
                  Include("~/content/bootstrap-theme.fnb.css").
                  Include("~/Content/site.fnb.css").
                  Include("~/Content/generic.css"));
            // bundling and minifying Intrepid site stylesheets
            bundles.Add(new StyleBundle("~/css/bayhill").
                  Include("~/content/bootstrap-theme.bayhill.css").
                  Include("~/Content/site.bayhill.css").
                  Include("~/Content/generic.css"));
            // bundling and minifying Anlaytics Portal site stylesheets
            bundles.Add(new StyleBundle("~/css/analytics").
                Include("~/content/bootstrap-theme.css").
                Include("~/Content/site.analytics.css").
                Include("~/Content/generic.css"));
        }


    }


}