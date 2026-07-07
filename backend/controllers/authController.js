const jwt = require('jsonwebtoken');
const User = require('../models/User');
const PortfolioHistory = require('../models/PortfolioHistory');

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'sbstockssecretkey12345!', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
  try {
    const { name, email, password, avatar } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password, // Password hashed via User model pre-save hook
      avatar: avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${name}`,
      virtualBalance: 100000,
      totalPortfolioValue: 100000,
      loginStreak: 1,
      lastLogin: new Date()
    });

    if (user) {
      // Seed initial Portfolio History for day 1
      await PortfolioHistory.create({
        userId: user._id,
        date: new Date(),
        totalValue: 100000
      });

      return res.status(201).json({
        success: true,
        token: generateToken(user._id),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          virtualBalance: user.virtualBalance,
          totalPortfolioValue: user.totalPortfolioValue,
          isAdmin: user.isAdmin,
          loginStreak: user.loginStreak,
          createdAt: user.createdAt
        }
      });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

/**
 * @desc    Auth user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Handle Login Streak
    const now = new Date();
    const last = new Date(user.lastLogin);
    const todayStr = now.toDateString();
    const lastStr = last.toDateString();

    if (todayStr !== lastStr) {
      // Create date objects stripped of hours for comparison
      const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const lastDate = new Date(last.getFullYear(), last.getMonth(), last.getDate());
      
      const diffTime = Math.abs(todayDate - lastDate);
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        user.loginStreak += 1;
      } else if (diffDays > 1) {
        user.loginStreak = 1; // Streak broken
      }
      user.lastLogin = now;
      await user.save();
    }

    return res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        virtualBalance: user.virtualBalance,
        totalPortfolioValue: user.totalPortfolioValue,
        isAdmin: user.isAdmin,
        loginStreak: user.loginStreak,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      return res.json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          virtualBalance: user.virtualBalance,
          totalPortfolioValue: user.totalPortfolioValue,
          isAdmin: user.isAdmin,
          loginStreak: user.loginStreak,
          createdAt: user.createdAt
        }
      });
    } else {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error fetching profile' });
  }
};

module.exports = {
  register,
  login,
  getMe
};
