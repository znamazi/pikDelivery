const { Router } = require('express')
const adminController = require('../../admin/controllers/AdminInvoiceController')
const { forceAuthorized: auth, ReadWrite } = require('../../../middleware/auth')
const adminPermissions = require('../../permisions').AdminUser

let router = Router()

const adminWritePermission = auth('AdminUser', [
  `${adminPermissions.CustomerManagement}:${ReadWrite.Write}`
])

router.post('/list', adminController.list)
router.get('/:id', adminController.retrieve)
// router.post('/orders/:id', Controller.getOrder)
router.post('/export', adminController.export)

module.exports = router
