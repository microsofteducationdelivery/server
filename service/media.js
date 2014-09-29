var
  _ = require('lodash'),
  db = require('../db'),
  table = db.Media,
  comment = db.Comment,
  folder = db.Folder,
  library = db.Library,
  errors = require('../helper/errors'),
  C = require('../helper/constants'),
  folders = require('../service/folder')
  ;

module.exports = {
  isPermitted: function (action, data, author) {
    if (!author || author.type === 'mobile') {
      return false;
    }

    return true;
  },
  list: function* () {

    var mediaList = yield table.findAll({
      attributes: ['name', 'views', 'type', 'id'],
      include: [{model: comment, required: true}, {model: folder, as: 'Folder'}, {model: library, as: 'Library'}]
    });
    return yield mediaList.map(function* (item) {
      var path;
      path = item.folder ? yield folders.getPath(item.folder.dataValues.id ) : item.library.dataValues.name;

      return _(item).pick(['id', 'name', 'type']).merge({
        path: path,
        amount: item.comments.length,
        date: _.last(item.comments).createdAt

      }).value();
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
