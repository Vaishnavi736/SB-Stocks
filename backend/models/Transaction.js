const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  stockSymbol: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
  },
  companyName: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['BUY', 'SELL'],
  },
  quantity: {
    type: Number,
    required: true,
    min: [0.0001, 'Quantity must be greater than zero'],
  },
  price: {
    type: Number,
    required: true,
    min: [0.0001, 'Price must be greater than zero'],
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Indexing for quick search and filters
transactionSchema.index({ userId: 1, stockSymbol: 1, timestamp: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
