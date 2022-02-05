const auctionQueries = require('@/queries/auctions');
const userQueries = require('@/queries/users');
const bidQueries = require('@/queries/bids');

const moment = require('moment');
const { engine: roomEngine } = require('@/roomEngine');

exports.join = async (req, res) => {
  const { auction_id } = req.body;
  auctionQueries.set();

  try {
    const auction = await auctionQueries.get({ 'act.id': auction_id }).first();

    if (!auction) {
      console.error(`Auction ${auction_id} not found`);
      return res.status(404).json({ message: `auction ${auction_id} is not found` });
    }

    roomEngine.init();

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

exports.bid = async (req, res) => {
  const { auction_id, amount } = req.body;
  const user = req.user;

  // 1. check if user has tokens
  userQueries.set();
  let { tokens } = await userQueries.orm('users').select('tokens').where({ id: user.id }).first();
  if (tokens < 1) {
    return res.status(403).json({ message: 'You have no tokens' });
  }
  // 2. store history
  bidQueries.set();
  const bid = await bidQueries.save({ auction_id, user_id: user.id, price: amount });
  // 3. update user tokens
  const userUpdated = await userQueries.update(user.id, { tokens: tokens - 1 });
  // 4. update auction current_price
  const auctionUpdated = await auctionQueries.incrementCurrentPrice(auction_id, amount);

  // 5. get current_price
  const { current_price } = await auctionQueries.orm('auctions').select('current_price').where({ id: auction_id }).first();

  // 5. dispatch to all sockets in the channel/room.
  // current_price, last_bider: user_name, amount
  roomEngine.bid({ auction_id, current_price, last_bider: user.username, amount });

  return res.status(200).json({ success: true });
}