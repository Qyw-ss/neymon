import { useState } from 'react'
import { Bell } from 'lucide-react'
import { TransactionProvider, useTransactions } from './context/TransactionContext'
import Sidebar from './components/Sidebar'
import DashboardCards from './components/DashboardCards'
import ExpenseChart from './components/ExpenseChart'
import SmartInput from './components/SmartInput'
import TransactionList from './components/TransactionList'
import AllTransactions from './pages/AllTransactions'
import Settings from './pages/Settings'
import WalletManager from './pages/WalletManager'
import Savings from './pages/Savings'
import MonthlyReport from './pages/MonthlyReport'
import Recurring from './pages/Recurring'
import Welcome from './pages/Welcome'
import Onboarding from './pages/Onboarding'
import { useAuth } from './context/AuthContext'


const PAGE_META = {
  dashboard:    { title: 'Halo, Iqbal! 👋',       subtitle: 'Berikut ringkasan keuanganmu hari ini.' },
  wallets:      { title: 'Dompet Saya 💰',          subtitle: 'Kelola semua sumber dana dan saldo dompetmu.' },
  transactions: { title: 'Riwayat Transaksi 📋',    subtitle: 'Kelola dan lihat semua pengeluaranmu.' },
  report:       { title: 'Laporan Analitik 📊',     subtitle: 'Lihat ke mana perginya uang Anda bulan ini.' },
  recurring:    { title: 'Tagihan Rutin ⏰',         subtitle: 'Kelola pengeluaran yang berulang secara otomatis.' },
  savings:      { title: 'Target Tabungan 🐷',       subtitle: 'Sisihkan uang dari dompetmu untuk mimpi-mimpimu.' },
  settings:     { title: 'Pengaturan ⚙️',           subtitle: 'Sesuaikan pengaturan Neymon.' },
};



function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user } = useAuth();
  const { userProfile, onboardingComplete, isGuest } = useTransactions();
  
  if (!user && !isGuest) {
    return <Welcome />;
  }

  if (!onboardingComplete) {
    return <Onboarding />;
  }

  const firstName = userProfile.name.split(' ')[0];
  const dynamicMeta = {
    ...PAGE_META,
    dashboard: { 
      title: `Halo, ${firstName}! 👋`, 
      subtitle: PAGE_META.dashboard.subtitle 
    }
  };
  
  const meta = dynamicMeta[activeTab] || dynamicMeta.dashboard;

  const styles = {
    app: { display: 'flex', maxWidth: 1440, margin: '0 auto', padding: 24, gap: 24, minHeight: '100vh', flexDirection: 'column', '@media (min-width: 768px)': { flexDirection: 'row' } },
    main: { flex: 1, display: 'flex', flexDirection: 'column', gap: 24 },
    grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'wallets':
        return <WalletManager />;
      case 'transactions':
        return <AllTransactions />;
      case 'report':
        return <MonthlyReport />;
      case 'recurring':
        return <Recurring />;
      case 'savings':
        return <Savings />;
      case 'settings':
        return <Settings />;
      case 'dashboard':
      default:
        return (
          <>
            <DashboardCards setTab={setActiveTab} />
            
            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
              <button 
                onClick={() => setActiveTab('report')}
                style={{ flex: 'none', padding: '10px 16px', borderRadius: 12, background: 'rgba(99,102,241,0.1)', color: 'var(--accent-primary)', border: '1px solid rgba(99,102,241,0.2)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
              >
                📊 Lihat Laporan
              </button>
              <button 
                onClick={() => setActiveTab('wallets')}
                style={{ flex: 'none', padding: '10px 16px', borderRadius: 12, background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.2)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
              >
                💳 Kelola Dompet
              </button>
              <button 
                onClick={() => setActiveTab('recurring')}
                style={{ flex: 'none', padding: '10px 16px', borderRadius: 12, background: 'rgba(236,72,153,0.1)', color: 'var(--accent-secondary)', border: '1px solid rgba(236,72,153,0.2)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
              >
                ⏰ Bayar Tagihan
              </button>
            </div>

            <ExpenseChart />
            <div style={styles.grid2}>
              <SmartInput />
              <TransactionList setTab={setActiveTab} />
            </div>
          </>
        );
    }
  };

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setTab={setActiveTab} />

      <main className="app-main">
        {isGuest && (
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '8px 16px', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--warning)', fontWeight: 600 }}>⚠️ Anda dalam Mode Tamu. Data hanya disimpan di browser ini.</span>
            <button 
              onClick={() => { window.location.reload(); }} 
              style={{ background: 'var(--warning)', color: '#000', border: 'none', padding: '4px 12px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
            >
              Login Sekarang
            </button>
          </div>
        )}
        {/* Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, marginBottom: 4 }}>{meta.title}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>{meta.subtitle}</p>
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div className="glass-panel" style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Bell size={20} />
            </div>
            <img src={userProfile.avatar} alt="Avatar" style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid var(--accent-primary)', objectFit: 'cover' }} />
          </div>
        </header>

        {/* Dynamic Content */}
        {renderContent()}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <TransactionProvider>
      <AppContent />
    </TransactionProvider>
  )
}
