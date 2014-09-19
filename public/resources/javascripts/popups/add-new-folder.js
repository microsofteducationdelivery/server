(function () {
    'use strict';
    WinJS.UI.Pages.define("/resources/pages/popups/add-new-folder.html", {

        ready: function (element, options) {
            WinJS.Utilities.query('button.b-button-cancel', element).listen('click', function () {
                window.hidePopup();
            });
            WinJS.Utilities.query('button.b-button-ok', element).listen('click', function () {
                var name = WinJS.Utilities.query('input[type=text]')[0].value;

                WinJS.xhr({
                    url: '/Folder',
                    type: 'POST',
                    data: name
                }).done(function (result) {
                    options.callback();
                    window.hidePopup();
                });


            });
        }

    });
}());