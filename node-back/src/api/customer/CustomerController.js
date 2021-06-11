const moment = require('moment')
const {firestore, firebaseAdmin} = require('../../fcm');
const fetch = require('node-fetch')
const _ = require('lodash')
const randomString = require('../../utils/randomString')
const Banner = require('../../models/Banner')
const Order = require('../../models/Order')
const Driver = require('../../models/Driver')
const Customer = require('../../models/Customer')
const Business = require('../../models/Business')
const CustomTimeFrame = require('../../models/CustomTimeFrame')
const UserDevice = require('../../models/UserDevice')
const SavedAddress = require('../../models/SavedAddress')
const Faq = require('../../models/Faq')
const FaqCategories = require('../../models/FaqCategories')
const passwordUtils = require('../../utils/passwordUtil')
const SmsController = require('../../controllers/SmsController')
const PriceController = require('../../controllers/PriceController')
const { omit, pick } = require('lodash')
const { caseInsensitive } = require('../../utils/queryUtils')
const { userError, Codes } = require('../../messages/userMessages')
const GoogleApi = require('../../utils/googleApi')
const Validator = require('../../validator')
const EmailController = require('../../controllers/EmailController')
const NotificationController = require('../../controllers/NotificationController')
const PaymentController = require('../../controllers/PaymentController')
const EventBus = require('../../eventBus')
const PikCache = require('../../pik-cache')

module.exports.register = function (req, res, next) {
  let userId = req.body.userId
  let customerInfo = pick(req.body, [
    'firstName',
    'lastName',
    'email',
    'mobile',
    'password'
  ])
  Object.keys(customerInfo).map((key) => {
    customerInfo[key] = customerInfo[key].trim()
  })
  customerInfo = _.pickBy(customerInfo, _.identity)

  /** disable password check for social user registeration*/
  if (!customerInfo.mobile || !customerInfo.email /**|| !customerInfo.password*/) {
    res.send({
      success: false,
      ...userError(Codes.MISSING_REQUEST_PARAMS)
    })
    return
  }

  let customer = null
  Promise.resolve(true)
    .then(async () => {
      if(userId){
        customer = await Customer.findById(userId)
        if (!customer)
          throw userError(Codes.ERROR_CUSTOMER_NOT_FOUND)
        if (customer.status === Customer.Statuses.Registered)
          throw userError(Codes.ERROR_CUSTOMER_ALREDY_REGISTERED)
      }
      else{
        customer = await
          Customer.findOne({
            $or: [
              { mobile: customerInfo.mobile.trim() },
              { email: caseInsensitive(customerInfo.email.trim()) }
            ]
          })
        if (customer && customer.status === Customer.Statuses.Registered)
          throw userError(Codes.ERROR_CUSTOMER_ALREDY_REGISTERED)
        if(!customer)
          customer = new Customer(customerInfo)
      }
      return SmsController.sendMobileConfirmSms(customerInfo.mobile)
    })
    .then((confirmCode) => {
      if(!!customerInfo.password)
        customer['password'] = customerInfo.password
      customer['email'] = customerInfo.email

      PikCache.mobileCache.set(`customer-mobile-${customer._id}`, {
        mobile: customerInfo.mobile,
        code: confirmCode
      })
      return customer.save()
    })
    .then(() => {
      res.json({
        success: true,
        user: customer
      })
    })
    .catch(({ message, errorCode }) => {
      res.json({
        success: false,
        message: message || 'Server side error',
        errorCode
      })
    })
}

