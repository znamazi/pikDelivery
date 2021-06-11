const { Router } = require('express')
const adminController = require('../../admin/controllers/AdminCustomerController')
const Controller = require('../controllers/BusinessCustomerController')

const { forceAuthorized: auth, ReadWrite } = require('../../../middleware/auth')

let router = Router()

router.post('/relatedEmail', Controller.createRelatedEmail)
router.post('/relatedEmail/list', Controller.listRelatedEmail)
router.post('/list', adminController.list)
router.get('/:id', adminController.retrieve)
router.post('/orders/:id', adminController.getOrder)
router.post('/delete/:id', adminController.delete)

module.exports = router
