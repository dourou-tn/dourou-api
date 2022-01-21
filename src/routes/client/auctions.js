const auctionQueries = require('@/queries/auctions');

exports.upcoming = async (req, res) => {
  auctionQueries.set();
  const auctions = await auctionQueries.upcoming();
  return res.status(200).json(auctions);
}
