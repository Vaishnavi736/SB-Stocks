const express = require('express');
const router = express.Router();
const { getPortfolio, buyStock, sellStock } = require('../controllers/portfolioController');
const { protect } = require('../middleware/authMiddleware');
const { tradeValidator } = require('../middleware/validationMiddleware');

router.get('/', protect, getPortfolio);
router.post('/buy', protect, tradeValidator, buyStock);
router.post('/sell', protect, tradeValidator, sellStock);

module.exports = router;
