const mongoose = require('mongoose');

const portfolioHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  totalValue: {
    type: Number,
    required: true,
  }
});

// Ensure a user has only one history log per day (to prevent duplicate entries)
portfolioHistorySchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('PortfolioHistory', portfolioHistorySchema);
