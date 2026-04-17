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

const PAGE_META = {
  dashboard:    { title: 'Halo, Iqbal! 👋',       subtitle: 'Berikut ringkasan keuanganmu hari ini.' },
  wallets:      { title: 'Dompet Saya 💰',          subtitle: 'Kelola semua sumber dana dan saldo dompetmu.' },
  transactions: { title: 'Riwayat Transaksi 📋',    subtitle: 'Kelola dan lihat semua pengeluaranmu.' },
  savings:      { title: 'Target Tabungan 🐷',       subtitle: 'Sisihkan uang dari dompetmu untuk mimpi-mimpimu.' },
  settings:     { title: 'Pengaturan ⚙️',           subtitle: 'Sesuaikan pengaturan Neymon.' },
};



function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const meta = PAGE_META[activeTab] || PAGE_META.dashboard;

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
      case 'savings':
        return <Savings />;
      case 'settings':
        return <Settings />;
      case 'dashboard':
      default:
        return (
          <>
            <DashboardCards setTab={setActiveTab} />
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
            <img src="https://ui-avatars.com/api/?name=Iqbal+Muwafa&background=random" alt="Avatar" style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid var(--accent-primary)' }} />
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
