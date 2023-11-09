/* global angular: false */
/* global app: false */
'use strict';
app.controller('positionsSummaryController', ['$scope', '$rootScope', '$http', '$log', 'ntDataStore',
    function ($scope, $rootScope, $http, $log, ntDataStore) {
        $scope.dataStore = ntDataStore;
        $scope.global = $rootScope;
        $scope.dataStore.isCollapsed = true;
        $scope.Math = window.Math;

        if (!angular.isDefined($scope.dataStore.positionsSummary)) {
            $scope.dataStore.positionsSummary = [];
        }

        $scope.$on('handleTradingAccountChanged', function () {
            if ($scope.dataStore.tradingAccount !== null) {
                $scope.getPositionSummary();
            }
        });

        $scope.shouldBold = function (item) {
            if (item !== null) {
                return (item.category === 'Balance B/F' && item.source === 'All') ||
                    (item.category === 'Trade Today' && item.details === 'Intraday Available Cash Movement') ||
                    (item.category === 'Trade Today' && item.source === 'Total') ||
                    (item.category === 'Final' && item.details === 'Intraday Available Cash') ||
                    (item.category === 'Final' && item.details === 'Portfolio Value');
            } else {
                return false;
            }
        };

        $scope.getPositionSummary = function () {
            $scope.dataStore.positionsSummary = [];
            $scope.dataStore.psAvailableCash = 0.00;
            $scope.dataStore.psPortfolioValue = 0.00;

            var accountId = $scope.dataStore.tradingAccount.accountId;
            if (angular.isDefined(accountId)) {

                var url = $rootScope.serviceBase + `/api/orderrouting/accounts/${accountId}/positionsummary`;

                $http({
                    method: 'GET',
                    url: url
                }).then(function successCallback(response) {
                    if (angular.isDefined(response.data.items)) {
                        $scope.dataStore.positionsSummary = response.data;
                        angular.forEach(response.data.items, function (item) {
                            if (item.details === "Intraday Available Cash") {
                                $scope.dataStore.psAvailableCash = item.value;
                            }
                            if (item.category === "Final" && item.details === "Portfolio Value") {
                                $scope.dataStore.psPortfolioValue = item.value;
                            }
                            if (item.details === "Fees") {
                                item.Source = "Total";
                            }
                        });
                    }
                }, function errorCallback(response) {
                    $log.error("Status: " + response.error + "Message: " + response.details || "Failed to get positions summary.");
                });
            }
        };

        if (angular.isDefined($scope.dataStore.tradingAccount) && $scope.dataStore.tradingAccount !== null) {
            $scope.getPositionSummary();
        }
    }]);
