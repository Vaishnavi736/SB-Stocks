const mongoose = require('mongoose');

const holdingSchema = new mongoose.Schema({
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
  quantity: {
    type: Number,
    required: true,
    min: [0, 'Quantity cannot be negative'],
  },
  averageBuyPrice: {
    type: Number,
    required: true,
    min: [0, 'Average price cannot be negative'],
  },
  totalInvestment: {
    type: Number,
    required: true,
    default: function() {
      return this.quantity * this.averageBuyPrice;
    }
  }
}, {
  timestamps: true
});

// Compound index to ensure uniqueness of symbol per user
holdingSchema.index({ userId: 1, stockSymbol: 1 }, { unique: true });

module.exports = mongoose.model('Holding', holdingSchema);
