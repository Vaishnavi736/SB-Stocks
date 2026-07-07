const User = require('../models/User');
const Holding = require('../models/Holding');
const Transaction = require('../models/Transaction');
const stockService = require('../services/stockService');

/**
 * @desc    Get user portfolio holdings with live values
 * @route   GET /api/portfolio
 * @access  Private
 */
const getPortfolio = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Retrieve database holdings
    const dbHoldings = await Holding.find({ userId: req.user.id });
    
    let holdingsTotalValue = 0;
    let holdingsTotalInvestment = 0;

    // Map database holdings to live valuations
    const holdings = await Promise.all(
      dbHoldings.map(async (holding) => {
        try {
          const quote = await stockService.getQuote(holding.stockSymbol);
          const currentPrice = quote.c;
          const currentValue = parseFloat((holding.quantity * currentPrice).toFixed(2));
          const profitLoss = parseFloat((currentValue - holding.totalInvestment).toFixed(2));
          const profitLossPercentage = holding.totalInvestment > 0 
            ? parseFloat(((profitLoss / holding.totalInvestment) * 100).toFixed(2))
            : 0;

          holdingsTotalValue += currentValue;
          holdingsTotalInvestment += holding.totalInvestment;

          return {
            _id: holding._id,
            stockSymbol: holding.stockSymbol,
            companyName: holding.companyName,
            quantity: holding.quantity,
            averageBuyPrice: holding.averageBuyPrice,
            totalInvestment: holding.totalInvestment,
            currentPrice,
            currentValue,
            profitLoss,
            profitLossPercentage,
            updatedAt: holding.updatedAt
          };
        } catch (err) {
          console.error(`Error loading live quote for holding ${holding.stockSymbol}:`, err.message);
          return {
            ...holding.toObject(),
            currentPrice: holding.averageBuyPrice,
            currentValue: holding.totalInvestment,
            profitLoss: 0,
            profitLossPercentage: 0
          };
        }
      })
    );

    // Calculate allocation percentage
    holdings.forEach(h => {
      h.allocationPercentage = holdingsTotalValue > 0
        ? parseFloat(((h.currentValue / holdingsTotalValue) * 100).toFixed(2))
        : 0;
    });

    const totalPortfolioValue = parseFloat((user.virtualBalance + holdingsTotalValue).toFixed(2));
    const totalProfitLoss = parseFloat((holdingsTotalValue - holdingsTotalInvestment).toFixed(2));
    const totalProfitLossPercentage = holdingsTotalInvestment > 0
      ? parseFloat(((totalProfitLoss / holdingsTotalInvestment) * 100).toFixed(2))
      : 0;

    // Update totalPortfolioValue in user doc silently
    user.totalPortfolioValue = totalPortfolioValue;
    await user.save();

    return res.json({
      success: true,
      data: {
        virtualBalance: user.virtualBalance,
        totalPortfolioValue,
        totalInvestment: holdingsTotalInvestment,
        currentHoldingsValue: holdingsTotalValue,
        totalProfitLoss,
        totalProfitLossPercentage,
        holdings
      }
    });
  } catch (error) {
    console.error(`Error in getPortfolio: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error retrieving portfolio' });
  }
};

/**
 * @desc    Buy a stock
 * @route   POST /api/portfolio/buy
 * @access  Private
 */
const buyStock = async (req, res) => {
  try {
    const { stockSymbol, companyName, quantity } = req.body;
    const qty = parseFloat(quantity);

    if (qty <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be greater than zero' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Fetch secure live quote
    const quote = await stockService.getQuote(stockSymbol.toUpperCase());
    const price = quote.c;
    const totalAmount = parseFloat((qty * price).toFixed(2));

    // Verify balance
    if (user.virtualBalance < totalAmount) {
      return res.status(400).json({ 
        success: false, 
        message: `Insufficient balance. Required: $${totalAmount.toLocaleString()}, Available: $${user.virtualBalance.toLocaleString()}` 
      });
    }

    // Deduct cash balance
    user.virtualBalance = parseFloat((user.virtualBalance - totalAmount).toFixed(2));

    // Update holdings
    let holding = await Holding.findOne({ userId: req.user.id, stockSymbol: stockSymbol.toUpperCase() });

    if (holding) {
      const newQuantity = holding.quantity + qty;
      const newTotalInvestment = holding.totalInvestment + totalAmount;
      const newAverageBuyPrice = parseFloat((newTotalInvestment / newQuantity).toFixed(2));

      holding.quantity = newQuantity;
      holding.totalInvestment = parseFloat(newTotalInvestment.toFixed(2));
      holding.averageBuyPrice = newAverageBuyPrice;
      await holding.save();
    } else {
      holding = await Holding.create({
        userId: req.user.id,
        stockSymbol: stockSymbol.toUpperCase(),
        companyName: companyName,
        quantity: qty,
        averageBuyPrice: price,
        totalInvestment: totalAmount
      });
    }

    // Create Transaction Log
    const transaction = await Transaction.create({
      userId: req.user.id,
      stockSymbol: stockSymbol.toUpperCase(),
      companyName,
      type: 'BUY',
      quantity: qty,
      price,
      totalAmount
    });

    // Update user total value
    const dbHoldings = await Holding.find({ userId: req.user.id });
    let holdingsTotalValue = 0;
    for (const h of dbHoldings) {
      const q = await stockService.getQuote(h.stockSymbol);
      holdingsTotalValue += h.quantity * q.c;
    }
    user.totalPortfolioValue = parseFloat((user.virtualBalance + holdingsTotalValue).toFixed(2));
    await user.save();

    return res.status(201).json({
      success: true,
      message: `Successfully purchased ${qty} shares of ${stockSymbol.toUpperCase()}`,
      transaction,
      virtualBalance: user.virtualBalance,
      totalPortfolioValue: user.totalPortfolioValue
    });
  } catch (error) {
    console.error(`Error in buyStock: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error processing transaction' });
  }
};

