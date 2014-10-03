/**
 * Created by kanuny on 12.09.14.
 */
(function () {

  'use strict';

  WinJS.UI.Pages.define('/resources/pages/password-recovery.html', {

    ready: function (element, options) {
      WinJS.Utilities.query('.main-navigation-link.b-main__link-active').removeClass('b-main__link-active');
      WinJS.Utilities.query('input.b_recovery-btn', element).listen('click', function (e) {
        var newPass = WinJS.Utilities.query('input#new-pass', element)[0],
          confirmPass =  WinJS.Utilities.query('input#confirm-pass', element)[0],
          errorMsg = WinJS.Utilities.query('.b_error_msg', element)
          ;

        if (newPass && confirmPass) {
          e.preventDefault();
        }
        if (newPass.value === confirmPass.value) {
          errorMsg.addClass('hidden');
          MED.Server.xhr({
            type: 'POST',
            url: '/api/auth/passwordRecovery/',
            responseType: 'json',
            data: JSON.stringify({
              newPass: newPass.value,
              token: options.token.substr(1)
            })
          }).done(
            function (req) {
              WinJS.Navigation.navigate('/resources/pages/logReg.html');
            },
            function (request) {
              console.log(request.statusText);
            }
          );

        } else {
          errorMsg.removeClass('hidden');
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
      return s.join( '&' ).replace(/%20/g, '+');
    }

  });
}());