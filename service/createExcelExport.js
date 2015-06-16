var
  excelbuilder = require('msexcel-builder'),
  thunkify = require('co-thunkify'),
  fs = require('co-fs'),
  _ = require('underscore');

module.exports = {

  createExcelFile: function* (data, tableName, type, companyId) {
    var tmpdir = __dirname + '/../public/tmpExcelDir';

    var fileName = companyId + type + '.xlsx';
    var arrayName = tableName.split('|');

    if(yield fs.exists(tmpdir + '/' + fileName)) {
      yield fs.unlink(tmpdir + '/' + fileName);
    }

    var workbook = excelbuilder.createWorkbook(tmpdir, fileName);

    var downloads = workbook.createSheet(type, arrayName.length, data.length + 3);

    downloads.set(1, 1, type);
    downloads.font(1, 1, { sz: 10 });
    downloads.set(2, 1, new Date());


    _.each(arrayName, function(item, index) {
      downloads.set(++index, 2, item);
    });

    var currentLineDownloads = 3;

    for(var j = 0; j < data.length; j++) {
      for(var i = 0; i < arrayName.length; i++) {
        var field = arrayName[i];
        var currentCell = i + 1;
        if(type === 'error') {
          downloads.set(currentCell, currentLineDownloads, data[j][field]);
        } else {
          downloads.set(currentCell, currentLineDownloads, data[j].dataValues[field]);
        }
      }
      currentLineDownloads++;
    }

    var path = yield thunkify(workbook.save)();
    var pathArr = path.split('/');
    return pathArr[pathArr.length - 1];
  }

};
