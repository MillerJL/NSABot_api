import r from 'rethinkdb'
import { Query } from './Query'
import Joi from 'joi'

/**
 *
 */
export class Reaction extends Query {
  constructor (options = {}) {
    const {
      table = 'messages',
      ctx
    } = options

    super(table, ctx)
  }

  /**
   *
   */
  async insertMessageReaction (options = {}) {
    const {
      run = true
    } = options

    this.whitelist = Joi.object().options({ stripUnknown: true }).keys({
      user: Joi.string().length(9).required(),
      reaction: Joi.string(),
      ts: Joi.string().length(17).required(),
      item_user: Joi.string()
    })

    try {
      const validatedObject = await this.validate()
      let update = validatedObject

      this.query = await this.query.getAll([this.params.ts, this.params.channel], { index: 'full_id' })
                                   .update( (message) => {
                                     return { reactions: message('reactions').default([]).append(update) }
                                   })

      return (run) ? this.query.run(this.conn) : this
    } catch (err) {
      console.log(err)

      throw new Error('Error inserting inserting reacitons into database')
    }
  }

  /**
   *
   */
  async deleteMessageReaction (options = {}) {
    const {
     run = true
    } = options

    try {
      let body = this.body

      this.query = this.query.getAll([this.params.ts, this.params.channel], { index: 'full_id' })
                             .update({
                               reactions: r.row('reactions').filter( (message) => {
                                 return message('reaction').eq(body.reaction).and(message('user').eq(body.user)).not()
                               })
                             })

      return (run) ? this.query.run(this.conn) : this
    } catch (err) {
      console.log(err)

      throw new Error('Error deleting reaction from database')
    }
  }

  /**
   *
   */
  async insertFileReaction (options = {}) {
    const {
      run = true
    } = options

    this.whitelist = Joi.object().options({ stripUnknown: true }).keys({
      user: Joi.string().length(9).required(),
      reaction: Joi.string(),
      ts: Joi.string().length(17).required(),
      item_user: Joi.string()
    })

    try {
      const validatedObject = await this.validate()

      this.query = this.query.getAll(this.params.file, { index: 'id' })
                             .update( (file) => {
                               return { reactions: file('reactions').default([]).append(validatedObject)}
                             })

      return (run) ? this.query.run(this.conn) : this
    } catch (err) {
      console.log(err)

      throw new Error('Error inserting inserting reacitons into database')
    }
  }

  /**
   *
   */
  async deleteFileReaction (options = {}) {
    const {
      run = true
    } = options

    try {
      let body = this.body

      this.query = this.query.getAll(this.params.file, { index: 'id' })
                             .update({
                               reactions: r.row('reactions').filter( (file) => {
                                 return file('reaction').eq(body.reaction).and(file('user').eq(body.user)).not()
                               })
                             })

      return (run) ? this.query.run(this.conn) : this
    } catch (err) {
      console.log(err)

      throw new Error('Error deleting reaction from database')
    }
  }
}
