const { Router } = require('express')
const Controller = require('../controllers/AdminOrderController')
const { forceAuthorized: auth, ReadWrite } = require('../../../middleware/auth')
const adminPermissions = require('../../../api/permisions').AdminUser

let router = Router()

const adminWritePermission = auth('AdminUser', [
  `${adminPermissions.OrderManagement}:${ReadWrite.Write}`
])

const adminReadPermission = auth('AdminUser', [
  `${adminPermissions.OrderManagement}:${ReadWrite.Read}`
])

router.post('/list', adminReadPermission, Controller.list)
router.post('/export', adminReadPermission, Controller.export)
router.get('/:id', adminReadPermission, Controller.retrieve)
router.post('/assignDriver', adminWritePermission, Controller.assignDriver)
router.get(
  '/order-track/:driverId/:orderId',
  adminReadPermission,
  Controller.getOrderLiveTrack
)
router.post('/cancel', adminWritePermission, Controller.cancel)

module.exports = router