/**
 * @desc    Sell a stock
 * @route   POST /api/portfolio/sell
 * @access  Private
 */
const sellStock = async (req, res) => {
  try {
    const { stockSymbol, companyName, quantity } = req.body;
    const qty = parseFloat(quantity);

    if (qty <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be greater than zero' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if user owns the holding
    const holding = await Holding.findOne({ userId: req.user.id, stockSymbol: stockSymbol.toUpperCase() });
    if (!holding) {
      return res.status(400).json({ success: false, message: `You do not own any shares of ${stockSymbol.toUpperCase()}` });
    }

    if (holding.quantity < qty) {
      return res.status(400).json({ 
        success: false, 
        message: `Insufficient shares. Owned: ${holding.quantity}, Attempted to sell: ${qty}` 
      });
    }

    // Fetch secure live quote
    const quote = await stockService.getQuote(stockSymbol.toUpperCase());
    const price = quote.c;
    const totalAmount = parseFloat((qty * price).toFixed(2));

    // Increase user balance
    user.virtualBalance = parseFloat((user.virtualBalance + totalAmount).toFixed(2));

    // Update holdings
    if (holding.quantity === qty) {
      // Liquidated entire position
      await Holding.deleteOne({ _id: holding._id });
    } else {
      // Partially sell
      holding.quantity = holding.quantity - qty;
      holding.totalInvestment = parseFloat((holding.quantity * holding.averageBuyPrice).toFixed(2));
      await holding.save();
    }

    // Create Transaction Log
    const transaction = await Transaction.create({
      userId: req.user.id,
      stockSymbol: stockSymbol.toUpperCase(),
      companyName,
      type: 'SELL',
      quantity: qty,
      price,
      totalAmount
    });

    // Update user total value
    const dbHoldings = await Holding.find({ userId: req.user.id });
    let holdingsTotalValue = 0;
    for (const h of dbHoldings) {
      const q = await stockService.getQuote(h.stockSymbol);
      holdingsTotalValue += h.quantity * q.c;
    }
    user.totalPortfolioValue = parseFloat((user.virtualBalance + holdingsTotalValue).toFixed(2));
    await user.save();

    return res.status(200).json({
      success: true,
      message: `Successfully sold ${qty} shares of ${stockSymbol.toUpperCase()}`,
      transaction,
      virtualBalance: user.virtualBalance,
      totalPortfolioValue: user.totalPortfolioValue
    });
  } catch (error) {
    console.error(`Error in sellStock: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error processing transaction' });
  }
};

module.exports = {
  getPortfolio,
  buyStock,
  sellStock
};
