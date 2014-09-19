var os = require('os');
var path = require('path');
var fs = require('co-fs');
var parse = require('co-busboy');
var saveTo = require('save-to');

module.exports = require('../helper/crud')(require('../../service/media'),{
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
    console.log(file, parts.fields);

  }
});