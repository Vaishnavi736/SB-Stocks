const stockService = require('../services/stockService');

/**
 * @desc    Get market overview or search stocks
 * @route   GET /api/stocks
 * @access  Private
 */
const getStocks = async (req, res) => {
  try {
    const { search } = req.query;

    if (search) {
      const results = await stockService.searchStocks(search);
      return res.json({ success: true, results });
    }

    const movers = await stockService.getMarketMovers();
    return res.json({ success: true, ...movers });
  } catch (error) {
    console.error(`Error in getStocks: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Failed to fetch market details' });
  }
};

/**
 * @desc    Get detailed stock data (quote, profile, news)
 * @route   GET /api/stocks/:symbol
 * @access  Private
 */
const getStockDetails = async (req, res) => {
  try {
    const { symbol } = req.params;
    
    // Check if symbol exists in our mock base or is valid string
    if (!symbol || typeof symbol !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid stock symbol' });
    }

    const uppercaseSymbol = symbol.toUpperCase();

    // Fetch quote, profile and news concurrently
    const [quote, profile, news] = await Promise.all([
      stockService.getQuote(uppercaseSymbol),
      stockService.getCompanyProfile(uppercaseSymbol),
      stockService.getStockNews(uppercaseSymbol)
    ]);

    return res.json({
      success: true,
      data: {
        symbol: uppercaseSymbol,
        quote,
        profile,
        news
      }
    });
  } catch (error) {
    console.error(`Error in getStockDetails for ${req.params.symbol}: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Failed to retrieve stock details' });
  }
};

/**
 * @desc    Get historical candle data for charts
 * @route   GET /api/stocks/:symbol/history
 * @access  Private
 */
const getStockHistory = async (req, res) => {
  try {
    const { symbol } = req.params;
    let { resolution, days } = req.query;

    if (!symbol) {
      return res.status(400).json({ success: false, message: 'Symbol parameter is required' });
    }

    // Default parameters
    resolution = resolution || 'D';
    days = days ? parseInt(days, 10) : 30;

    const history = await stockService.getHistoricalData(symbol, resolution, days);
    return res.json({ success: true, history });
  } catch (error) {
    console.error(`Error in getStockHistory for ${req.params.symbol}: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Failed to retrieve stock history' });
  }
};

module.exports = {
  getStocks,
  getStockDetails,
  getStockHistory
};
