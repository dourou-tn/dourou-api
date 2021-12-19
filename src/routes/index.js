const router = require('express').Router()
const authMiddleware = require('@/middlewares/auth');

const auth = require('./auth');
const users = require('./users');
const products = require('./products');
const auctions = require('./auctions');

// auth
router.post('/auth/register', auth.register);
router.post('/auth/login', auth.login);
router.post('/auth/user', authMiddleware, auth.user);

// users
router.get('/users', authMiddleware, users.index);
router.post('/users', users.store);
router.put('/users/:id', users.update);
router.delete('/users/:id', users.delete);

// products
router.get('/products', products.index);
router.post('/products', products.store);
router.put('/products/:id', products.update);
router.delete('/products/:id', products.delete);

// auctions
router.get('/auctions', auctions.index);
router.post('/auctions', auctions.store);
router.put('/auctions/:id', auctions.update);
router.delete('/auctions/:id', auctions.delete);

module.exports = router
