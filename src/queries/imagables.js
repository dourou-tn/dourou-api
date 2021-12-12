const moment = require('moment');

const Knex = require('@/tools/Knex');

module.exports = {
  create(data) {
    return Knex('imagables').insert({
      imagable_type: data.imagable_type,
      imagable_id: data.imagable_id,
      image_path: data.image_path,
      image_name: data.image_name,
      created_at: moment().format('YYY-MM-DD HH:mm:ss'),
      updated_at: moment().format('YYY-MM-DD HH:mm:ss'),
    })
  },
}
