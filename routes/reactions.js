import Router from 'koa-router'
import r from 'rethinkdb'
import Options from '../lib/options'
const router = new Router()

/**
 * Insert a new message reaction
 * It's a new reaction, but modifying existing message data. Should ctx be patch?
 */
router.post('/messages/:ts/channels/:channel', async (ctx, next) => {
  var update = ctx.request.body

  var cursor = await r.table('messages')
                      .getAll([ctx.params.ts, ctx.params.channel], { index: 'full_id' })
                      .update( (message) => {
                        return { reactions: message('reactions').default([]).append(update)}
                      }).run(ctx._rdbConn)
  ctx.body = {
    status: 'success',
    data: {},
    message: 'Reaction added'
  }

  await next()
})

/**
 * Delete a reaction from a particular message
 */
router.delete('/messages/:ts/channels/:channel', async (ctx, next) => {
  var params = ctx.params
  var body = ctx.request.body

  var cursor = await r.db('sdp_test1').table('messages').getAll(
                        [params.ts, params.channel], { index: 'full_id' }
                      ).update({
                        reactions: r.row('reactions').filter(function (doc) {
	                         return doc('reaction').eq(body.reaction).and(doc('user').eq(body.user)).not()
                         })
                      }).run(ctx._rdbConn)

  ctx.body = {
    status: 'success',
    data: {},
    message: 'Reaction removed'
  }

  await next()
})

/**
 * Insert a new file reaction
 * It's a new reaction, but modifying existing file data. Should ctx be patch?
 */
router.post('/files/:file', async (ctx, next) => {
  var update = ctx.request.body

  var cursor = await r.table('files')
                      .getAll(ctx.params.file, { index: 'id' })
                      .update( (message) => {
                        return { reactions: message('reactions').default([]).append(update)}
                      }).run(ctx._rdbConn)
  ctx.body = {
    status: 'success',
    data: {},
    message: 'Reaction added'
  }

  await next()
})

/**
 * Delete a reaction from a particular file
 */
router.delete('/files/:file', async (ctx, next) => {
  var params = ctx.params
  var body = ctx.request.body

  var cursor = await r.table('files')
                      .getAll(ctx.params.file, { index: 'id' })
                      .update({
                        reactions: r.row('reactions').filter(function (doc) {
	                         return doc('reaction').eq(body.reaction).and(doc('user').eq(body.user)).not()
                         })
                      }).run(ctx._rdbConn)

  ctx.body = {
    status: 'success',
    data: {},
    message: 'Reaction removed'
  }

  await next()
})

module.exports = router
