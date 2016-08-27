import r from 'rethinkdb'
import config from 'config'

export const _connection = config.get('dbConfig')

/**
 * Open new RethinkDB connection
 */
export async function createConnection (ctx, next) {
  try{
    ctx._rdbConn = await r.connect(_connection)
  }
  catch(err) {
    ctx.status = 500
    ctx.body = err.message || http.STATUS_CODES[this.status]
  }
  await next()
}

/**
 * Close the RethinkDB connection
 */
export async function closeConnection(ctx, next) {
  ctx._rdbConn.close()

  await next()
}

/**
 * Setup db, tables, and table indexes
 * Less ugly, but still very ugly
 */
export async function setup () {
  try {
    const conn = await r.connect(_connection)
    console.log('Setting up database...')

    /* Creates Database */
    const dbList = await r.dbList().run(conn)
    if(!dbList.includes(_connection.db)) {
      const createDb = await r.dbCreate(_connection.db).run(conn)
      console.log('Database: ' + _connection.db + ' created successfully\n')
    } else {
      console.log('Database: `' + _connection.db + '` already exists.')
    }

    /* Creates tables */
    console.log('Creating tables...')
    const tableList = await r.tableList().run(conn)

    const tablesToCreate = ['messages', 'channels', 'users', 'files', 'pins'].filter( (item) => {
      return !new Set(tableList).has(item)
    })

    /* Add new tables here */
    if(tablesToCreate.length > 0)
      console.log('Missing: ' + tablesToCreate + ' creating now..')
    if(tablesToCreate.length === 0)
      console.log('All tables already exist')

    await r.expr(tablesToCreate).forEach( (table) => {
      return r.tableCreate(table)
    }).run(conn)
    console.log('Finished creating tables\n')

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
          console.log('Index created')
        }).error( (err) => {
          console.log(err.msg)
        }))
      }
    }

    const createIndexes = await Promise.all(tableIndexPromises)

    return true
  } catch(err) {
    console.log('ERROR CREATING DATABASE', err)

    return false
  }
}
