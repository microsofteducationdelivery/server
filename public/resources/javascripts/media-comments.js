(function () {
    'use strict';

    var comments = new WinJS.Binding.List();

    WinJS.UI.Pages.define('/resources/pages/media-comments.html', {

        ready: function (element, options) {
            var listView =  WinJS.Utilities.query('div[data-win-control="WinJS.UI.ListView"]', element),
                me = this,
                deleteBtn =  WinJS.Utilities.query('button[class=b_media-comments__delete-button]', element)
            ;
            this.id = options.id;

            WinJS.xhr({
                url: '/listData/media_' + this.id + '.json',
                type: 'get'
            }).done(function (result) {
                if (result.status !== 200) {
                    return null;
                }
                var media = JSON.parse(result.responseText);
                me.setTitle(media.name);
            });

            deleteBtn.listen('click', function (e) {
                var selection = me.getSelection();

                WinJS.xhr({
                    url: '/comments',
                    type: 'DELETE',
                    data: selection
                }).done(function (result) {
                    if (result.status !== 200) {
                        return null;
                    }
                    me.fillChats();
                });
            });
            listView[0].addEventListener('click', function (event) {
                event.stopPropagation();
                event.preventDefault();

                var target = event.target;

                if (target.className === 'b_body-box') {

                    var input = target.parentNode.querySelector('input');
                    input.checked = !input.checked;
                    deleteBtn[0].disabled = me.getSelection().length === 0;
                } else if (target.className === 'b_media-comments-list-tpl__replay') {

                    var listItem = target;

                    while (listItem.classList[0] !== 'b_media-comments-list-tpl--item') {
                        listItem = listItem.parentNode;
                    }
                    var id = listItem.querySelector('input[type=checkbox]').name,
                        item = comments.filter(function (item) {return item.id === id})[0],
                        title = item.userName,
                        replay = item.replay
                    ;
                    window.showPopup('/resources/pages/popups/edit-comment.html', {
                        id: id,
                        title: title,
                        parent: me,
                        replay: replay
                    });

                }
            });

            WinJS.Utilities.query('button[class=b_media-comments-content--toolbar__btn]', element).listen('click', function (e) {
                window.showPopup('/resources/pages/popups/edit-comment.html', {id: options.id, title: me.title, parent: me});
            });

            this.fillChats(options.id);
        },
        fillChats: function (id) {
            var id = id || this.id;

            WinJS.xhr({
                url: '/listData/comments.json',
                type: 'GET'
            }).done(
                function (result) {
                    if (result.status !== 200) {
                        return null;
                    }
                    var response = JSON.parse(result.responseText);
                    comments.splice(0, comments.length);
                    response.forEach(function (item) {
                        item.replay = item.userName === 'my' ? 'Edit' : 'Reply';
                        comments.push(item);
                    });

                },
                function (result) {
                  //  callback(null, result.status);
                }
            );
        },
        setTitle: function (title) {
            WinJS.Utilities.insertAdjacentHTML(WinJS.Utilities.query('h1[class=b_media-comments-title]')[0], 'beforeend', title);
            this.title = title;
        },
        getSelection: function () {
            var selection = [];

            WinJS.Utilities.query('input[type=checkbox]:checked').forEach(function(item) {
                selection.push(item.name);
            });

            return selection;
        },
        id: null,
        title: ''
    });
    WinJS.Namespace.define('NED.mediaComments', {
        getMargin: WinJS.Binding.converter(function (lvl) {
            var margin = 30 + ((lvl + 1) * 3);

            return margin + 'px';
        })
    });
    WinJS.Namespace.define('MediaComments.ListView', {
        data: comments
    });
}());