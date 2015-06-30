(function () {

  'use strict';

  WinJS.UI.Pages.define('/resources/pages/popups/user-import.html', {

    ready: function (element, options) {

      var fileNameField = WinJS.Utilities.query('span[class=b-library-edit--form__filename]', element)[0],
        form = element.querySelector('.b-library-edit--form'),
        okBtn = WinJS.Utilities.query('button[class=b-button-ok]')[0];

      okBtn.disabled = true;

      form.file.onchange = function (element) {
        if(element.target.files.length > 0) {
          var type = element.target.files[0].type;

          if (type.indexOf('openxmlformats-officedocument.spreadsheetml') !== -1) {
            fileNameField.innerHTML = element.target.files[0].name;
            okBtn.disabled = false;
          } else {
            window.hidePopup();
            window.showPopup('/resources/pages/popups/user-import-incorrect-type.html');
          }
        }
      };

      WinJS.Utilities.query('button.b-button-cancel', element).listen('click', function () {
        window.hidePopup();
      });

      WinJS.Utilities.query('button.b-button-ok', element).listen('click', function () {

        $(form).ajaxSubmit({
          headers: {
            Authorization: 'Bearer ' + WinJS.Application.sessionState.token,
            Accept: '*'
          },
          dataType: 'binary',
          success: function (result) {

            if(result.size > 2) {
              saveAs(result, 'tableError.xlsx');
            } else {
              window.hidePopup();
              options.callback();
            }
          },
          error: function (error, errorType) {
            console.log(error);
          }
        });

      });
    }
  });
})();
