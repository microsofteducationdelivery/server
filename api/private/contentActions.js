var
  parse = require('co-body'),
  koa = require('koa'),
  route = require('koa-route'),
  _ = require('lodash'),
  db = require('../../db'),

  service = require('../../service/motd')
;

var app = koa();

function* deleteItems () {
  var items =  yield parse(this);
  yield [
    db.Folder.destroy({id : _(items).filter({type: 'folder'}).map('id').value() }),
    db.Media.destroy({id : _(items).filter({type: 'media'}).map('id').value() })
  ];
  this.status = 204;
}

app.use(route.post('/delete', deleteItems));
module.exports = app;

