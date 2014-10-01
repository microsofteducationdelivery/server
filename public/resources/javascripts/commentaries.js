(function () {
  'use strict';
  WinJS.UI.Pages.define('/resources/pages/commentaries.html', {

    ready: function (element, options) {
      WinJS.UI.processAll(element);

      var me = this,
        tableControl = WinJS.Utilities.query('div[class=b_commentaries__table]')[0].winControl;
      tableControl.onitemselected = function (id) {
        WinJS.Navigation.navigate('/resources/pages/media-comments.html', {id: id.detail});
      };

      MED.Server.authXHR({
        url: '/api/media',
        type: 'GET'
      }).done(
        function (result) {
          var data = result.response;
          tableControl.setData(data.map(function (item) {
            return {
              name: item.name,
              path: me.pathToString(item.path),
              type: item.type,
              id: item.id,
              date: moment(new Date(item.date)).format('DD-MM-YY'),
              amount: item.amount
            };
          }), true);
          WinJS.Utilities.query('button[class=b_table-button]').listen('click', function (e) {

            e.stopPropagation();
            e.preventDefault();
            var column = e.currentTarget.parentElement.parentElement.firstChild;
            WinJS.Navigation.navigate('/resources/pages/edit-library.html', {id: column.title, type: 'media'});
          });
        },
        function (result) {
          return result.status;
        }
      );
    },
    pathToString: function (path) {
      var strPath = '';
      if (typeof(path) === 'string') {
        return path;
      }
      path.forEach(function (item, index) {
        strPath += item.title;
        if (index !== path.length - 1) {
          strPath += ' > ';
        }
      });
      return strPath;
    }

  });
}());