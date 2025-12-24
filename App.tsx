
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { UserRole, OrderStatus, DressCategory } from './types';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CustomerTracking from './pages/CustomerTracking';
import OrderBooking from './pages/OrderBooking';
import OrderHistory from './pages/OrderHistory';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';
import Customers from './pages/Customers';
import Wallets from './pages/Wallets';
import Sidebar from './components/Sidebar';
import { GOLD_SVG_GRADIENT } from './constants';

interface UserProfile {
  id: string;
  role: UserRole;
  name: string;
  address?: string;
  mobile?: string;
  email?: string;
  image?: string;
}

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('lords_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem('lords_user');
      }
    }

    // Initialize all mandatory storage buckets
    if (!localStorage.getItem('lords_saved_orders')) localStorage.setItem('lords_saved_orders', JSON.stringify([]));
    if (!localStorage.getItem('lords_customers')) localStorage.setItem('lords_customers', JSON.stringify([]));
    if (!localStorage.getItem('lords_wallets')) {
      localStorage.setItem('lords_wallets', JSON.stringify({
        total: 0, today: 0, upline: 0, downline: 0, withdrawal: 0, stitching: 0, advance: 0
      }));
    }
    if (!localStorage.getItem('lords_settings')) {
        localStorage.setItem('lords_settings', JSON.stringify({
            master_deduction_percent: 10,
            upline_pool_share: 85,
            downline_pool_share: 15,
            upline_levels: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
            downline_levels: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10]
        }));
    }
  }, []);

  const handleLogin = (u: UserProfile) => {
    setUser(u);
    localStorage.setItem('lords_user', JSON.stringify(u));
  };

  const handleUpdateUser = (u: UserProfile) => {
    setUser(u);
    localStorage.setItem('lords_user', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('lords_user');
  };

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col md:flex-row">
        {GOLD_SVG_GRADIENT}
        
        {user && user.role !== UserRole.CUSTOMER && (
          <Sidebar 
            user={user} 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)} 
            onLogout={handleLogout}
            onUpdateUser={handleUpdateUser}
          />
        )}

        <div className="flex-1 flex flex-col overflow-hidden bg-premiumBlack">
          {user && (
            <header className="h-16 flex items-center justify-between px-6 bg-premiumDark border-b border-gold/10 sticky top-0 z-40">
              <div className="flex items-center space-x-4">
                {user.role !== UserRole.CUSTOMER && (
                   <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-gold"><i className="fas fa-bars text-xl"></i></button>
                )}
                <Link to="/" className="flex items-center space-x-2">
                  <span className="font-serif text-xl gold-text font-bold tracking-widest uppercase">LORD'S</span>
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-[9px] font-black text-green-500 uppercase tracking-widest"><i className="fas fa-check-circle"></i><span>Data Safe</span></div>
                <div className="w-8 h-8 rounded-full border border-gold/30 flex items-center justify-center bg-premiumDark text-gold text-xs font-bold shadow-[0_0_10px_rgba(212,175,55,0.2)] overflow-hidden">
                   {user.image ? <img src={user.image} className="w-full h-full object-cover" /> : user.name.charAt(0)}
                </div>
              </div>
            </header>
          )}

          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <Routes>
              <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
              <Route path="/track" element={<CustomerTracking />} />
              <Route path="/" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
              <Route path="/new-order" element={user && (user.role === UserRole.SHOWROOM || user.role === UserRole.ADMIN) ? <OrderBooking /> : <Navigate to="/" />} />
              <Route path="/wallets" element={user ? <Wallets /> : <Navigate to="/login" />} />
              <Route path="/order-history" element={user ? <OrderHistory /> : <Navigate to="/" />} />
              <Route path="/customers" element={user ? <Customers /> : <Navigate to="/" />} />
              <Route path="/inventory" element={user ? <Inventory /> : <Navigate to="/" />} />
              <Route path="/reports" element={user ? <Reports /> : <Navigate to="/" />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </div>
    </HashRouter>
  );
};

export default App;
