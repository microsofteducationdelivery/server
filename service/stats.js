var
  db = require('../db'),
  table = db.Media,
  koa = require('koa'),
  lib = db.Library,

  errors = require('../helper/errors'),
  C = require('../helper/constants'),
  excelbuilder = require('msexcel-builder'),
  fs = require('co-fs'),
  thunkify = require('co-thunkify'),
  nodeExcel = require('excel-export'),
  _ = require('underscore'),
  send = require('send'),
  sendCo = require('koa-send');
  ;

var app = koa();

module.exports = {
  getTop5Views: function* (companyId) {
    var libs = yield lib.findAll({
      where: {CompanyId: companyId},
      attributes: ["id"]
    });
    libs = libs.map(function (lib) {
      return lib.dataValues.id;
    });
    return yield table.findAll({
      where: {LibraryId: libs},
      order: 'views DESC',
      limit: 5
    });
  },

  getTop5Downloads: function* (companyId) {
    var libs = yield lib.findAll({
      where: {CompanyId: companyId},
      attributes: ["id"]
    });
    libs = libs.map(function (lib) {
      return lib.dataValues.id;
    });

    return yield table.findAll({
      where: {LibraryId: libs},
      order: 'downloads DESC',
      limit: 5
    });
  },

  addToImport: function* (companyId,t) {

   var me = t;
    var top5Downloads = yield this.getTop5Downloads(companyId);
    var top5Viewved = yield this.getTop5Views(companyId);

   top5Downloads =  _.sortBy(top5Downloads, 'createdAt');
    top5Viewved =  _.sortBy(top5Viewved, 'createdAt');

    var tmpdir = __dirname + '/../public/tmpExcelDir';

    if(yield fs.exists(tmpdir)) {
      if(yield fs.exists(tmpdir + '/samplesns.xlsx')) {
        yield fs.unlink(tmpdir + '/samplesns.xlsx');
      }
      yield fs.rmdir(tmpdir);

    }

    yield fs.mkdir(tmpdir);


    var workbook = excelbuilder.createWorkbook(tmpdir, 'samplesns.xlsx');

   var downloads = workbook.createSheet('downloads', 20, 20);

    downloads.set(1, 1, 'Top 5 downloads');
    downloads.font(1, 1, { sz: 10 });
    downloads.set(2, 1, new Date());


    downloads.set(2, 2, 'File name');
    downloads.set(3, 2, 'type');
    downloads.set(4, 2, 'data');
    downloads.set(5, 2, 'downloads');

    var currentLineDownloads = 3;
    _.each(top5Downloads, function(item) {
      downloads.set(2, currentLineDownloads, item.name);
      downloads.set(3, currentLineDownloads, item.type);
      downloads.set(4, currentLineDownloads, item.createdAt);
      downloads.set(5, currentLineDownloads, item.downloads);
      currentLineDownloads++;
    });

    //9

    downloads.set(1, 9, 'Top 5 views');
    downloads.set(2, 9, new Date());


    downloads.set(2, 10, 'File name');
    downloads.set(3, 10, 'type');
    downloads.set(4, 10, 'data');
    downloads.set(5, 10, 'downloads');

    var currentLineView = 11;
    _.each(top5Viewved, function(item) {
      downloads.set(2, currentLineView, item.name);
      downloads.set(3, currentLineView, item.type);
      downloads.set(4, currentLineView, item.createdAt);
      downloads.set(5, currentLineView, item.downloads);
      currentLineView++;
    });

   /* workbook.save(function(err, name, some1, some2) {
      console.log(err);
      console.log(name);
      var pathArr = name.split('/');
      return pathArr[pathArr.length - 1];
    });*/

      var path = yield thunkify(workbook.save)();
      var pathArr = path.split('/');
      return pathArr[pathArr.length - 1];
      //yield fs.unlink(path);
      //yield fs.rmdir(tmpdir);

  },

  addToArchive: function* (companyId) {
    var libs = yield lib.findAll({
      where: {CompanyId: companyId},
      attributes: ["id"]
    });
    libs = libs.map(function (lib) {
      return lib.dataValues.id;
    });

    var allLibraries = yield table.findAll({
      where: {LibraryId: libs}
    });

    //allLibraries =  _.sortBy(allLibraries, 'createdAt');

    var tmpdir = __dirname + '/../public/tmpExcelDir';

    if(yield fs.exists(tmpdir)) {
      if(yield fs.exists(tmpdir + '/samplesns.xlsx')) {
        yield fs.unlink(tmpdir + '/samplesns.xlsx');
      }
      yield fs.rmdir(tmpdir);

    }

    yield fs.mkdir(tmpdir);

    var workbook = excelbuilder.createWorkbook(tmpdir, 'samplesns.xlsx');

    var downloads = workbook.createSheet('downloads', 20, 20);

    downloads.set(2, 2, 'File name');
    downloads.set(3, 2, 'type');
    downloads.set(4, 2, 'viewed');
    downloads.set(5, 2, 'downloads');

    var currentLineDownloads = 3;
    _.each(allLibraries, function(item) {
      downloads.set(2, currentLineDownloads, item.name);
      downloads.set(3, currentLineDownloads, item.type);
      downloads.set(4, currentLineDownloads, item.views);
      downloads.set(5, currentLineDownloads, item.downloads);
      currentLineDownloads++;
    });

    var path = yield thunkify(workbook.save)();
    var pathArr = path.split('/');
    return pathArr[pathArr.length - 1];
  }

};
