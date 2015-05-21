var
  parse = require('co-body'),
  koa = require('koa'),
  route = require('koa-route'),
  sendCo = require('koa-send'),

  service = require('../../service/stats')
  ;

var app = koa();

function* top5Downloads () {
  var items = yield service.getTop5Downloads(this.user.CompanyId);
  this.body = items.map(function (item) {
    return {
      id: item.id,
      number: item.downloads,
      text: item.name,
      picture: (item.status === 'converted') ? '/preview/' + item.id + '.png' : null,
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
      picture: (item.status === 'converted') ? '/preview/' + item.id + '.png' : null,
      folder: item.FolderId || 'library' + item.LibraryId
    };
  });
}

function* addToImport () {
  var path = yield service.addToImport(this.user.CompanyId, this);
  this.body = path;
  return this;
}

function* addToArchive () {
  var path = yield service.addToArchive(this.user.CompanyId, this);
  this.body = path;
  return this;
}

app.use(route.get('/top5Downloads', top5Downloads));
app.use(route.get('/top5Views', top5Views));
app.use(route.get('/addToImport', addToImport));
app.use(route.get('/addToArchive', addToArchive));
module.exports = app;

