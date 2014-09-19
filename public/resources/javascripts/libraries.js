(function () {
  'use strict';
  var url = '/api/libraries'

  function getLibraries () {
    return window.authXHR({
      url: url,
      type: 'GET'
    }).then(function (result) {
        return result.response;
    });
  }


  WinJS.UI.Pages.define('/resources/pages/libraries.html', {
    init: function () {
      var me = this;
      return getLibraries().then( function (libraries) {me._data = libraries; });
    },

    ready: function (element, options) {

      WinJS.UI.processAll(element);
      WinJS.Utilities.query('.b-library-add-button').listen('click', function () {
        window.showPopup('/resources/pages/popups/add-new-library.html', {
          callback: function () {
            getLibraries().then(function (libraries) { tableControl.setData(libraries)});
          }
        });
      });

      var tableControl = WinJS.Utilities.query('div[class=b_libraries__table]')[0].winControl,
        selectedItems = [],
        deleteBtn = WinJS.Utilities.query('.b-libraries__remove-button'),
        invtBtn = WinJS.Utilities.query('.b-libraries__invite-users-button');

      deleteBtn[0].disabled = true;
      invtBtn[0].disabled = true;

      tableControl.onitemselected = function (id) {
        WinJS.Navigation.navigate('/resources/pages/edit-library.html', {id: id.detail});
      };

      tableControl.onselectionchange = function (e) {
        selectedItems = e.detail;
        deleteBtn[0].disabled = !selectedItems.length;
        invtBtn[0].disabled = !selectedItems.length;
      };

      tableControl.setData(this._data);

      deleteBtn.listen('click', function () {
          selectedItems = tableControl.getSelection();
        if (selectedItems.length === 0) {
          return false;
        }
        window.showPopup('/resources/pages/popups/delete-confirm.html', {callback: function () {
          window.authXHR({
            url: url,
            type: 'DELETE',
            data: JSON.stringify(selectedItems)
          }).done(function (result) {
            getLibraries().then(function (libraries) {
                tableControl.setData(libraries);
            });
          });
        }});

      });

      invtBtn.listen('click', function () {
        window.showPopup('/resources/pages/popups/library-invite-users.html', selectedItems);
      });


    }

  });
}());