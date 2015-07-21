(function () {

  'use strict';

  var xhr = function (options) {
    var type = options.responseType || 'json';

    options.headers = options.headers || {};
    if (options.responseType === 'arraybuffer') {
      options.responseType = 'arraybuffer';
    } else {
      options.responseType = 'text';
    }

    options.headers['Content-Type'] = options.headers['Content-Type'] || 'application/json';

    if(options.type === 'GET') {
      if(options.url.indexOf('?') !== -1) {
        options.url = options.url + '&time='+ Math.random();
      } else {
        options.url = options.url + '?time='+ Math.random();
      }

    }

    return WinJS.xhr(options).then(function (req) {
      var response = req.response;
      if (type === 'json' && req.responseText !== 'OK') {
        response = req.responseText ? JSON.parse(req.responseText) : null;
      }
      var rText;
      if (req.responseType === 'arraybuffer') {
        response = req.response;
      } else {
        rText = req.responseText;
      }

      return {
        response: response,
        status: req.status,
        statusText: req.statusText,
        responseType: req.responseType,
        readyState: req.readyState,
        responseText: rText
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

  var fileXHR = function (options) {

    if (WinJS.Application.sessionState.token) {
      options.headers = options.headers || {};
      options.headers.Authorization = 'Bearer ' + WinJS.Application.sessionState.token;
    }

    return xhr(options);
  };
  WinJS.Namespace.define('MED.Server', {
    xhr: xhr,
    authXHR: authXHR,
    fileXHR: fileXHR
  });
})();