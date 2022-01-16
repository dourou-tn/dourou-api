const confQueries = require('../queries/config');

exports.get = async (req, res) => {
  const { key } = req.query;

  confQueries.set();
  // TODO: map the result as follow:
  // key: { value1: '', value2: '', value3: '', meta: json, description: '', created_at: '', updated_at: '' }

  let config;
  if (key) {
    config = await confQueries.get({ 'cnf.key': key });
  } else {
    config = await confQueries.get();
  }
  return res.status(200).json({ success: true, data: config });
}
