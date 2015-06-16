var
  _ = require('lodash'),
  bcrypt = require('bcrypt-nodejs'),
  db = require('../db'),
  table = db.User,
  errors = require('../helper/errors'),
  mail = require('./mail'),
  C = require('../helper/constants'),
  excel = require('./createExcelExport'),
  parse = require('co-busboy'),
  XLSX = require('xlsx')
;

module.exports = {
  createUser: function*(data, author) {
    var company = (author ? yield author.getCompany() : yield db.Company.create());

    if (!this.isPermitted(C.CREATE, data, author)) {
      throw new errors.AccessDeniedError('Access denied');
    }
    console.log(data);
    var user, clearPassword = data.password;
    try {
      data.password = bcrypt.hashSync(data.password);
      user = yield table.create(data);
      if (data.email) {
        console.log('mail sent');
        mail.sendWelcomeEmail(data.login, clearPassword, data.email);
      }
      company.addUser(user);
    } catch (e) {
      //yield company.destroy();
      if (e.code === 'ER_DUP_ENTRY') {
        throw new errors.DuplicateError('Duplicate entry');
      } else {
        throw new errors.ValidationError('Validation failed', { errors: e });
      }
    }
  },

isPermitted: function (action, data, author) {
    if (action === C.CREATE && !author && data.type === 'admin') {
      return true;
    }

    if (author.type !== 'admin') {
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
    var company = yield author.getCompany();
    yield this.createUser(data, author);
  },

  list: function* (author) {

    var res = yield table.findAll({
      where: { CompanyId: author.CompanyId },
      attributes: ['id', 'login', 'type', 'name'],
      include: [db.Library]
    });

    return yield table.findAll({
      where: { CompanyId: author.CompanyId },
      attributes: ['id', 'login', 'type', 'name'],
      include: [db.Library]
    });
  },

  update: function* (id, data, author) {
    var user = yield table.find({ where: { id: id, CompanyId: author.CompanyId }});
    if (data.password) {
      data.newPassword = data.password;
      data.password = bcrypt.hashSync(data.password);
    }

    console.log(data);
    _.forIn(data, function(value, key) {
      user[key] = value;
    });
    user.email = data.email;
    user.phone = data.phone;

    yield user.save();
    mail.sendUpdateUserProfile(data, user.email);
  },
  removeMultiple: function (ids, author) {
    console.log(ids);
    console.log(author.id);
    if (ids.indexOf(author.id.toString()) !== -1) {
      throw new errors.AccessDeniedError('Access denied');
    }
    return table.destroy({ id: ids, CompanyId: author.CompanyId });
  },

  exportUsers: function* (author, reqBody) {

    var parts = parse(reqBody),
      part,
      me = this,
      allData;
    var errors = [];

    while (part = yield parts) {
      if (!part.filename) {
        return me.body = 'No file';
      }

      var bufs = [];

      part.on('data', function (chank) {
        bufs.push(chank);
      });
      part.on('end', function () {
        try {
          var workbook = XLSX.read(Buffer.concat(bufs));
          allData = XLSX.utils.sheet_to_json(workbook.Sheets['sheet1']);


        } catch (err) {
          console.log(err);
          return me.body = 'Invalid file';
        }
      });
    }

    for(var i = 0; i < allData.length; i++) {
      try {
        if(allData[i].type !== 'admin' && allData[i].type !== 'operator' && allData[i].type !== 'mobile') {
          throw new errors.TypeError('User type incorrect');
        }

       var passwordSave = allData[i].password;
        yield me.createUser(allData[i], author);
      } catch (err) {
        allData[i].password = passwordSave;
        allData[i].line = i;
        allData[i].error = err.message;
        errors.push(allData[i]);
      }
    }

    if(errors.length > 0) {
      var allFields = 'line|name|login|type|password|email|telephone|error';
      return yield excel.createExcelFile(errors, allFields, 'error', author.dataValues.CompanyId);
    } else {
      return 'ok';
    }

  }
};

