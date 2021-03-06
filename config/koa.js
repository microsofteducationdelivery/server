var fs = require('fs'),
  logger = require('koa-logger'),
  send = require('koa-send'),
  jwt = require('koa-jwt'),
  config = require('../config'),
  mount = require('koa-mount'),
  cors =  require('koa-cors'),

  errors = require('../helper/errors'),
  userService = require('../service/user')
  ;

module.exports = function (app) {
  app.use(cors());
  if (config.app.env !== 'test') {
    app.use(logger());
  }

  var sendOpts = config.app.env === 'production' ? {root: __dirname + '/../public', maxage: 1000 * 60 * 60 * 24 * 7} : {root: __dirname + '/../public'};
  app.use(function* (next) {
    if (this.path.substr(0, 5).toLowerCase() === '/api/') {
      yield next;
    } else {
      if (yield send(this, this.path, sendOpts)) {
        return;
      }
      //HTML5 push state support
      yield send(this, '/index.html', sendOpts);
    }
  });

  app.use(function* (next) {
    try {
        yield next;
    } catch (e) {
      if (e instanceof errors.AccessDeniedError) {
        this.status = 403;
        this.body = JSON.stringify({message: e.message});
      } else if(e instanceof errors.isLastAdmin) {
        this.status = 401;
        this.body = JSON.stringify({message: e.message});
      } else if(e instanceof errors.noFile || e instanceof errors.incorrectData) {
        this.status = 400;
        this.body = JSON.stringify({message: e.message});
      } else if(e instanceof errors.invalidFile) {
        this.status = 415;
        this.body = JSON.stringify({message: e.message});
      } else if(e instanceof errors.errorExport) {
        this.status = 400;
        this.body = JSON.stringify({message: e.message});
      } else {
        throw e;
      }
    }
  });

  fs.readdirSync(__dirname + '/../api/public').forEach(function (file) {
    if (fs.statSync(__dirname + '/../api/public/' + file).isFile()) {
      var moduleName = file.replace(/\.js$/, '');
      app.use(mount('/api/' + moduleName, require('../api/public/' + file)));
    }
  });


  // middleware below this line is only reached if jwt token is valid
  app.use(jwt({secret: config.app.secret, passthrough: true}));
  app.use(function* (next) {
    if (this.query.token) {
      this.user = yield jwt.verify(this.query.token, config.app.secret);
    }

    if (!this.user || !this.user.id) {
      throw new errors.AccessDeniedError('Access denied');
    }

    if (this.user.userAccess === 'mobile' && this.req.url.indexOf('mobile') === -1) {
      throw new errors.AccessDeniedError('Access denied');
    }

    this.user = yield userService.findById(this.user.id);

    if (!this.user) {
      throw new errors.AccessDeniedError('Access denied');
    }
    yield next;
    if (this.request.type === 'application/json' && !this.body) {
      this.body = { success: true };
    }
  });


  // mount api
  fs.readdirSync(__dirname + '/../api/private').forEach(function (file) {
    if (fs.statSync(__dirname + '/../api/private/' + file).isFile()) {
      var moduleName = file.replace(/\.js$/, '');
      app.use(mount('/api/' + moduleName, require('../api/private/' + file)));
    }
  });
};
