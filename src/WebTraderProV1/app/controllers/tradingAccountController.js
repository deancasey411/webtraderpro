/* global angular: false */
/* global app: false */
'use strict';
app.controller('tradingAccountController', ['$scope', '$rootScope', '$http', 'ntDataStore',
    function ($scope, $rootScope, $http, ntDataStore) {
        $scope.dataStore = ntDataStore;
        $scope.global = $rootScope;
        $scope.Math = window.Math;

        $scope.handleTradingAccountChanged = function () {
            $scope.dataStore.broadcastTradingAccount();
        };

        if (!angular.isDefined($scope.dataStore.tradingAccounts)) {
            var url = '/api/orderrouting/accounts?PageSize=999999&IncludeServerCount=false';
            $http.get(`${$rootScope.serviceBase}${url}`).success(function (data) {
                if (angular.isDefined(data.items)) {
                    $scope.dataStore.tradingAccounts = data.items;
                    if ($scope.dataStore.tradingAccounts !== null && $scope.dataStore.tradingAccounts.length > 0) {
                        $scope.dataStore.tradingAccount = $scope.dataStore.tradingAccounts[0];
                        $scope.handleTradingAccountChanged();
                    }
                }
            })
            .error(function (data, status) {
                $scope.dataStore.tradingAccounts = undefined;
                $log.error("Status: " + status + "Message: " + data || "Failed to get trading accounts.");
            });
        } else {
            if (!angular.isDefined($scope.dataStore.tradingAccount) || $scope.dataStore.tradingAccount === null) {
                if ($scope.dataStore.tradingAccounts !== null && $scope.dataStore.tradingAccounts.length > 0) {
                    $scope.dataStore.tradingAccount = $scope.dataStore.tradingAccounts[0];
                    $scope.handleTradingAccountChanged();
                }
            }
        }
    }]);