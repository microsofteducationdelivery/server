var
  parse = require('co-body'),
  koa = require('koa'),
  route = require('koa-route'),

  service = require('../../service/motd')
  ;

var app = koa();

function* top5Downloads () {
  var motd = yield service.get(this.user);
  this.body = {text: motd || ''};
}

function* top5Views () {
  var data = yield parse(this);
  yield service.set(data, this.user);
  this.status = 204;
}


app.use(route.get('/top5Downloads', top5Downloads));
app.use(route.get('/top5Views', top5Views));
module.exports = app;

