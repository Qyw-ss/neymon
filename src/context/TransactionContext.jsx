import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { ref, set, get, child } from 'firebase/database';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';

const TransactionContext = createContext();

const DEFAULT_WALLETS = [
  { id: 'cash', name: 'Cash', icon: '💵', color: '#10b981', balance: 500000 },
  { id: 'bank', name: 'Bank BCA', icon: '🏦', color: '#6366f1', balance: 3000000 },
  { id: 'gopay', name: 'GoPay', icon: '💳', color: '#00aed6', balance: 200000 },
];

export function TransactionProvider({ children }) {
  const { user } = useAuth();
  const isInitialLoad = useRef(true);

  // --- States ---
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('smart_transactions_react');
    return saved ? JSON.parse(saved) : [];
  });

  const [wallets, setWallets] = useState(() => {
    const saved = localStorage.getItem('smart_wallets');
    return saved ? JSON.parse(saved) : DEFAULT_WALLETS;
  });
  
  const [monthlyBudget, setMonthlyBudget] = useState(() => {
    const saved = localStorage.getItem('smart_budget');
    return saved ? parseInt(saved, 10) : 5000000;
  });

  const [aiApiKey, setAiApiKey] = useState(() => {
    return localStorage.getItem('smart_ai_api_key') || '';
  });

  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('smart_goals');
    return saved ? JSON.parse(saved) : [];
  });

  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('smart_profile');
    return saved ? JSON.parse(saved) : { name: 'Iqbal Muwafa', avatar: 'https://ui-avatars.com/api/?name=Iqbal+Muwafa&background=random' };
  });

  const [customCategories, setCustomCategories] = useState(() => {
    const saved = localStorage.getItem('smart_categories');
    return saved ? JSON.parse(saved) : [];
  });

  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle' | 'syncing' | 'synced' | 'error'

  const [recurringItems, setRecurringItems] = useState(() => {
    const saved = localStorage.getItem('smart_recurring');
    return saved ? JSON.parse(saved) : [];
  });

  const [onboardingComplete, setOnboardingComplete] = useState(() => {
    return localStorage.getItem('smart_onboarding_done') === 'true';
  });

  const [isGuest, setIsGuest] = useState(() => {
    return localStorage.getItem('smart_is_guest') === 'true';
  });

  // --- Initial Data Pull from Cloud on Login ---
  useEffect(() => {
    if (user) {
      const fetchCloudData = async () => {
        setSyncStatus('syncing');
        try {
          const dbRef = ref(db);
          const snapshot = await get(child(dbRef, `usersData/${user.uid}`));
          
          if (snapshot.exists()) {
            const cloudData = snapshot.val();
            
            // CONFLICT HANDLING LOGIC
            if (transactions.length > 0 && cloudData.transactions && cloudData.transactions.length > 0) {
               smartMerge(cloudData);
               alert('Neymon menemukan data di Cloud & Lokal. Kami telah menggabungkan keduanya agar tetap lengkap! 🪄');
            } else {
               if (cloudData.transactions) setTransactions(cloudData.transactions);
               if (cloudData.wallets) setWallets(cloudData.wallets);
               if (cloudData.monthlyBudget) setMonthlyBudget(cloudData.monthlyBudget);
               if (cloudData.goals) setGoals(cloudData.goals);
               if (cloudData.userProfile) setUserProfile(cloudData.userProfile);
               if (cloudData.customCategories) setCustomCategories(cloudData.customCategories);
               if (cloudData.recurringItems) setRecurringItems(cloudData.recurringItems);
            }
            setOnboardingComplete(true);
            setIsGuest(false);
          } else {
            // New cloud user, if they have local data, it will be synced by the effect
          }
          setSyncStatus('synced');
        } catch (error) {
          console.error("Gagal menarik data:", error);
          setSyncStatus('error');
        }
      };
      fetchCloudData();
    }
  }, [user]);

  // --- Smart Merge Function ---
  const smartMerge = (cloudData) => {
    // 1. Merge Transactions by ID (deduplicate)
    const localMap = new Map(transactions.map(t => [t.id, t]));
    cloudData.transactions.forEach(t => {
      if (!localMap.has(t.id)) localMap.set(t.id, t);
    });
    const mergedTx = Array.from(localMap.values()).sort((a, b) => new Date(b.date) - new Date(a.date));
    setTransactions(mergedTx);

    // 2. Merge Custom Categories
    const catMap = new Map(customCategories.map(c => [c.id, c]));
    if (cloudData.customCategories) {
      cloudData.customCategories.forEach(c => {
        if (!catMap.has(c.id)) catMap.set(c.id, c);
      });
    }
    setCustomCategories(Array.from(catMap.values()));

    // 3. For Wallets: Cloud wins for simple state
    if (cloudData.wallets) setWallets(cloudData.wallets);
    if (cloudData.monthlyBudget) setMonthlyBudget(cloudData.monthlyBudget);
    if (cloudData.goals) setGoals(cloudData.goals);
    if (cloudData.recurringItems) setRecurringItems(cloudData.recurringItems);
  };

  // --- Sync to Cloud Function ---
  const syncToCloud = async (currentData) => {
    if (!user) return;
    setSyncStatus('syncing');
    try {
      await set(ref(db, 'usersData/' + user.uid), currentData);
      setSyncStatus('synced');
    } catch (error) {
      console.error("Gagal sync ke cloud:", error);
      setSyncStatus('error');
    }
  };

  // --- Effects for Persisting Data ---
  useEffect(() => {
    localStorage.setItem('smart_transactions_react', JSON.stringify(transactions));
    localStorage.setItem('smart_wallets', JSON.stringify(wallets));
    localStorage.setItem('smart_budget', monthlyBudget.toString());
    localStorage.setItem('smart_ai_api_key', aiApiKey);
    localStorage.setItem('smart_goals', JSON.stringify(goals));
    localStorage.setItem('smart_profile', JSON.stringify(userProfile));
    localStorage.setItem('smart_categories', JSON.stringify(customCategories));
    localStorage.setItem('smart_recurring', JSON.stringify(recurringItems));
    localStorage.setItem('smart_onboarding_done', onboardingComplete.toString());
    localStorage.setItem('smart_is_guest', isGuest.toString());

    // Prevent syncing on the very first render to avoid overwriting cloud with old local data before fetching
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    // Debounce cloud sync slightly to avoid too many writes
    const timeoutId = setTimeout(() => {
      syncToCloud({
        transactions,
        wallets,
        monthlyBudget,
        goals,
        userProfile,
        customCategories,
        recurringItems,
        lastUpdated: new Date().toISOString()
      });
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [transactions, wallets, monthlyBudget, aiApiKey, goals, userProfile, customCategories, recurringItems, onboardingComplete, isGuest]);

  const completeOnboarding = (data) => {
    if (data.profile) setUserProfile(data.profile);
    if (data.wallet) setWallets([data.wallet]);
    setOnboardingComplete(true);
  };

  const startAsGuest = () => {
    setIsGuest(true);
    setUserProfile({ 
      name: 'Guest Mode', 
      avatar: `https://ui-avatars.com/api/?name=Guest+Mode&background=71717a&color=fff` 
    });
  };

  // --- Recurring CRUD ---
  const addRecurring = (item) => {
    const newItem = {
      ...item,
      id: Date.now().toString(),
      nextDue: item.date
    };
    setRecurringItems(prev => [...prev, newItem]);
  };

  const deleteRecurring = (id) => {
    if (window.confirm('Hapus tagihan rutin ini?')) {
      setRecurringItems(prev => prev.filter(r => r.id !== id));
    }
  };

  // --- Category CRUD ---
  const addCategory = (cat) => {
    const newCat = {
      ...cat,
      id: 'custom_' + Date.now().toString()
    };
    setCustomCategories(prev => [...prev, newCat]);
  };

  const deleteCategory = (id) => {
    if (window.confirm('Yakin ingin menghapus kategori ini?')) {
      setCustomCategories(prev => prev.filter(c => c.id !== id));
    }
  };


  // --- Wallet CRUD ---
  const addWallet = (wallet) => {
    const newWallet = {
      ...wallet,
      id: Date.now().toString(),
      balance: wallet.balance || 0
    };
    setWallets(prev => [...prev, newWallet]);
  };

  const updateWallet = (id, updates) => {
    setWallets(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
  };

  const deleteWallet = (id) => {
    const hasTx = transactions.some(tx => tx.walletId === id);
    if (hasTx) {
      alert('Dompet ini masih memiliki transaksi. Hapus transaksinya terlebih dahulu.');
      return;
    }
    if (window.confirm('Yakin ingin menghapus dompet ini?')) {
      setWallets(prev => prev.filter(w => w.id !== id));
    }
  };

  // --- Transaction CRUD ---
  const addTransaction = (newTx) => {
    // If undefined, default to expense for backwards compatibility
    const txType = newTx.type || 'expense';
    
    // Update wallet balance
    setWallets(prev => prev.map(w => {
      if (w.id === newTx.walletId) {
        if (txType === 'income') {
          return { ...w, balance: w.balance + newTx.amount };
        } else {
          return { ...w, balance: w.balance - newTx.amount };
        }
      }
      return w;
    }));
    setTransactions(prev => [newTx, ...prev]);
  };

  const deleteTransaction = (id) => {
    if (window.confirm('Yakin ingin menghapus transaksi ini?')) {
      const tx = transactions.find(t => t.id === id);
      if (tx) {
        const txType = tx.type || 'expense';
        // Refund/Deduct wallet balance
        setWallets(prev => prev.map(w => {
          if (w.id === tx.walletId) {
            if (txType === 'income') {
              return { ...w, balance: w.balance - tx.amount };
            } else {
              return { ...w, balance: w.balance + tx.amount };
            }
          }
          return w;
        }));
      }
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  // --- Goals CRUD ---
  const addGoal = (goal) => {
    const newGoal = {
      ...goal,
      id: Date.now().toString(),
      currentAmount: goal.currentAmount || 0
    };
    setGoals(prev => [...prev, newGoal]);
  };

  const deleteGoal = (id) => {
    if (window.confirm('Yakin ingin menghapus tabungan ini? (Uang tidak otomatis kembali ke dompet)')) {
      setGoals(prev => prev.filter(g => g.id !== id));
    }
  };

  const allocateToGoal = (goalId, amount, sourceWalletId) => {
    // Deduct from wallet
    setWallets(prev => prev.map(w => 
      w.id === sourceWalletId 
        ? { ...w, balance: w.balance - amount }
        : w
    ));
    // Add to goal
    setGoals(prev => prev.map(g => 
      g.id === goalId 
        ? { ...g, currentAmount: g.currentAmount + amount }
        : g
    ));
    // Log as a special expense transaction
    const newTx = {
      id: Date.now().toString(),
      note: `Menabung untuk target`,
      amount: amount,
      categoryId: 'other',
      type: 'expense',
      walletId: sourceWalletId,
      date: new Date().toISOString()
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  // --- Budget & Settings ---
  const updateBudget = (amount) => {
    setMonthlyBudget(amount);
  };

  // --- Restore Backup ---
  const restoreData = (parsedData) => {
    if (parsedData.transactions) setTransactions(parsedData.transactions);
    if (parsedData.wallets) setWallets(parsedData.wallets);
    if (parsedData.monthlyBudget) setMonthlyBudget(parsedData.monthlyBudget);
    if (parsedData.aiApiKey !== undefined) setAiApiKey(parsedData.aiApiKey);
    if (parsedData.goals) setGoals(parsedData.goals);
    if (parsedData.userProfile) setUserProfile(parsedData.userProfile);
    if (parsedData.customCategories) setCustomCategories(parsedData.customCategories);
    if (parsedData.recurringItems) setRecurringItems(parsedData.recurringItems);
  };

  // --- Computed Values ---
  // Only calculate expenses for totalExpense
  const totalExpense = transactions
    .filter(tx => (tx.type || 'expense') === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);
    
  const totalIncome = transactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);
    
  const totalWalletBalance = wallets.reduce((sum, w) => sum + w.balance, 0);

  const value = {
    transactions,
    addTransaction,
    deleteTransaction,
    wallets,
    addWallet,
    updateWallet,
    deleteWallet,
    monthlyBudget,
    updateBudget,
    totalExpense,
    totalIncome,
    totalWalletBalance,
    aiApiKey,
    setAiApiKey,
    goals,
    addGoal,
    deleteGoal,
    allocateToGoal,
    restoreData,
    userProfile,
    setUserProfile,
    customCategories,
    addCategory,
    deleteCategory,
    recurringItems,
    addRecurring,
    deleteRecurring,
    onboardingComplete,
    completeOnboarding,
    isGuest,
    startAsGuest,
    syncStatus
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  return useContext(TransactionContext);
}
