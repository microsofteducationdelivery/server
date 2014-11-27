(function () {

  'use strict';

  var xhr = function (options) {
    var type = options.responseType || 'json';

    options.headers = options.headers || {};
    options.responseType = 'text';
    options.headers['Content-Type'] = options.headers['Content-Type'] || 'application/json';

    return WinJS.xhr(options).then(function (req) {
      var response = req.response;
      if (type === 'json' && req.responseText !== 'OK') {
        response = req.responseText ? JSON.parse(req.responseText) : null;
      }
      return {
        response: response,
        status: req.status,
        statusText: req.statusText,
        responseType: req.responseType,
        readyState: req.readyState,
        responseText: req.responseText
      };
    });
  };
  var authXHR = function (options) {
    if (WinJS.Application.sessionState.token) {
      options.headers = options.headers || {};
      options.headers.Authorization = 'Bearer ' + WinJS.Application.sessionState.token;
    }
    return xhr(options);
  };
  WinJS.Namespace.define('MED.Server', {
    xhr: xhr,
    authXHR: authXHR
  });
})();