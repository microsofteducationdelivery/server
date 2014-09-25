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
  list: function* (author) {
    var mediaList = yield table.findAll({
      where: { CompanyId: author.CompanyId },
      attributes: ['name', 'views', 'type', 'id']
    });
    var id;
    mediaList.forEach(function (item) {
        console.log(item);
        id = item.id
    });
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
  },

  add: function* (data, author) {
    var library, folder;
    if (data.FolderId.substr(0, 7) === 'library') {
      library = yield db.Library.find(data.FolderId.substr(7));
      data.FolderId = null;
    } else {
      folder = yield db.Folder.find(data.FolderId);
      library = yield folder.getLibrary();
    }

    var media = yield db.Media.create(data);
    library.addMedium(media);
  }
};
