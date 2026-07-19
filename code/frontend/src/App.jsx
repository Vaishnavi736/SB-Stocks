import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import PageTransition from './components/PageTransition';

// Import Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Market from './pages/Market';
import StockDetails from './pages/StockDetails';
import Portfolio from './pages/Portfolio';
import Watchlist from './pages/Watchlist';
import Transactions from './pages/Transactions';
import Admin from './pages/Admin';

// Route protection guards
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-surface-canvas flex flex-col items-center justify-center text-text-muted">
        <div className="w-10 h-10 rounded-xl bg-brand-600 animate-pulse mb-4"></div>
        <p className="text-sm font-bold animate-pulse">Loading SB Stocks...</p>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-surface-canvas flex items-center justify-center text-text-muted">
        <p className="text-sm font-bold animate-pulse">Checking credentials...</p>
      </div>
    );
  }
  
  return isAuthenticated && user?.isAdmin ? children : <Navigate to="/dashboard" replace />;
};

// Rendered inside ThemeProvider so it can read the active theme to color the toasts
const AppContent = () => {
  const { isDark } = useTheme();
  const location = useLocation();

  return (
    <>
      {/* Global Toast Alerts */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: isDark ? {
            background: '#0f172a', // slate-900
            color: '#f1f5f9', // slate-100
            border: '1px solid #334155', // slate-700
            borderRadius: '16px',
            fontSize: '13px',
            fontWeight: '600'
          } : {
            background: '#ffffff',
            color: '#0f172a', // slate-900
            border: '1px solid #e2e8f0', // slate-200
            borderRadius: '16px',
            fontSize: '13px',
            fontWeight: '600'
          },
          success: {
            iconTheme: {
              primary: '#10b981', // emerald-500
              secondary: isDark ? '#0f172a' : '#ffffff'
            }
          },
          error: {
            iconTheme: {
              primary: '#ef4444', // red-500
              secondary: isDark ? '#0f172a' : '#ffffff'
            }
          }
        }}
      />

      {/* Routing Table */}
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          {/* Public Routes */}
          <Route path="/" element={<PageTransition><Home /></PageTransition>} />
          <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
          <Route path="/register" element={<PageTransition><Register /></PageTransition>} />

          {/* Protected Trading Routes — each page renders DashboardLayout, which applies
              PageTransition internally to just its content area (see DashboardLayout.jsx) */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/market" element={<ProtectedRoute><Market /></ProtectedRoute>} />
          <Route path="/stocks/:symbol" element={<ProtectedRoute><StockDetails /></ProtectedRoute>} />
          <Route path="/portfolio" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
          <Route path="/watchlist" element={<ProtectedRoute><Watchlist /></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />

          {/* Admin Protected Routes */}
          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />

          {/* Fallback Catch-All */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
