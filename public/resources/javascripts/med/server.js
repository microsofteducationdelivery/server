/**
 * Created by kanuny on 25.09.14.
 */
(function () {

    'use strict';

    var xhr = function (options) {
        var type = options.responseType || 'json';

        options.headers = options.headers || {};
        options.responseType = 'text';
        options.headers['Content-Type'] = options.headers['Content-Type'] || 'application/json';

        return getXhrPromise(type, options);
    };
    var authXHR = function (options) {
        var type = options.responseType || 'json';

        options.headers = options.headers || {};
        options.responseType = 'text';
        options.headers['Content-Type'] = options.headers['Content-Type'] || 'application/json';
        if (WinJS.Application.sessionState.token) {
            options.headers.Authorization = 'Bearer ' + WinJS.Application.sessionState.token;
        }
        return getXhrPromise(type, options);
    };
    function getXhrPromise (type, options) {
        return new WinJS.Promise(
            function (c, e, p) {
                var callback = function (req) {
                    var response;
                    if (type === 'json') {
                        response = JSON.parse(req.responseText)
                    } else {
                        response = req.responseText;
                    }
                    if (c && typeof(c) === 'function') {
                        c({
                            response: response,
                            status: req.status,
                            statusText: req.statusText,
                            responseType: type,
                            readyState: req.readyState
                        });
                    }
                };
                WinJS.xhr(options).done(callback, e, p);
            }
        );
    }
    WinJS.Namespace.define("MED.Server", {
        xhr: xhr,
        authXHR: authXHR
    });

    WinJS.UI.processAll();
})();