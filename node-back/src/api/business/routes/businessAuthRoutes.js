const { Router } = require('express')
const Controller = require('../controllers/BusinessAuthController')

let router = Router()

router.post('/signin', Controller.signIn)
router.get('/user', Controller.getUser)
router.post('/signout', Controller.signOut)
router.post('/create', Controller.create)
router.post('/forgotPassword', Controller.forgotPassword)
router.post('/resetPassword/:token', Controller.resetPassword)
// router.get('/terms', Controller.getTerms)
router.get('/staticPage/:title', Controller.getStaticPage)

module.exports = router
