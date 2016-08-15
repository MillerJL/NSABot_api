require('dotenv').config()

var koa = require('koa')
var logger = require('koa-logger')
var router = require('koa-router')()
var bodyParser = require('koa-bodyparser')
var cache = require('memory-cache')

var db = require('./lib/db.js')

var app = koa()
require('koa-qs')(app)

/* Error handler */
app.use(function* (next) {
  try {
    yield next
  } catch (err) {
    this.status = err.status || 500
    this.body = err.message
    this.app.emit('error', err, this)
  }
})

app.use(db.createConnection)

/* Middleware */
app.use(logger())
app.use(bodyParser())

/* Route middleware */
var messages = require('./routes/messages')
var reactions = require('./routes/reactions')
var files = require('./routes/files')
var channels = require('./routes/channels')

router.use('/api/v1/messages', messages.routes())
router.use('/api/v1/reactions', reactions.routes())
router.use('/api/v1/files', files.routes())
router.use('/api/v1/channels', channels.routes())

app.use(router.routes())
app.use(router.allowedMethods())

/* Database Setup */
db.setup.then( (result) => {
  app.listen(process.env.KOA_PORT)
  console.log('Server listening on port', process.env.KOA_PORT)
}).catch( (err) => {
  console.log('Database failed to setup correctly.. App not starting');
})
