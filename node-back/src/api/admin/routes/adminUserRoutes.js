const { Router } = require('express')
const Controller = require('../controllers/AdminUserController')
const { forceAuthorized: auth, ReadWrite } = require('../../../middleware/auth')
const adminPermissions = require('../../../api/permisions').AdminUser

let router = Router()

const adminWritePermission = auth('AdminUser', [
  `${adminPermissions.Settings}:${ReadWrite.Write}`
])

const adminReadPermission = auth('AdminUser', [
  `${adminPermissions.Settings}:${ReadWrite.Read}`
])

router.post('/list', adminReadPermission, Controller.list)
router.post('/create', adminWritePermission, Controller.create)
router.post('/delete/:userId', adminWritePermission, Controller.delete)
router.post('/update/:userId', adminWritePermission, Controller.update)
router.get('/retrieve/:userId', adminReadPermission, Controller.retrieve)
router.post('/firebaseToken', Controller.firebaseToken)
router.post('/update/profile/:userId', Controller.updateProfile)

module.exports = router