module.exports.confirm = function (req, res, next) {
  let { userId, confirmCode } = req.body
  let customer = null
  Customer.findById(userId)
    .then(async (_customer) => {
      if (!_customer) throw { message: 'User not found' }
      customer = _customer
      let confirmation = PikCache.mobileCache.get(`customer-mobile-${customer._id}`)
      // TODO [STA]: code verification disabled temporarily
      if (!confirmation /*|| confirmation.code !== confirmCode*/)
        throw { message: 'Incorrect confirmation code' }
      customer.mobile = confirmation.mobile
      customer.mobileConfirmed = true
      if(customer['status'] === Customer.Statuses.NotRegistered) {
        customer['status'] = Customer.Statuses.Registered
        if(!!customer.email) {
          await EventBus.emit(EventBus.EVENT_CUSTOMER_EMAIL_ASSIGN, {customer})
        }
      }
      return customer.save()

    })
    .then(() => {
      res.json({
        success: true,
        token: Customer.createSessionToken(customer._id)
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

module.exports.putProfile = function (req, res, next) {
  let user = req.locals.user
  let { firstName, lastName, email, mobile, password } = req.body || {}
  let {avatar} = req.files || {};
  Promise.resolve(true)
    .then(async () => {
      if(!!email){
        email = email.trim().toLowerCase()
        let alreadyExist = await Customer.findOne({email: caseInsensitive(email)})
        if(alreadyExist){
          if(alreadyExist.email === user.email){
            email = undefined
          }
          else{
            throw userError(Codes.ERROR_EMAIL_ALREADY_TAKEN)
          }
        }
      }
      let update = _.pickBy(
        { firstName, lastName, email, password },
        _.identity
      )
      _.assign(user, update)
      if(avatar)
        user.avatar = correctPhotoPath(avatar[0].location)
      if(!!mobile){
        let c0 = await Customer.findByMobile(mobile)
        if(c0){
          throw userError(Codes.ERROR_MOBILE_ALREADY_TAKEN)
        }
        let confirmCode = await SmsController.sendMobileConfirmSms(mobile)
        PikCache.mobileCache.set(`customer-mobile-${user._id}`, {
          mobile,
          code: confirmCode
        })
      }
      if(!!email){
        await EventBus.emit(EventBus.EVENT_CUSTOMER_EMAIL_ASSIGN, {customer: user})
      }
      return user.save()
    })
    .then(() => {
      res.send({
        success: true
      })
    })
    .catch((error) => {
      console.error(error)
      res.send({
        success: false,
        message: error.message || 'Somethings went wrong'
      })
    })
}

module.exports.recoverPassword = function (req, res, next) {
  let { step, email, securityCode, password } = req.body

  Customer.findOne({ email: caseInsensitive(email.trim()) })
    .select('+emailConfirmCode')
    .then(async (customer) => {
      if (!customer) throw userError(Codes.ERROR_CUSTOMER_NOT_FOUND)
      switch (step) {
        case 0:
          customer.emailConfirmCode = randomString(6)
          let emailSent = await EmailController.sendPasswordRecoveryEmail(
            customer.email,
            customer.emailConfirmCode
          )
          if (!emailSent) {
            throw userError(Codes.SERVER_SIDE_ERROR, 'Problem in sending email')
          }
          customer.save()
          break
        case 1:
          if (
            customer.emailConfirmCode.toLowerCase() !==
            securityCode.toLowerCase()
          )
            throw userError(Codes.ERROR_PASSWORD_RECOVERY_CODE_INCORRECT)
          break
        case 2:
          if (
            customer.emailConfirmCode.toLowerCase() !==
            securityCode.toLowerCase()
          )
            throw userError(Codes.ERROR_PASSWORD_RECOVERY_CODE_INCORRECT)

          customer.password = password
          customer.save()
          break
      }
      res.send({
        success: true,
        user: omit(customer.toJSON(), ['password']),
        token: Customer.createSessionToken(customer._id)
      })
    })
    .catch((error) => {
      let { message, errorCode } = error
      res.send({
        success: false,
        message: message || 'Somethings went wrong',
        errorCode: errorCode || Codes.SERVER_SIDE_ERROR
      })
    })
}

module.exports.signIn = function (req, res, next) {
  let { email, password } = req.body

  if (!email || !password) {
    return res.json({
      success: false,
      message: 'Email and password required'
    })
  }

  Customer.findOne({ email: caseInsensitive(email.trim()) })
    .select('+password')
    .then((customer) => {
      if (
        !customer ||
        !passwordUtils.checkPassword(customer['password'], password)
      )
        throw { message: 'Email or password not matched' }
      if (!customer.mobileConfirmed)
        throw { message: 'Mobile number not confirmed' }

      res.send({
        success: true,
        user: omit(customer.toJSON(), ['password']),
        token: Customer.createSessionToken(customer._id)
      })
    })
    .catch((error) => {
      res.send({
        success: false,
        message: 'server side error: ' + error.message
      })
    })
}

module.exports.checkSocialToken = async function (req, res, next) {
  let { type, token } = req.query
  let result = await getSocialTokenInfo(type, token)
  res.send(result)
}

const getFacebookTokenInfo = async (token) => {
  const appId = process.env.FACEBOOK_APP_ID
  const appSecret = process.env.FACEBOOK_APP_SECRET
  try {
    let res2 = await fetch(
      `https://graph.facebook.com/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&grant_type=client_credentials`
    )
    let { access_token } = await res2.json()

    let verifyResponse = await fetch(
      `https://graph.facebook.com/debug_token?input_token=${token}&access_token=${access_token}`
    )
    let { data: verifyData } = await verifyResponse.json()

    if (!verifyData || verifyData.app_id !== appId) {
      return { success: false, message: 'Incorrect token' }
    }

    let infoResponse = await fetch(
      `https://graph.facebook.com/me?fields=id,email,first_name,last_name,picture&access_token=${token}`
    )
    let data = await infoResponse.json()

    let hasPicture =
      data && data.picture && data.picture.data && data.picture.data.url

    return {
      success: true,
      data: {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        emailVerified: true,
        picture: hasPicture ? data.picture.data.url : undefined
      }
    }
  } catch (error) {
    console.error(error)
    return { success: false, message: 'Somethings went wrong' }
  }
}

const getGoogleTokenInfo = async (token) => {
  try {
    let url = `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`
    let response = await fetch(url)
    let data = await response.json()
    if (data.aud !== process.env.GOOGLE_AUTH_WEB_CLIENT_ID)
      return { success: false, message: 'Incorrect token' }
    return {
      success: true,
      data: {
        id: data.sub,
        firstName: data.given_name,
        lastName: data.family_name,
        email: data.email,
        emailVerified: data.email_verified,
        picture: data.picture || undefined,
        // rawData: data,
      }
    }
  } catch (error) {
    console.error(error)
    return { success: false, message: 'Somethings went wrong' }
  }
}

const getSocialTokenInfo = (type, token) => {
  if (type === 'facebook')
    return getFacebookTokenInfo(token)
  else if (type === 'google')
    return getGoogleTokenInfo(token)
  else
    throw userError(Codes.SOCIAL_INVALID_TYPE)
}

module.exports.signInSocial = function (req, res, next) {
  let { type, token } = req.body

  if (!type || !token) {
    return res.json({
      success: false,
      message: 'Login info incorrect'
    })
  }

  Promise.resolve(true)
    .then(async () => {
      let tokenInfo = await getSocialTokenInfo(type, token)

      let data = tokenInfo.data || {}

      if (!tokenInfo.success) {
        console.log('social login failed', {type, token, tokenInfo})
        throw userError(Codes.SOCIAL_AUTH_ERROR)
      }

      let customer = null;

      if(!!data.email) {
        customer = await Customer.findOne({
          email: caseInsensitive(data.email)
        }).select('+password')
      }
      else{
        customer = await Customer.findOne({
          [`social.${type}.id`]: data.id
        }).select('+password')
      }

      let userRegistered =
        !!customer && customer.status === Customer.Statuses.Registered
      if (!customer) {
        customer = new Customer({
          firstName: data.firstName,
          lastName: data.lastName,
          ...(!!data.email ? {
            email: data.email,
            emailConfirmed: parseBoolean(data.emailVerified),
          } : {}),
          avatar: data.picture || null
        })
      }
      customer.social = {
        ...customer.social,
        [type]: data
      }
      await customer.save()

      res.send({
        success: true,
        registered: userRegistered,
        user: omit(customer.toJSON(), ['password']),
        token: userRegistered
          ? Customer.createSessionToken(customer._id)
          : undefined
      })
    })
    .catch((error) => {
      res.send({
        success: false,
        message: 'server side error: ' + error.message
      })
    })
}

module.exports.signOut = function (req, res, next) {
  res.send({
    success: true
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

module.exports.getCreditCards = function (req, res, next) {
  let customer = req.locals.user
  // CreditCard.find({customer})
  //   .then((creditCards) => {
  //     res.send({
  //       success: true,
  //       creditCards
  //     })
  //   })
  //   .catch((error) => {
  //     res.send({
  //       success: false,
  //       ...userError(Codes.SERVER_SIDE_ERROR)
  //     })
  //   })
  PaymentController.getCustomerInfo(customer.email)
    .then((list) => {
      let creditCards = !list ? [] : list.map((i) => ({
        id: i.customer_vault_id,
        cc_number: i.cc_number,
        cc_exp: i.cc_exp,
        cc_type: i.cc_type
      }))
      res.send({
        success: true,
        creditCards
      })
    })
    .catch((error) => {
      res.send({
        success: false,
        ...userError(Codes.SERVER_SIDE_ERROR)
      })
    })
}

module.exports.addCreditCard = function (req, res, next) {
  let customer = req.locals.user
  let { number, year, month, cvv } = req.body
  let creditCard = null
  Promise.resolve(true)
    .then(() => {
      if (!number) throw userError(Codes.ERROR_CREDIT_CARD_INVALID_NUMBER)
      if (!year) throw userError(Codes.ERROR_CREDIT_CARD_INVALID_YEAR)
      if (!month) throw userError(Codes.ERROR_CREDIT_CARD_INVALID_MONTH)
      if (!cvv) throw userError(Codes.ERROR_CREDIT_CARD_INVALID_CVV)

      // let cardInfo = creditCardDetector.getInfo(number)
      // if (cardInfo.type === 'unknown')
      //   throw userError(Codes.ERROR_CREDIT_CARD_INVALID_TYPE)

      return PaymentController.addCustomer(
        customer.email,
        customer.firstName,
        customer.lastName,
        number,
        `${month}${year}`,
        cvv
      )
    })
    .then((result) => {
      console.log('====', result)
      res.send({
        success: !!result && result.response == '1',
        message: result ? result.responsetext : ''
      })
    })
    .catch((error) => {
      let { message, errorCode } = error
      res.send({
        success: false,
        message,
        errorCode
      })
    })
}

module.exports.deleteCreditCard = function (req, res, next) {}

module.exports.getCalculateOrderPrice = function (req, res, next) {
  let { vehicleType, business: businessId, origin, destination } = req.query

  let business = null

  Promise.resolve(true)
    .then(async () => {
      if (businessId)
        business = await Business.findOne({ _id: businessId })
      let direction = await GoogleApi.directions(origin, destination)
      let distance =
        direction.routes[0].legs.reduce(
          (sum, leg) => sum + leg.distance.value,
          0
        )
      distance = Math.round(distance/100)/10
      let price = null
      if (business)
        price = await PriceController.getBusinessOrderPrice(
          business,
          vehicleType,
          distance
        )
      else
        price = await PriceController.getCustomerOrderPrice(
          vehicleType,
          distance
        )
      res.send({
        success: true,
        price,
        direction
      })
    })
    .catch((error) => {
      console.log(error)
      let { message, errorCode } = error
      res.send({
        success: false,
        message,
        errorCode: errorCode || Codes.SERVER_SIDE_ERROR
      })
    })
}

const correctPhotoPath = path => path.replace('user_files/', '/file/')

module.exports.postNewOrder = function (req, res, next) {
  let {
    isRequest,
    vehicleType,
    pickupAddress,
    pickupNote,
    senderNote,
    payer,
    personName,
    personMobile,
    deliveryAddress,
    deliveryNote,
    creditCard
  } = req.body
  let {photos=[]} = req.files || {};
  isRequest = parseBoolean(isRequest)

  let user = req.locals.user
  let order = null
  Promise.resolve(true)
    .then(async () => {
      if (!personMobile) throw userError(Codes.ERROR_CUSTOMER_MOBILE_REQUIRE)
      if (Validator.mobile(personMobile))
        throw userError(Codes.ERROR_MOBILE_INVALID)

      let person = await Customer.findOne({ mobile: personMobile })
      if (!person) {
        person = new Customer({
          mobile: personMobile,
          firstName: personName,
          lastName: ''
        })
        await person.save()
      }

      let hasPickupAddress = !!pickupAddress
      let hasDeliveryAddress = !!deliveryAddress
      let direction = null,
        cost = null
      if (hasPickupAddress && hasDeliveryAddress) {
        let { lat: lat1, lng: lng1 } = pickupAddress.geometry.location
        let { lat: lat2, lng: lng2 } = deliveryAddress.geometry.location
        direction = await GoogleApi.directions(
          `${lat1},${lng1}`,
          `${lat2},${lng2}`
        )
        let distance = direction.routes[0].legs.reduce(
          (sum, leg) => sum + parseInt(leg.distance.value),
          0
        )
        distance = Math.round(distance/100)/10
        cost = await PriceController.getCustomerOrderPrice(
          vehicleType,
          distance
        )
      }

      let sender = isRequest ? person : user
      let receiver = isRequest ? user : person

      order = new Order({
        senderModel: Customer.COLLECTION_NAME,
        sender,
        receiver,
        isRequest,
        packages: [
          {
            photos: photos.map(p => correctPhotoPath(p.location))
            // note: '',
            // reference: '',
            // description: '',
          }
        ],
        pickup: {
          name: `${sender.firstName} ${sender.lastName}`.trim(),
          ...(hasPickupAddress
            ? {
                location: {
                  type: 'Point',
                  coordinates: [
                    pickupAddress.geometry.location.lat,
                    pickupAddress.geometry.location.lng
                  ]
                },
                address: pickupAddress
              }
            : {}),
          phone: sender.mobile,
          note: pickupNote,
          senderNote
        },
        delivery: {
          name: `${receiver.firstName} ${receiver.lastName}`.trim(),
          ...(hasDeliveryAddress
            ? {
                location: {
                  type: 'Point',
                  coordinates: [
                    deliveryAddress.geometry.location.lat,
                    deliveryAddress.geometry.location.lng
                  ]
                },
                address: deliveryAddress
              }
            : {}),
          phone: receiver.mobile,
          note: deliveryNote
        },
        direction,
        payer,
        creditCard,
        date: Date.now(),
        vehicleType,
        time: {
          create: Date.now(),
          ...(hasDeliveryAddress && hasPickupAddress ? {confirm: Date.now()} : {})
        },
        ...(hasDeliveryAddress && hasPickupAddress
          ? {
              cost,
              status: Order.Status.Pending
            }
          : {})
      })

      await order.generateAutoInc();

      if(!!order.pickup.address && !!order.delivery.address && order.creditCard)
        await EventBus.emit(EventBus.EVENT_ORDER_PAYMENT_PRE_AUTHORIZE, {order})

      await EventBus.emit(EventBus.EVENT_ORDER_CREATE, { order })

      await order.save();

      res.send({
        success: true,
        order
      })
    })
    .catch((error) => {
      console.log(error)
      let { message, errorCode } = error
      res.send({
        success: false,
        message,
        errorCode
      })
    })
}

module.exports.putCompleteOrder = function (req, res, next) {
  let {user, userType} = req.locals;
  let {order: orderId} = req.params
  let {schedule, address, note, creditCard} = req.body;
  let order = null;

  Promise.resolve(true)
    .then(async () => {
      if (!address)
        throw userError(
          Codes.MISSING_REQUEST_PARAMS,
          'Address required to complete order'
        )
      order = await Order.findOne({ _id: orderId }).populate([
        'sender',
        'receiver'
      ])
      if (!order) throw userError(Codes.ERROR_ORDER_NOT_FOUND)
      if (order.senderModel === Business.COLLECTION_NAME) {
        if (!schedule || !schedule.date || !schedule.time)
          throw userError(Codes.MISSING_REQUEST_PARAMS, "Missing schedule Data/Time")
        let scheduleIsValid = await order.sender.validateSchedule(
          schedule.date,
          schedule.time
        )
        if (!scheduleIsValid)
          throw userError(Codes.ERROR_ORDER_INVALID_SCHEDULE_TIME)
      }
    })
    .then(async () => {
      let completer = order.isRequest ? 'sender' : 'receiver'

      if (order.senderModel === Business.COLLECTION_NAME || (!order.isRequest && order.payer === 'receiver')) {
        if(!creditCard)
          throw userError(Codes.MISSING_REQUEST_PARAMS, "Missing Credit Card")
        order.creditCard = creditCard;
      }

      if (user._id.toString() !== order[completer]._id.toString())
        throw userError(Codes.PERMISSION_DENIED)

      if (order.isRequest) {
        order.addLog(`Pickup address update by ${order[completer].name}`)
        order.pickup.address = address
        order.pickup.note = note || ''
      } else {
        order.addLog(`Delivery address update by ${order[completer].name}`)
        order.delivery.address = address
        order.delivery.note = note || ''
      }
      if (order.senderModel === Business.COLLECTION_NAME) {

        schedule.from = schedule.time.split('-')[0];
        schedule.to = schedule.time.split('-')[1];

        let scheduleTime = moment(schedule.date + ' ' + schedule.from)
        order.addLog(`Scheduled by ${order[completer].name} for ${scheduleTime.format('YYYY-MM-DD HH:mm')}`)
        if(moment().add(30, 'minutes').isAfter(scheduleTime)){
          order.addLog(`Confirmed by ${order[completer].name}`)
          order.status = Order.Status.Pending
        }
        else{
          order.status = Order.Status.Scheduled
        }

        order.schedule = {
          confirmed: order.status === Order.Status.Pending,
          date: schedule.date,
          from: schedule.from,
          to: schedule.to
        }
      }else{
        order.status = Order.Status.Pending
      }

      let { lat: lat1, lng: lng1 } = order.pickup.address.geometry.location
      let { lat: lat2, lng: lng2 } = order.delivery.address.geometry.location
      let direction = await GoogleApi.directions(
        `${lat1},${lng1}`,
        `${lat2},${lng2}`
      )
      let distance = direction.routes[0].legs.reduce(
        (sum, leg) => sum + parseInt(leg.distance.value),
        0
      )
      distance = Math.round(distance/100)/10
      let cost = null
      if (order.senderModel === Business.COLLECTION_NAME) {
        cost = await PriceController.getBusinessOrderPrice(
          order.sender,
          order.vehicleType,
          distance
        )
      }
      else {
        cost = await PriceController.getCustomerOrderPrice(
          order.vehicleType,
          distance
        )
      }

      order.direction = direction
      order.cost = cost
      order.time.confirm = Date.now()

      await EventBus.emit(EventBus.EVENT_ORDER_PAYMENT_PRE_AUTHORIZE, {order})

      return order.save()
    })
    .then(async () => {
      await EventBus.emit(EventBus.EVENT_ORDER_STATUS_CHANGED, { order })
      res.send({
        success: true,
        order
      })
    })
    .catch((error) => {
      console.log(error)
      let {
        message = 'Somethings went wrong',
        errorCode = Codes.SERVER_SIDE_ERROR
      } = error
      res.send({
        success: false,
        message,
        errorCode
      })
    })
}

module.exports.putEditOrder = function (req, res, next) {
  let {user, userType} = req.locals;
  let {order: orderId} = req.params
  let {schedule, deliveryAddress, scheduleConfirm} = req.body;
  let order = null;

  Promise.resolve(true)
    .then(async () => {
      order = await Order.findOne({ _id: orderId }).populate([
        'sender',
        'receiver'
      ])
      if (!order)
        throw userError(Codes.ERROR_ORDER_NOT_FOUND)
      if (order.senderModel === Business.COLLECTION_NAME && !!schedule) {
        let scheduleIsValid = await order.sender.validateSchedule(
          schedule.date,
          schedule.time
        )
        if (!scheduleIsValid)
          throw userError(Codes.ERROR_ORDER_INVALID_SCHEDULE_TIME)
      }

      if(!!deliveryAddress || scheduleConfirm) {
        if (user._id.toString() !== order.receiver._id.toString())
          throw userError(Codes.PERMISSION_DENIED)
      }

      if(!!schedule && order.senderModel === Business.COLLECTION_NAME) {
        schedule.from = schedule.time.split('-')[0];
        schedule.to = schedule.time.split('-')[1];

        let scheduleTime = moment(schedule.date + ' ' + schedule.from)
        console.log({scheduleTime: scheduleTime.format('YYYY-MM-DD HH:mm')})
        if(moment().add(30, 'minutes').isAfter(scheduleTime)){
          scheduleConfirm = true;
        }


        order.schedule = {
          confirmed: scheduleConfirm,
          date: schedule.date,
          from: schedule.from,
          to: schedule.to
        }
      }

      if (deliveryAddress) {
        order.delivery.address = deliveryAddress;

        let { lat: lat1, lng: lng1 } = order.pickup.address.geometry.location
        let { lat: lat2, lng: lng2 } = order.delivery.address.geometry.location
        let direction = await GoogleApi.directions(
          `${lat1},${lng1}`,
          `${lat2},${lng2}`
        )
        let distance = direction.routes[0].legs.reduce(
          (sum, leg) => sum + parseInt(leg.distance.value),
          0
        )
        distance = Math.round(distance/100)/10

        let cost = null
        if (order.senderModel === Business.COLLECTION_NAME) {
          cost = await PriceController.getBusinessOrderPrice(
            order.sender,
            order.vehicleType,
            distance
          )
        }
        else {
          cost = await PriceController.getCustomerOrderPrice(
            order.vehicleType,
            distance
          )
        }

        order.direction = direction
        order.cost = cost
      }

      if(scheduleConfirm){
        order.time.confirm = Date.now()
        order.schedule.confirmed = true
        order.status = Order.Status.Pending
      }

      if(!!deliveryAddress){
        order.addLog(`Delivery address changed by ${order.receiver.name}`)
      }

      if(!!schedule){
        order.addLog(`Scheduled by ${order.receiver.name} for ${moment(order.schedule.date).format('YYYY-MM-DD')} ${order.schedule.from}`)
      }

      if(scheduleConfirm){
        order.addLog(`Confirmed by ${order.receiver.name}`)
      }

      await EventBus.emit(EventBus.EVENT_ORDER_PAYMENT_PRICE_CHANGE, {order})

      return order.save()
    })
    .then(async () => {
      res.send({
        success: true,
        order
      })
    })
    .catch((error) => {
      console.log(error)
      let {
        message = 'Somethings went wrong',
        errorCode = Codes.SERVER_SIDE_ERROR
      } = error
      res.send({
        success: false,
        message,
        errorCode
      })
    })
}

module.exports.getOrderList = function (req, res, next) {
  let user = req.locals.user
  Order.find({
    $or: [{ sender: user._id }, { receiver: user._id }]
  })
    .populate(['driver', 'sender', 'receiver'])
    .then((orders) => {
      res.send({
        success: true,
        orders
      })
    })
    .catch((error) => {
      res.send({
        success: false,
        ...userError(Codes.SERVER_SIDE_ERROR)
      })
    })
}

module.exports.getMobileInfo = function (req, res, next) {
  let { mobile } = req.query

  Customer.findOne({ mobile, mobileConfirmed: true })
    .then((customer) => {
      res.send({
        success: true,
        customer
      })
    })
    .catch((error) => {
      res.send({
        success: false,
        ...userError(Codes.SERVER_SIDE_ERROR)
      })
    })
}

module.exports.getBusinessTimeFrames = function (req, res, next) {
  let { business: businessId } = req.params

  CustomTimeFrame.getBusinessCustomTimeFrames(businessId)
    .then((customTimeFrames) => {
      res.send({
        success: true,
        customTimeFrames
      })
    })
    .catch((error) => {
      res.send({
        success: false,
        ...userError(Codes.SERVER_SIDE_ERROR)
      })
    })
}

module.exports.getOrderDetail = function (req, res, next) {
  let { order: orderId } = req.params
  let { user, userType } = req.locals

  Order.findOne({
    _id: orderId,
    $or: [{ sender: user._id }, { receiver: user._id }]
  }).populate(['sender', 'receiver','driver'])
    .then(order => {
      res.send({
        success: !!order,
        order,
        message: !order ? 'Order not found' : undefined
      })
    })
    .catch(({ message, errorCode }) => {
      res.send({
        success: false,
        message: message || 'Server Side error',
        errorCode: errorCode || Codes.SERVER_SIDE_ERROR
      })
    })
}

module.exports.cancelOrder = function (req, res, next) {
  let { order: orderId } = req.params
  let { user, userType } = req.locals
  let order = null
  Order.findOne({
    _id: orderId,
    $or: [{ sender: user._id }, { receiver: user._id }]
  })
    .then(async (_order) => {
      order = _order
      if (!order) throw userError(Codes.ERROR_ORDER_NOT_FOUND)
      if (!!order.driver) throw userError(Codes.ERROR_ORDER_CANCEL_HAS_DRIVER)
      if (userType === 'Customer') {
        await Order.cancelByCustomer(order, user)
      } else if (userType === 'Driver') {
        await Order.cancelByDriver(order, user)
      } else {
        throw { message: 'Unsupported order canceler' }
      }

      await EventBus.emit(EventBus.EVENT_ORDER_PAYMENT_FINALIZE, {order})
      return order.save()
    })
    .then(() => {
      res.send({
        success: true,
        order
      })
    })
    .catch(({ message, errorCode }) => {
      res.send({
        success: false,
        message: message || 'Server Side error',
        errorCode: errorCode || Codes.SERVER_SIDE_ERROR
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
        owner: user,
      })
    })
    .then(async (userDevice) => {
      if (!userDevice) {
        userDevice = new UserDevice({
          ownerModel: Customer.COLLECTION_NAME,
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

module.exports.getOrderLiveTrack = function (req, res, next) {
  let { order: orderId } = req.params
  let { user, userType } = req.locals

  Order.findOne({
    _id: orderId,
    $or: [
      { receiver: user._id },
      { sender: user._id },
    ]
  })
    .then((order) => {
      if (!order) throw userError(Codes.ERROR_ORDER_NOT_FOUND)
      return Driver.findOne({ _id: order.driver }).select('+geoLocation')
    })
    .then((driver) => {
      res.send({
        success: true,
        geoLocation: driver.geoLocation
      })
    })
    .catch((error) => {
      let { message, errorCode } = error
      res.send({
        success: false,
        message: message || 'Somethings went wrong',
        errorCode: errorCode || Codes.SERVER_SIDE_ERROR
      })
    })
}

module.exports.postOrderFeedback = function (req, res, next) {
  let { order: orderId } = req.params
  let { user } = req.locals
  let {rate, comment} = req.body
  rate = parseInt(rate);

  Order.findOne({
    _id: orderId,
    $or: [
      {sender: user._id},
      {receiver: user._id},
    ]
  })
    .then(async (order) => {
      if (!order)
        throw userError(Codes.ERROR_ORDER_NOT_FOUND)
      if(rate < 1)
        throw userError(Codes.MISSING_REQUEST_PARAMS)

      if(order.payer === 'sender' && user._id.toString() === order.sender.toString()){
        order.senderFeedback = {rate, comment}
      }
      else if(order.payer === 'receiver' && user._id.toString() === order.receiver.toString()){
        order.receiverFeedback = {rate, comment}
      }

      await order.save()
      res.send({
        success: true,
        order
      })
    })
    .catch((error) => {
      let { message, errorCode } = error
      res.send({
        success: false,
        message: message || 'Somethings went wrong',
        errorCode: errorCode || Codes.SERVER_SIDE_ERROR
      })
    })
}

module.exports.postOrderChat = function (req, res, next) {
  let { order: orderId } = req.params
  let { user } = req.locals
  let { message } = req.body
  let {photo=[]} = req.files || {};
  photo = photo.map(p => correctPhotoPath(p.location))

  Order.findOne({
    _id: orderId,
    $or: [
      {sender: user._id},
      {receiver: user._id},
    ]
  })
    .populate(['sender', 'receiver', 'driver'])
    .then(async (order) => {
      if (!order)
        throw userError(Codes.ERROR_ORDER_NOT_FOUND)
      if(!message)
        throw userError(Codes.MISSING_REQUEST_PARAMS)
      let hasPhoto = false, photoUri = ''
      if(photo.length > 0){
        hasPhoto = true;
        photoUri = photo[0]
      }

      let newMessage = {
        text: message,
        timestamp: Date.now(),
        ...(hasPhoto ? { image: photoUri } : {}),
        sender: {
          _id: user._id.toString(),
          type: Customer.COLLECTION_NAME,
          name: user.name
        },
        data: { order: order._id.toString() }
      }

      const orderChat = firestore.collection('pik_delivery_order_chats')
        .doc(`order_${order._id}_driver_${order.driver._id}_customer_${user._id}`)

      let increment = firebaseAdmin.firestore.FieldValue.increment(1)
      await orderChat.set(
        {
          order: order._id.toString(),
          orderId: order.id,
          userList: {
            [order.driver._id.toString()]:{
              type: Driver.COLLECTION_NAME,
              avatar: order.driver.avatar,
              name: order.driver.name,
              unread: increment
            },
            [user._id.toString()]: {
              type: Customer.COLLECTION_NAME,
              avatar: user.avatar,
              name: user.name
            },
          },
          lastMessage: newMessage
        },
        { merge: true }
      )

      await orderChat.collection('messages')
        .add(newMessage)

      NotificationController.sendNotificationToUsers(
        [order.driver._id.toString()],
        {
          title: user.name,
          body: message,
        },
        {
          data: {
            orderChat: orderId
          }
        }
      )

      res.send({
        success: true,
      })
    })
    .catch((error) => {
      let { message, errorCode } = error
      res.send({
        success: false,
        message: message || 'Somethings went wrong',
        errorCode: errorCode || Codes.SERVER_SIDE_ERROR
      })
    })
}

module.exports.postOrderChatRead = function (req, res, next) {
  let { order: orderId } = req.params
  let { user } = req.locals

  Order.findOne({
    _id: orderId,
    $or: [
      {sender: user._id},
      {receiver: user._id},
    ]
  })
    .populate(['sender', 'receiver', 'driver'])
    .then(async (order) => {
      if (!order)
        throw userError(Codes.ERROR_ORDER_NOT_FOUND)

      const orderChat = firestore.collection('pik_delivery_order_chats')
        .doc(`order_${order._id}_driver_${order.driver._id}_customer_${user._id}`)

      await orderChat.set(
        {
          userList: {
            [user._id.toString()]: {
              unread: 0
            },
          },
        },
        { merge: true }
      )

      res.send({
        success: true,
      })
    })
    .catch((error) => {
      let { message, errorCode } = error
      console.error(error)
      res.send({
        success: false,
        message: message || 'Somethings went wrong',
        errorCode: errorCode || Codes.SERVER_SIDE_ERROR
      })
    })
}

module.exports.getFaqs = function (req, res, next) {
  Promise.resolve(true)
    .then(async () => {
      let categories = await FaqCategories.find({
        type: 'Customer',
        published: true
      })
      let faqs = await Faq.find({ type: 'Customer', published: true })
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
        errorCode: errorCode || Codes.SERVER_SIDE_ERROR
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

      let success = await EmailController.sendContactUs('Customer', user, category, order, details, photos)

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
      if (!!orderId) {
        let ticket = firestore
          .collection(process.env.SUPPORT_TICKETS)
          .doc(`customer_${user._id}_order_${orderId}`)
        await ticket.set(
          {
            userList: {
              [user._id.toString()]:{
                avatar: user.avatar,
                name: user.name
              }
            },
            _id: user._id.toString(),
            type: 'customer',
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
            type: Customer.COLLECTION_NAME,
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
          .doc(`customer_${user._id}_general_${Date.now()}`)
        await ticket.set(
          {
            userList: {
              [user._id.toString()]:{
                avatar: user.avatar,
                name: user.name
              }
            },
            _id: user._id.toString(),
            type: 'customer',
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
            type: Customer.COLLECTION_NAME,
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
        errorCode: errorCode || Codes.SERVER_SIDE_ERROR
      })
    })
}

module.exports.getSavedAddresses = function (req, res, next) {
  let { user } = req.locals

  SavedAddress.find({owner: user._id})
      .sort({'updatedAt': -1})
    .then(addresses => {
      console.log('address count: ' + addresses.length)
      res.send({
        success: true,
        addresses
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

module.exports.postSavedAddress = function (req, res, next) {
  let { user } = req.locals
  let { name, address } = req.body

  Promise.resolve(true)
    .then(async () => {
      if (!name || !address)
        throw userError(Codes.MISSING_REQUEST_PARAMS)

      let savedAddress = new SavedAddress({
        ownerModel: Customer.COLLECTION_NAME,
        owner: user,
        name,
        address
      })

      await savedAddress.save();

      res.send({
        success: true,
        address: savedAddress
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

module.exports.putSavedAddress = function (req, res, next) {
  let { user } = req.locals
  let { name, address } = req.body
  let {address: addressId} = req.params

  Promise.resolve(true)
    .then(async () => {
      if (!name || !address)
        throw userError(Codes.MISSING_REQUEST_PARAMS)

      let savedAddress = await SavedAddress.findOne({
        _id: addressId,
        owner: user._id,
      })

      if (!savedAddress)
        throw userError(Codes.MISSING_RESOURCE)

      savedAddress.name = name
      savedAddress.address = address

      await savedAddress.save();

      res.send({
        success: true,
        address: savedAddress
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

module.exports.deleteSavedAddress = function (req, res, next) {
  let { user } = req.locals
  let {address: addressId} = req.params

  SavedAddress.findOne({
    _id: addressId,
    owner: user._id,
  })
    .then(async (savedAddress) => {
      if (!savedAddress)
        throw userError(Codes.MISSING_RESOURCE)

      await savedAddress.remove();

      res.send({
        success: true,
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

module.exports.getBanner = function (req, res, next) {
  Banner.count()
    .then(count => {
      let random = Math.floor(Math.random() * count)
      return Banner.findOne({
        published: true,
        expiration: {$gt: Date.now()},
      }).skip(random)
    })
    .then(async (banner) => {
      res.send({
        success: true,
        banner
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

module.exports.test = function (req, res, next) {
  let user = req.locals.user

  PaymentController
  // .addCustomer(
  //   'sadeghte@gmail.com',
  //   "sadegh",
  //   'teymouri',
  //   '5500000000000004',
  //   '1221',
  //   999
  // )
  // .deleteCustomer('154695244')
  //   .getCustomerList()
    .getCustomerInfo('sadeghte@gmail.com')
    // .void('5915506322')
    // .chargeBusinessCoverage('8690804', 11.12, "1234567")
    .then((result) => {
      res.send({
        success: true,
        result
      })
    })
    .catch((error) => {
      res.send({
        success: false,
        error
      })
    })
}

async function sendTestChat() {
  let orderId = '6012ed1da44ae271ee364f5a'
  return firestore.collection('pik_delivery_order_chats')
    .doc(`order_${orderId}`)
    .collection('messages')
    .add({
      text: "test from backend",
      time: Date.now(),
      sender: {
        _id: "43434343",
        type: Customer.COLLECTION_NAME,
        name: "Server",
      },
      data: {order: orderId}
    })
}
