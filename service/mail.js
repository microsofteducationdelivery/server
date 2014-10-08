var
  config = require('../config'),
  mandrill = require('mandrill-api/mandrill'),
  mandrillClient = new mandrill.Mandrill(config.mail.key)
;


module.exports = {
  sendWelcomeEmail: function (user, password, email) {
    var message = config.mail.welcomeText
      .replace('<user>', user)
      .replace('<password>', password)
    ;

    mandrillClient.messages.send({
      message: {
        from_email: config.mail.from,
        subject: config.mail.welcomeSubject,
        text: message,
        to: [{email: email}]
      }
    }, function (result) {
      console.log(result);
    });

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
        text: message,
        to: [{email: email}]
      }
    }, function (result) {
      console.log(result);
    });
  }
};
