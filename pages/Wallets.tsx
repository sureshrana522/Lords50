
import React, { useState, useEffect } from 'react';

const Wallets: React.FC = () => {
  const [balances, setBalances] = useState<any>({});
  const [activeTab, setActiveTab] = useState<'UPLINE' | 'DOWNLINE'>('UPLINE');

  const loadWallets = () => {
    const saved = JSON.parse(localStorage.getItem('lords_wallets') || '{}');
    setBalances(saved);
  };

  useEffect(() => {
    loadWallets();
    const interval = setInterval(loadWallets, 2000);
    return () => clearInterval(interval);
  }, []);

  const getLevelIncome = (type: 'upline' | 'downline') => {
    return Array.from({ length: 10 }, (_, i) => ({
      level: i + 1,
      amount: balances[`${type}_level_${i + 1}_income`] || 0
    }));
  };

  return (
    <div className="space-y-10 pb-20 px-4 max-w-6xl mx-auto animate-in fade-in duration-700">
      <div className="text-center space-y-2 pt-8">
        <h1 className="text-4xl font-serif font-bold gold-text tracking-widest uppercase">Digital Ledger</h1>
        <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em]">Encrypted Financial Custody</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="premium-card p-10 rounded-[3rem] border-gold/20 bg-gold/5 group text-center">
            <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Total Vault</p>
            <h2 className="text-5xl font-mono font-black text-white group-hover:gold-text transition-all">₹{Math.floor(balances.total || 0).toLocaleString()}</h2>
            <button className="w-full mt-8 gold-gradient text-premiumBlack font-black py-4 rounded-2xl uppercase text-[10px] tracking-widest shadow-lg">Withdraw Funds</button>
         </div>
         <div className="premium-card p-10 rounded-[3rem] border-gold/10 text-center">
            <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Network Shares</p>
            <h2 className="text-4xl font-mono font-black text-green-500">₹{Math.floor((balances.total || 0) * 0.35).toLocaleString()}</h2>
            <p className="text-[8px] text-gray-600 uppercase mt-2 font-bold tracking-widest">Team Yield Balance</p>
         </div>
         <div className="premium-card p-10 rounded-[3rem] border-gold/10 text-center">
            <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Labor Net</p>
            <h2 className="text-4xl font-mono font-black text-blue-500">₹{Math.floor(balances.stitching || 0).toLocaleString()}</h2>
            <p className="text-[8px] text-gray-600 uppercase mt-2 font-bold tracking-widest">Personal Task Earnings</p>
         </div>
      </div>

      <div className="premium-card rounded-[3.5rem] overflow-hidden border-gold/10">
        <div className="p-10 border-b border-gold/10 flex flex-col md:flex-row justify-between items-center gap-6 bg-premiumDark/30">
          <div>
             <h3 className="font-serif text-2xl gold-text uppercase">Matrix Performance</h3>
             <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">10-Level Commission Streams</p>
          </div>
          <div className="flex bg-premiumBlack rounded-2xl p-1.5 border border-gold/10">
             <button onClick={() => setActiveTab('UPLINE')} className={`px-8 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'UPLINE' ? 'bg-gold text-premiumBlack shadow-lg' : 'text-gray-500'}`}>Upline Distribution</button>
             <button onClick={() => setActiveTab('DOWNLINE')} className={`px-8 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'DOWNLINE' ? 'bg-gold text-premiumBlack shadow-lg' : 'text-gray-500'}`}>Downline Distribution</button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-gold/10">
          {getLevelIncome(activeTab.toLowerCase() as any).map(lvl => (
            <div key={lvl.level} className="bg-premiumBlack p-8 hover:bg-gold/5 transition-all text-center space-y-3">
              <div className="flex flex-col items-center">
                 <p className="text-[9px] font-black text-gray-600 uppercase mb-1">Level {lvl.level}</p>
                 <div className="h-0.5 w-6 bg-gold/20 rounded-full"></div>
              </div>
              <h4 className={`text-xl font-mono font-bold ${lvl.amount > 0 ? 'text-gold' : 'text-gray-800'}`}>₹{lvl.amount.toFixed(2)}</h4>
              <span className="text-[7px] text-gray-700 font-black uppercase tracking-tighter">Yield</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="text-center opacity-30 py-10">
         <p className="text-[8px] text-gray-500 uppercase tracking-[0.6em] font-black">Encrypted Financial Audit Logs Active</p>
      </div>
    </div>
  );
};

export default Wallets;
