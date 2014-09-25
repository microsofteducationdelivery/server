(function () {
    'use strict';
    WinJS.UI.Pages.define("/resources/pages/popups/add-new-folder.html", {

        ready: function (element, options) {
            WinJS.Utilities.query('button.b-button-cancel', element).listen('click', function () {
                window.hidePopup();
            });
            WinJS.Utilities.query('button.b-button-ok', element).listen('click', function () {
                var name = WinJS.Utilities.query('input[type=text]', element)[0].value;

                MED.Server.authXHR({
                    url: '/api/folders',
                    type: 'POST',
                    data: JSON.stringify({parentId: options.parentId, name: name})
                }).done(
                    function (result) {
                        if (options.success && typeof(options.success) === 'function') {
                            options.success(result);
                        }
                        window.hidePopup();
                    },
                    function (err) {
                        console.log(err);
                        if (options.error && typeof(options.error) === 'function') {
                            options.error(err);
                        }
                        window.hidePopup();
                    }
                );


            });
        }

    });
}());