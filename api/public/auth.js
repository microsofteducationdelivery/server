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
  errors = require('../../helper/errors'),
  request = require('request'),
  thunkify = require('co-thunkify'),
  fs = require('co-fs');
  ;


const clientId = process.env.CLIENT_ID || 'f9c692c6-d3c0-402f-9c45-651858e73e8e';
const clientSecret = process.env.CLIENT_SECRET || 'Y1m3qckEJa4ojmpUbW2yuBN';
const redirectURL = process.env.REDIRECT_URL || 'http://localhost:3000/api/auth/login-with-live-id';
const webAppURL = process.env.WEB_APP_URL || 'http://localhost:3001';

function LoginWithLiveId (code, cb) {
  request.post('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    formData: {
      grant_type: 'authorization_code',
      code: code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectURL,
    }
  }, function (err, httpResponse, body) {
    if (err) {
      cb(err, null);
    }
    cb(null, JSON.parse(body));

  });
}

function getLiveUserInfo (token, cb) {
  request({
    url: 'https://graph.microsoft.com/v1.0/me?redirect_uri=' + redirectURL,
    headers: {
      'Authorization': 'Bearer ' + token + '-access-token',
    }
  }, function (err, httpResponse, body) {
    if (err) {
      cb(err, null);
    }
    cb(null, JSON.parse(body));
  });
}
function *getErrorHtml(errorMsg) {
  const errorTpl = '${errorMsg}';
  const locationTpl = '${url}';
  const url = webAppURL;
  const html = yield fs.readFile('./public/error.html', 'utf8');

  return html.replace(errorTpl, errorMsg).replace(locationTpl, url);
}
function *liveIdLogin () {
  const code = this.request.query.code;

  try {
    const loginResponse = yield thunkify(LoginWithLiveId)(code);

    if (!loginResponse.access_token) {
      this.body = yield getErrorHtml('no access token');
    }

    const userData = yield thunkify(getLiveUserInfo)(loginResponse.access_token);

    var user = yield usersService.findBy({login: userData.userPrincipalName});

    if (!user) {
      user = yield usersService.add({
        login: userData.userPrincipalName,
        password: generatePassword(),
        type: 'admin',
        email: userData.userPrincipalName,
        name: userData.userPrincipalName,
      });
    }

    const token = jwt.sign({
      id: user.id, issueTime: Date.now(), userAccess: 'desktop'
    }, config.app.secret, { expiresInMinutes: 60 * 24 * 60 });
    const userString = JSON.stringify(_.pick(user, ['id', 'name', 'type']));
    this.redirect(webAppURL + '/#getStarted?token=' + token + '&user=' + userString + '&serverId=server' + config.app.serverId);

  } catch (err) {
    this.body = yield getErrorHtml(err._message);
  }
}

function *login() {
  var data = yield parse(this);
  var user = yield usersService.findByCredentials(data);

  if (user) {
    if(user.singleDevice && data.deviceId && user.deviceId !== data.deviceId) {
      throw new errors.DeviceError('Device is incorrect');
    } else if(!user.singleDevice && data.deviceId && data.deviceId !== '') {
      yield user.updateAttributes({deviceId: data.deviceId});
    }
    var token = jwt.sign({id: user.id, issueTime: Date.now(), userAccess: 'mobile'}, config.app.secret, { expiresInMinutes: 60 * 24 * 60 });
    this.body = { token: token, user: _.pick(user, ['id', 'name', 'type', 'CompanyId']), serverId: config.app.serverId };
  } else {
    this.status = 400;
  }
}

function *desktopLogin() {
  var data = yield parse(this);
  var user = yield usersService.findByCredentials(data);

  if (user && user.type !== 'mobile') {
    var token = jwt.sign({id: user.id, issueTime: Date.now(), userAccess: 'desktop'}, config.app.secret, { expiresInMinutes: 60 * 24 * 60 });
    this.body = { token: token, user: _.pick(user, ['id', 'name', 'type', 'CompanyId']), serverId: config.app.serverId };
  } else {
    this.status = 400;
  }
}

function *register() {
  var data = yield parse(this);
  data.login = data.email;
  data.password = generatePassword();
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
    link = this.get('referer'),
    user;

  user = yield db.User.find({
    where: {email: email}
  });
  if (!user || !user.email || user.type === 'mobile') {
    this.status = 403;
  } else {
    yield user.updateAttributes({recoveryToken: token}, {fields: ['recoveryToken']});
    link += '#token=' + token;
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
app.use(route.get('/login-with-live-id', liveIdLogin));
app.use(route.post('/register', register));
app.use(route.post('/passwordRecovery/', recoverPassword));
app.use(route.put('/passwordRecovery/:email', getRecover));
module.exports = app;
