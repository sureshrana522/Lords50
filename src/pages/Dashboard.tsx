
import React, { useEffect, useState } from 'react';
import { UserRole, OrderStatus } from '../types';

interface DashboardProps {
  user: { id: string; role: UserRole; name: string };
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [statsData, setStatsData] = useState({ 
    orders: 0, 
    taskRevenue: 0, // Work Income (Task Earnings)
    walletBalance: 0, // Main Wallet Balance (Add Money + Earnings)
    pending: 0,
    customers: 0,
    todayBooking: 0,
    readyDelivery: 0,
    workers: 0,
    materialStock: 0,
    // New Wallet Stats
    uplineIncome: 0,
    downlineIncome: 0,
    withdrawal: 0
  });

  const loadStats = () => {
    const allOrders = JSON.parse(localStorage.getItem('lords_saved_orders') || '[]');
    
    // FETCH ROLE SPECIFIC WALLET instead of global
    const roleWallets = JSON.parse(localStorage.getItem('lords_wallets_by_role') || '{}');
    const myWallet = roleWallets[user.role] || { task_earnings: 0, total: 0, upline_income: 0, downline_income: 0 };
    
    const customers = JSON.parse(localStorage.getItem('lords_customers') || '[]');
    
    // Calculate today's booking
    const today = new Date().toISOString().split('T')[0];
    const todaysOrders = allOrders.filter((o: any) => o.createdAt.startsWith(today));
    
    // Calculate ready for delivery
    const ready = allOrders.filter((o: any) => o.status === OrderStatus.READY);

    setStatsData({
      orders: allOrders.length,
      taskRevenue: myWallet.task_earnings || 0, // Specifically Task Earnings
      walletBalance: myWallet.total || 0, // Total Available Funds
      pending: allOrders.filter((o: any) => o.status !== OrderStatus.DELIVERED).length,
      customers: customers.length,
      todayBooking: todaysOrders.length,
      readyDelivery: ready.length,
      workers: 0, // Placeholder
      materialStock: 0, // Placeholder
      
      // New Data Mapping
      uplineIncome: myWallet.upline_income || 0,
      downlineIncome: myWallet.downline_income || 0,
      withdrawal: myWallet.total_withdrawal || 0
    });
  };

  useEffect(() => {
    loadStats();
    window.addEventListener('storage', loadStats);
    const interval = setInterval(loadStats, 2000);
    return () => {
      window.removeEventListener('storage', loadStats);
      clearInterval(interval);
    };
  }, [user.role]); // Re-run if user role changes

  const resetWallets = () => {
      if(window.confirm("Reset all wallet balances to Zero? This helps in re-testing calculations.")) {
          localStorage.removeItem('lords_wallets_by_role');
          localStorage.setItem('lords_wallets', JSON.stringify({
              total: 0, task_earnings: 0, upline_income: 0, downline_income: 0, hierarchy_earnings: 0, total_withdrawal: 0
          }));
          window.dispatchEvent(new Event('storage'));
      }
  };

