/* global angular: false */
/* global app: false */
'use strict';

app.config(['$logProvider', function ($logProvider) {
    $logProvider.debugEnabled(false);
}]);

app.config(['$routeProvider','ntConfig',
    function ($routeProvider, ntConfig) {

        $routeProvider.when("/home", {
            controller: "homeController",
            templateUrl: "app/views/home.html"
        });

        $routeProvider.when("/login", {
            controller: "loginController",
            templateUrl: "app/views/login.html"
        });

        $routeProvider.when("/dashboard", {
            controller: "dashboardController",
            templateUrl: "app/pages/dashboardNSE.html"
        });

        //$routeProvider.when("/fixdashboard", {
        //    controller: "fixdashboardController",
        //    templateUrl: "app/pages/fixdashboard.html"
        //});

        //$routeProvider.when("/fixdashboard", {
        //    controller: "fixdashboardV2Controller",
        //    templateUrl: "app/pages/fixdashboardv2.html"
        //});

        //$routeProvider.when("/technicalanalysis", {
        //    templateUrl: "app/views/technicalanalysis.html"
        //});

        $routeProvider.when("/about", {
            templateUrl: "app/views/about.html"
        });

        $routeProvider.when("/audit", {
            controller: "audittrailController",
            templateUrl: "app/views/audittrail.html"
        });

        $routeProvider.otherwise({ redirectTo: "/home" });
    }]);

app.config(['$compileProvider', function ($compileProvider) {
    $compileProvider.debugInfoEnabled(false);
}]);


//app.config(['$provide', function ($provide) {
//    $provide.decorator('$log', ['$delegate', function ($delegate) {
//        // Keep track of the original debug method, we'll need it later.
//        var origDebug = $delegate.debug;
//        /*
//         * Intercept the call to $log.debug() so we can add on 
//         * our enhancement. We're going to add on a date and 
//         * time stamp to the message that will be logged.
//         */
//        $delegate.debug = function () {
//            var args = [].slice.call(arguments);
//            args[0] = [new Date().toString(), ': ', args[0]].join('');

//            // Send on our enhanced message to the original debug method.
//            origDebug.apply(null, args)
//        };

//        return $delegate;
//    }]);
//}])

app.config(['$httpProvider',
    function ($httpProvider) {
        $httpProvider.interceptors.push('authInterceptorService');
        $httpProvider.useApplyAsync(true);
    }]);

app.run(['$rootScope', '$location', '$q', '$http', 'authService', 'ntDataStore', 'ntConfig', '$log',
    function ($rootScope, $location, $q, $http, authService, ntDataStore, ntConfig, $log) {
        //Create mapping object for stoing order routing pages
        var mapping = function (page, controller, market, fixSession, array) {
            this.page = page;
            this.controller = controller;
            this.fixSession = fixSession;
            this.market = market;
            array.push(this);
        };

        //Set defaults and initialize variables
        $rootScope.mappings = [];
        $rootScope.showPositions = false;
        $rootScope.showPositionsSummary = false;
        $rootScope.swapWatchlistBuySell = false;
        $rootScope.isTrader = false;
        $rootScope.OrderDetails = function (s, p, i) {
            this.FixSession = '';
            this.Side = s;
            this.Price = Number(p);
            this.Exchange = '';
            this.TESK = '';
            this.Symbol = '';
            this.Quantity = 0;
            this.Account = '';
            this.OrderType = 'LO';
            this.TIF = 'GFD';
            this.Expiry = '';
            this.Notes = '';
            this.PESK = i;
            this.Instrument = null;
            this.TriggerPrice = null;
        };

        //$log.info(ntConfig);
        //$log.info('Config' + ntConfig); 

        $rootScope.serviceBase = ntConfig.serviceBaseUrl;
        $rootScope.clientAppId = ntConfig.clientAppId;
        $rootScope.authType = ntConfig.authType;
        $rootScope.portalId = ntConfig.portalId;
        $rootScope.lsUrl = ntConfig.lightStreamerUrl;
        $rootScope.logoutPage = ntConfig.logoutPage;
        $rootScope.showPositions = ntConfig.showPositions;
        $rootScope.showPositionsSummary = ntConfig.showPositionsSummary;
        $rootScope.swapWatchlistBuySell = ntConfig.swapWatchlistBuySell;
        $rootScope.useUTC = ntConfig.useUTC;

        //Map order entry pages and controllers
        angular.forEach(ntConfig.orderRouting, function (value) {
            $rootScope.mappings[value.FixSession] = new mapping(value.Template, value.Controller, value.Description, value.FixSession, $rootScope.mappings);
        });

        //Fill authentication token if it is found.
        authService.fillAuthData();

        var dnntid = $location.search().dnntid;

        $location.url($location.path());

        $location.path('/home').replace();
        if (authService.authentication.isAuth) {
            ntDataStore.init();
            $location.path('/dashboard');
        } else {
            if (angular.isDefined(dnntid)) {
                $rootScope.tokenLogon = true;
                var loginData = {
                    tokenId: dnntid
                };
                authService.login(loginData).then(function (response) {
                    ntDataStore.init();
                    $location.path('/dashboard');
                    $rootScope.tokenLogon = false;
                }, function (result) {
                    $rootScope.tokenLogon = false;
                });
            } else {
                $location.path('/home');
            }
        }
    }]);

app.config(["$provide", function ($provide) {
    $provide.decorator("$exceptionHandler", ['$delegate', '$injector', function ($delegate, $injector) {
        return function (exception, cause) {
            $delegate(exception, cause);
            var $log = $injector.get('$log');
            $log.error(exception.message);
        };
    }]);
}]);