
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';

interface TeamMember extends UserProfile {
    level: number;
    commission: number;
}

const ReferralTeam: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [copied, setCopied] = useState(false);
  const [levelsData, setLevelsData] = useState<any[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);

  useEffect(() => {
    const savedUser = localStorage.getItem('lords_user');
    const usersDB: UserProfile[] = JSON.parse(localStorage.getItem('lords_users_db') || '[]');
    
    if (savedUser) {
        const currentUser = JSON.parse(savedUser);
        setUser(currentUser);

        // --- HIERARCHY BUILDER ---
        // Find everyone under the current user, recursively
        const myTeam: TeamMember[] = [];
        const levelCounts = new Array(10).fill(0);
        let myTotalIncome = 0;

        const findDirects = (managerCode: string, currentLevel: number) => {
            if (currentLevel > 10) return; // Cap at 10 levels

            const directs = usersDB.filter(u => u.referredBy === managerCode);
            
            directs.forEach(direct => {
                // Calculate mock commission per person based on level
                // Level 1: ₹500, Level 2: ₹300, Level 3: ₹100, etc.
                const commission = Math.max(0, 600 - (currentLevel * 100)); 
                
                myTeam.push({ ...direct, level: currentLevel, commission });
                levelCounts[currentLevel - 1]++;
                myTotalIncome += commission;

                // Recursion
                findDirects(direct.referralCode || '', currentLevel + 1);
            });
        };

        if (currentUser.referralCode) {
            findDirects(currentUser.referralCode, 1);
        }

        setTeam(myTeam);
        setTotalIncome(myTotalIncome);

        // Format Levels for Display
        const formattedLevels = levelCounts.map((count, idx) => ({
            level: idx + 1,
            count: count,
            label: idx === 0 ? 'Direct Team' : idx === 1 ? 'Super Network' : `Level ${idx + 1} Downline`,
            pct: (1.5 + (idx * 0.5)).toFixed(1) // Just visual
        }));
        setLevelsData(formattedLevels);
    }
  }, []);

  const copyLink = () => {
    const link = `https://lordsbespoke.com/join?ref=${user?.referralCode || 'MASTER'}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user) return null;

  return (
    <div className="space-y-10 pb-20 max-w-6xl mx-auto px-4 animate-in fade-in duration-700">
      <div className="text-center pt-8 space-y-2">
        <h1 className="text-4xl font-serif font-bold gold-text uppercase tracking-widest">Growth Network</h1>
        <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em]">10-Level Realtime Hierarchy</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 premium-card p-8 rounded-[3rem] border-gold/20 bg-gold/5 flex flex-col md:flex-row items-center gap-8">
           <div className="flex-1 space-y-4 text-center md:text-left">
              <h2 className="text-xl font-serif font-bold gold-text">Invite New Masters</h2>
              <p className="text-gray-400 text-xs leading-relaxed">Share your unique credentials to build your 10-level empire and unlock passive commissions on every stitch.</p>
              <div className="flex items-center space-x-2 bg-premiumBlack p-2 rounded-2xl border border-gold/10">
                 <code className="flex-1 px-4 font-mono text-gold text-sm font-black">{user.referralCode}</code>
                 <button onClick={copyLink} className="gold-gradient text-premiumBlack px-6 py-3 rounded-xl font-black text-[10px] uppercase">
                    {copied ? 'Copied!' : 'Copy Link'}
                 </button>
              </div>
           </div>
           <div className="w-32 h-32 rounded-full border-4 border-gold/20 flex items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 border-t-4 border-gold animate-spin"></div>
              <div className="text-center z-10">
                 <p className="text-[8px] text-gray-500 uppercase font-black">Total Network</p>
                 <p className="text-3xl font-black text-white group-hover:scale-110 transition-transform">{team.length}</p>
              </div>
           </div>
        </div>

        <div className="premium-card p-8 rounded-[3rem] border-gold/10 flex flex-col justify-center text-center space-y-2">
           <p className="text-[10px] text-gray-500 uppercase font-black">Potential Referral Income</p>
           <h3 className="text-4xl font-black text-green-500">₹{totalIncome.toLocaleString()}</h3>
           <p className="text-[8px] text-gray-500 font-bold uppercase">Based on current team size</p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest ml-4">Team Level Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
           {levelsData.map((lvl) => (
             <div key={lvl.level} className={`premium-card p-5 rounded-3xl border-gold/5 transition-all bg-premiumDark/30 ${lvl.count > 0 ? 'border-gold/30 bg-gold/5' : 'opacity-50'}`}>
                <div className="flex justify-between items-start mb-4">
                   <span className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center text-gold font-bold text-xs border border-gold/20">L{lvl.level}</span>
                </div>
                <p className="text-2xl font-black text-white">{lvl.count}</p>
                <p className="text-[9px] text-gray-600 font-black uppercase mt-1">{lvl.label}</p>
             </div>
           ))}
        </div>
      </div>

      {/* TEAM TREE LIST - "Kis ki I'd kiske niche lagi hai" */}
      <div className="premium-card p-8 rounded-[3rem] border-gold/10">
         <div className="flex items-center gap-3 mb-8">
            <i className="fas fa-users text-gold text-2xl"></i>
            <div>
               <h3 className="text-xl font-serif font-bold text-white uppercase tracking-widest">My Downline Structure</h3>
               <p className="text-[10px] text-gray-500 font-black uppercase">See exactly who is in your team</p>
            </div>
         </div>

         <div className="space-y-2">
            {team.length > 0 ? team.sort((a,b) => a.level - b.level).map((member, idx) => (
               <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-premiumBlack border border-gold/5 hover:border-gold/30 transition-all">
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white font-bold text-sm border border-gold/10">
                     L{member.level}
                  </div>
                  <div className="flex-1">
                     <h4 className="text-sm font-bold text-white">{member.name}</h4>
                     <p className="text-[9px] text-gold font-black uppercase tracking-widest">{member.role.replace('_', ' ')}</p>
                  </div>
                  <div className="text-right hidden md:block">
                     <p className="text-[9px] text-gray-500 uppercase font-black">Referred By</p>
                     <p className="text-xs font-bold text-gray-300">{member.referredBy}</p>
                  </div>
                  <div className="text-right">
                      <p className="text-[9px] text-gray-500 uppercase font-black">Est. Comm.</p>
                      <p className="text-xs font-bold text-green-500">+ ₹{member.commission}</p>
                  </div>
               </div>
            )) : (
               <div className="text-center py-10 opacity-30">
                  <i className="fas fa-user-slash text-4xl mb-3"></i>
                  <p className="text-xs uppercase font-black">No team members found under you.</p>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default ReferralTeam;
