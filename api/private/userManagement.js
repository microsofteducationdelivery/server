var
  parse = require('co-body'),
  koa = require('koa'),
  route = require('koa-route'),
  _ = require('lodash'),
  db = require('../../db'),
  fs = require('co-fs'),
  excel = require('../../service/createExcelExport'),
  user = require('../../service/user'),
  send = require('koa-send'),
  app = koa()
  ;

function* isUnique () {
  var item =  yield parse(this),
    where = {},
    response = {};

  where[item.key] = item.value;
  var test = yield db.User.find({
    where: where
  });

  response.isUnique = !!(!test || (item.id && test.id.toString() === item.id));
  this.status = 200;
  this.body = response;

}

function* userImport () {
  var creds = yield user.exportUsers(this.user, this);

  if (creds) {
    var path = yield excel.createExcelFile(creds.errors, creds.fields, 'error', this.user);

    yield send(this, path);
    yield fs.unlink(path);
  } else {
    this.body = 'ok';
  }
  return this;
}

app.use(route.post('/userImport', userImport));
app.use(route.post('/isUnique', isUnique));
module.exports = app;