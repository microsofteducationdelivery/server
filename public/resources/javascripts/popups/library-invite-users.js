(function () {
    'use strict';
    WinJS.UI.Pages.define("/resources/pages/popups/library-invite-users.html", {

        ready: function (element, options) {
            WinJS.UI.processAll(element);
            var tableControl = WinJS.Utilities.query('div[class=b_invite_users__table]')[0].winControl,
                okButton = WinJS.Utilities.query('.b-button-ok'),
                selectedItems;

            okButton[0].disabled = true;
            WinJS.Utilities.query('button.b-button-cancel', element).listen('click', function () {
                window.hidePopup();
            });
            tableControl.onselectionchange = function (e) {
                selectedItems = e.detail;
                okButton[0].disabled = !selectedItems.length;
            };

            okButton.listen('click', function () {
                if (selectedItems.length === 0) return false;
                WinJS.xhr({
                    url: '/libraries/addusers',
                    type: 'PUT',
                    headers: {"Content-Type": 'application/json'},
                    data: {
                        libraries: options,
                        users: selectedItems
                    }
                }).done(
                    function (result) {
                        window.hidePopup();
                        return
                    },
                    function (result) {
                        return result.status;
                    }
                );
            });

            WinJS.xhr({
                url: '/listData/user.json',
                type: 'GET'
            }).done(
                function (result) {
                    var data = JSON.parse(result.responseText);
      
                    tableControl.setData(data, null, '.b_invite_users__table');
                },
                function (result) {
                    return result.status;
                }
            );
        }
    });
}());