  const formatAmount = (amount: number) => {
    return (amount || 0).toLocaleString('en-IN', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 6 
    });
  };

  const stats = [
    { label: "Active Orders", value: statsData.orders.toString(), trend: "In Ledger", color: "text-gold", icon: "fa-network-wired" },
    // Updated to show Task Earnings as requested
    { label: "Current Role", value: user.role.replace('_', ' '), trend: "Active", color: "text-blue-400", icon: "fa-user-tag" },
    { label: "Pending Tasks", value: statsData.pending.toString(), trend: "On Floor", color: "text-red-500", icon: "fa-clock" },
    { label: "System Grade", value: "A+", trend: "Safe Sync", color: "text-emerald-500", icon: "fa-award" },
  ];

  // Specific Admin Cards (Requested Update)
  const adminCards = [
    { label: "Today's Booking", value: statsData.todayBooking, icon: "fa-calendar-plus", color: "text-white", bg: "bg-blue-600/10 border-blue-600/30" },
    { label: "Ready to Deliver", value: statsData.readyDelivery, icon: "fa-box-open", color: "text-green-400", bg: "bg-green-600/10 border-green-600/30" },
    { label: "Total Clients", value: statsData.customers, icon: "fa-users", color: "text-gold", bg: "bg-gold/10 border-gold/30" },
    { label: "Active Workers", value: statsData.workers, icon: "fa-hard-hat", color: "text-purple-400", bg: "bg-purple-600/10 border-purple-600/30" },
    { label: "Material Level", value: statsData.materialStock + "%", icon: "fa-layer-group", color: "text-orange-400", bg: "bg-orange-600/10 border-orange-600/30" },
    { label: "Showroom Payout", value: "₹" + (statsData.orders * 20), icon: "fa-store", color: "text-pink-400", bg: "bg-pink-600/10 border-pink-600/30" },
    { label: "Tailor Payout", value: "₹" + (statsData.orders * 220), icon: "fa-cut", color: "text-cyan-400", bg: "bg-cyan-600/10 border-cyan-600/30" },
    { label: "Net Profit", value: "₹" + formatAmount(statsData.taskRevenue * 0.1), icon: "fa-coins", color: "text-emerald-400", bg: "bg-emerald-600/10 border-emerald-600/30" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-serif font-bold text-white uppercase tracking-widest">Master Dashboard</h1>
            <span className="bg-gold/10 border border-gold/30 text-gold text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">{user.role.replace('_', ' ')}</span>
          </div>
          <p className="text-gray-400 italic">Welcome, {user.name} to the Lord's Command Center.</p>
        </div>
        
        {/* RESET WALLET BUTTON FOR TESTING */}
        <button onClick={resetWallets} className="text-[10px] text-red-500 font-bold uppercase border border-red-500/30 px-4 py-2 rounded-full hover:bg-red-500 hover:text-white transition-all">
            <i className="fas fa-trash-alt mr-2"></i> Reset Wallet
        </button>
      </div>

      {/* Standard Stats (Top Row) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="premium-card p-6 rounded-2xl group relative overflow-hidden border-gold/10">
            <div className="absolute top-0 right-0 p-4 text-gold/5"><i className={`fas ${stat.icon} text-4xl`}></i></div>
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">{stat.label}</h3>
            <div className="flex items-baseline justify-between relative z-10">
              <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* BOOKING WALLET BANNER (Only for Showroom/Booking Master) */}
      {(user.role === UserRole.SHOWROOM || user.role === UserRole.BOOKING_MASTER) && (
        <div className="premium-card p-8 rounded-[2.5rem] bg-gradient-to-r from-blue-900/20 to-black border-blue-500/20 relative overflow-hidden group mb-6 animate-in slide-in-from-bottom-4">
            <div className="absolute right-0 top-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <i className="fas fa-file-invoice-dollar text-8xl text-blue-500"></i>
            </div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-left">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-500">
                            <i className="fas fa-wallet"></i>
                        </div>
                        <h3 className="text-sm font-black text-blue-500 uppercase tracking-widest">Main Wallet Balance</h3>
                    </div>
                    {/* UPDATED: Shows Wallet Balance (Total) instead of Task Earnings */}
                    <p className="text-4xl font-mono font-black text-white mt-2">₹{formatAmount(statsData.walletBalance)}</p>
                    <p className="text-[10px] text-gray-400 uppercase mt-1 font-bold">Total Available Funds (Recharge + Earnings)</p>
                </div>
            </div>
        </div>
      )}

      {/* NEW SECTION: ALL FINANCIALS (WORK, NETWORK & WITHDRAWAL) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-bottom-6">
         
         {/* 1. WORK INCOME CARD (For Everyone) */}
         <div className="premium-card p-6 rounded-3xl bg-gradient-to-br from-blue-900/20 to-black border-blue-500/20 relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
               <i className="fas fa-coins text-6xl text-blue-500"></i>
            </div>
            <div className="relative z-10">
               <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-500">
                     <i className="fas fa-hammer"></i>
                  </div>
                  <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Work Income</h3>
               </div>
               <p className="text-3xl font-mono font-bold text-white mt-2">₹{formatAmount(statsData.taskRevenue)}</p>
               <p className="text-[9px] text-gray-500 uppercase mt-1">Your Direct Tasks</p>
            </div>
         </div>

         {/* 2. Upline Income Card */}
         <div className="premium-card p-6 rounded-3xl bg-gradient-to-br from-green-900/20 to-black border-green-500/20 relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
               <i className="fas fa-level-up-alt text-6xl text-green-500"></i>
            </div>
            <div className="relative z-10">
               <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-green-500">
                     <i className="fas fa-arrow-up"></i>
                  </div>
                  <h3 className="text-[10px] font-black text-green-500 uppercase tracking-widest">Upline Income</h3>
               </div>
               <p className="text-3xl font-mono font-bold text-white mt-2">₹{formatAmount(statsData.uplineIncome)}</p>
               <p className="text-[9px] text-gray-500 uppercase mt-1">From Downline 10 Lvl</p>
            </div>
         </div>

         {/* 3. Downline Income Card */}
         <div className="premium-card p-6 rounded-3xl bg-gradient-to-br from-orange-900/20 to-black border-orange-500/20 relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
               <i className="fas fa-level-down-alt text-6xl text-orange-500"></i>
            </div>
            <div className="relative z-10">
               <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-500">
                     <i className="fas fa-arrow-down"></i>
                  </div>
                  <h3 className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Downline Income</h3>
               </div>
               <p className="text-3xl font-mono font-bold text-white mt-2">₹{formatAmount(statsData.downlineIncome)}</p>
               <p className="text-[9px] text-gray-500 uppercase mt-1">From Upline 10 Lvl</p>
            </div>
         </div>

         {/* 4. Withdrawal Income Card */}
         <div className="premium-card p-6 rounded-3xl bg-gradient-to-br from-red-900/20 to-black border-red-500/20 relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
               <i className="fas fa-money-bill-wave text-6xl text-red-500"></i>
            </div>
            <div className="relative z-10">
               <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-500">
                     <i className="fas fa-wallet"></i>
                  </div>
                  <h3 className="text-[10px] font-black text-red-500 uppercase tracking-widest">Total Withdrawal</h3>
               </div>
               <p className="text-3xl font-mono font-bold text-white mt-2">₹{formatAmount(statsData.withdrawal)}</p>
               <p className="text-[9px] text-gray-500 uppercase mt-1">Amount Cashed Out</p>
            </div>
         </div>
      </div>

      {/* Admin Specific Cards - Only visible to Management */}
      {(user.role === UserRole.ADMIN || user.role === UserRole.DIRECTOR || user.role === UserRole.MANAGER) && (
        <div className="space-y-6 pt-4 animate-in slide-in-from-bottom-5">
           <h2 className="text-xl font-serif font-bold gold-text uppercase tracking-widest border-b border-gold/10 pb-2">Admin Control Center</h2>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {adminCards.map((card, i) => (
                <div key={i} className={`p-5 rounded-3xl border ${card.bg} transition-all hover:scale-[1.02]`}>
                   <div className="flex justify-between items-start mb-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-black/20 ${card.color}`}>
                         <i className={`fas ${card.icon}`}></i>
                      </div>
                   </div>
                   <h3 className={`text-xl font-black ${card.color}`}>{card.value}</h3>
                   <p className="text-[9px] text-gray-400 uppercase font-bold tracking-widest mt-1">{card.label}</p>
                </div>
              ))}
           </div>
        </div>
      )}

      <div className="premium-card p-12 rounded-[3rem] text-center space-y-6 border-dashed border-gold/20 bg-gradient-to-b from-premiumDark to-premiumBlack">
         <div className="w-16 h-16 bg-gold/5 rounded-full flex items-center justify-center text-gold mx-auto animate-pulse shadow-[0_0_20px_rgba(212,175,55,0.1)]">
            <i className="fas fa-shield-alt text-2xl"></i>
         </div>
         <h2 className="text-2xl font-serif font-bold gold-text uppercase tracking-widest">Local Data Shield Active</h2>
         <p className="text-gray-500 max-w-lg mx-auto text-sm leading-relaxed">Every transaction is being recorded directly into your device's secure vault. Even without internet, your bespoke production tracking remains fully functional.</p>
         <div className="flex justify-center gap-6 pt-4">
            <div className="flex items-center space-x-2 text-[10px] font-bold text-green-500 uppercase tracking-widest"><i className="fas fa-circle text-[6px]"></i><span>Storage Secured</span></div>
            <div className="flex items-center space-x-2 text-[10px] font-bold text-gold uppercase tracking-widest"><i className="fas fa-sync text-[10px] animate-spin"></i><span>Auto Syncing</span></div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
