const moment = require('moment');

const Knex = require('@/tools/Knex');

module.exports = {
  orm: null,

  set (orm = Knex) {
    this.orm = orm;
  },

  create(data) {
    return this.orm('imagables').insert({
      imagable_type: data.imagable_type,
      imagable_id: data.imagable_id,
      image_path: data.image_path,
      image_name: data.image_name,
      created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
      updated_at: moment().format('YYYY-MM-DD HH:mm:ss'),
    })
  },

  update(data, where) {
    return this.orm('imagables').where(where).update(data);
  },

  delete (where) {
    return this.orm('imagables').where(where).del();
  },

  get (where) {
    return this.orm('imagables').where(where);
  }
}
