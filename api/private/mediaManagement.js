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

  var parts = parse(this, {
      checkFile: function (fieldname, file, filename) {
        if (path.extname(filename) !== '.png') {
          var err = new Error('invalid png image');
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
  }

  try {
    yield fs.writeFile('public/preview/' + this.query.media + '.png', Buffer.concat(bufs));
    this.body = '/preview/' + this.query.media + '.png';
  } catch (e) {
    console.log(e);
    this.body = 404;
  }

}

function* copyImage() {
  try {
    var copyFile = yield fs.readFile('public/preview/' + this.query.name);
    yield fs.writeFile('public/preview/library' + this.query.fileChange, copyFile);
  } catch (e) {
    this.body = 404;
  }
}

app.use(route.post('/changeImage', changeImage));
app.use(route.get('/copyImage', copyImage));

module.exports = app;
