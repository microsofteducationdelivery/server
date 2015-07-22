(function () {

  'use strict';

  var login = function (creds) {
    return MED.Server.xhr({
      type: 'POST',
      url: '/api/auth/loginWithLiveId',
      responseType: 'json',
      data: JSON.stringify({
        email: creds.email,
        name: creds.name
      })
    });
  };
  var setCookie = function (token, expiresInSeconds) {
    var expiration = new Date();
    expiration.setTime(expiration.getTime() + expiresInSeconds * 1000);
    var cookie = 'odauth=' + token + '; path=/; expires=' + expiration.toUTCString();

    if (document.location.protocol.toLowerCase() === 'https') {
      cookie = cookie + ';secure';
    }

    document.cookie = cookie;
  };

  var getAuthInfoFromUrl = function () {
    if (window.location.hash) {
      var authResponse = window.location.hash.substring(1);
      return JSON.parse(
          '{"' + authResponse.replace(/&/g, '","').replace(/=/g, '":"') + '"}',
        function(key, value) { return key === '' ? value : decodeURIComponent(value); });
    }
    return false;
  };
  var onAuthenticated = function (token) {
    if (token) {
      (function($) {
        var odurl = 'https://apis.live.net/v5.0/me';
        var odquery = '?access_token=' + token;

        $.ajax({
          url: odurl + odquery,
          dataType: 'json',
          success: function(data) {
            login({
              email: data.emails.account,
              name: data.name
            }).done(function (req) {
              var response = req.response;

              localStorage.setItem('token', response.token);
              localStorage.setItem('user', JSON.stringify(response.user));
              window.location = '/admin.html';
            });
          }
        });
      })(jQuery);
    }
  };
  var onAuthCallback = function () {
    var authInfo = getAuthInfoFromUrl();
    var token = authInfo['access_token'];
    var expiry = parseInt(authInfo['expires_in']);
    setCookie(token, expiry);
    window.opener.MED.LiveAuth.onAuthenticated(token);

    window.close();

  };

  var popup = function (url) {
    var width = 525,
      height = 525,
      screenX = window.screenX,
      screenY = window.screenY,
      outerWidth = window.outerWidth,
      outerHeight = window.outerHeight;

    var left = screenX + Math.max(outerWidth - width, 0) / 2;
    var top = screenY + Math.max(outerHeight - height, 0) / 2;

    var features = [
      'width=' + width,
      'height=' + height,
      'top=' + top,
      'left=' + left,
      'status=no',
      'resizable=yes',
      'toolbar=no',
      'menubar=no',
      'scrollbars=yes'
    ];

    var popup = window.open(url, 'oauth', features.join(','));

    if (!popup) {
     return false;
    }

    popup.focus();
  };

  var getAppInfo = function () {
    var scriptTag = document.getElementById('odauth');
    var clientId = scriptTag.getAttribute('clientId');
    var scopes = scriptTag.getAttribute('scopes');
    var redirectUri = scriptTag.getAttribute('redirectUri');

    return {
      clientId: clientId,
      scopes: scopes,
      redirectUri: redirectUri
    };

  };
  var getTokenFromCookie =function () {
    var cookies = document.cookie;
    var name = 'odauth=';
    var start = cookies.indexOf(name);
    if (start >= 0) {
      start += name.length;
      var end = cookies.indexOf(';', start);
      if (end < 0) {
        end = cookies.length;
      }
      else {
        document.postCookie = cookies.substring(end);
      }

      return cookies.substring(start, end);
    }

    return '';
  };

  var challengeForAuth = function () {
    var appInfo = getAppInfo();

    var url =
      'https://login.live.com/oauth20_authorize.srf' +
      '?client_id=' + appInfo.clientId +
      '&scope=' + encodeURIComponent(appInfo.scopes) +
      '&response_type=token' +
      '&redirect_uri=' + encodeURIComponent(appInfo.redirectUri);
    popup(url);
  };

  var auth = function () {
    var token = getTokenFromCookie();
    if (token) {
      onAuthenticated(token);
    }
  };
  window.MED = {
    LiveAuth: {
      onAuthenticated: onAuthenticated,
      backgroundLogin: auth,
      challengeForAuth: challengeForAuth,
      onAuthCallback: onAuthCallback
    }
  };
})();
