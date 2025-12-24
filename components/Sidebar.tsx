
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserRole, OrderStatus } from '../types';

interface UserProfile {
  id: string;
  role: UserRole;
  name: string;
  address?: string;
  mobile?: string;
  email?: string;
  image?: string;
}

interface SidebarProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onUpdateUser?: (user: UserProfile) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, isOpen, onClose, onLogout, onUpdateUser }) => {
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminTab, setAdminTab] = useState<'WORKER_RATES' | 'VIP_RATES' | 'MATERIALS' | 'COMMISSIONS'>('WORKER_RATES');
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  const [editProfile, setEditProfile] = useState<UserProfile>({ ...user });

  const [settings, setSettings] = useState({
    // Worker Payouts
    showroom_payout: 20,
    measurement_new: 30,
    measurement_old: 15,
    cutting_rate: 50,
    stitching_shirt: 120,
    stitching_pant: 220,
    stitching_suit: 800,
    press_rate: 20,
    delivery_payout: 20,

    // VIP Dress Rates
    royal_classic_rate: 15000,
    urban_elite_rate: 12000,
    executive_line_rate: 8000,
    festive_premium_rate: 10000,
    trendy_party_rate: 9000,
    imperial_ceremony_rate: 25000,
    signature_luxury_rate: 50000,
    lords_special_rate: 75000,

    // Materials
    thread_cost: 10,
    canvas_cost: 45,
    zip_cost: 20,
    button_patti_cost: 15,
    hook_cost: 5,
    belt_roll_cost: 30,

    // Commissions & Levels
    company_cut_pct: 10,
    upline_share_pct: 85,
    downline_share_pct: 15
  });

  useEffect(() => {
    const saved = localStorage.getItem('lords_settings');
    if (saved) {
        try {
            setSettings(JSON.parse(saved));
        } catch(e) {
            console.error("Failed to parse settings");
        }
    }
  }, []);

  const saveAdminSettings = () => {
    localStorage.setItem('lords_settings', JSON.stringify(settings));
    alert("Admin Control: System Rates Synchronized.");
    setShowAdminModal(false);
    window.dispatchEvent(new Event('storage'));
  };

  const handleUpdateProfile = () => {
    if (!editProfile.name.trim()) return alert("Name is required");
    if (onUpdateUser) onUpdateUser(editProfile);
    setShowProfileModal(false);
    alert("Identity Vault Secured.");
  };

  const menuItems = [
    { label: 'Dashboard', icon: 'fas fa-th-large', path: '/', roles: Object.values(UserRole) },
    { label: 'My Profile', icon: 'fas fa-user-circle', action: () => { setEditProfile({ ...user }); setShowProfileModal(true); }, roles: Object.values(UserRole) },
    { label: 'Admin Terminal', icon: 'fas fa-crown', action: () => setShowAdminModal(true), roles: [UserRole.ADMIN] },
    { label: 'Order Booking', icon: 'fas fa-plus-circle', path: '/new-order', roles: [UserRole.SHOWROOM, UserRole.ADMIN] },
    { label: 'Production Floor', icon: 'fas fa-history', path: '/order-history', roles: Object.values(UserRole).filter(r => r !== UserRole.CUSTOMER) },
    { label: 'Registry', icon: 'fas fa-address-book', path: '/customers', roles: [UserRole.ADMIN, UserRole.SHOWROOM, UserRole.MANAGER] },
    { label: 'Wallets', icon: 'fas fa-wallet', path: '/wallets', roles: Object.values(UserRole) },
  ];

  return (
    <>
      <div className={`fixed inset-0 bg-black/80 z-[60] md:hidden ${isOpen ? 'block' : 'hidden'}`} onClick={onClose} />
      <aside className={`fixed md:relative z-[70] h-full w-72 bg-premiumDark border-r border-gold/10 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} flex flex-col`}>
        <div className="p-10 border-b border-gold/5 text-center">
          <h2 className="font-serif text-3xl gold-text tracking-[0.2em] font-bold uppercase">LORD'S</h2>
          <p className="text-[8px] text-gray-500 tracking-[0.5em] uppercase font-black mt-1">Production Suite 2025</p>
        </div>
        
        <nav className="flex-1 py-8 px-5 space-y-2 overflow-y-auto no-scrollbar">
          {menuItems.filter(item => item.roles.includes(user.role)).map((item, idx) => (
            item.path ? (
              <Link key={idx} to={item.path} onClick={onClose} className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all ${location.pathname === item.path ? 'bg-gold text-premiumBlack font-black shadow-lg shadow-gold/20' : 'text-gray-400 hover:text-gold hover:bg-gold/5'}`}>
                <i className={`${item.icon} text-sm w-5`}></i>
                <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
              </Link>
            ) : (
              <button key={idx} onClick={() => { item.action?.(); onClose(); }} className="w-full flex items-center space-x-4 px-5 py-4 rounded-2xl text-gray-400 hover:text-gold hover:bg-gold/5 transition-all">
                <i className={`${item.icon} text-sm w-5`}></i>
                <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
              </button>
            )
          ))}
        </nav>
        
        <div className="p-8 border-t border-gold/5">
          <button onClick={onLogout} className="w-full flex items-center justify-center space-x-3 px-5 py-4 rounded-2xl text-red-500 bg-red-500/5 hover:bg-red-500/10 uppercase tracking-widest text-[9px] font-black transition-all border border-red-500/10">
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout Terminal</span>
          </button>
        </div>
      </aside>

      {/* MASTER ADMIN MODAL - FULL FORM RESTORED */}
      {showAdminModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center px-4 bg-black/98 backdrop-blur-3xl overflow-y-auto py-10">
           <div className="premium-card w-full max-w-4xl rounded-[3rem] overflow-hidden border-gold/30 shadow-[0_0_100px_rgba(212,175,55,0.1)] animate-in zoom-in-95 duration-300">
              <div className="p-8 border-b border-gold/10 flex flex-col items-center bg-premiumDark/50 text-center relative">
                 <button onClick={() => setShowAdminModal(false)} className="absolute top-8 right-8 text-gold/50 hover:text-gold transition-all"><i className="fas fa-times text-xl"></i></button>
                 <h2 className="text-2xl font-serif font-bold gold-text uppercase tracking-widest">Master Admin Terminal</h2>
                 
                 <div className="flex bg-premiumBlack rounded-2xl p-1.5 border border-gold/10 mt-8 overflow-x-auto max-w-full no-scrollbar">
                    {[
                      { id: 'WORKER_RATES', label: 'Worker Rates' },
                      { id: 'VIP_RATES', label: 'VIP Dresses' },
                      { id: 'MATERIALS', label: 'Materials' },
                      { id: 'COMMISSIONS', label: 'Hierarchy' }
                    ].map(tab => (
                      <button key={tab.id} onClick={() => setAdminTab(tab.id as any)} className={`px-6 py-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${adminTab === tab.id ? 'bg-gold text-premiumBlack shadow-lg' : 'text-gray-500'}`}>
                        {tab.label}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="p-10 max-h-[55vh] overflow-y-auto custom-scrollbar">
                 {adminTab === 'WORKER_RATES' && (
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      <div className="space-y-2">
                        <label className="text-[8px] text-gray-500 font-black uppercase tracking-widest ml-1">Showroom Return (₹)</label>
                        <input type="number" className="w-full bg-premiumBlack border border-gold/20 rounded-xl p-4 text-white text-xs font-bold outline-none focus:border-gold" value={settings.showroom_payout} onChange={e => setSettings({...settings, showroom_payout: parseFloat(e.target.value) || 0})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[8px] text-gray-500 font-black uppercase tracking-widest ml-1">Meas. New (₹)</label>
                        <input type="number" className="w-full bg-premiumBlack border border-gold/20 rounded-xl p-4 text-white text-xs font-bold outline-none focus:border-gold" value={settings.measurement_new} onChange={e => setSettings({...settings, measurement_new: parseFloat(e.target.value) || 0})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[8px] text-gray-500 font-black uppercase tracking-widest ml-1">Meas. Old (₹)</label>
                        <input type="number" className="w-full bg-premiumBlack border border-gold/20 rounded-xl p-4 text-white text-xs font-bold outline-none focus:border-gold" value={settings.measurement_old} onChange={e => setSettings({...settings, measurement_old: parseFloat(e.target.value) || 0})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[8px] text-gray-500 font-black uppercase tracking-widest ml-1">Cutting (₹)</label>
                        <input type="number" className="w-full bg-premiumBlack border border-gold/20 rounded-xl p-4 text-white text-xs font-bold outline-none focus:border-gold" value={settings.cutting_rate} onChange={e => setSettings({...settings, cutting_rate: parseFloat(e.target.value) || 0})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[8px] text-gray-500 font-black uppercase tracking-widest ml-1">Stitch Shirt (₹)</label>
                        <input type="number" className="w-full bg-premiumBlack border border-gold/20 rounded-xl p-4 text-white text-xs font-bold outline-none focus:border-gold" value={settings.stitching_shirt} onChange={e => setSettings({...settings, stitching_shirt: parseFloat(e.target.value) || 0})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[8px] text-gray-500 font-black uppercase tracking-widest ml-1">Stitch Pant (₹)</label>
                        <input type="number" className="w-full bg-premiumBlack border border-gold/20 rounded-xl p-4 text-white text-xs font-bold outline-none focus:border-gold" value={settings.stitching_pant} onChange={e => setSettings({...settings, stitching_pant: parseFloat(e.target.value) || 0})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[8px] text-gray-500 font-black uppercase tracking-widest ml-1">Pressing (₹)</label>
                        <input type="number" className="w-full bg-premiumBlack border border-gold/20 rounded-xl p-4 text-white text-xs font-bold outline-none focus:border-gold" value={settings.press_rate} onChange={e => setSettings({...settings, press_rate: parseFloat(e.target.value) || 0})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[8px] text-gray-500 font-black uppercase tracking-widest ml-1">Delivery (₹)</label>
                        <input type="number" className="w-full bg-premiumBlack border border-gold/20 rounded-xl p-4 text-white text-xs font-bold outline-none focus:border-gold" value={settings.delivery_payout} onChange={e => setSettings({...settings, delivery_payout: parseFloat(e.target.value) || 0})} />
                      </div>
                   </div>
                 )}

                 {adminTab === 'VIP_RATES' && (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        { k: 'royal_classic_rate', l: 'Royal Classic Suit' },
                        { k: 'urban_elite_rate', l: 'Urban Elite Set' },
                        { k: 'executive_line_rate', l: 'Executive Line' },
                        { k: 'festive_premium_rate', l: 'Festive Premium' },
                        { k: 'trendy_party_rate', l: 'Trendy Party Fit' },
                        { k: 'imperial_ceremony_rate', l: 'Imperial Ceremony' },
                        { k: 'signature_luxury_rate', l: 'Signature Luxury' },
                        { k: 'lords_special_rate', l: 'Lords Special Edition' }
                      ].map(item => (
                        <div key={item.k} className="bg-premiumBlack/40 p-6 rounded-2xl border border-gold/5 space-y-3">
                           <label className="text-[9px] text-gold font-black uppercase tracking-widest">{item.l}</label>
                           <input type="number" className="w-full bg-premiumBlack border border-gold/10 rounded-xl p-4 text-white font-mono font-bold" value={(settings as any)[item.k]} onChange={e => setSettings({...settings, [item.k]: parseFloat(e.target.value) || 0})} />
                        </div>
                      ))}
                   </div>
                 )}

                 {adminTab === 'MATERIALS' && (
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[
                        { k: 'thread_cost', l: 'Thread Unit' },
                        { k: 'canvas_cost', l: 'Canvas (mtr)' },
                        { k: 'zip_cost', l: 'Zip (unit)' },
                        { k: 'button_patti_cost', l: 'Button Patti' },
                        { k: 'hook_cost', l: 'Hook (box)' },
                        { k: 'belt_roll_cost', l: 'Belt Roll' }
                      ].map(item => (
                        <div key={item.k} className="space-y-2">
                           <label className="text-[8px] text-gray-500 font-black uppercase tracking-widest ml-1">{item.l} (₹)</label>
                           <input type="number" className="w-full bg-premiumBlack border border-gold/20 rounded-xl p-4 text-white text-xs font-bold outline-none focus:border-gold" value={(settings as any)[item.k]} onChange={e => setSettings({...settings, [item.k]: parseFloat(e.target.value) || 0})} />
                        </div>
                      ))}
                   </div>
                 )}

                 {adminTab === 'COMMISSIONS' && (
                    <div className="space-y-10">
                       <div className="grid grid-cols-3 gap-6">
                          <div className="bg-gold/5 p-6 rounded-3xl border border-gold/20 text-center space-y-2">
                             <p className="text-[8px] text-gray-500 uppercase font-black">Company Cut %</p>
                             <input type="number" className="w-full bg-transparent text-center text-gold font-black text-2xl outline-none" value={settings.company_cut_pct} onChange={e => setSettings({...settings, company_cut_pct: parseFloat(e.target.value) || 0})} />
                          </div>
                          <div className="bg-premiumBlack p-6 rounded-3xl border border-gold/10 text-center space-y-2">
                             <p className="text-[8px] text-gray-500 uppercase font-black">Upline Share %</p>
                             <input type="number" className="w-full bg-transparent text-center text-white font-black text-2xl outline-none" value={settings.upline_share_pct} onChange={e => setSettings({...settings, upline_share_pct: parseFloat(e.target.value) || 0})} />
                          </div>
                          <div className="bg-premiumBlack p-6 rounded-3xl border border-gold/10 text-center space-y-2">
                             <p className="text-[8px] text-gray-500 uppercase font-black">Downline Share %</p>
                             <input type="number" className="w-full bg-transparent text-center text-white font-black text-2xl outline-none" value={settings.downline_share_pct} onChange={e => setSettings({...settings, downline_share_pct: parseFloat(e.target.value) || 0})} />
                          </div>
                       </div>
                       <div className="p-8 rounded-[2rem] bg-premiumDark/50 border border-gold/5 text-center">
                          <i className="fas fa-info-circle text-gold mb-3"></i>
                          <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest leading-relaxed">System automatically distributes profit across 10 levels of hierarchy based on these master percentages. Changes apply to all new orders immediately.</p>
                       </div>
                    </div>
                 )}
              </div>

              <div className="p-10 border-t border-gold/10 bg-premiumDark/50">
                 <button onClick={saveAdminSettings} className="w-full gold-gradient text-premiumBlack font-black py-6 rounded-[2rem] uppercase text-[10px] tracking-[0.4em] shadow-2xl active:scale-95 transition-all">Synchronize Master Protocol</button>
              </div>
           </div>
        </div>
      )}

      {/* IDENTITY PROFILE MODAL */}
      {showProfileModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center px-4 bg-black/98 backdrop-blur-3xl overflow-y-auto py-10">
           <div className="premium-card w-full max-w-xl rounded-[3.5rem] overflow-hidden border-gold/40 shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="p-10 border-b border-gold/10 flex flex-col items-center bg-premiumDark/50 text-center relative">
                 <button onClick={() => setShowProfileModal(false)} className="absolute top-8 right-8 text-gold/50 hover:text-gold"><i className="fas fa-times text-xl"></i></button>
                 <div className="relative group cursor-pointer mb-6" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-24 h-24 rounded-full bg-premiumBlack border-2 border-gold/30 flex items-center justify-center overflow-hidden shadow-2xl transition-all group-hover:border-gold">
                       {editProfile.image ? <img src={editProfile.image} alt="Profile" className="w-full h-full object-cover" /> : <span className="text-4xl font-serif font-bold gold-text">{editProfile.name.charAt(0)}</span>}
                    </div>
                    <div className="absolute bottom-0 right-0 bg-gold text-premiumBlack w-8 h-8 rounded-full flex items-center justify-center text-[10px] border-2 border-premiumBlack shadow-lg"><i className="fas fa-camera"></i></div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => setEditProfile(p => ({ ...p, image: reader.result as string }));
                        reader.readAsDataURL(file);
                      }
                    }} />
                 </div>
                 <h2 className="text-xl font-serif font-bold gold-text uppercase tracking-widest">Profile Identity</h2>
                 <p className="text-[8px] text-gray-500 font-black uppercase mt-1 tracking-widest">Encrypted Worker Profile</p>
              </div>

              <div className="p-10 space-y-6">
                 <div className="space-y-1">
                    <label className="text-[8px] text-gray-500 font-black uppercase tracking-widest ml-1">Legal Name</label>
                    <input type="text" value={editProfile.name} onChange={e => setEditProfile({...editProfile, name: e.target.value})} className="w-full bg-premiumBlack border border-gold/20 rounded-xl px-5 py-4 text-white text-xs font-bold focus:border-gold outline-none" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-[8px] text-gray-500 font-black uppercase tracking-widest ml-1">Contact No</label>
                       <input type="tel" value={editProfile.mobile || ''} onChange={e => setEditProfile({...editProfile, mobile: e.target.value})} className="w-full bg-premiumBlack border border-gold/20 rounded-xl px-5 py-4 text-white text-xs font-bold focus:border-gold outline-none" placeholder="+91 XXXX" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[8px] text-gray-500 font-black uppercase tracking-widest ml-1">Secure Email</label>
                       <input type="email" value={editProfile.email || ''} onChange={e => setEditProfile({...editProfile, email: e.target.value})} className="w-full bg-premiumBlack border border-gold/20 rounded-xl px-5 py-4 text-white text-xs font-bold focus:border-gold outline-none" placeholder="worker@gmail.com" />
                    </div>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[8px] text-gray-500 font-black uppercase tracking-widest ml-1">Residential Address</label>
                    <textarea rows={2} value={editProfile.address || ''} onChange={e => setEditProfile({...editProfile, address: e.target.value})} className="w-full bg-premiumBlack border border-gold/20 rounded-xl px-5 py-4 text-white text-xs font-bold focus:border-gold outline-none resize-none" placeholder="Location Details..." />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[8px] text-gray-500 font-black uppercase tracking-widest ml-1">Production Role (Locked)</label>
                    <div className="bg-premiumBlack border border-gold/5 rounded-xl px-5 py-4 flex justify-between items-center opacity-50">
                       <span className="text-gold font-bold text-[10px] uppercase tracking-widest">{user.role.replace(/_/g, ' ')}</span>
                       <i className="fas fa-lock text-[10px]"></i>
                    </div>
                 </div>
                 <div className="pt-4 flex gap-4">
                    <button onClick={() => setShowProfileModal(false)} className="flex-1 py-4 text-[9px] font-black uppercase text-gray-600">Cancel</button>
                    <button onClick={handleUpdateProfile} className="flex-[2] gold-gradient text-premiumBlack font-black py-4 rounded-2xl uppercase text-[9px] tracking-widest shadow-xl active:scale-95 transition-all">Update Identity</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
