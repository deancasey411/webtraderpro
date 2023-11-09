/* global angular: false */
/* global app: false */
'use strict';
app.controller('positionsController', ['$scope', '$rootScope', '$http', '$modal', '$log', 'toaster', 'ntDataStore',
    function ($scope, $rootScope, $http, $modal, $log, toaster, ntDataStore) {
        $scope.dataStore = ntDataStore;

        if (!angular.isDefined($scope.dataStore.positions)) {
            $scope.dataStore.positions = [];
        }

        $scope.$on('handleTradingAccountChanged', function () {
            if ($scope.dataStore.tradingAccount !== null) {
                $scope.getPositions();
            }
        });
        
        $scope.getPositions = function () {
            $scope.dataStore.positions = [];
            $scope.dataStore.psLongExposure = 0.00;
            $scope.dataStore.psShortExposure = 0.00;

            var accountId = $scope.dataStore.tradingAccount.accountId;
            if (angular.isDefined(accountId)) {
                $http.get($rootScope.serviceBase + `/api/orderrouting/accounts/${accountId}/positions?PageSize=999&IncludeServerCount=false`).success(function (data) {
                    $scope.positionsCallback(accountId, data);
                })
                    .error(function () {
                        $scope.dataStore.positions = [];
                        $scope.error = "An Error has occured while loading positions!";
                    });
            }
        };

        $scope.positionsCallback = function (accountId, data) {
            var id = $scope.dataStore.tradingAccount.accountId;
            if (id === accountId) {
                if (data !== null && data.items.length > 0) {
                    $scope.dataStore.positions = data.items;
                    $scope.dataStore.posLastUpdated = new Date();
                    angular.forEach(data.items, function (item) {
                        if (item.close > 0) {
                            $scope.dataStore.psLongExposure = $scope.dataStore.psLongExposure + item.exposure;
                        } else if (item.ClosePos < 0) {
                            $scope.dataStore.psShortExposure = $scope.dataStore.psShortExposure + item.exposure;
                        }
                    });
                }
            }
        };

        $scope.newOrderFromPos = function (posItem) {
            try {
                if ($rootScope.isTrader) {
                    var od = new $rootScope.OrderDetails('', 0, '');
                    var tradableInstrument = $scope.dataStore.pvtInstrumentsLookupKey[posItem.ExchangeSymbolKey];
                    if (!angular.isDefined(tradableInstrument)) {
                        throw new Error("Cannot find a valid trading instrument or you do not have permissions to trade this instrument.");
                    }
                    od.FixSession = tradableInstrument.FixSession;
                    od.Instrument = tradableInstrument;
                    od.Symbol = tradableInstrument.Symbol;
                    od.PESK = tradableInstrument.PESK;
                    if (!(angular.isDefined(od.FixSession) && (od.FixSession !== ''))) {
                        throw new Error("Tradable instrument has an invalid fix session.");
                    }
                    var mapping = $rootScope.mappings[od.FixSession];
                    if (!angular.isDefined(mapping)) {
                        throw new Error("Cannot find mapping for fix session : " + od.FixSession);
                    }
                    var modalInstance = $modal.open({
                        templateUrl: 'app/templates/' + mapping.page,
                        controller: mapping.controller,
                        backdrop: 'static',
                        resolve: {
                            orderDetails: function () {
                                return od;
                            }
                        }
                    });
                }
            } catch (e) {
                toaster.pop('warning', "Warning!", e.message, 5000);
                $log.error(e.message);
            }
        };

        if ((angular.isDefined($scope.dataStore.tradingAccount)) && ($scope.dataStore.tradingAccount !== null)) {
            $scope.getPositions();
        }
    }]);
