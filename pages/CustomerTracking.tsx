
import React, { useState } from 'react';
import { OrderStatus } from '../types';

const CustomerTracking: React.FC = () => {
  const [billNo, setBillNo] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearching(true);
    // Simulate API delay
    setTimeout(() => {
      setOrder({
        billNo: billNo,
        customerName: 'Premium Gentleman',
        category: 'Royal Classic Suit',
        status: OrderStatus.KAJ_BUTTON,
        deliveryDate: '2025-06-25',
        steps: [
          { name: 'Order Booked', done: true, date: '2025-06-10' },
          { name: 'Measurement', done: true, date: '2025-06-10' },
          { name: 'Cloth Cutting', done: true, date: '2025-06-12' },
          { name: 'Master Stitching', done: true, date: '2025-06-18' },
          { name: 'Finishing & Pressing', done: false, date: null },
          { name: 'Quality Check', done: false, date: null },
          { name: 'Ready for Delivery', done: false, date: null },
        ]
      });
      setSearching(false);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="font-serif text-4xl gold-text font-bold mb-4 tracking-widest">TRACK YOUR MASTERPIECE</h1>
        <p className="text-gray-400">Enter your bill number to see the current status of your bespoke garment.</p>
      </div>

      <div className="premium-card p-6 md:p-8 rounded-2xl mb-12">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
             <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gold/50"></i>
             <input 
              type="text" 
              placeholder="e.g. LT-4587" 
              className="w-full bg-premiumBlack border border-gold/30 rounded-xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-gold transition-all"
              value={billNo}
              onChange={(e) => setBillNo(e.target.value)}
              required
             />
          </div>
          <button 
            type="submit" 
            disabled={searching}
            className="gold-gradient text-premiumBlack font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-gold/20 disabled:opacity-50 transition-all uppercase tracking-widest"
          >
            {searching ? <i className="fas fa-circle-notch animate-spin"></i> : 'TRACK ORDER'}
          </button>
        </form>
      </div>

      {order && (
        <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="premium-card p-6 rounded-2xl">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">ORDER DETAILS</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Bill Number</span>
                  <span className="text-white font-bold">{order.billNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Client Name</span>
                  <span className="text-white font-bold">{order.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Selected Collection</span>
                  <span className="text-gold font-bold">{order.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Expected Delivery</span>
                  <span className="text-green-500 font-bold">{order.deliveryDate}</span>
                </div>
              </div>
            </div>

            <div className="premium-card p-6 rounded-2xl flex flex-col justify-center items-center text-center">
               <div className="w-20 h-20 rounded-full border-2 border-gold flex items-center justify-center mb-4 relative">
                  <i className="fas fa-cut text-3xl gold-text"></i>
                  <div className="absolute inset-0 rounded-full border-2 border-gold border-t-transparent animate-spin"></div>
               </div>
               <h3 className="text-xl font-serif font-bold gold-text">In Production</h3>
               <p className="text-gray-400 text-sm mt-2">Your garment is currently being hand-finished by our master tailors.</p>
            </div>
          </div>

          <div className="premium-card p-8 rounded-2xl">
             <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-10">PRODUCTION TIMELINE</h3>
             <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-800"></div>

                <div className="space-y-12">
                  {order.steps.map((step: any, i: number) => (
                    <div key={i} className="relative flex items-center group">
                      <div className={`
                        absolute left-4 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center z-10 border-2 transition-all duration-500
                        ${step.done ? 'bg-gold border-gold' : 'bg-premiumDark border-gray-700'}
                      `}>
                        {step.done ? (
                          <i className="fas fa-check text-premiumBlack text-xs"></i>
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-gray-700"></div>
                        )}
                      </div>
                      <div className="ml-12">
                        <h4 className={`text-lg font-bold transition-colors ${step.done ? 'text-white' : 'text-gray-600'}`}>
                          {step.name}
                        </h4>
                        {step.date && (
                          <p className="text-gold text-xs font-medium mt-1">{step.date}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerTracking;
