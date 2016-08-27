import Router from 'koa-router'
import r from 'rethinkdb'
import { Message } from '../models/Messages'
const router = new Router()

/**
 * Specific message
 */
router.get('/:ts/channels/:channel', async (ctx, next) => {
  ctx.body = {
    status: 'success',
    data: {
      message: await new Message(ctx).findBySlackId()
    },
    message: null
  }

  await next()
})

/**
 * Messages in channel
 */
router.get('/channels/:channel', async (ctx, next) => {
  ctx.body = {
    status: 'success',
    data: {
      message: await new Message(ctx).findByChannel()
    },
    message: null
  }

  await next()
})

/**
 * Messages in channel by user
 */
router.get('/channels/:channel/users/:user', async (ctx, next) => {
  ctx.body = {
    status: 'success',
    data: {
      messages: await new Message(ctx).findByUserChannel()
    },
    message: null
  }

  await next()
})

/**
 * Messages by user
 */
router.get('/users/:user', async (ctx, next) => {
  ctx.body = {
    status: 'success',
    data: {
      messages: await new Message(ctx).findByUser()
    },
    message: null
  }

  await next()
})

/**
 * Messages by user in channel (unnecessary, but whatever)
 */
router.get('/users/:user/channels/:channel', async (ctx, next) => {
  ctx.body = {
    status: 'success',
    data: {
      messages: await new Message(ctx).findByUserChannel()
    },
    message: null
  }

  await next()
})

/**
 * All messages
 */
router.get('/', async (ctx, next) => {
  ctx.body = {
    status: 'success',
    data: {
      messages: await new Message(ctx).findAll()
    },
    message: null
  }

  await next()
})

/**
 * Insert new message
 */
router.post('/', async (ctx, next) => {
  ctx.body = {
    status: 'success',
    data: {
      message: await new Message(ctx).insert()
    },
    message: 'Record created'
  }

  await next()
})

/**
 * Patch specific message
 */
 // Vulnerable. Use some kind of object validator to make sure this is gucci.
 // Nothing besides NSABot should have access to this method though.
router.patch('/:ts/channels/:channel', async (ctx, next) => {
  ctx.body = {
    status: 'success',
    data: {
      message: await new Message(ctx).update()
    },
    message: 'Record updated'
  }

  await next()
})

export default router
