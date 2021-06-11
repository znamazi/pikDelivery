const moment = require('moment')
const {firestore, firebaseAdmin} = require('../../fcm')
const _ = require('lodash')
const GoogleApi = require('../../utils/googleApi')
const randomString = require('../../utils/randomString')
const Driver = require('../../models/Driver')
const DriverOnlineLocation = require('../../models/DriverOnlineLocation')
const Business = require('../../models/Business')
const Customer = require('../../models/Customer')
const CustomValue = require('../../models/CustomValue')
const Order = require('../../models/Order')
const OrderTrack = require('../../models/OrderTrack')
const OrderSuggest = require('../../models/OrderSuggest')
const UserDevice = require('../../models/UserDevice')
const BankAccount = require('../../models/BankAccount')
const Faq = require('../../models/Faq')
const FaqCategories = require('../../models/FaqCategories')
const passwordUtils = require('../../utils/passwordUtil')
const SmsController = require('../../controllers/SmsController')
const { omit, pick } = require('lodash')
const { caseInsensitive } = require('../../utils/queryUtils')
const unlinkAsync = require('../../utils/unlinkAsync')
const EmailController = require('../../controllers/EmailController')
const NotificationController = require('../../controllers/NotificationController')
const EventBus = require('../../eventBus')
const { userError, Codes: ErrorCodes } = require('../../messages/userMessages')
const PikCache = require('../../pik-cache')
const { v4: uuid } = require('uuid')

const SUGGESTION_EXPIRE_SECONDS = 25

module.exports.authRegister = function (req, res, next) {
  let { email, mobile, password } = req.body
  let info = pick(req.body, ['email', 'mobile', 'password'])
  let driver = null

  if (!email || !mobile || !password) {
    return res.json({
      success: false,
      message: 'email, mobile and password required'
    })
  }

  Driver.findOne({ email })
    .then((_driver) => {
      if (_driver && _driver.mobileConfirmed)
        throw { message: 'Driver with this email already registered.' }
      driver = _driver
      return SmsController.sendMobileConfirmSms(mobile)
    })
    .then((confirmCode) => {
      if (!driver) driver = new Driver({ email, password })
      PikCache.mobileCache.set(`driver-mobile-${driver._id}`, {
        mobile,
        code: confirmCode
      })
      return driver.save()
    })
    .then(() => {
      res.json({
        success: true,
        user: driver
      })
    })
    .catch((error) => {
      res.json({
        success: false,
        message: error.message || 'Server side error',
        error
      })
    })
}

module.exports.authConfirm = function (req, res, next) {
  let { userId, confirmCode } = req.body
  let driver = null
  Driver.findById(userId)
    .select('+mobileConfirmCode')
    .then((_driver) => {
      if (!_driver) throw { message: 'User not found' }
      driver = _driver
      let confirmation = PikCache.mobileCache.get(`driver-mobile-${driver._id}`)
      // TODO [STA]: code verification disabled temporarily
      if (!confirmation /*|| confirmation.code !== confirmCode*/)
        throw { message: 'Incorrect confirmation code' }
      driver.mobile = confirmation.mobile
      driver.mobileConfirmed = true
      return driver.save()
    })
    .then(() => {
      res.json({
        success: true,
        token: Driver.createSessionToken(driver._id)
      })
    })
    .catch((error) => {
      res.json({
        success: false,
        message: error.message || 'Server side error',
        error
      })
    })
}

module.exports.authSignIn = function (req, res, next) {
  let { email, password } = req.body

  if (!email || !password) {
    return res.json({
      success: false,
      message: 'Email and password required'
    })
  }

  Driver.findOne({ email: caseInsensitive(email.trim()) })
    .select('+password')
    .then((driver) => {
      if (!driver || !passwordUtils.checkPassword(driver['password'], password))
        throw { message: 'Email or password not matched' }
      if (!driver.mobileConfirmed)
        throw { message: 'Mobile number not confirmed' }

      res.send({
        success: true,
        user: omit(driver.toJSON(), ['password']),
        token: Driver.createSessionToken(driver._id)
      })
    })
    .catch((error) => {
      res.send({
        success: false,
        message: error.message || 'server side error'
      })
    })
}

module.exports.authSignOut = function (req, res, next) {
  let driver = req.locals.user

  Promise.resolve(true)
    .then(async () => {
      driver.online = false;
      await driver.save()
      await DriverOnlineLocation.deleteMany({driver: driver._id})

      res.send({
        success: true
      })
    })
    .catch((error) => {
      let { message, errorCode } = error
      res.send({
        success: false,
        message: message || 'Somethings went wrong',
        errorCode: errorCode || ErrorCodes.SERVER_SIDE_ERROR
      })
    })

}

module.exports.recoverPassword = function (req, res, next) {
  let { step, email, securityCode, password } = req.body

  Driver.findOne({ email: caseInsensitive(email.trim()) })
    .select('+emailConfirmCode')
    .then(async (driver) => {
      if (!driver) throw userError(ErrorCodes.ERROR_DRIVER_NOT_FOUND)
      switch (step) {
        case 0: {
          // TODO: enable random string
          let code = '111111' //randomString(6, '0123456789')
          PikCache.passwordCache.set(`pass-code-${driver._id}`, code)
          let emailSent = await EmailController.sendPasswordRecoveryEmail(
            driver.email,
            code
          )
          if (!emailSent) {
            throw userError(ErrorCodes.SERVER_SIDE_ERROR, "Problem in sending email")
          }
          break
        }
        case 1: {
          let code = PikCache.passwordCache.get(`pass-code-${driver._id}`)
          if (code.toLowerCase() !== securityCode.toLowerCase())
            throw userError(ErrorCodes.ERROR_PASSWORD_RECOVERY_CODE_INCORRECT)
          break
        }
        case 2: {
          let code = PikCache.passwordCache.get(`pass-code-${driver._id}`)
          if (code.toLowerCase() !== securityCode.toLowerCase())
            throw userError(ErrorCodes.ERROR_PASSWORD_RECOVERY_CODE_INCORRECT)

          driver.password = password
          driver.save()
          break
        }
      }
      res.send({
        success: true,
        user: omit(driver.toJSON(), ['password']),
        token: Driver.createSessionToken(driver._id)
      })
    })
    .catch((error) => {
      let { message, errorCode } = error
      res.send({
        success: false,
        message: message || 'Somethings went wrong',
        errorCode: errorCode || ErrorCodes.SERVER_SIDE_ERROR
      })
    })
}

