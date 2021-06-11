const { Router } = require('express')
const Controller = require('../controllers/BusinessSetupController')
const { resizeBeforeUpload } = require('../../../middleware/uploadToS3')

let router = Router()

router.post('/create', Controller.create)
router.post(
  '/avatar',
  resizeBeforeUpload(800, 800).single('file'),
  Controller.uploadAvatar
)
router.get('/', Controller.retrieve)
router.post('/', Controller.update)
router.post('/edit', Controller.edit)
router.get('/checkBusiness', Controller.checkBusiness)
module.exports = router
