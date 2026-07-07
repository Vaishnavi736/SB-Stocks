require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./backend/models/User');
const Holding = require('./backend/models/Holding');
const Transaction = require('./backend/models/Transaction');
const Watchlist = require('./backend/models/Watchlist');
const PortfolioHistory = require('./backend/models/PortfolioHistory');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sb-stocks';

const seedDatabase = async () => {
  try {
    console.log('Connecting to database for seeding...');
    await mongoose.connect(MONGO_URI);
    console.log('Database connected successfully.');

    // Clear existing data
    console.log('Clearing existing database collections...');
    await Promise.all([
      User.deleteMany({}),
      Holding.deleteMany({}),
      Transaction.deleteMany({}),
      Watchlist.deleteMany({}),
      PortfolioHistory.deleteMany({})
    ]);
    console.log('Collections cleared.');

    // 1. Create Users
    console.log('Creating mock users...');
    const salt = await bcrypt.genSalt(10);
    const adminPasswordHashed = await bcrypt.hash('admin123', salt);
    const userPasswordHashed = await bcrypt.hash('user123', salt);

    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@sbstocks.com',
      password: 'admin123', // Hashed automatically by pre-save hooks
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Admin',
      isAdmin: true,
      virtualBalance: 150000,
      totalPortfolioValue: 150000,
      loginStreak: 12,
      lastLogin: new Date()
    });

    const standardUser = await User.create({
      name: 'Alexander Reed',
      email: 'user@sbstocks.com',
      password: 'user123', // Hashed automatically by pre-save hooks
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Mason',
      isAdmin: false,
      virtualBalance: 42500, // cash left after buying initial positions
      totalPortfolioValue: 98450, // total portfolio valuation (cash + holdings)
      loginStreak: 5,
      lastLogin: new Date()
    });

    console.log(`Users created:`);
    console.log(`- Admin: admin@sbstocks.com (pwd: admin123)`);
    console.log(`- User: user@sbstocks.com (pwd: user123)`);

    // 2. Create Watchlist for Standard User
    console.log('Seeding user watchlist...');
    await Watchlist.create([
      { userId: standardUser._id, stockSymbol: 'TSLA', companyName: 'Tesla, Inc.' },
      { userId: standardUser._id, stockSymbol: 'GOOGL', companyName: 'Alphabet Inc.' },
      { userId: standardUser._id, stockSymbol: 'NVDA', companyName: 'NVIDIA Corporation' }
    ]);

    // 3. Create Holdings for Standard User
    console.log('Seeding user portfolio holdings...');
    const holdings = await Holding.create([
      {
        userId: standardUser._id,
        stockSymbol: 'AAPL',
        companyName: 'Apple Inc.',
        quantity: 120,
        averageBuyPrice: 172.50,
        totalInvestment: 20700
      },
      {
        userId: standardUser._id,
        stockSymbol: 'MSFT',
        companyName: 'Microsoft Corporation',
        quantity: 80,
        averageBuyPrice: 405.00,
        totalInvestment: 32400
      },
      {
        userId: standardUser._id,
        stockSymbol: 'AMZN',
        companyName: 'Amazon.com, Inc.',
        quantity: 150,
        averageBuyPrice: 180.20,
        totalInvestment: 27030
      }
    ]);

    // 4. Create Transactions for Standard User
    console.log('Seeding user transactions logs...');
    await Transaction.create([
      {
        userId: standardUser._id,
        stockSymbol: 'AAPL',
        companyName: 'Apple Inc.',
        type: 'BUY',
        quantity: 120,
        price: 172.50,
        totalAmount: 20700,
        timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) // 6 days ago
      },
      {
        userId: standardUser._id,
        stockSymbol: 'MSFT',
        companyName: 'Microsoft Corporation',
        type: 'BUY',
        quantity: 80,
        price: 405.00,
        totalAmount: 32400,
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
      },
      {
        userId: standardUser._id,
        stockSymbol: 'AMZN',
        companyName: 'Amazon.com, Inc.',
        type: 'BUY',
        quantity: 200,
        price: 175.50,
        totalAmount: 35100,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      },
      {
        userId: standardUser._id,
        stockSymbol: 'AMZN',
        companyName: 'Amazon.com, Inc.',
        type: 'SELL',
        quantity: 50,
        price: 184.20,
        totalAmount: 9210,
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      }
    ]);

    // 5. Create Portfolio History for Charting
    console.log('Seeding portfolio growth history lines...');
    const historyLines = [];
    const baseValue = 100000;
    const historyPoints = [
      { daysAgo: 6, value: 100000 },
      { daysAgo: 5, value: 101200 },
      { daysAgo: 4, value: 99400 },
      { daysAgo: 3, value: 102500 },
      { daysAgo: 2, value: 103100 },
      { daysAgo: 1, value: 97800 },
      { daysAgo: 0, value: 98450 } // Standard user total worth
    ];

    for (const point of historyPoints) {
      const date = new Date();
      date.setDate(date.getDate() - point.daysAgo);
      date.setHours(0, 0, 0, 0);

      historyLines.push({
        userId: standardUser._id,
        date,
        totalValue: point.value
      });
    }

    await PortfolioHistory.create(historyLines);
    console.log('Portfolio history seeded.');

    console.log('Database seeding successfully finished!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding process encountered error:', error.message);
    process.exit(1);
  }
};

seedDatabase();
