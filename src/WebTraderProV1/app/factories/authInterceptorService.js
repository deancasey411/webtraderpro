/* global angular: false */
/* global app: false */
'use strict';
app.factory('authInterceptorService', ['$q', '$location', '$sessionStorage', '$injector', '$window',
    function ($q, $location, $sessionStorage, $injector, $window) {

        var authInterceptorServiceFactory = {};

        var _request = function (config) {

            config.headers = config.headers || {};

            var authData = $sessionStorage.authData;
            if (authData) {
                config.headers.Authorization = 'Bearer ' + authData.token;
                if ((angular.isDefined(authData.expiry)) && (authData.expiry !== null) && (authData.expiry !== '')) {
                    if (new Date() >= new Date(authData.expiry)) {
                        var AuthService = $injector.get('authService');
                        AuthService.logOut(); 
                        $window.location.reload();
                    }
                }
            }

            return config;
        };

        var _responseError = function (rejection) {
            if (rejection.status === 401) {
                var AuthService = $injector.get('authService');
                AuthService.logOut();
                $window.location.reload();
            }
            return $q.reject(rejection);
        };

        authInterceptorServiceFactory.request = _request;
        authInterceptorServiceFactory.responseError = _responseError;

        return authInterceptorServiceFactory;
    }]);