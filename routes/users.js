var router = require('koa-router')()

var users = require('../models/users')

router.get('/:id?', function* (next) {
  var findBy = {}
  if (this.params.id) findBy._id = this.params.id

  var results = yield users.find(findBy)
  var formattedResults = {
    'status': 'success',
    'data': results,
    'message': null
  }

  this.body = formattedResults

  yield next
})

router.post('/', function* (next) {
  yield next
})

router.put('/', function* (next) {
  yield next
})

router.delete('/', function* (next) {
  yield next
})

module.exports = router