module.exports.getUser = function (req, res, next) {
  let loggedIn = !!req.locals && !!req.locals.user
  res.send({
    success: loggedIn,
    user: loggedIn ? req.locals.user : undefined,
    message: !loggedIn ? 'User not logged in' : undefined
  })
}

const correctPhotoPath = (path) => path.replace('user_files/', '/file/')

module.exports.postDocuments = function (req, res, next) {
  let user = req.locals.user
  let { idFront, idRear, licenceFront, avatar, insurance, photos } =
    req.files || {}
  let { personalId, licence, vehicle } = req.body || {}

  Promise.resolve(true)
    .then(() => {
      if (
        !personalId ||
        !personalId.type ||
        !personalId.id ||
        !idFront ||
        !idRear
      )
        throw {
          message:
            'Personal ID requires to enter all fields (type, id, front photo, rear photo)'
        }
      if (!licence || !licence.expire || !licenceFront)
        throw {
          message:
            'Driving licence requires to enter all fields (expire, front photo)'
        }
      if (!avatar) throw { message: 'Profile photo required' }
      if (!insurance) throw { message: 'Car insurance photo required' }
      if (
        !vehicle ||
        !vehicle['type'] ||
        !vehicle.makeModel ||
        !vehicle.plate ||
        !vehicle.year ||
        !vehicle.color
      )
        throw {
          message:
            'Vehicle info requires to enter this fields (Type, Make/Model, Plate, Year, Color)'
        }

      // console.log(JSON.stringify(photos, null, 2))
      user['personalId'] = {
        ..._.pick(personalId, ['type', 'id']),
        frontPhoto: correctPhotoPath(idFront[0].location),
        rearPhoto: correctPhotoPath(idRear[0].location),
        approved: false
      }
      user['drivingLicence'] = {
        expire: licence.expire,
        frontPhoto: correctPhotoPath(licenceFront[0].location),
        approved: false
      }
      user['avatar'] = correctPhotoPath(avatar[0].location)
      user['carInsurance'] = {
        document: correctPhotoPath(insurance[0].location),
        approved: false
      }
      user['vehicle'] = {
        ..._.pick(vehicle, [
          'type',
          'makeModel',
          'plate',
          'year',
          'color',
          'description'
        ]),
        photos: photos.map((p) => correctPhotoPath(p.location))
      }
      user['status'] = Driver.Status.InReview

      return user.save()
    })
    .then(() => {
      res.send({
        success: true
      })
    })
    .catch((error) => {
      if (req.files) {
        Object.keys(req.files).map((key) => {
          req.files[key].map(async (file) => {
            await unlinkAsync(file.path)
            console.log('file removed: ', file.path)
          })
        })
      }
      res.send({
        success: false,
        message: error.message || 'Somethings went wrong'
      })
      console.error(error)
    })
}

module.exports.putDocuments = function (req, res, next) {
  let user = req.locals.user
  let { idFront, idRear, licenceFront, avatar, insurance, photos } =
    req.files || {}
  let { personalId, licence, vehicle } = req.body || {}

  console.log('req.files', JSON.stringify(req.files))

  let dataUpdated = false
  let needToReview = false
  Promise.resolve(true)
    .then(() => {
      // Personal info update
      if (
        (personalId && (personalId.type || personalId.id)) ||
        idFront ||
        idRear
      ) {
        let update = {
          ..._.pickBy(personalId, _.identity)
        }
        if (idFront) {
          update.frontPhoto = correctPhotoPath(idFront[0].location)
        }
        if (idRear) update.rearPhoto = correctPhotoPath(idRear[0].location)
        if (Object.keys(update).length > 0) {
          update.approved = false
          if (!user.personalId) user.personalId = {}
          _.assign(user.personalId, update)
          dataUpdated = true
          needToReview = true
        }
      }

      // Driving licence update
      if ((licence && licence.expire) || licenceFront) {
        let update = {
          ..._.pickBy(licence, _.identity)
        }
        if (licenceFront)
          update.frontPhoto = correctPhotoPath(licenceFront[0].location)
        if (Object.keys(update).length > 0) {
          update.approved = false
          if (!user.drivingLicence) user.drivingLicence = {}
          _.assign(user.drivingLicence, update)
          dataUpdated = true
          needToReview = true
        }
      }

      // Avatar update
      if (avatar) {
        user.avatar = correctPhotoPath(avatar[0].location)
        dataUpdated = true
      }

      // Car Insurance update
      if (insurance) {
        user.carInsurance = {
          document: correctPhotoPath(insurance[0].location),
          approved: false
        }
        dataUpdated = true
        needToReview = true
      }

      // Vehicle Info update
      if (vehicle || (photos && photos.length > 0)) {
        let update = {
          approved: false,
          ..._.pickBy(vehicle, _.identity)
        }
        if (photos) {
          update.photos = [
            ...user.vehicle.photos,
            ...photos.map((p) => correctPhotoPath(p.location))
          ]
        }
        _.assign(user.vehicle, update)
        if (Object.keys(update).length > 0) {
          dataUpdated = true
          needToReview = true
        }
      }

      if (dataUpdated) {
        if (needToReview) {
          user['status'] = Driver.Status.Pending
          user['documentSent'] = true
        }
        return user.save()
      }
    })
    .then(() => {
      res.send({
        success: true,
        message: dataUpdated ? 'All data updated' : 'Done without any update',
        user
      })
    })
    .catch((error) => {
      console.log(error)
      res.send({
        success: false,
        message: error.message || 'Somethings went wrong'
      })
    })
}

