/* global angular: false */
/* global app: false */
'use strict';
app.controller('orderentryController', ['$scope', '$rootScope', '$http', '$log', '$modalInstance', '$filter', 'toaster', 'ntDataStore', 'authService', 'orderDetails', 'ntLightstreamer',
    function ($scope, $rootScope, $http, $log, $modalInstance, $filter, toaster, ntDataStore, authService, orderDetails, ntLightstreamer) {
        $scope.dataStore = ntDataStore;
        $scope.lightStreamer = ntLightstreamer;
        $scope.orderDetails = orderDetails;
        $scope.global = $rootScope;
        $scope.message = '';
        $scope.disableButtons = false;
        $scope.calculateOrderCosts = false;

        if (!angular.isDefined($scope.dataStore.tradingAccounts)) {
            var url = '/api/orderrouting/accounts?PageSize=999999&IncludeServerCount=false';
            $http.get(`${$rootScope.serviceBase}${url}`).success(function (data) {
                if (angular.isDefined(data.items)) {
                    $scope.dataStore.tradingAccounts = data.items;
                    var account = $filter('filter')($scope.dataStore.tradingAccounts, function (d) { return d.active && d.fixSession === $scope.orderDetails.FixSession; })[0];
                    if (account !== null) {
                        $scope.dataStore.tradingAccount = account;
                    }
                }
            }).error(function (data, status, headers, config) {
                $scope.dataStore.tradingAccounts = null;
                var logInfo = {
                    message: data || "Failed to get trading accounts list.",
                    status: status,
                    url: config.url
                };
                $log.error(angular.toJson(logInfo));
            });
        } else {
            if ($scope.dataStore.tradingAccounts.length === 1) {
                var account = $filter('filter')($scope.dataStore.tradingAccounts, function (d) { return d.active && d.fixSession === $scope.orderDetails.FixSession; })[0];
                if (account !== null) {
                    $scope.dataStore.tradingAccount = account;
                }
            }
        }

        $scope.instrument = null;

        var InstrumentTemplate = function (pesk) {
            this.pesk = pesk;
            this.Symbol = '';
            this.BS1 = '';
            this.B1 = '';
            this.A1 = '';
            this.AS1 = '';
            this.LTP = '';
            this.H = '';
            this.L = '';
            this.Chg = '';
        };

        if (angular.isDefined($scope.dataStore.tradingAccount) && $scope.dataStore.tradingAccount.fixSession !== $scope.orderDetails.FixSession) {
            $scope.dataStore.tradingAccount = '';
        }

        //Subscribe to lighstreamer
        var subscribe = function () {
            var newPesk = $scope.orderDetails.PESK.split(' ').join('_');
            $scope.lightStreamer.subscribeOrderEntry(newPesk, function (info) {
                if (info !== null) {
                    var newPesk = $scope.orderDetails.PESK.split(' ').join('_');
                    if (newPesk !== info.getItemName()) {
                        return;
                    }
                    info.forEachChangedField(function (fieldName, fieldPos, val) {
                        $scope.instrument[fieldName] = val;
                    });
                    //Tell AngularJS to update the required bindings
                    $scope.$digest();
                }
            });
        };

        $scope.getInstruments = function (val) {
            var url = $rootScope.serviceBase + `/api/OrderRouting/FixSessions/${$scope.orderDetails.FixSession}/Instruments?PageSize=20&Page=1&Search=${encodeURIComponent(val)}&IsSearching=true&IncludeServerCount=false&activeOnly=true`;
            return $http({
                method: 'GET',
                url: url
            }).then(function successCallback(response) {
                if (angular.isDefined(response.data.items)) {
                    return response.data.items;
                } else {
                    return [];
                }
            }, function errorCallback(response) {
                console.log(response);
                return [];
            });
        };

        //When user changes instrument make sure you update the 
        $scope.onInstrumentChange = function ($item, $model, $label) {
            $scope.lightStreamer.clearOESubscriptions();
            $scope.orderDetails.Instrument = $item;
            $scope.orderDetails.TESK = $item.tradingExchangeSymbolKey;
            $scope.orderDetails.Symbol = $item.symbol;
            $scope.instrument = new InstrumentTemplate($item.publicExchangeSymbolKey);
            if (angular.isDefined($item.publicExchangeSymbolKey) && $item.publicExchangeSymbolKey !== '') {
                $scope.orderDetails.PESK = $item.publicExchangeSymbolKey;
                subscribe();
            }
        };

        //Subscribe to Lighstreamer
        if (angular.isDefined($scope.orderDetails.PESK) && $scope.orderDetails.PESK !== '') {
            $scope.instrument = new InstrumentTemplate($scope.orderDetails.PESK);
            subscribe();
        }

        if (angular.isDefined($scope.orderDetails.Price) && $scope.orderDetails.Price === 0) {
            $scope.orderDetails.Price = null;
        }

        //This is only used to convert a 'B' to a 'OL' and so on for the templates that user OL, CL, OS, CS
        //This is called by the ng-init directive on the view template
        $scope.configureOrderEntry = function (changeSides, orderCosts) {
            if (changeSides) {
                if ($scope.orderDetails.Side === 'B') {
                    $scope.orderDetails.Side = 'OL';
                } else if ($scope.orderDetails.Side === 'S') {
                    $scope.orderDetails.Side = 'OS';
                }
            }
            $scope.calculateOrderCosts = orderCosts;
        };

        $scope.updatePrice = function () {
            if ($scope.orderDetails.OrderType === 'MO' || $scope.orderDetails.OrderType === 'SO') {
                $scope.orderDetails.Price = 0;
                scope.orderDetails.TriggerPrice = null;
            } else {
                if ($scope.orderDetails.OrderType === 'SL') {
                    $scope.orderDetails.TIF = 'GTC';
                }
                if ($scope.orderDetails.OrderType === 'LO') {
                    $scope.orderDetails.TriggerPrice = null;
                }
                if ($scope.orderDetails.Price === 0) {
                    $scope.orderDetails.Price = null;
                }
            }
        };

        $scope.viewOrderDetails = function () {
            $scope.orderConfirmation = false;
            $scope.orderCosts = null;
        };

        $scope.viewConfirmation = function (isValid) {
            $scope.orderCosts = null;
            if (isValid) {
                $scope.orderConfirmation = true;

                var costDetails = {
                    "fixSession": $scope.dataStore.tradingAccount.fixSession,
                    "account": $scope.dataStore.tradingAccount.account,
                    "tradingExchangeSymbolKey": $scope.orderDetails.Instrument.tradingExchangeSymbolKey,
                    "currency": $scope.orderDetails.Instrument.Currency,
                    "price": $scope.orderDetails.Price,
                    "quantity": $scope.orderDetails.Quantity,
                    "side": $scope.orderDetails.Side
                };

                if ($scope.calculateOrderCosts) {
                    $http.post($rootScope.serviceBase + '/api/orderrouting/orders/cost', costDetails).success(function (data) {
                        $scope.orderCosts = data;
                    }).error(function (data, status, headers, config) {
                        $scope.orderCosts = '';
                        var logInfo = {
                            message: data || "An error has occured while loading order costs",
                            status: status,
                            url: config.url
                        };
                        $log.error(angular.toJson(logInfo));
                    });
                }
            } else {
                $scope.orderConfirmation = false;
            }
        };

        $scope.submitOrder = function (isValid) {
            //Check to make sure the user hasn't already clicked submit order
            try {
                if (isValid) {
                    if ($scope.disableButtons) {
                        return;
                    }
                    $scope.message = '';
                    $scope.disableButtons = true;

                    var newOrderDetails = {
                        "fixSession": $scope.dataStore.tradingAccount.fixSession,
                        "side": $scope.orderDetails.Side,
                        "price": $scope.orderDetails.Price,
                        "exchange": $scope.orderDetails.Instrument.exchange,
                        "exchangeSymbolKey": $scope.orderDetails.Instrument.tradingExchangeSymbolKey,
                        "symbol": $scope.orderDetails.Instrument.symbol,
                        "quantity": $scope.orderDetails.Quantity,
                        "account": $scope.dataStore.tradingAccount.account,
                        "orderType": $scope.orderDetails.OrderType,
                        "timeInForce": $scope.orderDetails.TIF,
                        "expiry": $scope.orderDetails.Expiry,
                        "notes": $scope.orderDetails.Notes,
                        "additionalFields": {}
                    };

                    if ($scope.orderDetails.TriggerPrice !== null) {
                        newOrderDetails.additionalFields['StopPx'] = $scope.orderDetails.TriggerPrice;
                    }

                    if (newOrderDetails.Expiry === '') {
                        newOrderDetails.Expiry = new Date();
                        newOrderDetails.Expiry.setHours(18, 0, 0, 0);
                    }

                    var logInfo = {
                        message: "Submit new order was clicked.",
                        orderDetails: newOrderDetails
                    };

                    $log.info(angular.toJson(logInfo));

                    $http.post($rootScope.serviceBase + '/api/orderrouting/orders', newOrderDetails).success(function (data, status, headers, config) {
                        var logInfo = {
                            message: data,
                            status: status,
                            url: config.url
                        };
                        if (data) {
                            if (data.success) {
                                $log.info(angular.toJson(logInfo));
                                toaster.pop('success', "New order successful", "New order successfully placed.", 5000);
                                $scope.cancel();
                            } else {
                                $scope.disableButtons = false;
                                $log.info(angular.toJson(logInfo));
                                $scope.message = data.errors[0];
                            }
                        }
                    }).error(function (data, status, headers, config) {
                        $scope.disableButtons = false;
                        $scope.message = "Please contact the web administrator as an error has occurred. Message: " + data.Message;
                        //toaster.pop('error', "New Order Error!", "Please contact the web administrator as an error has occurred while trying to submit your new order.", 5000);
                        var logInfo = {
                            message: data || "An error has occured while submitting a new order!",
                            status: status,
                            url: config.url
                        };
                        $log.error(angular.toJson(logInfo));
                    });
                } else {
                    $scope.message = 'Form validation error. Please make sure all fields have been filled in.';
                }
            } catch (e) {
                $scope.message = "Please contact the web administrator as an error has occurred. " + e.message;
                $scope.disableButtons = false;
                $log.error(e.message);
            }
        };

        $scope.cancel = function () {
            //Clear the order entry lightstreamer subscriptions
            $scope.lightStreamer.clearOESubscriptions();
            $modalInstance.dismiss('cancel');
        };
    }]);
