import Router from 'koa-router'
import r from 'rethinkdb'
import { File } from '../models/files'
const router = new Router()

/**
 * Insert a file
 */
router.post('/', async (ctx, next) => {
  ctx.body = {
    status: 'success',
    data: {
      message: await new File(ctx).insert()
    },
    message: 'File record created'
  }

  await next()
})

/**
 * Get all files or a specific file
 */
router.get('/:file?', async (ctx, next) => {
  const file = new File(ctx)

  ctx.body = {
    status: 'success',
    data: {
      messages: (ctx.params.file) ? await file.findById() : await file.findAll()
    },
    message: null
  }

  await next()
})

module.exports = router
