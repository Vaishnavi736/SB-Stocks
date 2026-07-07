const axios = require('axios');

// Predefined list of mock stocks with base data
const MOCK_STOCKS = {
  AAPL: { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology', basePrice: 175.50, description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.', ceo: 'Tim Cook', employees: 164000, headquarters: 'Cupertino, California', website: 'https://www.apple.com', peRatio: 28.5, dividendYield: 0.55 },
  MSFT: { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology', basePrice: 420.20, description: 'Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide.', ceo: 'Satya Nadella', employees: 221000, headquarters: 'Redmond, Washington', website: 'https://www.microsoft.com', peRatio: 36.2, dividendYield: 0.71 },
  GOOGL: { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology', basePrice: 172.80, description: 'Alphabet Inc. provides various products and platforms in the United States, Europe, the Americas, and the Asia-Pacific.', ceo: 'Sundar Pichai', employees: 190000, headquarters: 'Mountain View, California', website: 'https://abc.xyz', peRatio: 26.1, dividendYield: 0.46 },
  AMZN: { symbol: 'AMZN', name: 'Amazon.com, Inc.', sector: 'Consumer Cyclical', basePrice: 185.10, description: 'Amazon.com, Inc. engages in the retail sale of consumer products and subscriptions in North America and internationally.', ceo: 'Andy Jassy', employees: 1541000, headquarters: 'Seattle, Washington', website: 'https://www.amazon.com', peRatio: 41.8, dividendYield: 0.00 },
  NVDA: { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology', basePrice: 125.40, description: 'NVIDIA Corporation focuses on personal computer graphics, graphics processing units, and also on artificial intelligence solutions.', ceo: 'Jensen Huang', employees: 296000, headquarters: 'Santa Clara, California', website: 'https://www.nvidia.com', peRatio: 68.4, dividendYield: 0.03 },
  TSLA: { symbol: 'TSLA', name: 'Tesla, Inc.', sector: 'Consumer Cyclical', basePrice: 180.50, description: 'Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems.', ceo: 'Elon Musk', employees: 140000, headquarters: 'Austin, Texas', website: 'https://www.tesla.com', peRatio: 48.7, dividendYield: 0.00 },
  META: { symbol: 'META', name: 'Meta Platforms, Inc.', sector: 'Technology', basePrice: 495.30, description: 'Meta Platforms, Inc. focuses on building products that enable people to connect and share through mobile devices, personal computers, and other screens.', ceo: 'Mark Zuckerberg', employees: 67000, headquarters: 'Menlo Park, California', website: 'https://about.meta.com', peRatio: 24.9, dividendYield: 0.40 },
  NFLX: { symbol: 'NFLX', name: 'Netflix, Inc.', sector: 'Communication Services', basePrice: 610.80, description: 'Netflix, Inc. provides entertainment services with paid memberships in approximately 190 countries.', ceo: 'Ted Sarandos', employees: 130000, headquarters: 'Los Gatos, California', website: 'https://www.netflix.com', peRatio: 38.3, dividendYield: 0.00 },
  AMD: { symbol: 'AMD', name: 'Advanced Micro Devices, Inc.', sector: 'Technology', basePrice: 160.20, description: 'Advanced Micro Devices, Inc. operates as a semiconductor company worldwide.', ceo: 'Lisa Su', employees: 25000, headquarters: 'Santa Clara, California', website: 'https://www.amd.com', peRatio: 335.5, dividendYield: 0.00 },
  JPM: { symbol: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Financials', basePrice: 195.40, description: 'JPMorgan Chase & Co. operates as a financial services company worldwide.', ceo: 'Jamie Dimon', employees: 309000, headquarters: 'New York, New York', website: 'https://www.jpmorganchase.com', peRatio: 12.1, dividendYield: 2.35 },
  WMT: { symbol: 'WMT', name: 'Walmart Inc.', sector: 'Consumer Defensive', basePrice: 65.80, description: 'Walmart Inc. operates supercenters, supermarkets, hypermarkets, warehouse clubs, cash and carry stores, and discount stores.', ceo: 'Doug McMillon', employees: 2100000, headquarters: 'Bentonville, Arkansas', website: 'https://www.walmart.com', peRatio: 27.8, dividendYield: 1.28 },
  KO: { symbol: 'KO', name: 'The Coca-Cola Company', sector: 'Consumer Defensive', basePrice: 62.50, description: 'The Coca-Cola Company, a beverage company, manufactures, markets, and sells various nonalcoholic beverages worldwide.', ceo: 'James Quincey', employees: 82500, headquarters: 'Atlanta, Georgia', website: 'https://www.coca-colacompany.com', peRatio: 24.2, dividendYield: 3.10 },
  DIS: { symbol: 'DIS', name: 'The Walt Disney Company', sector: 'Communication Services', basePrice: 102.30, description: 'The Walt Disney Company operates as an entertainment company worldwide.', ceo: 'Bob Iger', employees: 220000, headquarters: 'Burbank, California', website: 'https://thewaltdisneycompany.com', peRatio: 65.5, dividendYield: 0.44 },
  V: { symbol: 'V', name: 'Visa Inc.', sector: 'Financials', basePrice: 270.60, description: 'Visa Inc. operates as a payments technology company worldwide.', ceo: 'Ryan McInerney', employees: 28800, headquarters: 'San Francisco, California', website: 'https://www.visa.com', peRatio: 32.1, dividendYield: 0.77 },
  NKE: { symbol: 'NKE', name: 'NIKE, Inc.', sector: 'Consumer Cyclical', basePrice: 94.20, description: 'NIKE, Inc. designs, develops, markets, and sells athletic footwear, apparel, equipment, and accessories.', ceo: 'John Donahoe', employees: 83000, headquarters: 'Beaverton, Oregon', website: 'https://www.nike.com', peRatio: 25.6, dividendYield: 1.57 }
};

// In-memory cache store
const cache = {
  quotes: {},
  history: {},
  profiles: {},
  news: {},
  movers: null,
  moversExpiry: 0
};

// Helper: Calculate mock volatility and drift for simulated price movement (Random Walk)
const getSimulatedPrice = (symbol) => {
  const stock = MOCK_STOCKS[symbol] || { basePrice: 100 };
  const base = stock.basePrice;
  
  // Seed hash code from symbol string to make movement slightly sticky yet dynamic
  let hash = 0;
  for (let i = 0; i < symbol.length; i++) {
    hash = symbol.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const seconds = Date.now() / 1000;
  // Combine sinusoids of different frequencies for organic fluctuation
  const wave = Math.sin(seconds / 20) * 0.015 + Math.sin(seconds / 120) * 0.03 + Math.cos(seconds / 600) * 0.08;
  // Add some random noise
  const noise = (Math.random() - 0.5) * 0.004;
  
  const pctChange = wave + noise;
  const currentPrice = base * (1 + pctChange);
  const openPrice = base * (1 + Math.sin(Math.floor(seconds / 86400) * 86400 / 600) * 0.08);
  const priceDiff = currentPrice - openPrice;
  const priceDiffPct = (priceDiff / openPrice) * 100;
  
  const high = Math.max(currentPrice, openPrice) * (1 + 0.015);
  const low = Math.min(currentPrice, openPrice) * (1 - 0.015);
  const volume = Math.floor(1000000 + (Math.abs(hash) % 9000000) + Math.sin(seconds / 3600) * 500000);
  
  return {
    c: parseFloat(currentPrice.toFixed(2)), // Current Price
    d: parseFloat(priceDiff.toFixed(2)),    // Change
    dp: parseFloat(priceDiffPct.toFixed(2)), // Change Percent
    h: parseFloat(high.toFixed(2)),         // High
    l: parseFloat(low.toFixed(2)),          // Low
    o: parseFloat(openPrice.toFixed(2)),    // Open
    pc: parseFloat(openPrice.toFixed(2)),   // Previous Close
    v: volume,                              // Volume
    t: Date.now()
  };
};

// Finnhub configuration
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const getApiKey = () => process.env.FINNHUB_API_KEY || '';

/**
 * Fetch Stock Quote (Live Price)
 */
const getQuote = async (symbol) => {
  const cleanSymbol = symbol.toUpperCase().trim();
  const apiKey = getApiKey();
  const now = Date.now();
  
  // Check cache first (valid for 10 seconds)
  if (cache.quotes[cleanSymbol] && (now - cache.quotes[cleanSymbol].timestamp < 10000)) {
    return cache.quotes[cleanSymbol].data;
  }

  if (apiKey) {
    try {
      const response = await axios.get(`${FINNHUB_BASE_URL}/quote`, {
        params: { symbol: cleanSymbol, token: apiKey }
      });
      // Finnhub returns c=0 if symbol not found
      if (response.data && response.data.c !== 0) {
        // Finnhub response maps: c=current, d=change, dp=percent change, h=high, l=low, o=open, pc=prev close
        const data = {
          c: response.data.c,
          d: response.data.d || 0,
          dp: response.data.dp || 0,
          h: response.data.h || response.data.c,
          l: response.data.l || response.data.c,
          o: response.data.o || response.data.c,
          pc: response.data.pc || response.data.c,
          v: response.data.v || 1000000,
          t: response.data.t * 1000 || Date.now()
        };
        cache.quotes[cleanSymbol] = { timestamp: now, data };
        return data;
      }
    } catch (error) {
      console.warn(`Finnhub API error on quote fetch for ${cleanSymbol}: ${error.message}. Falling back to simulation.`);
    }
  }

  // Fallback to simulation
  const simulatedData = getSimulatedPrice(cleanSymbol);
  cache.quotes[cleanSymbol] = { timestamp: now, data: simulatedData };
  return simulatedData;
};

/**
 * Fetch Stock Company Profile
 */
const getCompanyProfile = async (symbol) => {
  const cleanSymbol = symbol.toUpperCase().trim();
  const apiKey = getApiKey();
  const now = Date.now();

  // Cache for 1 hour
  if (cache.profiles[cleanSymbol] && (now - cache.profiles[cleanSymbol].timestamp < 3600000)) {
    return cache.profiles[cleanSymbol].data;
  }

  if (apiKey) {
    try {
      const response = await axios.get(`${FINNHUB_BASE_URL}/stock/profile2`, {
        params: { symbol: cleanSymbol, token: apiKey }
      });
      if (response.data && response.data.name) {
        const data = {
          symbol: response.data.ticker,
          name: response.data.name,
          logo: response.data.logo || `https://logo.clearbit.com/${response.data.weburl?.replace('https://www.', '') || 'apple.com'}`,
          weburl: response.data.weburl,
          sector: response.data.finnhubIndustry || 'Technology',
          marketCapitalization: response.data.marketCapitalization || 500000,
          shareOutstanding: response.data.shareOutstanding || 1000,
          description: `Company profile for ${response.data.name}. Leading operator in the ${response.data.finnhubIndustry} sector.`,
          ceo: 'N/A',
          employees: 10000,
          headquarters: response.data.country || 'USA'
        };
        cache.profiles[cleanSymbol] = { timestamp: now, data };
        return data;
      }
    } catch (error) {
      console.warn(`Finnhub API error on profile fetch for ${cleanSymbol}. Falling back to simulation.`);
    }
  }

  // Fallback Simulation Profile
  const preset = MOCK_STOCKS[cleanSymbol] || {
    symbol: cleanSymbol,
    name: `${cleanSymbol} Corp`,
    sector: 'Technology',
    basePrice: 100,
    description: `${cleanSymbol} is a leading global public corporation engaged in market operations.`,
    ceo: 'Alex Smith',
    employees: 5000,
    headquarters: 'New York, USA',
    website: 'https://example.com',
    peRatio: 20.0,
    dividendYield: 1.5
  };

  // Dynamically calculate market cap using simulated price
  const priceData = getSimulatedPrice(cleanSymbol);
  const sharesOutstanding = 15000; // in millions
  const marketCap = (priceData.c * sharesOutstanding) / 1000; // in billions

  const data = {
    symbol: cleanSymbol,
    name: preset.name,
    logo: `https://api.dicebear.com/7.x/identicon/svg?seed=${cleanSymbol}`,
    weburl: preset.website,
    sector: preset.sector,
    marketCapitalization: parseFloat(marketCap.toFixed(2)), // in Millions for API standard or Billions
    shareOutstanding: sharesOutstanding,
    description: preset.description,
    ceo: preset.ceo,
    employees: preset.employees,
    headquarters: preset.headquarters,
    peRatio: preset.peRatio || 25,
    dividendYield: preset.dividendYield || 0.0,
    fiftyTwoWeekHigh: parseFloat((priceData.c * 1.35).toFixed(2)),
    fiftyTwoWeekLow: parseFloat((priceData.c * 0.72).toFixed(2))
  };

  cache.profiles[cleanSymbol] = { timestamp: now, data };
  return data;
};

/**
 * Fetch Stock Historical Candle Data
 */
const getHistoricalData = async (symbol, resolution = 'D', days = 30) => {
  const cleanSymbol = symbol.toUpperCase().trim();
  const apiKey = getApiKey();
  const now = Date.now();
  const cacheKey = `${cleanSymbol}_${resolution}_${days}`;

  // Cache for 5 minutes
  if (cache.history[cacheKey] && (now - cache.history[cacheKey].timestamp < 300000)) {
    return cache.history[cacheKey].data;
  }

  if (apiKey) {
    try {
      const to = Math.floor(now / 1000);
      const from = to - (days * 24 * 60 * 60);
      const response = await axios.get(`${FINNHUB_BASE_URL}/stock/candle`, {
        params: { symbol: cleanSymbol, resolution, from, to, token: apiKey }
      });
      
      if (response.data && response.data.s === 'ok') {
        const historyList = response.data.t.map((timestamp, index) => ({
          date: new Date(timestamp * 1000).toISOString().split('T')[0],
          timestamp: timestamp * 1000,
          open: response.data.o[index],
          high: response.data.h[index],
          low: response.data.l[index],
          close: response.data.c[index],
          volume: response.data.v[index]
        }));
        
        cache.history[cacheKey] = { timestamp: now, data: historyList };
        return historyList;
      }
    } catch (error) {
      console.warn(`Finnhub API error on candle fetch for ${cleanSymbol}. Falling back to simulation.`);
    }
  }

  // Fallback Simulation History Generator
  const historyList = [];
  const stock = MOCK_STOCKS[cleanSymbol] || { basePrice: 100 };
  let lastPrice = stock.basePrice;
  const count = days;

  for (let i = count; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayTimestamp = date.getTime();
    
    // Skip weekends for stock market simulation
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    // Simulate price fluctuation with geometric random walk
    const change = lastPrice * (Math.sin(i / 15) * 0.02 + (Math.random() - 0.5) * 0.04);
    const open = lastPrice + (Math.random() - 0.5) * lastPrice * 0.01;
    const close = lastPrice + change;
    const high = Math.max(open, close) * (1 + Math.random() * 0.02);
    const low = Math.min(open, close) * (1 - Math.random() * 0.02);
    const volume = Math.floor(500000 + Math.random() * 2000000);

    historyList.push({
      date: date.toISOString().split('T')[0],
      timestamp: dayTimestamp,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume
    });

    lastPrice = close;
  }

  cache.history[cacheKey] = { timestamp: now, data: historyList };
  return historyList;
};

/**
 * Fetch Stock News
 */
const getStockNews = async (symbol) => {
  const cleanSymbol = symbol.toUpperCase().trim();
  const apiKey = getApiKey();
  const now = Date.now();

  if (cache.news[cleanSymbol] && (now - cache.news[cleanSymbol].timestamp < 3600000)) {
    return cache.news[cleanSymbol].data;
  }

  if (apiKey) {
    try {
      const to = new Date().toISOString().split('T')[0];
      const from = new Date(now - 7 * 86400000).toISOString().split('T')[0]; // last 7 days
      
      const response = await axios.get(`${FINNHUB_BASE_URL}/company-news`, {
        params: { symbol: cleanSymbol, from, to, token: apiKey }
      });
      if (response.data && Array.isArray(response.data)) {
        // Slice top 8 articles
        const articles = response.data.slice(0, 8).map(art => ({
          id: art.id,
          headline: art.headline,
          summary: art.summary,
          source: art.source,
          url: art.url,
          image: art.image || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=500',
          datetime: art.datetime * 1000
        }));
        cache.news[cleanSymbol] = { timestamp: now, data: articles };
        return articles;
      }
    } catch (error) {
      console.warn(`Finnhub news API error on fetch for ${cleanSymbol}. Falling back to simulation.`);
    }
  }

  // Fallback Simulation News
  const companyName = MOCK_STOCKS[cleanSymbol]?.name || `${cleanSymbol} Corporation`;
  const headlines = [
    { text: `${companyName} Unveils New Cloud Integrations & AI Systems`, summary: `${companyName} announced high-performance artificial intelligence integrations to scale services across enterprise client platforms.` },
    { text: `Why Analyst Upgrades Are Stacking Up for ${cleanSymbol} Stock`, summary: `Financial agencies increase targets on ${cleanSymbol} citing robust quarterly consumer demands and strong balance sheets.` },
    { text: `How Competitors Compare in the Latest Core Operations for ${companyName}`, summary: `A review of technical outputs and profit metrics across leading players, highlighting ${cleanSymbol}'s position.` },
    { text: `Growth Potential: Is ${cleanSymbol} Ready for a Market Rally?`, summary: `An investigation of capital allocations and virtual market indicators suggests key opportunities in the medium-term.` },
    { text: `${companyName} Q2 Financial Report Beats Consensus Estimates`, summary: `Earnings per share beat Wall Street estimates by 8.4%, boosting investor confidence in the board's strategies.` }
  ];

  const articles = headlines.map((headline, idx) => ({
    id: `${cleanSymbol}_news_${idx}`,
    headline: headline.text,
    summary: headline.summary,
    source: 'MarketWatch',
    url: '#',
    image: [
      'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=500',
      'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=500',
      'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=500',
      'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=500'
    ][idx % 4],
    datetime: now - (idx * 4.5 * 3600000)
  }));

  cache.news[cleanSymbol] = { timestamp: now, data: articles };
  return articles;
};

/**
 * Fetch Market Movers: Top Gainers, Losers, and Trending Stocks
 */
const getMarketMovers = async () => {
  const now = Date.now();
  // Cache for 30 seconds
  if (cache.movers && (now - cache.moversExpiry < 30000)) {
    return cache.movers;
  }

  const symbols = Object.keys(MOCK_STOCKS);
  const list = [];

  for (const sym of symbols) {
    const quote = await getQuote(sym);
    list.push({
      symbol: sym,
      name: MOCK_STOCKS[sym].name,
      price: quote.c,
      change: quote.d,
      changePercent: quote.dp,
      volume: quote.v,
      sector: MOCK_STOCKS[sym].sector
    });
  }

  // Sort list for movers
  const sortedByChange = [...list].sort((a, b) => b.changePercent - a.changePercent);
  const gainers = sortedByChange.slice(0, 5);
  const losers = [...sortedByChange].reverse().slice(0, 5);
  
  // Trending can be sorted by Volume
  const trending = [...list].sort((a, b) => b.volume - a.volume).slice(0, 5);

  const movers = { gainers, losers, trending };
  cache.movers = movers;
  cache.moversExpiry = now;
  return movers;
};

/**
 * Search Stocks
 */
const searchStocks = async (query) => {
  const cleanQuery = query.toUpperCase().trim();
  if (!cleanQuery) return [];

  const symbols = Object.keys(MOCK_STOCKS);
  const matches = symbols.filter(
    sym => sym.includes(cleanQuery) || MOCK_STOCKS[sym].name.toUpperCase().includes(cleanQuery)
  );

  return matches.map(sym => ({
    symbol: sym,
    name: MOCK_STOCKS[sym].name,
    sector: MOCK_STOCKS[sym].sector,
    basePrice: MOCK_STOCKS[sym].basePrice
  }));
};

module.exports = {
  getQuote,
  getCompanyProfile,
  getHistoricalData,
  getStockNews,
  getMarketMovers,
  searchStocks,
  MOCK_STOCKS
};
