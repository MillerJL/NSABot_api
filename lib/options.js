import r from 'rethinkdb'

export default class Options {
  constructor (query, params, table) {
    this.search = query.search || null
    this.limit = query.limit || 200
    this.skip = query.skip || 0
    this.query = r.table(table)
  }

  GET(conn) {
    for(let key in this.search) {
      this.query = this.query.filter(r.row(key).match(this.search[key]))
    }
    this.query = this.query.limit(parseInt(this.limit))
                           .skip(parseInt(this.skip))

    return this.query.run(conn)
  }
}
