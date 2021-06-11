const { version } = require('../../package.json')
const moment = require('moment')
const { Router } = require('express')
const adminRoutes = require('./admin')
const businessRoutes = require('./business')
const customerRoutes = require('./customer/customerRoutes')
const driverRoutes = require('./driver/driverRoutes')
const geoRoutes = require('./geo/geoRoutes')

const serverRoutes = require('./server')
const { forceAuthorized } = require('../middleware/auth')
const testImageResize = require('./testImageResize')

module.exports = () => {
  let api = Router()
  api.use('/admin', adminRoutes)
  api.use('/business', businessRoutes)
  api.use('/customer', customerRoutes)
  api.use('/driver', driverRoutes)
  api.use('/geo', geoRoutes)

  api.use('/server', serverRoutes)
  api.get('/test', forceAuthorized, testImageResize)
  api.get('/', (req, res) => {
    res.json({
      version,
      time: moment().format('YYYY-MM-DD HH:mm'),
      timestamp: Date.now()
    })
  })
  return api
}
