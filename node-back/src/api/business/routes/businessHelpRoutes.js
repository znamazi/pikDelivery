const { Router } = require('express')
const Controller = require('../controllers/BusinessHelpController')

const { forceAuthorized: auth, ReadWrite } = require('../../../middleware/auth')
const adminPermissions = require('../../../api/permisions').AdminUser

let router = Router()

const adminWritePermission = auth('AdminUser', [
  `${adminPermissions.UserManagement}:${ReadWrite.Write}`
])

router.get('/list', Controller.list)
router.get('/faq/questions/:id', Controller.listFaqs)

module.exports = router
