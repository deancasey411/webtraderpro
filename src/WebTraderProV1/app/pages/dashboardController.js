/* global angular: false */
/* global app: false */
'use strict';
app.controller('dashboardController', ['$scope', '$location', '$log', '$timeout', '$injector', 'authService', 'ntDataStore', 'toaster',
    function ($scope, $location, $log, $timeout, $injector, authService, ntDataStore, toaster) {
        $scope.dataStore = ntDataStore;

        $scope.popNotification = function (type, title, message) {
            toaster.pop(type, title, message);
        };

        $scope.pop = function (type, bg, title, message) {
            if (type === 'T') {
                toaster.pop(bg, title, message);
                $scope.$digest();
            }
        };

        $scope.publishOrderUpdate = function (info) {
            try {
                if (info !== null) {
                    var sMessage = "?";
                    var sUpdateType = "?";
                    if ((info.getValue("UpdateType") !== null) && (info.getValue("Message") !== null)) {
                        sUpdateType = info.getValue("UpdateType");
                        sMessage = info.getValue("Message");
                        $log.info(sUpdateType);
                        $scope.pop(sUpdateType, 'info', 'Trade Confirmation', sMessage);
                    }
                }
            } catch (e) {
                $log.error(angular.toJson(e));
            }
        };

        if (!authService.authentication.isAuth) {
            $location.path('/home');
        } else {
            $scope.counter = 0;
            $scope.onTimeout = function () {
                try {
                    if ((angular.isDefined($scope.dataStore.tradingAccountSubscriptions)) && ($scope.dataStore.tradingAccountSubscriptions.length > 0)) {
                        $timeout.cancel(subscribeOBTimer);
                        $scope.lightStreamer = $injector.get('ntLightstreamer');
                        if (angular.isDefined($scope.lightStreamer.ouSubscription)) {
                            return;
                        } else {
                            $scope.lightStreamer.subscribeOrderUpdates($scope.dataStore.tradingAccountSubscriptions, $scope.publishOrderUpdate);
                            $log.info('Trade confirmation enabled');
                        }
                    } else {
                        $scope.counter++;
                        if ($scope.counter > 10) {
                            $timeout.cancel(subscribeOBTimer);
                        } else {
                            subscribeOBTimer = $timeout($scope.onTimeout, 5000);
                        }
                    }
                } catch (e) {
                    $log.error(angular.toJson(e));
                }
            };
            var subscribeOBTimer = $timeout($scope.onTimeout, 5000);
        }
    }]);
