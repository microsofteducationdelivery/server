var route = require('koa-route'),
  service = require('../../service/library'),
  parse = require('co-body'),
  app = require('../helper/crud')(require('../../service/library'));

function* changeLibraryName() {
  yield service.changeLibraryName(yield parse(this), this.user);
}

app.use(route.post('/changeLibraryName', changeLibraryName));

module.exports = app;

