var
  parse = require('co-body'),
  koa = require('koa'),
  route = require('koa-route'),
  _ = require('lodash'),
  db = require('../../db'),
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

app.use(route.post('/isUnique', isUnique));
module.exports = app;