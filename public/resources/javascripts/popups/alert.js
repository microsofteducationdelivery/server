/**
 * Created by kanuny on 12.09.14.
 */
(function () {
  'use strict';
  WinJS.UI.Pages.define("/resources/pages/popups/alert.html", {

    ready: function (element, options) {
      if (options.msg) {
        WinJS.Utilities.query('h3', element)[0].textContent = options.msg;
      }

      WinJS.Utilities.query('button.b-button-ok', element).listen('click', function () {
        if (options.callback && typeof(options.callback) === 'function') {
          options.callback();
        }
        window.hidePopup();
      });
    }

  });
}());