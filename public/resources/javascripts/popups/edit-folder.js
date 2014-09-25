/**
 * Created by kanuny on 04.09.14.
 */
(function () {
    'use strict';
    WinJS.UI.Pages.define("/resources/pages/popups/edit-folder.html", {

        ready: function (element, options) {
            var title = options.name;

            WinJS.Utilities.query('h2', element)[0].innerHTML = title;

            WinJS.Utilities.query('button.b-button-cancel', element).listen('click', function () {
                window.hidePopup();
            });
            WinJS.Utilities.query('button.b-button-ok', element).listen('click', function () {
                var name = WinJS.Utilities.query('input[type=text]', element)[0].value;

                MED.Server.authXHR({
                    url: '/api/folders/' + options.id,
                    type: 'PUT',
                    data: JSON.stringify({name: name})
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