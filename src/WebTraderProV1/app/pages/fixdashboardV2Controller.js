/* global angular: false */
/* global app: false */
'use strict';
app.controller('fixdashboardV2Controller', ['$scope', '$rootScope', '$http', '$log', '$location', '$timeout', '$modal', 'toaster', 'ntDataStore', 'authService',
    function ($scope, $rootScope, $http, $log, $location, $timeout, $modal, toaster, ntDataStore, authService) {

        $scope.dataStore = ntDataStore;
        $scope.global = $rootScope;
        $scope.isCollapsed = true;
        $scope.Math = window.Math;

        if (!angular.isDefined($scope.dataStore.openOrdersOnly)) {
            $scope.dataStore.openOrdersOnly = true;
        }

        if (!authService.authentication.isAuth) {
            $location.path('/login');
        }

        if (!angular.isDefined($scope.dataStore.tradingAccounts)) {
            var url = '/api/orderrouting/accounts?PageSize=999999&IncludeServerCount=false';
            $http.get(`${$rootScope.serviceBase}${url}`).success(function (data) {
                if (angular.isDefined(data.items)) {
                    $scope.dataStore.tradingAccounts = data.items;
                    if ($scope.dataStore.tradingAccounts.length > 0) {
                        $scope.dataStore.tradingAccount = $scope.dataStore.tradingAccounts[0];
                        $scope.getData();
                    }
                }
            })
            .error(function (data, status) {
                $scope.dataStore.tradingAccounts = undefined;
                $log.error("Status: " + status + "Message: " + data || "Failed to get trading accounts.");
            });
        } else {
            if (!angular.isDefined($scope.dataStore.tradingAccount)) {
                if ($scope.dataStore.tradingAccounts.length > 0) {
                    $scope.dataStore.tradingAccount = $scope.dataStore.tradingAccounts[0];
                }
            }
        }

        if (!angular.isDefined($scope.dataStore.orderbook)) {
            $scope.dataStore.orderbook = [];
        }

        if (!angular.isDefined($scope.dataStore.tradesbook)) {
            $scope.dataStore.tradesbook = [];
        }

        if (!angular.isDefined($scope.dataStore.positions)) {
            $scope.dataStore.positions = [];
        }

        $scope.getOrderStatusClass = function (status) {
            switch (status) {
                case "New":
                case "Replaced(5)":
                case "PendingCancel(6)":
                case "Pending New (A)":
                case "Calculated(B)":
                case "AcceptedForBidding(D)":
                case "PendingReplace(E)":
                    return "order-status order-status-new";
                case "PartiallyFilled(1)":
                    return "order-status order-status-partial-fill";
                case "Filled(2)":
                    return "order-status order-status-filled";
                case "DoneForDay(3)":
                case "Cancelled(4)":
                case "Stopped(7)":
                case "Rejected(8)":
                case "Suspended(9)":
                case "Expired(C)":
                    return "order-status order-status-stopped";
                default:
                    break;
            }
        };

        $scope.getInstructionStatusClass = function (status) {
            switch (status) {
                case "P:New Instruction":
                case "PN:Pending New":
                case "PX:Pending Cancel":
                case "PE:Pending Edit":
                case "IN:New Order In Process":
                case "IC:Cancel in Progress":
                case "IE:Edit in Progress":
                    return "instruction-status instruction-status-new";
                case "AA:Awaiting Authorisation":
                case "FWD:Forward To Supervisor":
                case "AIP:Authorisation in Progress":
                case "PEX:Pending Exchange":
                    return "instruction-status instruction-status-supervisor";
                case "A:Accepted":
                    return "instruction-status instruction-status-accepted";
                case "R:Rejected":
                case "C:Cancelled":
                    return "instruction-status instruction-status-rejected";
                default:
                    break;
            }
        };

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

        $scope.convertType = function (orderType) {
            switch (orderType) {
                case "LO":
                    return "Limit Order";
                case "MO":
                    return "Market Order";
                case "SL":
                    return "Stop Limit";
                case "SO":
                    return "Stop Order";
                default:
                    return orderType;
            }
        };

        $scope.convertLifeTime = function (orderLifeTime) {
            switch (orderLifeTime) {
                case "GFD":
                    return "Day Order";
                case "GTC":
                    return "Good til Cancel";
                default:
                    return orderLifeTime;
            }
        };

        $scope.cancelOrder = function (obr) {
            try {
                if ($rootScope.isTrader) {

                    var modalInstance = $modal.open({
                        templateUrl: 'app/templates/cancelOrder.html?',
                        controller: 'cancelOrderController',
                        backdrop: 'static',
                        resolve: {
                            items: function () {
                                return $scope.items;
                            }
                        }
                    });

                    modalInstance.result.then(function (result) {
                        if (result) {
                            var coi = {
                                "FixSession": obr.FIXSession,
                                "CurrentUser": obr.CurrentUser,
                                "OriginalUser": obr.OriginalUser,
                                "NutOrderId": obr.NutcrackerOrderId,
                                "InstructionId": obr.CurrentUpdateId
                            };

                            var logInfo = {
                                message: "Cancel order was clicked.",
                                orderDetails: coi
                            };
                            $log.info(angular.toJson(logInfo));
                            $http.delete($rootScope.serviceBase + `/api/orderrouting/orders/${obr.NutcrackerOrderId}`).success(function (data, status, headers, config) {
                                var logInfo = {
                                    message: data,
                                    status: status,
                                    url: config.url
                                };
                                if (data) {
                                    if (data.success) {
                                        $log.info(angular.toJson(logInfo));
                                        toaster.pop('success', "Order cancel", "Your cancel order instruction was successfully sent.", 5000);
                                    } else {
                                        $log.error(angular.toJson(logInfo));
                                        toaster.pop('error', "Cancel Order Error!", "Please contact the web administrator as an error has occurred trying to cancel your order.", 5000);
                                    }
                                }
                                $timeout(function () {
                                    $scope.getOrderbook();
                                }, 1000);
                            }).error(function (data, status, headers, config) {
                                toaster.pop('error', "Cancel Order Error!", "Please contact the web administrator as an error has occurred while trying to cancel your order.", 5000);
                                var logInfo = {
                                    message: data || "An error has occured while cancelling an order!",
                                    status: status,
                                    url: config.url
                                };
                                $log.error(angular.toJson(logInfo));
                            });
                        }
                    });
                }
            } catch (e) {
                toaster.pop('error', "New Order Error!", "Please contact the web administrator as an error has occurred while trying to cancel your order.", 5000);
                $log.error(e.message);
            }
        };

        $scope.getOrderbook = function () {
            var accountId = $scope.dataStore.tradingAccount.accountId;
            var openOrdersOnly = $scope.dataStore.openOrdersOnly;
            $http.get($rootScope.serviceBase + `/api/orderrouting/accounts/${accountId}/orders?PageSize=999&IncludeServerCount=false&activeOnly=${openOrdersOnly}`).success(function (data) {
                $scope.dataStore.orderbook = data.items;
                $scope.dataStore.obLastUpdated = new Date();
            })
            .error(function (data, status, headers, config) {
                $scope.dataStore.orderbook = [];
                var logInfo = {
                    message: data || "An error has occured while getting the orderbook!",
                    status: status,
                    url: config.url
                };
                $log.error(angular.toJson(logInfo));
            });
        };

        $scope.getTradesbook = function () {
            var accountId = $scope.dataStore.tradingAccount.accountId;
            $http.get($rootScope.serviceBase + `/api/orderrouting/accounts/${accountId}/trades?PageSize=999&IncludeServerCount=false`).success(function (data) {
                $scope.dataStore.tradesbook = data.items;
                $scope.dataStore.tbLastUpdated = new Date();
            })
            .error(function (data, status, headers, config) {
                $scope.dataStore.tradesbook = [];
                var logInfo = {
                    message: "An error has occured while getting the tradesbook!",
                    status: status,
                    url: config.url
                };
                $log.error(angular.toJson(logInfo));
            });
        };

        $scope.shouldBold = function (item) {
            if (item !== null) {
                return (item.Period === 'Balance B/F' && item.Source === 'All') ||
                    (item.Period === 'Trade Today' && item.Details === 'Intraday Available Cash Movement') ||
                    (item.Period === 'Final' && item.Details === 'Intraday Available Cash') ||
                    (item.Period === 'Final' && item.Details === 'Portfolio Value');
            } else {
                return false;
            }
        };

        $scope.getPositionSummary = function () {
            var accountId = $scope.dataStore.tradingAccount.accountId;

            $http.get($rootScope.serviceBase + `/api/orderrouting/accounts/${accountId}/positionsummary`).success(function (data) {
                $scope.dataStore.positionsSummary = data;
                angular.forEach(data, function (item) {
                    if (item.Details === "Intraday Available Cash") {
                        $scope.dataStore.psAvailableCash = item.Cash;
                    }
                    if ((item.Period === "Final") && (item.Details === "Portfolio Value")) {
                        $scope.dataStore.psPortfolioValue = item.Value;
                    }
                });
                //$scope.dataStore.positionsSummaryV2 = getTreeForDueToAnalysis(data, "Id", "Pid");
            })
            .error(function (data, status) {
                $scope.dataStore.positionsSummary = [];
                //$scope.dataStore.positionsSummaryV2 = [];
                $log.error("Status: " + status + "Message: " + data || "Failed to get positions summary.");
            });
        };

        $scope.getPositions = function () {
            var accountId = $scope.dataStore.tradingAccount.accountId;

            $http.get($rootScope.serviceBase + `/api/orderrouting/accounts/${accountId}/positions?PageSize=999&IncludeServerCount=false`).success(function (data) {
                $scope.dataStore.positions = data.items;
                $scope.dataStore.posLastUpdated = new Date();

                angular.forEach(data, function (item) {
                    if (item.close > 0) {
                        $scope.dataStore.psLongExposure = $scope.dataStore.psLongExposure + item.exposure;
                    } else if (item.close < 0) {
                        $scope.dataStore.psShortExposure = $scope.dataStore.psShortExposure + item.exposure;
                    }
                });
            })
            .error(function () {
                $scope.dataStore.positions = [];
                $scope.error = "An Error has occured while loading positions!";
            });
        };

        $scope.getData = function () {
            $scope.dataStore.orderbook = [];
            $scope.dataStore.tradesbook = [];
            $scope.dataStore.positions = [];
            $scope.dataStore.positionsSummary = [];
            $scope.dataStore.psAvailableCash = 0.00;
            $scope.dataStore.psPortfolioValue = 0.00;
            $scope.dataStore.psLongExposure = 0.00;
            $scope.dataStore.psShortExposure = 0.00;
            if (angular.isDefined($scope.dataStore.tradingAccount) && $scope.dataStore.tradingAccount !== null) {
                $scope.getOrderbook();
                $scope.getTradesbook();
                if ($rootScope.showPositions) {
                    $scope.getPositions();
                    if ($rootScope.showPositionsSummary) {
                        $scope.getPositionSummary();
                    }
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

        $scope.getData();
    }]);

app.controller('cancelOrderController', ['$scope', '$log', '$modalInstance',
    function ($scope, $log, $modalInstance) {
        $scope.confirm = function () {
            $modalInstance.close(true);
        };
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);