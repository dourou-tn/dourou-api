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
      'img.image_path as image_url',
    )
    if (where) {
      query.where(where);
    }
    if (include_password) {
      query.select('password');
    }
    query.leftJoin('imagables as img', { 'img.imagable_id': 'usr.id' });
    return query;
  },
  async create(data) {
    const query = this.orm('users').insert({
      email: data.email,
      username: data.username,
      firstname: data.firstname,
      lastname: data.lastname,
      phone: data.phone,
      role_id: data.role_id,
      password: data.password,
      created_at: moment().format('YYY-MM-DD HH:mm:ss'),
      updated_at: moment().format('YYY-MM-DD HH:mm:ss'),
    });
    return query;
  },
  update (id, data) {
    if (data.password_confirmation) {
      delete data.password_confirmation;
    }

    const query = this.orm('users').where({ id }).update({
      ...data,
      updated_at: moment().format('YYY-MM-DD HH:mm:ss'),
    });
    return query;
  },
  delete(where) {
    const query = this.orm('users').where(where).delete();
    return query;
  }
}
