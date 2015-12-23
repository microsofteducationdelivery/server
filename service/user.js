var
  _ = require('lodash'),
  bcrypt = require('bcrypt-nodejs'),
  db = require('../db'),
  table = db.User,
  errors = require('../helper/errors'),
  mail = require('./mail'),
  sms = require('./sms'),
  C = require('../helper/constants'),
  excel = require('./createExcelExport'),
  parse = require('co-busboy'),
  XLSX = require('xlsx'),
  fs = require('co-fs'),
  send = require('koa-send')
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

      if (data.phone) {
        console.log('sms sent');
        sms.sendWelcomeSms(data.login, clearPassword, data.phone);
      }

      company.addUser(user);
    } catch (e) {
     // yield company.destroy();
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
      attributes: [ 'id', 'name', 'login', 'email', 'type', 'CompanyId', 'phone', 'deviceId', 'singleDevice']
    });
  },
  findBy: function *(params) {
    return yield table.find({ where: params });
  },
  findByCredentials: function* (credentials) {
    var credentialsData = {
      password: credentials.password,
      login: credentials.login
    };

   var user = yield this.findBy(_.omit(credentialsData, 'password'));
    try {
      return bcrypt.compareSync(credentials.password, user.password) ? user : null;
    } catch (e) {
      return null;
    }
  },

  add: function* (data, author) {
    yield this.createUser(data, author);
  },

  list: function* (author) {
    return yield table.findAll({
      where: { CompanyId: author.CompanyId },
      attributes: ['id', 'login', 'type', 'name'],
      include: [db.Library]
    });
  },

  credentialsChanged: function (user, newUser, phone) {
    if(user.dataValues.login !== newUser.login || (newUser.newPassword && !bcrypt.compareSync(newUser.newPassword, user.dataValues.password))) {

      if(!newUser.newPassword) {
        newUser.newPassword = 'Password was not changed';
      }
      sms.sendUpdateUserProfile(newUser, phone);
    }
  },

  update: function* (id, data, author) {
    var user = yield table.find({ where: { id: id, CompanyId: author.CompanyId }});
    var allAdminUser = yield table.findAll({where: {type: 'admin', CompanyId: author.CompanyId}});
    if(user.type === 'admin' && data.type !== 'admin' && allAdminUser.length === 1) {
      if (allAdminUser.length === 1) {
        throw errors.isLastAdmin('You are last admin');
      }
    }
    var mailMessage = {};
    var arrayFields = ['name', 'login', 'password', 'email', 'phone', 'type'];

    for(var i = 0; i < arrayFields.length; i++) {
      if(data[arrayFields[i]] && user.dataValues[arrayFields[i]] !== data[arrayFields[i]] && arrayFields[i] !== 'password') {
        mailMessage[arrayFields[i]] = data[arrayFields[i]];
      } else if(arrayFields[i] === 'password') {
        if(data.password && !bcrypt.compareSync(data.password, user.dataValues.password)) {
          mailMessage.password = data.password;
        }
      }
    }

    if (data.password) {
      data.newPassword = data.password;
      data.password = bcrypt.hashSync(data.password);
    } else {
      data.password = user.dataValues.password;
    }

    if(data.phone) {
      this.credentialsChanged(user, data, data.phone);
    }

    console.log(data);
    _.forIn(data, function(value, key) {
      user[key] = value;
    });
    user.email = data.email;
    user.phone = data.phone;

    if(!data.singleDevice) {
      user.singleDevice = false;
      data.singleDevice = false;
      data.deviceId = user.deviceId;
    }

    try {
      yield user.save();
    } catch(e) {
      if (e[0].code === 'ER_DUP_ENTRY') {
        throw new errors.DuplicateError('Duplicate email');
      } else {
        throw new errors.Error(e[0].message);
      }
    }

    mail.sendUpdateUserProfile(mailMessage, user.email);

  },
  removeMultiple: function (ids, author) {
    if (ids.indexOf(author.id.toString()) !== -1) {
      throw new errors.AccessDeniedError('Access denied');
    }
    return table.destroy({ id: ids, CompanyId: author.CompanyId });
  },

  importUsers: function* (author, reqBody) {

    var parts = parse(reqBody),
      part,
      me = reqBody,
      allData,
      errorsFile = [];

    while (part = yield parts) {
      if (!part.filename) {
        errors.noFile('No file');
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
          errors.invalidFile('File type is incorrect');
        }
      });
    }

    for(var i = 0; i < allData.length; i++) {
      try {
        if(allData[i].type !== 'admin' && allData[i].type !== 'operator' && allData[i].type !== 'mobile') {
          throw new errors.TypeError('User type incorrect');
        }

       var passwordSave = allData[i].password;
        yield this.createUser(allData[i], author);
      } catch (err) {
        allData[i].password = passwordSave;
        allData[i].line = i;
        allData[i].error = err.message;
        errorsFile.push(allData[i]);
      }
    }

    if(errorsFile.length > 0) {
      var allFields = 'line|name|login|type|password|email|telephone|error';
      return {
        errors: errorsFile,
        fields: allFields
      };
    } else {
      return null;
    }

  },

  searchUser: function* (search, user) {
    return yield table.findAll({
      where:  ['name like ? AND CompanyId=' + user.dataValues.CompanyId + '', '%' + search + '%'],
      attributes: ['id', 'name', 'CompanyId']
    });
  }
};

