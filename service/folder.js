var
  db = require('../db'),
  libraryTable = db.Library,
  table = db.Folder,
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
  getPath: function* (id) {
    var root, path = [];
    console.log('path start');
    root = yield db.Folder.find(id);
    console.log('root', root);
    var parent = yield root.getParent();
    while (parent) {
      path.unshift({id: parent.id, title: parent.name});
      parent = yield parent.getParent();
    }
    var library = yield root.getLibrary();

    path.unshift({
      id: 'library' + library.id,
      title: library.name
    });

    return path;
  },
  findById: function* (id, author) {
    var root, folders, media, path, items = [];

    if (id.substr(0,7) === 'library') {
      id = id.substr(7);
      root = yield libraryTable.find(id);
      folders = yield table.findAll({where: {LibraryId: id, parentId: null}});
      media = yield db.Media.findAll({where: {LibraryId: id, FolderId: null}});
      path = [];
      //TODO: add media items;
    } else {
      root = yield table.find(id);
      folders = yield root.getChildren();
      media = yield root.getMedia();
      path = yield this.getPath(id);
    }

    items = items.concat(
      folders.map(function (folder) {
        return { id: folder.id, name: folder.name, type: 'folder'};
      }),
      media.map(function (media) {
        return {
          id: media.id,
          name: media.name,
          type: 'media',
          picture: media.status === 'converted' ? '/preview/' + media.id + '.png' : null };
      })
    );


    return {
      name: root.name,
      data: items,
      path: path
    };
  },

  add: function* (data, author) {
    if (!this.isPermitted(C.CREATE, data, author)) {
      throw new errors.AccessDeniedError('Access denied');
    }

    try {
      var library;
      if (data.parentId.substr(0,7) === 'library') {
        library = yield db.Library.find(data.parentId.substr(7));
        data.parentId = null;
      } else {
        var folder = yield db.Folder.find(data.parentId);
        library = yield folder.getLibrary();
      }
      var newFolder = yield table.create(data);
      library.addFolder(newFolder);
    } catch (e) {

      if (e.code === 'ER_DUP_ENTRY') {
        throw new errors.DuplicateError('Duplicate entry');
      } else {
        throw new errors.ValidationError('Validation failed', { errors: e });
      }
    }
  },

  update: function* (id, data, author) {
    if (!this.isPermitted(C.UPDATE, {}, author)) {
      throw new errors.AccessDeniedError('Access denied');
    }

    var folder = yield table.find(id);
    yield folder.updateAttributes({
      name: data.name
    });
  },

  list: function* (author) {
    if (!this.isPermitted(C.RETRIEVE, {}, author)) {
      throw new errors.AccessDeniedError('Access denied');
    }

    return (yield table.findAll({where: {CompanyId: author.CompanyId}})).map(function (library) {
      return {
        id: 'library' + library.id,
        name: library.name,
        //FIXME: stubs
        folder: 10,
        media: 10,
        views: 10
      };
    });
  },

  removeMultiple: function (ids, author) {
    return table.destroy({ id: ids, CompanyId: author.CompanyId });
  }
};
