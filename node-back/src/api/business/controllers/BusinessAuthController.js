const moment = require('moment')
const crypto = require('crypto')
const BusinessUser = require('../../../models/BusinessUser')
const Business = require('../../../models/Business')
const PageContent = require('../../../models/PageContent')
const passwordUtils = require('../../../utils/passwordUtil')
const { omit } = require('lodash')
const { pick } = require('lodash')
const { sendResetTokenEmail } = require('../../../controllers/EmailController')
const { userError, Codes } = require('../../../messages/userMessages')
const { caseInsensitive } = require('../../../utils/queryUtils')

module.exports.signIn = function (req, res, next) {
  let { email, password } = req.body

  if (!email || !password) {
    return res.json({
      success: false,
      ...userError(Codes.ERROR_EMAIL_PASSWORD_REQUIRE)
    })
  }

  BusinessUser.findOne({ email: caseInsensitive(email) })
    .select('+password')
    .then((user) => {
      if (!user || !passwordUtils.checkPassword(user['password'], password))
        throw userError(Codes.ERROR_LOGIN_NOT_MATCH)

      res.send({
        success: true,
        user: omit(user.toJSON(), ['password']),
        token: BusinessUser.createSessionToken(user._id)
      })
    })
    .catch((error) => {
      res.send({
        success: false,
        errorCode: error.errorCode,
        message: error.message
      })
    })
}

module.exports.getUser = function (req, res, next) {
  let loggedIn = !!req.locals && !!req.locals.user
  let message = !loggedIn
    ? { ...userError(Codes.ERROR_USER_NOT_LOGIN) }
    : undefined
  res.send({
    success: loggedIn,
    user: loggedIn ? req.locals.user : undefined,
    ...message
  })
}

module.exports.signOut = function (req, res, next) {
  res.send({
    success: true
  })
}

module.exports.create = async (req, res, next) => {
  try {
    let existUser = await BusinessUser.findOne({
      email: { $regex: new RegExp('^' + req.body.email + '$', 'i') }
    })
    if (existUser) {
      throw userError(Codes.ERROR_USER_CREATE_FAIL_DOUPLICATE_EMAIL)
    }
    let userData = pick(req.body, [
      'firstName',
      'lastName',
      'email',
      'password'
    ])
    BusinessUser.create(userData)
      .then((businessUser) => {
        res.send({
          success: true,
          user: businessUser
        })
      })
      .catch((error) => {
        res.send({
          success: false,
          ...userError(Codes.ERROR_USER_CREATE_FAIL)
        })
      })
  } catch (error) {
    res.send({
      success: false,
      errorCode: error.errorCode,
      message: error.message
    })
  }
}

module.exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await BusinessUser.findOne({
      email: { $regex: new RegExp('^' + req.body.email + '$', 'i') }
    })
    if (!user) {
      res.send({
        success: false,
        ...userError(Codes.ERROR_USER_NOT_FOUND)
      })
    }
    const resetToken = user.createPasswordResetToken()
    await user.save({ validateBeforeSave: false })

    const resetURL = `${req.protocol}://${process.env.PANEL_BUSINESS}/reset-password/${resetToken}`
    await sendResetTokenEmail(user.email, resetURL)

    res.send({
      success: true
    })
  } catch (error) {
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save({ validateBeforeSave: false })
    res.send({
      success: false,
      errorCode: error.errorCode,
      message: error.message
      // message: 'There was an error sending the email. Try again later!'
    })
  }
}

module.exports.resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex')

    const user = await BusinessUser.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    })

    if (!user) {
      throw userError(Codes.ERROR_TOKEN_RESET_PASSWORD_INVALID)
    }
    user.password = req.body.password
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save()

    res.send({
      success: true,
      user: omit(user.toJSON(), ['password']),
      token: BusinessUser.createSessionToken(user._id)
    })
  } catch (error) {
    res.send({
      success: false,
      errorCode: error.errorCode,
      message: error.message
    })
  }
}

// module.exports.getTerms = async (req, res, next) => {
//   try {
//     const terms = await PageContetnt.findOne({ title: 'Terms Of Service' })
//     res.send({
//       success: true,
//       terms
//     })
//   } catch (error) {
//     res.send({
//       success: false,
//       errorCode: error.errorCode,
//       message: error.message
//     })
//   }
// }
module.exports.getStaticPage = async (req, res, next) => {
  try {
    const title = req.params.title
    const page = await PageContent.findOne({ title })
    res.send({
      success: true,
      page
    })
  } catch (error) {
    res.send({
      success: false,
      errorCode: error.errorCode,
      message: error.message
    })
  }
}
