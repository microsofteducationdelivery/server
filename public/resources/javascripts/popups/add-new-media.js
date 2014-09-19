/**
 * Created by kanuny on 11.08.14.
 */
(function () {
    'use strict';
    WinJS.UI.Pages.define("/resources/pages/popups/add-new-media.html", {

        ready: function (element, options) {
            var me = this,
                form = element.querySelector('form'),
                fileNameField = WinJS.Utilities.query('span[class=b-library-edit--form__filename]', element)[0],
                icon = WinJS.Utilities.query('i', element)[0],
                okBtn = WinJS.Utilities.query('button[class=b-button-ok]')[0]
            ;

            form.name.oninput = function (element) {
                if (form.file.files[0]) {
                    okBtn.disabled = !(me.isValidType(form.file.files[0].type) && form.name.value);
                }

            };
            form.file.onchange = function (element) {
                if(element.target.files.length > 0) {
                    fileNameField.innerHTML = element.target.files[0].name;
                    var type = me.getType(element.target.files[0].type);
                    if (type) {
                        form.type.value = type.text;
                        icon.className = 'fa ' + type.icon;
                        okBtn.disabled = !(me.isValidType(element.target.files[0].type) && form.name.value);
                    } else {
                        okBtn.disabled = true;
                    }
                }
            };

            $('#mediaForm').ajaxForm(function() {
                window.hidePopup();
            });

            WinJS.Utilities.query('button.b-button-cancel', element).listen('click', function () {
                window.hidePopup();
            });
            WinJS.Utilities.query('button.b-button-ok', element).listen('click', function () {
                form.submit();

            });
        },
        isValidType: function (fileType) {
            var type = fileType.toLowerCase();
            if (type.search('png') !== -1 ) {
                return true;
            }
            if (type.search('jpg') !== -1) {
                return true;
            }
            if (type.search('avi') !== -1) {
                return true;
            }
            if (type.search('mp4') !== -1) {
                return true;
            }
            if (type.search('txt') !== -1) {
                return true;
            }

            return false;
        },
        getType: function (type) {
            if (type.search('video') !== -1 ) {
                return {text: 'video', icon: 'fa-video-camera'};
            }
            if (type.search('image') !== -1) {
                return {text: 'image', icon: 'fa-picture-o'};
            }
            if (type.search('text') !== -1) {
                return {text: 'text', icon: 'fa-file-text'};
            }
        }

    });
}());