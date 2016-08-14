var router = require('koa-router')()
var r = require('rethinkdb')

class Options {
  constructor (query, params, table) {
    this.search = query.search || null
    this.limit = query.limit || 200
    this.skip = query.skip || 0
    this.query = r.table(table)
  }

  GET(conn) {
    this.query = this.query.limit(parseInt(this.limit))
                           .skip(parseInt(this.skip))
    for(var key in this.search) {
      this.query = this.query.filter(r.row(key).match(this.search[key]))
    }

    return this.query.run(conn)
  }
}

/**
 * Get a specific message
 * Slack ts + channel are unique
 */
router.get('/:ts/channels/:channel', function* (next) {
  var options = new Options(this.query, this.params, 'messages')
  options.query = options.query.getAll([this.params.ts, this.params.channel], { index: 'full_id' })

  var cursor = yield options.GET(this._rdbConn)

  this.body = {
    status: 'success',
    data: { message: yield cursor.toArray() },
    message: null
  }

  yield next
})

/**
 * Search messages in channel
 */
router.get('/channels/:channel', function* (next) {
  var options = new Options(this.query, this.params, 'messages')
  options.query = options.query.getAll(this.params.channel, { index: 'channel' })

  var cursor = yield options.GET(this._rdbConn)

  this.body = {
    status: 'success',
    data: { messages: yield cursor.toArray() },
    message: null
  }

  yield next
})

/**
 * Search messages in channel by user
 */
router.get('/channels/:channel/users/:user', function* (next) {
  var options = new Options(this.query, this.params, 'messages')
  options.query = options.query.getAll(this.params.channel, { index: 'channel' })
                               .filter({ user: this.params.user })

  var cursor = yield options.GET(this._rdbConn)

  this.body = {
    status: 'success',
    data: { messages: yield cursor.toArray() },
    message: null
  }

  yield next
})

/**
 * Search messages from a specific user across all channels
 */
router.get('/users/:user', function* (next) {
  var options = new Options(this.query, this.params, 'messages')
  options.query = options.query.getAll(this.params.user, { index: 'user' })

  var cursor = yield options.GET(this._rdbConn)

  this.body = {
    status: 'success',
    data: { messages: yield cursor.toArray() },
    message: null
  }

  yield next
})

/**
 * Search messages in channel by user
 */
router.get('/users/:user/channels/:channel', function* (next) {
  var options = new Options(this.query, this.params, 'messages')
  options.query = options.query.getAll(this.params.user, { index: 'user' })
                               .filter({ channel: this.params.channel })

  var cursor = yield options.GET(this._rdbConn)

  this.body = {
    status: 'success',
    data: { messages: yield cursor.toArray() },
    message: null
  }

  yield next
})

/**
 * Get all messages
 */
router.get('/', function* (next) {
  var options = new Options(this.query, this.params, 'messages')

  var cursor = yield options.GET(this._rdbConn)

  this.body = {
    status: 'success',
    data: { messages: yield cursor.toArray() },
    message: null
  }

  yield next
})

/**
 * Insert new message
 */
router.post('/', function* (next) {
  var result = yield r.table('messages')
                      .insert(this.request.body).run(this._rdbConn)

  this.body = {
    status: 'success',
    data: { message: result },
    message: 'Record created'
  }

  yield next
})

/**
 * Patch specific message
 */
router.patch('/:ts/channels/:channel', function* (next) {
  var options = new Options(this.query, this.params, 'messages')
  var update = this.request.body.message
  update.message_history = r.row('message_history').append(this.request.body.message_history)

  var cursor = yield options.query
                            .getAll([this.params.ts, this.params.channel], { index: 'full_id' })
                            .update(update).run(this._rdbConn)
  this.body = {
    status: 'success',
    data: {},
    message: 'Record updated'
  }
  yield next
})

module.exports = router
