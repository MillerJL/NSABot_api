import r from 'rethinkdb'
import promisify from '../lib/Promisify'
import Joi from 'joi'

/**
 *
 */
export class Query {
  constructor (table, ctx) {
    this.query = r.table(table)
    this.qs = ctx.query
    this.params = ctx.params
    this.body = ctx.request.body
    this.conn = ctx._rdbConn

    this.whitelist = []
  }

  /**
   *
   */
  lazyMatch () {
    for(let key in this.qs.search) {
      this.query = this.query.filter(r.row(key).match(this.qs.search[key]))
    }

    return this
  }

  /**
   *
   */
  page () {
    this.query = this.query.limit(parseInt(this.qs.limit || 200)).skip(parseInt(this.qs.skip || 0))

    return this
  }

  /**
   *
   */
  optionsFindBy (options = {}) {
    const {
      page = true,
      match = true,
      run = true
    } = options

    if(match)
      this.lazyMatch()
    if(page)
      this.page()

    return (run) ? this.run() : this
  }

  /**
   *
   */
  validate (joiObject) {
    const validate = promisify(Joi.validate)

    return validate(this.body, this.whitelist)
  }

  /**
   *
   */
  run () {
    return this.query.run(this.conn).then( (cursor) => { return cursor.toArray() })
  }
}
