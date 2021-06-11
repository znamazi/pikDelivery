const { Router } = require('express')
const Controller = require('../controllers/AdminCustomerController')
const { forceAuthorized: auth, ReadWrite } = require('../../../middleware/auth')
const adminPermissions = require('../../../api/permisions').AdminUser

let router = Router()

const adminWritePermission = auth('AdminUser', [
  `${adminPermissions.CustomerManagement}:${ReadWrite.Write}`
])

const adminReadPermission = auth('AdminUser', [
  `${adminPermissions.CustomerManagement}:${ReadWrite.Read}`
])

router.get('/:id', adminReadPermission, Controller.retrieve)

router.post('/list', adminReadPermission, Controller.list)
router.post('/orders/:id', adminReadPermission, Controller.getOrder)
router.post('/payments/:id', adminReadPermission, Controller.getPayments)
router.post('/changeStatus', adminWritePermission, Controller.changeStatus)
router.post('/comment', adminWritePermission, Controller.addComment)
router.post('/:id/comment/list', adminReadPermission, Controller.listComment)

module.exports = router
