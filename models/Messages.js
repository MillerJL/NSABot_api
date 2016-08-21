import r from 'rethinkdb'
import { Query } from './Query'
import Joi from 'joi'

export class Message extends Query {
  constructor (ctx) {
    super('messages', ctx)
  }

  findAll (options) {
    return this.optionsFindBy(options)
  }

  findBySlackId (options) {
    this.query = this.query.getAll([ this.params.ts, this.params.channel ], { index: 'full_id' })

    return this.optionsFindBy(options)
  }

  findByUser (options) {
    this.query = this.query.getAll(this.params.user, { index: 'user' })

    return this.optionsFindBy(options)
  }

  findByChannel (options) {
    this.query = this.query.getAll(this.params.channel, { index: 'channel' })

    return this.optionsFindBy(options)
  }

  findByUserChannel (options) {
    this.query = this.query.getAll(this.params.channel, { index: 'channel' }).filter({ user: this.params.user })

    return this.optionsFindBy(options)
  }

  async update (options = {}) {
    const {
      run = true
    } = options

    this.whitelist = Joi.object().keys({
      message: {
        text: Joi.string().required(),
        edited: {
          user: Joi.string().length(9).required(),
          ts: Joi.string().length(17).required()
        },
        attachments: Joi.object()
      },
      message_history: Joi.object().max(5)
    })

    try {
      const validatedObject = await this.validate()
      const update =  this.body.message
      update.message_history = r.row('message_history').append(this.body.message_history)

      this.query = this.query
                       .getAll([this.params.ts, this.params.channel], { index: 'full_id' })
                       .update(update)

      return (run) ? this.query.run(this.conn) : this
    } catch (err) {
      console.log(err)

      throw new Error('Error updating message in database. Incorrect message update format supplied.')
    }
  }

  async insert (options = {}) {
    const {
      run = true
    } = options

    this.whitelist = Joi.object().keys({
      type: Joi.string(),
      channel: Joi.string().length(9),
      user: Joi.string().length(9),
      text: Joi.string(),
      ts: Joi.string().length(17),
      team: Joi.string().length(9),
      message_history: Joi.array()
    })

    try {
      const validatedObject = await this.validate()
      this.query = this.query.insert(validatedObject)

      return (run) ? this.query.run(this.conn) : this
    } catch (err) {
      console.log(err)

      throw new Error('Error inserting data into database. Incorrect message format.')
    }
  }
}
