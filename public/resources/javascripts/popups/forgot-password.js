/**
 * Created by kanuny on 12.09.14.
 */
(function () {
    'use strict';
    WinJS.UI.Pages.define("/resources/pages/popups/forgot-password.html", {

        ready: function (element, options) {
            var me = this;
            WinJS.Utilities.query('button.b-button-ok', element).listen('click', function () {
                var email = WinJS.Utilities.query('input[type=email]', element)[0];

                if (email && email.validity.valid) {
                    WinJS.xhr({
                        type: 'POST',
                        url: '/api/auth/passwordRecovery',
                        responseType: 'json',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        data: me._getParam({
                            email: email
                        })
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
}());