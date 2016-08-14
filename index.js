require('dotenv').config()

var koa = require('koa')
var logger = require('koa-logger')
var router = require('koa-router')()
var bodyParser = require('koa-bodyparser')
var cache = require('memory-cache')

var app = koa()
require('koa-qs')(app)

var r = require('rethinkdb')

/**
 * Error handler
 */
app.use(function* (next) {
  try {
    yield next
  } catch (err) {
    this.status = err.status || 500
    this.body = err.message
    this.app.emit('error', err, this)
  }
})

/*
 * Create a RethinkDB connection, and save it in req._rdbConn
 */
function* createConnection (next) {
  try{
    this._rdbConn = yield r.connect({
      host: process.env.RDB_HOST,
      port: process.env.RDB_PORT,
      db: process.env.RDB_DB
    })
  }
  catch(err) {
    this.status = 500
    this.body = err.message || http.STATUS_CODES[this.status]
  }
  yield next
}

app.use(createConnection)

/* Middleware */
app.use(logger())
app.use(bodyParser())

/* Route middleware */
var messages = require('./routes/messages')
var reactions = require('./routes/reactions')
var files = require('./routes/files')

router.use('/api/v1/messages', messages.routes())
router.use('/api/v1/reactions', reactions.routes())
router.use('/api/v1/files', files.routes())

app.use(router.routes())
app.use(router.allowedMethods())

app.listen(process.env.KOA_PORT)
console.log('Server listening on port', process.env.KOA_PORT)
