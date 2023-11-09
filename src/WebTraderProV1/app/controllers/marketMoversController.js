/* global angular: false */
/* global app: false */
'use strict';
app.controller('marketMoversController', ['$scope', '$rootScope', '$q', '$http', '$log', '$location', '$interval', 'ntDataStore', 'authService',
    function ($scope, $rootScope, $q, $http, $log, $location, $interval, ntDataStore, authService) {
        //----------------------------------------------------------------------------------------
        //This is not the norm for controlllers but this controller is generic and
        //is used for 5 different market mover types (Gainers, Losers, Value, Volume and Trades)
        //which all use this controller and the marketmovers.html view
        //----------------------------------------------------------------------------------------
        //To initialize this a ng-init directive is needed in the view
        //ng-init="init('Up','Up')"

        $scope.dataStore = ntDataStore;

        if (!authService.authentication.isAuth) {
            $location.path('/login');
        }

        $scope.init = function (storeKey, moversType, exchange) {
            //This function is sort of a private constructor for the controller
            $scope.storeKey = storeKey;
            $scope.moversType = moversType;
            $scope.exchange = exchange;

            if (!angular.isDefined($scope.dataStore[storeKey])) {
                $scope.dataStore[storeKey] = [];
                $scope.marketMovers = [];

                $q.when($http.get($rootScope.serviceBase + `/api/marketdata/exchanges/${$scope.exchange}/movers?InstrumentType=E&MoverType=${$scope.moversType}&PageSize=10&IncludeServerCount=false`))
                    .then(function (result) {
                        if (angular.isDefined(result) && angular.isDefined(result.data) && angular.isDefined(result.data.items)) {
                            $scope.dataStore[storeKey] = result.data.items;
                            $scope.marketMovers = result.data.items;
                        } else {
                            $scope.dataStore[storeKey] = [];
                            $scope.marketMovers = [];
                        }
                        $scope.dataStore.mmLastUpdated = new Date();
                    }, function (result) {
                        var logInfo = {
                            message: data || "An error has occured while loading market movers!",
                            status: result.status,
                            url: result.config.url
                        };
                        $log.error(angular.toJson(logInfo));
                    });
            } else {
                $scope.marketMovers = $scope.dataStore[storeKey];
            }
        };

        var marketMoversTimer;
        $scope.startTime = function () {
            marketMoversTimer = $interval(function () {
                $q.when($http.get($rootScope.serviceBase + `/api/marketdata/exchanges/${$scope.exchange}/movers?InstrumentType=E&MoverType=${$scope.moversType}&PageSize=10&IncludeServerCount=false`))
                    .then(function (result) {
                        if (angular.isDefined(result) && angular.isDefined(result.data) && angular.isDefined(result.data.items)) {
                            $scope.dataStore[$scope.storeKey] = result.data.items;
                            $scope.marketMovers = result.data.items;
                        } else {
                            $scope.dataStore[$scope.storeKey] = [];
                            $scope.marketMovers = [];
                        }
                        $scope.dataStore.mmLastUpdated = new Date();
                    }, function (result) {
                        var logInfo = {
                            message: result || "An error has occured while loading market movers!",
                            status: result.status,
                            url: result.config.url
                        };
                        $log.error(angular.toJson(logInfo));
                    });
            }, 60000);
        };

        $scope.navstockInfo = function (pesk, symbol, name) {
            $scope.dataStore.siPesk = pesk;
            $scope.dataStore.siSymbol = symbol;
            $scope.dataStore.siName = name;
            $scope.dataStore.broadcastStockInfo();
        };

        $scope.startTime();

        // When the controller gets destroyed, remove the WL subscriptions.
        $scope.$on("$destroy", function () {
            if (angular.isDefined(marketMoversTimer)) {
                $interval.cancel(marketMoversTimer);
                marketMoversTimer = undefined;
            }
        });
    }]);
