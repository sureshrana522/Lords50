
import React, { useEffect, useState } from 'react';
import { UserRole, OrderStatus } from '../types';

interface DashboardProps {
  user: { id: string; role: UserRole; name: string };
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [statsData, setStatsData] = useState({ orders: 0, revenue: 0, pending: 0 });

  const loadStats = () => {
    const allOrders = JSON.parse(localStorage.getItem('lords_saved_orders') || '[]');
    const wallets = JSON.parse(localStorage.getItem('lords_wallets') || '{"total":0}');
    
    setStatsData({
      orders: allOrders.length,
      revenue: wallets.total || 0,
      pending: allOrders.filter((o: any) => o.status !== OrderStatus.DELIVERED).length
    });
  };

  useEffect(() => {
    loadStats();
    // Listen for storage changes from other components (like Sidebar booking)
    window.addEventListener('storage', loadStats);
    const interval = setInterval(loadStats, 2000);
    return () => {
      window.removeEventListener('storage', loadStats);
      clearInterval(interval);
    };
  }, []);

  const stats = [
    { label: "Active Orders", value: statsData.orders.toString(), trend: "In Ledger", color: "text-gold", icon: "fa-network-wired" },
    { label: "Total Revenue", value: `₹${Math.floor(statsData.revenue).toLocaleString()}`, trend: "Audit Ready", color: "text-green-500", icon: "fa-chart-pie" },
    { label: "Pending Tasks", value: statsData.pending.toString(), trend: "On Floor", color: "text-red-500", icon: "fa-clock" },
    { label: "System Grade", value: "A+", trend: "Safe Sync", color: "text-blue-500", icon: "fa-award" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-serif font-bold text-white uppercase tracking-widest">Master Dashboard</h1>
            <span className="bg-gold/10 border border-gold/30 text-gold text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">{user.role}</span>
          </div>
          <p className="text-gray-400 italic">Welcome, {user.name} to the Lord's Command Center.</p>
        </div>
      </div>

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
