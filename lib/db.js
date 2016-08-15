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

// Kinda ugly
db.setup = co(function* () {
  try {
    console.log('Setting up database...')
    var conn = yield r.connect(db._connection)
    var createDb = yield r.dbCreate(db._connection).run(conn).then( (result) => {
      console.log('Database: ' + process.env.RDB_DB + ' created successfully\n')
    }).error( (err) => {
      console.log('Database: ' + process.env.RDB_DB + ' already exists or failed to create\n')
    })

    var createTables = yield r.tableList().run(conn).then( (result) => {
      console.log('Creating tables...')
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

    var createIndexes = yield (function() {
      console.log('Creating indexes...')
      var indexes = {
        messages: [
          { name: 'full_id', fields: [r.row('ts'), r.row('channel')] },
          { name: 'channel', fields: r.row('channel') },
          { name: 'user', fields: r.row('user') }
        ]
      }
      var tableIndexPromises = []

      for(table in indexes) {
        for(index in indexes[table]) {
          var index = indexes[table][index]
          tableIndexPromises.push(r.table(table).indexWait(index.name).run(conn).then( (result) => {
            console.log(table + ' index ' + result[0].index + ' ready')
          }).error( (err) => {
            console.log('ERROR: ' + table + ' index ' + index.name + ' does not exist. Creating now...')
            r.table(table).indexCreate(index.name, index.fields).run(conn).then( (result) => {
              console.log(table + ' index ' + result[0].index + ' created')
            }).error( (err) => {
              console.log('ERROR: ' + table + ' index ' + index.name + ' Failed to create')
            })
          }))
        }
      }
      return Promise.all(tableIndexPromises)
    })()
  } catch(err) {
    console.log(err)
  }
})

module.exports = db
