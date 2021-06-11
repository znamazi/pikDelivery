const {PhoneNumberUtil} = require('google-libphonenumber');
const phoneUtils = PhoneNumberUtil.getInstance();

module.exports = function (mobile) {
  if (typeof mobile !== 'string'){
    return `'${mobile}' is not valid mobile number`;
  }

  let number = phoneUtils.parseAndKeepRawInput(mobile)

  let valid = phoneUtils.isValidNumber(number)

  return !valid ? `'${mobile}' is not valid mobile number` : null;
}

