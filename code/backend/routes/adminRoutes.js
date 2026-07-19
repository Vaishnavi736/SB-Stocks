const express = require('express');
const router = express.Router();
const { getSystemStats, getAllUsers, updateUserBalance, deleteUser } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/stats', protect, admin, getSystemStats);
router.get('/users', protect, admin, getAllUsers);
router.post('/users/:userId/balance', protect, admin, updateUserBalance);
router.delete('/users/:userId', protect, admin, deleteUser);

module.exports = router;
