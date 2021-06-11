const mongoose = require('mongoose')

const connectDB = () => {
  return new Promise(function (resolve, reject) {
    // connect to a database if needed, then pass it to `callback`:
    mongoose.connect(process.env.MONGOOSE_CS, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    })
    let db = mongoose.connection
    db.on('open', function (ref) {
      console.log('Connected to mongo server.')
      return resolve(db)
    })
    db.on('error', (err) => {
      console.log(`failed to connect mongo `, err.message)
      return reject(db)
    })
  })
}
module.exports = connectDB
