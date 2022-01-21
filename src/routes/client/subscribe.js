const auctionQueries = require('@/queries/auctions');
const subscribeQueries = require('@/queries/subscribe');

// @body: auction_id;
exports.subscribe = async (req, res) => {
  const user_id = req.user.id;
  const { auction_id } = req.body;

  if (!auction_id) {
    return res.status(400).json({ success: false, error: `Auction id is required!` });
  }

  try {
    auctionQueries.set();

    // check if the auction_id exists && not closed
    const auction = await auctionQueries.get({ 'act.id': auction_id, 'act.is_finished': null }).first();
    if (!auction) {
      return res.status(400).json({ success: false, message: `Auction id ${auction_id} is not valid!` });
    }

    // check if the user is already subscribed to the auction
    // TODO: create subscribeQueries
    subscribeQueries.set();
    const isSubscribed = await subscribeQueries.get({ 'sub.auction_id': auction_id, 'sub.user_id': user_id }).first();
    if (isSubscribed) {
      return res.status(400).json({ success: false, error: 'already_sub', message: `You are already subscribed to auction ${auction_id}!` });
    }

    // subscribe the user to the auction
    const subscribe = await subscribeQueries.create({ auction_id, user_id });
    if (subscribe) {
      return res.status(200).json({ success: true, data: {}, message: `You are now subscribed to auction ${auction_id}!` });
    }

  } catch (e) {
    console.error(e);
  }
}
