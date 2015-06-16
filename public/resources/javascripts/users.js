(function () {

  'use strict';

  function getUsers () {
    return MED.Server.authXHR({
      url: '/api/users',
      type: 'GET'
    }).then(function (result) {
      return result.response;
    });
  }

  WinJS.UI.Pages.define('/resources/pages/users.html', {
    init: function () {
      var me = this;
      return getUsers().then( function (users) {me._data = users; });
    },

    ready: function (element, options) {
      WinJS.UI.processAll(element);

      WinJS.Utilities.query('.b-user-add-button').listen('click', function () {
        WinJS.Navigation.navigate('/resources/pages/add-new-user.html');
      });

      var tableControl = WinJS.Utilities.query('div[class=b_users__table]')[0].winControl,
        selectedItems = [],
        deleteBtn = WinJS.Utilities.query('.b-users__remove-button'),
        importBtn = WinJS.Utilities.query('.b-users__import-button'),
        form = WinJS.Utilities.query('form');

      deleteBtn[0].disabled = true;

      tableControl.onitemselected = function (id) {
        WinJS.Navigation.navigate('/resources/pages/edit-user.html', {id: id.detail});
      };

      tableControl.onselectionchange = function (e) {
        selectedItems = e.detail;
        deleteBtn[0].disabled = !selectedItems.length;
      };

      deleteBtn.listen('click', function () {
        if (selectedItems.length === 0) return false;
        window.showPopup('/resources/pages/popups/delete-confirm.html', {callback: function () {
          MED.Server.authXHR({
            url: '/api/users',
            type: 'DELETE',
            data: JSON.stringify(selectedItems)
          }).done(
            function (result) {
              getUsers().then(function (users) {

                tableControl.setData(users);
                tableControl.deselectAll();
              });
              return result;

            },
            function (err) {
              if (err.status === 403) {

                window.showPopup('/resources/pages/popups/alert.html', {
                  msg: 'Own account can not be deleted.'
                });
              }

            }
          );
          tableControl.deselectAll();
        }});

      });

      importBtn.listen('click', function() {
        window.showPopup('/resources/pages/popups/user-import.html', {
          callback: function () {
            getUsers().then(function (users) {
              tableControl.setData(users);
            });
          }
        });
      });

      MED.Server.authXHR({
        url: '/api/users',
        type: 'GET'
      }).done(
        function (result) {
          var data = result.response;

          tableControl.setData(data);
        },
        function (result) {
          return result.status;
        }
      );

    }
  });
}());