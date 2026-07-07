# SB Stocks - Premium MERN Paper Trading Platform

**SB Stocks** is a modern, production-ready paper trading platform that allows users to practice stock investing and trading strategies with a virtual balance of **$100,000** using real-time or realistically simulated US stock market data.

It features a premium glassmorphic dark interface inspired by Robinhood and TradingView, responsive grids, and detailed analytical charts.

---

## Technical Features

### Frontend (React + Vite)
- **State & Routing**: React Router DOM v6 for layouts and navigation. Context API for global session states (Auth, Theme).
- **Styling**: Tailwind CSS v4 using Vite's official compiler plugin.
- **Visuals**: Framer Motion transitions, responsive Recharts areas/lines, and Lucide icons.
- **Validation**: React Hook Form with validation schemas.

### Backend (Express + Node + Mongoose)
- **DB Schemas**: Models for Users, Holdings, Transaction Logs, Watchlists, and Portfolio History.
- **Trading Algorithms**: Dynamic average cost basis adjustments, balance checking, shorting preventions, and cash balance updates.
- **Resiliency**: Built-in fallback Market Simulator (using wave sinusoids + random walks from real-world base prices) to ensure out-of-the-box operation if API keys are omitted or rate-limited.
- **Security**: JWT tokens, bcryptjs password hashing, Helmet headers, compression, CORS config, and rate limiting.

---

## Directory Layout

```
├── backend/
│   ├── config/              # DB connection
│   ├── controllers/         # REST API Controllers (Auth, Stocks, Portfolio, Admin)
│   ├── middleware/          # JWT authorization, Admin validation, Inputs validators
│   ├── models/              # Mongoose database models
│   ├── routes/              # Express API Routes
│   ├── services/            # Stock market service (Finnhub client + Fallback simulator)
│   ├── Dockerfile
│   ├── package.json
│   └── server.js            # Entry Point and Portfolio Valuation Scheduler
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/      # UI components (TradingPanel, StockChart, GlassCard)
│   │   ├── context/         # AuthContext and ThemeContext
│   │   ├── layout/          # Sidebar, Navbar, DashboardLayout
│   │   ├── pages/           # Pages (Dashboard, Market, StockDetails, Portfolio, Admin)
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml
├── seed.js                  # Database seeder script
├── README.md
└── package.json
```

---

## Configuration Variables (`.env`)

Create a `.env` file inside the `backend` folder:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/sb-stocks
JWT_SECRET=sbstockssecretkey12345!
JWT_EXPIRE=30d
NODE_ENV=development

# Optional: Paste Finnhub Key to load live market data
FINNHUB_API_KEY=
```

---

## Local Setup Instructions

### Prerequisites
- Node.js (>= 18.0.0)
- MongoDB running locally (defaulting to `mongodb://localhost:27017/sb-stocks`)

### Step 1: Install Dependencies
Install packages for both folders:

```bash
# Install backend packages
cd backend
npm install

# Install frontend packages
cd ../frontend
npm install
```

### Step 2: Seed the Database
Seed mock positions, watchlist records, transaction records, and users:

```bash
# Run seeder from root directory
cd ..
node seed.js
```

This registers two accounts:
- **Regular User**: `user@sbstocks.com` (Password: `user123`) - pre-seeded with AAPL, MSFT, and AMZN positions.
- **Administrator**: `admin@sbstocks.com` (Password: `admin123`) - access to user metrics.

### Step 3: Start Development Servers

Run the backend API:
```bash
cd backend
npm run dev
```

In a new terminal window, run the frontend client:
```bash
cd frontend
npm run dev
```

Open `http://localhost:3000` in your web browser.

---

## Docker Compose Setup (Recommended)

Run the entire stack (MongoDB + Express + Vite client) using Docker Compose.

```bash
# Build and start services in detached mode
docker-compose up --build -d
```

This spins up:
- **Vite Web Client**: `http://localhost:3000`
- **Express API**: `http://localhost:5000`
- **Database**: Port `27017`

To shut down:
```bash
docker-compose down
```

---

## Running Verification Tests

Run the stock pricing engine tests:
```bash
cd backend
node verify-endpoints.js
```
