const { Router } = require('express')
const Controller = require('./GeoController')
const { forceAuthorized } = require('../../middleware/auth')

let router = Router()

/**
 * Auth routes
 */
const onlyAllowedUser = forceAuthorized([
  'Customer',
  'Driver',
  'BusinessUser',
  'AdminUser'
])
// const onlyAllowedUser = (req, res, next) => next()

router.get('/coding', onlyAllowedUser, Controller.coding)
router.get('/search', onlyAllowedUser, Controller.search)
router.get('/autocomplete', onlyAllowedUser, Controller.autoComplete)
router.get('/direction', onlyAllowedUser, Controller.direction)

module.exports = router
