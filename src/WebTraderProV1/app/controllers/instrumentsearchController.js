/* global angular: false */
/* global app: false */
'use strict';
app.controller('instrumentsearchController', ['$scope', '$rootScope', '$log', '$http', '$modalInstance', 'ntDataStore', 'searchAction',
    function ($scope, $rootScope, $log, $http, $modalInstance, ntDataStore, searchAction) {
        var instrumentDetails = function (pesk, symbol, name) {
            this.pesk = pesk;
            this.symbol = symbol;
            this.name = name;
        };

        $scope.loading = false;
        $scope.dataStore = ntDataStore;
        $scope.instruments = [];
        $scope.options = {};
        $scope.options.action = searchAction.action;
        $scope.searchstring = searchAction.searchString;

        $scope.doAction = function (action, pesk, symbol, name) {
            $modalInstance.close(new instrumentDetails(pesk, symbol, name));
        };

        $scope.close = function () {
            $modalInstance.dismiss('cancel');
        };

        $scope.searchInstruments = function () {
            $scope.loading = true;
            var instrumentTypes = '!I';
            if ($scope.options.action === 'IWL') {
                instrumentTypes = "I";
            }
            var url = $rootScope.serviceBase + `/api/marketdata/instruments?search=${encodeURIComponent($scope.searchstring)}&PageSize=999999&IncludeServerCount=false&Type=${encodeURIComponent(instrumentTypes)}`;
            $http.get(url).success(function (data) {
                if (data && data.items) {
                    $scope.instruments = data.items;
                } else {
                    $scope.instruments = [];
                }
                $scope.loading = false;
            }).error(function (data, status, headers, config) {
                $scope.loading = false;
                $scope.instruments = [];
                var logInfo = {
                    message: data || "Failed to get trading instruments list.",
                    status: status,
                    url: config.url
                };
                $log.error(angular.toJson(logInfo));
            });

            //$scope.instruments.sort(function (a, b) {
            //    return a.Symbol.length - b.Symbol.length; // ASC -> a - b; DESC -> b - a
            //});
        };

        $scope.searchInstruments();
    }]);
