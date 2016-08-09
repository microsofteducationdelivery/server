var route = require('koa-route'),
  service = require('../../service/library'),
  parse = require('co-body'),
  app = require('../helper/crud')(require('../../service/library'));

function* changeLibraryName() {
  yield service.changeLibraryName(yield parse(this), this.user);
}

function* shareLibrary() {
  yield service.shareLibrary(yield parse(this));
}

function* rejectInvite() {
  yield service.canselInvite(this.query.lib.substr(7), this.query.company);
}

app.use(route.post('/changeLibraryName', changeLibraryName));
app.use(route.post('/shareLibrary', shareLibrary));
app.use(route.get('/rejectInvite', rejectInvite));

module.exports = app;

