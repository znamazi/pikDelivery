const { Router } = require('express')
const adminController = require('../../admin/controllers/AdminOrderController')
const Controller = require('../controllers/BusinessOrderController')
const { forceAuthorized: auth, ReadWrite } = require('../../../middleware/auth')
const adminPermissions = require('../../permisions').AdminUser

let router = Router()

const adminWritePermission = auth('AdminUser', [
  `${adminPermissions.DriverManagement}:${ReadWrite.Write}`
])
router.post('/', Controller.create)
router.post('/list', adminController.list)
router.get('/today', Controller.todayOrders)
router.get('/:id', adminController.retrieve)
router.post('/emails', Controller.listEmail)
router.post('/names', Controller.listName)
router.post('/export', Controller.export)
router.post('/import', Controller.import)
router.post('/cancel', Controller.cancel)
router.post('/update/:id', Controller.update)
router.post('/cancel/:canceler', Controller.canceler)
module.exports = router
