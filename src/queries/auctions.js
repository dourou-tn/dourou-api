const moment = require('moment');

const Knex = require('@/tools/Knex');

module.exports = {
  orm: (table) => Knex(table),

  set(orm = Knex) {
    this.orm = orm;
  },

  get(where = null) {
    const query = this.orm('auctions as act').select(
      'act.id',
      'act.uiid',
      'act.description',
      'act.start_date',
      'act.end_date',
      'act.duration',
      'act.product_id',
      'act.is_finished',
      'act.subscribe_price',
      'act.start_price',
      'act.current_price',
      'act.max_size',
      'act.created_at',
      'act.updated_at',
      Knex.raw('JSON_OBJECT(\'id\', prod.id, \'name\', prod.name, \'price\', prod.price, \'image_path\', img.image_path) as product')
    )
    if (where) {
      query.where(where);
    }
    query.join('products as prod', { 'prod.id': 'act.product_id' });
    query.leftJoin('imagables as img', { 'img.imagable_id': 'prod.id', 'img.imagable_type': Knex.raw('?', ['Product']) });
    return query;
  },

  async create(data) {
    return this.orm('auctions').insert({
      uiid: data.uiid,
      description: data.description,
      start_date: data.start_date,
      end_date: data.end_date,
      product_id: data.product_id,
      is_finished: data.is_finished,
      subscribe_price: data.subscribe_price,
      start_price: data.start_price,
      current_price: data.current_price,
      max_size: data.max_size,
      duration: data.duration,
      created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
      updated_at: moment().format('YYYY-MM-DD HH:mm:ss'),
    });
  },

  update(where, data) {
    return this.orm('auctions').where(where).update({
      ...data,
      updated_at: moment().format('YYYY-MM-DD HH:mm:ss'),
    });
  },

  delete(where) {
    const query = this.orm('auctions').where(where).delete();
    return query;
  },

  upcoming () {
    return this.get().where('act.start_date', '>', moment().format('YYYY-MM-DD HH:mm:ss'));
  },

  live () {
    return this.get().where('start_date', '<=', moment().format('YYYY-MM-DD HH:mm:ss')).where('is_finished', null);
  },

  completed () {
    return this.get().where('is_finished', true);
  },

  getWithSubscribe (auctionId, userId) {
    return this.get({ 'act.id': auctionId })
      .select('uact.id as is_subscribed')
      .leftJoin('auction_user as uact', function () {
        this.on('uact.auction_id', '=', 'act.id')
        this.on('uact.user_id', '=', userId)
      })
  },

  incrementCurrentPrice (auctionId, amount) {
    return this.orm('auctions').where({ id: auctionId }).increment('current_price', amount);
  }
}
