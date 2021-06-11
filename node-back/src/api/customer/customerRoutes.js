const { Router } = require("express");
const Controller = require("./CustomerController");
const {forceAuthorized: auth} = require('../../middleware/auth');
const {uploadS3} = require('../../middleware/uploadToS3')

let router = Router();

/**
 * Auth routes
 */
router.post("/register", Controller.register);
router.post("/confirm", Controller.confirm);
router.post("/signin", Controller.signIn);
router.post("/signin-social", Controller.signInSocial);
router.get("/social", Controller.checkSocialToken);
router.post("/signout", auth("Customer"), Controller.signOut);
var profileUpload = uploadS3.fields([{name: 'avatar', maxCount: 1}])
router.put("/profile", auth("Customer"), profileUpload, Controller.putProfile);
router.post("/recover-password", Controller.recoverPassword);

/**
 * Get current customer info
 */
router.get("/info", auth("Customer"), Controller.getUser);
router.get('/credit-cards', auth("Customer"), Controller.getCreditCards)
router.post('/credit-card', auth("Customer"), Controller.addCreditCard)
router.delete('/credit-card/:creditCard', auth("Customer"), Controller.deleteCreditCard)
router.get('/calculate-price', auth("Customer"), Controller.getCalculateOrderPrice)

var photoUpload = uploadS3
// .any()
  .fields([
    {name: 'photos', maxCount: 20},
  ])
router.post('/order', auth("Customer"), photoUpload, Controller.postNewOrder)
router.put('/complete-order/:order', auth("Customer"), photoUpload, Controller.putCompleteOrder)
router.put('/edit-order/:order', auth("Customer"), Controller.putEditOrder)
router.get('/order-list', auth("Customer"), Controller.getOrderList)
router.get('/mobile-info', auth("Customer"), Controller.getMobileInfo)
router.get('/business-time-frames/:business', auth("Customer"), Controller.getBusinessTimeFrames)
router.get('/order/:order', auth("Customer"), Controller.getOrderDetail)
router.put('/cancel-order/:order', auth("Customer"), Controller.cancelOrder)
router.post('/device-info', auth("Customer"), Controller.registerDevice)
router.get('/order-track/:order', auth("Customer"), Controller.getOrderLiveTrack)
router.post('/feedback/:order', auth("Customer"), Controller.postOrderFeedback)

router.get('/address/list', auth("Customer"), Controller.getSavedAddresses)
router.post('/address/new', auth("Customer"), Controller.postSavedAddress)
router.put('/address/:address', auth("Customer"), Controller.putSavedAddress)
router.delete('/address/:address', auth("Customer"), Controller.deleteSavedAddress)

router.get('/faqs', Controller.getFaqs)
var chatPhotoUpload = uploadS3
// .any()
  .fields([
    {name: 'photo', maxCount: 1},
  ])
router.post('/order-chat/:order', auth("Customer"), chatPhotoUpload, Controller.postOrderChat)
router.post('/order-chat-read/:order', auth("Customer"), Controller.postOrderChatRead)

var multiplePhotoUpload = uploadS3
// .any()
  .fields([
    {name: 'photos', maxCount: 10},
  ])
router.post('/contact-us', auth("Customer"), multiplePhotoUpload, Controller.postContactUs)
router.post('/support-ticket', auth("Customer"), multiplePhotoUpload, Controller.postSupportTicket)

router.get('/banner', Controller.getBanner)

router.get('/test', Controller.test)

module.exports = router;
