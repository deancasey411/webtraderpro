/* global angular: false */
/* global app: false */
'use strict';
app.controller('instrumentselectController', ['$scope', '$rootScope', '$http', '$modalInstance', 'instrumentCollection',
    function ($scope, $rootScope, $http, $modalInstance, instrumentCollection) {
        var instrumentDetails = function (pesk, symbol, name) {
            this.pesk = pesk;
            this.symbol = symbol;
            this.name = name;
        };

        $scope.instruments = instrumentCollection;

        $scope.selectInstrument = function (selectedInstrument) {
            $modalInstance.close(selectedInstrument);
        };
        $scope.close = function () {
            $modalInstance.dismiss('cancel');
        };

        
    }]);
