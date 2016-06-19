var router = require('koa-router')()
  ;

var channels  = require('../models/channels')
  ;

router
  .get('/:id?', function* (next) {
    var results = yield channels.find({
      channel: this.params.id
    });
    this.body = yield results;

    yield next;
  })
  .post('/', function* (next) {
    yield next;
  })
  .put('/', function* (next) {
    yield next;
  })
  .delete('/', function* (next) {
    yield next;
  });

module.exports = router;
