var
  parse = require('co-body'),
  koa = require('koa'),
  route = require('koa-route'),

  service = require('../../service/motd')
;

var app = koa();

function* getMOTD() {
  var motd = yield service.get(this.user);
  this.body = {text: motd || ''};
}

function* setMOTD() {
  var data = yield parse(this);
  yield service.set(data, this.user);
  this.status = 204;
}


app.use(route.get('/', getMOTD));
app.use(route.post('/', setMOTD));
module.exports = app;

