const User = require('../models/User');
const Holding = require('../models/Holding');
const PortfolioHistory = require('../models/PortfolioHistory');
const stockService = require('./stockService');

// Recomputes each user's total portfolio value and records a daily snapshot.
const runPortfolioValuationHistoryJob = async () => {
  console.log('[Scheduler] Executing portfolio valuation history updates...');
  const users = await User.find({});

  for (const user of users) {
    const holdings = await Holding.find({ userId: user._id });
    let holdingsTotalVal = 0;

    for (const h of holdings) {
      try {
        const quote = await stockService.getQuote(h.stockSymbol);
        holdingsTotalVal += h.quantity * quote.c;
      } catch (err) {
        holdingsTotalVal += h.totalInvestment;
      }
    }

    const totalPortfolioValue = parseFloat((user.virtualBalance + holdingsTotalVal).toFixed(2));
    user.totalPortfolioValue = totalPortfolioValue;
    await user.save();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await PortfolioHistory.findOneAndUpdate(
      { userId: user._id, date: today },
      { totalValue: totalPortfolioValue },
      { upsert: true, new: true }
    );
  }
  console.log('[Scheduler] Portfolio valuation history update successfully completed.');
};

module.exports = { runPortfolioValuationHistoryJob };
