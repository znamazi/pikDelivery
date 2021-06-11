require('./js-extend')
const http = require('http')
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const PageController = require('./controllers/PageController')
// require('./db')

const { authorize } = require('./middleware/auth')
const api = require('./api')
const config = require('./config.json')

let app = express()
app.server = http.createServer(app)

// logger
app.use(morgan('dev'))

// 3rd party middleware
app.use(
  cors({
    exposedHeaders: config.corsHeaders
  })
)

app.use(
  bodyParser.json({
    limit: config.bodyLimit
  })
)

app.use('/api/0.1', authorize, api())
app.use('/file', express.static('user_files'))
app.use('/page/:title', PageController.renderPage)
app.all('/stats', function (req, res, next) {
  res.send({ success: true, message: 'server running.' })
})

module.exports = app
