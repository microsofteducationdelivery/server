(function () {
  'use strict';
  WinJS.UI.Pages.define('/resources/pages/logReg.html', {

    ready: function (element, options) {
      var me = this,
        registerBtn = WinJS.Utilities.query('input[class=b_reg-btn]', element),
        loginBtn = WinJS.Utilities.query('input[class=b_login-btn]', element),
        forgotPassBtn = WinJS.Utilities.query('a[id=forgot-pass]', element)
        ;

      forgotPassBtn.listen('click', function (e) {
        e.preventDefault();
        window.showPopup('/resources/pages/popups/forgot-password.html', {

        });
      });
      loginBtn.listen('click', function (e) {
        console.log('try to register');
        var creds = me.getLoginCreds();

        if (creds.password && creds.email) {
          me.login(creds);
          e.preventDefault();
        }
      });
      registerBtn.listen('click', function (e) {
        console.log('try to register');
        var creds = me.getRegisterCreds();

        if (creds.name && creds.email) {
          me.register(creds);
          e.preventDefault();
        }
      });
    },
    login: function (creds) {
      var loginErr = WinJS.Utilities.query('#login_err');

      MED.Server.xhr({
        type: 'POST',
        url: '/api/auth/login',
        responseType: 'json',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: this._getParam({
          email: creds.email,
          password: creds.password
        })
      }).done(
        function completed (req) {
          console.log('login success' + req);
          var response = req.response;

          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          window.location = '/admin.html';

        },
        function error (request) {
          console.log(request.statusText);
          loginErr.removeClass('hidden');

        }
      );

      return false;
    },
    _getParam: function (obj) {
      var s = [];
      for (var p in obj) {
        if (!obj.hasOwnProperty(p)) {
          continue;
        }
        s.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
      }
      return s.join( "&" ).replace(/%20/g, "+");
    },
    _getValue: function (query) {
      var el = document.querySelector(query);

      return !el.validity.valid ? null : el.value;
    },
    getRegisterCreds: function () {
      return {
        name: this._getValue('#register-form input[name="name"]'),
        login: this._getValue('#register-form input[name="email"]'),
        email: this._getValue('#register-form input[name="email"]')
      };
    },
    getLoginCreds: function () {
      return {
        email: this._getValue('#login-form input[name="login"]'),
        password: this._getValue('#login-form input[name="loginPass"]')
      };
    },
    register: function (creds) {
      var registerErr = WinJS.Utilities.query('#reg_err');

      MED.Server.xhr({
        type: 'POST',
        url: '/api/auth/register',
        responseType: 'text',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: this._getParam({
          name: creds.name,
          login: creds.login,
          email: creds.email
        })
      }).done(
        function completed(request) {
          registerErr.addClass('hidden');
          window.showPopup('/resources/pages/popups/alert.html', {
            callback: function () {
              WinJS.Navigation.navigate('resources/pages/getStarted.html');
              WinJS.Utilities.query('.b-main__link-active').removeClass('b-main__link-active');
              WinJS.Utilities.query('.main-navigation-link')[0].classList.add('b-main__link-active');
            },
            msg: 'Your account has been successfully created. ' +
              'An email has been sent to you with your credentials.' +
              ' If you have not received an email please check your Spam folder.'
          });
        },
        function error(request) {
          registerErr.removeClass('hidden');
          if (request.statusText === 'Conflict') {
            console.log('Conflict');
          }

        }
      );
      return false;
    }
  });
}());