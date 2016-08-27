import Router from 'koa-router'
import r from 'rethinkdb'
import { Channel } from '../models/Channels'
const router = new Router()

/**
 * Get a channel or specific channels
 */
router.get('/:channel?', async (ctx, next) => {
  const channel = new Channel(ctx)

  ctx.body = {
    status: 'success',
    data: {
      message: (ctx.params.channel) ? await channel.findByChannel() : await channel.findAll()
    },
    message: null
  }

  await next()
})

/**
 * Insert new channel
 */
router.post('/', async (ctx, next) => {
  ctx.body = {
    status: 'success',
    data: {
      message: await new Channel(ctx).insert()
    },
    message: 'Record created'
  }

  await next()
})

/**
 * Updates channel message, topic, name
 */
router.patch('/:channel', async (ctx, next) => {
  const temp = await new Channel(ctx).update()

  ctx.body = {
    status: 'success',
    data: {
      message: {}
    },
    message: 'Channel info updated'
  }
})

/**
 * Updates or creates all channel info. Used when bot joins a new channel
 */
router.put('/:channel', async (ctx, next) => {
  ctx.body = {
    status: 'success',
    data: {
      message: await new Channel(ctx).updateChannelInfo()
    },
    message: 'Channel updated'
  }

  await next()
})

module.exports = router
