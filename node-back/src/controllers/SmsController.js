const randomString = require('../utils/randomString');

const accountSid = process.env.TWILIO_ACCOUNT_ID; // .env
const authToken = process.env.TWILIO_AUTH_TOKEN; // .env
const client = require('twilio')(accountSid, authToken, {
  // logLevel: 'debug'
});

function sendSms(to, text) {
  return client.messages
    .create({
      body: text,
      from: process.env.TWILIO_MOBILE_NUMBER, // .env
      to
    })
    // .then(message =>
    // {
    //   console.log('done');
    //   console.log(message.sid)
    // }).catch(x => console.log(x));
    .catch(error => {
      console.error(error)
      console.log(error.response)
      throw {message: `Fail to send SMS.\nCode: ${error.code}\nMessage: ${error.message}`}
    })
}

exports.sendSms = sendSms;

/**
 * @param mobile
 * @returns Promise that resolves confirmation code
 */
exports.sendMobileConfirmSms = function sendConfirmSms(mobile) {
  let confirmCode = randomString(5, "123456");
  if (parseBoolean(process.env.SMS_IN_CONSOLE)) {
    console.log(`mobile confirm code: [${mobile}:${confirmCode}]`);
    return Promise.resolve(confirmCode)
  } else {
    return sendSms(mobile, `PIK confirmation code: ${confirmCode}`)
      .then(message => {
        // console.log("sms sent", message)
        //   console.log('done');
        //   console.log(message.sid)
        console.log(`mobile confirm code: [${mobile}:${confirmCode}]`);
        return confirmCode;
      })
  }
}

exports.sendOrderCreate = function sendOrderCreate(order, sender, receiver) {
  let text = `PIK Order\n${sender.name} send you a package.\nOrder ID: ${order.id}`
  return sendSms(receiver.mobile, text)
}
