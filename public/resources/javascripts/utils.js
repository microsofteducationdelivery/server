window.authXHR = function (options) {
  options.headers = options.headers || {};
  options.responseType = options.responseType || 'json';
  options.headers['Content-Type'] = options.headers['Content-Type'] || 'application/json';
  if (WinJS.Application.sessionState.token) {
    options.headers.Authorization = 'Bearer ' + WinJS.Application.sessionState.token;
  }
  return WinJS.xhr(options);
};

window.showPopup = function (location, options) {
  var popupHolder = document.querySelector('.b-popup-holder');
  popupHolder.innerHTML = '';
  WinJS.UI.Pages.render(location, popupHolder, options).then(function () {
    popupHolder.classList.add('b-popup-holder--visible');
  });
};

window.hidePopup = function () {
  var popupHolder = document.querySelector('.b-popup-holder');
  popupHolder.classList.remove('b-popup-holder--visible');
};