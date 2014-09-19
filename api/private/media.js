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
    yield fs.mkdir(tmpdir);

    // list of all the files
    var file;

    // yield each part as a stream
    var part;
    while (part = yield parts) {
      // filename for this part
      files.push(file = path.join(tmpdir, Math.random().toString() + part.filename));
      // save the file
      yield saveTo(part, file);
    }

  }
});