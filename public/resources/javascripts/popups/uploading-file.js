(function () {
  'use strict';
  WinJS.UI.Pages.define("/resources/pages/popups/uploading-file.html", {

    ready: function (element, options) {
      var opts = {
        lines: 13,
        length: 28,
        width: 14,
        radius: 42,
        scale: 1,
        corners: 1,
        color: '#000',
        opacity: 0.25,
        rotate: 0,
        direction: 1,
        speed: 1,
        trail: 60,
        fps: 20,
        zIndex: 2e9,
        className: 'spinner',
        top: '50%',
        left: '50%',
        shadow: false,
        hwaccel: false,
        position: 'absolute'
      };

      var spinner = new Spinner().spin();
      WinJS.Utilities.query('.b-uploading-spinner')[0].appendChild(spinner.el);
    }
})
})();