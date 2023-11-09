/* global angular: false */
/* global app: false */
'use strict';
app.controller('tradesbookController', ['$scope', '$rootScope', '$http', '$log', 'ntDataStore', 'authService',
    function ($scope, $rootScope, $http, $log, ntDataStore, authService) {
        $scope.dataStore = ntDataStore;

        if (!angular.isDefined($scope.dataStore.tradesbook)) {
            $scope.dataStore.tradesbook = [];
        }

        $scope.$on('handleTradingAccountChanged', function () {
            if ($scope.dataStore.tradingAccount !== null) {
                $scope.getTradesbook();
            }
        });

        $scope.convertSide = function (orderSide) {
            switch (orderSide) {
                case "B":
                    return "Buy";
                case "S":
                    return "Sell";
                case "OL":
                    return "Open Long";
                case "CL":
                    return "Close Long";
                case "OS":
                    return "Open Short";
                case "CS":
                    return "Close Short";
                default:
                    return orderSide;
            }
        };

        $scope.getTradesbook = function () {
            var accountId = $scope.dataStore.tradingAccount.accountId;

            if (angular.isDefined(accountId)) {
                $http.get($rootScope.serviceBase + `/api/orderrouting/accounts/${accountId}/trades?PageSize=999&IncludeServerCount=false`).success(function (data) {
                    $scope.tradesBookCallback(accountId, data);
                }).error(function (data, status, headers, config) {
                    $scope.dataStore.tradesbook = [];
                    var logInfo = {
                        message: data || "An error has occured while getting the tradesbook!",
                        status: status,
                        url: config.url
                    };
                    $log.error(angular.toJson(logInfo));
                });
            }  
        };

        $scope.tradesBookCallback = function (accountId, data) {
            var id = $scope.dataStore.tradingAccount.accountId;
            if (id === accountId) {
                $scope.dataStore.tradesbook = data.items;
                $scope.dataStore.tbLastUpdated = new Date();
            }
        };

        if ((angular.isDefined($scope.dataStore.tradingAccount)) && ($scope.dataStore.tradingAccount !== null)) {
            $scope.getTradesbook();
        }
    }]);
