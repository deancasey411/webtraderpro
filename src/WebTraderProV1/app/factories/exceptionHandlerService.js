/* global angular: false */
/* global app: false */
'use strict';
app.factory("$exceptionHandler", [function () {
    return function (exception) {
        console.error(exception.message);
    };
}]);