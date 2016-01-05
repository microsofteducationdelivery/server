var
  excelbuilder = require('msexcel-builder'),
  thunkify = require('co-thunkify'),
  fs = require('co-fs'),
  _ = require('underscore'),
  os = require('os')
  ;

module.exports = {

  createExcelFile: function* (data, tableName, type, companyId) {
    var tmpdir = os.tmpdir();

    var fileName = companyId + type + '.xlsx';
    var arrayName = tableName.split('|');

    if(yield fs.exists(tmpdir + '/' + fileName)) {
      yield fs.unlink(tmpdir + '/' + fileName);
    }

    var workbook = excelbuilder.createWorkbook(tmpdir, fileName);

    var downloads = workbook.createSheet(type, arrayName.length, data.length + 3);

    _.each(arrayName, function(item, index) {
      downloads.set(++index, 1, item);
    });

    var currentLineDownloads = 2;

    for(var j = 0; j < data.length; j++) {
      for(var i = 0; i < arrayName.length; i++) {
        var field = arrayName[i];
        var currentCell = i + 1;

        if(field === 'createdAt' && type === 'error') {
          data[j][field] = this.formatData(data[j][field]);
        } else if(field === 'createdAt' && type !== 'error') {
          data[j].dataValues[field] = this.formatData(data[j].dataValues[field]);
        }

        if(type === 'sheet1') {
          downloads.set(currentCell, currentLineDownloads, data[j][field]);
        } else {
          downloads.set(currentCell, currentLineDownloads, data[j].dataValues[field]);
        }
      }
      currentLineDownloads++;
    }
    return yield thunkify(workbook.save)();
  },

  formatData: function (data) {
    return data.getDate() + '.' + (data.getMonth() + 1) + '.' + data.getFullYear() + '  ' + (data.getHours() + 1) + ':' + (data.getMinutes() + 1);
  }

};