module.exports.putProfile = function (req, res, next) {
  let user = req.locals.user
  let { firstName, lastName, email, mobile, password } = req.body || {}
  let needConfirmMobile = false
  console.log('body', req.body)
  Promise.resolve(true)
    .then(() => {
      let update = _.pickBy(
        {
          firstName,
          lastName,
          email,
          // mobile,
          password
        },
        _.identity
      )
      _.assign(user, update)
      return user.save()
    })
    .then(async () => {
      if (!!mobile) {
        needConfirmMobile = true
        let code = await SmsController.sendMobileConfirmSms(mobile)
        PikCache.mobileCache.set(`driver-mobile-${user._id}`, { mobile, code })
      }
      res.send({
        success: true,
        needConfirmMobile
      })
    })
    .catch((error) => {
      console.log(error)
      res.send({
        success: false,
        message: error.message || 'Somethings went wrong'
      })
    })
}

module.exports.putVehicleInfo = function (req, res, next) {
  let user = req.locals.user
  let { type, plate, color, makeModel, year, deletePhotos=[] } = req.body || {}
  let { insurance, photos=[] } = req.files || {}
  photos = photos.map((p) => correctPhotoPath(p.location))

  Promise.resolve(true)
    .then(() => {
      let needToApprove = false
      let update = _.pickBy(
        { type, plate, color, makeModel, year },
        (val, key) => !!val
      )
      if(Object.keys(update).length > 0 || !!insurance || photos.length>0 || deletePhotos.length>0){
        update.approved = false;
        needToApprove = true;
      }
      update.photos = [
        ...user.vehicle.photos.filter(p => !deletePhotos.includes(p)),
        ...photos
      ]
      if(update.photos.length === 0){
        throw {message: 'Vehicle should have at least one photo'}
      }
      _.assign(user.vehicle, update)

      if(insurance){
        user.carInsurance.approved = false
        user.carInsurance.document = correctPhotoPath(insurance[0].location)
      }

      if(needToApprove) {
        // user.hired = false
        user.documentSent = true;
        user.status = Driver.Status.Pending;
        user.message = {}
      }

      return user.save()
    })
    .then(() => {
      res.send({
        success: true
      })
    })
    .catch((error) => {
      res.send({
        success: false,
        message: error.message || 'Somethings went wrong'
      })
    })
}

module.exports.getDocuments = function (req, res, next) {
  let { personalId, licence, avatar, vehicle, carInsurance } = req.locals.user
  res.send({
    success: true,
    personalId,
    licence,
    avatar,
    vehicle,
    carInsurance: carInsurance ? carInsurance.document : undefined
  })
}

module.exports.updatePersonalDetail = function (req, res, next) {
  let {
    firstName,
    lastName,
    address,
    birthDate,
    gender,
    vehicleType
  } = req.body
  Promise.resolve(true)
    .then(() => {
      if (!firstName) throw { message: 'First name required' }
      if (!lastName) throw { message: 'Last name required' }
      if (!address) throw { message: 'Address required' }
      if (!birthDate) throw { message: 'Birth date required' }
      if (!gender) throw { message: 'Gender (Male/Female) required' }
      if (!vehicleType)
        throw { message: 'Vehicle type (Motor/Car/Pickup) required' }

      let driver = req.locals.user
      _.assign(driver, {
        firstName,
        lastName,
        address,
        birthDate,
        gender,
        vehicleType
      })
      driver.vehicle = { type: vehicleType }
      return driver.save()
    })
    .then(() => {
      res.json({
        success: true
      })
    })
    .catch((error) => {
      res.json({
        success: false,
        message: error.message,
        error
      })
    })
}

module.exports.updatePersonalId = function (req, res, next) {
  let { type, id, frontPhoto, rearPhoto } = req.body
  Promise.resolve(true)
    .then(() => {
      if (!type) throw { message: 'Personal ID type required' }
      if (!id) throw { message: 'ID value required' }
      if (!frontPhoto) throw { message: 'Front photo required' }
      if (!rearPhoto) throw { message: 'Rear photo required' }

      let driver = req.locals.user
      _.assign(driver, { personalId: { type, id, frontPhoto, rearPhoto } })
      return driver.save()
    })
    .then(() => {
      res.json({
        success: true
      })
    })
    .catch((error) => {
      res.json({
        success: false,
        message: error.message,
        error
      })
    })
}

module.exports.updateDrivingLicence = function (req, res, next) {
  let { expire, frontPhoto } = req.body
  Promise.resolve(true)
    .then(() => {
      if (!expire) throw { message: 'Expiration date required' }
      if (!frontPhoto) throw { message: 'Front photo required' }

      let driver = req.locals.user
      _.assign(driver, { drivingLicence: { expire, frontPhoto } })
      return driver.save()
    })
    .then(() => {
      res.json({
        success: true
      })
    })
    .catch((error) => {
      res.json({
        success: false,
        message: error.message,
        error
      })
    })
}

module.exports.updateAvatar = function (req, res, next) {
  let { avatar } = req.body
  Promise.resolve(true)
    .then(() => {
      if (!avatar) throw { message: 'Profile photo required' }

      let driver = req.locals.user
      _.assign(driver, { avatar })
      return driver.save()
    })
    .then(() => {
      res.json({
        success: true
      })
    })
    .catch((error) => {
      res.json({
        success: false,
        message: error.message,
        error
      })
    })
}

module.exports.deleteVehiclePhoto = function (req, res, next) {
  let { photo } = req.body
  let { user } = req.locals
  console.log(req.body)

  Promise.resolve(true)
    .then(() => {
      if (user.vehicle.photos.length <= 1) {
        throw { message: 'Vehicle most have at least one photo' }
      }
      let index = user.vehicle.photos.findIndex((p) => p === photo)
      if (index < 1) throw { message: 'Photo not found' }
      user.vehicle.photos.splice(index, 1)
      return user.save()
    })
    .then(() => {
      res.send({
        success: true,
        user
      })
    })
    .catch((error) => {
      res.send({
        success: false,
        message: error.message || 'Somethings went wrong'
      })
    })
}

