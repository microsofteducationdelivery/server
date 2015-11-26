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
    return yield table.findAll({
      where: {MediumId: id},
      attributes: ['text', 'author', 'date', 'id', 'parentId', 'createdAt']
    });
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
      countCommentaries += resArray[j].length;
    }

    var workbook = excelbuilder.createWorkbook(tmpdir, companyId.id + 'exportComments.xlsx');


    var comments = workbook.createSheet('Comments', countCommentaries, 20);

    comments.set(2, 2, 'Media name');
    comments.set(3, 2, 'author');
    comments.set(4, 2, 'reply/comment');
    comments.set(5, 2, 'text');
    comments.set(6, 2, 'date');

    var currentLineComments = 3;

    for(var k = 0; k < resArray.length; k++) {
      currentLineComments++;
      if(resArray[k].length > 1) {

        for(var g = 0; g < resArray[k].length; g++) {
          currentLineComments++;

          var parrent;
          if(resArray[k][g].dataValues.parentId) {
           parrent = 'reply';
          } else {
            parrent = 'comment';
          }
          yield this.excelAddLine(resArray[k][g], comments, currentLineComments, parrent, resArray[k].media);
        }
      } else {
        yield this.excelAddLine(resArray[k][0], comments, currentLineComments, 'comment', resArray[k].media);
      }
    }

    return yield thunkify(workbook.save)();
  },

  excelAddLine: function* (data, sheet, currentLineComments, type, media) {

    sheet.set(2, currentLineComments, media);
    sheet.set(3, currentLineComments, data.author);
    sheet.set(4, currentLineComments, type);
    sheet.set(5, currentLineComments, data.text);
    sheet.set(6, currentLineComments, data.date);
  }
};