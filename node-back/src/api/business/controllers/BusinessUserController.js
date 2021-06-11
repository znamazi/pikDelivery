const moment = require('moment')
const BusinessUser = require('../../../models/BusinessUser')
const passwordUtils = require('../../../utils/passwordUtil')
const { pick, assign } = require('lodash')
const {
  caseInsensitive,
  ascDeskToNumber,
  paginateAggregate
} = require('../../../utils/queryUtils')
const { userError, Codes } = require('../../../messages/userMessages')
const ObjectId = require('mongoose').Types.ObjectId
const {
  sendWelcomeUserBusiness
} = require('../../../controllers/EmailController')

module.exports.list = function (req, res, next) {
  const businessId = req.locals.user.business

  let {
    filter = {},
    sortOrder,
    sortField,
    pageNumber = 0,
    pageSize = 10
  } = req.body
  let filterMatch = Object.keys(filter).reduce((acc, key) => {
    if (key === 'query') {
      acc['$or'] = [
        { firstName: caseInsensitive(filter[key]) },
        { lastName: caseInsensitive(filter[key]) },
        { userName: caseInsensitive(filter[key]) }
      ]
    } else {
      if (!!filter[key]) acc[key] = filter[key] == 'true'
    }
    return acc
  }, {})

  let aggregate = [{ $match: { ...filterMatch, business: businessId } }]
  if (sortField) {
    let sorting = { [sortField]: ascDeskToNumber(sortOrder) }
    aggregate.push({ $sort: sorting })
  }

  paginateAggregate(BusinessUser, aggregate, pageNumber, pageSize)
    .then(({ data, totalCount }) => {
      res.send({
        success: true,
        users: data,
        totalCount
      })
    })
    .catch((error) => {
      res.send({
        success: false,
        ...userError(Codes.SERVER_SIDE_ERROR)
      })
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
      'userName',
      'business',
      'email',
      'password',
      'mobile',
      'permissions',
      'enabled',
      'role'
    ])
    userData.business = req.locals.user.business
    BusinessUser.create(userData)
      .then((BusinessUser) => {
        sendWelcomeUserBusiness(req.body.email, req.body.password)
        res.send({
          success: true,
          user: BusinessUser
        })
      })
      .catch((error) => {
        console.log(error)
        res.send({
          success: false,
          ...userError(Codes.ERROR_USER_CREATE_FAIL)
        })
      })
  } catch (error) {
    console.log('error happend', error)
    res.send({
      success: false,
      errorCode: error.errorCode,
      message: error.message
    })
  }
}

module.exports.delete = async (req, res, next) => {
  try {
    let userId = req.params.userId
    if (!ObjectId.isValid(userId) || !userId) {
      throw userError(Codes.ERROR_USER_NOT_FOUND)
    }
    let user = await BusinessUser.findById(userId)
    if (!user) throw userError(Codes.ERROR_USER_NOT_FOUND)
    await user.remove()
    res.send({
      success: true
    })
  } catch (error) {
    res.send({
      success: false,
      errorCode: error.errorCode,
      message: error.message
    })
  }
}

module.exports.update = async (req, res, next) => {
  try {
    let userId = req.params.userId
    if (!ObjectId.isValid(userId) || !userId) {
      throw userError(Codes.ERROR_USER_NOT_FOUND)
    }
    let user = await BusinessUser.findById(userId)
    if (!user) throw userError(Codes.ERROR_USER_NOT_FOUND)
    let existUser = await BusinessUser.findOne({
      email: { $regex: new RegExp('^' + req.body.email + '$', 'i') },
      _id: { $ne: userId }
    })
    if (existUser) {
      throw userError(Codes.ERROR_USER_CREATE_FAIL_DOUPLICATE_EMAIL)
    }
    assign(user, req.body)
    await user.save()
    res.send({
      success: true,
      userId
    })
  } catch (error) {
    res.send({
      success: false,
      errorCode: error.errorCode,
      message: error.message
    })
  }
}

module.exports.retrieve = async (req, res, next) => {
  try {
    let userId = req.params.userId
    if (!ObjectId.isValid(userId) || !userId) {
      throw userError(Codes.ERROR_USER_NOT_FOUND)
    }
    let user = await BusinessUser.findById(userId)
    if (!user) throw userError(Codes.ERROR_USER_NOT_FOUND)
    res.send({
      success: true,
      user
    })
  } catch (error) {
    res.send({
      success: false,
      errorCode: error.errorCode,
      message: error.message
    })
  }
}

module.exports.updateProfile = async (req, res, next) => {
  try {
    let userId = req.params.userId
    if (!ObjectId.isValid(userId) || !userId) {
      throw userError(Codes.ERROR_USER_NOT_FOUND)
    }
    let user = await BusinessUser.findById(userId)
    if (!user) throw userError(Codes.ERROR_USER_NOT_FOUND)
    const updates = Object.keys(req.body)
    const allowedUpdate = ['firstName', 'password']
    const isValidOpertion = updates.every((update) =>
      allowedUpdate.includes(update)
    )
    if (!isValidOpertion) {
      throw userError(Codes.ERROR_INVALID_UPDATE)
    }

    assign(user, req.body)
    await user.save()
    res.send({
      success: true,
      userId
    })
  } catch (error) {
    res.send({
      success: false,
      errorCode: error.errorCode,
      message: error.message
    })
  }
}
