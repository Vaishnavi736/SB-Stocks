const Transaction = require('../models/Transaction');

/**
 * @desc    Get user transactions history (supports search, type filter, date limits, CSV export)
 * @route   GET /api/transactions
 * @access  Private
 */
const getTransactions = async (req, res) => {
  try {
    const { type, search, startDate, endDate, format, page = 1, limit = 10 } = req.query;

    const query = { userId: req.user.id };

    // Apply BUY/SELL filters
    if (type && ['BUY', 'SELL'].includes(type.toUpperCase())) {
      query.type = type.toUpperCase();
    }

    // Apply stock symbol search
    if (search) {
      query.stockSymbol = { $regex: search.trim().toUpperCase(), $options: 'i' };
    }

    // Apply date range filters
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        query.timestamp.$lte = new Date(endDate);
      }
    }

    // CSV format exporter option
    if (format === 'csv') {
      const transactions = await Transaction.find(query).sort({ timestamp: -1 });
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=SB_Stocks_Transactions_${Date.now()}.csv`);
      
      let csvContent = 'Transaction ID,Date & Time,Symbol,Company Name,Type,Quantity,Execution Price,Total Amount\n';
      
      transactions.forEach((tx) => {
        csvContent += `"${tx._id}","${tx.timestamp.toISOString()}","${tx.stockSymbol}","${tx.companyName.replace(/"/g, '""')}","${tx.type}",${tx.quantity},${tx.price},${tx.totalAmount}\n`;
      });
      
      return res.status(200).send(csvContent);
    }

    // Paginated results (JSON default)
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limitNum);

    return res.status(200).json({
      success: true,
      count: transactions.length,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total
      },
      transactions
    });
  } catch (error) {
    console.error(`Error in getTransactions: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error fetching transactions history' });
  }
};

module.exports = {
  getTransactions
};
