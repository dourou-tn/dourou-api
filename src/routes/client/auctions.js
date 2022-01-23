const auctionQueries = require('@/queries/auctions');
const subscribeQueries = require('@/queries/subscribe');

exports.upcoming = async (req, res) => {
  auctionQueries.set();
  try {
    const auctions = await auctionQueries.upcoming();
    return res.status(200).json(auctions);
  } catch (error) {
    return res.status(500).json(error);
  }
}

exports.live = async (req, res) => {
  auctionQueries.set();
  subscribeQueries.set();

  try {
    const auctions = await auctionQueries.live();
    if (req.user) {
      for (const auction of auctions) {
        auction.is_subscribed = await subscribeQueries.get({ 'sub.auction_id': auction.id, 'sub.user_id': req.user.id }) ? true : false;
      }
    }

    return res.status(200).json(auctions);
  } catch (error) {
    return res.status(500).json(error);
  }
}