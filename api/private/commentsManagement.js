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
    var config = {};
    if(oneComment.length > 1) {
      config.addThree = true;
    } else {
      config.addThree = false;
    }
    config.data = oneComment;
    config.media = res[i].name;

    resArray.push(config);
  }

  var userCompany = yield this.user.getCompany();

  var path = yield comment.commentsExport(resArray, userCompany);
  yield send(this, path);
  yield fs.unlink(path);
}

app.use(route.get('/commentsExport', commentsExport));

module.exports = app;