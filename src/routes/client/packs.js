const packsQueries = require('@/queries/packs');
const usersQueries = require('@/queries/users');

// Attention: this route can buy packs for only current user.
exports.buy = async (req, res) => {
  const { pack_id, method } = req.body;

  if (!pack_id) {
    return res.status(400).json({ error: 'pack_id is required' });
  }

  if (!method) {
    return res.status(400).json({ error: 'method is required' });
  }

  packsQueries.set();
  usersQueries.set();
  const pack = await packsQueries.get({ 'pak.id': pack_id }).first();
  if (!pack) {
    return res.status(400).json({ error: 'invalid pack_id' });
  }


  try {
    console.log('req.user.tokens', req.user.tokens)
    const [ successBuy, updateUserTokens ] = await Promise.all([
      await packsQueries.buy(req.user.id, { pack_id: pack.id, method}),
      await usersQueries.inscrementTokens(req.user.id, pack.nbr_tokens)
    ]);
    return res.status(200).json({ success: true, message: 'Success' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }

}
