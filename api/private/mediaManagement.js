var
  koa = require('koa'),
  app = koa(),
  route = require('koa-route'),
  db = require('../../db'),
  media = require('../../service/media'),
  parse = require('co-busboy'),
  fs = require('co-fs'),
  path = require('path')
;

function* changeImage() {
  console.log(this.query);


  var parts = parse(this, {
      checkFile: function (fieldname, file, filename) {
        if (path.extname(filename) !== '.png') {
          var err = new Error('invalid jpg image');
          err.status = 400;
          return err;
        }
      }
    }),
    part,
    me = this;
  var bufs = [];

  while (part = yield parts) {
    if (!part.filename) {
      return me.body = 'No file';
    }

    part.on('data', function (chank) {
      bufs.push(chank);
    });
    part.on('end', function () {

    });
  }

  try {
    yield fs.writeFile('public/preview/' + this.query.media + '.png', Buffer.concat(bufs));
    this.body = 'http://' + this.host + '/preview/' + this.query.media + '.png';
  } catch (e) {
    console.log(e);
  }
}

app.use(route.post('/changeImage', changeImage));

module.exports = app;
