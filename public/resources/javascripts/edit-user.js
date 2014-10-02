(function () {
  'use strict';
  WinJS.UI.Pages.define('/resources/pages/edit-user.html', {

    ready: function (element, options) {
      var checkEmail,
        checkPhone
        ;

      MED.Validation.params.password.required = false;
      var basicFragmentLoadDiv = document.querySelector('.b-edit-user__wrapper');

      WinJS.UI.Fragments.renderCopy('/resources/pages/templates/edit-user-tpl.html', basicFragmentLoadDiv).done(function (element) {
        checkEmail = WinJS.Utilities.query('input[name=send_email]');
        checkPhone =  WinJS.Utilities.query('input[name=send_sms]');
        var form = element.querySelector('form'),
          okBtn = WinJS.Utilities.query('.b-button-ok')[0];

        getUserCreds(options.id, function (response, status) {
          if (status !== 200) {
            return null;
          }
          var data = response,
            form = element.querySelector('form')
            ;

          form.name.value = data.name;
          form.login.value = data.login;
          form.id.value = options.id;
          form.password.value = '';
          form.type.value = data.type;

          if (data.type === 'owner') {
            WinJS.Utilities.query('select[name=type]')[0].disabled = true;
          } else {

            WinJS.Utilities.query('select[name=type]')[0].options.remove(3);
          }
          if (data.email) {
            form.email.value = data.email;
            checkEmail[0].checked = true;
            WinJS.Utilities.query('input[name=email]')[0].disabled = false;
          }
          if (data.phone) {
            form.phone.value = data.phone;
            checkPhone[0].checked = true;
            WinJS.Utilities.query('input[name=phone]')[0].disabled = false;
          }

        });


        WinJS.Utilities.query('form').listen('change', function (e) {
          if (e.target.type === 'checkbox') {
            if (e.target.checked) {
              WinJS.Utilities.query('input[type=text]', e.target.parentNode.parentNode)[0].disabled = false;
            } else {
              var textFeild = WinJS.Utilities.query('input[type=text]', e.target.parentNode.parentNode)[0],
                errMes = WinJS.Utilities.query('.b-edit-user__error', e.target.parentNode.parentNode)[0];
              textFeild.disabled = true;
              textFeild.value = '';
              if(errMes) {
                textFeild.parentNode.removeChild(errMes);
              }
            }
          } else {
            MED.Validation.userValidation(e.target, form.id.value).then(function () {
              if (e.target.name === 'password' || e.target.name === 'confirm') {
                MED.Validation.matchValidation(form.password, form.confirm);
              }
              okBtn.disabled = !!WinJS.Utilities.query('.b-edit-user__error', form).length;
            });
          }
        });
        WinJS.Utilities.query('.b-button-cancel').listen('click', function () {
          WinJS.Navigation.back();
        });

        WinJS.Utilities.query('.b-button-ok').listen('click', function (e) {
          e.preventDefault();
          var values = {
            name: form.name.value,
            login: form.login.value,
            type: form.type.value,
            password: form.password.value
          };

          if(form.phone.value && checkPhone[0].checked) {
            values.phone = form.phone.value;
          }
          if (form.email.value && checkEmail[0].checked) {
            values.email = form.email.value;
          }
          MED.Validation.userRequiredValidation(form, values);

          if (WinJS.Utilities.query('.b-edit-user__error', form).length) {
            this.disabled = true;
          } else {
            MED.Server.authXHR({
              url: '/api/users/'+ form.id.value,
              type: 'PUT',
              data: JSON.stringify(values)
            }).done(function () {
              WinJS.Navigation.navigate('/resources/pages/users.html');
            });
          }
        });
        WinJS.UI.processAll(element);

      });

      WinJS.UI.processAll(element);
    }
  });
  function getUserCreds (id, callback) {
    MED.Server.authXHR({
      url: '/api/users/' + id,
      type: 'GET'
    }).done(
      function (result) {
        callback(result.response, result.status);
      },
      function (result) {
        callback(null, result.status);
      }
    );
  }
}());