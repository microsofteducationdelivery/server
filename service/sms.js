var
  config = require('../config'),
  twilio = require('twilio'),
  twilioClient = new twilio.RestClient(config.sms.accountSid, config.sms.authToken)
  ;


module.exports = {
  sendWelcomeSms: function (user, password, number) {
    var message = config.sms.welcomeText
        .replace('<user>', user)
        .replace('<password>', password)
      ;

    twilioClient.sendSms({

        from: config.sms.from,
        to: '+' + number,
        body: message

    }, function (error, message) {
      if(error) {
        console.log(error.message);
      }
    });

  },
  sendRecoveryPasswordLink: function (userName, link, number) {
    var message = config.sms.recoveryText
        .replace('<username>', userName)
        .replace('<link>', link)
      ;

    twilioClient.messages.create({

      from: config.sms.from,
      to: number,
      body: message

    }, function (error, message) {
      if(error) {
        console.log(error.message);
      }
    });
  },
  sendUpdateUserProfile: function(data, number) {
    var message = config.mail.changeUserText.replace('<user>', data.login)
      .replace('<login>', data.login)
      .replace('<email>', data.email)
      .replace('<password>', data.newPassword)
      .replace('<type>', data.type)
      .replace('<singleDevice>', data.singleDevice)
      .replace('<deviceId>', data.deviceId);

    twilioClient.messages.create({

      from: config.sms.from,
      to: number,
      body: message

    }, function (error, message) {
      if(error) {
        console.log(error.message);
      }
    });
  }
};