module.exports.updateStatus = function (req, res, next) {
  let driver = req.locals.user
  let { status } = req.body
  Promise.resolve(driver)
    .then(async (driver) => {
      if (driver.status !== Driver.Status.Approved) driver['online'] = false
      else driver['online'] = status.toLowerCase() === 'online'
      if (!driver.online) {
        await DriverOnlineLocation.deleteMany({ driver: driver._id })
      }
      return driver.save()
    })
    .then(() => {
      if (driver.status !== Driver.Status.Approved)
        throw { message: 'Your account is not approved yet' }
      res.send({
        success: true
      })
    })
    .catch((error) => {
      res.send({
        success: false,
        message: error.message,
        error
      })
    })
}

module.exports.getJob = function (req, res, next) {
  let driver = req.locals.user

  Order.findOne({
    $or: [
      { status: Order.Status.Progress },
      {
        status: Order.Status.Returned,
        'time.returnComplete': { $in: [null, undefined] }
      }
    ],
    driver: driver._id
  })
    .populate(['sender', 'receiver', 'driver'])
    .then(async (order) => {
      if (order) return order
      if (driver.busy) {
        driver.busy = false
        await driver.save()
      }
      let orderSuggest = await OrderSuggest.findOne({
        driver: driver._id,
        ignored: false
      }).populate({
        path: 'order',
        populate: [['sender', 'receiver', 'driver']]
      })

      if(orderSuggest) {
        // check suggestion expired or not
        let t1 = moment(orderSuggest.createdAt),
          t2 = moment()
        let suggestionSecondsPassed = Math.ceil(
          moment.duration(t2.diff(t1)).asSeconds()
        )
        if (suggestionSecondsPassed >= SUGGESTION_EXPIRE_SECONDS) {
          orderSuggest.ignored = true
          await orderSuggest.save()
          orderSuggest = null
        }
      }

      return orderSuggest ? orderSuggest.order : null
    })
    // .then(order => {
    //   if (order)
    //     return order;
    //   else
    //     return Order.findOne({
    //       _id: {$nin: ignore},
    //       status: Order.Status.Pending
    //     })
    // })
    .then((order) => {
      res.json({
        success: true,
        order
      })
    })
    .catch((error) => {
      res.send({
        success: false,
        message: error.message,
        error
      })
    })
}

module.exports.getSuggestionTimeInfo = function (req, res, next) {
  let { order: orderId } = req.params
  let { user } = req.locals

  OrderSuggest.findOne({
    order: orderId,
    driver: user._id
  })
    .then((suggest) => {
      if (!suggest) throw userError(ErrorCodes.SERVER_SIDE_ERROR)

      let t1 = moment(suggest.createdAt),
        t2 = moment()

      res.send({
        success: true,
        timeInfo: {
          expireIn: SUGGESTION_EXPIRE_SECONDS,
          passed: Math.ceil(moment.duration(t2.diff(t1)).asSeconds())
        }
      })
    })
    .catch((error) => {
      console.log(error)
      let { message, errorCode } = error
      res.send({
        success: false,
        message: message || 'Somethings went wrong',
        errorCode: errorCode || ErrorCodes.SERVER_SIDE_ERROR
      })
    })
}

module.exports.ignoreSuggest = function (req, res, next) {
  let { order: orderId } = req.body
  let driver = req.locals.user

  OrderSuggest.findOne({
    order: orderId,
    driver: driver._id
  })
    .then(async (orderSuggest) => {
      if (!orderSuggest) throw userError(ErrorCodes.ERROR_ORDER_NOT_FOUND)
      orderSuggest.ignored = true
      await orderSuggest.save()
      await Driver.update({_id: driver._id}, {$inc: {"jobs.ignore": 1}})
      res.send({ success: true })
    })
    .catch((error) => {
      let { message, errorCode } = error
      res.send({
        success: false,
        message: message || 'Somethings went wrong',
        errorCode: errorCode || ErrorCodes.SERVER_SIDE_ERROR
      })
    })
}

module.exports.assignDriver = function (req, res, next) {
  let { order: orderId } = req.body
  let driver = req.locals.user
  let order = null

  Order.findOne({ _id: orderId })
    .populate(['sender', 'receiver'])
    .then(async (doc) => {
      if (!doc)
        throw userError(ErrorCodes.ERROR_ORDER_NOT_FOUND)
      order = doc;
      if (order.status !== Order.Status.Pending){
        throw userError(ErrorCodes.ERROR_ORDER_ALREADY_ASSIGNED_TO_DRIVER)
      }
      order.status = Order.Status.Progress
      order.driver = driver
      order.time = {
        create: order.time.create,
        confirm: order.time.confirm,
        driverAssign: Date.now()
      }

      return order.save()
    })
    .then(async () => {
      await EventBus.emit(EventBus.EVENT_ORDER_DRIVER_ASSIGNED, { order })
      await order.save()
      res.send({ success: true, order })
    })
    .catch((error) => {
      let { message, errorCode } = error
      console.error(error)
      res.send({
        success: false,
        message: message || 'Somethings went wrong',
        errorCode: errorCode || ErrorCodes.SERVER_SIDE_ERROR
      })
    })
}

module.exports.getOrderDirection = function (req, res, next) {
  let { order: orderId } = req.params
  let { user } = req.locals
  let { type, location } = req.query
  let order = null

  Order.findOne({
    _id: orderId,
    driver: user._id
  })
    .then((doc) => {
      if (!doc)
        throw userError(ErrorCodes.ERROR_ORDER_NOT_FOUND)
      if(!['pickup', 'delivery'].includes(type))
        throw userError(ErrorCodes.INVALID_REQUEST_PARAMS, 'Type of direction should be pickup/delivery')

      order = doc

      if (![Order.Status.Progress, Order.Status.Returned].includes(order.status)) {
        throw userError(ErrorCodes.ERROR_NOT_PERMISSION)
      }

      let { lat, lng } = order[type].address.geometry.location
      return GoogleApi.directions(location, `${lat},${lng}`)
    })
    .then((direction) => {
      res.send({ success: true, direction })
    })
    .catch((error) => {
      let { message, errorCode } = error
      res.send({
        success: false,
        message: message || 'Somethings went wrong',
        errorCode: errorCode || ErrorCodes.SERVER_SIDE_ERROR
      })
    })
}

