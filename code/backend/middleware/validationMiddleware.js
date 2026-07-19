const { body, validationResult } = require('express-validator');

// Error handler utility for express-validator results
const validateResults = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
    });
  }
  next();
};

const registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  validateResults
];

const loginValidator = [
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  validateResults
];

const tradeValidator = [
  body('stockSymbol').trim().toUpperCase().notEmpty().withMessage('Stock symbol is required'),
  body('companyName').trim().notEmpty().withMessage('Company name is required'),
  body('quantity').isFloat({ gt: 0 }).withMessage('Quantity must be greater than 0'),
  body('price').isFloat({ gt: 0 }).withMessage('Price must be greater than 0'),
  validateResults
];

const watchlistValidator = [
  body('stockSymbol').trim().toUpperCase().notEmpty().withMessage('Stock symbol is required'),
  body('companyName').trim().notEmpty().withMessage('Company name is required'),
  validateResults
];

module.exports = {
  registerValidator,
  loginValidator,
  tradeValidator,
  watchlistValidator
};
