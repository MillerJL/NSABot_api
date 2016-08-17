import Router from 'koa-router'
import r from 'rethinkdb'
import Options from '../lib/options'
const router = new Router()

/**
 * Get a specific message
 * Slack ts + channel are unique
 */
router.get('/:channel?', async (ctx, next) => {
  var options = new Options(ctx.query, ctx.params, 'channels')
  if(ctx.params.file) options.query = options.query.getAll(ctx.params.channel, { index: 'id' })

  var cursor = await options.GET(ctx._rdbConn)

  ctx.body = {
    status: 'success',
    data: { message: await cursor.toArray() },
    message: null
  }

  await next()
})

module.exports = router
