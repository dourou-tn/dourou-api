const moment = require('moment');

const Knex = require('@/tools/Knex');

module.exports = {
  orm: null,

  set (orm = Knex) {
    this.orm = orm
  },

  /**
   * Select users.
   * Can filter by where and include_password (for login)
   * @param {Object} where SQL where conditions
   * @param {Boolean} include_password Include password in user response
   * @returns Object
   */
  get(where = null, include_password = false) {
    const query = this.orm('users as usr').select(
      'usr.id',
      'usr.email',
      'usr.created_at',
      'usr.username',
      'usr.firstname',
      'usr.lastname',
      'usr.role_id',
      'usr.phone',
      'usr.tokens',
      'img.image_path as image_path',
    )

    if (where) {
      query.where(where);
    }

    if (include_password) {
      query.select('password');
    }

    query.leftJoin('imagables as img', { 'img.imagable_id': 'usr.id', 'img.imagable_type': Knex.raw('?', ['User']) })

    return query;
  },
  create(data) {
    const query = this.orm('users').insert({
      email: data.email,
      username: data.username,
      firstname: data.firstname,
      lastname: data.lastname,
      phone: data.phone,
      role_id: data.role_id,
      password: data.password,
      created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
      updated_at: moment().format('YYYY-MM-DD HH:mm:ss'),
    });
    return query;
  },
  update (id, data) {
    if (data.password_confirmation) {
      delete data.password_confirmation;
    }
    if (data.image_path) {
      delete data.image_path;
    }

    const query = this.orm('users').where({ id }).update({
      ...data,
      updated_at: moment().format('YYYY-MM-DD HH:mm:ss'),
    });
    return query;
  },
  delete(where) {
    const query = this.orm('users').where(where).delete();
    return query;
  },
  inscrementTokens(userId, tokens) {
    return this.orm('users').where({ id: userId }).increment('tokens', tokens);
  },
  getWithSubscribed (userId) {
    return this.get({ 'usr.id': userId })
      .select(Knex.raw('GROUP_CONCAT(actusr.auction_id) as sub_auctions'))
      .leftJoin('auction_user as actusr', { 'actusr.user_id': 'usr.id' })
      .groupBy('img.image_path')
  }
}
