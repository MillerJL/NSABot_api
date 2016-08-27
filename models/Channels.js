import r from 'rethinkdb'
import { Query } from './Query'
import Joi from 'joi'

export class Channel extends Query {
  constructor (ctx) {
    super('channels', ctx)
  }

  findAll (options) {
    return this.optionsFindBy(options)
  }

  findByChannel (options) {
    this.query = this.query.getAll(this.params.channel, { index: 'id' })

    return this.optionsFindBy(options)
  }

  findUsersInChannel (options) {
    this.query = this.query.getAll(this.params.user, { index: 'user' })

    return this.optionsFindBy(options)
  }

  async update (options = {}) {
    const {
      run = true
    } = options

    this.whitelist = Joi.object().options({ stripUnknown: true }).keys({
      name: Joi.string(),
      topic: Joi.object().keys({
        value: Joi.string(),
        creator: Joi.string().length(9),
        last_set: Joi.number().integer()
      }),
      purpose: Joi.object().keys({
        value: Joi.string(),
        creator: Joi.string().length(9),
        last_set: Joi.number().integer()
      })
    })

    try {
      const validatedObject = await this.validate()
      this.query = this.query.getAll(this.params.channel, { index: 'id' }).update(validatedObject)
      console.log(validatedObject);

      return (run) ? this.query.run(this.conn) : this
    } catch (err) {
      console.log(err)

      throw new Error('Error updating channel in database.')
    }
  }

  async updateChannelInfo (options = {}) {
    const {
      run = true
    } = options

    this.whitelist = Joi.object().options({ stripUnknown: true }).keys({
      name: Joi.string().required(),
      is_channel: Joi.boolean().required(),
      created: Joi.number().integer().required(),
      creator: Joi.string().length(9).required(),
      is_archived: Joi.boolean().required(),
      is_general: Joi.boolean().required(),
      is_member: Joi.boolean().required(),
      members: Joi.array().required(),
      topic: Joi.object().options({ stripUnknown: true }).keys({
        value: Joi.string().allow(''),
        creator: Joi.string().length(9).allow(''),
        last_set: Joi.number().allow('')
      }),
      purpose: Joi.object().options({ stripUnknown: true }).keys({
        value: Joi.string().allow(''),
        creator: Joi.string().length(9).allow(''),
        last_set: Joi.number().integer().allow('')
      })
    })

    try {
      const validatedObject = await this.validate()

      this.query = this.query
                       .getAll(this.params.channel, { index: 'id' })
                       .update(validatedObject)

      return (run) ? this.query.run(this.conn) : this
    } catch (err) {
      console.log(err)

      throw new Error('Error updating message in database.')
    }
  }

  async insert (options = {}) {
    const {
      run = true
    } = options

    this.whitelist = Joi.object().options({ stripUnknown: true }).keys({
      id: Joi.string().length(9).required(),
      is_channel: Joi.boolean().required(),
      name: Joi.string().required(),
      created: Joi.number().integer().required(),
      creator: Joi.string().length(9).required(),
      is_shared: Joi.boolean().required(),
      is_org_shared: Joi.boolean().required(),
      event_ts: Joi.string().length(17).required()
    })

    try {
      const validatedObject = await this.validate()
      this.query = this.query.insert(validatedObject)

      return (run) ? this.query.run(this.conn) : this
    } catch (err) {
      console.log(err)

      throw new Error('Error inserting data into database.')
    }
  }
}
