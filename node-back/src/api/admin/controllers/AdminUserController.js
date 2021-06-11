const AdminUser = require('../../../models/AdminUser')
const { pick, assign } = require('lodash')
const {
  caseInsensitive,
  ascDeskToNumber,
  paginateAggregate
} = require('../../../utils/queryUtils')
const { userError, Codes } = require('../../../messages/userMessages')
const ObjectId = require('mongoose').Types.ObjectId

module.exports.list = function (req, res, next) {
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
        { name: caseInsensitive(filter[key]) },
        { email: caseInsensitive(filter[key]) },
        { username: caseInsensitive(filter[key]) }
      ]
    } else {
      if (!!filter[key]) acc[key] = filter[key] == 'true'
    }
    return acc
  }, {})

  let aggregate = [{ $match: filterMatch }]
  if (sortField) {
    let sorting = { [sortField]: ascDeskToNumber(sortOrder) }
    aggregate.push({ $sort: sorting })
  }

  paginateAggregate(AdminUser, aggregate, pageNumber, pageSize)
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
    let userData = pick(req.body, [
      'name',
      'username',
      'email',
      'password',
      'mobile',
      'permissions',
      'enabled',
      'role'
    ])
    let existUser = await AdminUser.findOne({
      email: { $regex: new RegExp('^' + req.body.email + '$', 'i') }
    })
    if (existUser) {
      throw userError(Codes.ERROR_USER_CREATE_FAIL_DOUPLICATE_EMAIL)
    }
    AdminUser.create(userData)
      .then((adminUser) => {
        res.send({
          success: true,
          user: adminUser
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

module.exports.delete = async (req, res, next) => {
  try {
    const userId = req.params.userId
    if (!ObjectId.isValid(userId)) {
      throw userError(Codes.ERROR_USER_NOT_FOUND)
    }

    let user = await AdminUser.findById(userId)
    if (!user) {
      throw userError(Codes.ERROR_USER_NOT_FOUND)
    }
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
    let data = req.body
    let userId = req.params.userId
    if (!ObjectId.isValid(userId) || !userId) {
      throw userError(Codes.ERROR_USER_NOT_FOUND)
    }
    if (data.permissions) {
      let permissions = data.permissions
      Object.keys(permissions).forEach((per) =>
        permissions[per] == 0 ? delete permissions[per] : ''
      )
      data = { ...data, permissions: { ...permissions } }
    }

    let user = await AdminUser.findById(userId)
    if (!user) {
      throw userError(Codes.ERROR_USER_NOT_FOUND)
    }
    let existUser = await AdminUser.findOne({
      email: { $regex: new RegExp('^' + req.body.email + '$', 'i') },
      _id: { $ne: userId }
    })
    if (existUser) {
      throw userError(Codes.ERROR_USER_CREATE_FAIL_DOUPLICATE_EMAIL)
    }
    assign(user, data)
    user
      .save()
      .then((result) => {
        res.send({
          success: true,
          userId,
          result
        })
      })
      .catch((error) => console.log(error))
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
    if (!ObjectId.isValid(userId)) {
      throw userError(Codes.ERROR_USER_NOT_FOUND)
    }
    let user = await AdminUser.findById(userId)
    if (!user) {
      throw userError(Codes.ERROR_USER_NOT_FOUND)
    }
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

module.exports.firebaseToken = async (req, res, next) => {
  try {
    let user = await AdminUser.findById(req.locals.user._id)
    if (!user) {
      throw userError(Codes.ERROR_USER_NOT_FOUND)
    }

    assign(user, req.body)
    await user.save()
    res.send({
      success: true
    })
  } catch (error) {
    res.send({
      success: false,
      ...userError(Codes.SERVER_SIDE_ERROR)
    })
  }
}

module.exports.updateProfile = async (req, res, next) => {
  try {
    let data = req.body
    let userId = req.params.userId
    if (!ObjectId.isValid(userId) || !userId) {
      throw userError(Codes.ERROR_USER_NOT_FOUND)
    }

    let user = await AdminUser.findById(userId)
    if (!user) {
      throw userError(Codes.ERROR_USER_NOT_FOUND)
    }
    const updates = Object.keys(req.body)
    const allowedUpdate = ['name', 'username', 'password', 'chatOnline']
    const isValidOpertion = updates.every((update) =>
      allowedUpdate.includes(update)
    )
    if (!isValidOpertion) {
      throw userError(Codes.ERROR_INVALID_UPDATE)
    }
    assign(user, data)
    user
      .save()
      .then((result) => {
        res.send({
          success: true,
          userId,
          result
        })
      })
      .catch((error) => console.log(error))
  } catch (error) {
    res.send({
      success: false,
      errorCode: error.errorCode,
      message: error.message
    })
  }
}
