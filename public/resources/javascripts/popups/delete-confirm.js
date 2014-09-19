/**
 * Created by kanuny on 09.09.14.
 */
(function () {
    'use strict';
    WinJS.UI.Pages.define("/resources/pages/popups/delete-confirm.html", {

        ready: function (element, options) {
            WinJS.Utilities.query('button.b-button-cancel', element).listen('click', function () {
                window.hidePopup();
            });
            WinJS.Utilities.query('button.b-button-ok', element).listen('click', function () {
                options.callback();
                window.hidePopup();
            });
        }

    });
}());