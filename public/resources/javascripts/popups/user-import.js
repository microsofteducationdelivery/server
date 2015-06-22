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
          fileNameField.innerHTML = element.target.files[0].name;
          okBtn.disabled = false;
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

        $.ajaxTransport("+binary", function(options, originalOptions, jqXHR){
          if (window.FormData && ((options.dataType && (options.dataType == 'binary')) || (options.data && ((window.ArrayBuffer && options.data instanceof ArrayBuffer) || (window.Blob && options.data instanceof Blob)))))
          {
            return {
              send: function(headers, callback){
                var xhr = new XMLHttpRequest(),
                  url = options.url,
                  type = options.type,
                  async = options.async || true,
                  dataType = options.responseType || "blob",
                  data = options.data || null,
                  username = options.username || null,
                  password = options.password || null;

                xhr.addEventListener('load', function(){
                  var data = {};
                  data[options.dataType] = xhr.response;
                  callback(xhr.status, xhr.statusText, data, xhr.getAllResponseHeaders());
                });

                xhr.open(type, url, async, username, password);

                for (var i in headers ) {
                  xhr.setRequestHeader(i, headers[i] );
                }

                xhr.responseType = dataType;
                xhr.send(data);
              },
              abort: function(){
                jqXHR.abort();
              }
            };
          }
        });
        $(form).ajaxSubmit({
          headers: {
            Authorization: 'Bearer ' + WinJS.Application.sessionState.token,
            Accept: '*'
          },
          dataType: 'binary',
          success: function (result) {

            debugger;
            if(result !== 'ok') {
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
