const Watchlist = require('../models/Watchlist');
const stockService = require('../services/stockService');

/**
 * @desc    Get user's watchlist with current live prices
 * @route   GET /api/watchlist
 * @access  Private
 */
const getWatchlist = async (req, res) => {
  try {
    const watchlistItems = await Watchlist.find({ userId: req.user.id }).sort({ createdAt: -1 });

    const watchlist = await Promise.all(
      watchlistItems.map(async (item) => {
        try {
          const quote = await stockService.getQuote(item.stockSymbol);
          return {
            _id: item._id,
            stockSymbol: item.stockSymbol,
            companyName: item.companyName,
            price: quote.c,
            change: quote.d,
            changePercent: quote.dp,
            high: quote.h,
            low: quote.l
          };
        } catch (err) {
          console.error(`Error loading live quote for watchlist ${item.stockSymbol}:`, err.message);
          return {
            _id: item._id,
            stockSymbol: item.stockSymbol,
            companyName: item.companyName,
            price: 0,
            change: 0,
            changePercent: 0
          };
        }
      })
    );

    return res.json({ success: true, watchlist });
  } catch (error) {
    console.error(`Error in getWatchlist: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error loading watchlist' });
  }
};

/**
 * @desc    Add a stock symbol to watchlist
 * @route   POST /api/watchlist
 * @access  Private
 */
const addToWatchlist = async (req, res) => {
  try {
    const { stockSymbol, companyName } = req.body;
    const cleanSymbol = stockSymbol.toUpperCase().trim();

    // Check if already in watchlist
    const exists = await Watchlist.findOne({ userId: req.user.id, stockSymbol: cleanSymbol });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Stock already in watchlist' });
    }

    const item = await Watchlist.create({
      userId: req.user.id,
      stockSymbol: cleanSymbol,
      companyName: companyName.trim()
    });

    return res.status(201).json({ success: true, message: `${cleanSymbol} added to watchlist`, item });
  } catch (error) {
    console.error(`Error in addToWatchlist: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error updating watchlist' });
  }
};

/**
 * @desc    Remove a stock from watchlist
 * @route   DELETE /api/watchlist/:symbol
 * @access  Private
 */
const removeFromWatchlist = async (req, res) => {
  try {
    const { symbol } = req.params;
    const cleanSymbol = symbol.toUpperCase().trim();

    const result = await Watchlist.deleteOne({ userId: req.user.id, stockSymbol: cleanSymbol });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Stock not found in watchlist' });
    }

    return res.json({ success: true, message: `${cleanSymbol} removed from watchlist` });
  } catch (error) {
    console.error(`Error in removeFromWatchlist: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error updating watchlist' });
  }
};

module.exports = {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist
};
