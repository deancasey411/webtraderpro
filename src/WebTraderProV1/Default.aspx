<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Default.aspx.cs" Inherits="NTWebTraderPro.Default" %>

<!doctype html>
<html xmlns:ng="http://angularjs.org" id="ng-app" ng-csp>
<head>
    <meta http-equiv="X-UA-Compatible" content="IE=edge, chrome=1" />
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
    <title>Nutcracker - Web TraderPro v2</title>


    <link href="content/bootstrap.min.css" rel="stylesheet" />
    <%: System.Web.Optimization.Styles.Render("~/css/app") %>
    <%: System.Web.Optimization.Styles.Render("~/css/analytics") %>
    <link rel="shortcut icon" href="icons/favicon.ico">
    <link rel="apple-touch-icon" sizes="57x57" href="icons/apple-touch-icon-57x57.png">
    <link rel="apple-touch-icon" sizes="114x114" href="icons/apple-touch-icon-114x114.png">
    <link rel="apple-touch-icon" sizes="72x72" href="icons/apple-touch-icon-72x72.png">
    <link rel="apple-touch-icon" sizes="144x144" href="icons/apple-touch-icon-144x144.png">
    <link rel="apple-touch-icon" sizes="60x60" href="icons/apple-touch-icon-60x60.png">
    <link rel="apple-touch-icon" sizes="120x120" href="icons/apple-touch-icon-120x120.png">
    <link rel="apple-touch-icon" sizes="76x76" href="icons/apple-touch-icon-76x76.png">
    <link rel="apple-touch-icon" sizes="152x152" href="icons/apple-touch-icon-152x152.png">
    <link rel="apple-touch-icon" sizes="180x180" href="icons/apple-touch-icon-180x180.png">
    <link rel="icon" type="image/png" href="icons/favicon-192x192.png" sizes="192x192">
    <link rel="icon" type="image/png" href="icons/favicon-160x160.png" sizes="160x160">
    <link rel="icon" type="image/png" href="icons/favicon-96x96.png" sizes="96x96">
    <link rel="icon" type="image/png" href="icons/favicon-16x16.png" sizes="16x16">
    <link rel="icon" type="image/png" href="icons/favicon-32x32.png" sizes="32x32">
    <meta name="msapplication-TileColor" content="#2b5797">
    <meta name="msapplication-TileImage" content="icons/mstile-144x144.png">
    <meta name="msapplication-config" content="icons/browserconfig.xml">
