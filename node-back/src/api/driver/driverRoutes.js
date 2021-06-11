const {Router} = require('express')
const Controller = require('./DriverController')
const {forceAuthorized: auth} = require('../../middleware/auth')
// const upload = require('../../middleware/upload')
const {uploadS3} = require('../../middleware/uploadToS3')

let router = Router()

/**
 * Auth routes
 */
router.post('/register', Controller.authRegister)
router.post('/confirm', Controller.authConfirm)
router.post('/signin', Controller.authSignIn)
router.post('/signout', auth('Driver'), Controller.authSignOut)
router.post("/recover-password", Controller.recoverPassword);

/**
 * Get current driver info
 */
router.get('/info', auth('Driver'), Controller.getUser)

/**
 * Get current driver documents
 */
router.get("/documents", auth("Driver"), Controller.getDocuments);

/**
 * Upload driver documents
 */
var docUpload = uploadS3
  // .any()
  .fields([
    {name: 'idFront', maxCount: 1},
    {name: 'idRear', maxCount: 1},
    {name: 'licenceFront', maxCount: 1},
    {name: 'avatar', maxCount: 1},
    {name: 'insurance', maxCount: 1},
    {name: 'photos', maxCount: 20},
  ])
// router.post("/documents", auth("Driver"), docUpload, Controller.postDocuments);
router.put("/documents", auth("Driver"), docUpload, Controller.putDocuments);


router.put("/profile", auth("Driver"), docUpload, Controller.putProfile);


router.put("/vehicle", auth("Driver"), docUpload, Controller.putVehicleInfo);

/**
 * Update driver personal details
 */
router.put('/personal-detail', auth('Driver'), Controller.updatePersonalDetail)

/**
 * Update driver personal ID
 */
router.put('/personal-id', auth('Driver'), Controller.updatePersonalId)

/**
 * Update driver Licence
 */
router.put('/driving-licence', auth('Driver'), Controller.updateDrivingLicence)

/**
 * Update driver profile Image
 */
router.put('/avatar', auth('Driver'), Controller.updateAvatar)

/**
 * Update driver profile Image
 */
router.post('/delete-vehicle-photo', auth('Driver'), Controller.deleteVehiclePhoto)

/**
 * Update driver active/inactive status
 */
router.put('/status', auth('Driver'), Controller.updateStatus)

/**
 * Get list of available jobs
 */
router.get('/job', auth('Driver'), Controller.getJob)

/**
 * Get list of available jobs
 */
router.get('/suggest-time-info/:order', auth('Driver'), Controller.getSuggestionTimeInfo)

/**
 * Ignore suggested order
 */
router.post('/ignore-suggest', auth('Driver'), Controller.ignoreSuggest)

/**
 * Driver assign themselves to an order
 */
router.post('/assign', auth('Driver'), Controller.assignDriver)

/**
 * Driver get direction from current location to pickup/delivery location
 */
router.get('/order-direction/:order', auth('Driver'), Controller.getOrderDirection)

/**
 * Driver get direction from current location to pickup location
 */
router.put('/order-track/:order', auth('Driver'), Controller.putOrderTrack)

/**
 * Driver inform that arrived to pickup location
 */
router.post('/pickup-arrive', auth('Driver'), Controller.setPickupArrival)

/**
 * Driver enter tracking code
 */
router.post('/tracking-code', auth('Driver'), Controller.postTrackingCode)

/**
 * Driver complete the pickup
 */
router.post('/pickup-complete', auth('Driver'), Controller.setPickupCompleted)

/**
 * Driver inform that arrived to delivery location
 */
router.post('/deliver-arrive', auth('Driver'), Controller.setDeliverArrival)

/**
 * Driver inform that arrived to delivery location
 */var completePhotoUpload = uploadS3
  .fields([
      {name: 'photo', maxCount: 1},
  ])
router.post('/delivery-complete', auth('Driver'), completePhotoUpload, Controller.setDeliverComplete)

/**
 * Driver return the order to sender
 */
router.post('/return-complete', auth('Driver'), Controller.setReturnComplete)

/**
 * Driver cancel the accepted order
 */
router.post('/cancel', auth('Driver'), Controller.cancelOrder)

/**
 * Returns driver success orders
 */
router.get('/earnings', auth('Driver'), Controller.getEarnings)

/**
 * Update driver location
 */
router.put('/location', auth('Driver'), Controller.putLocation)

/**
 * Register fcm device
 */
router.post('/device-info', auth("Driver"), Controller.registerDevice)

/**
 * Send order chat message
 */
var chatPhotoUpload = uploadS3
// .any()
  .fields([
    {name: 'photo', maxCount: 1},
  ])
router.post('/order-chat/:order', auth("Driver"), chatPhotoUpload, Controller.postOrderChat)
router.post('/order-chat-read/:order', auth("Driver"), Controller.postOrderChatRead)

router.get('/bank-account', auth('Driver'), Controller.getBankAccount)

router.post('/bank-account', auth('Driver'), Controller.postBankAccount)

router.get('/faqs', Controller.getFaqs)

/**
 * Send support ticket
 */
var multiplePhotoUpload = uploadS3
// .any()
  .fields([
    {name: 'photos', maxCount: 10},
  ])
router.post('/contact-us', auth("Driver"), multiplePhotoUpload, Controller.postContactUs)
router.post('/support-ticket', auth("Driver"), multiplePhotoUpload, Controller.postSupportTicket)

router.get('/test', Controller.test)

module.exports = router
