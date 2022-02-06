const router = require('express').Router()
const authMiddleware = require('@/middlewares/auth');
const isSubscribedMiddleware = require('@/middlewares/isSubscribed');

const auth = require('./auth');
const users = require('./users');
const products = require('./products');
const auctions = require('./auctions');
const jobs = require('./jobs');
const config = require('./config');
const packs = require('./packs');
const comingsoon = require('./comingsoon');

// client
const clientAuction = require('./client/auctions');
const clientSubscribe = require('./client/subscribe');
const clientPacks = require('./client/packs');
const clientRoom = require('./client/room');

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
router.get('/products/:id', authMiddleware, products.show);

// auctions
router.get('/auctions', authMiddleware, auctions.index);
router.post('/auctions', authMiddleware, auctions.store);
router.put('/auctions/:id', authMiddleware, auctions.update);
router.delete('/auctions/:id', authMiddleware, auctions.delete);
router.get('/auctions/:id', authMiddleware, auctions.show);

// jobs
router.get('/jobs/types', authMiddleware, jobs.getTypes);
router.get('/jobs/states', authMiddleware, jobs.getStates);
router.get('/jobs', authMiddleware, jobs.index);
router.post('/jobs', authMiddleware, jobs.store);
router.put('/jobs/:id', authMiddleware, jobs.update);
router.delete('/jobs/:id', authMiddleware, jobs.delete);
router.get('/jobs/:id', authMiddleware, jobs.show);

// packs
router.get('/packs', authMiddleware, packs.index);
router.post('/packs', authMiddleware, packs.store);
router.get('/packs/:id', authMiddleware, packs.show);
router.put('/packs/:id', authMiddleware, packs.update);
router.delete('/packs/:id', authMiddleware, packs.delete);

// client
router.get('/client/auctions/upcoming', clientAuction.upcoming);
router.get('/client/auctions/live', clientAuction.live);
router.get('/client/auctions/completed', clientAuction.completed);
router.post('/client/auctions/subscribe', authMiddleware, clientSubscribe.subscribe);
router.post('/client/packs/buy', authMiddleware, clientPacks.buy)
// client/room
router.post('/client/room', authMiddleware, isSubscribedMiddleware, clientRoom.join);
router.post('/client/room/bid', authMiddleware, isSubscribedMiddleware, clientRoom.bid);

// config
router.get('/config', config.get);

// comingsoon routes
router.post('/comingsoon/newsletter', comingsoon.newsletter);


module.exports = router
