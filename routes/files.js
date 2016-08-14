/**
 * Indexes: id (file_id)
 * Maybe should change this. So there is rethink id and slack file id
 */

var router = require('koa-router')()
var r = require('rethinkdb')

class Options {
  constructor (query, params) {
    this.search = query.search || null
    this.limit = query.limit || 200
    this.skip = query.skip || 0
    this.query = r.table('files')
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
 * Insert a file
 */
router.post('/', function* (next) {
  var cursor = yield r.table('files')
                      .insert(this.request.body).run(this._rdbConn)
  this.body = {
    status: 'success',
    data: {},
    message: 'File added'
  }
  yield next
})

/**
 * Get a specific file
 */
router.get('/:file?', function* (next) {
  var options = new Options(this.query, this.params)
  if(this.params.file) options.query = options.query.getAll(this.params.file, { index: 'id' })

  var cursor = yield options.GET(this._rdbConn)

  this.body = {
    status: 'success',
    data: { message: yield cursor.toArray() },
    message: null
  }

  yield next
})

module.exports = router