module.exports.putOrderTrack = function (req, res, next) {
  let { order: orderId } = req.params
  let driver = req.locals.user
  let {headingTo, timeToArrive, location} = req.body

  Promise.resolve(true)
    .then(() => {
      if(
        !['pickup', 'delivery', 'return'].includes(headingTo)
        || isNaN(timeToArrive)
        || !location || isNaN(location.latitude) || isNaN(location.longitude)
      ){
        throw userError(ErrorCodes.INVALID_REQUEST_PARAMS)
      }

      return Order.findOne({_id: orderId, driver})
    })
    .then(async (order) => {
      if (!order)
        throw userError(ErrorCodes.ERROR_ORDER_NOT_FOUND)

      if (order.status !== Order.Status.Progress) {
        throw userError(ErrorCodes.PERMISSION_DENIED)
      }

      let orderTrack = await OrderTrack.findOne({order, driver})

      if(!orderTrack){
        console.log('new order track')
        orderTrack = new OrderTrack({
          order,
          driver,
          history: {
            pickup: [],
            delivery: [],
            return: []
          }
        })
      }

      const getSecondsTitle = seconds => {
        if(seconds < 60)
          return `One minute`
        let minutes = Math.ceil(seconds / 60)
        if(minutes < 60)
          return `${minutes} minute`
        let hours = Math.ceil(minutes / 60)
        minutes = minutes % 60
        return `${hours} hour${hours>1?'s':''} ` + (minutes > 0 ? `${minutes} minute${minutes>1?'s':''}` : '')
      }

      orderTrack.headingTo = headingTo
      orderTrack.timeToArrive = {
        text: getSecondsTitle(timeToArrive),
        value: timeToArrive
      }
      if(timeToArrive <= 60){
        await EventBus.emit(EventBus.EVENT_DRIVER_ALMOST_ARRIVE, {order, headingTo})
      }
      orderTrack.history[headingTo].push(location)
      orderTrack.history.current = location

      return orderTrack.save()

    })
    .then(() => {
      res.send({
        success: true
      })
    })
    .catch((error) => {
      let { message, errorCode } = error
      console.log('DriverController.putOrderTrack', error)
      res.send({
        success: false,
        message: message || 'Somethings went wrong',
        errorCode: errorCode || ErrorCodes.SERVER_SIDE_ERROR
      })
    })

}

module.exports.setPickupArrival = function (req, res, next) {
  let { order: orderId } = req.body
  let { user } = req.locals
  let order = null

  Order.findOne({
    _id: orderId,
    driver: user._id
  })
    .populate(['sender', 'receiver'])
    .then((doc) => {
      if (!doc) throw userError(ErrorCodes.ERROR_ORDER_NOT_FOUND)
      order = doc

      if (!!order.time.pickupArrival) {
        throw userError(ErrorCodes.ERROR_ORDER_ALREADY_PICKED_UP)
      }

      order.time.pickupArrival = Date.now()

      return order.save()
    })
    .then(async () => {
      await EventBus.emit(EventBus.EVENT_ORDER_PICKUP_ARRIVAL, { order })
      await order.save()
      res.send({ success: true, order })
    })
    .catch((error) => {
      let { message, errorCode } = error
      res.send({
        success: false,
        message: message || 'Somethings went wrong',
        errorCode: errorCode || ErrorCodes.SERVER_SIDE_ERROR
      })
    })
}

module.exports.postTrackingCode = function (req, res, next) {
  let { order: orderId, trackingCode } = req.body
  let { user } = req.locals
  let order = null

  Order.findOne({
    _id: orderId,
    driver: user._id
  })
    .populate(['sender', 'receiver'])
    .then((doc) => {
      if (!doc) throw userError(ErrorCodes.ERROR_ORDER_NOT_FOUND)
      order = doc

      if (!trackingCode)
        throw userError(ErrorCodes.ERROR_TRACKING_CODES_MISMATCH)

      let packageIndex = order.packages.findIndex(
        (pkg) => trackingCode === pkg.trackingCode
      )

      if (packageIndex < 0) {
        order.addLog(`Wrong code`)
        order.save()
        throw userError(ErrorCodes.ERROR_TRACKING_CODES_MISMATCH)
      }

      order.packages[packageIndex].trackingConfirmation = new Date()

      return order.save()
    })
    .then(async () => {
      res.send({ success: true, order })
    })
    .catch((error) => {
      let { message, errorCode } = error
      res.send({
        success: false,
        message: message || 'Somethings went wrong',
        errorCode: errorCode || ErrorCodes.SERVER_SIDE_ERROR
      })
    })
}

module.exports.setPickupCompleted = function (req, res, next) {
  let { order: orderId } = req.body
  let { user } = req.locals
  let order = null

  Order.findOne({
    _id: orderId,
    driver: user._id
  })
    .populate(['sender', 'receiver'])
    .then(async (doc) => {
      if (!doc) throw userError(ErrorCodes.ERROR_ORDER_NOT_FOUND)
      order = doc

      if (order.senderModel === Business.COLLECTION_NAME) {
        if (order.packages.findIndex((p) => !p.trackingConfirmation) > 0)
          throw userError(ErrorCodes.ERROR_TRACKING_CODES_MISMATCH)
      }
      if (!!order.time.pickupComplete) {
        throw userError(ErrorCodes.ERROR_ORDER_ALREADY_PICKED_UP)
      }

      order.time.pickupComplete = Date.now()

      await EventBus.emit(EventBus.EVENT_ORDER_PICKUP_COMPLETE, { order })
      await order.save()

      res.send({ success: true, order })
    })
    .catch((error) => {
      let { message, errorCode } = error
      res.send({
        success: false,
        message: message || 'Somethings went wrong',
        errorCode: errorCode || ErrorCodes.SERVER_SIDE_ERROR
      })
    })
}

