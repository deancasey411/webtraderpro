/* global angular: false */
/* global app: false */
'use strict';
app.factory("ntDataStore", ['$rootScope', '$http', '$q', '$log', '$localStorage', 'authService', '$window',
    function ($rootScope, $http, $q, $log, $localStorage, authService, $window) {
        var ds = {};

        ds.pvtInstruments = [];
        ds.pvtInstrumentsLookup = [];
        ds.pvtInstrumentsListLookup = [];
        ds.pvtInstrumentsLookupKey = [];
        ds.pvtInstrumentsLookupFixSession = [];
        ds.tradingAccounts = [];
        ds.tradingAccountSubscriptions = [];

        var _broadcastTradingAccount = function () {
            $rootScope.$broadcast('handleTradingAccountChanged');
        };

        var _broadcastStockInfo = function () {
            $rootScope.$broadcast('handleStockInfoChanged');
        };

        var _broadcastChartData = function () {
            $rootScope.$broadcast('handleChartDataChanged');
        };

        //Storage class for FIX Instruments by FixSession
        var fsInstruments = function () {
            this.Instruments = [];
        };

        //Compression/Decompression Functions
        var compress = function (uncompressed) {
            // Build the dictionary.
            var i,
                dictionary = {},
                c,
                wc,
                w = "",
                result = [],
                dictSize = 256;
            for (i = 0; i < 256; i += 1) {
                dictionary[String.fromCharCode(i)] = i;
            }

            for (i = 0; i < uncompressed.length; i += 1) {
                c = uncompressed.charAt(i);
                wc = w + c;
                //Do not use dictionary[wc] because javascript arrays 
                //will return values for array['pop'], array['push'] etc
                // if (dictionary[wc]) {
                if (dictionary.hasOwnProperty(wc)) {
                    w = wc;
                } else {
                    result.push(dictionary[w]);
                    // Add wc to the dictionary.
                    dictionary[wc] = dictSize++;
                    w = String(c);
                }
            }

            // Output the code for w.
            if (w !== "") {
                result.push(dictionary[w]);
            }
            return result;
        };

        var decompress = function (compressed) {
            // Build the dictionary.
            var i,
                dictionary = [],
                w,
                result,
                k,
                entry = "",
                dictSize = 256;
            for (i = 0; i < 256; i += 1) {
                dictionary[i] = String.fromCharCode(i);
            }

            w = String.fromCharCode(compressed[0]);
            result = w;
            for (i = 1; i < compressed.length; i += 1) {
                k = compressed[i];
                if (dictionary[k]) {
                    entry = dictionary[k];
                } else {
                    if (k === dictSize) {
                        entry = w + w.charAt(0);
                    } else {
                        return null;
                    }
                }

                result += entry;

                // Add w+entry[0] to the dictionary.
                dictionary[dictSize++] = w + entry.charAt(0);

                w = entry;
            }
            return result;
        };

        var getTradingAccounts = function () {
            var url = '/api/orderrouting/accounts?PageSize=999999&IncludeServerCount=false';
            $http.get(`${$rootScope.serviceBase}${url}`).success(function (data) {
                if (angular.isDefined(data.items)) {
                    ds.tradingAccounts = data.items;
                    if (ds.tradingAccounts !== null && ds.tradingAccounts.length > 0) {
                        try {
                            var taSubscriptinsTemp = [];
                            for (var i = 0; i < ds.tradingAccounts.length; i++) {
                                taSubscriptinsTemp.push("OBU:" + ds.tradingAccounts[i].fixSession + ":" + ds.tradingAccounts[i].account);
                            }
                            ds.tradingAccountSubscriptions = taSubscriptinsTemp;
                        } catch (e) {
                            $log.error("Error while processing trading accounts. Message: " + e.message);
                        }
                    }
                    var mappings = $rootScope.mappings;
                    for (var ix = mappings.length; ix--;) {
                        var found = false;
                        for (var x = 0; x < data.items.length; x++) {
                            if (data.items[x].active && data.items[x].fixSession === mappings[ix].fixSession) {
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            mappings.splice(ix, 1);
                        }
                    }
                }
            }).error(function (error) {
                ds.tradingAccounts = undefined;
                ds.tradingAccountSubscriptions = undefined;
            });
        };

        var validateLocalStorage = function () {
            var valid = $localStorage.CompressedData;
            if (!valid) {
                try {
                    //Clear all local storage
                    $window.localStorage.clear();
                    $localStorage.CompressedData = true;
                } catch (e) {
                    $log.error(e.message);
                }
            }
        };

        var _init = function () {
            if (authService.authentication.isAuth) {
                validateLocalStorage();
                getTradingAccounts();
            }
        };

        var _clear = function () {

        };

        ds.init = _init;
        ds.clear = _clear;
        ds.broadcastTradingAccount = _broadcastTradingAccount;
        ds.broadcastStockInfo = _broadcastStockInfo;
        ds.broadcastChartData = _broadcastChartData;

        return ds;
    }]);