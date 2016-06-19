var router = require('koa-router')()
  ;

var channels  = require('../models/channels')
  ;

router
  .get('/:id?', function* (next) {
    var findBy = {}
    if(this.params.id) findBy._id = this.params.id

    var results = yield channels.find(findBy);
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
