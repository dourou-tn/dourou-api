const moment = require('moment');

const Knex = require('@/tools/Knex');

module.exports = {
  /**
   * Select users.
   * Can filter by where and include_password (for login)
   * @param {Object} where SQL where conditions
   * @param {Boolean} include_password Include password in user response
   * @returns Object
   */
  get(where = null, include_password = false) {
    const query = Knex('users').select(
      'id',
      'email',
      'created_at',
      'username',
      'firstname',
      'lastname',
      'role_id',
      'phone',
    )
    if (where) {
      query.where(where);
    }
    if (include_password) {
      query.select('password');
    }
    return query;
  },
  create(data) {
    const query = Knex('users').insert({
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

    const query = Knex('users').where({ id }).update({
      ...data,
      updated_at: moment().format('YYY-MM-DD HH:mm:ss'),
    });
    return query;
  },
  delete(where) {
    const query = Knex('users').where(where).delete();
    return query;
  }
}
