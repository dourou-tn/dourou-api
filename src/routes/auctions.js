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
    )
    if (where) {
      query.where(where);
    }
    query.join('products as prod', { 'prod.id': 'act.product_id' });
    return query;
  },

  async create(data) {
    const query = this.orm(this.table).insert({
      name: data.name,
      slug: data.slug,
      description: data.description,
      created_at: moment().format('YYY-MM-DD HH:mm:ss'),
      updated_at: moment().format('YYY-MM-DD HH:mm:ss'),
    });
    return query;
  },

  update(where, data) {
    const query = this.orm('products').where(where).update({
      ...data,
      updated_at: moment().format('YYY-MM-DD HH:mm:ss'),
    });
    return query;
  },

  delete(where) {
    const query = this.orm('products').where(where).delete();
    return query;
  }
}
