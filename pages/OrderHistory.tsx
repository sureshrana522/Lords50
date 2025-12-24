
import React, { useState, useEffect } from 'react';
import { Order, OrderStatus, UserRole } from '../types';

type HistoryTab = 'NEW' | 'PENDING' | 'COMPLETE';

const OrderHistory: React.FC = () => {
  const [user, setUser] = useState<{ id: string; role: UserRole; name: string } | null>(null);
  const [activeTab, setActiveTab] = useState<HistoryTab>('NEW');
  const [orders, setOrders] = useState<Order[]>([]);

  const loadOrders = () => {
    try {
      const all: Order[] = JSON.parse(localStorage.getItem('lords_saved_orders') || '[]');
      setOrders(all);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('lords_user');
    if (savedUser) setUser(JSON.parse(savedUser));
    loadOrders();
    const interval = setInterval(loadOrders, 2000);
    return () => clearInterval(interval);
  }, []);

  const getNextStep = (order: Order): { role: UserRole, status: OrderStatus } => {
    const type = order.garmentType.toLowerCase();
    
    switch (order.status) {
      case OrderStatus.BOOKED:
        return { role: UserRole.MEASUREMENT, status: OrderStatus.MEASURED };
      case OrderStatus.MEASURED:
        return { role: UserRole.CUTTING, status: OrderStatus.CUTTING_DONE };
      case OrderStatus.CUTTING_DONE:
        const makerRole = type.includes('shirt') ? UserRole.SHIRT_MAKER : UserRole.PANT_MAKER;
        return { role: makerRole, status: OrderStatus.STITCHING };
      case OrderStatus.STITCHING:
        return { role: UserRole.KAJ_BUTTON, status: OrderStatus.KAJ_BUTTON };
      case OrderStatus.KAJ_BUTTON:
        return { role: UserRole.PRESS, status: OrderStatus.PRESSING };
      case OrderStatus.PRESSING:
        return { role: UserRole.DELIVERY, status: OrderStatus.READY };
      case OrderStatus.READY:
        return { role: UserRole.SHOWROOM, status: OrderStatus.DELIVERED };
      default:
        return { role: UserRole.ADMIN, status: OrderStatus.DELIVERED };
    }
  };

  const processFinancials = (order: Order) => {
    const wallets = JSON.parse(localStorage.getItem('lords_wallets') || '{}');
    const settings = JSON.parse(localStorage.getItem('lords_settings') || '{}');
    
    const deductionPct = settings.master_deduction_percent ?? 10;
    const uplineSharePct = settings.upline_pool_share ?? 85;
    const downlineSharePct = settings.downline_pool_share ?? 15;
    const uplineLevels = settings.upline_levels || [10,10,10,10,10,10,10,10,10,10];
    const downlineLevels = settings.downline_levels || [10,10,10,10,10,10,10,10,10,10];

    const grossPayout = order.totalAmount || 1000;
    const masterCutPool = (grossPayout * deductionPct) / 100;
    const workerNetAmount = grossPayout - masterCutPool;

    const uplineTotalAmt = (masterCutPool * uplineSharePct) / 100;
    const downlineTotalAmt = (masterCutPool * downlineSharePct) / 100;

    uplineLevels.forEach((pct: number, idx: number) => {
      const key = `upline_level_${idx + 1}_income`;
      const amt = (uplineTotalAmt * pct) / 100;
      wallets[key] = (wallets[key] || 0) + amt;
    });

    downlineLevels.forEach((pct: number, idx: number) => {
      const key = `downline_level_${idx + 1}_income`;
      const amt = (downlineTotalAmt * pct) / 100;
      wallets[key] = (wallets[key] || 0) + amt;
    });

    wallets.stitching = (wallets.stitching || 0) + workerNetAmount;
    wallets.total = (wallets.total || 0) + grossPayout;

    localStorage.setItem('lords_wallets', JSON.stringify(wallets));
    window.dispatchEvent(new Event('storage'));
  };

  const handleAction = (order: Order) => {
    if (order.currentOwner !== user?.role) return;

    const all: Order[] = JSON.parse(localStorage.getItem('lords_saved_orders') || '[]');
    
    if (order.isPendingAcceptance) {
      // Step 1: Worker Accepts the Task
      const updated = all.map(o => o.id === order.id ? { ...o, isPendingAcceptance: false } : o);
      localStorage.setItem('lords_saved_orders', JSON.stringify(updated));
      alert(`${order.garmentType} Accepted in Floor`);
    } else {
      // Step 2: Worker Finishes and Hands Over to NEXT department
      const next = getNextStep(order);
      
      if (next.status === OrderStatus.DELIVERED) {
        processFinancials(order);
      }

      const updated = all.map(o => o.id === order.id ? { 
        ...o, 
        status: next.status, 
        currentOwner: next.role, 
        isPendingAcceptance: true 
      } : o);
      
      localStorage.setItem('lords_saved_orders', JSON.stringify(updated));
      alert(`Handover Successful: Sent to ${next.role.replace('_', ' ')}`);
    }
    
    loadOrders();
    window.dispatchEvent(new Event('storage'));
  };

  const filteredOrders = orders.filter(o => {
    if (o.currentOwner !== user?.role) return false;
    if (activeTab === 'NEW') return o.isPendingAcceptance;
    if (activeTab === 'PENDING') return !o.isPendingAcceptance && o.status !== OrderStatus.DELIVERED;
    if (activeTab === 'COMPLETE') return o.status === OrderStatus.DELIVERED;
    return true;
  });

  return (
    <div className="space-y-10 pb-20 max-w-5xl mx-auto px-4">
      <div className="text-center pt-8">
        <h1 className="text-4xl font-serif font-bold gold-text uppercase tracking-widest">Handover Engine</h1>
        <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Department Floor Manager</p>
      </div>

      <div className="flex justify-center bg-premiumDark p-1.5 rounded-3xl border border-gold/10 overflow-x-auto no-scrollbar">
        {['NEW', 'PENDING', 'COMPLETE'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab as HistoryTab)} className={`px-10 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-gold text-premiumBlack shadow-lg shadow-gold/20' : 'text-gray-500 hover:text-gold'}`}>
            {tab} {tab === 'NEW' && filteredOrders.length > 0 && `(${filteredOrders.length})`}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredOrders.map(order => (
          <div key={order.id} className="premium-card p-8 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center border-gold/5 group hover:border-gold/30 transition-all bg-premiumDark/50">
            <div className="flex items-center space-x-6 mb-6 md:mb-0">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${order.isPendingAcceptance ? 'bg-blue-500/10 text-blue-400 border-blue-400/30' : 'bg-gold/5 text-gold border-gold/20'}`}>
                <i className={`fas ${order.isPendingAcceptance ? 'fa-inbox' : 'fa-check-circle'} text-lg`}></i>
              </div>
              <div>
                <h3 className="font-bold text-white text-lg group-hover:gold-text transition-all">{order.customerName}</h3>
                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest flex items-center gap-2">
                  <span className="text-gold">{order.billNo}</span>
                  <span className="opacity-20">|</span>
                  <span>{order.garmentType}</span>
                  <span className="opacity-20">|</span>
                  <span className="text-green-500 italic">{order.status}</span>
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto">
              <button 
                onClick={() => handleAction(order)}
                className={`flex-1 md:flex-none px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${order.isPendingAcceptance ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/40 animate-pulse' : 'gold-gradient text-premiumBlack shadow-xl shadow-gold/20'}`}
              >
                {order.isPendingAcceptance ? 'Accept Handover' : `Finish & Handover to ${getNextStep(order).role.replace('_', ' ')}`}
              </button>
            </div>
          </div>
        ))}

        {filteredOrders.length === 0 && (
          <div className="py-24 text-center opacity-20">
             <i className="fas fa-box-open text-6xl mb-6 gold-text"></i>
             <p className="uppercase tracking-[0.4em] font-black text-[10px]">No tasks found in this section</p>
          </div>
        )}
      </div>

      <div className="premium-card p-8 rounded-[2.5rem] border-gold/5 bg-premiumDark/20 text-center">
         <p className="text-[8px] text-gray-600 uppercase font-black tracking-[0.3em]">Worker Protocol: Handover must be verified by both departments</p>
      </div>
    </div>
  );
};

export default OrderHistory;
