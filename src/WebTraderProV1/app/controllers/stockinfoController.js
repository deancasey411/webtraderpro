/* global angular: false */
/* global app: false */
'use strict';
app.controller('stockinfoController', ['$scope', '$rootScope', '$http', '$log', '$modal', 'ntDataStore', 'ntLightstreamer',
    function ($scope, $rootScope, $http, $log, $modal, ntDataStore, ntLightstreamer) {
        $scope.dataStore = ntDataStore;
        $scope.lightStreamer = ntLightstreamer;
        $scope.$log = $log;

        var instrument = function (pesk, symbol, name) {
            this.pesk = pesk;
            this.Symbol = symbol;
            this.Name = name;

            //Depth
            this.BS1 = '';
            this.B1 = '';
            this.A1 = '';
            this.AS1 = '';
            this.BS2 = '';
            this.B2 = '';
            this.A2 = '';
            this.AS2 = '';
            this.BS3 = '';
            this.B3 = '';
            this.A3 = '';
            this.AS3 = '';

            // Last 5 Trades
            this.LTP1 = '';
            this.LTS1 = '';
            this.LTT1 = '';
            this.Chg1 = '';
            this.LTP2 = '';
            this.LTS2 = '';
            this.LTT2 = '';
            this.Chg2 = '';
            this.LTP3 = '';
            this.LTS3 = '';
            this.LTT3 = '';
            this.Chg3 = '';
            this.LTP4 = '';
            this.LTS4 = '';
            this.LTT4 = '';
            this.Chg4 = '';
            this.LTP5 = '';
            this.LTS5 = '';
            this.LTT5 = '';
            this.Chg5 = '';

            this.Chg = '';
            this.ChgP = '';
            this.Cls = '';
            this.L = '';
            this.H = '';
            this.TVol = '';
            this.TVal = '';
            this.NTrd = '';
            this.St = '';

            //chgColour is used for changing the row's css class
            //('warning', 'danger', 'success') - (yellow, red, green)
            this.chgColour = '';
        };

        if ($scope.dataStore.stockInfo === null) {
            $scope.dataStore.stockInfo = new instrument('', '');
        }

        $scope.$on('handleStockInfoChanged', function () {
            if ($scope.dataStore.siPesk !== null) {
                $scope.changeInstrument($scope.dataStore.siPesk, $scope.dataStore.siSymbol, $scope.dataStore.siName);
            }
        });

        // Get instruments for newly selected watchlist and subscribe to LS.
        $scope.changeInstrument = function (pesk, symbol, name) {
            $scope.dataStore.siPesk = pesk;
            $scope.dataStore.siSymbol = symbol;
            $scope.dataStore.stockInfo = new instrument(pesk, symbol, name);
            $scope.dataStore.stockInfo.chgColour = 'warning';
            $scope.subscribeData();
            $scope.dataStore.broadcastChartData();
        };

        $scope.keypressed = function ($event) {
            if (($event.keyCode === 13) && ($scope.dataStore.siSymbol !== null) && ($scope.dataStore.siSymbol !== '')) {
                $scope.searchInstrument();
                $event.preventDefault();
            }
        };

        // Subscribe to the watchlist instruments and update watchlist table array
        $scope.subscribeData = function () {
            if (($scope.dataStore.siPesk !== null) && ($scope.dataStore.siPesk !== '')) {
                var newPesk = $scope.dataStore.siPesk.split(' ').join('_');
                $scope.lightStreamer.subscribeStockInfo(newPesk, function (info) {
                    if (info !== null) {
                        var newPesk = $scope.dataStore.siPesk.split(' ').join('_');
                        if (newPesk !== info.getItemName()) {
                            return;
                        }
                        info.forEachChangedField(function (fieldName, fieldPos, val) {
                            if (fieldName === "Chg" || fieldName === "Chg1" || fieldName === "Chg2" || fieldName === "Chg3" || fieldName === "Chg4" || fieldName === "Chg5") {
                                if (angular.isDefined(val) && val !== '') {
                                    $scope.dataStore.stockInfo[fieldName] = parseFloat(Number(val).toFixed(6));
                                } else {
                                    $scope.dataStore.stockInfo[fieldName] = 0;
                                }
                            } else {
                                if (fieldName === "LTP1" || fieldName === "LTP2" || fieldName === "LTP3" || fieldName === "LTP4" || fieldName === "LTP5") {
                                    if (!angular.isDefined(val) || val === '') {
                                        if (fieldName === "LTP1") {
                                            $scope.dataStore.stockInfo["Chg1"] = '';
                                        } else if (fieldName === "LTP2") {
                                            $scope.dataStore.stockInfo["Chg2"] = '';
                                        } else if (fieldName === "LTP3") {
                                            $scope.dataStore.stockInfo["Chg3"] = '';
                                        } else if (fieldName === "LTP4") {
                                            $scope.dataStore.stockInfo["Chg4"] = '';
                                        } else if (fieldName === "LTP5") {
                                            $scope.dataStore.stockInfo["Chg5"] = '';
                                        }
                                    }
                                }
                                $scope.dataStore.stockInfo[fieldName] = val;
                            }
                        });
                        //Get the change value and change the css class for the row.
                        var changeValue = $scope.dataStore.stockInfo.Chg;
                        if ((changeValue !== null) && (changeValue !== '')) {
                            if (changeValue !== "-") {
                                if (changeValue > 0) {
                                    $scope.dataStore.stockInfo.chgColour = 'success';
                                }
                                else if (changeValue < 0) {
                                    $scope.dataStore.stockInfo.chgColour = 'danger';
                                }
                            } else {
                                $scope.dataStore.stockInfo.chgColour = 'warning';
                            }
                        } else {
                            $scope.dataStore.stockInfo.chgColour = 'warning';
                        }
                        //Tell AngularJS to update the required bindings
                        $scope.$digest();
                    }
                });
            }
        };

        $scope.getColour = function (change, isText) {
            if (change !== null && change !== '' && change !== ' ' && change !== '   ') {
                if (change > 0) {
                    if (isText) {
                        return "text-success";
                    }
                    return "success";
                }
                else if (change < 0) {
                    if (isText) {
                        return "text-danger";
                    }
                    return "danger";
                }
                else
                    if (isText) {
                        return "text-warning";
                    }
                return "warning";
            } else {
                return '';
            }
        };

        $scope.showChange = function (ltp) {
            if (!angular.isDefined(ltp) || ltp === null || ltp === '' || ltp === ' ' || ltp === '  ' || ltp === 0) {
                return false;
            }
            return true;
        };

        // When the controller gets created, add WL subscriptions if needed
        if (angular.isDefined($scope.dataStore.siPesk) && $scope.dataStore.siPesk !== null && $scope.dataStore.siPesk !== '') {
            $scope.subscribeData();
        }

        // When the controller gets destroyed, remove the WL subscriptions.
        $scope.$on("$destroy", function () {
            $scope.lightStreamer.clearSISubscriptions();
        });

        //Order details object
        var orderDetails = function (s, p) {
            this.side = s;
            this.price = p;
        };

        //Search action object
        var searchAction = function (a, s) {
            this.action = a;
            this.searchString = s;
        };

        //Open a new order ticket in a modal window
        $scope.newOrder = function (side, price) {
            var od = new orderDetails(side, price);
            var modalInstance = $modal.open({
                templateUrl: 'app/templates/orderEntry.html?',
                controller: 'orderentryController',
                backdrop: 'static',
                resolve: {
                    instructionDetails: function () {
                        return od;
                    }
                }
            });
        };

        //Open a modal window that searches for instruments
        $scope.searchInstrument = function () {
            if ($scope.dataStore.siSymbol !== null && $scope.dataStore.siSymbol !== '') {
                var sa = new searchAction('SI', $scope.dataStore.siSymbol);
                var modalInstance = $modal.open({
                    templateUrl: 'app/templates/instrumentsearch.html?',
                    controller: 'instrumentsearchController',
                    backdrop: 'static',
                    resolve: {
                        searchAction: function () {
                            return sa;
                        }
                    }
                });
                modalInstance.result.then(function (info) {
                    $scope.changeInstrument(info.pesk, info.symbol, info.name);
                });
            }
        };
    }]);