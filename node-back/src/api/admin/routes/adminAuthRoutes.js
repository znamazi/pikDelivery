const { Router } = require('express')
const Controller = require('../controllers/AdminAuthController')

let router = Router()

router.post('/signin', Controller.signIn)
router.get('/user', Controller.getUser)
router.post('/signout/:userId', Controller.signOut)
router.get('/staticPage/:title', Controller.getStaticPage)

module.exports = router
