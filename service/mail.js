var
  config = require('../config'),
  nodemailer = require('nodemailer'),
  sgTransport = require('nodemailer-sendgrid-transport'),
  _ = require('lodash')
;

var options = {
  auth: {
    api_user: config.mail.user,
    api_key:  config.mail.key

  }
};

var mailTransport = nodemailer.createTransport(sgTransport(options));

module.exports = {
  sendRegPassword: function (password, email) {
    var message = config.mail.credentialsText
      .replace('<password>', password)
    ;

    mailTransport.sendMail({
      from: config.mail.from,
      to: email,
      subject: config.mail.from,
      generateTextFromHTML: true,
      html: message
    }, function(err) {
      console.log('err', err);
    });
  },
  sendWelcomeEmail: function (user, password, email) {
    var message = config.mail.welcomeText
       .replace('<user>', user);
    var resultFunction = function(err) {
      (err) ? console.log(err) : this.sendRegPassword(password, email);
    };

    mailTransport.sendMail({
      from: config.mail.from,
      to: email,
      subject: config.mail.welcomeSubject,
      html: message
    }, resultFunction.bind(this));
  },
  sendRecoveryPasswordLink: function (userName, link, email) {
    var message = config.mail.recoveryText
        .replace('<username>', userName)
        .replace('<link>', link)
      ;

    mailTransport.sendMail({
      from: config.mail.from,
      to: email,
      subject: config.mail.recoverySubject,
      generateTextFromHTML: true,
      html: message
    }, function(err) {
      console.log('err', err);
    });
  },
  sendUpdateUserProfile: function(data, email) {
    var messageText = config.mail.changeUserText;

    _.forIn(data, function(value, key) {
      messageText += key + ':' + value + '\n';
    });

    messageText = messageText + '\n Regards';

    mailTransport.sendMail({
      from: config.mail.from,
      to: email,
      subject: config.mail.changeSubject,
      generateTextFromHTML: true,
      html: messageText
    }, function(err) {
      console.log('err', err);
    });
  },
  sendShareEmail: function(who, library, email) {
    var message = config.mail.shareText
        .replace('<who>', who)
        .replace('<library>', library)
      ;

    mailTransport.sendMail({
      from: config.mail.from,
      to: email,
      subject: config.mail.shareSubject,
      generateTextFromHTML: true,
      html: message
    }, function(err) {
      console.log('err', err);
    });

  }
};