</head>
<body class="body">
    <div id="divPrivateBrowsing" style="display: none">
        <div class="navbar navbar-default">
            <div class="navbar-header">
                <button type="button" class="navbar-toggle collapsed">
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                </button>
                <img class="navbar-brand-image" src="images/logo.png" />
                <a class="navbar-brand" href="#">Web TraderPro v2</a>
            </div>
            <div class="navbar-collapse collapse">
                <ul class="nav navbar-nav navbar-right">
                    <li><a><span class="glyphicon glyphicon-th-large"></span>Home</a></li>
                </ul>
            </div>
        </div>
        <div class="jumbotron">
            <div class="container">
                <div class="page-header text-center text-danger">
                    <h1><span class="glyphicon glyphicon-warning-sign"></span>Warning </h1>
                </div>
                <div class="col-md-3">
                    &nbsp;
                </div>
                <div class="col-md-6">
                    <div>
                        <p class="text-primary text-center text-danger">This site requires cookies, local and session storage. Please click the relevant link below.</p>
                        <table class="table table-condensed table-responsive">
                            <thead>
                                <tr>
                                    <th>Browser</th>
                                    <th>Link</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>IE
                                    </td>
                                    <td>
                                        <a href="http://windows.microsoft.com/en-ZA/internet-explorer/delete-manage-cookies#ie=ie-11" target="_blank">Delete and manage cookies</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Chrome
                                    </td>
                                    <td>
                                        <a href="https://support.google.com/chrome/answer/95647?hl=en" target="_blank">Manage your cookies and site data</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Safari
                                    </td>
                                    <td>
                                        <a href="https://support.apple.com/kb/PH19214?locale=en_US" target="_blank">Manage cookies and website data</a><br />
                                        <a href="https://support.apple.com/en-za/HT203036" target="_blank">Turn Private Browsing on or off on your iPhone, iPad, or iPod touch</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Other
                                    </td>
                                    <td>
                                        <a href="http://caniuse.com/#search=namevalue-storage" target="_blank">Which browsers support Web Storage</a>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <p class="text-success text-center"><a href="." target="_self">Reload Page</a></p>
                    </div>
                </div>
                <div class="col-md-3">
                    &nbsp;
                </div>
            </div>
        </div>
        <div class="footer">
            Copyright <%= DateTime.Now.Year %> by <a href="http://www.nutcracker.co.za" target="_blank">Nutcracker Technologies (Pty) Ltd</a> - v<%= GetVersion() %>
        </div>
    </div>
    <div id="wrap" ng-cloak>
        <header data-ng-controller="navigationController">
            <div id="menu" class="navbar navbar-default">
                <div class="navbar-header">
                    <button type="button" class="navbar-toggle collapsed" data-ng-click="navbarExpanded = !navbarExpanded">
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                    </button>
                    <img class="navbar-brand-image" src="images/logo.png" />
                    <a class="navbar-brand" href="#">Web TraderPro v2</a>
                </div>
                <div class="navbar-collapse collapse" data-collapse="!navbarExpanded">
                    <ul class="nav navbar-nav navbar-right">
                        <li data-ng-show="authentication.isAuth">
                            <button class="btn btn-sm btn-nutcracker-connect visible-md-block visible-lg-block" ng-class="getlsStatus()"><span class="glyphicon glyphicon-transfer"></span>{{ global.lsStatus }}</button>
                            <button class="btn btn-sm btn-nutcracker-connect btn-nutcracker-connect-mobile visible-xs-block visible-sm-block" ng-class="getlsStatus()"><span class="glyphicon glyphicon-transfer"></span>{{ global.lsStatus }}</button>
                        </li>
                        <li data-ng-show="authentication.isAuth"><a href="">Welcome {{authentication.userName}}</a></li>
                        <li data-ng-show="authentication.isAuth" data-ng-class="{'active':isActive('/dashboard')}"><a href="#/dashboard"><span class="glyphicon glyphicon-globe"></span>&nbsp;Market Data</a></li>
                        <li data-ng-show="authentication.isAuth" data-ng-class="{'active':isActive('/fixdashboard')}"><a href="#/fixdashboard"><span class="glyphicon glyphicon-briefcase"></span>&nbsp;Trading</a></li>
                        <li data-ng-show="authentication.isAuth && global.isTrader" class="dropdown" dropdown>
                            <a href="#" class="dropdown-toggle" data-toggle="dropdown" dropdown-toggle><span class="glyphicon glyphicon-tags"></span>&nbsp;New Order<span class="caret"></span></a>
                            <ul class="dropdown-menu" role="menu">
                                <li ng-repeat="oe in orderEntryTypes"><a href="" data-ng-click="newOrder(oe)">{{ oe.market }}</a></li>
                            </ul>
                        </li>
                        <%--<li data-ng-show="authentication.isAuth" data-ng-class="{'active':isActive('/technicalanalysis')}"><a href="#/technicalanalysis"><span class="glyphicon glyphicon-stats"></span> Technical Analysis</a></li>--%>
                        <li data-ng-show="authentication.isAuth" data-ng-class="{'active':isActive('/help')}"><a href="docs/WTPv2_Help.pdf" target="_blank"><span class="glyphicon glyphicon-question-sign"></span>&nbsp;Help</a></li>
                        <li data-ng-show="authentication.isAuth" data-ng-class="{'active':isActive('/about')}"><a href="#/about"><span class="glyphicon glyphicon-info-sign"></span>&nbsp;About</a></li>
                        <li data-ng-show="authentication.isAuth"><a href="" data-ng-click="logOut()"><span class="glyphicon glyphicon-log-out"></span>&nbsp;Logout</a></li>
                        <li data-ng-hide="authentication.isAuth" data-ng-class="{'active':isActive('/home')}"><a href="#/home"><span class="glyphicon glyphicon-th-large"></span>&nbsp;Home</a></li>
                        <li data-ng-hide="authentication.isAuth" data-ng-class="{'active':isActive('/login')}"><a href="#/login"><span class="glyphicon glyphicon-log-in"></span>&nbsp;Login</a></li>
                    </ul>
                </div>
            </div>
        </header>
        <section id="body">
            <div class="wrapper">
                <div class="row">
                    <div data-ng-view=""></div>
                    <toaster-container>
                    </toaster-container>
                </div>
            </div>
        </section>
        <footer class="footer">
            Copyright <%= DateTime.Now.Year %> by <a href="http://www.nutcracker.co.za" target="_blank">Nutcracker Technologies (Pty) Ltd</a> - v<%= GetVersion() %>
        </footer>
    </div>
    <script type="text/javascript">
        var NTACT;
    </script>
    <!-- 3rd party libraries external-->
    <script src="scripts/amcharts/amcharts.js"></script>
    <script src="scripts/amcharts/serial.js"></script>
    <script src="scripts/amcharts/none.js"></script>
    <script src="scripts/amcharts/amstock.js"></script>

    <%: System.Web.Optimization.Scripts.Render("~/js/main") %>
    <%: System.Web.Optimization.Scripts.Render("~/js/app") %>

    <script type="text/javascript">
        //Internet Explorer 10 doesn't differentiate device width from viewport width, 
        //and thus doesn't properly apply the media queries in Bootstrap's CSS. Normally 
        //you'd just add a quick snippet of CSS to fix this:
        //http://getbootstrap.com/getting-started/#support-ie10-width
        if (navigator.userAgent.match(/IEMobile\/10\.0/)) {
            var msViewportStyle = document.createElement("style")
            msViewportStyle.appendChild(
              document.createTextNode(
                "@-ms-viewport{width:auto!important}"
              )
            )
            document.getElementsByTagName("head")[0].appendChild(msViewportStyle)
        }
        //Android stock browser
        //Out of the box, Android 4.1 (and even some newer releases apparently) ship with the 
        //Browser app as the default web browser of choice (as opposed to Chrome). Unfortunately, 
        //the Browser app has lots of bugs and inconsistencies with CSS in general.
        //http://getbootstrap.com/getting-started/#support-android-stock-browser
        var nua = navigator.userAgent
        var isAndroid = (nua.indexOf('Mozilla/5.0') > -1 && nua.indexOf('Android ') > -1 && nua.indexOf('AppleWebKit') > -1 && nua.indexOf('Chrome') === -1)
        if (isAndroid) {
            $('select.form-control').removeClass('form-control').css('width', '100%')
        }

        //An initiative by web designers to inform users about browser-updates
        //https://browser-update.org/
        var $buoop = {
            vs: { i: 9, f: 15, o: 12.1, s: 5.1, c: 2 },
            reminder: 0,
            newwindow: true,
            test: false
        };
        function $buo_f() {
            var e = document.createElement("script");
            e.src = "//browser-update.org/update.js";
            document.body.appendChild(e);
        };
        try { document.addEventListener("DOMContentLoaded", $buo_f, false) }
        catch (e) { window.attachEvent("onload", $buo_f) }
    </script>
</body>
</html>
