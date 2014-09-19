var
  db = require('../db'),
  libraryTable = db.Library,
  table = db.Folder,

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

      path = [];
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

    }

    items = items.concat(
      folders.map(function (folder) {
        return { id: folder.id, name: folder.name, type: 'folder'};
      }),
      media.map(function (media) {
        return { id: media.id, name: media.name, type: 'media' };
      })
    );


    return {
      name: root.name,
      data: items,
      path: path
    };
  },
  /*
   add: function* (data, author) {
   if (!this.isPermitted(C.CREATE, data, author)) {
   throw new errors.AccessDeniedError('Access denied');
   }

   try {
   data.CompanyId = author.CompanyId;
   yield table.create(data);
   } catch (e) {
   if (e.code === 'ER_DUP_ENTRY') {
   throw new errors.DuplicateError('Duplicate entry');
   } else {
   throw new errors.ValidationError('Validation failed', { errors: e });
   }
   }

   },
   */

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
