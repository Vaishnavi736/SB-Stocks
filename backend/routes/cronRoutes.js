const express = require('express');
const router = express.Router();
const { runPortfolioValuationHistoryJob } = require('../services/portfolioValuationService');

// Vercel Cron Jobs automatically send `Authorization: Bearer $CRON_SECRET`
// when the CRON_SECRET env var is set on the project, letting us verify the
// request actually came from Vercel's scheduler and not a public caller.
router.get('/portfolio-valuation', async (req, res) => {
  if (process.env.CRON_SECRET && req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    await runPortfolioValuationHistoryJob();
    res.json({ success: true });
  } catch (error) {
    console.error(`[Scheduler Error] Failed to update histories: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
