var
  db = require('../db'),
  table = db.Comment,
  media = db.Media,
  config = require('../config'),
  errors = require('../helper/errors'),
  C = require('../helper/constants')
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
      attributes: ['text', 'author', 'date', 'id', 'parentId']
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
  }
};