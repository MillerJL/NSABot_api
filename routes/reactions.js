/**
 * Indexes
 */

var router = require('koa-router')()
var r = require('rethinkdb')

/**
 * Insert a new message reaction
 * It's a new reaction, but modifying existing message data. Should this be patch?
 */
router.post('/messages/:ts/channels/:channel', function* (next) {
  var update = this.request.body

  var cursor = yield r.table('messages')
                      .getAll([this.params.ts, this.params.channel], { index: 'full_id' })
                      .update( (message) => {
                        return { reactions: message('reactions').default([]).append(update)}
                      }).run(this._rdbConn)
  this.body = {
    status: 'success',
    data: {},
    message: 'Reaction added'
  }

  yield next
})

/**
 * Delete a reaction from a particular message
 */
router.delete('/messages/:ts/channels/:channel', function* (next) {
  var params = this.params
  var body = this.request.body

  var cursor = yield r.db('sdp_test1').table('messages').getAll(
                        [params.ts, params.channel], { index: 'full_id' }
                      ).update({
                        reactions: r.row('reactions').filter(function (doc) {
	                         return doc('reaction').eq(body.reaction).and(doc('user').eq(body.user)).not()
                         })
                      }).run(this._rdbConn)

  this.body = {
    status: 'success',
    data: {},
    message: 'Reaction removed'
  }
  yield next
})

/**
 * Insert a new file reaction
 * It's a new reaction, but modifying existing file data. Should this be patch?
 */
router.post('/files/:file', function* (next) {
  var update = this.request.body

  var cursor = yield r.table('files')
                      .getAll(this.params.file, { index: 'id' })
                      .update( (message) => {
                        return { reactions: message('reactions').default([]).append(update)}
                      }).run(this._rdbConn)
  this.body = {
    status: 'success',
    data: {},
    message: 'Reaction added'
  }
  yield next
})

/**
 * Delete a reaction from a particular file
 */
router.delete('/files/:file', function* (next) {
  var params = this.params
  var body = this.request.body

  var cursor = yield r.table('files')
                      .getAll(this.params.file, { index: 'id' })
                      .update({
                        reactions: r.row('reactions').filter(function (doc) {
	                         return doc('reaction').eq(body.reaction).and(doc('user').eq(body.user)).not()
                         })
                      }).run(this._rdbConn)

  this.body = {
    status: 'success',
    data: {},
    message: 'Reaction removed'
  }
  yield next
})


module.exports = router
