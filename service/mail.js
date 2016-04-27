var
  config = require('../config'),
  SparkPost = require('sparkpost'),
  Sparky = new SparkPost(config.mail.key),
  _ = require('lodash')
;


module.exports = {
  sendRegPassword: function (password, email) {
    var message = config.mail.credentialsText
      .replace('<password>', password)
    ;

    Sparky.transmissions.send({
      transmissionBody: {
        content: {
          from: config.mail.from,
          subject: config.mail.welcomeSubject,
          html: message
        },
        recipients: [
          {address: email}
        ]
      }
    }, function (err, result) {
      (err) ? console.log(err) : console.log(result);
    });

  },
  sendWelcomeEmail: function (user, password, email) {
    var message = config.mail.welcomeText
       .replace('<user>', user);

    Sparky.transmissions.send({
      transmissionBody: {
        content: {
          from: config.mail.from,
          subject: config.mail.welcomeSubject,
          html: message
        },
        recipients: [
          { address: email }
        ]
      }
    }, function (err, result) {
      (err) ? console.log(err) : this.sendRegPassword(password, email);
    }).bind(this);
  },
  sendRecoveryPasswordLink: function (userName, link, email) {
    var message = config.mail.recoveryText
        .replace('<username>', userName)
        .replace('<link>', link)
      ;

    Sparky.transmissions.send({
      transmissionBody: {
        content: {
          from: config.mail.from,
          subject: config.mail.recoverySubject,
          html: message
        },
        recipients: [
          { address: email }
        ]
      }
    }, function (err, result) {
      (err) ? console.log(err) : console.log(result);
    });
  },
  sendUpdateUserProfile: function(data, email) {
    var messageText = config.mail.changeUserText;

    _.forIn(data, function(value, key) {
      messageText += key + ':' + value + '\n';
    });

    messageText = messageText + '\n Regards';

    Sparky.transmissions.send({
      transmissionBody: {
        content: {
          from: config.mail.from,
          subject: config.mail.changeSubject,
          text: messageText
        },
        recipients: [
          { address: email }
        ]
      }
    }, function (err, result) {
      (err) ? console.log(err) : console.log(result);
    });
  }
};
