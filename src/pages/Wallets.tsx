
import React, { useState, useEffect, useRef } from 'react';
import { UserRole, WithdrawalRequest, AddMoneyRequest } from '../types';

const Wallets: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [balances, setBalances] = useState<any>({});
  
  // WITHDRAWAL STATES
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawStep, setWithdrawStep] = useState<'FORM' | 'CONFIRM' | 'PROCESSING' | 'SUCCESS'>('FORM');
  const [withdrawData, setWithdrawData] = useState({
      amount: '',
      email: '',
      tpin: '',
      method: 'UPI',
      upiId: '',
      qrCode: ''
  });
  const qrInputRef = useRef<HTMLInputElement>(null);

  // ADD MONEY STATES
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [addMoneyStep, setAddMoneyStep] = useState<'FORM' | 'PROCESSING' | 'SUCCESS'>('FORM');
  const [addMoneyData, setAddMoneyData] = useState({
      amount: '200',
      utr: ''
  });
  const [companyDetails, setCompanyDetails] = useState({ upiId: 'lords@upi', qrCode: '' });

  const loadWallets = () => {
    // Get current user details
    const savedUser = JSON.parse(localStorage.getItem('lords_user') || '{}');
    setUser(savedUser);
    const currentUserRole = savedUser.role;
    if(savedUser.email && !withdrawData.email) setWithdrawData(prev => ({...prev, email: savedUser.email}));

    // Load ALL Role Wallets
    const roleWallets = JSON.parse(localStorage.getItem('lords_wallets_by_role') || '{}');
    
    // Select ONLY the wallet for the current role
    const myWallet = roleWallets[currentUserRole] || { task_earnings: 0, total: 0, upline_income: 0, downline_income: 0, referral_earnings: 0, hierarchy_earnings: 0 };
    
    setBalances(myWallet);

    // Load Company Payment Details
    const savedComp = localStorage.getItem('lords_company_payment');
    if(savedComp) setCompanyDetails(JSON.parse(savedComp));
  };

  useEffect(() => {
    loadWallets();
    const interval = setInterval(loadWallets, 2000);
    return () => clearInterval(interval);
  }, []);

  const formatAmount = (amount: number) => {
    return (amount || 0).toLocaleString('en-IN', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 6 
    });
  };

  // --- WITHDRAWAL HANDLERS ---
  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawData.amount);
    if(!amount || amount < 10) { alert("Minimum withdrawal amount is ₹10"); return; }
    if(amount > (balances.total || 0)) { alert(`Insufficient Balance! Available: ₹${formatAmount(balances.total)}`); return; }
    if(!withdrawData.tpin) { alert("T-PIN required"); return; }
    setWithdrawStep('CONFIRM');
  };

  const confirmWithdrawal = () => {
    const roleWallets = JSON.parse(localStorage.getItem('lords_wallets_by_role') || '{}');
    const myWallet = roleWallets[user.role];
    const amount = parseFloat(withdrawData.amount);

    if (!myWallet || myWallet.total < amount) {
        alert("Balance changed! Insufficient funds.");
        setWithdrawStep('FORM');
        return;
    }

    setWithdrawStep('PROCESSING');
    setTimeout(() => {
        // Deduct
        myWallet.total -= amount;
        myWallet.total_withdrawal = (myWallet.total_withdrawal || 0) + amount;
        localStorage.setItem('lords_wallets_by_role', JSON.stringify(roleWallets));
        
        // Create Request
        const newRequest: WithdrawalRequest = {
            id: 'WTH-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            userId: user.id,
            userName: user.name,
            userRole: user.role,
            amount: amount,
            email: withdrawData.email,
            tpin: withdrawData.tpin,
            method: withdrawData.method as 'UPI' | 'QR_CODE',
            upiId: withdrawData.upiId,
            qrCodeImage: withdrawData.qrCode,
            status: 'PENDING',
            requestDate: new Date().toISOString()
        };
        const existing = JSON.parse(localStorage.getItem('lords_withdrawal_requests') || '[]');
        localStorage.setItem('lords_withdrawal_requests', JSON.stringify([newRequest, ...existing]));
        window.dispatchEvent(new Event('storage'));
        
        setWithdrawStep('SUCCESS');
        setTimeout(() => { setShowWithdrawModal(false); setWithdrawStep('FORM'); setWithdrawData({...withdrawData, amount: '', tpin: ''}); }, 3000);
    }, 3000);
  };

  // --- ADD MONEY HANDLERS ---
  const handleAddMoneySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!addMoneyData.utr || addMoneyData.utr.length < 4) {
        alert("Please enter a valid 12-digit UTR/Transaction ID");
        return;
    }
    setAddMoneyStep('PROCESSING');

    // 3 Second Green Line Animation
    setTimeout(() => {
        const newRequest: AddMoneyRequest = {
            id: 'ADD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            userId: user.id,
            userName: user.name,
            userRole: user.role,
            amount: parseFloat(addMoneyData.amount),
            utr: addMoneyData.utr,
            status: 'PENDING',
            requestDate: new Date().toISOString()
        };
        
        const existing = JSON.parse(localStorage.getItem('lords_add_money_requests') || '[]');
        localStorage.setItem('lords_add_money_requests', JSON.stringify([newRequest, ...existing]));
        window.dispatchEvent(new Event('storage'));

        setAddMoneyStep('SUCCESS');
        setTimeout(() => {
            setShowAddMoneyModal(false);
            setAddMoneyStep('FORM');
            setAddMoneyData({ amount: '200', utr: '' });
        }, 2000);
    }, 3000);
  };

  return (
    <div className="space-y-10 pb-20 px-4 max-w-6xl mx-auto animate-in fade-in duration-700">
      
      {/* HEADER & ACTION BUTTONS */}
      <div className="pt-8 flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="space-y-2">
           <h1 className="text-4xl font-serif font-bold gold-text tracking-widest uppercase">Digital Ledger</h1>
           <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em]">Encrypted Financial Custody</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
           <button 
             onClick={() => setShowWithdrawModal(true)}
             className="flex-1 md:flex-none bg-red-600/10 border border-red-500/50 text-red-500 hover:bg-red-600 hover:text-white px-8 py-4 rounded-2xl uppercase font-black text-[10px] tracking-widest transition-all shadow-[0_0_20px_rgba(220,38,38,0.2)]"
           >
              <i className="fas fa-arrow-up mr-2"></i> Withdrawal
           </button>
           <button 
             onClick={() => setShowAddMoneyModal(true)}
             className="flex-1 md:flex-none bg-green-600/10 border border-green-500/50 text-green-500 hover:bg-green-600 hover:text-white px-8 py-4 rounded-2xl uppercase font-black text-[10px] tracking-widest transition-all shadow-[0_0_20px_rgba(34,197,94,0.2)]"
           >
              <i className="fas fa-plus-circle mr-2"></i> Add Money
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
         {/* Row 1: Main Earnings */}
         <div className="premium-card p-8 rounded-[2.5rem] border-gold/20 bg-gold/5 text-center">
            <p className="text-[9px] text-gray-500 uppercase font-black mb-1">Gross Balance</p>
            <h2 className="text-3xl font-mono font-black text-white">₹{formatAmount(balances.total)}</h2>
         </div>
         <div className="premium-card p-8 rounded-[2.5rem] border-gold/10 text-center">
            <p className="text-[9px] text-gray-500 uppercase font-black mb-1">Booking/Task Revenue</p>
            <h2 className="text-3xl font-mono font-black text-blue-500">₹{formatAmount(balances.task_earnings)}</h2>
            <p className="text-[7px] text-gray-600 mt-1 uppercase">Funds Added Here</p>
         </div>
         <div className="premium-card p-8 rounded-[2.5rem] border-gold/10 text-center bg-purple-500/5">
            <p className="text-[9px] text-gray-500 uppercase font-black mb-1">Direct Referral</p>
            <h2 className="text-3xl font-mono font-black text-purple-400">₹{formatAmount(balances.referral_earnings)}</h2>
         </div>

         {/* Row 2: Upline & Downline */}
         <div className="premium-card p-8 rounded-[2.5rem] border-gold/10 text-center bg-green-900/10">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-2 text-green-500">
                <i className="fas fa-arrow-up"></i>
            </div>
            <p className="text-[9px] text-gray-500 uppercase font-black mb-1">Upline Income</p>
            <h2 className="text-3xl font-mono font-black text-green-400">₹{formatAmount(balances.upline_income)}</h2>
            <p className="text-[7px] text-gray-600 font-bold uppercase mt-1">From Downline Work</p>
         </div>

         <div className="premium-card p-8 rounded-[2.5rem] border-gold/10 text-center bg-orange-900/10">
            <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-2 text-orange-500">
                <i className="fas fa-arrow-down"></i>
            </div>
            <p className="text-[9px] text-gray-500 uppercase font-black mb-1">Downline Income</p>
            <h2 className="text-3xl font-mono font-black text-orange-400">₹{formatAmount(balances.downline_income)}</h2>
            <p className="text-[7px] text-gray-600 font-bold uppercase mt-1">From Upline Support</p>
         </div>
         
         <div className="premium-card p-8 rounded-[2.5rem] border-gold/10 text-center">
            <p className="text-[9px] text-gray-500 uppercase font-black mb-1">Matrix Yield</p>
            <h2 className="text-3xl font-mono font-black text-gold">₹{formatAmount(balances.hierarchy_earnings)}</h2>
         </div>
      </div>

      <div className="premium-card rounded-[3rem] p-10 text-center border-gold/5 bg-premiumDark/30">
         <i className="fas fa-info-circle text-gold mb-4"></i>
         <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest leading-relaxed max-w-2xl mx-auto">
            Funds Distribution Protocol (Equal Split): <br/>
            1. <span className="text-white">10% Deduction</span> from Total Work Value.<br/>
            2. 85% goes Up → Divided equally across 10 Upline Levels.<br/>
            3. 15% goes Down → Divided equally across 10 Downline Levels.
         </p>
      </div>

      {/* --- ADD MONEY MODAL --- */}
      {showAddMoneyModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center px-4 bg-black/95 backdrop-blur-3xl p-4 animate-in fade-in duration-300">
            <div className="premium-card w-full max-w-md rounded-[2.5rem] overflow-hidden border-green-500/30 shadow-[0_0_50px_rgba(34,197,94,0.2)] bg-premiumDark">
                
                {/* PROCESSING */}
                {addMoneyStep === 'PROCESSING' && (
                   <div className="p-12 text-center flex flex-col items-center justify-center space-y-8 animate-in zoom-in-95 min-h-[400px]">
                      <div className="relative w-24 h-24 flex items-center justify-center">
                          <div className="absolute inset-0 rounded-full border-4 border-gray-800"></div>
                          <div className="absolute inset-0 rounded-full border-t-4 border-green-500 animate-spin"></div>
                          <i className="fas fa-satellite-dish text-green-500 text-2xl animate-pulse"></i>
                      </div>
                      <div className="w-full space-y-2">
                          <h2 className="text-xl font-serif font-bold text-white uppercase tracking-widest">Verifying Transaction</h2>
                          <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Confirming with Admin...</p>
                      </div>
                      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden relative">
                          <div className="h-full bg-green-500 shadow-[0_0_20px_#22c55e]" style={{ width: '100%', animation: 'fillProgress 3s linear forwards' }}></div>
                      </div>
                   </div>
                )}

                {/* SUCCESS */}
                {addMoneyStep === 'SUCCESS' && (
                    <div className="p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 mb-6 border border-green-500/50">
                            <i className="fas fa-check text-3xl"></i>
                        </div>
                        <h2 className="text-2xl font-serif font-bold text-green-500 uppercase">Request Sent</h2>
                        <p className="text-gray-400 text-xs mt-2">Admin will verify UTR and approve funds shortly.</p>
                    </div>
                )}

                {/* FORM */}
                {addMoneyStep === 'FORM' && (
                    <>
                    <div className="p-6 border-b border-green-500/20 bg-gradient-to-r from-green-900/20 to-transparent relative">
                        <h2 className="text-xl font-serif font-bold text-green-500 uppercase tracking-widest">Load Wallet</h2>
                        <button onClick={() => setShowAddMoneyModal(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white"><i className="fas fa-times text-lg"></i></button>
                    </div>
                    <form onSubmit={handleAddMoneySubmit} className="p-6 space-y-6">
                        {/* QR CODE SECTION */}
                        <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl">
                           {companyDetails.qrCode ? (
                               <img src={companyDetails.qrCode} alt="Company QR" className="w-32 h-32 object-cover" />
                           ) : (
                               <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=lords@upi&pn=LordsBespoke" alt="QR" className="w-32 h-32" />
                           )}
                           <p className="text-black font-bold text-xs mt-2">Lords Bespoke Ltd.</p>
                           <p className="text-gray-500 text-[10px]">UPI: {companyDetails.upiId}</p>
                        </div>

                        <div className="space-y-4">
                           <div className="space-y-1">
                              <label className="text-[8px] text-green-500 font-black uppercase tracking-widest ml-1">Amount (₹)</label>
                              <input type="number" value={addMoneyData.amount} onChange={e => setAddMoneyData({...addMoneyData, amount: e.target.value})} className="w-full bg-premiumBlack border border-green-500/30 rounded-xl px-4 py-3 text-white text-lg font-bold outline-none focus:border-green-500" required />
                           </div>
                           <div className="space-y-1">
                              <label className="text-[8px] text-gray-500 font-black uppercase tracking-widest ml-1">My ID</label>
                              <input type="text" value={user?.referralCode || ''} disabled className="w-full bg-premiumBlack border border-gray-800 rounded-xl px-4 py-3 text-gray-500 text-xs font-mono" />
                           </div>
                           <div className="space-y-1">
                              <label className="text-[8px] text-gray-500 font-black uppercase tracking-widest ml-1">UTR / Transaction Ref No.</label>
                              <input type="text" placeholder="Paste UTR Here (e.g. 3049...)" value={addMoneyData.utr} onChange={e => setAddMoneyData({...addMoneyData, utr: e.target.value})} className="w-full bg-premiumBlack border border-gold/20 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-gold" required />
                           </div>
                        </div>

                        <button type="submit" className="w-full py-4 rounded-xl bg-green-600 text-white font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-green-500 transition-all active:scale-95">
                           Confirm Payment
                        </button>
                    </form>
                    </>
                )}
            </div>
        </div>
      )}

      {/* --- WITHDRAWAL MODAL --- */}
      {showWithdrawModal && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center px-4 bg-black/95 backdrop-blur-3xl p-4 animate-in fade-in duration-300">
              <div className="premium-card w-full max-w-lg rounded-[2.5rem] overflow-hidden border-red-500/30 shadow-[0_0_50px_rgba(220,38,38,0.2)] bg-premiumDark">
                  
                  {/* PROCESSING VIEW */}
                  {withdrawStep === 'PROCESSING' && (
                      <div className="p-12 text-center flex flex-col items-center justify-center space-y-8 animate-in zoom-in-95 min-h-[400px]">
                           <div className="relative w-24 h-24 flex items-center justify-center">
                              <div className="absolute inset-0 rounded-full border-4 border-gray-800"></div>
                              <div className="absolute inset-0 rounded-full border-t-4 border-green-500 animate-spin"></div>
                           </div>
                           <div className="w-full space-y-2">
                              <h2 className="text-xl font-serif font-bold text-white uppercase tracking-widest">Processing</h2>
                           </div>
                           <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden relative">
                              <div className="h-full bg-green-500" style={{ width: '100%', animation: 'fillProgress 3s linear forwards' }}></div>
                           </div>
                      </div>
                  )}

                  {/* SUCCESS VIEW */}
                  {withdrawStep === 'SUCCESS' && (
                      <div className="p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                           <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mb-6">
                               <i className="fas fa-check text-4xl"></i>
                           </div>
                           <h2 className="text-2xl font-serif font-bold text-green-500 uppercase">Withdrawal Sent</h2>
                      </div>
                  )}

                  {/* FORM & CONFIRM VIEW */}
                  {(withdrawStep === 'FORM' || withdrawStep === 'CONFIRM') && (
                      <>
                        <div className="p-6 border-b border-red-500/20 bg-gradient-to-r from-red-900/20 to-transparent relative">
                            <h2 className="text-xl font-serif font-bold text-red-500 uppercase tracking-widest">Withdrawal Vault</h2>
                            <button onClick={() => setShowWithdrawModal(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white"><i className="fas fa-times text-lg"></i></button>
                        </div>
                        
                        <div className="p-8 space-y-5">
                            {withdrawStep === 'FORM' ? (
                                <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[8px] text-red-400 font-black uppercase tracking-widest ml-1">Amount (Min ₹10)</label>
                                        <input type="number" min="10" placeholder="500" className="w-full bg-premiumBlack border border-red-500/20 rounded-xl px-4 py-3 text-white text-lg font-bold outline-none focus:border-red-500" 
                                            value={withdrawData.amount} onChange={e => setWithdrawData({...withdrawData, amount: e.target.value})} required 
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[8px] text-gray-500 font-black uppercase tracking-widest ml-1">Email</label>
                                        <input type="email" value={withdrawData.email} onChange={e => setWithdrawData({...withdrawData, email: e.target.value})} className="w-full bg-premiumBlack border border-gold/10 rounded-xl px-4 py-3 text-white text-sm" required />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[8px] text-gray-500 font-black uppercase tracking-widest ml-1">T-PIN</label>
                                        <input type="password" placeholder="••••••" value={withdrawData.tpin} onChange={e => setWithdrawData({...withdrawData, tpin: e.target.value})} className="w-full bg-premiumBlack border border-gold/10 rounded-xl px-4 py-3 text-white text-center tracking-[0.5em]" required />
                                    </div>
                                    
                                    <div className="space-y-3 pt-2">
                                        <label className="text-[8px] text-gray-500 font-black uppercase tracking-widest ml-1">Payment Method</label>
                                        <div className="flex gap-4">
                                            <button type="button" onClick={() => setWithdrawData({...withdrawData, method: 'UPI'})} className={`flex-1 py-3 rounded-xl border text-[10px] font-bold uppercase ${withdrawData.method === 'UPI' ? 'bg-red-500 border-red-500 text-white' : 'border-gray-700 text-gray-500'}`}>UPI</button>
                                            <button type="button" onClick={() => setWithdrawData({...withdrawData, method: 'QR_CODE'})} className={`flex-1 py-3 rounded-xl border text-[10px] font-bold uppercase ${withdrawData.method === 'QR_CODE' ? 'bg-red-500 border-red-500 text-white' : 'border-gray-700 text-gray-500'}`}>QR</button>
                                        </div>
                                        
                                        {withdrawData.method === 'UPI' ? (
                                            <input type="text" placeholder="example@upi" value={withdrawData.upiId} onChange={e => setWithdrawData({...withdrawData, upiId: e.target.value})} className="w-full bg-premiumBlack border border-red-500/20 rounded-xl px-4 py-3 text-white" />
                                        ) : (
                                            <div onClick={() => qrInputRef.current?.click()} className="w-full h-24 border-2 border-dashed border-gray-700 rounded-xl flex items-center justify-center cursor-pointer bg-premiumBlack">
                                                {withdrawData.qrCode ? <span className="text-green-500 text-xs">Selected</span> : <span className="text-gray-500 text-xs">Upload QR</span>}
                                                <input type="file" ref={qrInputRef} className="hidden" accept="image/*" onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if(file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => setWithdrawData({...withdrawData, qrCode: reader.result as string});
                                                        reader.readAsDataURL(file);
                                                    }
                                                }} />
                                            </div>
                                        )}
                                    </div>

                                    <button type="submit" className="w-full py-4 mt-2 rounded-xl bg-gradient-to-r from-red-600 to-red-800 text-white font-black uppercase text-[10px] tracking-widest">
                                        Proceed
                                    </button>
                                </form>
                            ) : (
                                <div className="space-y-6">
                                    <div className="bg-red-500/5 border border-red-500/20 p-6 rounded-2xl">
                                        <p className="text-center text-red-500 font-bold mb-4">Confirm Withdrawal</p>
                                        <p className="text-center text-white text-2xl font-bold">₹{withdrawData.amount}</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <button onClick={() => setWithdrawStep('FORM')} className="flex-1 py-4 rounded-xl border border-gray-700 text-gray-400 font-bold text-[10px]">Back</button>
                                        <button onClick={confirmWithdrawal} className="flex-[2] py-4 rounded-xl bg-green-600 text-white font-black uppercase text-[10px]">
                                            Confirm
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                      </>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};

export default Wallets;
