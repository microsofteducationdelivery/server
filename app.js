'use strict';

var config = require('./config'),
    koaConfig = require('./config/koa'),
    koa = require('koa'),

    debug = require('./debug'),
  cors = require('koa-cors'),
    app = koa();

module.exports = app;
app.use(cors());

app.init = function () {
  koaConfig(app);
  app.server = app.listen(config.app.port);
  if (config.app.env !== 'test') {
    console.log('MED listening on port ' + config.app.port);
  }
};

if (!module.parent) {
  debug();
  app.init();
}