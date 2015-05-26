(function () {
  'use strict';
  function toDate (string) {
    var date = new Date();
    date.setFullYear(string.substr(6, 4) - 0);
    date.setMonth(string.substr(3,2) - 0);
    date.setDate(string.substr(0, 2) - 0);
    return date;
  }
  function sortGenerator(key, type) {

    return function (a, b) {
      var tmpA, tmpB;
      if (type === 'text') {
        tmpA = a[key].toString();
        tmpB = b[key].toString();
      }
      if (type === 'number') {
        tmpA = a[key] - 0;
        tmpB = b[key] - 0;
      }
      if (type === 'date') {

        tmpA = toDate(a[key]);
        tmpB = toDate(b[key]);
      }
      if (tmpA === tmpB) {
        return 0;
      }
      return tmpA > tmpB ? 1 : -1;
    };
  }
  function generateTable (column, noCheck, width) {
    var table = document.createElement('table'),
      tHeader = document.createElement('thead'),
      tBody = document.createElement('tbody'),
      trHead = document.createElement('tr'),
      trBody = document.createElement('tr'),
      tdCheckHead  = document.createElement('td'),
      tdCheckBody  = document.createElement('td'),
      checkBoxHead = document.createElement('INPUT'),
      checkBoxBody = document.createElement('INPUT'),
      checkBoxHeadLabel = document.createElement('label'),
      headLabel = document.createElement('div'),
      headBox = document.createElement('div'),
      bodyBox = document.createElement('div'),
      checkBoxBodyLabel = document.createElement('label')
    ;

    headBox.setAttribute('class', 'b_head-box');
    bodyBox.setAttribute('class', 'b_body-box');
    checkBoxBodyLabel.setAttribute('class', 'b_checkbox-label');

    headLabel.innerHTML = 'Select all';
    headLabel.setAttribute('class', 'b_head-label');
    checkBoxHead.className = 'main-box';
    checkBoxBody.className = 'row-box';
    checkBoxBody.setAttribute('data-win-bind', 'value: id');

    checkBoxHead.setAttribute('type', 'checkbox');
    checkBoxBody.setAttribute('type', 'checkbox');
    checkBoxHeadLabel.appendChild(checkBoxHead);

    checkBoxHeadLabel.appendChild(headBox);
    checkBoxHeadLabel.appendChild(headLabel);

    tdCheckHead.appendChild(checkBoxHeadLabel);
    tdCheckHead.setAttribute('class', 'check-td');
    checkBoxBodyLabel.appendChild(checkBoxBody);
    checkBoxBodyLabel.appendChild(bodyBox);
    tdCheckBody.appendChild(checkBoxBodyLabel);

    if (!noCheck) {
      trHead.appendChild(tdCheckHead);
      trBody.appendChild(tdCheckBody);
    }

    tHeader.appendChild(trHead);
    tHeader.className = 'table-header';

    tBody.appendChild(trBody);
    tBody.className = 'table-body';
    tBody.id = 'table-body';

    table.appendChild(tHeader);
    table.appendChild(tBody);
    table.className = 'table';

    for (var i = 0; i < column.length; i ++) {
      var td =  document.createElement('td'),
        tdBody = document.createElement('td')
        ;

      if (column[i].hasOwnProperty('icon')) {
        var icon = document.createElement('i'),
          label = document.createElement('div'),
          labelArrow = document.createElement('div')
          ;

        icon.setAttribute('key', column[i].key);
        icon.setAttribute('type', column[i].type);
        label.className = 'label-rect';
        label.textContent = column[i].text;
        labelArrow.className = 'label-arrow';
        label.appendChild(labelArrow);

        icon.className = column[i].icon;
        icon.appendChild(label);

        if (column[i].type !== 'button') {
          td.appendChild(icon);
        }
      }

      td.className = 'table-header column-' + i;
      if (width && width[i]) {
        td.style.maxWidth = width[i];
      }
      if (column[i].hasOwnProperty('float')) {
        tdBody.style.textAlign = column[i].float;
        tdBody.style.paddingRight = '20px';
        td.style.textAlign = column[i].float;
        td.style.paddingRight = '20px';

      }
      if (column[i].hasOwnProperty('width')) {
        td.style.maxWidth = column[i].width;
        td.style.minWidth = column[i].width;

      }
      trHead.appendChild(td);
      if (column[i].type === 'button') {
        var button = document.createElement('button'),
          icon;

        icon = document.createElement('i');
        icon.setAttribute('class', column[i].icon);
        button.appendChild(icon);
        button.setAttribute('class', 'b_table-button');
        tdBody.appendChild(button);
      } else {
        tdBody.setAttribute('data-win-bind', 'textContent: ' + column[i].key);
      }

      if (i === 0) {
        tdBody.setAttribute('data-win-bind', 'textContent: ' + column[i].key + '; title: id');
      }

      trBody.appendChild(tdBody);
      trBody.className = 'table-body-row';
    }
    return table;
  }

  var controlClass = WinJS.Class.define(
    function Control_ctor(element, options) {
      var me = this,
        table = generateTable(options.columns, options.noCheck, options.width)
        ;

      this.element = element || document.createElement('div');
      this.element.winControl = this;
      this.element.appendChild(table);

      this.list = new WinJS.Binding.List(options.data);
      this.repeater = new WinJS.UI.Repeater(this.element.querySelector('tbody'), {data: this.list});

      WinJS.Namespace.define('Data', {
        items: me.list
      });
    },
    {
      getSelection: function (isChecked) {
        var checked = typeof(isChecked) === 'undefined' ? true : isChecked,
          css = checked === false ? ':not(:checked)' : ':checked';

        var checkedArr = [],
          checkList = WinJS.Utilities.query('input[class="row-box"][type=checkbox]'+ css, this.element)
          ;

        for (var i = 0; i < checkList.length; i ++) {
          checkedArr.push(checkList[i].value);
        }

        return checkedArr;
      },
      setEvents: function (noCheck) {
        var me = this,
          mainCheckBox = WinJS.Utilities.query('input.main-box[type=checkbox]', this.element)[0]
          ;
        if (!noCheck) {
          mainCheckBox.addEventListener('click', function (self) {
            var checkList = WinJS.Utilities.query('input.row-box[type=checkbox]', me.element);
            var checked = self.srcElement.checked;

            for (var i = 0; i < checkList.length; i++) {
              checkList[i].checked = checked;
            }
            me.dispatchEvent('selectionchange', me.getSelection());
          });
          WinJS.Utilities.query('input.row-box[type=checkbox]').listen('click', function (e) {
            e.stopPropagation();

            WinJS.Utilities.query('input.row-box[type=checkbox]', e.target.parentNode).removeClass('b_three-state--checked');
            me.dispatchEvent('selectionchange', me.getSelection());
            mainCheckBox.checked = false;
          });
          WinJS.Utilities.query('[class=b_checkbox-label]').listen('click', function (e) {
            e.stopPropagation();
            me.dispatchEvent('selectionchange', me.getSelection());
            mainCheckBox.checked = false;
          });
        }
        WinJS.Utilities.query('tbody[id=table-body]>tr').listen('click', function (element) {
          var input = element.currentTarget.querySelector('input'),
            id;
          if (input) {
            id = input.value;
          } else {
            id = element.currentTarget.querySelector('td').title;
          }


          me.dispatchEvent('itemselected', id);
        });


        WinJS.Utilities.query('i').listen('click', function (self) {
          var srcElement = self.srcElement,
            key = srcElement.getAttribute('key'),
            type = srcElement.getAttribute('type'),
            direction = srcElement.getAttribute('direction'),
            selection = me.getSelection()
            ;

          me.list.sort(sortGenerator(key, type));

          if (direction === 'revers') {
            me.list.reverse();
            srcElement.setAttribute('direction', 'row');
          } else {
            srcElement.setAttribute('direction', 'revers');
          }
          if (!noCheck) {
            WinJS.Utilities.query('input.row-box[type=checkbox]').listen('click', function () {
              me.dispatchEvent('selectionchange', me.getSelection());
              mainCheckBox.checked = false;
            });
            me.setSelection(selection);
          }

        });

      },
      setData: function (data, noCheck) {
        var list = this.list,
          length = list.length
          ;
        if (!data) {
          return;
        }

        list.splice(0, length);
        data.forEach(function (item) {
          list.push(item);
        });

        this.setEvents(noCheck);

      },
      deselectAll: function () {
        var box = WinJS.Utilities.query('input.row-box[type=checkbox]:checked');
        var mainBox = WinJS.Utilities.query('input.main-box[type=checkbox]:checked');

        for (var i = 0; i < mainBox.length; i ++) {
          mainBox[i].checked = false;
        }
        for (var i = 0; i < box.length; i ++) {
          box[i].checked = false;
        }

      },
      getThreeStateSelection: function () {
        var checkedArr = [],
          checkList = WinJS.Utilities.query('input.b_three-state--checked[type=checkbox]', this.element)
        ;

        for (var i = 0; i < checkList.length; i ++) {
          checkedArr.push(checkList[i].value);
        }

        return checkedArr;
      },
      setThreeStateSelection: function (selection) {
        for (var i = 0; i < selection.length; i ++) {
          WinJS.Utilities.query('input.row-box[value="' + selection[i] + '"]', this.element).addClass('b_three-state--checked');
        }
      },
      setSelection: function (selection) {
        for (var i = 0; i < selection.length; i ++) {
          var box = WinJS.Utilities.query('input.row-box[value="' + selection[i] + '"]', this.element);
          if (box[0]) {
            box[0].checked = true;
          }
        }
      }
    }

  );
  WinJS.Class.mix(controlClass, WinJS.Utilities.eventMixin);
  WinJS.Class.mix(controlClass, WinJS.Utilities.createEventProperties("selectionchange"));
  WinJS.Class.mix(controlClass, WinJS.Utilities.createEventProperties("itemselected"));
  WinJS.Namespace.define('Table.UI', {
    Table: controlClass
  });

  WinJS.UI.processAll();

})();