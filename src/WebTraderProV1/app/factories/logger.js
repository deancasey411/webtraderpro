/* global angular: false */
/* global app: false */
'use strict';
app.service('$log', ['$rootScope', function ($rootScope) {
    this.log = function (msg) {
        alert(msg);
    }
    this.debug = function (msg) {
        alert(msg);
    }
    this.info = function (msg) {
        alert(msg);
    }
    this.warn = function (msg) {
        alert(msg);
    }
    this.error = function (msg) {
        alert(msg);
    }
}]);