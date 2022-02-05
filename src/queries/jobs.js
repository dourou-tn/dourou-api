const moment = require('moment');

const Knex = require('@/tools/Knex');

module.exports = {
  orm: null,

  set(orm = Knex) {
    this.orm = orm
  },

  get(where = null) {
    const query = this.orm('jobs as job').select(
      'job.id',
      'job.uiid',
      'auc.id as auction_id',
      'auc.duration as auction_duration',
      'job.start_date',
      'job.created_at',
      'job.updated_at',
      'jobt.name as type',
      'jobs.name as state',
    );

    if (where) {
      query.where(where);
    }

    query.leftJoin('job_types as jobt', 'job.type_id', 'jobt.id');
    query.leftJoin('job_states as jobs', 'job.state_id', 'jobs.id');
    query.leftJoin('auctions as auc', 'job.auction_id', 'auc.id');

    return query;
  },

  create(data) {
    const query = this.orm('jobs').insert({
      ...data,
      created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
      updated_at: moment().format('YYYY-MM-DD HH:mm:ss'),
    });
    return query;
  },

  update(where, data) {
    const query = this.orm('jobs').update({
      ...data,
      updated_at: moment().format('YYYY-MM-DD HH:mm:ss'),
    }).where(where);
    return query;
  },

  delete(id) {
    const query = this.orm('jobs').delete().where({ id });
    return query;
  },

  notFinished () {
    const query = this.get().where('job.start_date', '>', moment().format('YYYY-MM-DD HH:mm:ss'));
    return query;
  }
}
