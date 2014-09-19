var
  db = require('../db'),
  table = db.Media,

  errors = require('../helper/errors'),
  C = require('../helper/constants')
  ;

module.exports = {
  getTop5Views: function* () {
    return yield table.findAll({
      order: 'views DESC',
      limit: 5
    });
  },

  getTop5Downloads: function* () {
    return yield table.findAll({
      order: 'downloads DESC',
      limit: 5
    });
  }
};
