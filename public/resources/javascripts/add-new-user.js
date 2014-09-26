(function () {
    'use strict';
    WinJS.UI.Pages.define('/resources/pages/add-new-user.html', {

        ready: function (element) {
            var checkEmail,
                checkPhone
            ;


            var basicFragmentLoadDiv = document.querySelector(".b-edit-user__wrapper");
            WinJS.UI.Fragments.renderCopy("/resources/pages/templates/edit-user-tpl.html", basicFragmentLoadDiv).done(function () {
                WinJS.UI.processAll(element);
                WinJS.Utilities.query('select[name=type]')[0].options.remove(3);

                checkEmail = WinJS.Utilities.query('input[name=send_email]');
                checkPhone =  WinJS.Utilities.query('input[name=send_sms]');

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
                        MED.Server.userValidation(e.target);
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
                    MED.Server.authXHR({
                        url: '/api/users',
                        type: 'POST',
                        data: JSON.stringify(values)
                    }).done(function () { alert('saved'); });
                });

            });


        }

    });

}());