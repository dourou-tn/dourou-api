const auctionQueries = require('@/queries/auctions');
const moment = require('moment');

exports.room = async (req, res) => {
  const { auction_id } = req.body;
  auctionQueries.set();

  try {
    const auction = await auctionQueries.get({ 'act.id': auction_id }).first();

    if (!auction) {
      console.error(`Auction ${auction_id} not found`);
      return res.status(404).json({ message: `auction ${auction_id} is not found` });
    }

    // FIXME: this is duplicated code in /src/routes/client/auctions.js
    return res.status(200).json({
      ...auction,
      product: JSON.parse(auction.product),
      end_date: moment(auction.start_date).add(auction.duration, 'minutes')
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false });
  }
}
