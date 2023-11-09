/* global angular: false */
/* global app: false */
'use strict';
app.controller('watchlistController', ['$scope', '$rootScope', '$http', '$modal', '$log', '$location', '$anchorScroll', '$window', 'toaster', 'authService', 'ntDataStore', 'ntLightstreamer',
    function ($scope, $rootScope, $http, $modal, $log, $location, $anchorScroll, $window, toaster, authService, ntDataStore, ntLightstreamer) {
        $scope.dataStore = ntDataStore;
        $scope.lightStreamer = ntLightstreamer;
        $scope.global = $rootScope;

        $scope.isRealTimeUser = function () {
            return authService.authentication.roles.indexOf('RealTimeData') > -1;
        };

        // On watchlist instrument structure.
        var instrument = function (pesk, symbol, name) {
            this.pesk = pesk;
            this.Symbol = symbol;
            this.name = name;
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
            this.LTP = '';
            this.LTS = '';
            this.LTT = '';
            this.Chg = '';
            this.ChgP = '';
            this.Cls = '';
            this.L = '';
            this.H = '';
            //chgColour is used for changing the row's css class
            //('warning', 'danger', 'success') - (yellow, red, green)
            this.chgColour = 'warning';
        };

        // Variable linked to the instrument input-box
        $scope.symbol = null;

        if (!angular.isDefined($scope.dataStore.ThreeLineDepth)) {
            $scope.dataStore.ThreeLineDepth = false;
        }

        // On initialize, check if the datastore watchlist array is null, else fetch the user's watchlist.
        if (!angular.isDefined($scope.dataStore.watchlists)) {
            $http.get($rootScope.serviceBase + '/api/web/watchlists?type=Instrument&IncludeServerCount=false').success(function (data) {

                var tempWatchlists = [];
                if (data && data.items && data.items.length > 0) {
                    tempWatchlists = data.items;
                }

                $scope.dataStore.watchlists = tempWatchlists;

                if (angular.isDefined($scope.dataStore.watchlists) && angular.isArray($scope.dataStore.watchlists) && $scope.dataStore.watchlists.length > 0) {

                    var defaultWatchlist = $scope.dataStore.watchlists.find(function (element) {
                        return element.name === 'DEFAULT';
                    });

                    if (angular.isDefined(defaultWatchlist) && defaultWatchlist !== null) {
                        $scope.dataStore.watchlist = defaultWatchlist;
                        $scope.watchlistChanged();
                    } else {
                        if (angular.isDefined($scope.dataStore.watchlists) && $scope.dataStore.watchlists !== null && $scope.dataStore.watchlists.length > 0) {
                            $scope.dataStore.watchlist = $scope.dataStore.watchlists[0];
                            $scope.watchlistChanged();
                        }
                    }
                } else {
                    //No index watchlist is available. Lets create one
                    if ($scope.dataStore.indexWatchlistId === 0) {
                        var newIndexWatchlist = {
                            "name": "DEFAULT",
                            "type": "Instrument",
                            "exchangeSymbolKeys": []
                        };
                        $http.post($rootScope.serviceBase + '/api/web/watchlists', newIndexWatchlist).success(function (data, status) {
                            if (data) {
                                if (data.success) {
                                    var newWatchlist = {
                                        "id": parseInt(data.recordId),
                                        "name": "DEFAULT",
                                        "type": "Instrument"
                                    };
                                    $scope.dataStore.watchlists.push(newWatchlist);
                                    $scope.dataStore.watchlist = newWatchlist;
                                    $scope.watchlistChanged();
                                } else {
                                    $log.error("Failed to create instrument watchlist.");
                                }
                            } else {
                                $log.error("Status: " + status + "Message: " + data || "Failed to create instrument watchlist.");
                            }
                        }).error(function (data, status) {
                            $log.error("Status: " + status + "Message: " + data || "Failed to create instrument watchlist.");
                        });
                    }
                }
            })
                .error(function (data, status, headers, config) {
                    $scope.dataStore.watchlists = undefined;
                    var logInfo = {
                        message: data || "An error has occured while loading watchlists!",
                        status: status,
                        url: config.url
                    };
                    $log.error(angular.toJson(logInfo));
                });
        }

        $scope.toggleDepth = function () {
            $scope.dataStore.ThreeLineDepth = !$scope.dataStore.ThreeLineDepth;
            if (!$scope.dataStore.ThreeLineDepth) {
                angular.forEach($scope.dataStore.instruments, function (instrument) {
                    instrument.B2 = '';
                    instrument.BS2 = '';
                    instrument.A2 = '';
                    instrument.AS2 = '';
                    instrument.B3 = '';
                    instrument.BS3 = '';
                    instrument.A3 = '';
                    instrument.AS3 = '';
                });
            }
            $scope.subscribeData();
        };

        // Get instruments for newly selected watchlist and subscribe to LS.
        $scope.watchlistChanged = function () {
            $scope.lightStreamer.clearWLSubscriptions();
            $scope.dataStore.instruments = [];
            $scope.dataStore.wlSubscriptions = [];
            $http.get($rootScope.serviceBase + `/api/web/watchlists/${$scope.dataStore.watchlist.id}`, { headers: { 'transform': 'detailweb' } }).success(function (data) {
                $scope.dataStore.instruments.length = 0;
                $scope.dataStore.wlSubscriptions.length = 0;
                angular.forEach(data.instruments, function (value) {
                    $scope.dataStore.instruments.push(new instrument(value.exchangeSymbolKey, value.symbol, value.name));
                    $scope.dataStore.wlSubscriptions.push(value.exchangeSymbolKey.split(' ').join('_'));
                });
                $scope.subscribeData();
            })
                .error(function (data, status, headers, config) {
                    $scope.dataStore.instruments = [];
                    var logInfo = {
                        message: data || "An error has occured while loading watchlist instruments!",
                        status: status,
                        url: config.url
                    };
                    $log.error(angular.toJson(logInfo));
                });
        };

        $scope.navstockInfo = function (pesk, symbol, name) {
            $scope.dataStore.siPesk = pesk;
            $scope.dataStore.siSymbol = symbol;
            $scope.dataStore.siName = name;
            $scope.dataStore.broadcastStockInfo();

            //Only for smaller devices
            if ($window.document.width < 700) {
                // set the location.hash to the id of
                // the element you wish to scroll to.
                $location.hash('pnlStockInfo');
                // call $anchorScroll()
                $anchorScroll();
            }
        };

        // Subscribe to the watchlist instruments and update watchlist table array
        $scope.subscribeData = function () {
            $scope.lightStreamer.clearWLSubscriptions();
            if (($scope.dataStore.wlSubscriptions !== null) && ($scope.dataStore.wlSubscriptions.length > 0)) {
                $scope.lightStreamer.subscribeWatchlist($scope.dataStore.wlSubscriptions, $scope.dataStore.ThreeLineDepth, function (info) {
                    if (info !== null) {
                        var itemPos = info.getItemPos() - 1;
                        if (!$scope.dataStore.instruments[itemPos]) {
                            $scope.dataStore.instruments[itemPos] = [];
                        }
                        info.forEachChangedField(function (fieldName, fieldPos, val) {
                            if (fieldName !== 'Symbol') {
                                if (fieldName === "Chg") {
                                    if (angular.isDefined(val) && val !== '' && val !== '-') {
                                        $scope.dataStore.instruments[itemPos][fieldName] = parseFloat(Number(val).toFixed(6));
                                    } else {
                                        $scope.dataStore.instruments[itemPos][fieldName] = 0;
                                    }
                                } else {
                                    $scope.dataStore.instruments[itemPos][fieldName] = val;
                                }
                            }
                        });
                        //Get the change value and change the css class for the row.
                        var changeValue = $scope.dataStore.instruments[itemPos]["Chg"];
                        if (changeValue !== null && changeValue !== '') {
                            if (changeValue !== "-") {
                                if (changeValue > 0) {
                                    $scope.dataStore.instruments[itemPos]["chgColour"] = 'success';
                                } else if (changeValue < 0) {
                                    $scope.dataStore.instruments[itemPos]["chgColour"] = 'danger';
                                }
                            } else {
                                $scope.dataStore.instruments[itemPos]["chgColour"] = 'warning';
                            }
                        } else {
                            $scope.dataStore.instruments[itemPos]["chgColour"] = 'warning';
                        }
                        //Tell AngularJS to update the required bindings
                        $scope.$digest();
                    }
                });
            }
        };

        // When the controller gets created, add WL subscriptions if needed
        if ((angular.isDefined($scope.dataStore.wlSubscriptions)) && ($scope.dataStore.wlSubscriptions.length > 0)) {
            $scope.subscribeData();
        }

        // When the controller gets destroyed, remove the WL subscriptions.
        $scope.$on("$destroy", function () {
            try {
                $scope.lightStreamer.clearWLSubscriptions();
            } catch (e) {
                $log.error(e.message);
            }
        });

        // Remove the instrument from the current watchlist
        $scope.removeInstrument = function (item) {
            var updateWatchlist = {
                'id': $scope.dataStore.watchlist.id,
                'type': $scope.dataStore.watchlist.type,
                'exchangeSymbolKeys': []
            };

            angular.forEach($scope.dataStore.instruments, function (value) {
                if (value.pesk !== item.pesk) {
                    //Remeber that the below (this) refers to the new instruments array.
                    //Check angular.forEach help for more information
                    this.push(value.pesk);
                }
            }, updateWatchlist.exchangeSymbolKeys);

            $http.put($rootScope.serviceBase + '/api/web/watchlists', updateWatchlist).success(function (data, status) {
                if (data) {
                    if (data.success) {
                        var peskindex = $scope.dataStore.wlSubscriptions.indexOf(item.pesk.split(' ').join('_'));
                        $scope.dataStore.wlSubscriptions.splice(peskindex, 1);
                        var index = $scope.dataStore.instruments.indexOf(item);
                        $scope.dataStore.instruments.splice(index, 1);
                        $scope.subscribeData();
                        toaster.pop('success', "Successful!", "Successfully removed the instrument from your watchlist.", 3000);
                    } else {
                        $log.error("An error has occured while removing the instrument from your watchlist!");
                    }
                } else {
                    var logInfo = {
                        message: "An error has occured while removing the instrument from your watchlist!",
                        status: status,
                        url: config.url
                    };
                    $log.error(angular.toJson(logInfo));
                }
            }).error(function (data, status, headers, config) {
                var logInfo = {
                    message: data || "An error has occured while removing the instrument from your watchlist!",
                    status: status,
                    url: config.url
                };
                $log.error(angular.toJson(logInfo));
            });
        };

        //Search action object
        var SearchAction = function (a, s) {
            this.action = a;
            this.searchString = s;
        };

        $scope.keypress = function ($event) {
            if (($event.keyCode === 13) && ($scope.symbol !== null) && ($scope.symbol !== '')) {
                $scope.searchInstrument();
                $event.preventDefault();
            }
        };

        $scope.newWatchlist = function () {
            if ($scope.dataStore.watchlists.length >= 3) {
                toaster.pop('warning', "Limit reached!", "You currently have reached your watchlist limit of 3. Cannot add more watchlists.", 3000);
                return;
            }
            var modalInstance = $modal.open({
                templateUrl: 'app/templates/newWatchlist.html?',
                controller: 'newWatchlistController',
                backdrop: 'static',
                resolve: {
                    watchlists: function () {
                        return $scope.dataStore.watchlists;
                    }
                }
            });
            modalInstance.result.then(function (newWLName) {
                $scope.dataStore.watchlists.push(newWLName);
                toaster.pop('success', "Saved!", "Your new watchlist with the name '" + newWLName.name + "' was created successfully.", 3000);
            });
        };

        $scope.renameWatchlist = function () {
            if (!angular.isDefined($scope.dataStore.watchlist) || $scope.dataStore.watchlist === '') {
                toaster.pop('warning', "Rename", "Please select a watchlist to rename.", 3000);
                return;
            }
            var modalInstance = $modal.open({
                templateUrl: 'app/templates/renameWatchlist.html?',
                controller: 'renameWatchlistController',
                backdrop: 'static',
                resolve: {
                    watchlist: function () {
                        return $scope.dataStore.watchlist;
                    },
                    watchlists: function () {
                        return $scope.dataStore.watchlists;
                    }
                }
            });
            modalInstance.result.then(function (newWLName) {
                var index = $scope.dataStore.watchlists.indexOf($scope.dataStore.watchlist);
                if (index >= 0) {
                    $scope.dataStore.watchlists[index].name = newWLName;
                    toaster.pop('success', "Saved!", "Your watchlist was renamed successfully.", 3000);
                } else {
                    toaster.pop('warning', "Failed!", "Failed to rename your existing watchlist.", 3000);
                }
            });
        };

        $scope.deleteWatchlist = function () {
            if ($scope.dataStore.watchlist !== 'DEFAULT') {
                var modalInstance = $modal.open({
                    templateUrl: 'app/templates/deleteWatchlist.html?',
                    controller: 'deleteWatchlistController',
                    backdrop: 'static',
                    resolve: {
                        watchlistName: function () {
                            return $scope.dataStore.watchlist;
                        }
                    }
                });
                modalInstance.result.then(function (watchlistId) {

                    for (var i = 0; i < $scope.dataStore.watchlists.length; i++) {
                        if ($scope.dataStore.watchlists[i].id === watchlistId) {
                            arr.splice(i, 1);
                        }
                    }

                    var defaultWatchlist = $scope.dataStore.watchlists.find(function (element) {
                        return element.name === 'DEFAULT';
                    });

                    if (angular.isDefined(defaultWatchlist) && defaultWatchlist !== null) {
                        $scope.dataStore.watchlist = defaultWatchlist.id;
                        $scope.watchlistChanged();
                    } else {
                        if (angular.isDefined($scope.dataStore.watchlists) && $scope.dataStore.watchlists !== null && $scope.dataStore.watchlists.length > 0) {
                            $scope.dataStore.watchlist = $scope.dataStore.watchlists[0];
                            $scope.watchlistChanged();
                        }
                    }

                    toaster.pop('success', "Deleted!", "Your watchlist with the name '" + watchlistId + "' was successfully deleted.", 3000);
                });
            } else {
                toaster.pop('warning', "Warning!", "Cannot delete the default watchlist.", 3000);
            }
        };

        //Open a new order ticket in a modal window
        $scope.newOrder = function (side, price, pesk) {
            try {
                if ($rootScope.isTrader) {
                    var od = new $rootScope.OrderDetails(side, price, pesk);
                    //Check the config to see if website is set to extend the bid/offer instead of a takeout
                    if ($rootScope.swapWatchlistBuySell) {
                        if (od.Side === "B") {
                            od.Side = "S";
                        } else {
                            od.Side = "B";
                        }
                    }

                    var tradableInstrument = null;

                    //Find all tradable instruments by Public Exchange Symbol Key
                    $http.get($rootScope.serviceBase + `/api/OrderRouting/Instruments/byPublicExchangeSymbolKey/${od.PESK}`).success(function (data) {
                        if (!angular.isDefined(data.items) || data.items.length === 0) {
                            toaster.pop('warning', "Warning!", "Cannot find a valid trading instrument or you do not have permissions to trade this instrument.", 5000);
                        } else {
                            if (data.items.length === 1) {
                                tradableInstrument = data.items[0];
                                openOrderEntry(od, tradableInstrument);
                            } else {
                                var modalInstance = $modal.open({
                                    templateUrl: 'app/templates/instrumentselect.html?',
                                    controller: 'instrumentselectController',
                                    backdrop: 'static',
                                    resolve: {
                                        instrumentCollection: function () {
                                            return data.items;
                                        }
                                    }
                                });
                                modalInstance.result.then(function (selectedInstrument) {
                                    tradableInstrument = selectedInstrument;
                                    openOrderEntry(od, tradableInstrument);
                                });
                            }
                        }
                    }).error(function (data, status, headers, config) {
                        var logInfo = {
                            message: data || "An error has occured while fecthing valid trading instruments",
                            status: status,
                            url: config.url
                        };
                        $log.error(angular.toJson(logInfo));
                    });
                }
            } catch (e) {
                toaster.pop('warning', "Warning!", e.message, 5000);
                $log.error(e.message);
            }
        };

        var openOrderEntry = function openOrderEntry(od, tradableInstrument) {
            if (tradableInstrument === null) {
                return;
            }
            od.FixSession = tradableInstrument.fixSession;
            od.Instrument = tradableInstrument;
            od.Symbol = tradableInstrument.symbol;
            if (!(angular.isDefined(od.FixSession) && od.FixSession !== '')) {
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
        };

        //Open a modal window that searches for instruments
        $scope.searchInstrument = function () {
            var sa = new SearchAction('WL', $scope.symbol);
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

                var updateWatchlist = {
                    'id': $scope.dataStore.watchlist.id,
                    'type': $scope.dataStore.watchlist.type,
                    'exchangeSymbolKeys': []
                };

                var exists = false;
                angular.forEach($scope.dataStore.instruments, function (value) {
                    if (!exists && value.pesk === info.pesk) {
                        exists = true;
                    }
                    //Remeber that the below (this) refers to the new instruments array.
                    //Check angular.forEach help for more information
                    this.push(value.pesk);
                }, updateWatchlist.exchangeSymbolKeys);
                if (!exists) {
                    updateWatchlist.exchangeSymbolKeys.push(info.pesk);
                    $http.put($rootScope.serviceBase + '/api/web/watchlists', updateWatchlist).success(function (data, status, headers, config) {
                        if (data) {
                            $scope.dataStore.instruments.push(new instrument(info.pesk, info.symbol, info.name));
                            $scope.dataStore.wlSubscriptions.push(info.pesk.split(' ').join('_'));
                            $scope.subscribeData();
                            $scope.symbol = '';
                            toaster.pop('success', "Successful!", "A new instrument was successfully added to your watchlist.", 3000);
                        } else {
                            var logInfo = {
                                message: "An error has occured while adding the instrument to your watchlist!",
                                status: status,
                                url: config.url
                            };
                            $log.error(angular.toJson(logInfo));
                        }
                    }).error(function (data, status, headers, config) {
                        var logInfo = {
                            message: data || "Failed to update watchlist instruments.",
                            status: status,
                            url: config.url
                        };
                        $log.error(angular.toJson(logInfo));
                    });
                } else {
                    toaster.pop('warning', "Warning!", "Instrument already exists in your current watchlist.", 3000);
                }
            });
        };
    }]);

