const initializeDB = require('../db')

const pricingGroupsFeed = require('./pricing-groups-feed')
const adminUserFeed = require('./admin-users-feed')
const customersFeed = require('./customers-feed')
const driversFeed = require('./drivers-feed')
const businessFeed = require('./business-feed')
const businessUserFeed = require('./business-users-feed')
const orderFeed = require('./order-feed')
const invoiceFeed = require('./invoice-feed')
const paymentFeed = require('./payment-feed')

// connect to db
initializeDB().then(() => {
  console.log('feed connected to db ...')

  Promise.resolve(true)
    .then(pricingGroupsFeed)
    .then(adminUserFeed)
    // .then(customersFeed)
    // .then(driversFeed)
    // .then(businessFeed)
    // .then(businessUserFeed)
    // .then(orderFeed)
    // .then(invoiceFeed)
    // .then(paymentFeed)
    .catch(console.error)
    .then(() => {
      console.log('feed ends.')
      process.exit(0)
    })
})
