const moment = require('moment');
const router = require('express').Router();
const auctionQueries = require('@/queries/auctions');
const productQueries = require('@/queries/products');

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

router.get('/', async (req, res) => {
  try {
    auctionQueries.set();
    const auctions = await auctionQueries.get();
    return res.status(200).json(
      auctions.map(auction => {
        return {
          ...auction,
          product: JSON.parse(auction.product),
          start_date: moment(auction.start_date).format('YYYY-MM-DD')
        }
      })
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
});

router.post('/', async (req, res) => {
  const errors = validateAuctionInput(req.body)

  if (Object.keys(errors).length > 0) {
    return res.status(400).json(errors);
  }

  try {

    productQueries.set();
    const product = await productQueries.get({ id: product_id });
    if (!product) {
      return res.status(400).json({ success: false, error: `Product with ${product_id} does not exists!` });
    }

    auctionQueries.set();

    const auctionCreatedId = auctionQueries.create({
      start_date: `${start_date} ${start_time}`,
      product_id,
      start_date,
      start_time,
      product_id,
      subscribe_price,
      start_price,
      max_size,
    });

    if (auctionCreatedId) {
      const auction = await auctionQueries.get({ id: auctionCreatedId }).first();
      return res.status(200).json(auction);
    }

  } catch (error) {
    console.error(error)
    return res.status(500).json(error);
  }
})

router.put('/:id', async (req, res) => {
  const errors = validateAuctionInput(req.body, { edit: true })
  if (Object.keys(errors).length > 0) {
    return res.status(400).json(errors);
  }
  try {
    const auction = await auctionQueries.get({ id: req.params.id }).first();
    if (!auction) {
      return res.status(400).json({ success: false, error: `Auction with ${req.params.id} does not exists!` });
    }

    // change product
    if (req.body.product_id !== auction.product_id) {
      const product = await productQueries.get({ id: req.body.product_id }).first();
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

})

router.delete('/:id', async (req, res) => {
  const auction = await auctionQueries.get({ id: req.params.id }).first();
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
    console.log(error);
    res.status(500).json(error);
  }
})

module.exports = router;
