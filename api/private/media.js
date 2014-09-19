var os = require('os');
var path = require('path');
var fs = require('co-fs');
var parse = require('co-busboy');
var saveTo = require('save-to');
var service = require('../../service/media');

module.exports = require('../helper/crud')(service, {
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
    var file = path.join(tmpdir, Math.random().toString() + part.filename);
    yield saveTo(part, file);
    var data = { file: file };
    parts.fields.forEach(function (field) {
      data[field[0]] = field[1];
    });
    console.log(data);
    yield service.add(data);
    this.status = 201;


  }
});