require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { rateLimit } = require('express-rate-limit');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const stockRoutes = require('./routes/stockRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const watchlistRoutes = require('./routes/watchlistRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Initialize app
const app = express();

// Connect to MongoDB
connectDB();

// Global Security and Utility Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false, // Allows cross-origin image loads
}));
app.use(cors({
  origin: '*', // Customize this in production for frontend domain
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(compression());

// Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 200, // Limit each IP to 200 requests per window
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

// Bind Route Handlers
app.use('/api/auth', authRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);

// Root test route
app.get('/', (req, res) => {
  res.json({ status: 'active', service: 'SB Stocks Paper Trading API' });
});

// Custom 404 handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Resource API endpoint not found' });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Background Job: Daily Portfolio Valuation History Updater
const runPortfolioValuationHistoryJob = async () => {
  try {
    const User = require('./models/User');
    const Holding = require('./models/Holding');
    const PortfolioHistory = require('./models/PortfolioHistory');
    const stockService = require('./services/stockService');

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

      // Set date to midnight of today local time
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await PortfolioHistory.findOneAndUpdate(
        { userId: user._id, date: today },
        { totalValue: totalPortfolioValue },
        { upsert: true, new: true }
      );
    }
    console.log('[Scheduler] Portfolio valuation history update successfully completed.');
  } catch (error) {
    console.error(`[Scheduler Error] Failed to update histories: ${error.message}`);
  }
};

// Run job on startup and set up interval for every 24 hours
setTimeout(runPortfolioValuationHistoryJob, 5000); // 5s after server starts
setInterval(runPortfolioValuationHistoryJob, 24 * 60 * 60 * 1000); // 24 hours

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

module.exports = server;
