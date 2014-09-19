var path = require('path'),
    _ = require('lodash');

var baseConfig = {
  app: {
    root: path.normalize(__dirname + '/../..'),
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
    secret: 'secret key',
    serverId: 'sqldemo'
  },
  //TODO: env variables
  mysql: {
    dbname: 'med',
    user: 'root',
    password: '',
    host: 'localhost',
    port: 3306
  }
};

var platformConfig = {
  development: {
  },

  test: {
    app: {
      port: 3001
    },
  },

  production: {
  }
};

_.merge(baseConfig, platformConfig[baseConfig.app.env]);
module.exports = baseConfig;