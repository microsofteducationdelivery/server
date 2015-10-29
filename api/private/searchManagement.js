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
  var commonArray = [];
  if(data) {
    var mediaFiles = yield media.searchMedia(data);
    mediaFiles.forEach(function(item) {
      item.type = 'media';
      commonArray.push(item);
    });
    var users = yield user.searchUser(data);
    users.forEach(function(item) {
      item.type = 'user';
      commonArray.push(item);
    });
  }

  return this.body = commonArray;
}

app.use(route.post('/search', searchUsersAndMedia));

module.exports = app;
