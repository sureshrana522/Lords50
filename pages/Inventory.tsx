
import React from 'react';
import { MATERIAL_ITEMS } from '../constants';

const Inventory: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold gold-text">Material Inventory</h1>
          <p className="text-gray-400">Track and manage essential tailoring materials.</p>
        </div>
        <button className="gold-gradient text-premiumBlack font-bold px-6 py-3 rounded-xl shadow-lg transition-all uppercase tracking-widest text-sm">
          <i className="fas fa-plus mr-2"></i> Add Stock Item
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {MATERIAL_ITEMS.map((item, i) => (
          <div key={i} className="premium-card p-6 rounded-2xl border-l-4 border-l-gold">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-white">{item}</h3>
              <span className={`text-xs px-2 py-1 rounded font-bold ${i % 3 === 0 ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                {i % 3 === 0 ? 'LOW STOCK' : 'IN STOCK'}
              </span>
            </div>
            
            <div className="space-y-4">
               <div>
                  <div className="flex justify-between text-xs text-gray-500 uppercase tracking-widest mb-2">
                    <span>Available</span>
                    <span>100 Units Max</span>
                  </div>
                  <div className="h-2 w-full bg-premiumBlack rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${i % 3 === 0 ? 'bg-red-500' : 'bg-gold'}`} 
                      style={{ width: `${Math.floor(Math.random() * 80) + 10}%` }}
                    ></div>
                  </div>
               </div>
               
               <div className="flex justify-between items-center pt-2">
                  <div className="flex -space-x-2">
                     <div className="w-8 h-8 rounded-full border-2 border-premiumDark bg-gray-800 flex items-center justify-center text-[10px] text-gray-400">W1</div>
                     <div className="w-8 h-8 rounded-full border-2 border-premiumDark bg-gray-800 flex items-center justify-center text-[10px] text-gray-400">W2</div>
                  </div>
                  <button className="text-gold text-xs font-bold hover:underline uppercase tracking-tighter">Adjust Stock</button>
               </div>
            </div>
          </div>
        ))}
      </div>

      <div className="premium-card p-6 rounded-2xl">
        <h3 className="text-lg font-serif font-bold gold-text mb-6">Recent Usage History</h3>
        <div className="space-y-4">
           {[
             { item: 'Belt Roll', qty: '-5 Units', user: 'Sunil (Cutting)', time: '2 hours ago' },
             { item: 'Canvas', qty: '-12 Units', user: 'Rajesh (Stitching)', time: '5 hours ago' },
             { item: 'Thread (Black)', qty: '+50 Units', user: 'Admin (System)', time: '1 day ago' },
           ].map((log, i) => (
             <div key={i} className="flex items-center justify-between p-4 bg-premiumBlack/50 rounded-xl border border-gold/5">
                <div className="flex items-center space-x-4">
                   <div className={`w-10 h-10 rounded flex items-center justify-center ${log.qty.startsWith('+') ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'}`}>
                      <i className={`fas ${log.qty.startsWith('+') ? 'fa-arrow-up' : 'fa-arrow-down'}`}></i>
                   </div>
                   <div>
                      <p className="text-sm font-bold text-white">{log.item}</p>
                      <p className="text-xs text-gray-500">{log.user} • {log.time}</p>
                   </div>
                </div>
                <span className={`font-mono font-bold ${log.qty.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{log.qty}</span>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default Inventory;
