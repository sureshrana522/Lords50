
import React, { useState, useEffect } from 'react';
import { Customer, Order, OrderStatus, UserRole } from '../types';

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCust, setNewCust] = useState({ name: '', mobile: '', address: '', instagram: '', birthday: '' });

  const loadData = () => {
    const savedCust = JSON.parse(localStorage.getItem('lords_customers') || '[]');
    const savedOrders = JSON.parse(localStorage.getItem('lords_saved_orders') || '[]');
    setCustomers(savedCust);
    setOrders(savedOrders);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  const handleAddCustomer = () => {
    if (!newCust.name || !newCust.mobile) return alert("Name and Mobile required");
    const existing = JSON.parse(localStorage.getItem('lords_customers') || '[]');
    const customer: Customer = {
      id: Math.random().toString(36).substr(2, 9),
      name: newCust.name,
      mobile: newCust.mobile,
      address: newCust.address,
      instagramId: newCust.instagram,
      birthday: newCust.birthday,
      clothQuantityMeters: 0,
      isNew: true
    };
    const updated = [...existing, customer];
    localStorage.setItem('lords_customers', JSON.stringify(updated));
    setCustomers(updated);
    setIsAddingNew(false);
    setNewCust({ name: '', mobile: '', address: '', instagram: '', birthday: '' });
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.mobile.includes(searchTerm)
  );

  const getStats = (custId: string) => {
    const custOrders = orders.filter(o => o.mobile === customers.find(c => c.id === custId)?.mobile);
    return { count: custOrders.length, last: custOrders[0]?.date || 'No Orders' };
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-serif font-bold gold-text uppercase tracking-widest">Client Registry</h1>
        <button onClick={() => setIsAddingNew(true)} className="gold-gradient text-premiumBlack font-black px-6 py-3 rounded-xl text-[10px] uppercase">New Client</button>
      </div>

      <div className="premium-card p-4 rounded-2xl flex items-center border-gold/20">
        <i className="fas fa-search ml-4 text-gold/50"></i>
        <input 
          type="text" 
          placeholder="Search by name or mobile..."
          className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-white placeholder:text-gray-600 font-bold"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.length > 0 ? filteredCustomers.map((customer) => (
          <div key={customer.id} onClick={() => setSelectedCustomer(customer)} className="premium-card p-6 rounded-3xl hover:border-gold cursor-pointer group transition-all">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold font-serif text-xl border border-gold/20">
                {customer.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-white group-hover:gold-text transition-colors">{customer.name}</h3>
                <p className="text-xs text-gray-500">{customer.mobile}</p>
              </div>
            </div>
            <div className="flex justify-between border-t border-gold/5 pt-4">
              <div className="text-center">
                <p className="text-[8px] text-gray-600 uppercase font-black">Orders</p>
                <p className="text-sm font-bold text-gold">{getStats(customer.id).count}</p>
              </div>
              <div className="text-right">
                <p className="text-[8px] text-gray-600 uppercase font-black">Last Visit</p>
                <p className="text-xs font-bold text-white">{getStats(customer.id).last}</p>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center opacity-20">
            <i className="fas fa-users text-6xl mb-4 gold-text"></i>
            <p className="uppercase tracking-widest text-xs font-black">No client records found</p>
          </div>
        )}
      </div>

      {isAddingNew && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 bg-black/90 backdrop-blur-xl">
          <div className="premium-card w-full max-w-md rounded-[2.5rem] p-10 space-y-6">
            <h2 className="text-xl font-serif font-bold gold-text uppercase text-center">Register New Client</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Full Name" className="w-full bg-premiumBlack border border-gold/20 rounded-xl px-4 py-3 text-white" value={newCust.name} onChange={e => setNewCust({...newCust, name: e.target.value})} />
              <input type="tel" placeholder="Mobile Number" className="w-full bg-premiumBlack border border-gold/20 rounded-xl px-4 py-3 text-white" value={newCust.mobile} onChange={e => setNewCust({...newCust, mobile: e.target.value})} />
              <input type="text" placeholder="Address" className="w-full bg-premiumBlack border border-gold/20 rounded-xl px-4 py-3 text-white" value={newCust.address} onChange={e => setNewCust({...newCust, address: e.target.value})} />
            </div>
            <button onClick={handleAddCustomer} className="w-full gold-gradient text-premiumBlack font-black py-4 rounded-xl uppercase text-[10px]">Save Client</button>
            <button onClick={() => setIsAddingNew(false)} className="w-full text-gray-500 text-[10px] font-black uppercase">Cancel</button>
          </div>
        </div>
      )}

      {selectedCustomer && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 bg-black/90 backdrop-blur-xl">
           <div className="premium-card w-full max-w-2xl rounded-[3rem] p-10 space-y-8 animate-in slide-in-from-bottom-10">
              <div className="flex justify-between items-center border-b border-gold/10 pb-6">
                <div className="flex items-center space-x-4">
                   <div className="w-16 h-16 rounded-full bg-gold/5 flex items-center justify-center text-gold text-2xl font-serif border border-gold/20">{selectedCustomer.name.charAt(0)}</div>
                   <div>
                     <h2 className="text-2xl font-serif font-bold gold-text">{selectedCustomer.name}</h2>
                     <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">{selectedCustomer.mobile}</p>
                   </div>
                </div>
                <button onClick={() => setSelectedCustomer(null)} className="text-gold"><i className="fas fa-times text-2xl"></i></button>
              </div>
              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <p className="text-[10px] text-gray-600 font-black uppercase">Home Address</p>
                    <p className="text-sm text-white">{selectedCustomer.address || 'Not Provided'}</p>
                 </div>
                 <div className="space-y-2">
                    <p className="text-[10px] text-gray-600 font-black uppercase">Instagram</p>
                    <p className="text-sm text-gold">{selectedCustomer.instagramId || 'N/A'}</p>
                 </div>
              </div>
              <div className="space-y-4">
                 <p className="text-[10px] text-gold font-black uppercase tracking-[0.3em]">Recent Masterpieces</p>
                 <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                    {orders.filter(o => o.mobile === selectedCustomer.mobile).map(o => (
                      <div key={o.id} className="flex justify-between bg-premiumBlack p-4 rounded-xl border border-gold/5">
                         <span className="text-white font-bold">{o.garmentType} - {o.billNo}</span>
                         <span className="text-gold font-mono">₹{o.totalAmount}</span>
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

export default Customers;
