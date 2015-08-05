var
  config = require('../config'),
  twilio = require('twilio'),
  accountSid = 'ACfa54c3725a726eb3d31271685e485b2d',
  authToken = 'b7abc8ab0f4d5751972a0aa9850810bc',
  twilioClient = new twilio.RestClient(accountSid, authToken)
  ;


module.exports = {
  sendWelcomeSms: function (user, password, number) {
    var message = config.mail.welcomeText
        .replace('<user>', user)
        .replace('<password>', password)
      ;

    twilioClient.sendMessage({

        from: '+15005550006',
        to: '+380951394226',
        body: 'fsdfsdfdsfsdfsd'

    }, function (error, message) {
      if(error) {
        console.log(error.message);
      }
    });

  },
  sendRecoveryPasswordLink: function (userName, link, number) {
    var message = config.mail.recoveryText
        .replace('<username>', userName)
        .replace('<link>', link)
      ;

    twilioClient.messages.create({

      from: config.telephone.from,
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

      from: config.telephone.from,
      to: number,
      body: message

    }, function (error, message) {
      if(error) {
        console.log(error.message);
      }
    });
  }
};
