/* global angular: false */
/* global app: false */
'use strict';
app.controller('newsContentController', ['$scope', '$rootScope', '$http', '$log', '$modalInstance', 'ntDataStore', 'authService', 'newsId',
    function ($scope, $rootScope, $http, $log, $modalInstance, ntDataStore, authService, newsId) {
        $scope.dataStore = ntDataStore;
        $scope.newsId = newsId;
        $scope.data = null;
        $scope.close = function () {
            $modalInstance.dismiss('cancel');
        };
        $scope.getNewsContent = function () {
            $http.get($rootScope.serviceBase + `/api/marketdata/news/${$scope.newsId}`).success(function (data) {
                $scope.data = data;
            })
            .error(function (data, status, headers, config) {
                $scope.data = null;
                var logInfo = {
                    message: data || "An error has occured while loading news content for newsId: " + $scope.newsId,
                    status: status,
                    url: config.url
                };
                $log.error(angular.toJson(logInfo));
            });
        };
        $scope.getNewsContent();
    }]);
