const { Router } = require('express')
const Controller = require('../controllers/AdminEagleController')
const { forceAuthorized: auth, ReadWrite } = require('../../../middleware/auth')
const adminPermissions = require('../../permisions').AdminUser

let router = Router()

router.get('/getOnlinedrivers', Controller.getOnlinedrivers)

module.exports = router
