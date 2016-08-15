var db = {}
var co = require('co')
var r = require('rethinkdb')

db._connection = {
  host: process.env.RDB_HOST,
  port: process.env.RDB_PORT,
  db: process.env.RDB_DB
}

db.createConnection = function* (next) {
  try{
    this._rdbConn = yield r.connect(db._connection)
  }
  catch(err) {
    this.status = 500
    this.body = err.message || http.STATUS_CODES[this.status]
  }
  yield next
}

// Kinda ugly. Could handle errors better.
// Not completely sure about index create part. Should I use indexWait as well?
// There should be indexWaitOrCreate
db.setup = co(function* () {
  try {
    console.log('Setting up database...')
    var conn = yield r.connect(db._connection)
    var createDb = yield r.dbCreate(db._connection.db).run(conn).then( (result) => {
      console.log('Database: ' + db._connection.db + ' created successfully\n')
    }).error( (err) => {
      console.log(err.message);
    })

    var createTables = yield r.tableList().run(conn).then( (result) => {
      console.log('Creating tables...')
      /* Add new tables here */
      var tablesToCreate = ['messages', 'channels', 'users', 'files', 'pins'].filter( (item) => {
        return !new Set(result).has(item)
      })
      if(tablesToCreate.length > 0) console.log('Missing: ' + tablesToCreate + ' creating now..')

      return r.expr(tablesToCreate).forEach( (table) => {
        return r.tableCreate(table)
      }).run(conn).then( (result) => {
        console.log('Finished creating tables\n')
      })
    })

    /* Add new indexes here */
    var indexes = {
      messages: [
        { name: 'full_id', fields: [r.row('ts'), r.row('channel')] },
        { name: 'channel', fields: r.row('channel') },
        { name: 'user', fields: r.row('user') }
      ]
    }
    var tableIndexPromises = []
    console.log('Creating indexes...')
    for(table in indexes) {
      for(index in indexes[table]) {
        var index = indexes[table][index]
        console.log(index.name);
        tableIndexPromises.push(r.table(table).indexCreate(index.name, index.fields).run(conn).then( (result) => {
          console.log('Success')
        }).error( (err) => {
          console.log(err.msg);
        }))
      }
    }

    var createIndexes = yield Promise.all(tableIndexPromises)
  } catch(err) {
    console.log('ERROR CREATING DATABASE', err)
  }
})

module.exports = db
