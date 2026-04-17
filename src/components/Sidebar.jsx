import { Wallet, LayoutDashboard, List, Settings, CreditCard, PiggyBank, BarChart2, Clock } from 'lucide-react'

export default function Sidebar({ activeTab, setTab }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'wallets', label: 'Dompet', icon: CreditCard },
    { id: 'transactions', label: 'Transaksi', icon: List },
    { id: 'report', label: 'Laporan', icon: BarChart2 },
    { id: 'recurring', label: 'Tagihan', icon: Clock },
    { id: 'savings', label: 'Tabungan', icon: PiggyBank },
    { id: 'settings', label: 'Pengaturan', icon: Settings }
  ];

  return (
    <nav className="glass-panel app-sidebar">
      <div className="sidebar-header">
        <Wallet color="var(--accent-primary)" />
        <span>Neymon</span>
      </div>
      <div className="sidebar-nav">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <div 
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} /> <span className="nav-label">{item.label}</span>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
