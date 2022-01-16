const router = require('express').Router()
const authMiddleware = require('@/middlewares/auth');

const auth = require('./auth');
const users = require('./users');
const products = require('./products');
const auctions = require('./auctions');
const config = require('./config');

// auth
router.post('/auth/register', auth.register);
router.post('/auth/login', auth.login);
router.get('/auth/user', authMiddleware, auth.user);

// users
router.get('/users', authMiddleware, users.index);
router.post('/users', authMiddleware, users.store);
router.put('/users/:id', authMiddleware, users.update);
router.delete('/users/:id', authMiddleware, users.delete);

// products
router.get('/products', authMiddleware, products.index);
router.post('/products', authMiddleware, products.store);
router.put('/products/:id', authMiddleware, products.update);
router.delete('/products/:id', authMiddleware, products.delete);

// auctions
router.get('/auctions', authMiddleware, auctions.index);
router.post('/auctions', authMiddleware, auctions.store);
router.put('/auctions/:id', authMiddleware, auctions.update);
router.delete('/auctions/:id', authMiddleware, auctions.delete);

// config
router.get('/config', config.get);

module.exports = router
