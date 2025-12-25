
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserRole, UserProfile, ReferralPartner, WithdrawalRequest, AddMoneyRequest } from '../types';

interface SidebarProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onUpdateUser: (user: UserProfile) => void;
}

interface SubMenuItem {
  label: string;
  icon: string;
  path: string;
  state: { tab: string };
}

interface MenuItem {
  label: string;
  icon: string;
  path?: string;
  action?: () => void;
  roles: UserRole[];
  subItems?: SubMenuItem[]; 
}

const Sidebar: React.FC<SidebarProps> = ({ user, isOpen, onClose, onLogout, onUpdateUser }) => {
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrUploadRef = useRef<HTMLInputElement>(null);
  
  const [openSubMenu, setOpenSubMenu] = useState<string | null>('Order Management'); 
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminTab, setAdminTab] = useState<'TASK_RATES' | 'NETWORK_COMM' | 'PARTNERS'>('TASK_RATES');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editProfile, setEditProfile] = useState<UserProfile>({ ...user });

  // --- NEW REQUEST CENTER STATES ---
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestTab, setRequestTab] = useState<'WITHDRAWALS' | 'ADD_MONEY' | 'SETTINGS'>('WITHDRAWALS');
  const [companyPayment, setCompanyPayment] = useState({ upiId: 'lords@upi', qrCode: '' });
  
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [addMoneyRequests, setAddMoneyRequests] = useState<AddMoneyRequest[]>([]);
  const [pendingCount, setPendingCount] = useState(0);

  // Load Data
  const loadRequests = () => {
    const wReqs: WithdrawalRequest[] = JSON.parse(localStorage.getItem('lords_withdrawal_requests') || '[]');
    const aReqs: AddMoneyRequest[] = JSON.parse(localStorage.getItem('lords_add_money_requests') || '[]');
    
    setWithdrawalRequests(wReqs);
    setAddMoneyRequests(aReqs);
    setPendingCount(wReqs.filter(r => r.status === 'PENDING').length + aReqs.filter(r => r.status === 'PENDING').length);
    
    const savedPayment = localStorage.getItem('lords_company_payment');
    if(savedPayment) setCompanyPayment(JSON.parse(savedPayment));
  };

  useEffect(() => {
    loadRequests();
    const interval = setInterval(loadRequests, 3000);
    return () => clearInterval(interval);
  }, []);

  const saveCompanyPayment = () => {
      localStorage.setItem('lords_company_payment', JSON.stringify(companyPayment));
      alert("Company Payment Details Updated!");
      setRequestTab('ADD_MONEY'); // Go back
      window.dispatchEvent(new Event('storage'));
  };

  // --- ACTION HANDLERS ---
  const handleAdminWithdrawalAction = (reqId: string, action: 'APPROVE' | 'REJECT') => {
      const allReqs: WithdrawalRequest[] = JSON.parse(localStorage.getItem('lords_withdrawal_requests') || '[]');
      const roleWallets = JSON.parse(localStorage.getItem('lords_wallets_by_role') || '{}');
      
      const updatedReqs = allReqs.map(req => {
          if (req.id === reqId) {
              if (action === 'REJECT') {
                  // Refund
                  if (!roleWallets[req.userRole]) roleWallets[req.userRole] = { total: 0 };
                  roleWallets[req.userRole].total = (roleWallets[req.userRole].total || 0) + req.amount;
                  roleWallets[req.userRole].total_withdrawal = (roleWallets[req.userRole].total_withdrawal || 0) - req.amount;
              }
              return { ...req, status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED' };
          }
          return req;
      });

      localStorage.setItem('lords_withdrawal_requests', JSON.stringify(updatedReqs));
      localStorage.setItem('lords_wallets_by_role', JSON.stringify(roleWallets));
      setWithdrawalRequests(updatedReqs);
      window.dispatchEvent(new Event('storage'));
  };
  
  const handleAdminAddMoneyAction = (reqId: string, action: 'APPROVE' | 'REJECT') => {
      const allReqs: AddMoneyRequest[] = JSON.parse(localStorage.getItem('lords_add_money_requests') || '[]');
      const roleWallets = JSON.parse(localStorage.getItem('lords_wallets_by_role') || '{}');
      
      const updatedReqs = allReqs.map(req => {
          if (req.id === reqId) {
              if (action === 'APPROVE') {
                  if (!roleWallets[req.userRole]) {
                      roleWallets[req.userRole] = { task_earnings: 0, total: 0, upline_income: 0, downline_income: 0 };
                  }
                  // FIX: Only increase TOTAL (Main Balance), NOT task_earnings (Work Income)
                  roleWallets[req.userRole].total = (roleWallets[req.userRole].total || 0) + req.amount;
              }
              return { ...req, status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED' };
          }
          return req;
      });

      localStorage.setItem('lords_add_money_requests', JSON.stringify(updatedReqs));
      localStorage.setItem('lords_wallets_by_role', JSON.stringify(roleWallets));
      setAddMoneyRequests(updatedReqs);
      window.dispatchEvent(new Event('storage'));
  };

  const toggleSubMenu = (label: string) => {
    if (openSubMenu === label) { setOpenSubMenu(null); } else { setOpenSubMenu(label); }
  };

  const baseItems: MenuItem[] = [
    { label: 'Dashboard Control', icon: 'fas fa-th-large', path: '/', roles: Object.values(UserRole) },
    { label: 'Book New Order', icon: 'fas fa-plus-circle', path: '/new-order', roles: [UserRole.SHOWROOM, UserRole.BOOKING_MASTER, UserRole.ADMIN, UserRole.MANAGER, UserRole.DIRECTOR, UserRole.OPERATION_HEAD] },
  ];

  const orderMenu: MenuItem = {
    label: 'Order Management',
    icon: 'fas fa-clipboard-list',
    roles: Object.values(UserRole).filter(r => r !== UserRole.CUSTOMER),
    subItems: [
      { label: 'Inbox (New)', icon: 'fas fa-inbox', path: '/order-history', state: { tab: 'INBOX' } },
      { label: 'Pending (Active)', icon: 'fas fa-clock', path: '/order-history', state: { tab: 'PENDING' } },
      { label: 'Handover (Next)', icon: 'fas fa-hand-holding', path: '/order-history', state: { tab: 'HANDOVER' } },
      { label: 'Completed', icon: 'fas fa-check-circle', path: '/order-history', state: { tab: 'COMPLETE' } },
      { label: 'Full History', icon: 'fas fa-history', path: '/order-history', state: { tab: 'HISTORY' } },
    ]
  };

  const manageItems: MenuItem[] = [
    { label: 'Worker Identity', icon: 'fas fa-id-card', action: () => setShowProfileModal(true), roles: Object.values(UserRole) },
    { label: 'Client Database', icon: 'fas fa-address-book', path: '/customers', roles: [UserRole.ADMIN, UserRole.SHOWROOM, UserRole.BOOKING_MASTER, UserRole.MANAGER, UserRole.DIRECTOR] },
    { label: 'Digital Wallet', icon: 'fas fa-wallet', path: '/wallets', roles: Object.values(UserRole) },
    { label: 'Growth Network', icon: 'fas fa-users', path: '/referral-team', roles: Object.values(UserRole) },
    { label: 'Inventory (Material)', icon: 'fas fa-boxes', path: '/inventory', roles: [UserRole.ADMIN, UserRole.MATERIAL, UserRole.MANAGER, UserRole.DIRECTOR] },
    { label: 'Audit Reports', icon: 'fas fa-chart-line', path: '/reports', roles: [UserRole.ADMIN, UserRole.DIRECTOR, UserRole.MANAGER, UserRole.OPERATION_HEAD] },
    { label: 'Master Admin', icon: 'fas fa-crown', action: () => setShowAdminModal(true), roles: [UserRole.ADMIN, UserRole.DIRECTOR] },
  ];

  const allItems: MenuItem[] = [...baseItems, orderMenu, ...manageItems];

  return (
    <>
      <div className={`fixed inset-0 bg-black/80 z-[60] md:hidden ${isOpen ? 'block' : 'hidden'}`} onClick={onClose} />
      <aside className={`fixed md:relative z-[70] h-full w-72 bg-premiumDark border-r border-gold/10 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} flex flex-col`}>
        <div className="p-10 border-b border-gold/5 text-center">
          <h2 className="font-serif text-3xl gold-text tracking-[0.2em] font-bold uppercase">LORD'S</h2>
          <p className="text-[8px] text-gray-500 tracking-[0.5em] uppercase font-black mt-1">Production Suite 2025</p>
        </div>
        
        <nav className="flex-1 py-6 px-5 space-y-2 overflow-y-auto no-scrollbar">
          {allItems.filter(item => item.roles.includes(user.role)).map((item, idx) => (
            <React.Fragment key={idx}>
                <div className="space-y-1">
                {item.subItems ? (
                    <button 
                    onClick={() => toggleSubMenu(item.label)} 
                    className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all ${openSubMenu === item.label ? 'bg-gold/10 text-gold shadow-lg shadow-gold/5' : 'text-gray-400 hover:text-gold hover:bg-gold/5'}`}
                    >
                    <div className="flex items-center space-x-4">
                        <i className={`${item.icon} text-sm w-5`}></i>
                        <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                    </div>
                    <i className={`fas fa-chevron-down text-xs transition-transform duration-300 ${openSubMenu === item.label ? 'rotate-180' : ''}`}></i>
                    </button>
                ) : (
                    <button 
                        onClick={() => { item.action?.(); if(item.path) { onClose(); } }} 
                        className="w-full flex items-center justify-between px-5 py-4 rounded-2xl text-gray-400 hover:text-gold hover:bg-gold/5 transition-all relative"
                    >
                        {item.path ? (
                             <Link to={item.path} className="flex items-center space-x-4 w-full h-full absolute inset-0 px-5" onClick={onClose}>
                                <div className="opacity-0">Hidden Overlay</div>
                             </Link>
                        ) : null}
                        
                        <div className="flex items-center space-x-4">
                            <i className={`${item.icon} text-sm w-5`}></i>
                            <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                        </div>
                    </button>
                )}

                {item.subItems && openSubMenu === item.label && (
                    <div className="pl-6 space-y-1 animate-in slide-in-from-top-2 duration-300">
                    {item.subItems.map((sub, sIdx) => (
                        <Link 
                        key={sIdx}
                        to={sub.path}
                        state={sub.state}
                        onClick={onClose}
                        className={`flex items-center space-x-3 px-5 py-3 rounded-xl transition-all ${location.pathname === sub.path && (location.state as any)?.tab === sub.state.tab ? 'bg-gold text-premiumBlack font-bold' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                        >
                        <i className={`${sub.icon} text-xs w-4`}></i>
                        <span className="text-[9px] font-bold uppercase tracking-widest">{sub.label}</span>
                        </Link>
                    ))}
                    </div>
                )}
                </div>
            </React.Fragment>
          ))}
        </nav>
        
        {/* NEW FOOTER REQUEST BUTTON - ONLY FOR ADMIN/DIRECTOR */}
        {(user.role === UserRole.ADMIN || user.role === UserRole.DIRECTOR) && (
            <div className="p-4 border-t border-gold/5">
                <button 
                    onClick={() => { setShowRequestModal(true); onClose(); }} 
                    className="w-full flex items-center justify-between px-5 py-4 rounded-2xl bg-gradient-to-r from-gray-800 to-gray-900 border border-gold/20 text-white shadow-lg active:scale-95 transition-all relative overflow-hidden group"
                >
                    <div className="flex items-center space-x-3 relative z-10">
                        <i className="fas fa-bell text-gold text-sm animate-pulse"></i>
                        <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-gold transition-colors">Request Center</span>
                    </div>
                    {pendingCount > 0 && (
                        <span className="relative z-10 bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-md shadow-red-500/50">{pendingCount}</span>
                    )}
                </button>
            </div>
        )}

        <div className="p-4 pt-0">
          <button onClick={onLogout} className="w-full flex items-center justify-center space-x-3 px-5 py-4 rounded-2xl text-red-500 bg-red-500/5 hover:bg-red-500/10 uppercase tracking-widest text-[9px] font-black transition-all border border-red-500/10">
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout Terminal</span>
          </button>
        </div>
      </aside>

      {/* REQUEST CENTER MODAL */}
      {showRequestModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center px-4 bg-black/95 backdrop-blur-3xl p-4 animate-in fade-in duration-300">
            <div className="premium-card w-full max-w-4xl max-h-[90vh] flex flex-col rounded-[2.5rem] overflow-hidden border-gold/30">
                <div className="p-6 border-b border-gold/10 bg-premiumDark flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-serif font-bold gold-text uppercase tracking-widest">Master Request Center</h2>
                        <p className="text-[9px] text-gray-500 uppercase font-black">Manage Financial Approvals</p>
                    </div>
                    <button onClick={() => setShowRequestModal(false)} className="w-10 h-10 rounded-full bg-premiumBlack border border-gold/20 flex items-center justify-center text-gold hover:bg-gold hover:text-premiumBlack transition-all">
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                {/* TABS & SETTINGS TOGGLE */}
                <div className="flex bg-premiumBlack p-2 gap-2 border-b border-gold/5 shrink-0">
                    <button onClick={() => setRequestTab('WITHDRAWALS')} className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${requestTab === 'WITHDRAWALS' ? 'bg-red-500 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>
                        <i className="fas fa-arrow-up mr-2"></i> Withdrawals
                    </button>
                    <button onClick={() => setRequestTab('ADD_MONEY')} className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${requestTab === 'ADD_MONEY' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>
                        <i className="fas fa-plus-circle mr-2"></i> Add Money
                    </button>
                    <button onClick={() => setRequestTab('SETTINGS')} className={`w-14 rounded-xl text-lg transition-all ${requestTab === 'SETTINGS' ? 'bg-gold text-premiumBlack' : 'bg-gray-800 text-gold'}`}>
                        <i className="fas fa-cog"></i>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-premiumBlack/50">
                    
                    {/* WITHDRAWALS LIST */}
                    {requestTab === 'WITHDRAWALS' && (
                        <div className="space-y-4">
                            {withdrawalRequests.filter(r => r.status === 'PENDING').length === 0 && (
                                <p className="text-center text-gray-600 text-xs py-10">No pending withdrawals.</p>
                            )}
                            {withdrawalRequests.map(req => (
                                <div key={req.id} className={`premium-card p-5 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 border-l-4 ${req.status === 'PENDING' ? 'border-l-red-500' : 'border-l-gray-600 opacity-50'}`}>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="text-sm font-bold text-white">{req.userName}</h4>
                                                <p className="text-[9px] text-gray-400 font-bold uppercase">{req.userRole.replace('_',' ')}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-mono font-black text-red-500">₹{req.amount}</p>
                                            </div>
                                        </div>
                                        <div className="mt-2 text-[9px] text-gray-500 flex gap-4">
                                            <span><i className="fas fa-clock mr-1"></i> {new Date(req.requestDate).toLocaleDateString()}</span>
                                            <span>Method: {req.method}</span>
                                            {req.upiId && <span>UPI: {req.upiId}</span>}
                                        </div>
                                    </div>
                                    {req.status === 'PENDING' ? (
                                        <div className="flex gap-2 w-full md:w-auto">
                                            <button onClick={() => handleAdminWithdrawalAction(req.id, 'REJECT')} className="flex-1 px-5 py-3 rounded-xl border border-red-500/30 text-red-500 text-[9px] font-black uppercase hover:bg-red-500/10">Reject</button>
                                            <button onClick={() => handleAdminWithdrawalAction(req.id, 'APPROVE')} className="flex-1 px-5 py-3 rounded-xl bg-green-600 text-white text-[9px] font-black uppercase shadow-lg hover:bg-green-500">Approve</button>
                                        </div>
                                    ) : <span className="px-3 py-1 bg-gray-800 rounded text-[9px] font-bold text-gray-500 uppercase">{req.status}</span>}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ADD MONEY LIST */}
                    {requestTab === 'ADD_MONEY' && (
                        <div className="space-y-4">
                             {addMoneyRequests.filter(r => r.status === 'PENDING').length === 0 && (
                                <p className="text-center text-gray-600 text-xs py-10">No pending fund requests.</p>
                            )}
                            {addMoneyRequests.map(req => (
                                <div key={req.id} className={`premium-card p-5 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 border-l-4 ${req.status === 'PENDING' ? 'border-l-green-500' : 'border-l-gray-600 opacity-50'}`}>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="text-sm font-bold text-white">{req.userName}</h4>
                                                <p className="text-[9px] text-gray-400 font-bold uppercase">{req.userRole.replace('_',' ')}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-mono font-black text-green-500">₹{req.amount}</p>
                                            </div>
                                        </div>
                                        <div className="mt-2 text-[10px] text-white bg-gray-800 px-3 py-2 rounded-lg inline-block border border-gold/10">
                                            UTR: <span className="font-mono text-gold">{req.utr}</span>
                                        </div>
                                    </div>
                                    {req.status === 'PENDING' ? (
                                        <div className="flex gap-2 w-full md:w-auto">
                                            <button onClick={() => handleAdminAddMoneyAction(req.id, 'REJECT')} className="flex-1 px-5 py-3 rounded-xl border border-red-500/30 text-red-500 text-[9px] font-black uppercase hover:bg-red-500/10">Reject</button>
                                            <button onClick={() => handleAdminAddMoneyAction(req.id, 'APPROVE')} className="flex-1 px-5 py-3 rounded-xl bg-green-600 text-white text-[9px] font-black uppercase shadow-lg hover:bg-green-500">Verify & Load</button>
                                        </div>
                                    ) : <span className="px-3 py-1 bg-gray-800 rounded text-[9px] font-bold text-gray-500 uppercase">{req.status}</span>}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* SETTINGS (QR & UPI) */}
                    {requestTab === 'SETTINGS' && (
                        <div className="p-4 space-y-6">
                            <div className="text-center mb-6">
                                <h3 className="text-lg font-bold text-white uppercase">Company Payment Details</h3>
                                <p className="text-[10px] text-gray-500 uppercase">These details will be visible to Showroom & Booking Masters</p>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-[9px] text-gold font-black uppercase tracking-widest ml-1">Company UPI ID</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-premiumBlack border border-gold/20 rounded-xl px-4 py-3 text-white font-bold"
                                    value={companyPayment.upiId}
                                    onChange={(e) => setCompanyPayment({...companyPayment, upiId: e.target.value})}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] text-gold font-black uppercase tracking-widest ml-1">Company QR Code</label>
                                <div className="flex items-center gap-4">
                                    <div className="w-24 h-24 border border-gold/20 bg-black rounded-xl overflow-hidden flex items-center justify-center">
                                        {companyPayment.qrCode ? <img src={companyPayment.qrCode} alt="QR" className="w-full h-full object-cover" /> : <i className="fas fa-qrcode text-gray-700 text-2xl"></i>}
                                    </div>
                                    <button onClick={() => qrUploadRef.current?.click()} className="px-6 py-3 bg-gray-800 text-white rounded-xl text-[10px] font-bold uppercase hover:bg-gray-700">
                                        Upload New QR
                                    </button>
                                    <input type="file" ref={qrUploadRef} className="hidden" accept="image/*" onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => setCompanyPayment(prev => ({ ...prev, qrCode: reader.result as string }));
                                            reader.readAsDataURL(file);
                                        }
                                    }} />
                                </div>
                            </div>

                            <button onClick={saveCompanyPayment} className="w-full py-4 rounded-xl gold-gradient text-premiumBlack font-black uppercase text-[10px] tracking-widest shadow-lg mt-8">
                                Save Company Details
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* ADMIN MODAL (Original - Keeping for other settings) */}
      {showAdminModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center px-4 bg-black/98 backdrop-blur-3xl overflow-y-auto py-10">
           <div className="premium-card w-full max-w-5xl rounded-[3rem] overflow-hidden border-gold/30 animate-in zoom-in-95 flex flex-col max-h-[90vh]">
              <div className="p-8 border-b border-gold/10 bg-premiumDark/50 text-center relative flex-shrink-0">
                 <button onClick={() => setShowAdminModal(false)} className="absolute top-8 right-8 text-gold/50 hover:text-gold"><i className="fas fa-times text-xl"></i></button>
                 <h2 className="text-2xl font-serif font-bold gold-text uppercase tracking-widest">Master Admin Terminal</h2>
                 <div className="flex bg-premiumBlack rounded-2xl p-1.5 border border-gold/10 mt-8 overflow-x-auto no-scrollbar max-w-2xl mx-auto">
                    {['TASK_RATES', 'NETWORK_COMM', 'PARTNERS'].map(tab => (
                      <button key={tab} onClick={() => setAdminTab(tab as any)} className={`flex-1 px-4 py-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${adminTab === tab ? 'bg-gold text-premiumBlack shadow-lg' : 'text-gray-500'}`}>
                        {tab.replace('_', ' ')}
                      </button>
                    ))}
                 </div>
              </div>
              <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                 {/* ... existing admin tabs content ... */}
                 {adminTab === 'TASK_RATES' && (<div className="text-center py-20 text-gray-500 uppercase tracking-widest text-xs font-black">Worker Rates Config</div>)}
                 {adminTab === 'NETWORK_COMM' && (<div className="text-center py-20 text-gray-500 uppercase tracking-widest text-xs font-black">Distribution Logic Active</div>)}
                 {adminTab === 'PARTNERS' && (<div className="text-center py-20 text-gray-500 uppercase tracking-widest text-xs font-black">Partner Module Active</div>)}
              </div>
           </div>
        </div>
      )}

      {/* IDENTITY MODAL */}
      {showProfileModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center px-4 bg-black/98 backdrop-blur-3xl overflow-y-auto py-10">
           <div className="premium-card w-full max-w-xl rounded-[3.5rem] overflow-hidden border-gold/40 shadow-2xl animate-in zoom-in-95">
              <div className="p-10 border-b border-gold/10 flex flex-col items-center bg-premiumDark/50 text-center relative">
                 <button onClick={() => setShowProfileModal(false)} className="absolute top-8 right-8 text-gold/50 hover:text-gold"><i className="fas fa-times text-xl"></i></button>
                 <div className="relative group cursor-pointer mb-6" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-24 h-24 rounded-full bg-premiumBlack border-2 border-gold/30 flex items-center justify-center overflow-hidden shadow-2xl transition-all group-hover:border-gold">
                       {editProfile.image ? <img src={editProfile.image} alt="Profile" className="w-full h-full object-cover" /> : <span className="text-4xl font-serif font-bold gold-text">{editProfile.name.charAt(0)}</span>}
                    </div>
                    <div className="absolute bottom-0 right-0 bg-gold text-premiumBlack w-8 h-8 rounded-full flex items-center justify-center text-[10px] border-2 border-premiumBlack shadow-lg"><i className="fas fa-camera"></i></div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => setEditProfile(p => ({ ...p, image: reader.result as string })); reader.readAsDataURL(file); } }} />
                 </div>
                 <h2 className="text-xl font-serif font-bold gold-text uppercase tracking-widest">Master Identity</h2>
                 <p className="text-[10px] text-gray-500 font-bold uppercase mt-2">Access Key: {user.referralCode}</p>
              </div>
              <div className="p-10 space-y-6">
                 <div className="space-y-1"><label className="text-[8px] text-gray-500 font-black uppercase tracking-widest ml-1">Legal Name</label><input type="text" value={editProfile.name} onChange={e => setEditProfile({...editProfile, name: e.target.value})} className="w-full bg-premiumBlack border border-gold/20 rounded-xl px-5 py-4 text-white text-xs font-bold outline-none focus:border-gold" /></div>
                 <div className="pt-4 flex gap-4"><button onClick={() => setShowProfileModal(false)} className="flex-1 py-4 text-[9px] font-black uppercase text-gray-600">Cancel</button><button onClick={() => { onUpdateUser(editProfile); setShowProfileModal(false); alert("IDENTITY AUTHENTICATED"); }} className="flex-[2] gold-gradient text-premiumBlack font-black py-4 rounded-2xl uppercase text-[9px] tracking-widest shadow-xl active:scale-95 transition-all">Update Vault</button></div>
              </div>
           </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
