const moment = require('moment')
const AdminUser = require('../../../models/AdminUser')
const PageContent = require('../../../models/PageContent')
const passwordUtils = require('../../../utils/passwordUtil')
const { omit } = require('lodash')
const { userError, Codes } = require('../../../messages/userMessages')
const { caseInsensitive } = require('../../../utils/queryUtils')
const ObjectId = require('mongoose').Types.ObjectId

module.exports.signIn = function (req, res, next) {
  let { username, password } = req.body
  if (!username || !password) {
    return res.json({
      success: false,
      ...userError(Codes.ERROR_LOGIN_REQUIRE)
    })
  }

  AdminUser.findOne({ username: caseInsensitive(username) })
    .select('+password')
    .then((user) => {
      if (!user || !passwordUtils.checkPassword(user['password'], password))
        throw userError(Codes.ERROR_LOGIN_NOT_MATCH)

      res.send({
        success: true,
        user: omit(user.toJSON(), ['password']),
        token: AdminUser.createSessionToken(user._id)
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

module.exports.signOut = async (req, res, next) => {
  let data = req.body.data
  let userId = req.params.userId
  if (!ObjectId.isValid(userId) || !userId) {
    throw userError(Codes.ERROR_USER_NOT_FOUND)
  }

  let user = await AdminUser.findById(userId)
  if (!user) {
    throw userError(Codes.ERROR_USER_NOT_FOUND)
  }
  const updates = Object.keys(data)
  const allowedUpdate = ['chatOnline']
  const isValidOpertion = updates.every((update) =>
    allowedUpdate.includes(update)
  )
  if (!isValidOpertion) {
    throw userError(Codes.ERROR_INVALID_UPDATE)
  }
  updates.forEach((update) => (user[update] = data[update]))

  user
    .save()
    .then((result) => {
      res.send({
        success: true
      })
    })
    .catch((error) => console.log(error))
}

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
