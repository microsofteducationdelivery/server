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

/**/
          var reader;
          var progress = WinJS.Utilities.query('.percent')[0];

          function errorHandler(evt) {
            switch(evt.target.error.code) {
              case evt.target.error.NOT_FOUND_ERR:
                alert('File Not Found!');
                break;
              case evt.target.error.NOT_READABLE_ERR:
                alert('File is not readable');
                break;
              case evt.target.error.ABORT_ERR:
                break;
              default:
                alert('An error occurred reading this file.');
            }
          }

          function updateProgress(evt) {
            if (evt.lengthComputable) {
              var percentLoaded = Math.round((evt.loaded / evt.total) * 100);
              if (percentLoaded < 100) {
                progress.style.width = percentLoaded + '%';
              }
            }
          }

          function handleFileSelect(evt) {
            progress.style.width = '0%';

            reader = new FileReader();
            reader.onerror = errorHandler;
            reader.onprogress = updateProgress;

            reader.onload = function(e) {
              progress.style.width = '100%';
            };

            reader.readAsBinaryString(evt.target.files[0]);
          }

          WinJS.Utilities.query('#files')[0].addEventListener('change', handleFileSelect, false);

          /**/

            form.name.oninput = function (element) {
                if (form.file.files[0]) {
                    okBtn.disabled = !(me.isValidType(form.file.files[0].type) && form.name.value);
                }
            };
            form.FolderId.value = options.libraryId;
            form.action += '?token=' + localStorage.getItem('token');

            form.file.onchange = function (element) {
              var progressBar = WinJS.Utilities.query('#progress_bar')[0];


                if(element.target.files.length > 0) {
                  WinJS.Utilities.query('#progress_bar')[0].className = 'loading';



                  if(element.target.files[0].name.length > 20) {
                    fileNameField.innerHTML = element.target.files[0].name.substring(0, 20) + '...' + element.target.files[0].type.split('/')[1];
                  } else {
                    fileNameField.innerHTML = element.target.files[0].name;
                  }

                    var type = me.getType(element.target.files[0].type);
                    if (type) {
                        form.type.value = type.text;
                        icon.className = 'fa ' + type.icon;
                        var isLoaded = (me.isValidType(element.target.files[0].type) && form.name.value);
                        okBtn.disabled = !isLoaded ;
                      if( isLoaded ) {
                        WinJS.Utilities.removeClass(progressBar, 'loading');
                      }
                    } else {
                        okBtn.disabled = true;
                    }
                }
            };


            WinJS.Utilities.query('button.b-button-cancel', element).listen('click', function () {
                window.hidePopup();
            });
            WinJS.Utilities.query('button.b-button-ok', element).listen('click', function () {

              WinJS.Utilities.query('button.b-button-cancel', element)[0].setAttribute('style', 'display: none');
              WinJS.Utilities.query('button.b-button-ok', element)[0].disabled = true;
              WinJS.Utilities.query('button.b-button-ok', element)[0].innerHTML = 'Uploading ...';
              WinJS.Utilities.query('.b_upload-field__container', element)[0].setAttribute('style', 'display: none');

              window.hidePopup();
              window.showPopup('/resources/pages/popups/uploading-file.html');

                $(form).ajaxSubmit({
                    success: function () {
                        if (options.callback && typeof(options.callback) === 'function') {
                            options.callback();
                        }

                        window.hidePopup();
                    },
                    error: function () {
                        if (options.error && typeof(options.error) === 'function') {
                            options.error();
                        }
                        window.hidePopup();
                    }
                });


            });
        },
        isValidType: function (fileType) {
            var type = fileType.toLowerCase();
            if (type.search('image') !== -1 ) {
                return true;
            }
            if (type.search('video') !== -1) {
                return true;
            }
            if (type.search('text/plain') !== -1) {
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