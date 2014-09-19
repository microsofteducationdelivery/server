var app = require('koa')(),
  _ = require('lodash'),
  parse = require('co-body'),
  jwt = require('koa-jwt'),
  route = require('koa-route'),
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
  data.type = 'owner';
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

app.use(route.post('/login', login));
app.use(route.post('/register', register));
module.exports = app;
