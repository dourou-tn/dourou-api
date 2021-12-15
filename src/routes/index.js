const router = require('express').Router()

/** Import routes */
const authRouter = require('./auth');
const usersRouter = require('./users')
const productsRouter = require('./products')
const auctionsRouter = require('./auctions')

router.use('/auth', authRouter)
router.use('/users', usersRouter)
router.use('/products', productsRouter)
router.use('/auctions', auctionsRouter)

module.exports = router
