/* global angular: false */
/* global app: false */
'use strict';
app.controller('audittrailController', ['$scope', '$log',
    function ($scope, $log) {
        $scope.$log = $log;
        alert($log.info.le)
    }]);