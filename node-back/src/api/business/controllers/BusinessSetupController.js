const Business = require('../../../models/Business')
const BusinessUser = require('../../../models/BusinessUser')
const CustomTimeFrame = require('../../../models/CustomTimeFrame')
const { s3Delete } = require('../../../middleware/uploadToS3')
const { getFileName } = require('../../../utils/getFileName')
const { userError, Codes } = require('../../../messages/userMessages')
const PaymentController = require('../../../controllers/PaymentController')
const ObjectId = require('mongoose').Types.ObjectId
const { checkConflict } = require('../../../utils/checkConflictBusinessHours')
const Order = require('../../../models/Order')
const EventBus = require('../../../eventBus')

module.exports.create = async (req, res, next) => {
  try {
    let { customTimeFrames, card, name } = req.body
    let dataBusiness = req.body
    let existBusiness = await Business.findOne({
      email: { $regex: new RegExp('^' + req.body.email + '$', 'i') }
    })
    if (existBusiness) {
      throw userError(Codes.ERROR_BUSINESS_CREATE_FAIL_DOUPLICATE_EMAIL)
    }
    if (card.cardNumber) {
      let creditCard = await registerCreditCard(
        name,
        card.cardNumber,
        `${card.month}${card.year}`,
        card.cvv
      )
      if (!creditCard.success) {
        throw userError(Codes.ERROR_CREDIT_CARD)
      }
      dataBusiness['creditCard'] = creditCard
    }
    const business = await Business.create(req.body)
    if (business) {
      BusinessUser.updateOne(
        { _id: req.locals.user._id },
        { $set: { business: business._id } },
        function (err, res) {
          if (err) throw err
        }
      )
      customTimeFrames = customTimeFrames.map((item) => ({
        ...item,
        business: business._id
      }))
      const result = await CustomTimeFrame.create(customTimeFrames)
      res.send({
        success: true,
        business,
        customTimeFrames
      })
    }
  } catch (error) {
    res.send({
      success: false,
      errorCode: error.errorCode,
      message: error.message
    })
  }
}

module.exports.checkBusiness = async (req, res, next) => {
  try {
    let id = req.locals.user.business
    const business = await Business.findOne({ _id: id })
    res.send({
      success: true,
      business
    })
  } catch (error) {
    console.log(error)
  }
}

module.exports.retrieve = async (req, res, next) => {
  try {
    let businessId = req.locals.user.business
    if (!ObjectId.isValid(businessId) || !businessId) {
      throw userError(Codes.ERROR_BUSINESS_NOT_FOUND)
    }
    let business = await Business.findById(businessId)
    if (!business) {
      throw userError(Codes.ERROR_BUSINESS_NOT_FOUND)
    }
    let customTimeFrames = await CustomTimeFrame.find({ business: businessId })
    res.send({
      success: true,
      business,
      customTimeFrames
    })
  } catch (error) {
    res.send({
      success: false,
      errorCode: error.errorCode,
      message: error.message
    })
  }
}

