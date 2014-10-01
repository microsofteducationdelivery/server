(function () {

  'use strict';

  WinJS.UI.Pages.define('/resources/pages/popups/library-invite-users.html', {

    ready: function (element, options) {
      WinJS.UI.processAll(element);
      var tableControl = WinJS.Utilities.query('div[class=b_invite_users__table]')[0].winControl,
        okButton = WinJS.Utilities.query('.b-button-ok'),
        selectedItems;

      okButton[0].disabled = false;
      WinJS.Utilities.query('button.b-button-cancel', element).listen('click', function () {
        window.hidePopup();
      });
      tableControl.onselectionchange = function (e) {
        selectedItems = e.detail;
        //okButton[0].disabled = !selectedItems.length;
      };

      okButton.listen('click', function () {
        selectedItems = tableControl.getSelection();
        MED.Server.authXHR({
          url: '/api/contentActions/inviteUsers',
          type: 'PUT',

          data: JSON.stringify({
            libraries: options.libs,
            users: selectedItems,
            removeUsers: tableControl.getSelection(false)
          })
        }).done(
          function (result) {
            window.hidePopup();
            return true;
          },
          function (result) {
            return result.status;
          }
        );
      });

      MED.Server.authXHR({
        url: '/api/users',
        type: 'GET'
      }).done(
        function (result) {
          var data = result.response;

          tableControl.setData(data, null, '.b_invite_users__table');

          tableControl.setSelection(options.users.selection);
          tableControl.setThreeStateSelection(options.users.threeStateSelection);
        },
        function (result) {
          return result.status;
        }
      );
    }
  });
}());