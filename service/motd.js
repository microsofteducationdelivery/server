var
  errors = require('../helper/errors'),
  C = require('../helper/constants')
  ;

module.exports = {
  isPermitted: function (action, data, author) {
    return (author.type === 'admin');
  },

  get: function* (author) {
    if (!this.isPermitted(C.RETRIEVE, {}, author)) {
      throw new errors.AccessDeniedError('Access denied');
    }

    return (yield author.getCompany()).motd;
  },

  set: function* (data, author) {
    if (!this.isPermitted(C.UPDATE, data, author)) {
      throw new errors.AccessDeniedError('Access denied');
    }

    var company = yield author.getCompany();
    console.log(data);
    company.motd = data.text;
    yield company.save();
  }
};
