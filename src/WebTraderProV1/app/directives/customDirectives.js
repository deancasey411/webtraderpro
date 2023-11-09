/* global angular: false */
/* global app: false */
'use strict';

app.directive('focusOn', [function () {
    return function (scope, elem, attr) {
        scope.$on(attr.focusOn, function (e) {
            elem[0].focus();
        });
    };
}]);

app.directive('capitalize', [function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, modelCtrl) {
            var capitalize = function (inputValue) {
                if (!(angular.isDefined(inputValue) && (inputValue !== null))) {
                    inputValue = '';
                }
                var capitalized = inputValue.toUpperCase();
                if (capitalized !== inputValue) {
                    modelCtrl.$setViewValue(capitalized);
                    modelCtrl.$render();
                }
                return capitalized;
            };
            modelCtrl.$parsers.push(capitalize);
            capitalize(scope[attrs.ngModel]);  // capitalize initial value
        }
    };
}]);

//Below version can be used when moving to v1.3.x of angularjs
app.directive('overwriteMinNew', [function () {

    return {
        require: 'ngModel',
        restrict: '',
        link: function (scope, elm, attrs, ctrl) {
            // only apply the validator if ngModel is present and Angular has added the number validator
            if (ctrl && ctrl.$validators.min) {
                // this will overwrite the default Angular number validator
                ctrl.$validators.min = function (modelValue) {
                    if (ctrl.$isEmpty(modelValue)) {
                        return false;
                    } else if (scope.orderType === 'MO' || scope.orderType === 'SO') {
                        return true;
                    } else if (scope.orderType === 'LO' || scope.orderType === 'SL') {
                        if (modelValue > 0) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                };
            }
        }
    };
}]);

//This is a very specific directive used for order entry where the price can be a zero but
//only if it is a Market Order.
app.directive('overwriteMin', ['$parse', function ($parse) {
    return {
        require: 'ngModel',
        link: function (scope, ele, attrs, ctrl) {
            scope.$watch(attrs.ngModel, function (value, ctrl) {
                if (scope.orderDetails.OrderType === 'MO' || scope.orderDetails.OrderType === 'SO') {
                    return value;
                } else if (scope.orderDetails.OrderType === 'LO') {
                    if (angular.isNumber(value) && value > 0) {
                        return value;
                    } else {
                        scope.orderDetails.Price = null;
                        return null;
                    }
                } else if (scope.orderDetails.OrderType === 'SL') {
                    if (angular.isNumber(value) && value > 0) {
                        return value;
                    } else {
                        scope.orderDetails.TriggerPrice = null;
                        return null;
                    }
                }
            });
        }
    };
}]);

//This will capture the Enter keypress and allow for a function to be called
app.directive('ntEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.ntEnter);
                });

                event.preventDefault();
            }
        });
    };
});

////Truncate
//angular.module('ng').filter('truncate', function () {
//    return function (value, wordwise, max, tail) {
//        if (!value) return '';

//        max = parseInt(max, 10);
//        if (!max) return value;
//        if (value.length <= max) return value;

//        value = value.substr(0, max);
//        if (wordwise) {
//            var lastspace = value.lastIndexOf(' ');
//            if (lastspace != -1) {
//                value = value.substr(0, lastspace);
//            }
//        }

//        return value + (tail || ' …');
//    };
//});

//ngTouch and modal window bug workaround
//https://github.com/angular-ui/bootstrap/issues/2017
app.directive('stopEvent', [function () {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            element.on(attr.stopEvent, function (e) {
                e.stopPropagation();
            });
        }
    };
}]);

//Used to highlight value changes
app.directive('highlight', ['$timeout', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            scope.$watch(attrs.highlight, function (nv, ov, scope) {
                function settimeout() {
                    attrs.timeout = $timeout(function () {
                        element.removeClass('highlight highlight-up');
                        element.removeClass('highlight highlight-down');
                        element.removeClass('highlight highlight-unchanged');
                        attrs.timeout = null;
                    }, 1000);
                }
                if (nv !== ov) {
                    if (attrs.timeout) {
                        //newvalue already set.. reset timeout
                        $timeout.cancel(attrs.timeout);
                        settimeout();
                    } else {
                        var change = scope[attrs.changeItem][attrs.changeProp];
                        if (change !== null) {
                            if (change > 0) {
                                element.addClass('highlight highlight-up');
                            } else if (change < 0) {
                                element.addClass('highlight highlight-down');
                            } else {
                                element.addClass('highlight highlight-unchanged');
                            }
                        }
                        settimeout();
                    }
                }
            });
        }
    };
}]);
