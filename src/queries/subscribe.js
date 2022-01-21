const moment = require('moment');

const Knex = require('@/tools/Knex');

module.exports = {
  orm: (table) => Knex(table),

  set(orm = Knex) {
    this.orm = orm;
  },

  get(where = null) {
    const query = this.orm('auction_user as sub').select(
      'sub.id',
      'sub.auction_id',
      'sub.user_id',
      'sub.created_at',
      'sub.updated_at',
    )
    if (where) {
      query.where(where);
    }
    return query;
  },

  async create(data) {
    return this.orm('auction_user').insert({
      auction_id: data.auction_id,
      user_id: data.user_id,
      created_at: moment().format('YY-MM-DD HH:mm:ss'),
      updated_at: moment().format('YY-MM-DD HH:mm:ss'),
    });
  },

}
