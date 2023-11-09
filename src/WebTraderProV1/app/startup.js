var app = angular.module("ntWTP", ['ngRoute', 'ngTouch', 'ngResource', 'ngAnimate',
                                   'ui.bootstrap', 'toaster', 'angular-loading-bar',
                                   'ngStorage']);

function fetchData() {
    var initInjector = angular.injector(["ng"]);
    var $http = initInjector.get("$http");
    return $http.get("config.json").then(function (response) {
        app.constant("ntConfig", response.data);
    }, function (errorResponse) {
        console.error("***Cannont find configuration file.***");
    });
}

function bootstrapApplication() {
    angular.element(document).ready(function () {
        angular.bootstrap(document, ["ntWTP"], {
            strictDi: true
        });
    });
}

function isStorageSupported(storageType) {
    try {
        var supported = window[storageType];

        // When Safari (OS X or iOS) is in private browsing mode, it appears as though localStorage
        // is available, but trying to call .setItem throws an exception below:
        // "QUOTA_EXCEEDED_ERR: DOM Exception 22: An attempt was made to add something to storage that exceeded the quota."
        if (supported && storageType === 'localStorage') {
            var key = '__' + Math.round(Math.random() * 1e7);

            try {
                localStorage.setItem(key, key);
                localStorage.removeItem(key);
            }
            catch (err) {
                supported = false;
            }
        }
        return supported;
    } catch (e) {
        return false;
    }
}

if (isStorageSupported('sessionStorage') && (isStorageSupported('localStorage'))) {
    fetchData().then(bootstrapApplication);
} else {
    document.getElementById('divPrivateBrowsing').style.display = 'block';
    console.warn('This browser does not support Web Storage!');
}

