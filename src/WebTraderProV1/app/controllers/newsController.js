/* global angular: false */
/* global app: false */
'use strict';
app.controller('newsController', ['$scope', '$rootScope', '$log', '$http', '$modal', '$location', '$interval', '$filter', 'ntDataStore', 'authService',
    function ($scope, $rootScope, $log, $http, $modal, $location, $interval, $filter, ntDataStore, authService) {
        $scope.dataStore = ntDataStore;

        if (!authService.authentication.isAuth) {
            $location.path('/login');
        }

        if (!angular.isDefined($scope.dataStore.newsHeadlines)) {
            $scope.dataStore.newsHeadlines = [];
            $http.get($rootScope.serviceBase + '/api/marketdata/exchanges/JSEMIT/newsheadlines?PageSize=999&IncludeServerCount=false').success(function (data) {
                if (angular.isDefined(data.items)) {
                    $scope.dataStore.newsHeadlines = data.items;
                }
                $scope.dataStore.newsLastUpdated = new Date();
            })
                .error(function (data, status, headers, config) {
                    $scope.dataStore.newsHeadlines = [];
                    var logInfo = {
                        message: data || "An error has occured while loading news headlines!",
                        status: status,
                        url: config.url
                    };
                    $log.error(angular.toJson(logInfo));
                });
        }

        var headlineTimer;
        $scope.startTime = function () {
            headlineTimer = $interval(function () {
                $http.get($rootScope.serviceBase + '/api/marketdata/exchanges/JSEMIT/newsheadlines?PageSize=999&IncludeServerCount=false').success(function (data) {
                    if (!angular.isDefined($scope.dataStore.newsHeadlines)) {
                        if (angular.isDefined(data.items)) {
                            $scope.dataStore.newsHeadlines = data.items;
                        }
                    } else {
                        if (angular.isDefined(data.items)) {
                            angular.forEach(data.items, function (value) {
                                var found = $filter('filter')(this, { id: value.id }, true);
                                if (found.length === 0) {
                                    this.push(value);
                                }
                            }, $scope.dataStore.newsHeadlines);
                        }
                    }
                    $scope.dataStore.newsLastUpdated = new Date();
                })
                .error(function (data, status, headers, config) {
                    $scope.dataStore.newsHeadlines = [];
                    var logInfo = {
                        message: data || "An error has occured while loading news headlines!",
                        status: status,
                        url: config.url
                    };
                    $log.error(angular.toJson(logInfo));
                });
            }, 60000);
        };

        //Open a modal window that searches for instruments
        $scope.showNewsContent = function (newsId) {
            if (newsId !== null && newsId !== '') {
                var newContent = $modal.open({
                    templateUrl: 'app/templates/newsContent.html',
                    controller: 'newsContentController',
                    backdrop: 'static',
                    size: 'lg',
                    resolve: {
                        newsId: function () {
                            return newsId;
                        }
                    }
                });
            }
        };

        $scope.startTime();

        // When the controller gets destroyed, remove the WL subscriptions.
        $scope.$on("$destroy", function () {
            if (angular.isDefined(headlineTimer)) {
                $interval.cancel(headlineTimer);
                headlineTimer = undefined;
            }
        });
    }]);
