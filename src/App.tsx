
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { UserRole, UserProfile } from './types';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CustomerTracking from './pages/CustomerTracking';
import OrderBooking from './pages/OrderBooking';
import OrderHistory from './pages/OrderHistory';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';
import Customers from './pages/Customers';
import Wallets from './pages/Wallets';
import ReferralTeam from './pages/ReferralTeam';
import Sidebar from './components/Sidebar';
import { GOLD_SVG_GRADIENT } from './constants';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('lords_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.referralCode) {
           parsed.referralCode = 'LT-' + Math.random().toString(36).substr(2, 6).toUpperCase();
           localStorage.setItem('lords_user', JSON.stringify(parsed));
        }
        setUser(parsed);
      } catch (e) {
        localStorage.removeItem('lords_user');
      }
    }

    // Initialize Global Settings with PERFECT INCOME DISTRIBUTION LOGIC
    // As per user request:
    // Work Rates updated.
    
    const perfectSettings = {
        showroom_payout: 5, // %
        booking_master_payout: 5, // % (New Booking Master Rate)
        measurement_pant_new: 25, // ₹
        measurement_shirt_new: 20, // ₹
        cutting_pant_rate: 30, // ₹
        cutting_shirt_rate: 30, // ₹
        stitching_shirt: 120, // ₹
        stitching_pant: 230, // ₹
        press_rate: 10, // ₹
        kaj_button_rate: 10, // ₹
        delivery_payout: 10, // ₹
        material_payout_pct: 15, // %
        
        company_cut_pct: 10, // 10% Deduction
        
        upline_share_pct: 85, // 85% of Deduction goes to Upline
        downline_share_pct: 15, // 15% of Deduction goes to Downline
        
        // Specific Level Percentages for Upline Distribution
        upline_levels: [30, 20, 15, 10, 5, 5, 5, 5, 2.5, 2.5],
        
        // Specific Level Percentages for Downline Distribution
        downline_levels: [5, 5, 5, 5, 5, 10, 15, 15, 15, 20] 
    };

    if (!localStorage.getItem('lords_settings')) {
        localStorage.setItem('lords_settings', JSON.stringify(perfectSettings));
    } else {
        // Force update to apply the new "Perfect Income" logic immediately for this session
        const current = JSON.parse(localStorage.getItem('lords_settings') || '{}');
        // Overwrite distribution logic to match request
        current.upline_levels = perfectSettings.upline_levels;
        current.downline_levels = perfectSettings.downline_levels;
        current.upline_share_pct = 85;
        current.downline_share_pct = 15;
        // Update rates
        current.measurement_shirt_new = 20;
        current.measurement_pant_new = 25;
        current.stitching_shirt = 120;
        current.stitching_pant = 230;
        current.press_rate = 10;
        current.delivery_payout = 10;
        current.booking_master_payout = 5; // Ensure this is set
        
        localStorage.setItem('lords_settings', JSON.stringify(current));
    }
  }, []);

  const handleLogin = (u: any) => {
    if (!u.referralCode) u.referralCode = 'LT-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    if (!u.joinedAt) u.joinedAt = new Date().toISOString();
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
              <div className="flex items-center space-x-4 text-[9px] font-black">
                <div className="flex items-center space-x-2 text-gold uppercase tracking-widest bg-gold/5 px-3 py-1.5 rounded-full border border-gold/10">
                  <i className="fas fa-user-check"></i>
                  <span>ID: {user.referralCode}</span>
                </div>
                <div className="w-8 h-8 rounded-full border border-gold/30 flex items-center justify-center bg-premiumDark text-gold text-xs font-bold overflow-hidden">
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
              <Route path="/new-order" element={
                user && (
                  user.role === UserRole.SHOWROOM || 
                  user.role === UserRole.BOOKING_MASTER || 
                  user.role === UserRole.ADMIN || 
                  user.role === UserRole.MANAGER || 
                  user.role === UserRole.DIRECTOR
                ) ? <OrderBooking /> : <Navigate to="/" />
              } />
              <Route path="/wallets" element={user ? <Wallets /> : <Navigate to="/login" />} />
              <Route path="/referral-team" element={user ? <ReferralTeam /> : <Navigate to="/login" />} />
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
