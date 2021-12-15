const moment = require('moment');

const Knex = require('@/tools/Knex');

module.exports = {
  orm: null,

  set(orm = Knex) {
    this.orm = orm
  },

  get(where = null) {
    const query = this.orm('products as prod').select(
      'prod.id',
      'prod.name',
      'prod.slug',
      'prod.price',
      'prod.description',
      'prod.created_at',
      'prod.updated_at',
      'img.image_path as image_path',
    )

    if (where) {
      query.where(where);
    }

    query.leftJoin('imagables as img', { 'img.imagable_id': 'prod.id', 'img.imagable_type': Knex.raw('?', ['Product']) });

    return query;
  },

  async create(data) {
    const query = this.orm('products').insert({
      name: data.name,
      slug: data.slug,
      price: data.price,
      description: data.description,
      created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
      updated_at: moment().format('YYYY-MM-DD HH:mm:ss'),
    });
    return query;
  },

  update (where, data) {
    const query = this.orm('products').where(where).update({
      ...data,
      updated_at: moment().format('YYYY-MM-DD HH:mm:ss'),
    });
    return query;
  },

  delete(where) {
    const query = this.orm('products').where(where).delete();
    return query;
  }
}