module.exports.setDeliverArrival = function (req, res, next) {
  let { order: orderId } = req.body
  let driver = req.locals.user
  let order = null

  Order.findOne({
    _id: orderId,
    driver: driver._id
  })
    .populate(['sender', 'receiver'])
    .then((doc) => {
      if (!doc) throw userError(ErrorCodes.ERROR_ORDER_NOT_FOUND)

      order = doc
      order.time.deliveryArrival = Date.now()

      return order.save()
    })
    .then(async () => {
      await EventBus.emit(EventBus.EVENT_ORDER_DELIVERY_ARRIVAL, { order })
      await order.save()
      res.send({ success: true, order })
    })
    .catch((error) => {
      let { message, errorCode } = error
      res.send({
        success: false,
        message: message || 'Somethings went wrong',
        errorCode: errorCode || ErrorCodes.SERVER_SIDE_ERROR
      })
    })
}

module.exports.setDeliverComplete = function (req, res, next) {
  let { order: orderId, confirmationCode, fullName, isReturn } = req.body
  let { photo } = req.files || {}
  let driver = req.locals.user
  let order = null

  Order.findOne({
    _id: orderId,
    driver: driver._id
  })
    .populate(['sender', 'receiver', 'driver'])
    .then((doc) => {
      if (!doc) throw userError(ErrorCodes.ERROR_ORDER_NOT_FOUND)
      order = doc
      if (order.receiver.status === Customer.Statuses.Registered) {
        if (order.confirmationCode !== confirmationCode)
          throw userError(ErrorCodes.ERROR_DELIVERY_CONFIRMATION_CODE_MISMATCH)
      } else {
        if (!fullName || !photo)
          throw userError(ErrorCodes.MISSING_REQUEST_PARAMS)
      }
      order.delivery.confirm =
        order.receiver.status === Customer.Statuses.Registered
          ? {
              qrCode: confirmationCode
            }
          : {
              fullName,
              photo: correctPhotoPath(photo[0].location)
            }
      order.status = Order.Status.Delivered
      order.time.deliveryComplete = Date.now()
    })
    .then(async () => {
      await EventBus.emit(EventBus.EVENT_ORDER_DELIVERY_COMPLETE, { order })
      await EventBus.emit(EventBus.EVENT_ORDER_COMPLETED, { order })
      await EventBus.emit(EventBus.EVENT_ORDER_PAYMENT_FINALIZE, { order })

      await order.save()
      res.send({ success: true, order })
    })
    .catch((error) => {
      console.log(error)
      let { message, errorCode } = error
      res.send({
        success: false,
        message: message || 'Somethings went wrong',
        errorCode: errorCode || ErrorCodes.SERVER_SIDE_ERROR
      })
    })
}

module.exports.setReturnComplete = function (req, res, next) {
  let { order: orderId, confirmationCode } = req.body
  let driver = req.locals.user
  let order = null
  console.log({ orderId, confirmationCode })
  Order.findOne({
    _id: orderId,
    driver: driver._id
  })
    .populate(['sender', 'receiver'])
    .then((doc) => {
      if (!doc) throw userError(ErrorCodes.ERROR_ORDER_NOT_FOUND)
      order = doc
      if (order.confirmationCode !== confirmationCode)
        throw userError(ErrorCodes.ERROR_DELIVERY_CONFIRMATION_CODE_MISMATCH)
      order.delivery.confirm = {
        qrCode: confirmationCode
      }
      order.time.returnComplete = Date.now()
    })
    .then(async () => {
      await EventBus.emit(EventBus.EVENT_ORDER_RETURN_COMPLETE, { order })
      await EventBus.emit(EventBus.EVENT_ORDER_COMPLETED, { order })
      await EventBus.emit(EventBus.EVENT_ORDER_PAYMENT_FINALIZE, { order })
      await order.save()
      res.send({ success: true, order })
    })
    .catch((error) => {
      let { message, errorCode } = error
      res.send({
        success: false,
        message: message || 'Somethings went wrong',
        errorCode: errorCode || ErrorCodes.SERVER_SIDE_ERROR
      })
    })
}

module.exports.cancelOrder = function (req, res, next) {
  let { order: orderId, customerNoShow, cancelingReason } = req.body
  let driver = req.locals.user
  let order = null

  Order.findOne({
    _id: orderId,
    driver: driver._id
  })
    .populate(['sender', 'receiver'])
    .then(async (doc) => {
      if (!doc) throw userError(ErrorCodes.ERROR_ORDER_NOT_FOUND)
      order = doc
      await Order.cancelByDriver(order, driver, customerNoShow, cancelingReason)
      if(!customerNoShow){
        await Driver.update({_id: driver._id}, {$inc: {"jobs.cancel": 1}})
      }
      await EventBus.emit(EventBus.EVENT_ORDER_PAYMENT_FINALIZE, { order })
      driver.busy = false
      await driver.save()

      return order.save()
    })
    .then(() => {
      res.send({ success: true, order })
    })
    .catch((error) => {
      let { message, errorCode } = error
      res.send({
        success: false,
        message: message || 'Somethings went wrong',
        errorCode: errorCode || ErrorCodes.SERVER_SIDE_ERROR
      })
    })
}

module.exports.getEarnings = function (req, res, next) {
  let driver = req.locals.user
  Promise.all([
    Order.find({
      driver: driver._id,
      status: {
        $in: [
          Order.Status.Delivered,
          Order.Status.Canceled,
          Order.Status.Returned,
          Order.Status.Progress
        ]
      }
    }),
    CustomValue.find({
      owner: driver._id,
      deleted: false,
    })
  ])
    .then(([orders, customValues]) => {
      res.send({
        success: true,
        orders,
        customValues
      })
    })
    .catch((error) => {
      let { message, errorCode } = error
      res.send({
        success: false,
        message: message || 'Somethings went wrong',
        errorCode: errorCode || ErrorCodes.SERVER_SIDE_ERROR
      })
    })
}

