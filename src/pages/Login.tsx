
import React, { useState, useEffect } from 'react';
import { UserRole, UserProfile } from '../types';
import { Link } from 'react-router-dom';

interface LoginProps {
  onLogin: (user: UserProfile) => void;
}

// COMPLETE LINEAR DEMO HIERARCHY FOR TESTING 10-LEVEL DISTRIBUTION
// Structure: Admin -> Showroom -> Measurement -> Cutting -> Shirt -> Pant -> Kaj -> Press -> Delivery
const DEMO_HIERARCHY = [
  { role: UserRole.ADMIN, name: "Master Admin", code: "L-ADMIN", ref: "" },
  { role: UserRole.SHOWROOM, name: "Showroom Manager", code: "L-SHOW", ref: "L-ADMIN" }, // Level 1
  { role: UserRole.BOOKING_MASTER, name: "Lords Booking Master", code: "L-BOOK", ref: "L-SHOW" }, // Alternative Entry
  { role: UserRole.MEASUREMENT, name: "Measurement Master", code: "L-MEAS", ref: "L-SHOW" }, // Level 2
  { role: UserRole.CUTTING, name: "Cutting Master", code: "L-CUT", ref: "L-MEAS" }, // Level 3
  { role: UserRole.SHIRT_MAKER, name: "Shirt Karigar", code: "L-SHIRT", ref: "L-CUT" }, // Level 4
  { role: UserRole.PANT_MAKER, name: "Pant Karigar", code: "L-PANT", ref: "L-SHIRT" }, // Level 5 (Linear for demo depth)
  { role: UserRole.KAJ_BUTTON, name: "Kaj Button Wala", code: "L-KAJ", ref: "L-PANT" }, // Level 6
  { role: UserRole.PRESS, name: "Press Wala", code: "L-PRESS", ref: "L-KAJ" }, // Level 7
  { role: UserRole.DELIVERY, name: "Delivery Boy", code: "L-DEL", ref: "L-PRESS" }, // Level 8

  // Extras
  { role: UserRole.MATERIAL, name: "Material Store", code: "L-MAT", ref: "L-ADMIN" },
  { role: UserRole.DIRECTOR, name: "Director Sahab", code: "L-DIR", ref: "L-ADMIN" },
  { role: UserRole.MANAGER, name: "Gen Manager", code: "L-MGR", ref: "L-DIR" },
];

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.ADMIN);
  const [password, setPassword] = useState('');

  // Seed the database with hierarchy on load
  useEffect(() => {
    // We force update the mock DB to ensure the new linear hierarchy exists
    const users: UserProfile[] = DEMO_HIERARCHY.map(d => ({
        id: `usr_${d.code}`,
        name: d.name,
        role: d.role,
        referralCode: d.code,
        referredBy: d.ref,
        joinedAt: new Date().toISOString()
    }));
    localStorage.setItem('lords_users_db', JSON.stringify(users));
  }, []);

  const handleRoleLogin = (e?: React.FormEvent, autoRole?: UserRole) => {
    if (e) e.preventDefault();
    const roleToLogin = autoRole || selectedRole;
    
    const usersDB: UserProfile[] = JSON.parse(localStorage.getItem('lords_users_db') || '[]');
    let user = usersDB.find(u => u.role === roleToLogin);

    // Fallback if specific demo user missing
    if (!user) {
        user = {
            id: 'usr_' + Math.random().toString(36).substr(2, 9),
            role: roleToLogin,
            name: `Master ${roleToLogin.replace('_', ' ')}`,
            referralCode: `LT-${Math.floor(1000 + Math.random() * 9000)}`,
            referredBy: "L-ADMIN",
            joinedAt: new Date().toISOString()
        };
    }

    onLogin(user);
  };

  // EXTENDED DEMO LIST - ALL PANELS INCLUDED
  const demoRoles = [
    // Top Management
    { role: UserRole.ADMIN, icon: 'fa-crown', label: 'Admin (Top)' },
    
    // Showroom & Front
    { role: UserRole.SHOWROOM, icon: 'fa-store', label: 'Showroom' },
    { role: UserRole.BOOKING_MASTER, icon: 'fa-clipboard-check', label: 'Booking Master' },
    { role: UserRole.MEASUREMENT, icon: 'fa-ruler-combined', label: 'Measurement' },
    
    // Production
    { role: UserRole.CUTTING, icon: 'fa-cut', label: 'Cutting' },
    { role: UserRole.SHIRT_MAKER, icon: 'fa-tshirt', label: 'Shirt Maker' },
    { role: UserRole.PANT_MAKER, icon: 'fa-user-ninja', label: 'Pant Maker' },
    { role: UserRole.KAJ_BUTTON, icon: 'fa-dot-circle', label: 'Kaj Button' },
    { role: UserRole.PRESS, icon: 'fa-iron', label: 'Press/Iron' },
    
    // Logistics
    { role: UserRole.DELIVERY, icon: 'fa-truck', label: 'Delivery' },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center p-4 lg:p-12 gap-12 bg-premiumBlack">
      <div className="max-w-md w-full animate-in slide-in-from-left-8 duration-700">
        <div className="premium-card rounded-[2.5rem] p-8 border-gold/20 bg-gold/5 shadow-[0_0_50px_rgba(212,175,55,0.1)] flex flex-col h-[85vh]">
          <div className="flex-shrink-0">
             <h2 className="font-serif text-2xl gold-text mb-2 flex items-center gap-4 uppercase tracking-widest">
                <i className="fas fa-sitemap"></i>
                Quick Access
             </h2>
             <p className="text-gray-500 text-[9px] mb-6 tracking-[0.2em] font-black uppercase">
                Select any ID to test Wallet & Hierarchy
             </p>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
            {demoRoles.map((demo) => (
              <button
                key={demo.role}
                onClick={() => handleRoleLogin(undefined, demo.role)}
                className="w-full flex items-center space-x-4 bg-premiumBlack/80 border border-gold/10 hover:border-gold p-3 rounded-xl transition-all group hover:bg-gold/10"
              >
                <div className="w-8 h-8 rounded-lg bg-gold/5 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-premiumBlack transition-all shadow-inner">
                  <i className={`fas ${demo.icon} text-xs`}></i>
                </div>
                <div className="text-left">
                  <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest group-hover:text-white">{demo.label}</span>
                  <div className="flex items-center gap-1">
                      <div className="w-1 h-1 rounded-full bg-green-500"></div>
                      <p className="text-[7px] text-gray-500 font-bold uppercase tracking-tighter">Active Demo</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-md w-full premium-card rounded-[3rem] p-10 md:p-14 shadow-2xl relative overflow-hidden animate-in slide-in-from-right-8 duration-700 border-gold/30">
        <div className="text-center mb-12 relative z-10">
          <h1 className="font-serif text-5xl gold-text font-bold mb-3 tracking-widest">LORD'S</h1>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em]">Secure Hierarchy System</p>
        </div>

        <form onSubmit={handleRoleLogin} className="space-y-8 relative z-10">
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase mb-3 tracking-widest ml-1">Manual Role Selection</label>
            <select 
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              className="w-full bg-premiumBlack border border-gold/30 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-gold transition-all appearance-none cursor-pointer font-bold tracking-widest text-xs"
            >
              {Object.keys(UserRole).filter(k => k !== 'CUSTOMER').map(role => (
                <option key={role} value={role}>{role.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase mb-3 tracking-widest ml-1">Access Pin Code</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••"
              className="w-full bg-premiumBlack border border-gold/30 rounded-2xl px-5 py-4 text-white placeholder:text-gray-800 focus:outline-none focus:border-gold transition-all text-center text-2xl tracking-[1em]"
            />
          </div>

          <button 
            type="submit"
            className="w-full gold-gradient text-premiumBlack font-black py-5 rounded-2xl shadow-xl hover:shadow-gold/40 transition-all duration-300 transform hover:-translate-y-1 uppercase tracking-[0.3em] text-xs"
          >
            Authenticate Access
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
