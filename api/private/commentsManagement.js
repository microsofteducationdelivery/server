var
  parse = require('co-body'),
  koa = require('koa'),
  route = require('koa-route'),
  _ = require('lodash'),
  db = require('../../db'),
  media = require('../../service/media'),
  comment = require('../../service/comment'),
  fs = require('co-fs'),
  app = koa(),
  send = require('koa-send')
  ;

function* commentsExport () {
  var resArray = [];
  var res = yield media.list(this.user);

  for(var i = 0; res.length > i; i++) {
    var oneComment = yield comment.findById(res[i].id);
    oneComment.media = res[i].name;
    resArray.push(oneComment);
  }

  var userCompany = yield this.user.getCompany();

  if(resArray.length && userCompany.length) {

    var path = yield comment.commentsExport(resArray, userCompany);
    if(path) {
      yield send(this, path);
      yield fs.unlink(path);
    } else {
      this.body = 404;
    }
  } else {
    this.body = 500;
  }

}

app.use(route.get('/commentsExport', commentsExport));

module.exports = app;