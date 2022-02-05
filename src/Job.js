const jobQueries = require('@/queries/jobs');
const { v4: uuidv4 } = require('uuid');
const { engine: roomEngine } = require('@/roomEngine');
const moment = require('moment');
const CronJob = require('cron').CronJob;

exports.Job = {
  async createJob({ auction_id, start_date, duration, job_uiid }) {
    jobQueries.set();

    if (!job_uiid) {
      job_uiid = uuidv4();
      await jobQueries.create({
        uiid: job_uiid,
        state_id: 2, // on:waiting
        type_id: 1, // auction-start
        auction_id,
        start_date,
      });
    }

    const job = new CronJob(moment(start_date), async () => {
      await roomEngine.startRoom({
        auction_id,
        start_date: moment(start_date),
        end_date: moment(start_date).add(duration, 'minutes'),
        duration,
      });
    });

    job.start();

    console.log(`🤖 Job [${job_uiid}] for auction ${auction_id} started and will be fired the ${start_date}`);
    return job;
  },

  async initJobs () {
    jobQueries.set();
    const jobs = await jobQueries.notFinished();

    if (!jobs.length) {
      console.info('💬 No jobs found to start');
      return;
    }

    console.info(`💬 start initializing ${jobs.length} job(s)`);
    for (const job of jobs) {
      await this.createJob({
        auction_id: job.auction_id,
        start_date: job.start_date,
        duration: job.auction_duration,
        job_uiid: job.uiid,
      });
    };
  }

}