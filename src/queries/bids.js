const moment = require('moment');

const Knex = require('@/tools/Knex');

module.exports = {
  orm: null,

  set(orm = Knex) {
    this.orm = orm;
  },

  save(data) {
    return this.orm('bids').insert({
      user_id: data.user_id,
      auction_id: data.auction_id,
      price: data.price,
      created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
    })
  },
}