module.exports.update = async (req, res, next) => {
  try {
    console.log('update business')
    let {
      customTimeFrames,
      deletedId,
      timeFrames,
      card,
      removedCreditCard
    } = req.body
    let dataBusiness = {
      name: req.body.name,
      email: req.body.email,
      logo: req.body.logo,
      website: req.body.website,
      location: req.body.location,
      about: req.body.about,
      coverageMaxValue: req.body.coverageMaxValue,
      paymentMethods: req.body.paymentMethods,
      coverageEnabled: req.body.coverageEnabled,
      phone: req.body.phone,
      mobile: req.body.mobile,
      timeFrames: req.body.timeFrames,
      status: req.body.status,
      address: req.body.address,
      creditCard: req.body.creditCard
    }
    const businessId = req.locals.user.business
    if (!ObjectId.isValid(businessId) || !businessId) {
      throw userError(Codes.ERROR_BUSINESS_NOT_FOUND)
    }
    let validateSchedule = true
    const updates = Object.keys(dataBusiness)
    const allowedUpdate = [
      'name',
      'email',
      'logo',
      'website',
      'location',
      'about',
      'coverageMaxValue',
      'paymentMethods',
      'coverageEnabled',
      'phone',
      'mobile',
      'timeFrames',
      'status',
      'address',
      'creditCard'
    ]

    const isValidOpertion = updates.every((update) =>
      allowedUpdate.includes(update)
    )
    if (!isValidOpertion) {
      throw userError(Codes.ERROR_INVALID_UPDATE)
    }

    const business = await Business.findById(businessId)
    if (!business) throw userError(Codes.ERROR_BUSINESS_NOT_FOUND)
    let existBusiness = await Business.findOne({
      email: { $regex: new RegExp('^' + req.body.email + '$', 'i') },
      _id: { $ne: businessId }
    })
    if (existBusiness) {
      throw userError(Codes.ERROR_BUSINESS_CREATE_FAIL_DOUPLICATE_EMAIL)
    }
    if (
      (timeFrames && timeFrames.length > 0) ||
      (customTimeFrames && customTimeFrames.length > 0) ||
      (deletedId && deletedId.length > 0)
    ) {
      const deletedCustomTimeFrame = await CustomTimeFrame.find({
        id: { $in: deletedId }
      })
      const {
        isValid,
        ordersConflict,
        customTimeFramesConflict,
        customTimeFramesConflictRemove
      } = await checkConflict(
        customTimeFrames,
        deletedCustomTimeFrame,
        deletedId,
        business.timeFrames,
        timeFrames,
        businessId
      )
      console.log({ isValid, ordersConflict })
      validateSchedule = isValid
      if (!isValid) {
        res.send({
          success: false,
          conflict: true,
          orders: ordersConflict,
          customTimeFramesConflict,
          customTimeFramesConflictRemove
        })
      }
    }

    if (validateSchedule) {
      if (removedCreditCard) {
        await removeCreditCard(removedCreditCard)
      }

      if (card.cardNumber) {
        let creditCard = await registerCreditCard(
          business.name,
          card.cardNumber,
          `${card.month}${card.year}`,
          card.cvv
        )
        if (!creditCard.success) {
          throw userError(Codes.ERROR_CREDIT_CARD)
        }
        dataBusiness['creditCard'] = creditCard
      }
      if (dataBusiness.coverageEnabled && !dataBusiness.creditCard) {
        throw userError(Codes.ERROR_INVALID_UPDATE)
      }
      updates.forEach((update) => (business[update] = dataBusiness[update]))
      await business.save()
      if (
        (customTimeFrames && customTimeFrames.length > 0) ||
        (deletedId && deletedId.length > 0)
      ) {
        customTimeFrames = customTimeFrames.map((item) => ({
          ...item,
          business: businessId
        }))
        await CustomTimeFrame.create(customTimeFrames)
        if (deletedId && deletedId.length > 0)
          await CustomTimeFrame.deleteMany({ id: { $in: deletedId } })
      }
      res.send({
        success: true,
        business
      })
    }
  } catch (error) {
    console.log(error)
    res.send({
      success: false,
      errorCode: error.errorCode,
      message: error.message
    })
  }
}
/**
 *  Exist orders scheduled for changed Hours and business want to disabled them
 * @param {business ,ordersId (conflict with new hours)} req
 * @param {*} res
 * @param {*} next
 */