app.controller('newWatchlistController', ['$scope', '$rootScope', '$http', '$log', '$modalInstance', 'ntDataStore', 'watchlists', 'authService',
    function ($scope, $rootScope, $http, $log, $modalInstance, ntDataStore, watchlists, authService) {
        $scope.dataStore = ntDataStore;
        $scope.watchlistName = '';
        $scope.existingWatchlists = watchlists;
        $scope.isDuplicate = false;

        $scope.saveNewWatchlist = function (wlName) {
            $scope.isDuplicate = false;
            angular.forEach($scope.existingWatchlists, function (value) {
                if (value.name.toLowerCase() === wlName.toLowerCase()) {
                    $scope.isDuplicate = true;
                }
            });
            if (!$scope.isDuplicate) {
                var createWatchlist = {
                    "name": wlName,
                    "type": "Instrument",
                    "exchangeSymbolKeys": []
                };

                $http.post($rootScope.serviceBase + '/api/web/watchlists', createWatchlist).success(function (data, status, headers, config) {
                    if (data) {
                        if (data.success) {
                            var newWatchlist = {
                                "id": parseInt(data.recordId),
                                "name": wlName,
                                "type": "Instrument"
                            };
                            $modalInstance.close(newWatchlist);
                        } else {
                            $log.error(angular.toJson(data));
                        }
                    } else {
                        var logInfo = {
                            message: "An error has occured while saving the new watchlist!",
                            status: status,
                            url: config.url
                        };
                        $log.error(angular.toJson(logInfo));
                    }
                })
                    .error(function (data, status, headers, config) {
                        var logInfo = {
                            message: data || "Failed to create new watchlist.",
                            status: status,
                            url: config.url
                        };
                        $log.error(angular.toJson(logInfo));
                    });
            }
        };
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);

app.controller('renameWatchlistController', ['$scope', '$rootScope', '$http', '$log', '$modalInstance', 'ntDataStore', 'watchlist', 'watchlists', 'authService',
    function ($scope, $rootScope, $http, $log, $modalInstance, ntDataStore, watchlist, watchlists, authService) {
        $scope.dataStore = ntDataStore;
        $scope.watchlistName = '';
        $scope.currentWatchlist = watchlist;
        $scope.existingWatchlists = watchlists;
        $scope.isDuplicate = false;

        $scope.renameExistingWatchlist = function (wlName) {
            $scope.isDuplicate = false;
            angular.forEach($scope.existingWatchlists, function (value) {
                if (value.name.toLowerCase() === wlName.toLowerCase()) {
                    $scope.isDuplicate = true;
                }
            });

            if (!$scope.isDuplicate) {
                var renameWatchlist = {
                    "id": $scope.dataStore.watchlist.id,
                    "name": wlName,
                    "exchangeSymbolKeys": [],
                    "updateInstruments": false
                };

                $http.put($rootScope.serviceBase + '/api/web/watchlists', renameWatchlist).success(function (data, status, headers, config) {
                    if (data) {
                        if (data.success) {
                            $modalInstance.close(wlName);
                        } else {
                            $log.error("Failed to rename watchlist");
                        }
                    } else {
                        var logInfo = {
                            message: "An error has occured while renaming the watchlist!",
                            status: status,
                            url: config.url
                        };
                        $log.error(angular.toJson(logInfo));
                    }
                }).error(function (data, status, headers, config) {
                    var logInfo = {
                        message: data || "Failed to rename watchlist.",
                        status: status,
                        url: config.url
                    };
                    $log.error(angular.toJson(logInfo));
                });
            }
        };
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);

app.controller('deleteWatchlistController', ['$scope', '$rootScope', '$http', '$log', '$modalInstance', 'authService', 'ntDataStore', 'watchlistName',
    function ($scope, $rootScope, $http, $log, $modalInstance, authService, ntDataStore, watchlist) {
        $scope.dataStore = ntDataStore;
        $scope.watchlist = watchlist;
        $scope.deleteWatchlist = function (watchlistId) {
            $http.delete($rootScope.serviceBase + `/api/web/watchlists/${watchlistId}`).success(function (data, status, headers, config) {
                if (data) {
                    if (data.success) {
                        $modalInstance.close(watchlistId);
                    } else {
                        $log.error(angular.toJson(data));
                    }
                } else {
                    var logInfo = {
                        status: status,
                        url: config.url
                    };
                    $log.error(angular.toJson(logInfo));
                }
            }).error(function (data, status, headers, config) {
                var logInfo = {
                    message: data || "Failed to delete watchlist.",
                    status: status,
                    url: config.url
                };
                $log.error(angular.toJson(logInfo));
            });
        };
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);