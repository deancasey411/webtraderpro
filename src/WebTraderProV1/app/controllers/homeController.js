/* global angular: false */
/* global app: false */
'use strict';
app.controller('homeController', ['$scope', '$location', '$rootScope', 'authService',
    function ($scope, $location, $rootScope, authService) {
        $scope.global = $rootScope;
        if (authService.authentication.isAuth) {
            $location.path('/dashboard');
        }
    }]);