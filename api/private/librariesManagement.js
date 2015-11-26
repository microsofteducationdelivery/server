var
  koa = require('koa'),
  app = koa(),
  route = require('koa-route'),
  db = require('../../db'),
  parse = require('co-body'),
  library = require('../../service/library')
;

function* changeLibraryName() {
  var dataLibrary = yield parse(this);
  yield library.changeLibraryName(dataLibrary.id, dataLibrary.name, this.user);
}

app.use(route.post('/changeLibraryName', changeLibraryName));

module.exports = app;
