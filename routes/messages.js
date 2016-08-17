import Router from 'koa-router'
import r from 'rethinkdb'
import Options from '../lib/options'
const router = new Router()

/**
 * Get a specific message
 * Slack ts + channel are unique
 */
router.get('/:ts/channels/:channel', async (ctx, next) => {
  var options = new Options(this.query, this.params, 'messages')
  options.query = options.query.getAll([this.params.ts, this.params.channel], { index: 'full_id' })

  var cursor = await options.GET(this._rdbConn)

  this.body = {
    status: 'success',
    data: { message: await cursor.toArray() },
    message: null
  }

  await next()
})

/**
 * Search messages in channel
 */
router.get('/channels/:channel', async (ctx, next) => {
  var options = new Options(ctx.query, ctx.params, 'messages')
  options.query = options.query.getAll(ctx.params.channel, { index: 'channel' })

  var cursor = await options.GET(ctx._rdbConn)

  ctx.body = {
    status: 'success',
    data: { messages: await cursor.toArray() },
    message: null
  }

  await next()
})

/**
 * Search messages in channel by user
 */
router.get('/channels/:channel/users/:user', async (ctx, next) => {
  var options = new Options(ctx.query, ctx.params, 'messages')
  options.query = options.query.getAll(ctx.params.channel, { index: 'channel' })
                               .filter({ user: ctx.params.user })

  var cursor = await options.GET(ctx._rdbConn)

  ctx.body = {
    status: 'success',
    data: { messages: await cursor.toArray() },
    message: null
  }

  await next()
})

/**
 * Search messages from a specific user across all channels
 */
router.get('/users/:user', async (ctx, next) => {
  var options = new Options(ctx.query, ctx.params, 'messages')
  options.query = options.query.getAll(ctx.params.user, { index: 'user' })

  var cursor = await options.GET(ctx._rdbConn)

  ctx.body = {
    status: 'success',
    data: { messages: await cursor.toArray() },
    message: null
  }

  await next()
})

/**
 * Search messages in channel by user
 */
router.get('/users/:user/channels/:channel', async (ctx, next) => {
  var options = new Options(ctx.query, ctx.params, 'messages')
  options.query = options.query.getAll(ctx.params.user, { index: 'user' })
                               .filter({ channel: ctx.params.channel })

  var cursor = await options.GET(ctx._rdbConn)

  ctx.body = {
    status: 'success',
    data: { messages: await cursor.toArray() },
    message: null
  }

  await next()
})

/**
 * Get all messages
 */
router.get('/', async (ctx, next) => {
  var options = new Options(ctx.query, ctx.params, 'messages')

  var cursor = await options.GET(ctx._rdbConn)

  ctx.body = {
    status: 'success',
    data: { messages: await cursor.toArray() },
    message: null
  }

  await next()
})

/**
 * Insert new message
 */
router.post('/', async (ctx, next) => {
  var result = await r.table('messages')
                      .insert(ctx.request.body).run(ctx._rdbConn)

  ctx.body = {
    status: 'success',
    data: { message: result },
    message: 'Record created'
  }

  await next()
})

/**
 * Patch specific message
 */
router.patch('/:ts/channels/:channel', async (ctx, next) => {
  var options = new Options(ctx.query, ctx.params, 'messages')
  var update = ctx.request.body.message
  update.message_history = r.row('message_history').append(ctx.request.body.message_history)

  var cursor = await options.query
                            .getAll([ctx.params.ts, ctx.params.channel], { index: 'full_id' })
                            .update(update).run(ctx._rdbConn)
  ctx.body = {
    status: 'success',
    data: {},
    message: 'Record updated'
  }
  await next()
})

export default router
