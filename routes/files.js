import Router from 'koa-router'
import r from 'rethinkdb'
import Options from '../lib/options'
const router = new Router()

/**
 * Insert a file
 */
router.post('/', async (ctx, next) => {
  var cursor = await r.table('files')
                      .insert(ctx.request.body).run(ctx._rdbConn)
  ctx.body = {
    status: 'success',
    data: {},
    message: 'File added'
  }
  await next()
})

/**
 * Get a specific file
 */
router.get('/:file?', async (ctx, next) => {
  var options = new Options(ctx.query, ctx.params)
  if(ctx.params.file) options.query = options.query.getAll(ctx.params.file, { index: 'id' })

  var cursor = await options.GET(ctx._rdbConn)

  ctx.body = {
    status: 'success',
    data: { message: await cursor.toArray() },
    message: null
  }

  await next()
})

module.exports = router
