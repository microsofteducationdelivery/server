(function () {
    'use strict';
    WinJS.UI.Pages.define('/resources/pages/commentaries.html', {

        ready: function (element, options) {
            WinJS.UI.processAll(element);

            var tableControl = WinJS.Utilities.query('div[class=b_commentaries__table]')[0].winControl;
            tableControl.onitemselected = function (id) {
                WinJS.Navigation.navigate('/resources/pages/media-comments.html', {id: id.detail});
            };

            WinJS.xhr({
                url: '/listData/commentaries.json',
                type: 'GET'
            }).done(
                function (result) {
                    var data = JSON.parse(result.responseText);
                    tableControl.setData(data, true);
                    WinJS.Utilities.query('button[class=b_table-button]').listen('click', function (e) {

                        e.stopPropagation();
                        e.preventDefault();
                        var column = e.currentTarget.parentElement.parentElement.firstChild;

                        WinJS.Navigation.navigate('/resources/pages/edit-library.html', {id: column.title});
                    });
                },
                function (result) {
                    return result.status;
                }
            );
        }

    });
}());