const packQueries = require('../queries/packs');

exports.index = async (req, res) => {
  try {
    packQueries.set();
    const packs = await packQueries.get();
    return res.status(200).json(packs);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

exports.store = async (req, res) => {
  const { name, description, price, nbr_tokens, color } = req.body;

  const errors = [];
  if (!name) errors.push('name is required');
  if (!description) errors.push('description is required');
  if (!price) errors.push('price is required');
  if (!nbr_tokens) errors.push('nbr_tokens is required');
  if (!color) errors.push('color is required');
  if (errors.length !== 0) {
    return res.status(500).json({ error: errors });
  }

  try {
    packQueries.set();
    const pack = await packQueries.create({ name, description, price, nbr_tokens, color });
    return res.status(200).json(pack);
  } catch(error) {
    return res.status(500).json({ error: error.message });
  }
}

exports.show = async (req, res) => {
  const { id } = req.params;

  try {
    packQueries.set();
    const pack = await packQueries.get({ 'pak.id': id }).first();
    return res.status(200).json(pack);
  } catch(error) {
    return res.status(500).json({ error: error.message });
  }
}

exports.update = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, nbr_tokens, color } = req.body;
  console.log('color', color)
  const errors = [];
  if (!name) errors.push('name is required');
  if (!description) errors.push('description is required');
  if (!price) errors.push('price is required');
  if (!nbr_tokens) errors.push('nbr_tokens is required');
  if (!color) errors.push('color is required');
  if (errors.length !== 0) {
    return res.status(500).json({ error: errors });
  }

  try {
    packQueries.set();
    const pack = await packQueries.update(id, { name, description, price, nbr_tokens, color });
    return res.status(200).json(pack);
  } catch(error) {
    return res.status(500).json({ error: error.message });
  }
}

exports.delete = async (req, res) => {
  const { id } = req.params;

  try {
    packQueries.set();
    const pack = await packQueries.delete({ id });
    return res.status(200).json(pack);
  } catch(error) {
    return res.status(500).json({ error: error.message });
  }
}
