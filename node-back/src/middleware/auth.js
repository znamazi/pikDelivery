const Customer = require('../models/Customer')
const Driver = require('../models/Driver')
const BusinessUser = require('../models/BusinessUser')
const AdminUser = require('../models/AdminUser')
const jwt = require('jsonwebtoken')

const ReadWrite = {
  Read: '1',
  Write: '2',
  Both: '3'
}

/**
 * Load user data from DB using Authorization token of request header.
 * This method accepts Bearer token
 *
 * sample Bearer token:
 * `Bearer A4ab87......`
 */
module.exports.authorize = function (req, res, next) {
  // TODO check it more
  let token = req.headers.authorization
  if (req.locals === undefined) req.locals = {}
  if (token) {
    token = token.split(' ')[1]
    try {
      let decoded = jwt.verify(token, process.env.JWT_AUTH_SECRET)
      let { _id, type } = decoded
      if (decoded && decoded['_id']) {
        let modelMap = { AdminUser, Customer, BusinessUser, Driver }
        if (!modelMap[type])
          throw { message: 'Authentication user type mismatch' }
        let condition = { _id }
        if (['AdminUser', 'BusinessUser'].includes(type)) {
          condition = {
            ...condition,
            enabled: true
          }
        }
        modelMap[type]
          .findOne(condition)
          .then((user) => {
            if (user) {
              req.locals['user'] = user
              req.locals['userType'] = type
            }
          })
          .catch((error) => {})
          .then(next)
      } else {
        next()
      }
    } catch (e) {
      next()
    }
  } else {
    return next()
  }
}

/**
 * Force routes to have token of user
 */
module.exports.forceAuthorized = (userType, permissions) => {
  return function (req, res, next) {
    try {
      if (!req.locals || !req.locals.user)
        throw { message: 'Authentication failed ' }
      if (Array.isArray(userType)) {
        if (!userType.includes(req.locals.userType))
          throw { message: 'Authentication failed ' }
      } else {
        if (userType && userType !== req.locals.userType)
          throw { message: 'Authentication failed ' }
      }
      if (
        permissions &&
        !hasPermissions(req.locals.userType, req.locals.user, permissions)
      )
        throw { message: 'Permission denied' }
      next()
    } catch (e) {
      res.send({
        success: false,
        message: e.message || 'Authentication failed.3'
      })
    }
  }
}

/**
 * Force route to have token of user with specific permissions
 *
 * @param userType
 * @param user
 * @param permissions
 * @returns {boolean}
 */
function hasPermissions(userType, user, permissions) {
  if (user.role === AdminUser.Roles.SuperAdmin) return true
  if (!Array.isArray(permissions)) permissions = [permissions]
  console.log('permissions to check', permissions)
  if (!user['permissions'] || Object.keys(user['permissions']).length === 0)
    return false
  for (let p of permissions) {
    let [permission, readWrite] = p.split(':')
    let permissionItem = user.permissions[permission]
    if (!permissionItem) return false
    if (readWrite === undefined) continue
    console.log({permissionItem, readWrite})
    if ((permissionItem & parseInt(readWrite)) <= 0) return false
  }
  return true
}

module.exports.ReadWrite = ReadWrite
