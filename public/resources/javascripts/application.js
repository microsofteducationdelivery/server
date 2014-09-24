function initialize() {
  var user = JSON.parse(localStorage.getItem('user')),
      token = localStorage.getItem('token');

  if ((!user || !token ) && window.location.pathname !== '/index.html') {
      window.location = '/index.html';
  }
  if (user && token && window.location.pathname === '/index.html') {
      window.location = '/admin.html';
  }


  WinJS.Application.sessionState.user = user;
  WinJS.Application.sessionState.token = localStorage.getItem('token');

  window.authXHR = function (options) {
    options.headers = options.headers || {};
    options.responseType = options.responseType || 'json';
    options.headers['Content-Type'] = options.headers['Content-Type'] || 'application/json';
    if (WinJS.Application.sessionState.token) {
      options.headers.Authorization = 'Bearer ' + WinJS.Application.sessionState.token;
    }
    return WinJS.xhr(options);
  };

   WinJS.UI.processAll();
}

document.addEventListener('DOMContentLoaded', initialize(), false);
