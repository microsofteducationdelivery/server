var
  _ = require('lodash'),

  bcrypt = require('bcrypt-nodejs'),

  db = require('../db'),
  table = db.User,

  errors = require('../helper/errors'),
  C = require('../helper/constants')
;

module.exports = {
  isPermitted: function (action, data, author) {
    if (action === C.CREATE && !author && data.type === 'owner') {
      return true;
    }

    if (action === C.UPDATE && data.type === 'owner') {
      return false;
    }

    if (action === C.DELETE && author._id === data.id) {
      return false;
    }

    return true;
  },

  findById: function (id, author) {
    var where = {id: id};
    if (author) {
      where.CompanyId = author.CompanyId;
    }

    return table.find({
      where: where,
      attributes: [ 'id', 'name', 'login', 'email', 'type', 'CompanyId', 'phone']
    });
  },

  findByCredentials: function* (credentials) {
    var request = {};
    if (credentials.email) {
      request = { email: credentials.email.toLowerCase() };
    } else {
      request = { login: credentials.login.toLowerCase() };
    }
    var user = yield table.find({ where: request });
    if (!user) {
      return null;
    }
    try {
      return bcrypt.compareSync(credentials.password, user.password) ? user : null;
    } catch (e) {
      return null;
    }
  },

  add: function* (data, author) {
    var company = yield (author ? author.getCompany() : db.Company.create());

    if (!this.isPermitted(C.CREATE, data, author)) {
      throw new errors.AccessDeniedError('Access denied');
    }
    var user;
    try {
      data.password = bcrypt.hashSync(data.password);
      user = yield table.create(data);
    } catch (e) {
      yield company.destroy();
      console.log(e);
      if (e.code === 'ER_DUP_ENTRY') {
        throw new errors.DuplicateError('Duplicate entry');
      } else {
        throw new errors.ValidationError('Validation failed', { errors: e });
      }
    }
  },

  list: function* (author) {
    return yield table.findAll({
      where: { CompanyId: author.CompanyId },
      attributes: ['id', 'login', 'type', 'name']
    });
  }
/*
  update: function (data, author) {
    data = _.pick(data, FIELDS);

    if (!this.isPermitted(C.UPDATE, data, author)) {
      throw new errors.AccessDeniedError('Access denied');
    }

    if (data.password) {
      data.password = bcrypt.hashSync(data.password);
    }

    return collection.updateById(data._id, data);
  },

  remove: function (criteria, author) {
    if (!this.isPermitted(C.DELETE, criteria, author)) {
      throw new errors.AccessDeniedError('Access denied');
    }

    criteria.owner = author._id;
    return collection.remove(criteria);
  }*/
};
