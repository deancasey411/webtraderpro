/// <reference path="../pages/dashboard.html" />
/// <reference path="../pages/dashboard.html" />
/* global angular: false */
/* global app: false */
'use strict';
app.controller('navigationController', ['$scope', '$rootScope', '$location', '$window', '$document', '$modal', 'authService', 'ntDataStore',
    function ($scope, $rootScope, $location, $window, $document, $modal, authService, ntDataStore) {

        $scope.global = $rootScope;
        $scope.dataStore = ntDataStore;

        $scope.getlsStatus = function () {
            switch ($scope.global.lsStatus) {
                case "Connected - Live Feed":
                case "Connected - Delayed Feed":
                    return 'btn-success';
                case "Connecting - Live Feed":
                case "Connecting - Delayed Feed":
                    return 'btn-warning';
                case "Disconnected - Live Feed":
                case "Disconnected - Delayed Feed":
                    return 'btn-danger';
                default:
                    return 'btn-info';
            }
        };

        $scope.orderEntryTypes = $rootScope.mappings;

        $scope.newOrder = function (oeMapping) {
            var od = new $rootScope.OrderDetails('', 0, '');
            od.FixSession = oeMapping.fixSession;
            var modalInstance = $modal.open({
                templateUrl: 'app/templates/' + oeMapping.page,
                controller: oeMapping.controller,
                backdrop: 'static',
                resolve: {
                    orderDetails: function () {
                        return od;
                    }
                }
            });
        };

        $scope.isIE = function () {
            //If IE then load the inject the glyphicons css
            if ($window.navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > 0) {
                var style = $document[0].createElement('link');
                style.rel = 'stylesheet';
                style.type = 'text/css';
                style.href = "//netdna.bootstrapcdn.com/bootstrap/3.0.0/css/bootstrap-glyphicons.css";
                $document[0].head.appendChild(style);
            }
        };

        $scope.isActive = function (path) {
            return $location.path().substr(0, path.length) === path;
        };

        $scope.logOut = function () {
            authService.logOut();
            $window.location.href = $rootScope.logoutPage;
        };

        $scope.authentication = authService.authentication;

        $scope.isIE();
    }]);