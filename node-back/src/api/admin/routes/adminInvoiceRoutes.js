const { Router } = require('express')
const Controller = require('../controllers/AdminInvoiceController')
const { forceAuthorized: auth, ReadWrite } = require('../../../middleware/auth')
const adminPermissions = require('../../permisions').AdminUser

let router = Router()

const adminWritePermission = auth('AdminUser', [
  `${adminPermissions.InvoiceManagement}:${ReadWrite.Write}`
])

const adminReadPermission = auth('AdminUser', [
  `${adminPermissions.InvoiceManagement}:${ReadWrite.Read}`
])

router.post('/list', adminReadPermission, Controller.list)
router.get('/:id', adminReadPermission, Controller.retrieve)
router.post('/update/:id', adminWritePermission, Controller.update)

router.post('/businessList', adminReadPermission, Controller.businessList)
router.post('/', adminWritePermission, Controller.create)

module.exports = router
