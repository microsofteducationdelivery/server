(function () {
  'use strict';

  var mostDownloadList = new WinJS.Binding.List(),
    mostViewedList = new WinJS.Binding.List()
    ;

  var callback = function (response, status, list) {
    if (status === 200) {
      var feed = response,
        length = list.length
      ;

      list.splice(0, length);
      feed.forEach(function (item) {
        list.push(item);
      });
    } else {
      console.log("Error obtaining feed. XHR status code: " + status);
    }
  };

  WinJS.UI.Pages.define("/resources/pages/statistics.html", {
    ready: function (element, options) {
      var pickers =  $(".b_filter--date-picker--input__picker" );

      pickers.datepicker({ dateFormat: "M d, yy" });
      pickers.on('change', function (el) {
        var from = $('#from'),
          to = $('#to'),
          dateFrom = from.datepicker('getDate'),
          targetedValue = $('#' + el.target.id).datepicker('getDate'),
          dateTo = to.datepicker('getDate')
          ;

        if (!dateFrom || !dateTo) {
          return;
        }

        if (dateFrom > dateTo) {
          from.datepicker("setDate", targetedValue);
          to.datepicker("setDate", targetedValue);
        }

      });
      var periodRadio = WinJS.Utilities.query('input[type=radio][value=period]')[0],
        allRadio = WinJS.Utilities.query('input[type=radio][value=all]')[0],
        datePickerField = WinJS.Utilities.query('div[class=b_filter--date-picker]')[0],
        isPeriod = periodRadio.checked,
        downloadAll = WinJS.Utilities.query('button[class=b_filter--btn__download]')[0],
        downloadMostDownloaded = WinJS.Utilities.query('div[id=downloaded]>button[class=b_content--result--toolbar__btn]')[0],
        downloadMostViewed = WinJS.Utilities.query('div[id=viewed]>button[class=b_content--result--toolbar__btn]')[0],
        lists = WinJS.Utilities.query('div[data-win-control="WinJS.UI.ListView"]', element)
        ;

        lists[0].winControl.oniteminvoked = this.onMediaSelect;
        lists[1].winControl.oniteminvoked = this.onMediaSelect;


      if (!isPeriod) {
        datePickerField.classList.add('hidden');
      }
      periodRadio.onchange = function () {
        datePickerField.classList.remove('hidden');
      };
      allRadio.onchange = function () {
        datePickerField.classList.add('hidden');
      };

      downloadAll.onclick = function () {
        if (isPeriod) {
          var dateFrom = $('#from').datepicker('getDate'),
            dateTo = $('#to').datepicker('getDate')
            ;
        }
        console.log('download all');
      };
      downloadMostDownloaded.onclick = function () {

        console.log('download most downloaded');
      };
      downloadMostViewed.onclick = function () {

        console.log('download most viewed');
      };

      MED.Server.authXHR({
        url: '/api/stats/top5Views',
        type: 'GET'
      }).done(
        function (result) {
          callback(result.response, result.status, mostViewedList);
        },
        function (result) {
          callback(null, result.status);
        }
      );

      MED.Server.authXHR({
        url: '/api/stats/top5Downloads',
        type: 'GET'
      }).done(
        function (result) {
          callback(result.response, result.status, mostDownloadList);
        },
        function (result) {
          callback(null, result.status);
        }
      );

    },
    onMediaSelect: function (e) {
        var dataset = e.target.querySelector('div[class=b_list-tpl--item]').dataset
        WinJS.Navigation.navigate('/resources/pages/edit-library.html', {id: dataset.id, type: 'media', folder: dataset.folder});
    }

  });

    WinJS.Namespace.define('WinJS.statistics', {
        getSrc: WinJS.Binding.converter(function (src) {
            if (src === null) {
                return '/resources/images/stub.png';
            }
            return src;
        })
    });
    WinJS.Namespace.define('MostDownloaded.ListView', {
    data: mostDownloadList
  });
  WinJS.Namespace.define('MostViewed.ListView', {
    data: mostViewedList
  });
  WinJS.UI.processAll();

})();