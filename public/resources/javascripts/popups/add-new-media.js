/**
 * Created by kanuny on 11.08.14.
 */
(function () {
    'use strict';
    WinJS.UI.Pages.define("/resources/pages/popups/add-new-media.html", {

        ready: function (element, options) {
            WinJS.Utilities.query('button.b-button-cancel', element).listen('click', function () {
                window.hidePopup();
            });
            WinJS.Utilities.query('button.b-button-ok', element).listen('click', function () {
                var form = element.querySelector('form'),
                    data = {
                        type: form.type.value,
                        name: form.name.value,
                        file: form.file.value,
                        link: form.link.value,
                        keywords: form.keywords.value,
                        id: options.libraryId
                    };

                window.authXHR({
                    url: '/api/media/' + data.id,
                    type: 'PUT',
                    data: JSON.stringify(data)
                }).done(function (result) {
                    if (result.status !== 200) {
                        return null;
                    }
                    window.hidePopup();
                });
            });
        }

    });
}());