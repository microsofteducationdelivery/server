var
  db = require('../db'),
  table = db.Comment,
  media = db.Media,
  config = require('../config'),
  errors = require('../helper/errors'),
  C = require('../helper/constants'),
  fs = require('co-fs'),
  excelbuilder = require('msexcel-builder'),
  thunkify = require('co-thunkify')
  ;

module.exports = {
  isPermitted: function (action, data, author) {
    if (!author || author.type === 'mobile') {
      return false;
    }

    return true;
  },
  add: function* (data, author) {
    if (!this.isPermitted(C.CREATE, data, author)) {
      throw new errors.AccessDeniedError('Access denied');
    }

    var parentMedia,
      parent,
      newComment;

    parentMedia = yield media.find(data.id);
    parent = yield table.find(data.parentId);

    newComment = yield table.create({
      author: data.author,
      text: data.text
    });
    if (parent) {
      yield parent.addChildren(newComment);
    }

    yield parentMedia.addComment(newComment);

  },
  findById: function* (id) {
    var commentList = yield table.findAll({
      where: {MediumId: id},
      attributes: ['text', 'author', 'date', 'id', 'parentId', 'createdAt']
    });
    return commentList;
  },
  update: function* (id, config) {
    var comment = yield table.find(id);
    if (comment) {
      yield comment.updateAttributes({
        text: config.text
      });
    }

  },
  removeMultiple: function (ids) {
    return table.destroy({ id: ids});
  },

  commentsExport: function* (resArray, companyId) {

    var tmpdir = __dirname + '/../public/tmpExcelDir';


    if(yield fs.exists(tmpdir + '/' + companyId.id + 'exportComments.xlsx')) {
      yield fs.unlink(tmpdir + '/' + companyId.id + 'exportComments.xlsx');
    }

    var countCommentaries = 2;

    for(var j = 0; j < resArray.length; j++) {
      countCommentaries += resArray[j].data.length;
    }

    var workbook = excelbuilder.createWorkbook(tmpdir, companyId.id + 'exportComments.xlsx');


    var comments = workbook.createSheet('Comments', countCommentaries, 20);

    comments.set(2, 2, 'Media name');
    comments.set(3, 2, 'author');
    comments.set(4, 2, 'text');
    comments.set(5, 2, 'date');

    var currentLineComments = 3;

    for(var k = 0; k < resArray.length; k++) {
      currentLineComments++;
      if(resArray[k].addThree === true) {
        comments.set(2, currentLineComments, resArray[k].media);
        comments.set(3, currentLineComments, resArray[k].data[0].author);
        comments.set(4, currentLineComments, resArray[k].data[0].text);
        comments.set(5, currentLineComments, this.formatData(resArray[k].data[0].createdAt));

        for(var g = 1; g < resArray[k].data.length; g++) {
          currentLineComments++;

          comments.set(2, currentLineComments, resArray[k].media);
          comments.set(4, currentLineComments, resArray[k].data[g].author);
          comments.set(5, currentLineComments, resArray[k].data[g].text);
          comments.set(6, currentLineComments, this.formatData(resArray[k].data[g].createdAt));
        }
      } else {
        comments.set(2, currentLineComments, resArray[k].media);
        comments.set(3, currentLineComments, resArray[k].data[0].author);
        comments.set(4, currentLineComments, resArray[k].data[0].text);
        comments.set(5, currentLineComments, this.formatData(resArray[k].data[0].createdAt));
      }
    }

    var path = yield thunkify(workbook.save)();
    return path;
  },

  formatData: function(currentData) {
    return currentData.toDateString() + " " + currentData.toTimeString();
  }
};