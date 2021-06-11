const mongoose = require('mongoose')
const initializeDB = require('../src/db')
const Order = require('../src/models/Order')
const BusinessUser = require('../src/models/BusinessUser')
const Business = require('../src/models/Business')

beforeAll(async () => {
  await initializeDB()
})
const businessId = new mongoose.Types.ObjectId()

const businessOne = {
  _id: businessId,
  name: 'Business_1',
  phone: 987456321,
  mobile: 987456321,
  email: 'MyBusiness_1@gmail.com',
  logo:
    'https://preview.keenthemes.com/metronic/theme/html/demo1/dist/assets/media/svg/avatars/045-boy-20.svg',

  location: {
    type: 'Point',
    coordinates: [55.3951755465497, -3.48112336143829]
  },
  timeFrames: [
    { open: '10:30', close: '18:30', totallyClosed: false },
    { open: '10:30', close: '18:30', totallyClosed: false },
    { open: '10:30', close: '18:30', totallyClosed: false },
    { open: '10:30', close: '18:30', totallyClosed: false },
    { open: '10:30', close: '18:30', totallyClosed: false },
    { open: '11:00', close: '13:30', totallyClosed: false },
    { totallyClosed: true }
  ],
  customTimeFrames: [
    {
      id: '22fcdd0a-c219-4dc7-a0ff-b7e688af67a5',
      from: '2020-11-03',
      to: '2020-11-18',
      open: '10:30',
      close: '17:30',
      totallyClosed: false
    },
    {
      id: '22fcdd0a-c219-4dc7-a0zz-b7e688af67a5',
      from: '2020-12-01',
      to: '2020-12-07',
      totallyClosed: true
    }
  ],
  about: '',
  status: 'Active',
  coverageMaxValue: 0,
  enabled: true
}

const orderOne = {
  confirmationCode: '1025',
  senderModel: 'business',
  sender: '5f5359626c4abc2a899889c9',
  receiver: '5f50a4a5d2691a23b9e50bb9',
  email: 'nicccccol@gmail.com',
  packages: [
    {
      picture:
        'https://preview.keenthemes.com/metronic/theme/html/demo1/dist/assets/media/svg/avatars/045-boy-20.svg',
      note: 'sample package note',
      reference: '1148',
      description: 'description for Item package'
    }
  ],
  date: '2020-10-09',
  vehicleType: 'Car',
  cost: {
    total: 23.55,
    distance: 13.55,
    vehicleType: 7,
    tax: 3,
    businessCoverage: 0
  },
  time: {
    date: '2020-10-09'
  }
}

const businessUserId = new mongoose.Types.ObjectId()
const businessUser = {
  _id: businessUserId,
  firstName: 'User 0',
  lastName: '',
  business: businessId,
  password: '123456',
  email: 'business_1@pikdelivery.com',
  mobile: '123456789',
  enabled: true,
  token: BusinessUser.createSessionToken(businessUserId)
}
const setupDatabase = async () => {
  await BusinessUser.deleteMany()
  await Business.deleteMany()
  await Order.deleteMany()
  await new Business(businessOne).save()
  await new BusinessUser(businessUser).save()
  await new Order(orderOne).save()
}

module.exports = {
  businessUser,
  businessUserId,
  businessId,
  setupDatabase
}
