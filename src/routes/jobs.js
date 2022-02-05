const jobsQueries = require('../queries/jobs');
const Knex = require('@/tools/Knex');

exports.index = async (req, res) => {
  try {
    jobsQueries.set();
    const jobs = await jobsQueries.get().orderBy('job.id', 'desc');
    return res.status(200).json(jobs);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

exports.store = async (req, res) => {
  const { type_id, state_id, auction_id, start_date } = req.body;

  const errors = [];
  if (!type_id) errors.push('type_id is required');
  if (!state_id) errors.push('state_id is required');
  if (!auction_id) errors.push('auction_id is required');
  if (!start_date) errors.push('start_date is required');
  if (errors.length !== 0) {
    return res.status(500).json({ error: errors });
  }

  try {
    jobsQueries.set();
    const job = await jobQueries.create({
      uiid: uuidv4(),
      type_id: type_id,
      state: state_id,
      auction_id,
      start_date,
    });

    return res.status(200).json(job);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

exports.show = async (req, res) => {
  const { id } = req.params;

  try {
    jobsQueries.set();
    const job = await jobsQueries.get({ 'job.id': id }).first();
    return res.status(200).json(job);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

exports.update = async (req, res) => {
  const { id } = req.params;
  const { type_id, state_id, start_date, auction_id } = req.body;
  const errors = [];
  if (!type_id) errors.push('type_id is required');
  if (!state_id) errors.push('state_id is required');
  if (!start_date) errors.push('start_date is required');
  if (!auction_id) errors.push('auction_id is required');
  if (errors.length !== 0) {
    return res.status(500).json({ error: errors });
  }

  try {
    jobsQueries.set();
    const job = await jobsQueries.update(id, { type_id, state_id, start_date, auction_id });
    return res.status(200).json(job);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

exports.delete = async (req, res) => {
  const { id } = req.params;

  try {
    jobsQueries.set();
    const job = await jobsQueries.delete({ id });
    return res.status(200).json(job);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// sub routes (types, states) only gets
exports.getTypes = async (req, res) => {
  try {
    const types = await Knex('job_types').select('*');
    return res.status(200).json(types);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

exports.getStates = async (req, res) => {
  try {
    const states = await Knex('job_states').select('*');
    return res.status(200).json(states);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
