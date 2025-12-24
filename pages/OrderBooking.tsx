
import React, { useState } from 'react';
import { OrderStatus, UserRole, Order } from '../types';

interface BillItem {
  id: string;
  type: string;
  clothMeters: number;
  description: string;
  rate: number;
}

const OrderBooking: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', mobile: '', trialDate: '', deliveryDate: '', occasion: '' });
  const [items, setItems] = useState<BillItem[]>([{ id: '1', type: 'Shirt', clothMeters: 1.6, description: '', rate: 450 }]);
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleHandover = () => {
    const billNumber = `LT-${Math.floor(1000 + Math.random() * 9000)}`;
    const userStr = localStorage.getItem('lords_user');
    const user = userStr ? JSON.parse(userStr) : { name: 'Showroom Alpha', id: 's1' };

    const splitOrders: Order[] = items.map(item => ({
      id: Math.random().toString(36).substr(2, 9),
      billNo: billNumber,
      garmentType: item.type,
      customerName: formData.name,
      mobile: formData.mobile,
      items: item.type,
      date: new Date().toISOString().split('T')[0],
      deliveryDate: formData.deliveryDate,
      category: 'SAVED',
      totalAmount: item.rate,
      advance: 0,
      showroomName: user.name,
      showroomId: user.id || 's1',
      deliveryCode: Math.floor(1000 + Math.random() * 8999).toString(),
      status: OrderStatus.BOOKED,
      // Start of the chain: Next step is Measurement
      currentOwner: UserRole.MEASUREMENT, 
      isPendingAcceptance: true, 
      clothMeters: item.clothMeters,
      createdAt: new Date().toISOString()
    }));

    const existingOrders = JSON.parse(localStorage.getItem('lords_saved_orders') || '[]');
    localStorage.setItem('lords_saved_orders', JSON.stringify([...existingOrders, ...splitOrders]));
    window.dispatchEvent(new Event('storage'));

    setShowHandoverModal(false);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setFormData({ name: '', mobile: '', trialDate: '', deliveryDate: '', occasion: '' });
      setItems([{ id: '1', type: 'Shirt', clothMeters: 1.6, description: '', rate: 450 }]);
    }, 2000);
  };

  const garmentTypes = [
    { type: 'Shirt', rate: 450 }, 
    { type: 'Pant', rate: 550 }, 
    { type: 'Coat', rate: 2500 }, 
    { type: 'Safari', rate: 1800 }, 
    { type: 'Sherwani', rate: 5000 }
  ];

  const updateItem = (id: string, field: keyof BillItem, value: any) => setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {isSuccess && (
        <div className="fixed top-20 right-8 z-[100] animate-in slide-in-from-right-8 duration-500">
          <div className="bg-green-600/90 backdrop-blur-md text-white px-8 py-5 rounded-[2rem] shadow-2xl flex items-center space-x-5 border border-white/20">
             <i className="fas fa-check-double text-2xl"></i>
             <p className="font-black text-sm uppercase tracking-widest">Order Handed to Measurement</p>
          </div>
        </div>
      )}

      <div className="text-center">
        <h1 className="text-4xl font-serif font-bold gold-text uppercase tracking-widest">Booking Terminal</h1>
        <p className="text-gray-500 text-xs mt-1 uppercase tracking-widest font-bold">New Bespoke Entry</p>
      </div>

      <div className="premium-card p-10 rounded-[3rem] space-y-10 border-gold/10">
        <form onSubmit={(e) => { e.preventDefault(); setShowHandoverModal(true); }} className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-gray-500 ml-2">Customer Name</label>
              <input type="text" placeholder="Full Name" required className="w-full bg-premiumBlack border border-gold/20 rounded-2xl px-5 py-4 text-white focus:border-gold outline-none" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-gray-500 ml-2">Contact Mobile</label>
              <input type="tel" placeholder="91XXXXXXXX" required className="w-full bg-premiumBlack border border-gold/20 rounded-2xl px-5 py-4 text-white focus:border-gold outline-none" value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value})} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-gold/10 pb-4">
              <h3 className="text-[10px] font-black text-gold uppercase tracking-[0.4em]">Fabric & Garment Selection</h3>
              <button type="button" onClick={() => setItems([...items, { id: Date.now().toString(), type: 'Pant', clothMeters: 1.2, description: '', rate: 550 }])} className="text-gold border border-gold/30 px-6 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-gold hover:text-premiumBlack transition-all">+ Add Item</button>
            </div>
            {items.map((item) => (
              <div key={item.id} className="bg-premiumBlack/40 p-6 rounded-[2rem] border border-gold/5 grid grid-cols-1 md:grid-cols-3 gap-6 items-end group hover:border-gold/20 transition-all">
                <div className="space-y-2">
                  <label className="text-[8px] font-black uppercase text-gray-600 ml-2">Type</label>
                  <select className="w-full bg-premiumDark border border-gold/10 rounded-xl px-4 py-3 text-white text-xs outline-none" value={item.type} onChange={(e) => updateItem(item.id, 'type', e.target.value)}>
                    {garmentTypes.map(gt => <option key={gt.type} value={gt.type}>{gt.type}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] font-black uppercase text-gray-600 ml-2">Meters</label>
                  <input type="number" step="0.1" className="w-full bg-premiumDark border border-gold/10 rounded-xl px-4 py-3 text-white text-xs outline-none" value={item.clothMeters} onChange={(e) => updateItem(item.id, 'clothMeters', parseFloat(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] font-black uppercase text-gray-600 ml-2">Stitching Rate</label>
                  <input type="number" className="w-full bg-premiumDark border border-gold/10 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none" value={item.rate} onChange={(e) => updateItem(item.id, 'rate', parseInt(e.target.value))} />
                </div>
              </div>
            ))}
          </div>
          <button type="submit" className="w-full gold-gradient text-premiumBlack font-black py-6 rounded-[2rem] shadow-xl uppercase tracking-[0.5em] text-xs transition-all active:scale-95">Book & Handover to Measurement</button>
        </form>
      </div>

      {showHandoverModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-4 bg-black/95 backdrop-blur-xl">
           <div className="premium-card w-full max-w-lg rounded-[3rem] overflow-hidden border-gold/30 shadow-2xl p-12 text-center space-y-8 animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center text-gold mx-auto border border-gold/30">
                <i className="fas fa-paper-plane text-2xl"></i>
              </div>
              <h2 className="text-3xl font-serif font-bold gold-text uppercase">Confirm Handover</h2>
              <p className="text-gray-500 text-sm">Order will be sent to the Measurement department floor. Continue?</p>
              <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => setShowHandoverModal(false)} className="py-5 border border-gold/10 text-gray-500 font-black rounded-3xl uppercase text-[10px] hover:bg-white/5 transition-all">Cancel</button>
                 <button onClick={handleHandover} className="gold-gradient text-premiumBlack font-black py-5 rounded-3xl uppercase text-[10px] shadow-lg shadow-gold/20 active:scale-95 transition-all">Send Now</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default OrderBooking;
