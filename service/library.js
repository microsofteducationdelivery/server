var
  db = require('../db'),
  table = db.Library,

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


  list: function* (author) {
    if (!this.isPermitted(C.RETRIEVE, {}, author)) {
      throw new errors.AccessDeniedError('Access denied');
    }

    var sql = db.client;
    var lookupTable = {}

    var folders = yield db.Folder.findAll({attributes: [
        'LibraryId',
        [sql.fn('COUNT', 'id'), 'count']
      ]
    });

    folders.forEach(function (record) {
      lookupTable[record.LibraryId] = record.dataValues.count;
    });

    return (yield table.findAll({
        where: {CompanyId: author.CompanyId},
        attributes: [
          'id',
          'name',
          [sql.fn('COUNT', sql.col('Media.id')), 'mediaCount'],
          [sql.fn('SUM', sql.col('Media.views')), 'mediaViews']
        ],
        include: [db.Media],
        group: ['id']
      })).map(function (library) {
      return {
        id: 'library' + library.id,
        name: library.name,
        folder: lookupTable[library.id] || 0,
        media: library.dataValues.mediaCount || 0,
        views: library.dataValues.mediaViews || 0
      };
    });
  },
  removeMultiple: function (ids, author) {
    //strip "library" part from id
    ids = ids.map(function (id) { return id.substr(7)});
    return table.destroy({ id: ids, CompanyId: author.CompanyId });
  }
};
