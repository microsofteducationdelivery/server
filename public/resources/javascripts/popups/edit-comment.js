(function () {
  'use strict';
  WinJS.UI.Pages.define('/resources/pages/popups/edit-comment.html', {

    ready: function (element, options) {
      var id = options.id,
        title = options.title,
        parent = options.parent
        ;

      this.setTitle(title, element, options.replay);
      WinJS.Utilities.query('button.b-button-cancel', element).listen('click', function () {
        window.hidePopup();
      });

      WinJS.Utilities.query('button.b-button-send', element).listen('click', function () {
        var text =  WinJS.Utilities.query('[class=b-edit-comment__messagebox]')[0].value,
          method = options.replay === 'Edit'  ?  'PUT' : 'POST',
          url = '/api/comments',
          userName = JSON.parse(localStorage.getItem('user')).name,
          data = JSON.stringify({id: id, text: text, parentId: options.parentId, author: userName});

        url += method === 'PUT' ? '/' + id : '';

        MED.Server.authXHR({
          url: url,
          type: method,
          responseType: 'text',
          data: data
        }).done(function () {
          parent.fillChats();
          window.hidePopup();
        });
      });
    },
    setTitle: function (title, element, replay) {
      var message = 'To ' + title;
      if (replay === 'Edit') {
        message = 'Edit';
      }
      WinJS.Utilities.query('[id=b-edit-comment__title]', element)[0].innerHTML = message;
    }

  });
}());