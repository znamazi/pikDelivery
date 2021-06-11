const { Router } = require('express')
const Controller = require('../controllers/AdminContentManagementController')
const { forceAuthorized: auth, ReadWrite } = require('../../../middleware/auth')
const adminPermissions = require('../../permisions').AdminUser

let router = Router()

const adminWritePermission = auth('AdminUser', [
  `${adminPermissions.ContentManagement}:${ReadWrite.Write}`
])
const adminReadPermission = auth('AdminUser', [
  `${adminPermissions.ContentManagement}:${ReadWrite.Read}`
])
// const upload = require('../../../middleware/upload')
const { uploadS3 } = require('../../../middleware/uploadToS3')

router.post('/upload', uploadS3.single('file'), Controller.uploadImage)

router.get('/page/list', adminReadPermission, Controller.listPage)
router.post('/page/create', adminWritePermission, Controller.createPage)
router.get('/page/retrieve/:id', adminReadPermission, Controller.retrievePage)
router.post('/page/update/:id', adminWritePermission, Controller.updatePage)
router.post('/page/delete/:id', adminWritePermission, Controller.deletePage)

router.post('/faq-cat/list', adminReadPermission, Controller.listFaqCat)
router.post('/faq-cat/create', adminWritePermission, Controller.createFaqCat)
router.get(
  '/faq-cat/retrieve/:id',
  adminReadPermission,
  Controller.retrieveFaqCat
)
router.post(
  '/faq-cat/update/:id',
  adminWritePermission,
  Controller.updateFaqCat
)
router.post(
  '/faq-cat/delete/:id',
  adminWritePermission,
  Controller.deleteFaqCat
)

router.post('/faq/list', adminReadPermission, Controller.listFaq)
router.post('/faq/create', adminWritePermission, Controller.createFaq)
router.get('/faq/retrieve/:id', adminReadPermission, Controller.retrieveFaq)
router.post('/faq/update/:id', adminWritePermission, Controller.updateFaq)
router.post('/faq/delete/:id', adminWritePermission, Controller.deleteFaq)

module.exports = router
