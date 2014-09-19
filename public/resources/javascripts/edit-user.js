(function () {
    'use strict';
    WinJS.UI.Pages.define('/resources/pages/edit-user.html', {

        ready: function (element, options) {
            var tplTarget = document.querySelector(".b-edit-user__wrapper"),
                checkEmail = WinJS.Utilities.query('input[name=send_email]'),
                checkPhone =  WinJS.Utilities.query('input[name=send_sms]')
            ;
            debugger;
            WinJS.UI.Fragments.renderCopy("/resources/pages/templates/edit-user-tpl.html", tplTarget).done(function () {
                WinJS.UI.processAll(element);
                getUserCreds(options.id, function (response, status) {
                    if (status !== 200) {
                        return null;
                    }
                    var data = response,
                        form = element.querySelector('form')
                    ;

                    form.name.value = data.name;
                    form.login.value = data.login;
                    form.password.value = data.password;
                    form.type.value = data.type;
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
                    if (e.target.type === "checkbox") {
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
                    }
                });
                WinJS.Utilities.query('.b-button-cancel').listen('click', function () {
                    WinJS.Navigation.back();
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

                    if(form.phone.value && checkPhone[0].checked) {
                        values.phone = form.phone.value;
                    }
                    if (form.email.value && checkEmail[0].checked) {
                        values.email = form.email.value;
                    }

                    window.authXHR({
                        url: '/api/users',
                        type: 'PUT',
                        data: JSON.stringify(values)
                    }).done(function () { });
                });

            });

        }
    });
    function getUserCreds (id, callback) {
        window.authXHR({
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