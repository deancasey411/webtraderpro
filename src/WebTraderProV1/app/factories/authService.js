/* global angular: false */
/* global app: false */
'use strict';
app.factory('authService', ['$http', '$q', '$sessionStorage', '$rootScope',
    function ($http, $q, $sessionStorage, $rootScope) {

        var authServiceFactory = {};

        var _authentication = {
            isAuth: false,
            userName: "",
            roles: []
        };

        var _saveRegistration = function (registration) {

            _logOut();

            return $http.post($rootScope.serviceBase + '/api/account/register', registration).then(function (response) {
                return response;
            });

        };

        var _login = function (loginData) {

            var data;
            if (angular.isDefined(loginData.tokenId)) {
                data = `grant_type=dotnetnuke&username=Redcated&password=Redacted&token=${loginData.tokenId}`;
            } else {
                if ($rootScope.authType === 'global') {
                    data = `grant_type=${$rootScope.authType}&username=${loginData.userName}&password=${loginData.password}`;
                } else {
                    data = `grant_type=${$rootScope.authType}&username=${loginData.userName}&password=${loginData.password}&portal=${$rootScope.portalId}`;
                }
            }

            var logonHeaders = {
                'Authorization': `Basic ${$rootScope.clientAppId}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            };

            var deferred = $q.defer();

            $http.post($rootScope.serviceBase + '/connect/token', data, { headers: logonHeaders }).success(function (response) {

                $http.get($rootScope.serviceBase + '/connect/userinfo', { headers: { 'Authorization': 'Bearer ' + response.access_token } }).success(function (userInfoResponse) {
                    $sessionStorage.$reset();
                    var expiryDate = new Date();
                    expiryDate.setSeconds(expiryDate.getSeconds() + response.expires_in);

                    var roles = [];
                    if ($rootScope.authType === 'global') {
                        roles.push('Trader');
                        roles.push('RealTimeData');
                    } else {
                        if (angular.isDefined(userInfoResponse.role)) {
                            if (angular.isArray(userInfoResponse.role)) {
                                roles = userInfoResponse.role;
                            } else {
                                if (userInfoResponse.role.length > 0) {
                                    roles.push(userInfoResponse.role);
                                }
                            }
                        }
                    }

                    $sessionStorage.authData = { "token": response.access_token, "userName": userInfoResponse.name, "roles": roles, "expiry": expiryDate };

                    var username = loginData.userName;
                    if (angular.isDefined(userInfoResponse.name) && userInfoResponse.name !== null && userInfoResponse.name !== '') {
                        username = userInfoResponse.name;
                    }

                    _authentication.isAuth = true;
                    _authentication.userName = username;
                    _authentication.expiry = expiryDate;

                    angular.forEach(roles, function (value) {
                        this.push(value);
                    }, _authentication.roles);

                    _checkRoles();

                    deferred.resolve(response);
                }).error(function (err, status) {
                    _logOut();
                    deferred.reject(err);
                });
            }).error(function (err, status) {
                _logOut();
                deferred.reject(err);
            });

            return deferred.promise;

        };

        var _logOut = function () {
            $sessionStorage.$reset();
            _authentication.isAuth = false;
            _authentication.userName = "";
            _authentication.roles = [];
            _authentication.expiry = null;
        };

        var _fillAuthData = function () {
            var authData;
            if (angular.isDefined(NTACT) && NTACT !== '') {
                $sessionStorage.$reset();
                $sessionStorage.authData = { "token": NTACT.access_token, "userName": '', "roles": NTACT.roles };
            }
            authData = $sessionStorage.authData;
            if (authData) {
                _authentication.isAuth = true;
                _authentication.userName = authData.userName;
                if (angular.isDefined(authData.roles)) {
                    angular.forEach(authData.roles, function (value) {
                        this.push(value);
                    }, _authentication.roles);
                } else {
                    _authentication.roles = [];
                }
                _authentication.expiry = authData.expiry;
                _checkRoles();
            }
        };

        var _checkRoles = function () {
            //Check if the user has trading permissions
            if (angular.isDefined(_authentication) && _authentication.roles) {
                if (_authentication.roles.indexOf('Trader') > -1) {
                    $rootScope.isTrader = true;
                } else {
                    $rootScope.isTrader = false;
                }
            } else {
                $rootScope.isTrader = false;
            }
        };

        authServiceFactory.saveRegistration = _saveRegistration;
        authServiceFactory.login = _login;
        authServiceFactory.logOut = _logOut;
        authServiceFactory.fillAuthData = _fillAuthData;
        authServiceFactory.authentication = _authentication;

        return authServiceFactory;
    }]);