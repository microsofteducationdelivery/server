(function () {

  'use strict';

  WinJS.UI.Pages.define('/resources/pages/popups/user-import-incorrect-type.html', {

    ready: function (element) {

      WinJS.Utilities.query('button.b-button-ok', element).listen('click', function () {
        window.hidePopup();
        window.showPopup('/resources/pages/popups/user-import.html');
      });
    }
  });

})();