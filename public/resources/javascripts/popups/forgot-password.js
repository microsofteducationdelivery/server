/**
 * Created by kanuny on 12.09.14.
 */
(function () {

  'use strict';

  WinJS.UI.Pages.define('/resources/pages/popups/forgot-password.html', {

    ready: function (element) {
      WinJS.Utilities.query('button.b-button-ok', element).listen('click', function () {
        var email = WinJS.Utilities.query('input[type=email]', element)[0];

        if (email && email.validity.valid) {
          MED.Server.xhr({
            type: 'PUT',
            url: '/api/auth/passwordRecovery/' + email.value,
            responseType: 'json',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }).done(function () {
            WinJS.Utilities.query('.b-main__link-active').removeClass('b-main__link-active');
            WinJS.Utilities.query('.main-navigation-link')[0].classList.add('b-main__link-active');
            WinJS.Navigation.navigate('/resources/pages/getStarted.html');
          });
          window.hidePopup();

        }
      });

      WinJS.Utilities.query('button.b-button-cancel', element).listen('click', function () {
        window.hidePopup();
      });
    },
    _getParam: function (obj) {
      var s = [];
      for (var p in obj) {
        if (!obj.hasOwnProperty(p)) {
          continue;
        }
        s.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
      }
      return s.join( "&" ).replace(/%20/g, "+");
    }
  });
})();