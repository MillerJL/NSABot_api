import r from 'rethinkdb'
import config from 'config'

export const _connection = config.get('dbConfig')

export async function createConnection (ctx, next) {
  console.log('open');
  try{
    ctx._rdbConn = await r.connect(_connection)
  }
  catch(err) {
    ctx.status = 500
    ctx.body = err.message || http.STATUS_CODES[this.status]
  }
  await next()
}

/*
 * Close the RethinkDB connection
 */
export async function closeConnection(ctx, next) {
  console.log('close');
    ctx._rdbConn.close()
}



// Ugly and could handle errors better
export async function setup () {
  try {
    const conn = await r.connect(_connection)
    console.log('Setting up database...')

    /* Creates Database */
    const createDb = await r.dbCreate(_connection.db).run(conn).then( (result) => {
      console.log('Database: ' + _connection.db + ' created successfully\n')
    }).error( (err) => {
      console.log(err.msg)
    })

    /* Creates tables */
    const createTables = await r.tableList().run(conn).then( (result) => {
      console.log('Creating tables...')

      /* Add new tables here */
      const tablesToCreate = ['messages', 'channels', 'users', 'files', 'pins'].filter( (item) => {
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
    const indexes = {
      messages: [
        { name: 'full_id', fields: [r.row('ts'), r.row('channel')] },
        { name: 'channel', fields: r.row('channel') },
        { name: 'user', fields: r.row('user') }
      ]
    }
    const tableIndexPromises = []
    console.log('Creating indexes...')

    for(let table in indexes) {
      for(let index in indexes[table]) {
        index = indexes[table][index]
        console.log(index.name)
        tableIndexPromises.push(r.table(table).indexCreate(index.name, index.fields).run(conn).then( (result) => {
          console.log('Success')
        }).error( (err) => {
          console.log(err.msg)
        }))
      }
    }

    /* Creates Table Indexes */
    const createIndexes = await Promise.all(tableIndexPromises)
  } catch(err) {
    console.log('ERROR CREATING DATABASE', err)
  }
}
