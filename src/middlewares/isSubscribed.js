// const jwt = require("jsonwebtoken");
const Error = require('@/tools/Error');
// const SECRET = process.env.JWT_TOKEN_KEY;
const subscribeQueries = require('@/queries/subscribe');

/**
 * is subscribed middleware will check if the user is subed to the auction.
 * 
 * req.params.uiid is the uiid of the auction.
 * req.user is the logged user.
 */
module.exports = async (req, res, next) => {
  const { user } = req;
  const { auction_id } = req.body;

  if (!auction_id) {
    console.error('no auction_id provided');
    return res.status(401).send(Error(401, 'auction_id is required'));
  }
  subscribeQueries.set();
  const subscribe = await subscribeQueries.get({ 'sub.user_id': user.id, 'sub.auction_id': auction_id }).first();

  if (!subscribe) {
    console.error(`User ${user.id} is not subscribed to auction ${auction_id}`);
    return res.status(401).send(Error(401, 'You are not subscribed to this auction'));
  }
  next();
}