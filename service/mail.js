var
  config = require('../config'),
  directTransport = require('nodemailer-direct-transport'),
  nodemailer = require('nodemailer'),
  _ = require('lodash')
;


module.exports = {
  sendRegPassword: function (password, email) {
    var message = config.mail.credentialsText
      .replace('<password>', password)
    ;
    var mailTransport = nodemailer.createTransport(directTransport({}));

    mailTransport.sendMail({
      from: config.mail.from,
      to: email,
      subject: config.mail.from,
      generateTextFromHTML: true,
      html: message
    }, function(err) {
      console.log('err', err);
      mailTransport.close();
    });
  },
  sendWelcomeEmail: function (user, password, email) {
    var message = config.mail.welcomeText
       .replace('<user>', user);
    var mailTransport = nodemailer.createTransport(directTransport({}));
    var resultFunction = function(err) {
      (err) ? console.log(err) : this.sendRegPassword(password, email);
      mailTransport.close();
    };

    mailTransport.sendMail({
      from: config.mail.from,
      to: email,
      subject: config.mail.welcomeSubject,
      generateTextFromHTML: true,
      html: message
    }, resultFunction.bind(this));
  },
  sendRecoveryPasswordLink: function (userName, link, email) {
    var message = config.mail.recoveryText
        .replace('<username>', userName)
        .replace('<link>', link)
      ;

    var mailTransport = nodemailer.createTransport(directTransport({}));

    mailTransport.sendMail({
      from: config.mail.from,
      to: email,
      subject: config.mail.recoverySubject,
      generateTextFromHTML: true,
      html: message
    }, function(err) {
      console.log('err', err);
      mailTransport.close();
    });
  },
  sendUpdateUserProfile: function(data, email) {
    var messageText = config.mail.changeUserText;

    _.forIn(data, function(value, key) {
      messageText += key + ':' + value + '\n';
    });

    messageText = messageText + '\n Regards';

    var mailTransport = nodemailer.createTransport(directTransport({}));

    mailTransport.sendMail({
      from: config.mail.from,
      to: email,
      subject: config.mail.changeSubject,
      generateTextFromHTML: true,
      html: messageText
    }, function(err) {
      console.log('err', err);
      mailTransport.close();
    });
  }
};
