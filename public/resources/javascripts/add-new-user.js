(function () {
  'use strict';
  WinJS.UI.Pages.define('/resources/pages/add-new-user.html', {

    ready: function (element) {
      var checkEmail,
        checkPhone
        ;

      MED.Validation.params.password.required = true;
      var basicFragmentLoadDiv = document.querySelector('.b-edit-user__wrapper');
      WinJS.UI.Fragments.renderCopy('/resources/pages/templates/edit-user-tpl.html', basicFragmentLoadDiv).done(function () {
        WinJS.UI.processAll(element);
        WinJS.Utilities.query('select[name=type]')[0].options.remove(3);

        checkEmail = WinJS.Utilities.query('input[name=send_email]');
        checkPhone =  WinJS.Utilities.query('input[name=send_sms]');
        var form = element.querySelector('form'),
          okBtn = WinJS.Utilities.query('.b-button-ok')[0];

        WinJS.Utilities.query('.b-button-cancel').listen('click', function () {
          WinJS.Navigation.back();
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
            MED.Validation.userValidation(e.target).then(function () {
              okBtn.disabled = !!WinJS.Utilities.query('.b-edit-user__error', form).length;
            });
          }
        });
        WinJS.Utilities.query('.b-button-ok').listen('click', function (e) {
          e.preventDefault();
          var values = {
            name: form.name.value,
            login: form.login.value,
            type: form.type.value,
            password: form.password.value
          };

          if (form.phone.value && checkPhone[0].checked) {
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
              url: '/api/users',
              type: 'POST',
              responseType: 'text',
              data: JSON.stringify(values)
            }).done(function () {
              WinJS.Navigation.navigate('/resources/pages/users.html');
            });
          }
        });

      });
    }
  });

}());