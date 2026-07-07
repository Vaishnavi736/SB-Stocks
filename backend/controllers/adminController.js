const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Holding = require('../models/Holding');

/**
 * @desc    Get system global statistics
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
const getSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalTransactions = await Transaction.countDocuments({});
    const totalHoldings = await Holding.countDocuments({});
    
    const users = await User.find({});
    const totalAssetsVal = users.reduce((acc, u) => acc + u.totalPortfolioValue, 0);
    const averagePortfolioVal = totalUsers > 0 ? parseFloat((totalAssetsVal / totalUsers).toFixed(2)) : 0;

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalTransactions,
        totalHoldings,
        totalAssetsVal,
        averagePortfolioVal
      }
    });
  } catch (error) {
    console.error(`Error in getSystemStats: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error loading system stats' });
  }
};

/**
 * @desc    Get all users list
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    return res.json({ success: true, users });
  } catch (error) {
    console.error(`Error in getAllUsers: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error loading users' });
  }
};

/**
 * @desc    Update a user's cash balance
 * @route   POST /api/admin/users/:userId/balance
 * @access  Private/Admin
 */
const updateUserBalance = async (req, res) => {
  try {
    const { userId } = req.params;
    const { balance } = req.body;

    const amount = parseFloat(balance);
    if (isNaN(amount) || amount < 0) {
      return res.status(400).json({ success: false, message: 'Please provide a valid balance amount' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Adjust balance and recalculate net worth
    const oldBalance = user.virtualBalance;
    user.virtualBalance = amount;
    user.totalPortfolioValue = parseFloat((user.totalPortfolioValue - oldBalance + amount).toFixed(2));
    
    await user.save();

    return res.json({
      success: true,
      message: `Balance updated for ${user.name} from $${oldBalance} to $${amount}`,
      user
    });
  } catch (error) {
    console.error(`Error in updateUserBalance: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error updating user balance' });
  }
};

/**
 * @desc    Delete user account
 * @route   DELETE /api/admin/users/:userId
 * @access  Private/Admin
 */
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own admin account' });
    }

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Cascade delete holdings, transactions, and watchlists
    await Promise.all([
      Holding.deleteMany({ userId }),
      Transaction.deleteMany({ userId }),
      PortfolioHistory.deleteMany({ userId })
    ]);

    return res.json({ success: true, message: `Successfully deleted user account ${user.name}` });
  } catch (error) {
    console.error(`Error in deleteUser: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error terminating user' });
  }
};

module.exports = {
  getSystemStats,
  getAllUsers,
  updateUserBalance,
  deleteUser
};
