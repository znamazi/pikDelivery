const { Router } = require('express')
const Controller = require('../controllers/AdminDriverController')
const { forceAuthorized: auth, ReadWrite } = require('../../../middleware/auth')
const adminPermissions = require('../../permisions').AdminUser

let router = Router()

const adminWritePermission = auth('AdminUser', [
  `${adminPermissions.DriverManagement}:${ReadWrite.Write}`
])
const adminReadPermission = auth('AdminUser', [
  `${adminPermissions.DriverManagement}:${ReadWrite.Read}`
])

router.post('/list', adminReadPermission, Controller.list)
router.post('/export', adminReadPermission, Controller.export)
router.get('/:id', adminReadPermission, Controller.retrieve)
router.post('/orders/:id', Controller.getOrders)
router.post('/balance/:id', adminReadPermission, Controller.getBalance)

router.post(
  '/customValue/:id/:date',
  adminReadPermission,
  Controller.getCustomValue
)
router.post('/customValue/add', adminWritePermission, Controller.addCustomValue)
router.post(
  '/deleteCustomValue/:id',
  adminWritePermission,
  Controller.deleteCustomValue
)

router.post('/update/:id', adminWritePermission, Controller.update)
router.post('/getDrivers', adminReadPermission, Controller.getDrivers)
router.post('/comment', adminWritePermission, Controller.addComment)
router.post('/:id/comment/list', adminReadPermission, Controller.listComment)
router.post('/feedback/:id', adminReadPermission, Controller.getFeedback)
module.exports = router
