(function () {
    'use strict';
    WinJS.UI.Pages.define('/resources/pages/users.html', {
        ready: function (element, options) {
            WinJS.UI.processAll(element);

            WinJS.Utilities.query('.b-user-add-button').listen('click', function () {
                WinJS.Navigation.navigate('/resources/pages/add-new-user.html');
            });

            var tableControl = WinJS.Utilities.query('div[class=b_users__table]')[0].winControl,
                selectedItems = [],
                deleteBtn = WinJS.Utilities.query('.b-users__remove-button');

            deleteBtn[0].disabled = true;

            tableControl.onitemselected = function (id) {
                WinJS.Navigation.navigate('/resources/pages/edit-user.html', {id: id.detail});
            };

            tableControl.onselectionchange = function (e) {
                selectedItems = e.detail;
                deleteBtn[0].disabled = !selectedItems.length;
            };

            deleteBtn.listen('click', function () {
                if (selectedItems.length === 0) return false;
                window.showPopup('/resources/pages/popups/delete-confirm.html', {callback: function () {
                    WinJS.xhr({
                        url: '/users',
                        type: 'DELETE',
                        data: selectedItems
                    }).done(
                        function (result) {
                            return
                        },
                        function (result) {
                            return result.status;
                        }
                    );
                    tableControl.deselectAll();
                }});

            });

            WinJS.xhr({
                url: '/listData/user.json',
                type: 'GET'
            }).done(
                function (result) {
                    var data = JSON.parse(result.responseText);

                    tableControl.setData(data);
                },
                function (result) {
                    return result.status;
                }
            );

        }
    });
}());