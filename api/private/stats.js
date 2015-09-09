var
  parse = require('co-body'),
  koa = require('koa'),
  route = require('koa-route'),
  sendCo = require('koa-send'),
  fs = require('co-fs'),
  excel = require('../../service/createExcelExport'),
  service = require('../../service/stats'),
  config = require('../../config')
  ;

var app = koa();

function* top5Downloads () {
  var items = yield service.getTop5Downloads(this.user.CompanyId);
  this.body = items.map(function (item) {
    return {
      id: item.id,
      number: item.downloads,
      text: item.name,
      picture: (item.status === 'converted') ? config.app.baseUrl + '/preview/' + item.id + '.png' : null,
      folder: item.FolderId || 'library' + item.LibraryId
    };
  });
}

function* top5Views () {
  var items = yield service.getTop5Views(this.user.CompanyId);
  this.body = items.map(function (item) {
    return {
      id: item.id,
      number: item.views,
      text: item.name,
      picture: (item.status === 'converted') ? config.app.baseUrl + '/preview/' + item.id + '.png' : null,
      folder: item.FolderId || 'library' + item.LibraryId
    };
  });
}

function* addToImport () {
  var creds = yield service.addToImport(this.user.CompanyId);
  var path = yield excel.createExcelFile(creds.data, creds.fields, 'stats', this.user.CompanyId);
  yield sendCo(this, path);
  yield fs.unlink(path);
  return this;
}

app.use(route.get('/top5Downloads', top5Downloads));
app.use(route.get('/top5Views', top5Views));
app.use(route.get('/addToImport', addToImport));
module.exports = app;
