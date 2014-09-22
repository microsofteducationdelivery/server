var path = require('path'),
    _ = require('lodash');

var baseConfig = {
  mail: {
    key: 'pPSw8KIDRM86OYtpe6ABIQ',
    from: 'noreply@microsofteducationdelivery.net',
    welcomeSubject: 'Welcome to Microsoft Education Delivery',
    welcomeText: [
      'Hi',
      '',
      'Welcome to Microsoft Education Delivery.',
      'Microsoft Education Delivery carries high quality educational material to mobile devices. This makes access to education possible for anyone, anytime!',
      '',
      'Your user name and password are:',
      '',
      '<user> <password>',
      '',
      'Regards'
    ].join('\n')
  },
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