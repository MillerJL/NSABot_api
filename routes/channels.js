var router = require('koa-router')()

var channels = require('../models/channels')

router.get('/:id?', function* (next) {
  var findBy = {}
  if (this.params.id) findBy._id = this.params.id

  // update
  var results = yield channels.find(findBy)
  this.body = results

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
