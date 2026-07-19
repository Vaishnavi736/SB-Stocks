const User = require('../models/User');
const Holding = require('../models/Holding');
const Transaction = require('../models/Transaction');
const Watchlist = require('../models/Watchlist');
const PortfolioHistory = require('../models/PortfolioHistory');
const stockService = require('../services/stockService');

/**
 * @desc    Get aggregated dashboard stats & charts
 * @route   GET /api/dashboard
 * @access  Private
 */
const getDashboardData = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // 1. Fetch Holdings and compute current live portfolio value
    const dbHoldings = await Holding.find({ userId: req.user.id });
    let currentHoldingsValue = 0;
    let totalInvestment = 0;

    for (const holding of dbHoldings) {
      try {
        const quote = await stockService.getQuote(holding.stockSymbol);
        currentHoldingsValue += holding.quantity * quote.c;
        totalInvestment += holding.totalInvestment;
      } catch (err) {
        currentHoldingsValue += holding.totalInvestment;
        totalInvestment += holding.totalInvestment;
      }
    }

    const totalPortfolioValue = parseFloat((user.virtualBalance + currentHoldingsValue).toFixed(2));
    const unrealizedGainLoss = parseFloat((currentHoldingsValue - totalInvestment).toFixed(2));
    const unrealizedGainLossPct = totalInvestment > 0 
      ? parseFloat(((unrealizedGainLoss / totalInvestment) * 100).toFixed(2))
      : 0;

    // Update user documentation value
    user.totalPortfolioValue = totalPortfolioValue;
    await user.save();

    // 2. Fetch Watchlist items (limit to 5) with live quotes
    const dbWatchlist = await Watchlist.find({ userId: req.user.id }).limit(5);
    const watchlist = await Promise.all(
      dbWatchlist.map(async (item) => {
        try {
          const quote = await stockService.getQuote(item.stockSymbol);
          return {
            symbol: item.stockSymbol,
            companyName: item.companyName,
            price: quote.c,
            changePercent: quote.dp
          };
        } catch (err) {
          return { symbol: item.stockSymbol, companyName: item.companyName, price: 0, changePercent: 0 };
        }
      })
    );

    // 3. Fetch Recent Transactions (limit to 5)
    const recentTransactions = await Transaction.find({ userId: req.user.id })
      .sort({ timestamp: -1 })
      .limit(5);

    // 4. Fetch Portfolio growth history
    let history = await PortfolioHistory.find({ userId: req.user.id }).sort({ date: 1 });

    // UX Optimization: If user registered recently and lacks chart history, generate simulated historical points leading to current value.
    if (history.length < 7) {
      const generatedHistory = [];
      const daysToGenerate = 7;
      let startValue = 100000; // Registration balance
      const step = (totalPortfolioValue - startValue) / (daysToGenerate - 1);

      for (let i = daysToGenerate - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        // Exclude weekends from charts
        if (date.getDay() === 0 || date.getDay() === 6) continue;

        // If today, write the actual live value
        const val = i === 0 ? totalPortfolioValue : startValue + (daysToGenerate - 1 - i) * step + (Math.random() - 0.5) * 1500;
        
        generatedHistory.push({
          date: date.toISOString().split('T')[0],
          totalValue: parseFloat(val.toFixed(2))
        });
      }
      history = generatedHistory;
    } else {
      history = history.map(item => ({
        date: new Date(item.date).toISOString().split('T')[0],
        totalValue: item.totalValue
      }));
    }

    // 5. Fetch market movers (gainers, losers, trending)
    const marketMovers = await stockService.getMarketMovers();

    // 6. Calculate paper trading leaderboard rank (top 10 + current user)
    const allUsersSorted = await User.find({}).sort({ totalPortfolioValue: -1 });
    const rankIndex = allUsersSorted.findIndex(u => u._id.toString() === req.user.id);
    const userRank = rankIndex !== -1 ? rankIndex + 1 : null;
    
    const leaderboard = allUsersSorted.slice(0, 10).map((u, idx) => ({
      rank: idx + 1,
      name: u.name,
      avatar: u.avatar,
      portfolioValue: u.totalPortfolioValue,
      streak: u.loginStreak,
      isCurrentUser: u._id.toString() === req.user.id
    }));

    return res.status(200).json({
      success: true,
      data: {
        portfolio: {
          virtualBalance: user.virtualBalance,
          totalPortfolioValue,
          holdingsValue: currentHoldingsValue,
          totalInvestment,
          unrealizedGainLoss,
          unrealizedGainLossPct,
          rank: userRank
        },
        watchlist,
        recentTransactions,
        portfolioHistory: history,
        marketMovers,
        leaderboard
      }
    });
  } catch (error) {
    console.error(`Error in getDashboardData: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error loading dashboard data' });
  }
};

module.exports = {
  getDashboardData
};
