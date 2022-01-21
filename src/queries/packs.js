const moment = require('moment');

const Knex = require('@/tools/Knex');

module.exports = {
  orm: null,

  set(orm = Knex) {
    this.orm = orm
  },

  get(where = null) {
    const query = this.orm('token_packs as pak').select(
      'pak.id as id',
      'pak.name as name',
      'pak.description as description',
      'pak.color as color',
      'pak.price as price',
      'pak.nbr_tokens as nbr_tokens',
      'pak.created_at as created_at',
      'pak.updated_at as updated_at',
    )

    if (where) {
      query.where(where);
    }

    return query;
  },

  create(data) {
    const query = this.orm('token_packs').insert({
      name: data.name,
      description: data.description,
      price: data.price,
      nbr_tokens: data.nbr_tokens,
      color: data.color,
      created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
      updated_at: moment().format('YYYY-MM-DD HH:mm:ss'),
    });
    return query;
  },

  update(id, data) {
    const query = this.orm('token_packs').where({ id }).update({
      ...data,
      updated_at: moment().format('YYYY-MM-DD HH:mm:ss'),
    });
    return query;
  },

  delete(where) {
    const query = this.orm('token_packs').where(where).delete();
    return query;
  },

  buy(user_id, data) {
    const query = this.orm('token_packs_history').insert({
      user_id,
      pay_method: data.method,
      pack_id: data.pack_id,
      created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
      updated_at: moment().format('YYYY-MM-DD HH:mm:ss'),
    });
    return query;
  }
}
