const app = require('./app')
const initializeDb = require('./db')
const CronJobs = require('./cron-jobs')
require('./coreEventHandlers');

initializeDb().then((db) => {
  app.server.listen(process.env.HTTP_PORT || config.port, () => {
    console.log(`Started on port ${app.server.address().port}`)
    CronJobs.init()
  })
})

module.exports = app
