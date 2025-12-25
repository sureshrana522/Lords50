
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
      </div>
    </div>
  );
};

export default Reports;
