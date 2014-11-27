var app = require('koa')(),
  _ = require('lodash'),
  parse = require('co-body'),
  jwt = require('koa-jwt'),
  db = require('../../db'),
  mail = require('../../service/mail'),
  route = require('koa-route'),
  bcrypt = require('bcrypt-nodejs'),
  generatePassword = require('password-generator'),
  config = require('../../config'),
  usersService = require('../../service/user'),
  errors = require('../../helper/errors')
;

function *login() {
  var user = yield usersService.findByCredentials(yield parse(this));
  if (user) {
    var token = jwt.sign({id: user.id, issueTime: Date.now()}, config.app.secret, { expiresInMinutes: 60 * 24 * 60 });
    this.body = { token: token, user: _.pick(user, ['name', 'type']), serverId: config.app.serverId };
  } else {
    this.status = 401;
  }
}

function *register() {
  var data = yield parse(this);
  data.login = data.email;
  data.password = generatePassword();
  console.log(data.password);
  data.type = 'admin';
  try {
    yield usersService.add(data);
  } catch (e) {
    if (e instanceof errors.ValidationError) {
      this.status = 400;
      this.body = e.errors;
      return;
    }
    if (e instanceof errors.DuplicateError) {
      this.status = 409;
      return;
    }
    throw e;
  }
  this.status = 201;
}
function* getRecover (email) {
  var token = generatePassword(),
    link = this.request.host + '/index.html',
    user;

  user = yield db.User.find({
    where: {email: email}
  });
  if (!user || !user.email) {
    this.status = 403;
  } else {
    yield user.updateAttributes({recoveryToken: token}, {fields: ['recoveryToken']});
    link += '#' + token;
    mail.sendRecoveryPasswordLink(user.name, link, email);
    this.status = 200;
  }
}
function* recoverPassword () {
  var item = yield parse(this),
    user;

  user = yield db.User.find({
      where: {recoveryToken: item.token}
  });

  var newPass = bcrypt.hashSync(item.newPass);
  if (user) {
    yield user.updateAttributes({password: newPass}, {fields: ['password']});
    yield user.updateAttributes({recoveryToken: ''}, {fields: ['recoveryToken']});
    this.status = 200;
  } else {
    this.status = 403;
  }
}
app.use(route.post('/login', login));
app.use(route.post('/register', register));
app.use(route.post('/passwordRecovery/', recoverPassword));
app.use(route.put('/passwordRecovery/:email', getRecover));
module.exports = app;
