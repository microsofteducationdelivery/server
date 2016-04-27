var os = require('os'),
  path = require('path'),
  fs = require('co-fs'),
  parse = require('co-busboy'),
  saveTo = require('save-to'),
  service = require('../../service/media'),
  mime = require('mime'),
  route = require('koa-route'),
  errors = require('../../helper/errors');

var app = require('../helper/crud')(service, {
  create: function* () {
    console.log('overridden');
    var parts = parse(this, {
      autoFields: true // saves the fields to parts.field(s)
    });

    // create a temporary folder to store files
    var tmpdir = path.join(os.tmpdir(), 'med-temp');
    try {
      yield fs.mkdir(tmpdir);
    } catch(e) {
      if ( e.code !== 'EEXIST' ) { throw e; }
    }

    // list of all the files
    // yield each part as a stream
    var part = yield parts;
    var fakeId = (Math.floor(Math.random() * (10000000 - 1000000 + 1)) + 1000000).toString(15) + new Date().getTime();

    var startExtension = part.filename.lastIndexOf('.');
    var file = path.join(tmpdir, fakeId + part.filename.substring(startExtension));
    yield saveTo(part, file);
    var data = { file: file };
    parts.fields.forEach(function (field) {
      data[field[0]] = field[1];
    });
    var type = 'unknown';
    var mimeType = mime.lookup(file);
    if (mimeType.indexOf('image') !== -1) {
      type = 'image';
    } else if (mimeType.indexOf('video') !== -1) {
      type = 'video';
    } else if (mimeType === 'text/plain') {
      type = 'text';
    }

    if (type !== 'unknown') {
      data.type = type;
      data.fakeId = fakeId;
      yield service.add(data);
      this.status = 201;
    } else {
      yield(fs.unlink(path));
      throw new errors.noFile('It is not current type');
    }
  }
});

function* changeImage() {

  var parts = parse(this, {
      checkFile: function (fieldname, file, filename) {
        if (path.extname(filename) !== '.png') {
          errors.invalidFile('File type is incorrect');
        }
      }
    }),
    part,
    me = this;
  var bufs = [];

  while (part = yield parts) {
    if (!part.filename) {
      continue;
    }

    part.on('data', function (chank) {
      bufs.push(chank);
    });
  }

  yield fs.writeFile('./public/preview/' + this.query.media + '.png', Buffer.concat(bufs));
  this.body = '//preview/' + this.query.media + '.png';

}

function* copyImage() {
  var copyFile = yield fs.readFile('public/preview/' + this.query.name);
  yield fs.writeFile('public/preview/' + this.query.fileChange, copyFile);
}

app.use(route.post('/changeImage', changeImage));
app.use(route.get('/copyImage', copyImage));

module.exports = app;