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
      MED.Server.authXHR({
        url: '/api/media/' + this.id,
        type: 'GET'
      }).done(function (result) {
        var media = result.response;
        me.setTitle(media.name);
        me.fillChats(options.id);
      });

      deleteBtn.listen('click', function () {
        var selection = me.getSelection();
        MED.Server.authXHR({
          url: '/api/comments',
          type: 'DELETE',
          data: selection
        }).done(function () {
          me.fillChats();
        });
      });
      listView[0].addEventListener('click', function (event) {
        event.stopPropagation();
        event.preventDefault();

        var target = event.target,
          listItem,
          parentId,
          item,
          title;

        if (target.className === 'b_body-box') {

          var input = target.parentNode.querySelector('input');
          input.checked = !input.checked;
          deleteBtn[0].disabled = me.getSelection().length === 0;
        } else if (target.className === 'b_media-comments-list-tpl__replay') {

          listItem = target;

          while (listItem.classList[0] !== 'b_media-comments-list-tpl--item') {
            listItem = listItem.parentNode;
          }
          parentId = listItem.querySelector('input[type=checkbox]').name - 0;
          item = comments.filter(function (item) {return item.id === parentId;})[0];
          title = item.author;

          window.showPopup('/resources/pages/popups/edit-comment.html', {
            id: options.id,
            title: title,
            parentId: parentId,
            parent: me,
            replay: 'Reply'
          });

        } else if (target.className === 'b_media-comments-list-tpl__replay edit-btn') {
          listItem = target;

          while (listItem.classList[0] !== 'b_media-comments-list-tpl--item') {
            listItem = listItem.parentNode;
          }
          parentId = listItem.querySelector('input[type=checkbox]').name - 0;
          item = comments.filter(function (item) {return item.id === parentId;})[0];
          title = item.author;

          window.showPopup('/resources/pages/popups/edit-comment.html', {
            id: parentId,
            title: title,
            parent: me,
            replay: 'Edit'
          });
        }
      });

      WinJS.Utilities.query('button[class=b_media-comments-content--toolbar__btn]', element).listen('click', function () {
        window.showPopup('/resources/pages/popups/edit-comment.html', {id: options.id, title: me.title, parent: me});
      });
    },
    manageComments: function (list) {
      var sortedList = [],
        coreComments = [],
        userName = JSON.parse(localStorage.getItem('user')).name,
        replayComments = [];

      list.forEach(function (item) {
        item.replay = item.author === userName ? 'Edit' : 'Reply';
        if (item.parentId) {
          item.lvl = 3;
          if (!replayComments[item.parentId]) {
            replayComments[item.parentId] = [];
          }
          replayComments[item.parentId].push(item);
        } else {
          item.lvl = 0;
          coreComments.push(item);
        }
      });
      coreComments.forEach(function (item) {
        sortedList.push(item);
        if (replayComments[item.id]) {
          replayComments[item.id].forEach(function (replay) {
            sortedList.push(replay);
          });
        }
      });
      return sortedList;
    },
    fillChats: function (id) {
      var me = this,
        id = id || this.id;

      MED.Server.authXHR({
        url: '/api/comments/' + id,
        type: 'GET'
      }).done(
        function (result) {
          var response = result.response,
            commentList;

          comments.splice(0, comments.length);
          commentList = me.manageComments(response);
          commentList.forEach(function (item) {
            comments.push(item);
          });
        },
        function () {
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
      var margin = 30 + ((lvl + 1) * 8);

      return margin + 'px';
    }),
    getDisplay: WinJS.Binding.converter(function (lvl) {
      return lvl === 0 ? 'block' : 'none';
    }),
    getEditDisplay: WinJS.Binding.converter(function (author) {
      var userName = JSON.parse(localStorage.getItem('user')).name;
      return  userName === author ? 'block' : 'none';
    })
  });
  WinJS.Namespace.define('MediaComments.ListView', {
    data: comments
  });
}());