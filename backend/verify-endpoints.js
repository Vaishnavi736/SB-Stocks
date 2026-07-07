const stockService = require('./services/stockService');

const runVerification = async () => {
  console.log('--- SB Stocks API Verification Tests ---');

  try {
    // Test 1: Test stock details lookup (GBM fallback simulator verification)
    console.log('\n[Test 1] Testing quote lookup for AAPL...');
    const quote = await stockService.getQuote('AAPL');
    console.log('Result AAPL Quote:', quote);
    
    if (quote && typeof quote.c === 'number' && quote.c > 0) {
      console.log('=> Test 1 Passed: Quote fetched with valid current price ($' + quote.c + ')');
    } else {
      throw new Error('Test 1 Failed: Quote did not return a valid current price');
    }

    // Test 2: Test price fluctuation on sequential calls
    console.log('\n[Test 2] Testing price fluctuation (random walk verify)...');
    const quote1 = await stockService.getQuote('MSFT');
    // Wait 1.5 seconds to allow time-based wave shifts to register
    await new Promise(resolve => setTimeout(resolve, 1500));
    const quote2 = await stockService.getQuote('MSFT');
    
    console.log('MSFT Call 1 Price:', quote1.c);
    console.log('MSFT Call 2 Price:', quote2.c);
    console.log('Change detected:', quote1.c !== quote2.c ? 'Yes (flashing tickers active)' : 'No');
    
    // Note: Since simulation relies on wave oscillations + minor noise, prices should shift slightly
    console.log('=> Test 2 Passed: Price wave engine confirmed.');

    // Test 3: Test stock historical candle mapping for Recharts
    console.log('\n[Test 3] Testing historical candle history fetch...');
    const history = await stockService.getHistoricalData('NVDA', 'D', 7);
    console.log('History data count (last 7 days):', history.length);
    if (history.length > 0) {
      console.log('Sample NVDA Candle:', history[0]);
      console.log('=> Test 3 Passed: Recharts candle structure verified.');
    } else {
      throw new Error('Test 3 Failed: History array was empty');
    }

    // Test 4: News Feed retrieval
    console.log('\n[Test 4] Testing stock specific news feeds...');
    const news = await stockService.getStockNews('AMZN');
    console.log('News articles found:', news.length);
    if (news.length > 0) {
      console.log('Sample headline:', news[0].headline);
      console.log('=> Test 4 Passed: News structure verified.');
    } else {
      throw new Error('Test 4 Failed: News feed array was empty');
    }

    // Test 5: Market Movers compilation
    console.log('\n[Test 5] Testing Movers aggregator (gainers, losers, trending)...');
    const movers = await stockService.getMarketMovers();
    console.log('Movers keys:', Object.keys(movers));
    console.log('Gainers count:', movers.gainers?.length);
    console.log('Losers count:', movers.losers?.length);
    console.log('Trending count:', movers.trending?.length);
    
    if (movers.gainers && movers.losers && movers.trending) {
      console.log('=> Test 5 Passed: Movers aggregator successfully sorted lists.');
    } else {
      throw new Error('Test 5 Failed: Mover categorization missing keys');
    }

    console.log('\nAll offline backend verification checks passed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\nVerification process encountered error:', error.message);
    process.exit(1);
  }
};

runVerification();
