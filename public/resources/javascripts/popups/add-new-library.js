(function () {
    'use strict';
    WinJS.UI.Pages.define("/resources/pages/popups/add-new-library.html", {

        ready: function (element, options) {
            WinJS.Utilities.query('button.b-button-cancel', element).listen('click', function () {
                window.hidePopup();
            });
            WinJS.Utilities.query('button.b-button-ok', element).listen('click', function () {
                var name = WinJS.Utilities.query('input[type=text]', element)[0].value;

                MED.Server.authXHR({
                    url: '/api/libraries',
                    type: 'POST',
                    data: JSON.stringify({name: name})
                }).done(function () {
                    window.hidePopup();
                    options.callback();
                });


            });
        }

    });
}());