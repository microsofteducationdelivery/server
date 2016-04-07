var
  config = require('../config'),
  mandrill = require('mandrill-api/mandrill'),
  mandrillClient = new mandrill.Mandrill(config.mail.key),
  _ = require('lodash')
;


module.exports = {
  sendRegPassword: function (password, email) {
    var message = config.mail.credentialsText
      .replace('<password>', password)
    ;

    mandrillClient.messages.send({
      message: {
        from_email: config.mail.from,
        subject: config.mail.welcomeSubject,
        html: message,
        to: [{email: email}]
      }
    }, function (result) {
      console.log(result[0]);
    });

  },
  sendWelcomeEmail: function (user, password, email) {
    var message = config.mail.welcomeText
       .replace('<user>', user);
    mandrillClient.messages.send({
      message: {
        from_email: config.mail.from,
        subject: config.mail.welcomeSubject,
        html: message,
        to: [{email: email}]
      }
    }, function (result) {
      if (result[0].status === 'sent') {
        this.sendRegPassword(password, email);
      }
      console.log(result);
    }.bind(this));
  },
  sendRecoveryPasswordLink: function (userName, link, email) {
    var message = config.mail.recoveryText
        .replace('<username>', userName)
        .replace('<link>', link)
      ;

    mandrillClient.messages.send({
      message: {
        from_email: config.mail.from,
        subject: config.mail.recoverySubject,
        html: message,
        to: [{email: email}]
      }
    }, function (result) {
      console.log(result);
    });
  },
  sendUpdateUserProfile: function(data, email) {
    var messageText = config.mail.changeUserText;

    _.forIn(data, function(value, key) {
      messageText += key + ':' + value + '\n';
    });

    messageText = messageText + '\n Regards';

    mandrillClient.messages.send({
      message: {
        from_email: config.mail.from,
        subject: config.mail.changeSubject,
        text: messageText,
        to: [{email: email}]
      }
    }, function (result) {
      console.log(result);
    });
  }
};
