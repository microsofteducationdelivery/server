var
  _ = require('lodash'),

  bcrypt = require('bcrypt-nodejs'),

  db = require('../db'),
  table = db.User,

  errors = require('../helper/errors'),
  mail = require('./mail'),
  C = require('../helper/constants'),
  parse = require('co-busboy'),
  fs = require('co-fs'),
  XLSX = require('xlsx'),
  excelbuilder = require('msexcel-builder'),
  thunkify = require('co-thunkify')
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
    //  yield company.destroy();
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
       var passwordSave = allData[i].password;
        yield me.createUser(allData[i], author);
      } catch (err) {
        console.log(err);
        allData[i].password = passwordSave;
        errors.push({line : i, error: err.message, data: allData[i] });
      }
    }

    if(errors.length > 0) {
      var respExel = yield this.createErrorsExcel(errors);
      return respExel;
    } else {
      return 'ok';
    }

  },

  createErrorsExcel: function* (data) {

    var tmpdir = __dirname + '/../public/tmpExcelDir';

      if(yield fs.exists(tmpdir + '/samplesnsError.xlsx')) {
        yield fs.unlink(tmpdir + '/samplesnsError.xlsx');
      }

    var workbook = excelbuilder.createWorkbook(tmpdir, 'samplesnsError.xlsx');

    var downloads = workbook.createSheet('sheet', 20, 20);

    downloads.set(2, 1, 'name');
    downloads.set(3, 1, 'login');
    downloads.set(4, 1, 'type');
    downloads.set(5, 1, 'password');
    downloads.set(6, 1, 'email');
    downloads.set(7, 1, 'telephone');
    downloads.set(8, 1, 'error');

    var currentLineDownloads = 2;
    _.each(data, function(item) {

      if(item.data.name) {
        downloads.set(2, currentLineDownloads, item.data.name);
      }

      if(item.data.login) {
        downloads.set(3, currentLineDownloads, item.data.login);
      }

      if(item.data.type) {
        downloads.set(4, currentLineDownloads, item.data.type);
      }

      if(item.data.password) {
        downloads.set(5, currentLineDownloads, item.data.password);
      }

      if(item.data.email) {
        downloads.set(6, currentLineDownloads, item.data.email);
      }

      if(item.data.telephone) {
        downloads.set(7, currentLineDownloads, item.data.telephone);
      }
      downloads.set(8, currentLineDownloads, item.error);
      currentLineDownloads++;
    });

    var path = yield thunkify(workbook.save)();
    var pathArr = path.split('/');
    return pathArr[pathArr.length - 1];

  }

};

