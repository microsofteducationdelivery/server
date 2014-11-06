var
  _ = require('lodash'),
  co = require('co'),
  db = require('../db'),
  datauri = require('datauri'),

  errors = require('../helper/errors'),
  C = require('../helper/constants')
  ;

function* getFolderItemsCountDeep (id, cache) {
  if (cache[id]) {
    return cache[id];
  }

  var total = yield db.Media.count({where: {FolderId: id}});
  var folders = yield db.Folder.findAll({where: {parentId: id}});

  for (var i = 0; i < folders.length; i++) {
    total += yield getFolderItemsCountDeep(folders[i].id, cache);
  }

  cache[id] = total;
  return total;
}

function* getFolderContent (id, cache) {
  var typeToExtension = {
    video: 'mp4',
    image: 'png',
    text: 'txt'
  };

  id = id.toString();
  var root, folders, media;
  if (id.substr(0,7) === 'library') {
    id = id.substr(7);
    root = yield db.Library.find(id);
    folders = yield db.Folder.findAll({where: {LibraryId: id, parentId: null}});
    media = yield db.Media.findAll({where: {LibraryId: id, FolderId: null, status: 'converted' }});
  } else {
    root = yield db.Folder.find(id);
    folders = yield root.getChildren();
    media = yield db.Media.findAll({where: {LibraryId: root.LibraryId, FolderId: id, status: 'converted' }});
  }

  var items = [];
  for (var i = 0; i < folders.length; i++) {
    var itemsCount = yield getFolderItemsCountDeep(folders[i].id, cache);
    items.push({
      id: folders[i].id,
      title: folders[i].name,
      type: 'folder',
      itemsCount: itemsCount
    });
  }

  items = items.concat(media.map(function (media) {
      return {
        id: media.id,
        views: media.views,
        downloads: media.downloads,
        type: 'media',
        subtype: typeToExtension[media.type],
        title: media.name,
        preview: datauri('public/preview/' + media.id + '.png')
      };
    })
  );

  return {
    title: root.name,
    items: items
  };
}

module.exports = {
  getContent: function* (user) {
    var sql = db.client;
    var id = user.id;
    var company = yield user.getCompany();
    //FIXME: respect shares


    var libraries = yield db.Library.findAll({
      where: [{CompanyId: user.CompanyId}, {'Users.id': id}],
      attributes: [
        'id',
        'name',
        [sql.fn('COUNT', sql.col('Media.id')), 'mediaCount']
      ],
      include: [db.Media, db.User],
      group: ['id']
    });
    var data = {
      0: {
        title: '/',
        items: libraries.map(function (library) {
          return {
            id: 'library' + library.id,
            type: 'folder',
            title: library.name,
            itemsCount: library.dataValues.mediaCount
          };
        })
      }
    };

    var queue = [];
    libraries.forEach(function (library) {
      queue.push('library' + library.id);
    });
    var cache = {};
    while (queue.length) {
      var nextId = queue.shift();
      data[nextId] = yield getFolderContent(nextId, cache);
      data[nextId].items.forEach(function (item) {
        if (item.type === 'folder') {
          queue.push(item.id);
        }
      });
    }
    return data;
  }
};
