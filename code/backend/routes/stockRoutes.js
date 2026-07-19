const express = require('express');
const router = express.Router();
const { getStocks, getStockDetails, getStockHistory } = require('../controllers/stockController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getStocks);
router.get('/:symbol', protect, getStockDetails);
router.get('/:symbol/history', protect, getStockHistory);

module.exports = router;
