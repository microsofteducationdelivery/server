(function () {
  'use strict';
  WinJS.UI.Pages.define("/resources/pages/popups/invite-users-after-media-upload.html", {

    ready: function (element, options) {

      function notAskAgain() {
        var checkbox = WinJS.Utilities.query('.b-not-ask-checkbox', element);

        if(checkbox[0].checked) {
          var user = JSON.parse(MED.Storage.getUser());
          user.hideInvitePopup = true;
          MED.Storage.setUser(user);
        }
      }
      WinJS.Utilities.query('button.b-button-cancel', element).listen('click', function () {
        debugger;
        window.hidePopup();

        notAskAgain();
      });

      WinJS.Utilities.query('button.b-button-ok', element).listen('click', function () {
        notAskAgain();

        MED.Server.authXHR({
          url: '/api/contentActions/inviteUsers/' + options.libraryId.substring(7),
          type: 'GET'
        }).done(function (response) {
          window.hidePopup();
          window.showPopup('/resources/pages/popups/library-invite-users.html', {
            libs: [options.libraryId],
            users: response.response
          });
        });
      });
    }

  });
}());