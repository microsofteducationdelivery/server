var route = require('koa-route'),
  comment = require('../../service/comment'),
  fs = require('co-fs'),
  media = require('../../service/media'),
  send = require('koa-send'),
  parse = require('co-body'),
  app = require('../helper/crud')(comment),
  errors = require('../../helper/errors');

function* commentsExport () {
  var resArray = [];
  var resMedia = yield media.list(this.user);

  for(var i = 0; resMedia.length > i; i++) {
    var oneComment = yield comment.findById(resMedia[i].id);
    oneComment.media = resMedia[i].name;
    resArray.push(oneComment);
  }

  var userCompany = yield this.user.getCompany();

  if(resArray.length && userCompany) {

    var path = yield comment.commentsExport(resArray, userCompany);
    if(path) {
      yield send(this, path);
      yield fs.unlink(path);
    } else {
      errors.noFile('We can not get file');
    }
  } else {
    errors.errorExport('Wrong data for export');
  }

}

app.use(route.get('/commentsExport', commentsExport));

module.exports = app;
