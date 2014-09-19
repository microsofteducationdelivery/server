(function () {
    'use strict';
    WinJS.UI.Pages.define('/resources/pages/add-new-user.html', {

        ready: function (element) {
            var checkEmail = WinJS.Utilities.query('input[name=send_email]'),
                checkPhone =  WinJS.Utilities.query('input[name=send_sms]')
            ;

            function showError(el, msg) {
                var errmsg = '✗ Error: ' + msg,
                    errdiv = '<div class="b-edit-user__error">' + errmsg + '</div>',
                    prstErrs = WinJS.Utilities.query('.b-edit-user__error', el);
                var isPrst = WinJS.Utilities.query('.b-edit-user__error', el).some(function (err) {
                    return err.innerHTML == errmsg;
                });

                if (isPrst) return;
                WinJS.Utilities.insertAdjacentHTML(el, 'beforeend', errdiv);
            }
            function isUnique(key, value, cb) {
                WinJS.xhr({
                    url: '/users/isunique',
                    type: 'POST',
                    data: {
                      key: key,
                      value: value
                    }
                }).done(cb);
            }
            function validate(feild) {
                var errs = WinJS.Utilities.query('.b-edit-user__error', feild.parentNode);
                errs.forEach(function (err) {
                  feild.parentNode.removeChild(err);
                });
                if (feild.value == '') {
                    return;
                }
                for (var key in params[feild.name]) {
                    switch (key){
                        case 're':
                            if (!params[feild.name].re.test(feild.value)) {
                                showError(feild.parentNode, errMsgs.format);
                            }
                            break
                        case 'unique':
                            if (params[feild.name].unique) {
                                isUnique(feild.name, feild.value, function (res) {
                                    if (!res.unique) {
                                        showError(feild.parentNode, errMsgs.taken);
                                    }
                                })
                            }
                            break
                    }
                }
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
                    phone: {
                        re: /\(?([0-9]{3})\)?([ .-]?)([0-9]{3})\2([0-9]{4})/,
                        unique: true
                    }
                },
                errMsgs = {
                  format : 'wrong format',
                  required : 'required',
                  taken : 'already taken'
                };
            var basicFragmentLoadDiv = document.querySelector(".b-edit-user__wrapper");
            WinJS.UI.Fragments.renderCopy("/resources/pages/templates/edit-user-tpl.html", basicFragmentLoadDiv).done(function () {
                WinJS.UI.processAll(element);
                WinJS.Utilities.query('.b-button-cancel').listen('click', function () {
                    WinJS.Navigation.back();
                });

                WinJS.Utilities.query('form').listen('change', function (e) {
                    if (e.target.type == "checkbox") {
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
                        validate(e.target)
                    }
                });
                WinJS.Utilities.query('.b-button-ok').listen('click', function (e) {
                    e.preventDefault();
                    var form = element.querySelector('form');
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
                    for (var key in values) {
                        if (values[key] == '' && params[key].required) {
                          showError(form[key].parentNode, errMsgs.required);
                        }
                    }

                    if (WinJS.Utilities.query('.b-edit-user__error', form).length) return;
                    WinJS.xhr({
                        url: '/api/users',
                        type: 'POST',
                        data: JSON.stringify(values)
                    }).done(function () { alert('saved'); });
                });

            });


        }

    });

}());