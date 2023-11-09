/* global angular: false */
/* global app: false */
'use strict';
app.controller('orderbookController', ['$scope', '$rootScope', '$http', '$log', '$location', '$timeout', '$modal', 'toaster', 'ntDataStore', 'authService',
    function ($scope, $rootScope, $http, $log, $location, $timeout, $modal, toaster, ntDataStore, authService) {
        $scope.dataStore = ntDataStore;

        if (!authService.authentication.isAuth) {
            $location.path('/login');
        }

        if (!angular.isDefined($scope.dataStore.orderbook)) {
            $scope.dataStore.orderbook = [];
        }

        $scope.$on('handleTradingAccountChanged', function () {
            if ($scope.dataStore.tradingAccount !== null) {
                $scope.getOrderbook();
            }
        });

        if (!angular.isDefined($scope.dataStore.openOrdersOnly)) {
            $scope.dataStore.openOrdersOnly = true;
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

                            var logInfo = {
                                message: "Cancel order was clicked.",
                                orderDetails: obr.NutcrackerOrderId
                            };

                            $log.info(angular.toJson(logInfo));
                            $http.delete($rootScope.serviceBase + `/api/orderrouting/orders/${obr.nutcrackerOrderId}`).success(function (data, status, headers, config) {
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
                toaster.pop('error', "Cancel Order Error!", "Please contact the web administrator as an error has occurred while trying to cancel your order.", 5000);
                $log.error(e.message);
            }
        };

        $scope.getOrderbook = function () {
            var accountId = $scope.dataStore.tradingAccount.accountId;
            var openOrdersOnly = $scope.dataStore.openOrdersOnly;

            if (angular.isDefined(accountId)) {
                var url = $rootScope.serviceBase + `/api/orderrouting/accounts/${accountId}/orders?activeOnly=${openOrdersOnly}&PageSize=9999&Page=1&IncludeServerCount=false`;
                $http.get(url).success(function (data) {
                    $scope.orderBookCallback(accountId, data);
                }).error(function (data, status, headers, config) {
                    $scope.dataStore.orderbook = [];
                    var logInfo = {
                        message: data || "An error has occured while getting the orderbook!",
                        status: status,
                        url: config.url
                    };
                    $log.error(angular.toJson(logInfo));
                });
            }
        };

        $scope.orderBookCallback = function (accountId, data) {
            var id = $scope.dataStore.tradingAccount.accountId;
            if (id === accountId) {
                $scope.dataStore.orderbook = data.items;
                $scope.dataStore.obLastUpdated = new Date();
            }
        };

        if (angular.isDefined($scope.dataStore.tradingAccount) && $scope.dataStore.tradingAccount !== null) {
            $scope.getOrderbook();
        }
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