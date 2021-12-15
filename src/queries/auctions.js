const moment = require('moment');

const Knex = require('@/tools/Knex');

module.exports = {
  orm: null,

  set(orm = Knex) {
    this.orm = orm
  },

  get(where = null) {
    const query = this.orm('auctions as act').select(
      'act.id',
      'act.description',
      'act.start_date',
      'act.product_id',
      'act.is_finished',
      'act.subscribe_price',
      'act.start_price',
      'act.max_size',
      'act.created_at',
      'act.updated_at',
      Knex.raw('JSON_OBJECT(\'id\', prod.id, \'name\', prod.name, \'price\', prod.price) as product')
    )
    if (where) {
      query.where(where);
    }
    query.join('products as prod', { 'prod.id': 'act.product_id' });
    return query;
  },

  async create(data) {
    return this.orm('auctions').insert({
      description: data.description,
      start_date: data.start_date,
      product_id: data.product_id,
      is_finished: data.is_finished,
      subscribe_price: data.subscribe_price,
      start_price: data.start_price,
      max_size: data.max_size,
      created_at: moment().format('YYY-MM-DD HH:mm:ss'),
      updated_at: moment().format('YYY-MM-DD HH:mm:ss'),
    });
  },

  update(where, data) {
    return this.orm('products').where(where).update({
      description: data.description,
      start_date: data.start_date,
      product_id: data.product_id,
      is_finished: data.is_finished,
      subscribe_price: data.subscribe_price,
      start_price: data.start_price,
      max_size: data.max_size,
      updated_at: moment().format('YYY-MM-DD HH:mm:ss'),
    });
  },

  delete(where) {
    const query = this.orm('products').where(where).delete();
    return query;
  }
}
