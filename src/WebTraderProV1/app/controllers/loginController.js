/* global angular: false */
/* global app: false */
'use strict';
app.controller('loginController', ['$scope', '$location', '$log', 'authService', 'ntDataStore',
    function ($scope, $location, $log, authService, ntDataStore) {
        $scope.loginData = {
            userName: "",
            password: ""
        };

        $scope.loginText = "Login";
        $scope.message = "";

        $scope.login = function () {
            $scope.message = '';
            $scope.loginText = "Validating...please wait";
            authService.login($scope.loginData).then(function (response) {
                ntDataStore.init();
                $location.path('/dashboard');
                $scope.loginData.password = '';
                $scope.loginText = "Login";
            }, function (err) {
                $scope.loginText = "Login";
                $scope.loginData.password = '';
                if (err !== '') {
                    $scope.message = err.error_description;
                } else {
                    $scope.message = "Could not communicate to server, please contact the web administrator.";
                }                
            });
        };
    }]);