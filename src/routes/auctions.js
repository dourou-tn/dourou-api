const moment = require('moment');
const auctionQueries = require('@/queries/auctions');
const productQueries = require('@/queries/products');
const subscribeQueries = require('@/queries/subscribe');
// import uiid 4
const { v4: uuidv4 } = require('uuid');

const validateAuctionInput = (auction, config = null) => {
  const errors = {};
  const { start_date, start_time, product_id, subscribe_price, start_price, max_size } = auction;

  if (!start_date || !moment(start_date, 'YYYY-MM-DD').isValid()) {
    console.error('Error start_date')
    errors.start_date = 'start date is required';
  }

  if (!start_time || !moment(start_time, 'HH:mm').isValid()) {
    console.error('Error start_time')
    errors.start_time = 'start_time is required';
  }

  if (!product_id) {
    console.error('Error product_id')
    errors.product_id = 'product_id is required';
  }

  if (!subscribe_price || isNaN(subscribe_price)) {
    console.error('Error subscribe_price')
    errors.subscribe_price = 'subscribe_price is required';
  }

  if (!start_price || isNaN(start_price)) {
    console.error('Error start_price')
    errors.start_price = 'start_price is required';
  }

  if (!max_size || isNaN(max_size)) {
    console.error('Error max_size')
    errors.max_size = 'max_size is required';
  }

  return errors;
}

exports.validateAuctionInput = validateAuctionInput;

exports.index = async (req, res) => {
  try {
    auctionQueries.set();
    const auctions = await auctionQueries.get();
    return res.status(200).json(
      auctions.map(auction => {
        return {
          ...auction,
          product: JSON.parse(auction.product),
          start_date: moment(auction.start_date).format('YYYY-MM-DD HH:mm:ss')
        }
      })
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
}

exports.store = async (req, res) => {
  const errors = validateAuctionInput(req.body)

  if (Object.keys(errors).length > 0) {
    return res.status(400).json(errors);
  }

  try {
    const { start_date, description, start_time, product_id, subscribe_price, start_price, max_size } = req.body;


    productQueries.set();
    const product = await productQueries.get({ 'prod.id': product_id });
    if (!product) {
      return res.status(400).json({ success: false, error: `Product with ${product_id} does not exists!` });
    }

    auctionQueries.set();
    const [auctionCreatedId] = await auctionQueries.create({
      uiid: uuidv4(),
      start_date: `${start_date}`,
      description,
      product_id,
      product_id,
      subscribe_price,
      start_price,
      max_size,
    });

    if (auctionCreatedId) {
      const auction = await auctionQueries.get({ 'act.id': auctionCreatedId }).first();
      // const auction = await auctionQueries.get({ 'act.id': auctionCreatedId }).first();
      return res.status(200).json(auction);
    }

  } catch (error) {
    console.error(error)
    return res.status(500).json(error);
  }
}

exports.update = async (req, res) => {
  const errors = validateAuctionInput(req.body, { edit: true })
  if (Object.keys(errors).length > 0) {
    return res.status(400).json(errors);
  }
  try {
    const auction = await auctionQueries.get({ 'act.id': req.params.id }).first();
    if (!auction) {
      return res.status(400).json({ success: false, error: `Auction with ${req.params.id} does not exists!` });
    }

    // change product
    if (req.body.product_id !== auction.product_id) {
      const product = await productQueries.get({ 'prod.id': req.body.product_id }).first();
      if (!product) {
        return res.status(400).json({ success: false, error: `Product with ${req.body.product_id} does not exists!` });
      }
    }

    const auctionUpdated = await auctionQueries.update({ id: req.params.id }, req.body);

    if (!auctionUpdated) {
      return res.status(500).json({ success: false, erorr: 'Auction not updated' });
    }

    return res.status(200).json(auctionUpdated);
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }

}

exports.delete = async (req, res) => {
  auctionQueries.set();
  const auction = await auctionQueries.get({ 'act.id': req.params.id }).first();
  if (!auction) {
    return res.status(400).json({ success: false, error: `Auction with ${req.params.id} does not exists!` });
  }

  try {
    const auctionDeleted = await auctionQueries.delete({ id: req.params.id });
    if (!auctionDeleted) {
      return res.status(500).json({ success: false, error: 'Auction not deleted' });
    }
    return res.status(200).json(auctionDeleted);
  } catch (error) {
    res.status(500).json(error);
  }
}

exports.show = async (req, res) => {
  auctionQueries.set();
  subscribeQueries.set();

  const auction = await auctionQueries.get({ 'act.id': req.params.id }).first()

  if (!auction) {
    return res.status(400).json({ success: false, error: `Auction with ${req.params.id} does not exists!` });
  }

  auction.is_subscribed = await subscribeQueries.get({ 'sub.auction_id': auction.id, 'sub.user_id': req.user.id }).first() ? true : false;

  // return res.status(200).json(auction);
  return res.status(200).json({
    ...auction,
    start_date: moment(auction.start_date).format('YYYY-MM-DD'),
    start_time: moment(auction.start_date).format('HH:mm:ss'),
  });
}
