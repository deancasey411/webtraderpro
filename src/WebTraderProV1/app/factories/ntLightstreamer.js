/* global angular: false */
/* global app: false */
'use strict';
app.factory("ntLightstreamer", ['$rootScope', 'authService', function ($rootScope, authService) {
    var lsService = {};

    // The lightstreamer client
    lsService.lsClient = new LightstreamerClient($rootScope.lsUrl, "NUTCRACKER");

    //set the user name
    lsService.lsClient.connectionDetails.setUser(authService.authentication.userName);

    lsService.lsClient.connectionSharing.enableSharing("WebTraderProV2", "ATTACH", "CREATE");
    //lsService.lsClient.addListener(new StatusWidget("right", "0px", false));

    lsService.lsClient.addListener({
        onStatusChange: function (chngStatus) {
            switch (chngStatus) {
                case "CONNECTED:HTTP-STREAMING":
                case "CONNECTED:WS-STREAMING":
                    $rootScope.lsStatus = "Connected - " + lsService.getDataAdapterText();
                    break;
                case "CONNECTED:STREAM-SENSING":
                case "CONNECTING":
                    $rootScope.lsStatus = "Connecting - " + lsService.getDataAdapterText();
                    break;
                case "DISCONNECTED:WILL-RETRY":
                    $rootScope.lsStatus = "Disconnected - " + lsService.getDataAdapterText();
                    break;
                default:
                    $rootScope.lsStatus = chngStatus + " - " + lsService.getDataAdapterText();
                    break;
            }
        }
    });

    lsService.lsClient.connect();

    //Lighstreamer Field Subscriptions
    lsService.watchlistFields = function (threeLineDepth) {
        if (authService.authentication.roles.indexOf('RealTimeData') > -1) {
            if (threeLineDepth) {
                return ["Symbol", "L", "H", "BS1", "B1", "A1", "AS1", "BS2", "B2", "A2", "AS2", "BS3", "B3", "A3", "AS3", "LTP", "LTS", "LTT", "Chg", "ChgP", "Cls"];
            } else {
                return ["Symbol", "L", "H", "BS1", "B1", "A1", "AS1", "LTP", "LTS", "LTT", "Chg", "ChgP", "Cls"];
            }
        } else {
            return ["Symbol", "L", "H", "BS1", "B1", "A1", "AS1", "LTP", "LTS", "LTT", "Chg", "ChgP", "Cls"];
        }
    };

    lsService.stockinfoFields = function () {
        if (authService.authentication.roles.indexOf('RealTimeData') > -1) {
            return ["Symbol", "L", "H", "BS1", "B1", "A1", "AS1", "BS2", "B2", "A2", "AS2", "BS3", "B3", "A3", "AS3",
                    "LTP1", "LTS1", "LTT1", "LTP2", "LTS2", "LTT2", "LTP3", "LTS3", "LTT3", "LTP4", "LTS4", "LTT4", "LTP5", "LTS5", "LTT5",
                    "LTP", "LTS", "LTT", "Chg1", "Chg2", "Chg3", "Chg4", "Chg5", "Chg", "ChgP", "Cls", "TVol", "TVal", "NTrd", "St"];
        } else {
            return ["Symbol", "L", "H", "BS1", "B1", "A1", "AS1",
                    "LTP1", "LTS1", "LTT1", "LTP2", "LTS2", "LTT2", "LTP3", "LTS3", "LTT3", "LTP4", "LTS4", "LTT4", "LTP5", "LTS5", "LTT5",
                    "LTP", "LTS", "LTT", "Chg1", "Chg2", "Chg3", "Chg4", "Chg5", "Chg", "ChgP", "Cls", "TVol", "TVal", "NTrd", "St"];
        }
    };

    lsService.indexFields = ["Symbol", "LTP", "LTT", "Chg", "ChgP", "Cls"];
    lsService.orderEntryFields = ["Symbol", "BS1", "B1", "A1", "AS1", "LTP", "H", "L", "Chg"];
    lsService.orderUpdateFields = ["UpdateType", "Account", "FixSession", "Message"];

    //Used to manage watchlist subscriptions
    //items = array of pesk
    lsService.subscribeWatchlist = function (items, threeLineDepth, onItemUpdateFn) {
        lsService.subscription = new Subscription("MERGE", items, lsService.watchlistFields(threeLineDepth));
        lsService.subscription.setDataAdapter(lsService.getDataAdapter());
        lsService.subscription.setRequestedSnapshot("yes");
        lsService.subscription.setRequestedMaxFrequency(1);
        lsService.lsClient.subscribe(lsService.subscription);
        lsService.subscription.addListener({
            onItemUpdate: onItemUpdateFn
        });
    };

    //Clear the watchlist subscriptions when a user is changing to another watchlist.
    lsService.clearWLSubscriptions = function () {
        if (lsService.subscription !== null) {
            try {
                lsService.lsClient.unsubscribe(lsService.subscription);
                lsService.subscription = null;
            } catch (ex) {

            }
        }
    };

    //Used to manage index watchlist subscriptions
    //items = array of pesk
    lsService.subscribeIndexWatchlist = function (items, onItemUpdateFn) {
        lsService.iWLsubscription = new Subscription("MERGE", items, lsService.indexFields);
        lsService.iWLsubscription.setDataAdapter(lsService.getDataAdapter());
        lsService.iWLsubscription.setRequestedSnapshot("yes");
        lsService.iWLsubscription.setRequestedMaxFrequency(1);
        lsService.lsClient.subscribe(lsService.iWLsubscription);
        lsService.iWLsubscription.addListener({
            onItemUpdate: onItemUpdateFn
        });
    };

    //Clear the watchlist subscriptions when a user is changing to another watchlist.
    lsService.clearIndexWLSubscriptions = function () {
        if (lsService.iWLsubscription !== null) {
            try {
                lsService.lsClient.unsubscribe(lsService.iWLsubscription);
                lsService.iWLsubscription = null;
            } catch (ex) {

            }
        }
    };

    //Used to manage stock info subscriptions
    lsService.subscribeStockInfo = function (pesk, onItemUpdateFn) {
        lsService.clearSISubscriptions();
        lsService.siSubscription = new Subscription("MERGE", pesk, lsService.stockinfoFields());
        lsService.siSubscription.setDataAdapter(lsService.getDataAdapter());
        lsService.siSubscription.setRequestedSnapshot("yes");
        lsService.siSubscription.setRequestedMaxFrequency(1);
        lsService.lsClient.subscribe(lsService.siSubscription);
        lsService.siSubscription.addListener({
            onItemUpdate: onItemUpdateFn
        });
    };

    //Clear the stock info subscriptions when a user is changing to another symbol.
    lsService.clearSISubscriptions = function () {
        if (lsService.siSubscription !== null) {
            try {
                lsService.lsClient.unsubscribe(lsService.siSubscription);
                lsService.siSubscription = null;
            } catch (ex) {

            }
        }
    };

    //Used to manage order entry subscriptions
    lsService.subscribeOrderEntry = function (pesk, onItemUpdateFn) {
        lsService.clearOESubscriptions();
        lsService.oeSubscription = new Subscription("MERGE", pesk, lsService.orderEntryFields);
        lsService.oeSubscription.setDataAdapter(lsService.getDataAdapter());
        lsService.oeSubscription.setRequestedSnapshot("yes");
        lsService.oeSubscription.setRequestedMaxFrequency(1);
        lsService.lsClient.subscribe(lsService.oeSubscription);
        lsService.oeSubscription.addListener({
            onItemUpdate: onItemUpdateFn
        });
    };

    //Clear the order entry subscriptions.
    lsService.clearOESubscriptions = function () {
        if (lsService.oeSubscription !== null) {
            try {
                lsService.lsClient.unsubscribe(lsService.oeSubscription);
                lsService.oeSubscription = null;
            } catch (ex) {

            }
        }
    };

    //Used to manage orderbook update subscriptions
    //items = array of ["OBU:FIXSESSION:12345"]
    lsService.subscribeOrderUpdates = function (items, onItemUpdateFn) {
        lsService.ouSubscription = new Subscription("DISTINCT", items, lsService.orderUpdateFields);
        lsService.ouSubscription.setDataAdapter("TRADEMESSAGES");
        //lsService.ouSubscription.setDataAdapter("ORDERBOOKUPDATES");
        lsService.ouSubscription.setRequestedSnapshot("no");
        lsService.ouSubscription.setRequestedMaxFrequency(1);
        lsService.lsClient.subscribe(lsService.ouSubscription);
        lsService.ouSubscription.addListener({
            onItemUpdate: onItemUpdateFn
        });
    };

    lsService.getDataAdapter = function () {
        //Check if user gets delayed/realtimedata
        if ((angular.isDefined(authService)) && (angular.isDefined(authService.authentication)) && (authService.authentication.roles)) {
            if (authService.authentication.roles.indexOf('RealTimeData') > -1) {
                return "MARKETDATA";
            } else {
                return "DELAYEDMARKETDATA";
            }
        } else {
            return "DELAYEDMARKETDATA";
        }
    };

    lsService.getDataAdapterText = function () {
        //Check if user gets delayed/realtimedata
        if ((angular.isDefined(authService)) && (angular.isDefined(authService.authentication)) && (authService.authentication.roles)) {
            if (authService.authentication.roles.indexOf('RealTimeData') > -1) {
                return "Live Feed";
            } else {
                return "Delayed Feed";
            }
        } else {
            return "Delayed Feed";
        }
    };

    return lsService;
}]);