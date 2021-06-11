const { Router } = require('express')
const Controller = require('../controllers/AdminPaymentController')
const { forceAuthorized: auth, ReadWrite } = require('../../../middleware/auth')
const adminPermissions = require('../../permisions').AdminUser

let router = Router()

const adminWritePermission = auth('AdminUser', [
  `${adminPermissions.PaymentManagement}:${ReadWrite.Write}`
])
const adminReadPermission = auth('AdminUser', [
  `${adminPermissions.PaymentManagement}:${ReadWrite.Read}`
])

router.post('/', adminWritePermission, Controller.create)
router.post('/list', adminReadPermission, Controller.list)
router.post('/export', adminReadPermission, Controller.export)
router.post('/update/:id', adminWritePermission, Controller.update)

module.exports = router
