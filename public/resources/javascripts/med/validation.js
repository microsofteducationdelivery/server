(function () {

  'use strict';
  function showError(el, msg) {
    var errmsg = '✗ Error: ' + msg,
      errdiv = '<div class="b-edit-user__error">' + errmsg + '</div>';
    var isPrst = WinJS.Utilities.query('.b-edit-user__error', el).some(function (err) {
      return err.innerHTML === errmsg;
    });

    if (!isPrst) {
      WinJS.Utilities.insertAdjacentHTML(el, 'beforeend', errdiv);
    }

  }

  function isUnique(key, value, id) {
    var data = {key: key, value: value, id: id};

    return MED.Server.authXHR({
      url: '/api/userManagement/isUnique',
      type: 'POST',
      data: JSON.stringify(data)
    });
  }
  var params = {
      email: {
        re: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        unique: true
      },
      name: {
        required: true,
        unique: true
      },
      login: {
        required: true,
        unique: true
      },
      password: {
        required: true
      },
      confirm: {
        match: true
      },
      phone: {
        re: /\(?([0-9]{3})\)?([ .-]?)([0-9]{3})\2([0-9]{4})/,
        unique: false
      }
    },
    errMsgs = {
      format : 'wrong format',
      required : 'required',
      match: 'dose not match',
      taken : 'already taken'
    };

  var userVal = function (field, id) {
    return new WinJS.Promise(function (complete) {
      var errs = WinJS.Utilities.query('.b-edit-user__error', field.parentNode);

      errs.forEach(function (err) {
        field.parentNode.removeChild(err);
      });
      if (field.value === '') {
        complete();
      }
      function callback (res) {
        if (!res.response.isUnique) {
          showError(field.parentNode, errMsgs.taken);
        }
        complete();
      }
      for (var key in params[field.name]) {
        switch (key){
          case 're':
            if (!params[field.name].re.test(field.value)) {
              showError(field.parentNode, errMsgs.format);
              complete();
            }
            break;
          case 'unique':
            if (params[field.name].unique) {
              isUnique(field.name, field.value, id).then(callback);
            }
            break;
        }
      }
      complete();
    });

  };
  var matchValidation = function (pass, confirmPass) {
    if (pass.value !== confirmPass.value) {
      showError(confirmPass.parentNode, errMsgs.match);
    }
  };
  var reqVal = function (form, values) {
    for (var key in values) {
      if (values[key] === '' && params[key].required) {
        showError(form[key].parentNode, errMsgs.required);
      }
    }
  };
  WinJS.Namespace.define('MED.Validation', {
    userValidation: userVal,
    matchValidation: matchValidation,
    userRequiredValidation: reqVal,
    params: params
  });

})();