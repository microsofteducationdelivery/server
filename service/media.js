var
  _ = require('lodash'),
  db = require('../db'),
  table = db.Media,

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

  findById: function* (id, author) {
    //FIXME: Security exploit here
    return yield table.find({ where: {id: id}});
  },

  update: function* (id, data, author) {
    if (!this.isPermitted(C.UPDATE, {}, author)) {
      throw new errors.AccessDeniedError('Access denied');
    }

    //FIXME: Security exploit here
    var folder = yield table.find(id);
    var attributes = ['name', 'description', 'links'];
    yield folder.updateAttributes(_.pick(data, attributes), attributes);
  }
};