module.exports.putLocation = function (req, res, next) {
  let driver = req.locals.user
  let { location } = req.body || {}
  Promise.resolve(true)
    .then(async () => {
      if (!location || !location.coords)
        throw userError(ErrorCodes.MISSING_REQUEST_PARAMS)
      if(driver.online && driver.status === Driver.Status.Approved){
        await driver.updateLocation(location)
        await driver.save()
      }
      res.send({
        success: true
      })
    })
    .catch((error) => {
      let { message, errorCode } = error
      res.send({
        success: false,
        message: message || 'Somethings went wrong',
        errorCode: errorCode || ErrorCodes.SERVER_SIDE_ERROR
      })
    })
}

module.exports.registerDevice = function (req, res, next) {
  let { user } = req.locals
  let deviceInfo = req.body
  Promise.resolve(true)
    .then(() => {
      if (!deviceInfo.fcmToken) throw userError(Codes.MISSING_REQUEST_PARAMS)
      return UserDevice.findOne({
        fcmToken: deviceInfo.fcmToken,
        owner: user
      })
    })
    .then(async (userDevice) => {
      if (!userDevice) {
        userDevice = new UserDevice({
          ownerModel: Driver.COLLECTION_NAME,
          owner: user,
          ...deviceInfo
        })
        await userDevice.save()
      }
      res.send({
        success: true
      })
    })
    .catch((error) => {
      console.log(error)
      let { message, errorCode } = error
      res.send({
        success: false,
        message: message || 'Server Side error',
        errorCode: errorCode || Codes.SERVER_SIDE_ERROR
      })
    })
}

module.exports.postOrderChat = function (req, res, next) {
  let { order: orderId } = req.params
  let driver = req.locals.user
  let { message, customer: customerId } = req.body
  let { photo=[] } = req.files || {}
  photo = photo.map(p => correctPhotoPath(p.location))


  Order.findOne({
    _id: orderId,
    driver: driver._id
  })
    .populate(['sender', 'receiver'])
    .then(async (order) => {
      if (!order) throw userError(ErrorCodes.ERROR_ORDER_NOT_FOUND)
      if (!message) throw userError(ErrorCodes.MISSING_REQUEST_PARAMS)
      let hasPhoto = false,
        photoUri = ''
      if (photo.length > 0) {
        hasPhoto = true
        photoUri = photo[0]
      }

      let newMessage = {
        text: message,
        timestamp: Date.now(),
        ...(hasPhoto ? { image: photoUri } : {}),
        sender: {
          _id: driver._id.toString(),
          type: Driver.COLLECTION_NAME,
          name: driver.name
        },
        data: { order: order._id.toString() }
      }
      let increment = firebaseAdmin.firestore.FieldValue.increment(1)
      const orderChat = firestore
        .collection('pik_delivery_order_chats')
        .doc(`order_${order._id}_driver_${driver._id}_customer_${customerId}`)
      await orderChat.set(
        {
          order: order._id.toString(),
          orderId: order.id,
          userList: {
            [driver._id.toString()]:{
              type: Driver.COLLECTION_NAME,
              avatar: driver.avatar,
              name: driver.name
            },
            ...(customerId === order.sender._id.toString() ? {
              [order.sender._id.toString()]: {
                type: Customer.COLLECTION_NAME,
                avatar: order.sender.avatar,
                name: order.sender.name,
                unread: increment
              },
            } : {
              [order.receiver._id.toString()]: {
                type: Customer.COLLECTION_NAME,
                avatar: order.receiver.avatar,
                name: order.receiver.name,
                unread: increment
              }
            })
          },
          lastMessage: newMessage
        },
        { merge: true }
      )
      await orderChat.collection('messages')
        .add(newMessage)

      if([order.sender._id, order.receiver._id].map(id=>id.toString()).includes(customerId)){
        NotificationController.sendNotificationToUsers(
          [customerId],
          {
            title: driver.name,
            body: message,
          },
          {
            data: {
              orderChat: orderId
            }
          }
        )
      }

      res.send({
        success: true
      })
    })
    .catch((error) => {
      let { message, errorCode } = error
      console.error(error)
      res.send({
        success: false,
        message: message || 'Somethings went wrong',
        errorCode: errorCode || ErrorCodes.SERVER_SIDE_ERROR
      })
    })
}

module.exports.postOrderChatRead = function (req, res, next) {
  let { order: orderId } = req.params
  let driver = req.locals.user
  let { customer: customerId } = req.body


  Order.findOne({
    _id: orderId,
    driver: driver._id,
    $or:[
      {sender: customerId},
      {receiver: customerId}
    ]
  })
    .populate(['sender', 'receiver'])
    .then(async (order) => {
      if (!order) throw userError(ErrorCodes.ERROR_ORDER_NOT_FOUND)

      const orderChat = firestore
        .collection('pik_delivery_order_chats')
        .doc(`order_${order._id}_driver_${driver._id}_customer_${customerId}`)
      await orderChat.set(
        {
          userList: {
            [driver._id.toString()]:{
              unread: 0
            }
          },
        },
        { merge: true }
      )

      res.send({
        success: true
      })
    })
    .catch((error) => {
      let { message, errorCode } = error
      console.error(error)
      res.send({
        success: false,
        message: message || 'Somethings went wrong',
        errorCode: errorCode || ErrorCodes.SERVER_SIDE_ERROR
      })
    })
}

module.exports.getBankAccount = function (req, res, next) {
  let { user } = req.locals

  BankAccount.findOne({
    owner: user._id
  })
    .then((account) => {
      res.send({
        success: !!account,
        account,
        message: !account ? 'Account not found' : 'Account found'
      })
    })
    .catch((error) => {
      let { message, errorCode } = error
      res.send({
        success: false,
        message: message || 'Somethings went wrong',
        errorCode: errorCode || ErrorCodes.SERVER_SIDE_ERROR
      })
    })
}

