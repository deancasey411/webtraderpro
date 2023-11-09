/* global angular: false */
/* global app: false */
'use strict';
app.controller('fixdashboardController', ['$scope', '$location', '$rootScope', 'authService', 'ntDataStore',
    function ($scope, $location, $rootScope, authService, ntDataStore) {
        $scope.dataStore = ntDataStore;
        $scope.global = $rootScope;

        if (!authService.authentication.isAuth) {
            $location.path('/home');
        }
    }]);
