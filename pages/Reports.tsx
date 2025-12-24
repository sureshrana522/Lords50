
import React from 'react';
import { HIERARCHY_COMMISSIONS } from '../constants';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const Reports: React.FC = () => {
  const distributionData = HIERARCHY_COMMISSIONS.map(lvl => ({
    name: lvl.label,
    value: lvl.percent
  }));

  const COLORS = ['#d4af37', '#aa8a2e', '#f1e292', '#8a6d1e', '#5c4813', '#2e2409'];

  const systemPanels = [
    { name: 'Showroom', icon: 'fa-store', status: 'Active', load: 'High' },
    { name: 'Measurement', icon: 'fa-ruler-combined', status: 'Active', load: 'Normal' },
    { name: 'Cutting', icon: 'fa-cut', status: 'Active', load: 'Normal' },
    { name: 'Material', icon: 'fa-boxes', status: 'Active', load: 'Low' },
    { name: 'Tailoring', icon: 'fa-mitten', status: 'Active', load: 'Critical' },
    { name: 'Kaj-Button', icon: 'fa-dot-circle', status: 'Maintenance', load: '-' },
    { name: 'Pressing', icon: 'fa-tshirt', status: 'Active', load: 'Normal' },
    { name: 'Delivery', icon: 'fa-truck', status: 'Active', load: 'Normal' },
    { name: 'Manager', icon: 'fa-user-tie', status: 'Active', load: 'Normal' },
    { name: 'Admin', icon: 'fa-crown', status: 'Active', load: 'System' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold gold-text uppercase tracking-widest">Executive Insights</h1>
          <p className="text-gray-400">Total System Infrastructure: <span className="text-gold font-bold">10 Active Operational Panels</span></p>
        </div>
        <div className="flex space-x-2">
          <button className="gold-gradient text-premiumBlack font-bold px-4 py-2 rounded-lg text-sm uppercase tracking-widest">Download Audit PDF</button>
        </div>
      </div>

      {/* Panel Connectivity Map */}
      <div className="premium-card p-6 rounded-3xl">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-[0.2em] mb-6">Network Connectivity Status (All 10 Panels)</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {systemPanels.map((panel, i) => (
            <div key={i} className="bg-premiumBlack p-4 rounded-2xl border border-gold/10 hover:border-gold/30 transition-all group">
              <div className="flex justify-between items-start mb-3">
                 <div className="w-10 h-10 rounded-xl bg-gold/5 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-premiumBlack transition-all">
                    <i className={`fas ${panel.icon}`}></i>
                 </div>
                 <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${panel.status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {panel.status}
                 </span>
              </div>
              <p className="text-xs font-bold text-white mb-1">{panel.name}</p>
              <div className="flex items-center gap-1">
                 <div className="w-1 h-1 rounded-full bg-gold/50"></div>
                 <p className="text-[9px] text-gray-500 uppercase tracking-tighter">Load: {panel.load}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="premium-card p-8 rounded-2xl">
          <h3 className="text-lg font-serif font-bold gold-text mb-8">Profit Distribution Model (30% total)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #d4af37', borderRadius: '8px' }}
                   itemStyle={{ color: '#d4af37' }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
           <div className="premium-card p-6 rounded-2xl">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Financial Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 bg-premiumBlack rounded-xl border border-gold/5">
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Gross Revenue</p>
                    <p className="text-xl font-bold text-white">₹12,45,000</p>
                 </div>
                 <div className="p-4 bg-premiumBlack rounded-xl border border-gold/5">
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Distributed Amount</p>
                    <p className="text-xl font-bold text-gold">₹3,73,500</p>
                 </div>
                 <div className="p-4 bg-premiumBlack rounded-xl border border-gold/5">
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Company Profit</p>
                    <p className="text-xl font-bold text-green-500">₹8,71,500</p>
                 </div>
                 <div className="p-4 bg-premiumBlack rounded-xl border border-gold/5">
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Material Expense</p>
                    <p className="text-xl font-bold text-red-500">₹1,12,000</p>
                 </div>
              </div>
           </div>

           <div className="premium-card p-6 rounded-2xl">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Hierarchy Performance</h3>
              <div className="space-y-3">
                 {HIERARCHY_COMMISSIONS.slice(0, 4).map((lvl, i) => (
                   <div key={i} className="flex flex-col space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-300 font-medium">{lvl.label} Network</span>
                        <span className="text-gold">{lvl.percent}% Share</span>
                      </div>
                      <div className="h-1.5 w-full bg-premiumBlack rounded-full overflow-hidden">
                         <div className="h-full bg-gold" style={{ width: `${80 - (i * 10)}%` }}></div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      <div className="premium-card rounded-2xl overflow-hidden">
         <div className="px-6 py-5 border-b border-gold/10">
            <h2 className="text-xl font-serif font-bold gold-text">Regional Showroom Performance</h2>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-premiumBlack border-b border-gold/5">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Showroom</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Active Orders</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Revenue</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/5">
                {['Delhi Elite', 'Mumbai Royal', 'Jaipur Heritage', 'Bangalore Urban'].map((name, i) => (
                  <tr key={i} className="hover:bg-gold/5 transition-all">
                    <td className="px-6 py-4 text-white font-bold text-xs">{name}</td>
                    <td className="px-6 py-4 text-center text-gray-400 text-xs">{24 + (i * 12)}</td>
                    <td className="px-6 py-4 text-center text-gold font-bold text-xs">₹{120000 + (i * 45000)}</td>
                    <td className="px-6 py-4 text-right">
                       <button className="text-[10px] font-bold text-gray-600 hover:text-gold uppercase tracking-widest transition-colors">Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default Reports;
