
import React, { useState, useEffect } from 'react';
import { OrderStatus, UserRole, Order, DressCategory, ReferralPartner } from '../types';

const OrderBooking: React.FC = () => {
  // Customer Details State
  const [customer, setCustomer] = useState({
    name: '',
    mobile: '',
    address: '',
    deliveryDate: '',
    referralId: '',
    isOutsourced: false,
    isUrgent: false // Added Urgent State
  });

  // Item Entry State
  const [currentItem, setCurrentItem] = useState({
    type: 'Shirt',
    rate: 0,
    category: DressCategory.EXECUTIVE_LINE
  });

  // Cart State (List of items to be booked)
  const [cartItems, setCartItems] = useState<Array<{type: string, rate: number, category: DressCategory}>>([]);

  const [partners, setPartners] = useState<ReferralPartner[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(UserRole.SHOWROOM);
  const [currentUserName, setCurrentUserName] = useState<string>('Showroom Manager');

  useEffect(() => {
    const saved = localStorage.getItem('lords_referral_partners');
    if (saved) setPartners(JSON.parse(saved));

    // Get current user to assign ownership
    const user = JSON.parse(localStorage.getItem('lords_user') || '{}');
    if (user && user.role) {
        setCurrentUserRole(user.role);
        setCurrentUserName(user.name);
    }
  }, []);

  // Add Item to List
  const addItem = () => {
    if (currentItem.rate <= 0) {
      alert("Please enter a valid rate");
      return;
    }
    setCartItems([...cartItems, { ...currentItem }]);
    // Reset current item input
    setCurrentItem({ ...currentItem, rate: 0 });
  };

  // Remove Item from List
  const removeItem = (index: number) => {
    const newCart = [...cartItems];
    newCart.splice(index, 1);
    setCartItems(newCart);
  };

  // Demo Bill Function
  const fillDemoData = () => {
    setCustomer({
        name: "Rahul Khanna (Split Demo)",
        mobile: "9988776655",
        address: "Malviya Nagar, Jaipur",
        deliveryDate: new Date().toISOString().split('T')[0],
        referralId: '',
        isOutsourced: false,
        isUrgent: true // Demo Urgent
    });
    setCartItems([
        { type: 'Shirt', rate: 350, category: DressCategory.EXECUTIVE_LINE },
        { type: 'Pant', rate: 450, category: DressCategory.EXECUTIVE_LINE }
    ]);
  };

  // Calculate Total (Only for Invoice View)
  const totalBillAmount = cartItems.reduce((sum, item) => sum + item.rate, 0);

  const handleCancel = () => {
    if(window.confirm("Are you sure you want to cancel this bill? All data will be lost.")) {
      setCustomer({ name: '', mobile: '', address: '', deliveryDate: '', referralId: '', isOutsourced: false, isUrgent: false });
      setCartItems([]);
      setCurrentItem({ ...currentItem, rate: 0 });
    }
  };

  const handleEdit = () => {
    alert("You can modify items in the list or customer details now.");
  };

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      alert("Please add at least one item (Shirt or Pant) to the bill.");
      return;
    }

    const billNumber = `LT-${Math.floor(1000 + Math.random() * 9000)}`;
    const createdAt = new Date().toISOString();
    
    // Create separate orders for each item sharing the SAME Bill Number
    const newOrders: Order[] = cartItems.map(item => ({
      id: Math.random().toString(36).substr(2, 9),
      billNo: billNumber, 
      customerName: customer.name,
      mobile: customer.mobile,
      address: customer.address,
      garmentType: item.type,
      category: item.category,
      status: OrderStatus.BOOKED,
      currentOwner: currentUserRole,
      previousOwner: undefined,
      isPendingAcceptance: true, 
      totalAmount: item.rate,
      deliveryDate: customer.deliveryDate,
      createdAt: createdAt,
      referralPartnerId: customer.referralId || undefined,
      isOutsourced: customer.isOutsourced,
      isUrgent: customer.isUrgent, // Save Urgent Flag
      clothDetail: { brand: '-', length: 0, color: '-' },
      secretCode: Math.floor(1000 + Math.random() * 9000).toString(),
      timelineLogs: [{
          status: OrderStatus.BOOKED,
          role: currentUserRole,
          workerName: currentUserName,
          timestamp: createdAt,
          action: 'ACCEPTED'
      }]
    }));

    // Save Orders
    const existing = JSON.parse(localStorage.getItem('lords_saved_orders') || '[]');
    localStorage.setItem('lords_saved_orders', JSON.stringify([...existing, ...newOrders]));
    
    // NOTE: Commission logic removed from here. It is now in OrderHistory (handleAcceptOrder).

    // Trigger System Update
    window.dispatchEvent(new Event('storage'));
    
    let msg = `SUCCESS ✅\nBill No: ${billNumber}\nGenerated ${newOrders.length} Orders.`;
    msg += `\n\ninfo: Commission will be credited when Measurement Master accepts the order.`;
    if (customer.isUrgent) msg += `\n🔥 MARKED AS URGENT`;

    alert(msg);
    
    // Reset Form
    setCustomer({ name: '', mobile: '', address: '', deliveryDate: '', referralId: '', isOutsourced: false, isUrgent: false });
    setCartItems([]);
    setCurrentItem({ ...currentItem, rate: 0 });
  };

  return (
    <div className="max-w-5xl mx-auto py-10 animate-in fade-in duration-500">
      <div className="text-center mb-10 relative">
        <h1 className="text-4xl font-serif font-bold gold-text uppercase tracking-widest">New Bill Entry</h1>
        <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">{currentUserRole.replace('_',' ')} Booking Panel</p>
        
        {/* DEMO BUTTON */}
        <button 
           onClick={fillDemoData}
           type="button"
           className="absolute top-0 right-0 md:right-10 gold-gradient text-premiumBlack px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-lg"
        >
           <i className="fas fa-magic mr-2"></i> Demo Bill
        </button>
      </div>

      <div className="premium-card p-10 rounded-[3.5rem] border-gold/10">
        <form onSubmit={handleBook} className="space-y-10">
          
          {/* Section 1: Customer Details */}
          <div className="space-y-6">
            <h3 className="text-[10px] text-gold font-black uppercase tracking-[0.3em] border-b border-gold/10 pb-2">1. Customer Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1">
                <label className="text-[8px] text-gray-500 font-black uppercase tracking-widest ml-1">Customer Name</label>
                <input type="text" className="w-full bg-premiumBlack border border-gold/20 rounded-2xl px-6 py-4 text-white outline-none focus:border-gold font-bold" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} placeholder="Enter Name" required />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] text-gray-500 font-black uppercase tracking-widest ml-1">Mobile No.</label>
                <input type="tel" className="w-full bg-premiumBlack border border-gold/20 rounded-2xl px-6 py-4 text-white outline-none focus:border-gold font-bold" value={customer.mobile} onChange={e => setCustomer({...customer, mobile: e.target.value})} placeholder="Enter Mobile" required />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] text-gray-500 font-black uppercase tracking-widest ml-1">Address</label>
                <input type="text" className="w-full bg-premiumBlack border border-gold/20 rounded-2xl px-6 py-4 text-white outline-none focus:border-gold" value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})} placeholder="City / Area" />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] text-gray-500 font-black uppercase tracking-widest ml-1">Delivery Date</label>
                <input type="date" className="w-full bg-premiumBlack border border-gold/20 rounded-2xl px-6 py-4 text-white outline-none focus:border-gold" value={customer.deliveryDate} onChange={e => setCustomer({...customer, deliveryDate: e.target.value})} required />
              </div>
              
              {/* URGENT TOGGLE */}
              <div className="flex items-center justify-between bg-premiumBlack border border-gold/20 rounded-2xl px-6 py-4">
                  <div>
                      <label className="text-[8px] text-red-500 font-black uppercase tracking-widest block">Urgent Order?</label>
                      <p className="text-[10px] text-gray-500">Mark as High Priority</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={customer.isUrgent} onChange={e => setCustomer({...customer, isUrgent: e.target.checked})} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
              </div>
            </div>
          </div>

          {/* Section 2: Add Items */}
          <div className="space-y-6">
            <h3 className="text-[10px] text-gold font-black uppercase tracking-[0.3em] border-b border-gold/10 pb-2">2. Add Items (Separate Orders)</h3>
            
            <div className="bg-premiumDark/50 p-6 rounded-3xl border border-gold/5 flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 space-y-1 w-full">
                <label className="text-[8px] text-gray-500 font-black uppercase tracking-widest ml-1">Item Type</label>
                <select 
                  className="w-full bg-premiumBlack border border-gold/20 rounded-2xl px-6 py-4 text-white outline-none focus:border-gold font-bold cursor-pointer" 
                  value={currentItem.type} 
                  onChange={e => setCurrentItem({...currentItem, type: e.target.value})}
                >
                  <option value="Shirt">Shirt</option>
                  <option value="Pant">Pant</option>
                  <option value="Coat">Coat / Blazer</option>
                  <option value="Waistcoat">Waistcoat</option>
                  <option value="Safari">Safari</option>
                  <option value="Kurta">Kurta</option>
                  <option value="Pajama">Pajama</option>
                  <option value="Sherwani">Sherwani</option>
                </select>
              </div>

              <div className="flex-1 space-y-1 w-full">
                 <label className="text-[8px] text-gray-500 font-black uppercase tracking-widest ml-1">Collection</label>
                 <select 
                  className="w-full bg-premiumBlack border border-gold/20 rounded-2xl px-6 py-4 text-white outline-none focus:border-gold font-bold cursor-pointer text-xs" 
                  value={currentItem.category} 
                  onChange={e => setCurrentItem({...currentItem, category: e.target.value as DressCategory})}
                >
                  {Object.values(DressCategory).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="flex-1 space-y-1 w-full">
                <label className="text-[8px] text-gray-500 font-black uppercase tracking-widest ml-1">Rate (₹)</label>
                <input 
                  type="number" 
                  className="w-full bg-premiumBlack border border-gold/20 rounded-2xl px-6 py-4 text-white outline-none focus:border-gold font-bold" 
                  value={currentItem.rate} 
                  onChange={e => setCurrentItem({...currentItem, rate: parseInt(e.target.value) || 0})} 
                  placeholder="0"
                />
              </div>

              <button 
                type="button" 
                onClick={addItem}
                className="w-full md:w-auto bg-gold text-premiumBlack font-black px-8 py-4 rounded-2xl uppercase text-xs tracking-widest hover:bg-white transition-colors h-[58px]"
              >
                Add +
              </button>
            </div>

            {/* Added Items List */}
            {cartItems.length > 0 && (
              <div className="bg-premiumBlack rounded-3xl border border-gold/10 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gold/5">
                    <tr>
                      <th className="p-4 text-[9px] text-gold uppercase font-black tracking-widest">Item (Order)</th>
                      <th className="p-4 text-[9px] text-gold uppercase font-black tracking-widest">Category</th>
                      <th className="p-4 text-[9px] text-gold uppercase font-black tracking-widest text-right">Rate</th>
                      <th className="p-4 text-[9px] text-gold uppercase font-black tracking-widest text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {cartItems.map((item, index) => (
                      <tr key={index}>
                        <td className="p-4 text-white font-bold text-sm">{item.type}</td>
                        <td className="p-4 text-gray-400 text-xs">{item.category}</td>
                        <td className="p-4 text-white font-mono font-bold text-right">₹{item.rate}</td>
                        <td className="p-4 text-center">
                          <button onClick={() => removeItem(index)} className="text-red-500 hover:text-red-400">
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gold/10 border-t border-gold/20">
                    <tr>
                      <td colSpan={2} className="p-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">
                         Note: Items will be saved as <span className="text-white">{cartItems.length} SEPARATE Orders</span>
                      </td>
                      <td className="p-4 text-right text-xl font-black text-gold">₹{totalBillAmount}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* THE 3 ACTION BUTTONS */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gold/10">
             <button type="button" onClick={handleCancel} className="py-5 rounded-[1.5rem] bg-red-500/10 border border-red-500/30 text-red-500 font-black uppercase text-[10px] tracking-widest hover:bg-red-500 hover:text-white transition-all">
                <i className="fas fa-times mr-2"></i> Cancel
             </button>
             
             <button type="button" onClick={handleEdit} className="py-5 rounded-[1.5rem] bg-gray-800 border border-gray-600 text-gray-300 font-black uppercase text-[10px] tracking-widest hover:bg-gray-700 transition-all">
                <i className="fas fa-edit mr-2"></i> Edit
             </button>
             
             <button type="submit" className="py-5 rounded-[1.5rem] bg-green-600/20 border border-green-500 text-green-500 font-black uppercase text-[10px] tracking-widest hover:bg-green-600 hover:text-white shadow-xl active:scale-95 transition-all">
                <i className="fas fa-save mr-2"></i> Save Bill
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderBooking;
