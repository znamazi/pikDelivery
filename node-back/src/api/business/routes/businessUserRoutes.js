const { Router } = require('express')
const Controller = require('../controllers/BusinessUserController')
const { forceAuthorized: auth, ReadWrite } = require('../../../middleware/auth')
const adminPermissions = require('../../../api/permisions').AdminUser

let router = Router()

const adminWritePermission = auth('AdminUser', [
  `${adminPermissions.UserManagement}:${ReadWrite.Write}`
])

router.post('/list', Controller.list)
router.post('/create', Controller.create)
router.post('/delete/:userId', Controller.delete)
router.post('/update/:userId', Controller.update)
router.get('/retrieve/:userId', Controller.retrieve)
router.post('/update/profile/:userId', Controller.updateProfile)

module.exports = router
