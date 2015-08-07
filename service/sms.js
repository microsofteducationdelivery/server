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

  sendUpdateUserProfile: function(data, number) {
    var message = config.sms.changeUserText.replace('<user>', data.login)
      .replace('<password>', data.newPassword)
      ;

    twilioClient.messages.create({

      from: config.sms.from,
      to: '+' + number,
      body: message

    }, function (error, message) {
      if(error) {
        console.log(error.message);
      }
    });
  }
};
