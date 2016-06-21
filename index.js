require('dotenv').config()

var koa = require('koa')
var logger = require('koa-logger')
var router = require('koa-router')()
var bodyParser = require('koa-bodyparser')

var app = koa()

app.use(function* (next) {
  try {
    yield next
  } catch (err) {
    this.status = err.status || 500
    this.body = err.message
    this.app.emit('error', err, this)
  }
})

app.use(logger())
app.use(bodyParser())

var messages = require('./routes/messages')
var channels = require('./routes/channels')
var users = require('./routes/users')

router.use('/api/v1/messages', messages.routes())
router.use('/api/v1/channels', channels.routes())
router.use('/api/v1/users', users.routes())

app.use(router.routes())
app.use(router.allowedMethods())

app.listen(process.env.LISTEN_PORT)
console.log('Server listening on port', process.env.LISTEN_PORT)
