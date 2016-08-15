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
router.get('/:channel', function* (next) {
  var options = new Options(this.query, this.params, 'channels')
  options.query = options.query.getAll(this.params.channel, { index: 'id' })

  var cursor = yield options.GET(this._rdbConn)

  this.body = {
    status: 'success',
    data: { message: yield cursor.toArray() },
    message: null
  }

  yield next
})

module.exports = router
