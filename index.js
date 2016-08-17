import Koa from 'koa'
import logger from 'koa-logger'
import Router from 'koa-router'
import bodyParser from 'koa-bodyparser'
import cache from 'memory-cache'
import * as db from './lib/db.js'
const app = new Koa()
const router = new Router()
require('koa-qs')(app)

/* Error handler */
app.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    ctx.status = 500
    ctx.body = err.message
    ctx.app.emit('error', err, ctx)
  }
})

/* Middleware */
app.use(db.createConnection)
app.use(logger())
app.use(bodyParser())

/* Route middleware */
import messages from './routes/messages'
import reactions from './routes/reactions'
import files from './routes/files'
import channels from './routes/channels'

router.use('/api/v1/messages', messages.routes())
router.use('/api/v1/reactions', reactions.routes())
router.use('/api/v1/files', files.routes())
router.use('/api/v1/channels', channels.routes())

app.use(router.routes())
app.use(router.allowedMethods())

/* Database Setup and App Start */
db.setup().then( (result) => {
  app.listen(3000, () => console.log('Server listening on port', 3000))
}).catch( (err) => {
  console.log(err);
  console.log('Error starting app...')
})
