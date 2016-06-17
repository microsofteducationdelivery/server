var
  db = require('../db'),
  table = db.Library,
  sequelize = require('sequelize'),
  errors = require('../helper/errors'),
  C = require('../helper/constants'),
  koa = require('koa'),
  mail = require('./mail'),
  app = koa(),
  route = require('koa-route')
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
    var lookupTable = {};
    var folders = yield db.Folder.findAll({
      attributes: ['LibraryId', [sequelize.fn('count', sequelize.col('LibraryId')), 'count']],
      group: ['LibraryId']
    });
    folders.forEach(function (record) {
      lookupTable[record.dataValues.LibraryId] = record.dataValues.count;
    });

    var allLibraries = yield db.shareLibrariesCompany.findAll({
      where: { CompanyId: author.CompanyId }
    });


    var currentQuery = allLibraries.length ? 'CompanyId=? OR Libraries.id in ( ? )' : 'CompanyId=?';

    var query = table.findAll({
      where: [currentQuery, author.CompanyId, allLibraries.length ? allLibraries.map(function(item) {
        return item.dataValues.LibraryId;
      }) : null],
      attributes: [
        'id',
        'name',
        'CompanyId',
        [sql.fn('COUNT', sql.col('Media.id')), 'mediaCount'],
        [sql.fn('SUM', sql.col('Media.views')), 'mediaViews']
      ],
      include: [db.Media],
      group: ['id']
    });

    var result = (yield query).map(function (library) {
      return {
        id: 'library' + library.id,
        name: library.name,
        folder: lookupTable[library.id] || 0,
        media: library.dataValues.mediaCount || 0,
        views: library.dataValues.mediaViews || 0,
        companyId: library.dataValues.CompanyId
      };
    });

    return result.map(function(item) {
      var currentPosition = allLibraries.find(function(elem) {
        return elem.LibraryId.toString() === item.id.substr(7);
      });
      if (currentPosition) {
        item.isShare = true;
        item.allow = currentPosition.dataValues.allow;
      }
        return item;
    });
  },
  removeMultiple: function (ids, author) {
    //strip "library" part from id
    ids = ids.map(function (id) { return id.substr(7)});
    return table.destroy({ id: ids, CompanyId: author.CompanyId });
  },

  changeLibraryName: function* (data, author) {
    if (!this.isPermitted(C.UPDATE, {}, author)) {
      throw new errors.AccessDeniedError('Access denied');
    }

    var library = yield table.find(data.id.substr(7));
    yield library.updateAttributes({
      name: data.name,
    });
  },

  shareLibrary: function*(data) {
    var allFindUsers = yield db.User.findAll({
      where: {
        email: data.emails
      }
    });
    var library = yield table.find(data.libraryId.substr(7));
    for(var i = 0; allFindUsers.length > i; i++) {
      db.shareLibrariesCompany.findOrCreate({
        CompanyId: allFindUsers[i].dataValues.CompanyId,
        LibraryId: data.libraryId.substr(7)
      });
      mail.sendShareEmail(allFindUsers[i].name, library.name, allFindUsers[i].email);
    }
  },

  canselInvite: function*(libId, userId) {
    var currentInvite = yield db.shareLibrariesCompany.find({
      where: {
        LibraryId: libId,
        CompanyId: userId
      }
    });
    currentInvite.destroy();
  }
};
