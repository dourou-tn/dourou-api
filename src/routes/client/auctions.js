const auctionQueries = require('@/queries/auctions');
const subscribeQueries = require('@/queries/subscribe');
const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_TOKEN_KEY;
const moment = require('moment');

exports.upcoming = async (req, res) => {
  auctionQueries.set();
  try {
    const auctions = auctionQueries.upcoming()
    let token = req.header("Authorization");
    if (token) {
      token = token.split("Bearer ")[1];
      const decoded = jwt.verify(token, SECRET)
      req.user = decoded.user
    }

    if (req.user) {
      auctions.leftJoin('auction_user as uact', function() {
        this.on('uact.auction_id', '=', 'act.id')
        this.on('uact.user_id', '=', req.user.id)
      });

      auctions.select('uact.id as is_subscribed');
    }

    const auctionsResult = await auctions;

    return res.status(200).json(auctionsResult.map(auction => {
      return {
        ...auction,
        product: JSON.parse(auction.product),
        start_date: moment(auction.start_date).format('YYYY-MM-DD HH:mm:ss')
      }
    }));

  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
}

exports.live = async (req, res) => {
  auctionQueries.set();
  subscribeQueries.set();

  try {
    let auctions = auctionQueries.live();
    let token = req.header("Authorization");
    if (token) {
      token = token.split("Bearer ")[1];
      const decoded = jwt.verify(token, SECRET)
      req.user = decoded.user
    }

    if (req.user) {
      auctions.leftJoin('auction_user as uact', function () {
        this.on('uact.auction_id', '=', 'act.id')
        this.on('uact.user_id', '=', req.user.id)
      });

      auctions.select('uact.id as is_subscribed');
    }

    // FIXME: this is duplicated code in /src/routes/client/room.js
    auctions = await auctions;
    auctions = auctions.map(auction => ({
      ...auction,
      product: JSON.parse(auction.product),
      end_date: moment(auction.start_date).add(auction.duration, 'minutes'),
    }));

    return res.status(200).json(auctions);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
}

exports.completed = async (req, res) => {
  auctionQueries.set();
  try {
    const auctions = await auctionQueries.completed();
    return res.status(200).json(auctions.map(auction => ({ ...auction, product: JSON.parse(auction.product) })));
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
}