module.exports.edit = async (req, res, next) => {
  try {
    const businessId = req.locals.user.business
    if (!ObjectId.isValid(businessId) || !businessId) {
      throw userError(Codes.ERROR_BUSINESS_NOT_FOUND)
    }

    let {
      customTimeFrames,
      deletedId,
      ordersId,
      card,
      removedCreditCard
    } = req.body
    let dataBusiness = {
      name: req.body.name,
      email: req.body.email,
      logo: req.body.logo,
      website: req.body.website,
      location: req.body.location,
      about: req.body.about,
      coverageMaxValue: req.body.coverageMaxValue,
      paymentMethods: req.body.paymentMethods,
      coverageEnabled: req.body.coverageEnabled,
      phone: req.body.phone,
      mobile: req.body.mobile,
      timeFrames: req.body.timeFrames,
      status: req.body.status,
      address: req.body.address,
      creditCard: req.body.creditCard
    }

    const updates = Object.keys(dataBusiness)
    const allowedUpdate = [
      'name',
      'email',
      'logo',
      'website',
      'location',
      'about',
      'coverageMaxValue',
      'paymentMethods',
      'coverageEnabled',
      'phone',
      'mobile',
      'timeFrames',
      'status',
      'address',
      'creditCard'
    ]

    const isValidOpertion = updates.every((update) =>
      allowedUpdate.includes(update)
    )
    if (!isValidOpertion) {
      throw userError(Codes.ERROR_INVALID_UPDATE)
    }

    const business = await Business.findById(businessId)
    if (!business) throw userError(Codes.ERROR_BUSINESS_NOT_FOUND)
    let existBusiness = await Business.findOne({
      email: { $regex: new RegExp('^' + req.body.email + '$', 'i') },
      _id: { $ne: businessId }
    })
    if (existBusiness) {
      throw userError(Codes.ERROR_BUSINESS_CREATE_FAIL_DOUPLICATE_EMAIL)
    }
    if (removedCreditCard) {
      await removeCreditCard(removedCreditCard)
    }

    if (card.cardNumber) {
      let creditCard = await registerCreditCard(
        business.name,
        card.cardNumber,
        `${card.month}${card.year}`,
        card.cvv
      )
      if (!creditCard.success) {
        throw userError(Codes.ERROR_CREDIT_CARD)
      }
      dataBusiness['creditCard'] = creditCard
    }
    if (dataBusiness.coverageEnabled && !dataBusiness.creditCard) {
      throw userError(Codes.ERROR_INVALID_UPDATE)
    }
    updates.forEach((update) => (business[update] = dataBusiness[update]))
    await business.save()

    if (
      (customTimeFrames && customTimeFrames.length > 0) ||
      (deletedId && deletedId.length > 0)
    ) {
      customTimeFrames = customTimeFrames.map((item) => ({
        ...item,
        business: businessId
      }))

      await CustomTimeFrame.create(customTimeFrames)
      if (deletedId && deletedId.length > 0)
        await CustomTimeFrame.deleteMany({ id: { $in: deletedId } })
    }
    await Order.updateMany(
      { _id: { $in: ordersId } },
      {
        $set: {
          status: 'Reschedule'
        }
      }
    )

    /** Send Reschedule event **/
    let rescheduledOrders = await Order.find({
      _id: { $in: ordersId }
    }).populate(['sender', 'receiver'])
    for (let i = 0; i < rescheduledOrders.length; i++) {
      await EventBus.emit(EventBus.EVENT_ORDER_RESCHEDULE, {
        order: rescheduledOrders[i]
      })
    }

    res.send({
      success: true,
      business
    })
  } catch (error) {
    res.send({
      success: false,
      errorCode: error.errorCode,
      message: error.message
    })
  }
}
module.exports.uploadAvatar = async (req, res, next) => {
  try {
    const businessId = req.locals.user.business
    if (businessId) {
      const business = await Business.findById(businessId)
      if (!business) {
        throw userError(Codes.ERROR_BUSINESS_NOT_FOUND)
      }
      if (business.logo) {
        s3Delete(getFileName(business.logo))
      }
    }
    return res.send({
      success: true,
      url: req.file.Location
    })
  } catch (error) {
    res.send({
      success: false,
      errorCode: error.errorCode,
      message: error.message
    })
  }
}

/**
 *
 * @param cardNumber, example: 4111111111111111
 * @param expire,     example: 0825 {month}{year}
 * @param cvv,        example: 999
 * @returns Res     example:  {
                                first_name: "Business_1",
                                cc_number: "4xxxxxxxxxxx1111",
                                cc_type: "Mastercard",
                                customer_vault_id: "1250378552"
                              }
 */
async function registerCreditCard(businessName, cardNumber, expire, cvv) {
  let addResponse = await PaymentController.addCustomer(
    '',
    businessName,
    '',
    cardNumber,
    expire,
    cvv
  )

  if (addResponse.response != '1' || !addResponse.customer_vault_id)
    return { success: false, message: addResponse.responsetext }
  let cList = await PaymentController.getCustomerInfoById(
    addResponse.customer_vault_id
  )
  let card = cList.find(
    (c) => c.customer_vault_id === addResponse.customer_vault_id
  )
  if (!card) return { success: false, message: 'Card not registered correctly' }
  let { first_name, cc_number, cc_type, customer_vault_id } = card
  return { success: true, first_name, cc_number, cc_type, customer_vault_id }
}

async function removeCreditCard(customer_vault_id) {
  let removeResponse = await PaymentController.deleteCustomer(customer_vault_id)
  if (removeResponse.response != '1')
    return { success: false, message: removeResponse.responsetext }
  return { success: true }
}
