/* global angular: false */
/* global app: false */
'use strict';
app.controller('stockchartController', ['$scope', '$rootScope', '$http', '$modal', '$q', '$interval', '$log', 'ntDataStore', 'ntLightstreamer',
    function ($scope, $rootScope, $http, $modal, $q, $interval, $log, ntDataStore, ntLightstreamer) {
        $scope.dataStore = ntDataStore;
        $scope.lightStreamer = ntLightstreamer;
        $scope.loading = false;

        var blankChart = {
            "symbol": "",
            "name": "",
            "exchange": "",
            "exchangeSymbolKey": "",
            "previousClose": 0,
            "nextDate": "",
            "chartData": []
        };

        $scope.buildChart = function (pesk) {
            if (pesk.indexOf(".IX.") > -1) {
                $scope.createamChartIndex();
            } else {
                $scope.createamChart();
            }
        };

        $scope.$on('handleChartDataChanged', function () {
            if ($scope.dataStore.siPesk !== null) {
                $scope.loading = true;
                $scope.dataStore.chartData = blankChart;
                $scope.buildChart($scope.dataStore.siPesk);
                $scope.generateChartData($scope.dataStore.siPesk, 0);
            }
        });

        $scope.generateChartData = function (pesk) {
            var interval = 'Minute';
            if (angular.isDefined($scope.dataStore.chartData) && angular.isDefined($scope.dataStore.chartData.chartData) && $scope.dataStore.chartData.chartData.length > 60) {
                interval = 'FiveMinutes';
            }
            $http.get($rootScope.serviceBase + `/api/marketdata/instruments/${pesk}/intradayChart`, { headers: { 'transform': interval } }).success(function (data) {
                $scope.loading = false;
                $scope.dataStore.chartData = data;
                $scope.buildChart(pesk);
            })
                .error(function (data, status) {
                    $scope.loading = false;
                    $scope.dataStore.chartData = blankChart;
                    $log.error("Status: " + status + "Message: " + data || "Failed to get intraday chart data.");
                });
        };

        var stockchartTimer;
        $scope.startTimer = function () {
            stockchartTimer = $interval(function () {
                if (angular.isDefined($scope.dataStore.chartData) && $scope.dataStore.chartData.exchangeSymbolKey !== null && $scope.dataStore.chartData.exchangeSymbolKey !== '') {
                    $scope.loading = true;
                    var newPesk = $scope.dataStore.chartData.exchangeSymbolKey.split('_').join(' ');
                    $q.when($http.get($rootScope.serviceBase + `/api/marketdata/instruments/${newPesk}/intradayChart`, { headers: { 'transform': 'Minute' } }))
                        .then(function (result) {
                            $scope.loading = false;
                            if (angular.isDefined(result.data) && result.data.exchangeSymbolKey === $scope.dataStore.chartData.exchangeSymbolKey) {

                                $scope.dataStore.chartData = result.data;
                                //Recreate the chart....Need a better way, amChart.Validate() should be used.
                                $scope.buildChart(newPesk);

                                //if ($scope.dataStore.chartData.LastID === 0) {
                                   
                                //} else {
                                //    //If the chart data interval is the same then just append the data
                                //    //else recalculate the existsing data to the new interval
                                //    //this would normally be from OneMinute to FiveMinutes
                                //    if ($scope.dataStore.chartData.Interval === result.data.Interval) {
                                //        if ((angular.isDefined(result.data.Items)) && (result.data.Items.length > 0)) {
                                //            for (var i = 0; i < result.data.Items.length; i++) {
                                //                var currItem = result.data.Items[i];
                                //                if ($scope.dataStore.chartData.Items.length > 0) {
                                //                    var lastItem = $scope.dataStore.chartData.Items[$scope.dataStore.chartData.Items.length - 1];
                                //                    if (result.data.Items[i].Date.valueOf() === lastItem.Date.valueOf()) {
                                //                        if (lastItem.High < currItem.High) {
                                //                            lastItem.High = currItem.High;
                                //                        }
                                //                        if (lastItem.Low > currItem.Low) {
                                //                            lastItem.Low = currItem.Low;
                                //                        }
                                //                        lastItem.Close = currItem.Close;
                                //                        lastItem.Volume = lastItem.Volume + currItem.Volume;
                                //                    } else if (result.data.Items[i].Date.valueOf() > lastItem.Date.valueOf()) {
                                //                        $scope.dataStore.chartData.Items.push(currItem);
                                //                    }
                                //                } else {
                                //                    $scope.dataStore.chartData.Items.push(currItem);
                                //                }
                                //            }
                                //            //Recreate the chart....Need a better way, amChart.Validate() should be used.
                                //            $scope.buildChart(newPesk);
                                //        }
                                //        //} else {
                                //        //    //Set chart interval to new interval
                                //        //    $scope.dataStore.chartData.Interval = result.data.Interval;
                                //        //    var newChartData = [];
                                //        //    var nextDate = null;
                                //        //    var prevChartData = {};
                                //        //    var arr = $scope.dataStore.chartData.ChartData;
                                //        //    //Calculate new interval using the old data
                                //        //    for (var i = 0; i < arr.length - 1; i++) {
                                //        //        var currentDate = new Date(arr[i].Date);
                                //        //        if (nextDate !== null) {
                                //        //            if (currentDate.valueOf() < nextDate.valueOf()) {
                                //        //                if (arr[i].High > prevChartData.High) {
                                //        //                    prevChartData.High = arr[i].High;
                                //        //                }
                                //        //                if (arr[i].Low < prevChartData.Low) {
                                //        //                    prevChartData.Low = arr[i].Low;
                                //        //                }
                                //        //                prevChartData.Volume = prevChartData.Volume + arr[i].Volume;
                                //        //                prevChartData.Close = arr[i].Close;
                                //        //            } else if (currentDate.valueOf() == nextDate.valueOf()) {
                                //        //                newChartData.push({ Open: prevChartData.Open, High: prevChartData.High, Low: prevChartData.Low, Close: arr[i].Close, Volume: prevChartData.Volume, Date: currentDate });
                                //        //                prevChartData = {};
                                //        //                nextDate = null;
                                //        //            }
                                //        //        } else {
                                //        //            //Set the interval 5 minutes from the first point received
                                //        //            nextDate = currentDate;
                                //        //            nextDate.setMinutes(nextDate.getMinutes() + 4);
                                //        //            angular.copy(arr[i], prevChartData);
                                //        //            prevChartData.Date = nextDate;
                                //        //        }
                                //        //    }
                                //        //    //Make sure we push the last point
                                //        //    if (nextDate !== null) {
                                //        //        newChartData.push(prevChartData);
                                //        //    }
                                //        //    //Check the last value and compare the dates if they are the same else add the point
                                //        //    angular.forEach(result.data.ChartData, function (value) {
                                //        //        if (value.Date.valueOf() == prevChartData.Date.valueOf()) {
                                //        //            prevChartData.High = value.High;
                                //        //            prevChartData.Low = value.Low;
                                //        //            prevChartData.Open = value.Open;
                                //        //            prevChartData.Close = value.Close;
                                //        //            prevChartData.Volume = value.Volume;
                                //        //        } else {
                                //        //            this.push(value);
                                //        //        }
                                //        //    }, newChartData);
                                //        //    //Replace existing data with the new calculated data
                                //        //    $scope.dataStore.chartData.ChartData = newChartData;
                                //    }
                                //}
                            }
                        }, function (result) {
                            $scope.loading = false;
                            var logInfo = {
                                message: "An error has occured while loading market movers!",
                                status: result.status,
                                url: result.config.url
                            };
                            $log.error(angular.toJson(logInfo));
                        });
                }
            }, 60000);
        };

        // When the controller gets destroyed, remove the WL subscriptions.
        // When the controller gets destroyed, remove the WL subscriptions.
        $scope.$on("$destroy", function () {
            if (angular.isDefined(stockchartTimer)) {
                $interval.cancel(stockchartTimer);
                stockchartTimer = undefined;
            }
        });

        $scope.formatLabel = function (value, valueString, axis) {
            valueString = value;
            return valueString;
        };

        $scope.formatTooltip = function (graphDataItem, graph) {
            return graphDataItem.values.value;
        };

        // Function used to create the amChart
        $scope.createamChart = function () {
            AmCharts.makeChart("chartdiv", {
                type: "stock",
                "theme": "none",
                pathToImages: "images/",

                categoryAxesSettings: {
                    minPeriod: "mm",
                    color: "#fff"
                },

                dataSets: [{
                    color: "#118A11",
                    fieldMappings: [{
                        fromField: "close",
                        toField: "close"
                    }, {
                        fromField: "volume",
                        toField: "volume"
                    }],
                    dataProvider: $scope.dataStore.chartData.chartData,
                    categoryField: "date"
                }],

                panels: [{
                    showCategoryAxis: false,
                    title: "Value",
                    percentHeight: 70,
                    color: "#fff",

                    stockGraphs: [{
                        id: "g1",
                        lineColor: "#118A11",
                        fillColors: "#118A11",
                        fillAlphas: 0.4,
                        valueField: "close",
                        type: "line",
                        lineThickness: 2,
                        bullet: "none",
                        color: "#fff",
                        negativeBase: $scope.dataStore.chartData.previousClose,
                        negativeLineColor: "#BE1212",
                        negativeFillColors: "#BE1212",
                        negativeFillAlphas: 0.4,
                        balloonFunction: $scope.formatTooltip
                    }],
                    stockLegend: {
                        valueTextRegular: " ",
                        markerType: "none",
                        color: "#fff"
                    },

                    valueAxes: [{
                        inside: false,
                        showLastLabel: true,
                        labelFunction: $scope.formatLabel,
                        includeGuidesInMinMax: $scope.dataStore.chartData.previousClose === 0 ? false : true,
                        guides: [{
                            value: $scope.dataStore.chartData.previousClose,
                            lineAlpha: 0.8,
                            lineColor: "#fff",
                            label: "",
                            position: "left"
                        }]
                    }]
                },
                {
                    title: "Volume",
                    percentHeight: 30,
                    color: "#fff",

                    stockGraphs: [{
                        valueField: "volume",
                        type: "column",
                        cornerRadiusTop: 2,
                        fillAlphas: 1,
                        color: "#fff",
                        lineColor: "#C0083B",
                        fillColors: "#C0083B",
                        useDataSetColors: false,
                        periodValue: "Sum"
                    }],

                    stockLegend: {
                        valueTextRegular: " ",
                        markerType: "none",
                        color: "#fff"
                    }
                }
                ],

                chartScrollbarSettings: {
                    graph: "g1",
                    usePeriod: "10mm",
                    position: "top",
                    enabled: false
                },

                chartCursorSettings: {
                    valueBalloonsEnabled: true,
                    zoomable: false
                },

                periodSelector: {
                    position: "none",
                    inputFieldsEnabled: false,
                    periods: [{
                        period: "hh",
                        count: 1,
                        label: "1 hour"
                    }, {
                        period: "hh",
                        count: 2,
                        label: "2 hours"
                    }, {
                        period: "hh",
                        count: 5,
                        label: "5 hours"
                    }, {
                        period: "hh",
                        count: 8,
                        label: "8 hours"
                    }, {
                        period: "MAX",
                        label: "MAX",
                        selected: true
                    }]
                },

                panelsSettings: {
                    usePrefixes: true
                }

            });
        };

        AmCharts.useUTC = $rootScope.useUTC;

        $scope.createamChartIndex = function () {
            AmCharts.makeChart("chartdiv", {
                type: "stock",
                "theme": "none",
                pathToImages: "images/",

                categoryAxesSettings: {
                    minPeriod: "mm",
                    color: "#fff"
                },

                dataSets: [{
                    color: "#118A11",
                    fieldMappings: [{
                        fromField: "close",
                        toField: "close"
                    }],
                    dataProvider: $scope.dataStore.chartData.chartData,
                    categoryField: "date"
                }],

                panels: [{
                    showCategoryAxis: true,
                    title: "Value",
                    color: "#fff",

                    stockGraphs: [{
                        id: "g1",
                        lineColor: "#118A11",
                        fillColors: "#118A11",
                        fillAlphas: 0.4,
                        valueField: "close",
                        type: "line",
                        lineThickness: 2,
                        bullet: "none",
                        color: "#fff",
                        negativeBase: $scope.dataStore.chartData.previousClose,
                        negativeLineColor: "#BE1212",
                        negativeFillColors: "#BE1212",
                        negativeFillAlphas: 0.4,
                        balloonFunction: $scope.formatTooltip
                    }],
                    stockLegend: {
                        valueTextRegular: " ",
                        markerType: "none",
                        color: "#fff"
                    },

                    valueAxes: [{
                        inside: false,
                        showLastLabel: true,
                        labelFunction: $scope.formatLabel,
                        includeGuidesInMinMax: $scope.dataStore.chartData.previousClose === 0 ? false : true,
                        guides: [{
                            value: $scope.dataStore.chartData.previousClose,
                            lineAlpha: 0.8,
                            lineColor: "#fff",
                            label: "Prev. Close",
                            position: "left"
                        }]
                    }]
                }],

                chartScrollbarSettings: {
                    graph: "g1",
                    usePeriod: "10mm",
                    position: "top",
                    enabled: false
                },

                chartCursorSettings: {
                    valueBalloonsEnabled: true,
                    zoomable: false
                },

                periodSelector: {
                    position: "none",
                    periods: [{
                        period: "hh",
                        count: 1,
                        label: "1 hour"
                    }, {
                        period: "hh",
                        count: 2,
                        label: "2 hours"
                    }, {
                        period: "hh",
                        count: 5,
                        label: "5 hour"
                    }, {
                        period: "hh",
                        count: 12,
                        label: "12 hours"
                    }, {
                        period: "MAX",
                        label: "MAX",
                        selected: true
                    }]
                },

                panelsSettings: {
                    usePrefixes: true
                }

            });
        };

        if (!angular.isDefined($scope.dataStore.chartData)) {
            $scope.dataStore.chartData = blankChart;
        } else {
            if ($scope.dataStore.chartData.PESK !== '') {
                var newPesk = $scope.dataStore.chartData.exchangeSymbolKey.split('_').join(' ');
                $scope.buildChart(newPesk);
            }
        }
        $scope.startTimer();
    }]);