module.exports.postBankAccount = function (req, res, next) {
  let { user } = req.locals
  let { accountName, accountNumber, accountType, accountBank } = req.body

  Promise.resolve(true)
    .then(() => {
      if (!accountName || !accountNumber || !accountType || !accountBank)
        throw userError(ErrorCodes.MISSING_REQUEST_PARAMS)

      return BankAccount.update(
        {
          owner: user._id
        },
        {
          $set: {
            owner: user,
            accountName,
            accountNumber,
            accountType,
            accountBank
          }
        },
        {
          upsert: true
        }
      )
    })
    .then(async () => {
      res.send({
        success: true
      })
    })
    .catch((error) => {
      let { message, errorCode } = error
      res.send({
        success: false,
        message: message || 'Somethings went wrong',
        errorCode: errorCode || ErrorCodes.SERVER_SIDE_ERROR
      })
    })
}

module.exports.getFaqs = function (req, res, next) {
  Promise.resolve(true)
    .then(async () => {
      let categories = await FaqCategories.find({
        type: 'Driver',
        published: true
      })
      let faqs = await Faq.find({ type: 'Driver', published: true })
      res.send({
        success: true,
        categories: categories.map(({ _id, category }) => ({
          _id,
          title: category
        })),
        faqs: faqs.map(({ _id, question, answer, category }) => ({
          _id,
          question,
          answer,
          category
        }))
      })
    })
    .catch((error) => {
      let { message, errorCode } = error
      res.send({
        success: false,
        message: message || 'Somethings went wrong',
        errorCode: errorCode || ErrorCodes.SERVER_SIDE_ERROR
      })
    })
}

module.exports.postContactUs = function (req, res, next) {
  let { user } = req.locals
  let { orderId, category, details } = req.body
  let { photos = [] } = req.files || {}
  photos = photos.map(({key, location}) => ({
    filename: key,
    url: correctPhotoPath(location)
  }))

  Promise.resolve(true)
    .then(async () => {
      if (!category || !details)
        throw userError(Codes.MISSING_REQUEST_PARAMS)

      category = await FaqCategories.findById(category)
      if (!category) throw userError(Codes.ERROR_FAQ_CATEGORY_NOT_FOUND)

      let order = null
      if (orderId) {
        order = await Order.findById(orderId)
        if (!order) throw userError(Codes.ERROR_ORDER_NOT_FOUND)
      }


      let success = await EmailController.sendContactUs('Driver', user, category, order, details, photos)

      res.send({
        success: true,
        message: success ? "" : "Problem when sending contact us email"
      })
    })
    .catch((error) => {
      console.log(error)
      let { message, errorCode } = error
      res.send({
        success: false,
        message: message || 'Somethings went wrong',
        errorCode: errorCode || Codes.SERVER_SIDE_ERROR
      })
    })
}

module.exports.postSupportTicket = function (req, res, next) {
  let { user } = req.locals
  let { orderId, category, details } = req.body
  let { photos = [] } = req.files || {}
  photos = photos.map((p) => correctPhotoPath(p.location))

  console.log({
    orderId,
    category,
    details,
    photos,
    collection: process.env.SUPPORT_TICKETS
  })

  Promise.resolve(true)
    .then(async () => {
      if (!category || !details)
        throw userError(ErrorCodes.MISSING_REQUEST_PARAMS)

      category = await FaqCategories.findById(category)
      if (!category) throw userError(ErrorCodes.ERROR_FAQ_CATEGORY_NOT_FOUND)

      let order = null
      if (orderId) {
        order = await Order.findById(orderId)
        if (!order) throw userError(ErrorCodes.ERROR_ORDER_NOT_FOUND)
      }
      if (!!orderId) {
        let ticket = firestore
          .collection(process.env.SUPPORT_TICKETS)
          .doc(`driver_${user._id}_order_${orderId}`)
        await ticket.set(
          {
            userList: {
              [user._id.toString()]:{
                avatar: user.avatar,
                name: user.name
              }
            },
            _id: user._id.toString(),
            type: 'driver',
            nickname: `${user.name}`,
            photoUrl: user.avatar,
            phone: user.mobile,
            email: user.email,
            isClosed: false
          },
          { merge: true }
        )
        await ticket.collection('messages').add({
          text: details,
          sender: {
            _id: user._id.toString(),
            type: Driver.COLLECTION_NAME,
            name: user.name
          },
          ...(photos.length > 0 ? { photos } : {}),
          data: {
            order: orderId,
            orderID: order.id,
            category: category.category
          },
          timestamp: Date.now()
        })
      } else {
        let ticket = firestore
          .collection(process.env.SUPPORT_TICKETS)
          .doc(`driver_${user._id}_general_${Date.now()}`)
        await ticket.set(
          {
            userList: {
              [user._id.toString()]:{
                avatar: user.avatar,
                name: user.name
              }
            },
            _id: user._id.toString(),
            type: 'driver',
            nickname: `${user.name}`,
            photoUrl: user.avatar,
            phone: user.mobile,
            email: user.email,
            isClosed: false
          },
          { merge: true }
        )
        await ticket.collection('messages').add({
          text: details,
          sender: {
            _id: user._id.toString(),
            type: Driver.COLLECTION_NAME,
            name: user.name
          },
          ...(photos.length > 0 ? { photos } : {}),
          data: {
            category: category.category
          },
          timestamp: Date.now()
        })
      }

      return res.send({
        success: true
      })
    })
    .catch((error) => {
      console.log(error)
      let { message, errorCode } = error
      res.send({
        success: false,
        message: message || 'Somethings went wrong',
        errorCode: errorCode || ErrorCodes.SERVER_SIDE_ERROR
      })
    })
}

module.exports.test = async function (req, res, next) {
  try {

    console.log('getting list ...')
    let userId = "60152b50610bec4326bc48a2"
    let orderId = "60284de74d95ac7c8033c293"
    const chatList = firestore.collection('pik_delivery_order_chats')
      .where(`userList.${userId}`, '!=', false)
      // .where(`order`, '==', orderId)

    let querySnapshot = await chatList.get()

    res.send({
      success: true,
      result: querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    })

  }
  catch (e) {
    res.send(e)
  }
}
