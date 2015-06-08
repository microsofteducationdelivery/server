(function () {

  'use strict';

  WinJS.UI.Pages.define('/resources/pages/popups/user-import.html', {

    ready: function (element, options) {

      var fileNameField = WinJS.Utilities.query('span[class=b-library-edit--form__filename]', element)[0],
        form = element.querySelector('form');

      form.file.onchange = function (element) {
        if(element.target.files.length > 0) {
          fileNameField.innerHTML = element.target.files[0].name;
          var type = element.target.files[0].type;
          if (type.indexOf('openxmlformats-officedocument.spreadsheetml') !== -1) {

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
        form.action += '?token=' + localStorage.getItem('token');
        $(form).ajaxSubmit({
          success: function (result) {
            if(result !== 'ok') {
              window.open("http://localhost:3000/tmpExcelDir/" + result, "_blank");
            } else {
              window.hidePopup();
              options.callback();
            }
          },
          error: function (error) {
           console.log(error);
          }
        });

      });
    }
  });
})();
