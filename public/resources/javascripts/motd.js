(function () {
  'use strict';

  function getMOTD() {
    return MED.Server.authXHR({
      url: '/api/motd'

    }).then(function (res) {
      return res.response.text;
    });
  }

  function setMOTD(text) {
    return MED.Server.authXHR({
      url: '/api/motd',
      type: 'POST',
      data: JSON.stringify({ text: text })
    });
  }


  WinJS.UI.Pages.define("/resources/pages/motd.html", {
    loaded: false,

    motd: {
      get: function () {
        return this._data.motd;
      },

      set: function (value) {
        this._data.motd = this.loaded ? (value || '(empty)') : '... loading ...';
      }
    },

    init: function (element, options) {
      var that = this;
      this._data = WinJS.Binding.as({ motd: '' });
      return getMOTD().then(function (text) {
        that.loaded = true; that.motd = text; return true;});
    },

    ready: function (element, options) {
      var updateButton = element.querySelector('button.b-motd__button');
      var newMOTD = element.querySelector('textarea');
      var errorText = element.querySelector('.b-motd__error');
      var currentMOTD = element.querySelector('.b-motd__current-value');

      var that = this;

      function validator() {
        var ok = !!newMOTD.value.length;

        if (newMOTD.value.length > 230) {
          errorText.style.display = 'initial';
          ok = false;
        } else {
          errorText.style.display = 'none';
        }

        if (ok && that.loaded) {
          updateButton.removeAttribute('disabled');
        } else {
          updateButton.setAttribute('disabled', 'disabled');
        }
      }

      WinJS.Binding.processAll(element, this._data);
      WinJS.Utilities.query('textarea', element).listen('keyup', validator);
      WinJS.Utilities.query('textarea', element).listen('blur', validator);
      updateButton.addEventListener('click', function () {
        that.loaded = false;
        that.motd = '';
        validator();
        setMOTD(newMOTD.value).done(function () {
          getMOTD().done(function (text) {
            that.loaded = true;
            that.motd = text;
            validator();
            currentMOTD.classList.add('highlight');
            WinJS.Promise.timeout(1000).done(function () { currentMOTD.classList.remove('highlight'); });

          });
        });
      });
    validator();

    }
  });
}());