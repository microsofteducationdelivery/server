var
  koa = require('koa'),
  app = koa(),
  route = require('koa-route'),
  db = require('../../db'),
  media = require('../../service/media'),
  user = require('../../service/user'),
  parse = require('co-body'),
  fs = require('co-fs')
  ;

function* searchUsersAndMedia() {
  var data =  yield parse(this);

    var mediaFiles = yield media.searchMedia(data);

    var users = yield user.searchUser(data);

  return this.body = {
    media: mediaFiles,
    users: users
  };
}

app.use(route.post('/search', searchUsersAndMedia));

module.exports = app;
