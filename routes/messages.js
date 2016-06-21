var router = require('koa-router')()

var messages  = require('../models/messages')

// Is this good?
function* userChannel (params, query) {
  var results = yield messages.find({
    'channel': params.c_id,
    'user': params.u_id
  }, {
    limit: query.limit
  })

  var formattedResults = {
    'status': 'success',
    'data': results,
    'message': null
  }

  return formattedResults
}

router.get('/channels/:c_id', function* (next) {
  var results = yield messages.find({
    'channel': this.params.c_id
  }, {
    limit: this.query.limit
  })

  var formattedResults = {
    'status': 'success',
    'data': results,
    'message': null
  }

  this.body = formattedResults

  yield next
})

router.get('/channels/:c_id/users/:u_id', function* (next) {
  var results = yield userChannel(this.params, this.query)
  this.body = results

  yield next
})

router.get('/users/:u_id', function* (next) {
  var results = yield messages.find({
    'user': this.params.u_id
  }, {
    limit: this.query.limit
  })

  var formattedResults = {
    'status': 'success',
    'data': results,
    'message': null
  }

  this.body = formattedResults

  yield next
})

router.get('/users/:u_id/channels/:c_id', function* (next) {
  var results = yield userChannel(this.params, this.query)
  this.body = results

  yield next
})

router.get('/:id?', function* (next) {
  var findBy = {}
  if(this.params.id) findBy._id = this.params.id

  var results = yield messages.find(
    findBy
  , {
    limit: this.query.limit
  })

  var formattedResults = {
    'status': 'success',
    'data': results,
    'message': null
  }

  this.body = formattedResults

  yield next
})

router.post('/', function* (next) {
  var result = yield messages.insert(this.request.body)

  this.body = {
    'status': 'success',
    'data': {
      'id': result._id
    },
    'message': null
  }

  yield next
})

router.put('/', function* (next) {
  var message = this.request.body.message
  var previousMessage = this.request.body.previous_message

  var results = yield messages.update(
    {
      'ts': previousMessage.ts
    },
    {
      'type': message.type,
      'channel': this.request.body.channel,
      'user': message.user,
      'text': message.text,
      'ts': message.ts,
      'team': message.team,
      'subtype': this.request.body.subtype,
      'previous_message': previousMessage
    })

  // Bad?
  this.body = {
    'success': 'Message Received',
    'data': {
      'id': results._id
    },
    'message': null
  }

  yield next
})

router.delete('/channels/:c_id', function* (next) {
  yield next
})

module.exports = router
