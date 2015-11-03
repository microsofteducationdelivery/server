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

function *liveIdLogin () {
  var data = yield parse(this);
  var user = yield usersService.findBy(data);
  if (!user) {
    data.login = data.email;
    data.password = generatePassword();

    console.log(data.password);
    data.type = 'admin';
    try {
      yield usersService.createUser(data);
      user = yield usersService.findBy(data);
    } catch (e) {
      this.status = 400;
      this.body = e.errors;
      
      return;
    }
  }

  var token = jwt.sign({id: user.id, issueTime: Date.now()}, config.app.secret, { expiresInMinutes: 60 * 24 * 60 });
  this.body = { token: token, user: _.pick(user, ['id', 'name', 'type']), serverId: config.app.serverId };
}

function *login() {
  var data = yield parse(this);
  var user = yield usersService.findByCredentials(data);

  if (user && user.type === 'mobile') {
    if(user.singleDevice && data.deviceId && user.deviceId !== data.deviceId) {
      throw new errors.DeviceError('Device is incorrect');
    } else if(!user.singleDevice && data.deviceId && data.deviceId !== '') {
      yield user.updateAttributes({deviceId: data.deviceId});
    }
    var token = jwt.sign({id: user.id, issueTime: Date.now(), userAccess: 'mobile'}, config.app.secret, { expiresInMinutes: 60 * 24 * 60 });
    this.body = { token: token, user: _.pick(user, ['id', 'name', 'type']), serverId: config.app.serverId };
  } else {
    this.status = 400;
  }
}

function *desktopLogin() {
  var data = yield parse(this);
  var user = yield usersService.findByCredentials(data);

  if (user && user.type !== 'mobile') {
    var token = jwt.sign({id: user.id, issueTime: Date.now(), userAccess: 'desktop'}, config.app.secret, { expiresInMinutes: 60 * 24 * 60 });
    this.body = { token: token, user: _.pick(user, ['id', 'name', 'type']), serverId: config.app.serverId };
  } else {
    this.status = 400;
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
    link = '/getStarted.html',
    user;

  user = yield db.User.find({
    where: {email: email}
  });
  if (!user || !user.email || user.type === 'mobile') {
    this.status = 403;
  } else {
    yield user.updateAttributes({recoveryToken: token}, {fields: ['recoveryToken']});
    link = '#token=' + token;
    mail.sendRecoveryPasswordLink(user.name, link, email);
    this.status = 200;
  }
}
function* recoverPassword () {
  var item = yield parse(this),
    user;

  user = yield db.User.find({
      where: {recoveryToken: item.token.substr(6)}
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
app.use(route.post('/desktopLogin', desktopLogin));
app.use(route.post('/loginWithLiveID', liveIdLogin));
app.use(route.post('/register', register));
app.use(route.post('/passwordRecovery/', recoverPassword));
app.use(route.put('/passwordRecovery/:email', getRecover));
module.exports = app;
