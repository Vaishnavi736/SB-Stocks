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
const cronRoutes = require('./routes/cronRoutes');

// Initialize app
const app = express();

// Connect to MongoDB
connectDB().catch((error) => {
  console.error(`Failed to establish initial MongoDB connection: ${error.message}`);
});

// Vercel (and most PaaS) sit behind a reverse proxy, so Express needs to
// trust the X-Forwarded-For header to see the real client IP. Required for
// express-rate-limit to work correctly on Vercel.
app.set('trust proxy', 1);

// Global Security and Utility Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false, // Allows cross-origin image loads
}));
app.use(cors({
  origin: process.env.CLIENT_URL || '*', // Set CLIENT_URL to the deployed Netlify domain in production
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
app.use('/api/cron', cronRoutes);

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

// Background Job: Daily Portfolio Valuation History Updater.
// On Vercel, serverless functions can't run a persistent setInterval — the
// daily job is instead triggered via the Vercel Cron Job configured in
// vercel.json, which hits GET /api/cron/portfolio-valuation. This self-timer
// fallback only runs when the app is kept alive as a long-running process
// (e.g. local dev, Docker, Render, Railway).
if (!process.env.VERCEL) {
  const { runPortfolioValuationHistoryJob } = require('./services/portfolioValuationService');
  const runJobSafely = () => runPortfolioValuationHistoryJob().catch((error) => {
    console.error(`[Scheduler Error] Failed to update histories: ${error.message}`);
  });

  setTimeout(runJobSafely, 5000); // 5s after server starts
  setInterval(runJobSafely, 24 * 60 * 60 * 1000); // 24 hours
}

// Vercel imports this module and calls the exported Express app directly as
// the request handler, so app.listen() must only run for a real standalone
// process (local dev, Docker, Render, Railway, etc.).
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

module.exports = app;
