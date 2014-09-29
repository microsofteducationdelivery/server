var
  db = require('../db'),
  table = db.Media,
  lib = db.Library,

  errors = require('../helper/errors'),
  C = require('../helper/constants')
  ;

module.exports = {
  getTop5Views: function* (companyId) {
    var libs = yield lib.findAll({
      where: {CompanyId: companyId},
      attributes: ["id"]
    });
    libs = libs.map(function (lib) {
      return lib.dataValues.id;
    });
    return yield table.findAll({
      where: {LibraryId: libs},
      order: 'views DESC',
      limit: 5
    });
  },

  getTop5Downloads: function* (companyId) {
    var libs = yield lib.findAll({
      where: {CompanyId: companyId},
      attributes: ["id"]
    });
    libs = libs.map(function (lib) {
      return lib.dataValues.id;
    });
    return yield table.findAll({
      where: {LibraryId: libs},
      order: 'downloads DESC',
      limit: 5
    });
  }
};
