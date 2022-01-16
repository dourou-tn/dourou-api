const moment = require('moment');
const Knex = require('@/tools/Knex');

module.exports = {
  orm: null,
  set(orm = Knex) {
    this.orm = orm
  },
  get(where = null) {
    const query = this.orm('configs as cnf').select(
      'cnf.id as id',
      'cnf.key as key',
      'cnf.value as value',
      'cnf.meta as meta',
      'cnf.description as description',
      'cnf.created_at as created_at',
      'cnf.updated_at as updated_at',
    );
    if (where) query.where(where);
    return query;
  }
}
