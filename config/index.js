var path = require('path'),
    _ = require('lodash');

var baseConfig = {
  mail: {
    key: process.env.MAIL_KEY || 'pPSw8KIDRM86OYtpe6ABIQ',
    from: 'noreply@microsofteducationdelivery.net',
    recoverySubject: 'Microsoft Education Delivery password recovery',
    recoveryText: 'Hello' +
      ' <username>' +
      '! \n' +
      '\n' +
      'You are receiving this email because you, or someone else was using it for password recovery procedure. ' +
      'Follow this <a href="<link>">link </a>' +
      'to change your password. \n',
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
    ].join('\n'),
    changeSubject: 'Your profile was updated',
    changeUserText: [
      'Hi',
      '',
      'Your profile was changed.',
      'Your new user data is:',
      ''
    ].join('\n')
  },
  app: {
    root: path.normalize(__dirname + '/../..'),
    port: process.env.PORT || 3000,
    baseUrl: process.env.BASE_URL || 'http://localhost:3000/',
    env: process.env.NODE_ENV || 'development',
    secret: 'secret key',
    serverId: 'sqldemo' || process.env.MED_SERVER_ID
  },
  //TODO: env variables
  mysql: {
    dbname: process.env.DB_NAME || 'med',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306
  },
  sms: {
    accountSid: process.env.SMS_SID || 'AC5eb47ab59b156d2a529812b8b2cd35e2',
    authToken: process.env.SMS_TOKEN || '7f32140ae849193d754cf91eef840828',
    welcomeText: 'Welcome to MED. Your credentials are: <user> and <password>',
    changeUserText: 'Your MED credentials have been changed: <user> / <password>',
    from: process.env.SMS_FROM || '+16123516315'
  }
};

var platformConfig = {
  development: {
  },

  test: {
    app: {
      port: 3001
    }
  },

  production: {
  }
};

_.merge(baseConfig, platformConfig[baseConfig.app.env]);
module.exports = baseConfig;
