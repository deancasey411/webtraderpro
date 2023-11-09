/* global angular: false */
/* global app: false */
'use strict';
app.controller('indicesController', ['$scope', '$rootScope', '$log', '$http', '$modal', 'toaster', 'ntDataStore', 'ntLightstreamer',
    function ($scope, $rootScope, $log, $http, $modal, toaster, ntDataStore, ntLightstreamer) {
        $scope.dataStore = ntDataStore;
        $scope.lightStreamer = ntLightstreamer;
        var instrument = function (pesk, symbol, name) {
            this.pesk = pesk;
            this.Symbol = symbol;
            this.name = name;
            this.LTP = '';
            this.LTT = '';
            this.Chg = '';
            this.ChgP = '';
            this.Cls = '';
            this.chgColour = 'warning';
        };

        $scope.symbol = "";
        $scope.dataStore.indexWatchlistId = 0;

        if (!angular.isDefined($scope.dataStore.indices)) {
            $scope.dataStore.indices = [];
            $scope.dataStore.indexSubscriptions = [];
            $http.get($rootScope.serviceBase + '/api/web/watchlists?type=Index&IncludeServerCount=false').success(function (data) {
                angular.forEach(data.items, function (value) {
                    if (value.type === 'Index' && $scope.dataStore.indexWatchlistId === 0) {
                        $scope.dataStore.indexWatchlistId = value.id;
                        $http.get($rootScope.serviceBase + `/api/web/watchlists/${value.id}`, { headers: { 'transform': 'detailweb' } }).success(function (indexData) {
                            angular.forEach(indexData.instruments, function (value) {
                                $scope.dataStore.indices.push(new instrument(value.exchangeSymbolKey, value.symbol, value.name));
                                $scope.dataStore.indexSubscriptions.push(value.exchangeSymbolKey);
                            });
                            $scope.subscribeData();
                        });
                    }
                });

                //No index watchlist is available. Lets create one
                if ($scope.dataStore.indexWatchlistId === 0) {
                    var newIndexWatchlist = {
                        "name": "My Index Watchlist",
                        "type": "Index",
                        "exchangeSymbolKeys": []
                    };
                    $http.post($rootScope.serviceBase + '/api/web/watchlists', newIndexWatchlist).success(function (data, status) {
                        if (data) {
                            if (data.success) {
                                $scope.dataStore.indexWatchlistId = parseInt(data.recordId);
                            } else {
                                $log.error("Failed to create index watchlist.");
                            }
                        } else {
                            $log.error("Status: " + status + "Message: " + data || "Failed to create index watchlist.");
                        }
                    }).error(function (data, status) {
                        $log.error("Status: " + status + "Message: " + data || "Failed to create index watchlist.");
                    });
                }
            }).error(function (data, status) {
                $scope.dataStore.indices = undefined;
                $log.error("Status: " + status + "Message: " + data || "Indices request failed");
            });
        }

        // Subscribe to the watchlist instruments and update watchlist table array
        $scope.subscribeData = function () {
            $scope.lightStreamer.clearIndexWLSubscriptions();
            if (($scope.dataStore.indexSubscriptions !== null) && ($scope.dataStore.indexSubscriptions.length > 0)) {
                $scope.lightStreamer.subscribeIndexWatchlist($scope.dataStore.indexSubscriptions, function (info) {
                    if (info !== null) {
                        var itemPos = info.getItemPos() - 1;
                        if (!$scope.dataStore.indices[itemPos]) {
                            $scope.dataStore.indices[itemPos] = [];
                        }
                        info.forEachChangedField(function (fieldName, fieldPos, val) {
                            $scope.dataStore.indices[itemPos][fieldName] = val;
                        });
                        //Get the change value and change the css class for the row.
                        var changeValue = $scope.dataStore.indices[itemPos]["Chg"];
                        if ((changeValue !== null) && (changeValue !== '')) {
                            if (changeValue !== "-") {
                                if (changeValue > 0) {
                                    $scope.dataStore.indices[itemPos]["chgColour"] = 'success';
                                } else if (changeValue < 0) {
                                    $scope.dataStore.indices[itemPos]["chgColour"] = 'danger';
                                }
                            } else {
                                $scope.dataStore.indices[itemPos]["chgColour"] = 'warning';
                            }
                        } else {
                            $scope.dataStore.indices[itemPos]["chgColour"] = 'warning';
                        }
                        //Tell AngularJS to update the required bindings
                        $scope.$digest();
                    }
                });
            }
        };

        //update stock info
        $scope.navstockInfo = function (pesk, symbol, name) {
            $scope.dataStore.siPesk = pesk;
            $scope.dataStore.siSymbol = symbol;
            $scope.dataStore.siName = name;
            $scope.dataStore.broadcastStockInfo();
        };

        // When the controller gets created, add WL subscriptions if needed
        if ((angular.isDefined($scope.dataStore.indexSubscriptions)) && ($scope.dataStore.indexSubscriptions.length > 0)) {
            $scope.subscribeData();
        }

        // When the controller gets destroyed, remove the WL subscriptions.
        $scope.$on("$destroy", function () {
            $scope.lightStreamer.clearIndexWLSubscriptions();
        });

        // Remove the instrument from the current watchlist
        $scope.removeInstrument = function (item) {
            var updateIndexWatchlist = {
                'id': $scope.dataStore.indexWatchlistId,
                'type': 'Index',
                'exchangeSymbolKeys': []
            };

            angular.forEach($scope.dataStore.indices, function (value) {
                if (value.pesk !== item.pesk) {
                    //Remeber that the below (this) refers to the new instruments array.
                    //Check angular.forEach help for more information
                    this.push(value.pesk);
                }
            }, updateIndexWatchlist.exchangeSymbolKeys);

            $http.put($rootScope.serviceBase + '/api/web/watchlists', updateIndexWatchlist).success(function (data, status) {
                if (data) {
                    if (data.success) {
                        var peskindex = $scope.dataStore.indexSubscriptions.indexOf(item.pesk);
                        $scope.dataStore.indexSubscriptions.splice(peskindex, 1);
                        var index = $scope.dataStore.indices.indexOf(item);
                        $scope.dataStore.indices.splice(index, 1);
                        $scope.subscribeData();
                        toaster.pop('success', "Successful!", "Successfully removed the index from your index watchlist.", 3000);
                    } else {
                        $log.error("Failed to update indices.");
                    }
                } else {
                    $log.error("Status: " + status + "Message: " + data || "Failed to update indices.");
                }
            }).error(function (data, status) {
                $log.error("Status: " + status + "Message: " + data || "Failed to update indices.");
            });
        };

        //Search action object
        var searchAction = function (a, s) {
            this.action = a;
            this.searchString = s;
        };

        $scope.keypress = function ($event) {
            if (($event.keyCode === 13) && ($scope.symbol !== null) && ($scope.symbol !== '')) {
                $scope.searchInstrument();
                $event.preventDefault();
            }
        };

        //Open a modal window that searches for instruments
        $scope.searchInstrument = function () {
            var sa = new searchAction('IWL', $scope.symbol);
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
                var updateIndexWatchlist = {
                    'id': $scope.dataStore.indexWatchlistId,
                    'type': 'Index',
                    'exchangeSymbolKeys': []
                };

                var exists = false;
                angular.forEach($scope.dataStore.indices, function (value) {
                    if (!exists && value.pesk === info.pesk) {
                        exists = true;
                    }
                    //Remeber that the below (this) refers to the new instruments array.
                    //Check angular.forEach help for more information
                    this.push(value.pesk);
                }, updateIndexWatchlist.exchangeSymbolKeys);

                if (!exists) {
                    updateIndexWatchlist.exchangeSymbolKeys.push(info.pesk);
                    $http.put($rootScope.serviceBase + '/api/web/watchlists', updateIndexWatchlist).success(function (data, status) {
                        if (data) {
                            if (data.success) {
                                $scope.dataStore.indices.push(new instrument(info.pesk, info.symbol, info.name));
                                $scope.dataStore.indexSubscriptions.push(info.pesk);
                                $scope.subscribeData();
                                $scope.symbol = '';
                                toaster.pop('success', "Successful!", "A new index was successfully added to your index watchlist.", 3000);
                            } else {
                                $log.error("Failed to update indices.");
                            }
                        } else {
                            $log.error("Status: " + status + "Message: " + data || "Failed to update indices.");
                        }
                    }).error(function () {
                        $log.error("Status: " + status + "Message: " + data || "Failed to update indices.");
                    });
                } else {
                    toaster.pop('warning', "Warning!", "Index already exists in your current index watchlist.", 3000);
                }
            });
        };
    }]);