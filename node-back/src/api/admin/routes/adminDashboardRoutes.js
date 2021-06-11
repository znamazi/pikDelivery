const { Router } = require('express')
const Controller = require('../controllers/AdminDashboaedController')
const { forceAuthorized: auth, ReadWrite } = require('../../../middleware/auth')
const adminPermissions = require('../../permisions').AdminUser

let router = Router()

const adminReadPermission = auth('AdminUser', [
  `${adminPermissions.Dashboard}:${ReadWrite.Read}`
])

router.get('/:weekNumber/:year', adminReadPermission, Controller.getInfo)

module.exports = router
