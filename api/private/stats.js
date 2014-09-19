var
  parse = require('co-body'),
  koa = require('koa'),
  route = require('koa-route'),

  service = require('../../service/stats')
  ;

var app = koa();

function* top5Downloads () {
  var items = yield service.getTop5Downloads();
  this.body = items.map(function (item) {
    return {
      id: item.id,
      number: item.downloads,
      text: item.name,
      picture: item.picture,
      folder: item.FolderId || 'library' + item.LibraryId
    };
  });
}

function* top5Views () {
  var items = yield service.getTop5Views();
  this.body = items.map(function (item) {
    return {
      id: item.id,
      number: item.views,
      text: item.name,
      picture: item.picture,
      folder: item.FolderId || 'library' + item.LibraryId
    };
  });
}


app.use(route.get('/top5Downloads', top5Downloads));
app.use(route.get('/top5Views', top5Views));
module.exports = app;

