const moment = require('moment');

const Knex = require('@/tools/Knex');

module.exports = {
  orm: null,

  set(orm = Knex) {
    this.orm = orm
  },

  get(where = null) {
    const query = this.orm('jobs').select(
      'id',
      'uiid',
      'type',
      'state',
      'data',
      'created_at',
      'update_at',
    )

    if (where) {
      query.where(where);
    }

    return query;
  },

  create(data) {
    const query = this.orm('jobs').insert({
      uiid: data.uiid,
      type: data.type,
      state: data.state,
      data: JSON.stringify(data.data),
      created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
      updated_at: moment().format('YYYY-MM-DD HH:mm:ss'),
    });
    return query;
  },
}
