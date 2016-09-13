import r from 'rethinkdb'
import { Query } from './Query'
import Joi from 'joi'

/**
 *
 */
export class File extends Query {
  constructor (ctx) {
    super('files', ctx)
  }

  /**
   *
   */
  async findAll (options = {}) {
    const {
      run = true
    } = options

    return this.optionsFindBy(options)
  }

  /**
   *
   */
  async findById (options = {}) {
    const {
      run = true
    } = options

    this.query = this.query.getAll(this.params.file, { index: 'id' })

    return this.optionsFindBy(options)
  }

  /**
   *
   */
  async insert (options = {}) {
    const {
      run = true
    } = options

    this.whitelist = Joi.object().options({ stripUnknown: true }).keys({
      id: Joi.string().length(9),
      created: Joi.number().integer().max(9999999999).min(999999999).required(),
      timestamp: Joi.number().integer().max(9999999999).min(999999999).required(),
      name: Joi.string().required(),
      title: Joi.string().required(),
      mimetype: Joi.string().required(),
      filetype: Joi.string().required(),
      pretty_type: Joi.string(),
      user: Joi.string().length(9).required(),
      editable: Joi.boolean().required(),
      size: Joi.number().integer().required(),
      mode: Joi.string().required(),
      is_external: Joi.boolean().required(),
      external_type: Joi.string().allow('').required(),
      is_public: Joi.boolean().required(),
      public_url_shared: Joi.boolean().required(),
      username: Joi.string().allow('').required(),
      url_private: Joi.string().required(),
      url_private_download: Joi.string().required(),
      thumb_64: Joi.string().required(),
      thumb_80: Joi.string().required(),
      thumb_360: Joi.string().required(),
      thumb_360_w: Joi.number().integer().required(),
      thumb_360_h: Joi.number().integer().required(),
      thumb_160: Joi.string().required(),
      image_exif_rotation: Joi.number().integer().required(),
      original_w: Joi.number().integer().required(),
      original_h: Joi.number().integer().required(),
      permalink: Joi.string().required(),
      permalink_public: Joi.string().required(),
      channels: Joi.array().items(Joi.string().length(9)).required(),
      groups: Joi.array().items(Joi.string().length(9)).required(),
      ts: Joi.string().length(17).required()
    })

    try {
      const validatedObject = await this.validate()
      this.query = this.query.insert(validatedObject)

      return (run) ? this.query.run(this.conn) : this
    } catch (err) {
      console.log(err)

      throw new Error('Error inserting inserting file information into database')
    }
  }
}
