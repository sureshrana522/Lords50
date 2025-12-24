
import React, { useState } from 'react';
import { UserRole } from '../types';
import { Link } from 'react-router-dom';

interface LoginProps {
  onLogin: (user: { id: string; role: UserRole; name: string }) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.ADMIN);
  const [password, setPassword] = useState('');

  const handleRoleLogin = (e?: React.FormEvent, autoRole?: UserRole) => {
    if (e) e.preventDefault();
    const roleToLogin = autoRole || selectedRole;
    
    onLogin({
      id: 'usr_' + Math.random().toString(36).substr(2, 9),
      role: roleToLogin,
      name: `Master ${roleToLogin.replace('_', ' ')}`
    });
  };

  const demoRoles = [
    { role: UserRole.ADMIN, icon: 'fa-crown', label: 'Admin (Main Control)' },
    { role: UserRole.SHOWROOM, icon: 'fa-store', label: 'Showroom (Booking)' },
    { role: UserRole.MEASUREMENT, icon: 'fa-ruler', label: 'Measurement' },
    { role: UserRole.CUTTING, icon: 'fa-cut', label: 'Cutting Master' },
    { role: UserRole.SHIRT_MAKER, icon: 'fa-tshirt', label: 'Shirt Maker' },
    { role: UserRole.PANT_MAKER, icon: 'fa-socks', label: 'Pant Maker' },
    { role: UserRole.KAJ_BUTTON, icon: 'fa-dot-circle', label: 'Kaj Button' },
    { role: UserRole.PRESS, icon: 'fa-wind', label: 'Press/Parsh' },
    { role: UserRole.DELIVERY, icon: 'fa-truck', label: 'Delivery Boy' },
    { role: UserRole.MANAGER, icon: 'fa-user-tie', label: 'Manager' },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center p-4 lg:p-12 gap-12 bg-premiumBlack">
      <div className="max-w-md w-full animate-in slide-in-from-left-8 duration-700">
        <div className="premium-card rounded-[2.5rem] p-8 border-gold/20 bg-gold/5 shadow-[0_0_50px_rgba(212,175,55,0.1)]">
          <h2 className="font-serif text-2xl gold-text mb-6 flex items-center gap-4 uppercase tracking-widest">
            <i className="fas fa-id-badge"></i>
            Quick Access Demo
          </h2>
          <p className="text-gray-500 text-[10px] mb-8 tracking-[0.2em] font-black uppercase">Click to Login as Worker</p>
          
          <div className="flex flex-col space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {demoRoles.map((demo) => (
              <button
                key={demo.role}
                onClick={() => handleRoleLogin(undefined, demo.role)}
                className="flex items-center space-x-5 bg-premiumBlack/60 border border-gold/10 hover:border-gold p-4 rounded-2xl transition-all group hover:bg-gold/5"
              >
                <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-premiumBlack transition-all shadow-inner">
                  <i className={`fas ${demo.icon} text-sm`}></i>
                </div>
                <div className="text-left">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-gold">{demo.label}</span>
                  <p className="text-[8px] text-gray-600 font-bold uppercase tracking-tighter">Enter Department Floor</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-md w-full premium-card rounded-[3rem] p-10 md:p-14 shadow-2xl relative overflow-hidden animate-in slide-in-from-right-8 duration-700 border-gold/30">
        <div className="text-center mb-12 relative z-10">
          <h1 className="font-serif text-5xl gold-text font-bold mb-3 tracking-widest">LORD'S</h1>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em]">Internal Security Login</p>
        </div>

        <form onSubmit={handleRoleLogin} className="space-y-8 relative z-10">
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase mb-3 tracking-widest ml-1">Identity Selection</label>
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
