
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Order, OrderStatus, UserRole, TimelineEvent, UserProfile } from '../types';

type HistoryTab = 'INBOX' | 'PENDING' | 'HANDOVER' | 'COMPLETE' | 'HISTORY';

const OrderHistory: React.FC = () => {
  const location = useLocation();
  const [user, setUser] = useState<{ id: string; role: UserRole; name: string } | null>(null);
  const [activeTab, setActiveTab] = useState<HistoryTab>('INBOX');
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Worker Selection & OTP State
  const [showWorkerSelection, setShowWorkerSelection] = useState(false);
  const [nextRole, setNextRole] = useState<string>('');
  const [deliveryOtp, setDeliveryOtp] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);

  // Measurement Book State
  const [showMeasurementBook, setShowMeasurementBook] = useState(false);
  const [measurements, setMeasurements] = useState<any>({});

  // SUCCESS SHUTTER STATE
  const [successShutter, setSuccessShutter] = useState<{show: boolean, worker: string, role: string}>({
    show: false, 
    worker: '', 
    role: ''
  });

  const loadOrders = () => {
    try {
      const all: Order[] = JSON.parse(localStorage.getItem('lords_saved_orders') || '[]');
      setOrders(all);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('lords_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      
      if (location.state && location.state.tab) {
         setActiveTab(location.state.tab);
      } else {
         if (parsed.role === UserRole.SHOWROOM || parsed.role === UserRole.BOOKING_MASTER || parsed.role === UserRole.ADMIN || parsed.role === UserRole.MANAGER) {
           setActiveTab('HISTORY');
         }
      }
    }
    loadOrders();
    const interval = setInterval(loadOrders, 3000);
    return () => clearInterval(interval);
  }, [location.state]);

  // --- HANDOVER FLOW LOGIC ---
  const getNextStep = (order: Order): { role: UserRole, status: OrderStatus } => {
    const role = order.currentOwner;
    const type = order.garmentType.toLowerCase();

    // 1. Showroom OR Booking Master -> Measurement
    if ((role === UserRole.SHOWROOM || role === UserRole.BOOKING_MASTER) && order.status === OrderStatus.BOOKED) {
      return { role: UserRole.MEASUREMENT, status: OrderStatus.MEASURED };
    }
    // 2. Measurement -> Cutting
    if (role === UserRole.MEASUREMENT) {
      return { role: UserRole.CUTTING, status: OrderStatus.CUTTING_DONE };
    }
    // 3. Cutting -> Makers (Split based on Item)
    if (role === UserRole.CUTTING) {
       if (type.includes('pant') || type.includes('pajama') || type.includes('trouser')) {
         return { role: UserRole.PANT_MAKER, status: OrderStatus.STITCHING };
       }
       return { role: UserRole.SHIRT_MAKER, status: OrderStatus.STITCHING };
    }
    // 4. Makers -> Kaj Button OR Press
    if (role === UserRole.SHIRT_MAKER || role === UserRole.PANT_MAKER) {
        if (role === UserRole.PANT_MAKER) {
            // PANT MAKER directly to PRESS (Skip Kaj Button)
            return { role: UserRole.PRESS, status: OrderStatus.PRESSING };
        }
        return { role: UserRole.KAJ_BUTTON, status: OrderStatus.KAJ_BUTTON };
    }
    // 5. Kaj Button -> Press
    if (role === UserRole.KAJ_BUTTON) {
      return { role: UserRole.PRESS, status: OrderStatus.PRESSING };
    }
    // 6. Press -> Delivery
    if (role === UserRole.PRESS) {
      return { role: UserRole.DELIVERY, status: OrderStatus.READY };
    }
    // 7. Delivery -> Showroom
    if (role === UserRole.DELIVERY) {
      return { role: UserRole.SHOWROOM, status: OrderStatus.DELIVERED };
    }
    return { role: UserRole.SHOWROOM, status: OrderStatus.DELIVERED };
  };

  // --- WALLET DEDUCTION LOGIC ---
  const processAdminDeduction = (order: Order, percentage: number, forcePayer?: UserRole): boolean => {
      const roleWallets = JSON.parse(localStorage.getItem('lords_wallets_by_role') || '{}');
      
      let payerRole = UserRole.SHOWROOM;
      
      if (forcePayer) {
          payerRole = forcePayer;
      } else {
        if (order.timelineLogs && order.timelineLogs.length > 0) {
            const firstLog = order.timelineLogs[0];
            if (firstLog.role === UserRole.BOOKING_MASTER) {
                payerRole = UserRole.BOOKING_MASTER;
            }
        }
      }

      if (!roleWallets[payerRole]) roleWallets[payerRole] = { task_earnings: 0, total: 0 };
      if (!roleWallets[UserRole.ADMIN]) roleWallets[UserRole.ADMIN] = { task_earnings: 0, total: 0, upline_income: 0 };

      const deductionAmount = Math.floor(order.totalAmount * (percentage / 100));
      
      const currentBalance = roleWallets[payerRole].total || 0;

      if (currentBalance < deductionAmount) {
          alert(`⛔ INSUFFICIENT FUNDS IN ${payerRole.replace('_', ' ')} WALLET!\n\nRequired (${percentage}%): ₹${deductionAmount}\nAvailable: ₹${currentBalance}\n\nPlease recharge wallet.`);
          return false;
      }

      roleWallets[payerRole].total -= deductionAmount;
      roleWallets[UserRole.ADMIN].total = (roleWallets[UserRole.ADMIN].total || 0) + deductionAmount;

      localStorage.setItem('lords_wallets_by_role', JSON.stringify(roleWallets));
      return true;
  };

  // --- NETWORK DISTRIBUTION LOGIC ---
  const distributeNetworkIncome = (workerRole: UserRole, totalIncome: number) => {
      if (totalIncome <= 0) return;

      const usersDB: UserProfile[] = JSON.parse(localStorage.getItem('lords_users_db') || '[]');
      const roleWallets = JSON.parse(localStorage.getItem('lords_wallets_by_role') || '{}');
      const settings = JSON.parse(localStorage.getItem('lords_settings') || '{}');

      // 1. Calculate Pots
      const deduction = Math.floor(totalIncome * 0.10); // 10% Cut
      const uplineShare = Math.floor(deduction * 0.85); // 85% to Upline
      const downlineShare = Math.floor(deduction * 0.15); // 15% to Downline

      // Find current worker
      const worker = usersDB.find(u => u.role === workerRole);
      if (!worker) return;

      // --- A. UPLINE DISTRIBUTION (10 Levels Up) ---
      let currentUplineCode = worker.referredBy;
      let upLevels = settings.upline_levels || [30, 20, 15, 10, 5, 5, 5, 5, 2.5, 2.5]; 
      
      upLevels.forEach((pct: number) => {
          if (!currentUplineCode) return;
          
          const uplineUser = usersDB.find(u => u.referralCode === currentUplineCode);
          if (uplineUser) {
              const shareAmount = Math.floor(uplineShare * (pct / 100));
              if (shareAmount > 0) {
                  if (!roleWallets[uplineUser.role]) roleWallets[uplineUser.role] = { total: 0, upline_income: 0 };
                  roleWallets[uplineUser.role].total = (roleWallets[uplineUser.role].total || 0) + shareAmount;
                  roleWallets[uplineUser.role].upline_income = (roleWallets[uplineUser.role].upline_income || 0) + shareAmount;
              }
              currentUplineCode = uplineUser.referredBy; // Climb up
          } else {
              currentUplineCode = null;
          }
      });

      // --- B. DOWNLINE DISTRIBUTION (10 Levels Down) ---
      let downLevels = settings.downline_levels || [5, 5, 5, 5, 5, 10, 15, 15, 15, 20];
      const getDownlineAtLevel = (managerCodes: string[], targetDepth: number, currentDepth: number): UserProfile[] => {
          if (managerCodes.length === 0) return [];
          const directJuniors = usersDB.filter(u => u.referredBy && managerCodes.includes(u.referredBy));
          if (currentDepth === targetDepth) return directJuniors;
          const juniorCodes = directJuniors.map(u => u.referralCode || '');
          return getDownlineAtLevel(juniorCodes, targetDepth, currentDepth + 1);
      };

      downLevels.forEach((pct: number, idx: number) => {
          const depth = idx + 1;
          const usersAtLevel = getDownlineAtLevel([worker.referralCode || ''], depth, 1);
          if (usersAtLevel.length > 0) {
              const totalAmountForThisLevel = Math.floor(downlineShare * (pct / 100));
              const amountPerUser = Math.floor(totalAmountForThisLevel / usersAtLevel.length);
              if (amountPerUser > 0) {
                  usersAtLevel.forEach(u => {
                      if (!roleWallets[u.role]) roleWallets[u.role] = { total: 0, downline_income: 0 };
                      roleWallets[u.role].total = (roleWallets[u.role].total || 0) + amountPerUser;
                      roleWallets[u.role].downline_income = (roleWallets[u.role].downline_income || 0) + amountPerUser;
                  });
              }
          }
      });
      localStorage.setItem('lords_wallets_by_role', JSON.stringify(roleWallets));
  };

  // --- WORKER CREDIT LOGIC ---
  const creditWorkerWallet = (workerRole: UserRole, garmentType: string) => {
    const settings = JSON.parse(localStorage.getItem('lords_settings') || '{}');
    const roleWallets = JSON.parse(localStorage.getItem('lords_wallets_by_role') || '{}');
    const type = garmentType.toLowerCase();
    
    let amount = 0;
    if (workerRole === UserRole.MEASUREMENT) {
        amount = type.includes('shirt') ? settings.measurement_shirt_new : settings.measurement_pant_new;
    } else if (workerRole === UserRole.CUTTING) {
        amount = type.includes('shirt') ? settings.cutting_shirt_rate : settings.cutting_pant_rate;
    } else if (workerRole === UserRole.SHIRT_MAKER) {
        amount = settings.stitching_shirt;
    } else if (workerRole === UserRole.PANT_MAKER) {
        amount = settings.stitching_pant;
    } else if (workerRole === UserRole.KAJ_BUTTON) {
        amount = settings.kaj_button_rate;
    } else if (workerRole === UserRole.PRESS) {
        amount = settings.press_rate;
    } else if (workerRole === UserRole.DELIVERY) {
        amount = settings.delivery_payout;
    }

    if (amount > 0) {
        if (!roleWallets[workerRole]) {
            roleWallets[workerRole] = { task_earnings: 0, total: 0, upline_income: 0, downline_income: 0 };
        }
        
        roleWallets[workerRole].task_earnings = (roleWallets[workerRole].task_earnings || 0) + amount;
        roleWallets[workerRole].total = (roleWallets[workerRole].total || 0) + amount;
        
        localStorage.setItem('lords_wallets_by_role', JSON.stringify(roleWallets));
        distributeNetworkIncome(workerRole, amount);
        return amount;
    }
    return 0;
  };

  // --- HANDOVER CONFIRMATION ---
  const confirmHandover = (workerName: string) => {
    if (!user || !selectedOrder) return;

    // --- 100% DEDUCTION LOGIC IMPLEMENTATION ---

    // 1. Measurement -> Cutting (50% Deduction)
    if (user.role === UserRole.MEASUREMENT) {
        const success = processAdminDeduction(selectedOrder, 50, UserRole.SHOWROOM); 
        if (!success) return; 
    }

    // 2. Press -> Delivery (25% Deduction - NEW ADDITION)
    // This completes the chain before the final 25% at delivery
    if (user.role === UserRole.PRESS) {
        const success = processAdminDeduction(selectedOrder, 25, UserRole.SHOWROOM);
        if (!success) return;
    }

    // ---------------------------------------------

    const all: Order[] = JSON.parse(localStorage.getItem('lords_saved_orders') || '[]');
    const next = getNextStep(selectedOrder);

    const newLog: TimelineEvent = {
        status: next.status,
        role: next.role,
        workerName: workerName,
        timestamp: new Date().toISOString(),
        action: 'HANDOVER'
    };

    const updated = all.map(o => {
        if (o.id === selectedOrder.id) {
            return { 
                ...o, 
                status: next.status, 
                currentOwner: next.role, 
                previousOwner: user.role, 
                assignedWorkerName: workerName, 
                isPendingAcceptance: true,
                timelineLogs: [...(o.timelineLogs || []), newLog]
            };
        }
        return o;
    });
    localStorage.setItem('lords_saved_orders', JSON.stringify(updated));

    setShowWorkerSelection(false);
    setSelectedOrder(null);
    setSuccessShutter({
      show: true,
      worker: workerName,
      role: next.role.replace('_', ' ')
    });

    setTimeout(() => {
      setSuccessShutter(prev => ({ ...prev, show: false }));
    }, 3000);

    loadOrders();
    window.dispatchEvent(new Event('storage'));
  };

  // --- OTP SUBMIT ---
  const handleDeliveryOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (deliveryOtp === selectedOrder?.secretCode) {
        
        // 3. Delivery -> Showroom (Final 25% Deduction)
        // This ensures 50% + 25% + 25% = 100% Total
        const success = processAdminDeduction(selectedOrder!, 25, UserRole.SHOWROOM);
        if (!success) return; 

        setShowOtpModal(false);
        setDeliveryOtp('');
        confirmHandover("Showroom Manager");
    } else {
        alert("Incorrect Code. Ask Showroom Manager for the secure code.");
    }
  };

  // --- CREDIT SHOWROOM COMMISSION ---
  const creditShowroomCommission = (order: Order) => {
      const settings = JSON.parse(localStorage.getItem('lords_settings') || '{}');
      const roleWallets = JSON.parse(localStorage.getItem('lords_wallets_by_role') || '{}');
      
      let beneficiary = UserRole.SHOWROOM;
      if (order.timelineLogs && order.timelineLogs[0].role === UserRole.BOOKING_MASTER) {
          beneficiary = UserRole.BOOKING_MASTER;
      }

      const pct = beneficiary === UserRole.BOOKING_MASTER 
          ? (settings.booking_master_payout || 5) 
          : (settings.showroom_payout || 5);

      const commission = Math.floor(order.totalAmount * (pct / 100));

      if (commission > 0) {
          if (!roleWallets[beneficiary]) {
              roleWallets[beneficiary] = { task_earnings: 0, total: 0 };
          }
          roleWallets[beneficiary].task_earnings = (roleWallets[beneficiary].task_earnings || 0) + commission;
          roleWallets[beneficiary].total = (roleWallets[beneficiary].total || 0) + commission;
          
          localStorage.setItem('lords_wallets_by_role', JSON.stringify(roleWallets));
          alert(`💰 5% Commission (₹${commission}) credited to ${beneficiary.replace('_', ' ')} Wallet!`);
      }
  };

  // --- ACCEPT ORDER ---
  const handleAcceptOrder = () => {
    if (!selectedOrder || !user) return;
    
    if (selectedOrder.previousOwner) {
        const credited = creditWorkerWallet(selectedOrder.previousOwner, selectedOrder.garmentType);
        if (credited > 0) {
            alert(`Income Credited! \n₹${credited} added to ${selectedOrder.previousOwner.replace('_', ' ')}'s Work Wallet.`);
        }
    }

    if (user.role === UserRole.MEASUREMENT && (selectedOrder.previousOwner === UserRole.SHOWROOM || selectedOrder.previousOwner === UserRole.BOOKING_MASTER)) {
        creditShowroomCommission(selectedOrder);
    }

    const all: Order[] = JSON.parse(localStorage.getItem('lords_saved_orders') || '[]');
    const newLog: TimelineEvent = {
        status: selectedOrder.status,
        role: user.role,
        workerName: user.name,
        timestamp: new Date().toISOString(),
        action: 'ACCEPTED'
    };

    const updated = all.map(o => {
        if (o.id === selectedOrder.id) {
            return {
                ...o,
                isPendingAcceptance: false,
                assignedWorkerName: user.name, 
                timelineLogs: [...(o.timelineLogs || []), newLog]
            };
        }
        return o;
    });

    localStorage.setItem('lords_saved_orders', JSON.stringify(updated));
    setSelectedOrder(null);
    loadOrders();
    window.dispatchEvent(new Event('storage'));
  };

  // --- MODALS ---
  const openMeasurementBook = () => {
    const existingData = (selectedOrder as any).measurements || {};
    setMeasurements(existingData);
    setShowMeasurementBook(true);
  };

  const saveMeasurement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    const all: Order[] = JSON.parse(localStorage.getItem('lords_saved_orders') || '[]');
    const updated = all.map(o => {
      if (o.id === selectedOrder.id) {
        return { 
          ...o, 
          measurements: measurements,
          status: OrderStatus.MEASURED 
        };
      }
      return o;
    });

    localStorage.setItem('lords_saved_orders', JSON.stringify(updated));
    alert("Measurement Book Saved ✅\nYou can now Handover to Cutting.");
    setShowMeasurementBook(false);
    
    const updatedOrder = updated.find(o => o.id === selectedOrder.id);
    if (updatedOrder) setSelectedOrder(updatedOrder);
    
    loadOrders();
    window.dispatchEvent(new Event('storage'));
  };

  // --- INITIATE HANDOVER ---
  const initiateHandover = () => {
    if (!selectedOrder) return;
    const next = getNextStep(selectedOrder);
    
    if (!next.role) {
        alert("Error: Next step could not be determined.");
        return;
    }

    setNextRole(next.role);
    
    // Only show OTP Modal if CURRENT owner is Delivery Boy giving to Showroom
    if (selectedOrder.currentOwner === UserRole.DELIVERY && next.role === UserRole.SHOWROOM) {
        setShowOtpModal(true);
    } else {
        // For everyone else (Including Pant Maker -> Press), show Worker Selection
        setShowWorkerSelection(true); 
    }
  };

  const getAvailableWorkers = (role: string) => {
    if (!role) return [];
    const names = ['Rajesh', 'Sunil', 'Amit', 'Vikram', 'Suresh'];
    return names.map(n => ({ name: n, role: role.replace('_', ' ') }));
  };

  const filteredOrders = orders.filter(o => {
    if (activeTab === 'HISTORY') {
       if (user?.role === UserRole.ADMIN || user?.role === UserRole.SHOWROOM || user?.role === UserRole.BOOKING_MASTER || user?.role === UserRole.MANAGER || user?.role === UserRole.DIRECTOR) return true;
       return o.status === OrderStatus.DELIVERED;
    }
    if (activeTab === 'COMPLETE') return o.status === OrderStatus.DELIVERED;
    if (activeTab === 'INBOX') return o.currentOwner === user?.role && o.isPendingAcceptance;
    if (activeTab === 'PENDING') return o.currentOwner === user?.role && !o.isPendingAcceptance && o.status !== OrderStatus.DELIVERED;
    if (activeTab === 'HANDOVER') {
        return o.previousOwner === user?.role && o.status !== OrderStatus.DELIVERED;
    }
    return false;
  });

  const getTheme = (tab: HistoryTab) => {
    switch(tab) {
      case 'INBOX': return { border: 'border-cyan-400', text: 'text-cyan-400', bg: 'bg-cyan-900/10', activeBg: 'bg-cyan-500', shadow: 'shadow-cyan-500/20' };
      case 'PENDING': return { border: 'border-red-500', text: 'text-red-500', bg: 'bg-red-900/10', activeBg: 'bg-red-600', shadow: 'shadow-red-500/20' };
      case 'HANDOVER': return { border: 'border-white', text: 'text-white', bg: 'bg-white/5', activeBg: 'bg-white text-black', shadow: 'shadow-white/20' };
      case 'COMPLETE': return { border: 'border-green-500', text: 'text-green-500', bg: 'bg-green-900/10', activeBg: 'bg-green-600', shadow: 'shadow-green-500/20' };
      default: return { border: 'border-gold', text: 'text-gold', bg: 'bg-gold/10', activeBg: 'bg-gold text-premiumBlack', shadow: 'shadow-gold/20' };
    }
  };

  const currentTheme = getTheme(activeTab);

  const getMeasurementFields = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('shirt') || t.includes('kurta')) return ['Length', 'Shoulder', 'Sleeve', 'Chest', 'Waist', 'Collar', 'Cuff'];
    if (t.includes('pant') || t.includes('pajama') || t.includes('trouser')) return ['Length', 'Waist', 'Hip', 'Thigh', 'Knee', 'Bottom', 'Crotch'];
    return ['Length', 'Waist', 'Chest', 'Shoulder', 'Sleeve'];
  };

  return (
    <div className="space-y-10 pb-24 max-w-7xl mx-auto px-4 animate-in fade-in duration-700 relative">
      
      {/* SUCCESS SHUTTER ANIMATION */}
      <div className={`fixed inset-x-0 top-0 z-[9999] transition-transform duration-700 ease-[cubic-bezier(0.68,-0.55,0.27,1.55)] ${successShutter.show ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="bg-gradient-to-b from-green-600 to-green-800 border-b-4 border-gold shadow-[0_10px_50px_rgba(0,255,0,0.3)] pb-8 pt-6 px-6 rounded-b-[3rem] text-center relative overflow-hidden">
           <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PHBhdGggZD0iTTAgMTBoMTBWMHExMCAwIDEwIDEweiIgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIwLjEiLz48L3N2Zz4=')]"></div>
           <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-white text-green-700 flex items-center justify-center text-3xl shadow-xl animate-bounce">
                 <i className="fas fa-check-circle"></i>
              </div>
              <h2 className="text-3xl font-serif font-bold text-white uppercase tracking-widest drop-shadow-md">Successfully Handed Over</h2>
              <div className="bg-black/30 px-6 py-2 rounded-full border border-white/20 mt-2">
                 <p className="text-sm text-gold font-black uppercase tracking-[0.2em]">To Master: <span className="text-white text-lg ml-2">{successShutter.worker}</span></p>
              </div>
              <p className="text-[10px] text-green-200 font-bold uppercase mt-2 tracking-widest">Department: {successShutter.role}</p>
           </div>
        </div>
      </div>

      <div className="text-center pt-10">
        <h1 className="text-4xl font-serif font-bold gold-text uppercase tracking-widest mb-2">Production Floor</h1>
        <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.5em]">Workstation Control Unit</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
         {[
           { id: 'INBOX', label: 'Inbox', icon: 'fa-inbox', theme: getTheme('INBOX') },
           { id: 'PENDING', label: 'Pending', icon: 'fa-clock', theme: getTheme('PENDING') },
           { id: 'HANDOVER', label: 'Sent / Handover', icon: 'fa-hand-holding', theme: getTheme('HANDOVER') },
           { id: 'COMPLETE', label: 'Complete', icon: 'fa-check-circle', theme: getTheme('COMPLETE') },
           { id: 'HISTORY', label: 'History', icon: 'fa-history', theme: getTheme('HISTORY') }
         ].map((tab: any) => (
           <button 
             key={tab.id}
             onClick={() => setActiveTab(tab.id as HistoryTab)}
             className={`p-6 rounded-3xl border transition-all duration-300 flex flex-col items-center justify-center gap-3 relative overflow-hidden group ${
               activeTab === tab.id 
                 ? `${tab.theme.activeBg} border-transparent shadow-xl` 
                 : `${tab.theme.bg} ${tab.theme.border} ${tab.theme.text}`
             }`}
           >
             <i className={`fas ${tab.icon} text-2xl mb-1`}></i>
             <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
             {tab.id === 'INBOX' && orders.filter(o => o.currentOwner === user?.role && o.isPendingAcceptance).length > 0 && (
               <span className="absolute top-4 right-4 w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg"></span>
             )}
           </button>
         ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrders.map(order => (
          <div 
            key={order.id} 
            onClick={() => setSelectedOrder(order)}
            className={`premium-card p-6 rounded-[2.5rem] bg-premiumDark/50 border-l-4 hover:scale-[1.02] cursor-pointer transition-all flex flex-col gap-4 group shadow-lg ${order.isUrgent ? 'border-red-600 shadow-red-900/20' : currentTheme.border}`}
          >
            <div className="flex justify-between items-start">
               <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-gold transition-colors">{order.customerName}</h3>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{order.billNo}</p>
               </div>
               {order.isUrgent ? (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-600 text-white shadow-lg animate-pulse">
                      <i className="fas fa-fire"></i>
                  </div>
               ) : (
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${currentTheme.border} ${currentTheme.text} bg-premiumBlack`}>
                      <i className="fas fa-cut"></i>
                  </div>
               )}
            </div>
            
            {(user?.role === UserRole.SHOWROOM || user?.role === UserRole.BOOKING_MASTER || user?.role === UserRole.ADMIN) && (
               <div className="bg-gold/10 border border-gold/30 p-3 rounded-xl flex items-center justify-between">
                  <span className="text-[9px] text-gold uppercase font-black tracking-widest">Secure OTP:</span>
                  <span className="text-xl font-black text-white tracking-[0.2em]">{order.secretCode}</span>
               </div>
            )}
            
            {order.assignedWorkerName && (
                <div className="bg-gold/5 p-2 rounded-xl border border-gold/10 flex items-center gap-3">
                   <div className="w-6 h-6 rounded-full bg-gold text-premiumBlack flex items-center justify-center text-[10px] font-bold">
                       {order.assignedWorkerName.charAt(0)}
                   </div>
                   <div>
                       <p className="text-[8px] text-gray-400 uppercase font-black">
                         {activeTab === 'HANDOVER' ? 'Handed To' : 'Current Master'}
                       </p>
                       <p className="text-xs font-bold text-gold">{order.assignedWorkerName}</p>
                   </div>
                </div>
            )}

            <div className="space-y-2 bg-premiumBlack/30 p-4 rounded-2xl border border-white/5">
               <div className="flex justify-between text-[10px] uppercase font-bold">
                  <span className="text-gray-500">Item</span>
                  <span className="text-white">{order.garmentType}</span>
               </div>
               <div className="flex justify-between text-[10px] uppercase font-bold">
                  <span className="text-gray-500">Rate (Sep.)</span>
                  <span className="text-gold font-mono">₹{order.totalAmount}</span>
               </div>
               <div className="flex justify-between text-[10px] uppercase font-bold">
                  <span className="text-gray-500">Due Date</span>
                  <span className={`text-lg font-black ${order.isUrgent ? 'text-red-500' : 'text-white'}`}>{order.deliveryDate}</span>
               </div>
            </div>
            <div className="mt-auto flex justify-between items-center">
                <span className={`text-[9px] uppercase font-black tracking-widest px-3 py-1 rounded-full ${order.isPendingAcceptance ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                    {order.isPendingAcceptance ? 'Pending Acceptance' : 'In Progress'}
                </span>
                {order.isUrgent && (
                    <span className="text-[8px] bg-red-600 text-white px-2 py-0.5 rounded font-black uppercase tracking-widest animate-pulse">URGENT</span>
                )}
            </div>
          </div>
        ))}
        {filteredOrders.length === 0 && (
          <div className="col-span-full py-20 text-center opacity-30 space-y-4">
             <i className="fas fa-folder-open text-6xl text-gray-600"></i>
             <p className="uppercase tracking-[0.4em] font-black text-xs text-gray-500">No Orders in {activeTab}</p>
          </div>
        )}
      </div>

      {/* --- MEASUREMENT BOOK MODAL --- */}
      {showMeasurementBook && selectedOrder && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 bg-black/95 backdrop-blur-md p-4 animate-in zoom-in-95 duration-200">
          <div className="premium-card w-full max-w-2xl rounded-[2.5rem] overflow-hidden border-gold/30 bg-premiumDark shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gold/10 bg-gold/5 flex justify-between items-center">
               <div>
                  <h3 className="text-xl font-serif font-bold gold-text">Measurement Book</h3>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{selectedOrder.garmentType} for {selectedOrder.customerName}</p>
               </div>
               <button onClick={() => setShowMeasurementBook(false)} className="w-10 h-10 rounded-full bg-premiumBlack border border-gold/20 flex items-center justify-center text-gray-500 hover:text-white"><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={saveMeasurement} className="flex-1 overflow-y-auto p-8 custom-scrollbar">
               <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                 {getMeasurementFields(selectedOrder.garmentType).map((field) => (
                   <div key={field} className="space-y-1">
                      <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest ml-1">{field}</label>
                      <input 
                        type="number" step="0.1"
                        className="w-full bg-premiumBlack border border-gold/20 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-gold"
                        value={measurements[field] || ''}
                        onChange={e => setMeasurements({...measurements, [field]: e.target.value})}
                      />
                   </div>
                 ))}
               </div>
               <div className="mt-8 space-y-1">
                   <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest ml-1">Special Notes / Remarks</label>
                   <textarea 
                     rows={3}
                     className="w-full bg-premiumBlack border border-gold/20 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-gold"
                     value={measurements.notes || ''}
                     onChange={e => setMeasurements({...measurements, notes: e.target.value})}
                     placeholder="e.g. Loose fitting from waist, urgent delivery..."
                   />
               </div>
            </form>
            <div className="p-6 border-t border-gold/10 bg-premiumBlack/50 flex gap-4">
               <button onClick={() => setShowMeasurementBook(false)} className="flex-1 py-4 rounded-xl text-gray-500 font-bold uppercase text-[10px] tracking-widest border border-gray-700">Cancel</button>
               <button onClick={saveMeasurement} className="flex-[2] py-4 rounded-xl gold-gradient text-premiumBlack font-black uppercase text-[10px] tracking-widest shadow-lg">Save Measurements</button>
            </div>
          </div>
        </div>
      )}

      {/* --- ORDER ACTION MODAL (MAIN) --- */}
      {selectedOrder && !showWorkerSelection && !showOtpModal && !showMeasurementBook && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/95 backdrop-blur-md p-4 animate-in zoom-in-95 duration-200">
            <div className={`premium-card w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] bg-premiumDark border shadow-2xl relative flex flex-col ${selectedOrder.isUrgent ? 'border-red-500 shadow-red-900/30' : 'border-gold/30'}`}>
               
               {selectedOrder.isUrgent && (
                   <div className="bg-red-600 text-white text-center py-2 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">
                       🔥 High Priority Order 🔥
                   </div>
               )}

               <div className="p-6 border-b border-gold/10 flex justify-between items-center bg-gold/5">
                  <div>
                     <h2 className="text-2xl font-serif font-bold gold-text">{selectedOrder.customerName}</h2>
                     <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{selectedOrder.billNo} • {selectedOrder.garmentType}</p>
                  </div>
                  <button onClick={() => setSelectedOrder(null)} className="w-10 h-10 rounded-full bg-premiumBlack border border-gold/20 flex items-center justify-center text-gray-500 hover:text-white hover:border-gold transition-all">
                     <i className="fas fa-times"></i>
                  </button>
               </div>

               <div className="p-8 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
                  <div className={`p-4 rounded-xl text-center border ${selectedOrder.isPendingAcceptance ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'}`}>
                      <p className={`text-xs font-black uppercase tracking-widest ${selectedOrder.isPendingAcceptance ? 'text-red-500' : 'text-green-500'}`}>
                          {selectedOrder.isPendingAcceptance ? 'Waiting for your Acceptance' : 'Order Active - In Progress'}
                      </p>
                  </div>
                  
                  {(user?.role === UserRole.SHOWROOM || user?.role === UserRole.BOOKING_MASTER || user?.role === UserRole.ADMIN) && (
                      <div className="bg-gradient-to-r from-gold/20 to-transparent p-4 rounded-xl border-l-4 border-gold">
                         <p className="text-[8px] text-gray-400 uppercase font-black tracking-widest">Handover OTP Code</p>
                         <p className="text-3xl font-black text-white tracking-[0.2em]">{selectedOrder.secretCode}</p>
                         <p className="text-[8px] text-gold uppercase mt-1">Provide this to Delivery Boy for final handover</p>
                      </div>
                  )}

                  <div className="grid grid-cols-2 gap-6">
                      <div className="bg-premiumBlack p-4 rounded-xl border border-gold/10">
                          <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Rate</p>
                          <p className="text-xl font-bold text-white">₹{selectedOrder.totalAmount}</p>
                      </div>
                      <div className={`bg-premiumBlack p-4 rounded-xl border ${selectedOrder.isUrgent ? 'border-red-500 bg-red-900/10' : 'border-gold/10'}`}>
                          <p className={`text-[9px] uppercase font-black tracking-widest ${selectedOrder.isUrgent ? 'text-red-400' : 'text-gray-500'}`}>Delivery Due</p>
                          <p className={`text-xl font-bold ${selectedOrder.isUrgent ? 'text-red-500' : 'text-gold'}`}>{selectedOrder.deliveryDate}</p>
                      </div>
                  </div>
                  
                  {selectedOrder.measurements && (
                      <div className="bg-premiumBlack p-5 rounded-2xl border border-gold/10">
                          <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-3">Measurements</p>
                          <div className="flex flex-wrap gap-2">
                             {Object.entries(selectedOrder.measurements).map(([key, val]: any) => key !== 'notes' && (
                                 <span key={key} className="bg-gray-800 text-white px-3 py-1 rounded-lg text-xs font-bold border border-gray-700">
                                     {key}: <span className="text-gold">{val}</span>
                                 </span>
                             ))}
                          </div>
                      </div>
                  )}
               </div>

               <div className="p-6 border-t border-gold/10 bg-premiumBlack/50">
                  {selectedOrder.isPendingAcceptance ? (
                      <button onClick={handleAcceptOrder} className="w-full py-5 rounded-2xl bg-green-600 text-white font-black uppercase text-sm tracking-widest shadow-lg hover:bg-green-500 transition-all">
                          Accept Order & Start Work
                      </button>
                  ) : (
                      <div className="flex gap-4">
                          {user?.role === UserRole.MEASUREMENT ? (
                              selectedOrder.status === OrderStatus.BOOKED ? (
                                  <button onClick={openMeasurementBook} className="w-full py-5 rounded-2xl bg-gold text-premiumBlack font-black uppercase text-sm tracking-widest shadow-lg hover:bg-white transition-all animate-pulse">
                                      <i className="fas fa-ruler-combined mr-2"></i> Open Measurement Book
                                  </button>
                              ) : (
                                  <>
                                    <button onClick={openMeasurementBook} className="flex-1 py-4 rounded-2xl border border-gold/30 text-gold font-bold uppercase text-[10px] tracking-widest hover:bg-gold hover:text-premiumBlack">
                                        Edit Measurements
                                    </button>
                                    <button onClick={initiateHandover} className="flex-[2] py-4 rounded-2xl gold-gradient text-premiumBlack font-black uppercase text-[10px] tracking-widest shadow-lg hover:scale-[1.02] transition-transform">
                                        Handover to Next
                                    </button>
                                  </>
                              )
                          ) : (
                              <button onClick={initiateHandover} className="w-full py-4 rounded-2xl gold-gradient text-premiumBlack font-black uppercase text-[10px] tracking-widest shadow-lg hover:scale-[1.02] transition-transform">
                                  Handover to Next
                              </button>
                          )}
                      </div>
                  )}
               </div>
            </div>
         </div>
      )}
      
      {/* DELIVERY OTP MODAL */}
      {showOtpModal && selectedOrder && (
         <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 bg-black/95 backdrop-blur-md p-4 animate-in zoom-in-95 duration-200">
             <div className="premium-card w-full max-w-sm rounded-[2.5rem] overflow-hidden border-gold/30 bg-premiumDark shadow-2xl">
                 <div className="p-8 text-center space-y-4">
                     <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center text-gold text-2xl mx-auto mb-4 border border-gold/20">
                         <i className="fas fa-lock"></i>
                     </div>
                     <h3 className="text-xl font-serif font-bold text-white">Secure Delivery Handover</h3>
                     <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Enter Code from Showroom/Customer</p>
                     <p className="text-[10px] text-red-400 font-black uppercase mt-2">Note: 25% Amount will be deducted from Showroom Wallet</p>
                     
                     <form onSubmit={handleDeliveryOtpSubmit} className="space-y-4 mt-4">
                         <input 
                             type="number" 
                             className="w-full bg-premiumBlack border border-gold/20 rounded-2xl px-6 py-4 text-center text-2xl font-black text-gold tracking-[0.5em] focus:border-gold outline-none"
                             placeholder="••••"
                             value={deliveryOtp}
                             onChange={(e) => setDeliveryOtp(e.target.value)}
                             autoFocus
                         />
                         <button type="submit" className="w-full gold-gradient text-premiumBlack font-black py-4 rounded-2xl uppercase text-xs tracking-widest shadow-lg hover:brightness-110">
                             Confirm Delivery
                         </button>
                         <button type="button" onClick={() => setShowOtpModal(false)} className="w-full text-gray-500 text-[10px] uppercase font-bold hover:text-white">Cancel</button>
                     </form>
                 </div>
             </div>
         </div>
      )}

      {/* WORKER SELECTION POPUP LIST */}
      {showWorkerSelection && selectedOrder && (
         <div className="fixed inset-0 z-[150] flex items-center justify-center px-4 bg-black/95 backdrop-blur-md p-4 animate-in zoom-in-95 duration-200">
            <div className="premium-card w-full max-w-sm rounded-[2.5rem] overflow-hidden border-gold/30 bg-premiumDark shadow-2xl">
               <div className="p-6 border-b border-gold/10 text-center relative">
                  <h3 className="text-xl font-serif font-bold gold-text">Select Next Master</h3>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Assigning to {nextRole.replace('_', ' ')}</p>
                  
                  {user?.role === UserRole.MEASUREMENT && (
                      <p className="text-[8px] text-red-400 font-black uppercase mt-2 bg-red-900/20 px-2 py-1 rounded">Action will deduct 50% from Order Owner</p>
                  )}
                  {user?.role === UserRole.PRESS && (
                      <p className="text-[8px] text-red-400 font-black uppercase mt-2 bg-red-900/20 px-2 py-1 rounded">Action will deduct 25% from Order Owner</p>
                  )}

                  <button onClick={() => setShowWorkerSelection(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white"><i className="fas fa-times"></i></button>
               </div>
               <div className="p-4 space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
                  {getAvailableWorkers(nextRole).map((worker, i) => (
                     <button 
                       key={i} 
                       onClick={() => confirmHandover(worker.name)}
                       className="w-full flex items-center justify-between p-4 rounded-2xl bg-premiumBlack border border-gold/5 hover:border-gold hover:bg-gold/10 transition-all group"
                     >
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-gray-800 text-gray-400 flex items-center justify-center font-bold text-xs group-hover:bg-gold group-hover:text-premiumBlack transition-colors">
                              {worker.name.charAt(0)}
                           </div>
                           <div className="text-left">
                              <p className="text-sm font-bold text-white">{worker.name}</p>
                              <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Active</p>
                           </div>
                        </div>
                        <i className="fas fa-chevron-right text-gray-600 group-hover:text-gold"></i>
                     </button>
                  ))}
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default OrderHistory;
