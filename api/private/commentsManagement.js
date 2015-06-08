var
  parse = require('co-body'),
  koa = require('koa'),
  route = require('koa-route'),
  _ = require('lodash'),
  db = require('../../db'),
  media = require('../../service/media'),
  comment = require('../../service/comment'),
  fs = require('co-fs'),
  excelbuilder = require('msexcel-builder'),
  thunkify = require('co-thunkify'),
  app = koa()
  ;

function* commentsExport () {
  var resArray = [];
  var res = yield media.list(this.user);

  for(var i = 0; res.length > i; i++) {
    var oneComment = yield comment.findById(res[i].id);
    var config = {};
    if(oneComment.length > 1) {
      config.addThree = true;
    } else {
      config.addThree = false;
    }
    config.data = oneComment;
    config.media = res[i].name;

    resArray.push(config);
  }

  //allLibraries =  _.sortBy(allLibraries, 'createdAt');

  var tmpdir = __dirname + '/../../public/tmpExcelDir';

  if(yield fs.exists(tmpdir)) {
    if(yield fs.exists(tmpdir + 'samplesnsComments.xlsx')) {
      yield fs.unlink(tmpdir + 'samplesnsComments.xlsx');
    }
    //yield fs.rmdir(tmpdir);

  }

  //yield fs.mkdir(tmpdir);

  var countCommentaries = 2;

  for(var j = 0; j < resArray.length; j++) {
    countCommentaries += resArray[j].data.length;
  }

  var workbook = excelbuilder.createWorkbook(tmpdir, 'samplesnsComments.xlsx');


  var comments = workbook.createSheet('Comments', countCommentaries, 20);

  comments.set(2, 2, 'Media name');
  comments.set(3, 2, 'author');
  comments.set(4, 2, 'text');
  comments.set(5, 2, 'date');

  var currentLineComments = 3;

  for(var k = 0; k < resArray.length; k++) {
    currentLineComments++;
    if(resArray[k].addThree === true) {
      comments.set(2, currentLineComments, resArray[k].data[0].media);
      comments.set(3, currentLineComments, resArray[k].data[0].author);
      comments.set(4, currentLineComments, resArray[k].data[0].text);
      comments.set(5, currentLineComments, resArray[k].data[0].date);

      for(var g = 1; g < resArray[k].data.length; g++) {
        currentLineComments++;

        comments.set(3, currentLineComments, resArray[k].data[g].media);
        comments.set(4, currentLineComments, resArray[k].data[g].author);
        comments.set(5, currentLineComments, resArray[k].data[g].text);
        comments.set(6, currentLineComments, resArray[k].data[g].date);
      }
    } else {
      comments.set(2, currentLineComments, resArray[k].data[0].media);
      comments.set(3, currentLineComments, resArray[k].data[0].author);
      comments.set(4, currentLineComments, resArray[k].data[0].text);
      comments.set(5, currentLineComments, resArray[k].data[0].date);
    }
  }

  var path = yield thunkify(workbook.save)();
  var pathArr = path.split('/');

  this.body = JSON.stringify(pathArr[pathArr.length - 1]);
  return this;
}

app.use(route.post('/commentsExport', commentsExport));

module.exports = app;