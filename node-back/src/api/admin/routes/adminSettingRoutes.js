const { Router } = require('express')
const Controller = require('../controllers/AdminSettingContoller')
const { forceAuthorized: auth, ReadWrite } = require('../../../middleware/auth')
const adminPermissions = require('../../../api/permisions').AdminUser
const { uploadS3 } = require('../../../middleware/uploadToS3')

let router = Router()

const adminWritePermission = auth('AdminUser', [
  `${adminPermissions.Settings}:${ReadWrite.Write}`
])
const adminReadPermission = auth('AdminUser', [
  `${adminPermissions.Settings}:${ReadWrite.Read}`
])

// Group Routes
router.post('/group/list', adminReadPermission, Controller.groupList)
router.post('/group/create', adminWritePermission, Controller.groupCreate)
router.get('/group/retrieve/:id', adminReadPermission, Controller.retrieve)
router.post('/group/:id', adminWritePermission, Controller.update)
router.post('/group/delete/:id', adminWritePermission, Controller.delete)
router.get('/fee', adminReadPermission, Controller.retrieveFee)
router.post('/fee', adminWritePermission, Controller.feeCreate)

// Banner Routes
router.post('/banner/list', adminReadPermission, Controller.bannerList)
router.post(
  '/banner/create',
  uploadS3.single('file'),
  adminWritePermission,
  Controller.bannerCreate
)
router.post('/banner/delete/:id', adminWritePermission, Controller.bannerDelete)
router.post(
  '/banner/update/:id',
  uploadS3.single('file'),
  adminWritePermission,
  Controller.bannerUpdate
)
router.get(
  '/banner/retrieve/:id',
  adminReadPermission,
  Controller.bannerRetrieve
)

module.exports = router
