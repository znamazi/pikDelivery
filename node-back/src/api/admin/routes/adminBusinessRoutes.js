const { Router } = require('express')
const Controller = require('../controllers/AdminBusinessController')
const CustomerController = require('../controllers/AdminCustomerController')
const OrderController = require('../controllers/AdminOrderController')
const InvoiceController = require('../controllers/AdminInvoiceController')

const { forceAuthorized: auth, ReadWrite } = require('../../../middleware/auth')
const adminPermissions = require('../../permisions').AdminUser

let router = Router()

const adminWritePermission = auth('AdminUser', [
  `${adminPermissions.BusinessManagement}:${ReadWrite.Write}`
])
const adminReadPermission = auth('AdminUser', [
  `${adminPermissions.BusinessManagement}:${ReadWrite.Read}`
])

router.get('/:id', Controller.retrieve)

router.post('/list', adminReadPermission, Controller.list)
router.post('/customers/:id', adminReadPermission, CustomerController.list)
router.post('/orders/:id', adminReadPermission, OrderController.list)
router.post('/invoices/:id', adminReadPermission, InvoiceController.list)
router.post('/update/:id', adminWritePermission, Controller.update)
router.post('/edit/:id', adminWritePermission, Controller.edit)
router.post('/payments/:id', adminReadPermission, Controller.getPayments)
router.post('/:id/comment/list', adminReadPermission, Controller.listComment)
router.post('/comment', adminWritePermission, Controller.addComment)
router.post('/changeStatus/:id', adminWritePermission, Controller.changeStatus)

module.exports = router
