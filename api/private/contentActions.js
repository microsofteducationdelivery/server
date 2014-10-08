var
  parse = require('co-body'),
  koa = require('koa'),
  route = require('koa-route'),
  _ = require('lodash'),
  db = require('../../db'),

  service = require('../../service/motd')
;

var app = koa();
function parseArr (str) {
  var arr = [];
  while(str.search(',') !== -1) {
    arr.push(str.substr(0, str.search(',')));
    str = str.substr(str.search(',') + 1);
  }
  arr.push(str);
  return arr;
}
function* getInvited (ids) {
  var me = this,
    libIds = parseArr(ids),
    users = [],
    selection = [],
    length,
    lengthArr = [],
    uniqArr = [],
    id,
    threeStateSelection = [],
    libs = yield db.Library.findAll({
      where: {id: libIds.map(function (item) {
        return item.substr(7);
      })}
    });

  libs.forEach(function* (lib) {
    length = users.length;
    users.push(yield lib.getUsers());
    users.forEach(function (item) {
      item.map(function (u) {
        return u.id;
      }).forEach(function (i) {
        id = i.toString();
        lengthArr[id] = lengthArr[id] ? lengthArr[id] : 0;
        lengthArr[id] ++;
        uniqArr.push(i);
      });
    });

    uniqArr = uniqArr.filter(function (value, index, self) {
      return self.indexOf(value) === index;
    });

    uniqArr.forEach(function (item) {
      if (lengthArr[item.toString()] === length) {
        selection.push(item);
      } else {
        threeStateSelection.push(item);
      }
    });
  });
  me.status = 200;
  me.body = {selection: selection, threeStateSelection: threeStateSelection};

}
function* inviteUsers () {
  var items =  yield parse(this),
    libIds = items.libraries,
    libs,
    userIds = items.users,
    users,
    rmUsers,
    rmUsersIds = items.removeUsers
  ;

  libs = yield db.Library.findAll({
    where: {id: libIds.map(function (item) {
      return item.substr(7);
    })}
  });
  users = yield db.User.findAll({
    where: {id: userIds}
  });

  rmUsers = yield db.User.findAll({
    where: {id: rmUsersIds}
  });

  libs.forEach(function (lib) {
     rmUsers.forEach(function (rUsr) {
      lib.removeUser(rUsr);
    });
    users.forEach(function (user) {
      lib.addUser(user);
    });
  });

  this.status = 204;
}
function* deleteItems () {
  var items =  yield parse(this);
  yield [
    db.Folder.destroy({id : _(items).filter({type: 'folder'}).map('id').value() }),
    db.Media.destroy({id : _(items).filter({type: 'media'}).map('id').value() })
  ];
  this.status = 204;
}
app.use(route.put('/inviteUsers', inviteUsers));
app.use(route.get('/inviteUsers/:id', getInvited));
app.use(route.post('/delete', deleteItems));
module.exports = app;

