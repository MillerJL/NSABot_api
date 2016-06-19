require('dotenv').config();

var koa = require('koa')
  , logger = require('koa-logger')
  , router = require('koa-router')()
  , bodyParser = require('koa-bodyparser')
  ;

var app = koa();

app.use(function *(next) {
  try {
    yield next;
  } catch (err) {
    this.status = err.status || 500;
    this.body = err.message;
    this.app.emit('error', err, this);
  }
});

app.use(logger())
   .use(bodyParser())
   ;

var messages = require('./routes/messages')
  , channels = require('./routes/channels')
  , users = require('./routes/users')
  ;

router.use('/api/v1/messages', messages.routes())
      .use('/api/v1/channels', channels.routes())
      .use('/api/v1/users', users.routes())
      ;

app.use(router.routes())
   .use(router.allowedMethods())
   ;

app.listen(process.env.LISTEN_PORT);
console.log('Server listening on port', process.env.LISTEN_PORT);
