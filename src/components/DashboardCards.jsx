import { CreditCard, TrendingDown, TrendingUp, Sparkles, AlertTriangle } from 'lucide-react'
import { useTransactions } from '../context/TransactionContext'

export default function DashboardCards({ setTab }) {
  const { totalWalletBalance, totalExpense, totalIncome, monthlyBudget, transactions, wallets } = useTransactions();
  
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const currentDay = new Date().getDate();
  
  const dailyAverage = totalExpense / currentDay;
  const projectedTotal = dailyAverage * daysInMonth;

  // Anomaly Detection
  const todayStr = new Date().toLocaleDateString('id-ID');
  const todaysTransactions = transactions.filter(tx => 
    (tx.type || 'expense') === 'expense' && 
    new Date(tx.date).toLocaleDateString('id-ID') === todayStr
  );
  const todayExpense = todaysTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  const historicalAvg = Math.max(dailyAverage, 50000);
  const isAnomaly = todayExpense > (historicalAvg * 2.5) && todayExpense > 100000;

  const styles = {
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 },
    card: { padding: 24, display: 'flex', flexDirection: 'column', gap: 12 },
    walletChip: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 500 },
  };

  return (
    <>
      <div style={styles.grid}>
        {/* Total Wallet Balance */}
        <div className="glass-panel" style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            <h3>Total Saldo</h3>
            <CreditCard size={18} color="var(--accent-primary)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>Rp {totalWalletBalance.toLocaleString('id-ID')}</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {wallets.slice(0, 3).map(w => (
              <span key={w.id} style={{ ...styles.walletChip, background: `${w.color}20`, color: w.color }}>
                {w.icon} {w.name}
              </span>
            ))}
            {wallets.length > 3 && (
              <span style={{ ...styles.walletChip, background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                +{wallets.length - 3} lainnya
              </span>
            )}
          </div>
        </div>

        {/* Total Income */}
        <div className="glass-panel" style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            <h3>Pemasukan Bulan Ini</h3>
            <TrendingUp size={18} color="var(--success)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--success)' }}>
            + Rp {totalIncome.toLocaleString('id-ID')}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {transactions.filter(t => t.type === 'income').length} transaksi masuk
          </div>
        </div>

        {/* Total Expense */}
        <div className="glass-panel" style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            <h3>Pengeluaran Bulan Ini</h3>
            <TrendingDown size={18} color="var(--danger)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--danger)' }}>
            - Rp {totalExpense.toLocaleString('id-ID')}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Budget: Rp {monthlyBudget.toLocaleString('id-ID')}
          </div>
        </div>

        {/* Smart Insights (with Anomaly Detection) */}
        <div className="glass-panel" style={{
          ...styles.card,
          background: isAnomaly ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(245, 158, 11, 0.1))' : undefined,
          borderColor: isAnomaly ? 'rgba(239, 68, 68, 0.4)' : undefined
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            <h3 style={{ fontWeight: 600 }}>Wawasan Cerdas</h3>
            {isAnomaly ? (
              <AlertTriangle className="icon-pulse" size={18} color="var(--danger)" />
            ) : (
              <Sparkles className="icon-pulse" size={18} color="var(--accent-secondary)" />
            )}
          </div>
          <div style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
            {transactions.length === 0 ? (
              <p>Mulai catat transaksi untuk melihat wawasan.</p>
            ) : isAnomaly ? (
              <div>
                <p style={{ color: 'var(--danger)', marginBottom: 4 }}>🚨 <strong>Anomali Terdeteksi!</strong></p>
                <p>Pengeluaran hari ini (<strong>Rp {todayExpense.toLocaleString('id-ID')}</strong>) melonjak jauh di atas rata-rata harianmu.</p>
              </div>
            ) : projectedTotal > monthlyBudget ? (
              <p style={{ color: 'var(--warning)' }}>⚠️ Kecepatan pengeluaranmu berisiko melebihi budget bulan ini.</p>
            ) : (
              <p style={{ color: 'var(--success)' }}>✅ <strong>Bagus!</strong> Pengeluaran terkontrol, rata-rata Rp {Math.round(dailyAverage).toLocaleString('id-ID')}/hari.</p>
            )}
          </div>
        </div>
      </div>

      {/* Mini Wallet Overview Row */}
      <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 4 }}>
        {wallets.map(wallet => (
          <div 
            key={wallet.id}
            className="glass-panel"
            style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, minWidth: 220, cursor: 'pointer', transition: 'transform 0.2s' }}
            onClick={() => setTab && setTab('wallets')}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div style={{ fontSize: '1.5rem', width: 40, height: 40, borderRadius: 10, background: `${wallet.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {wallet.icon}
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{wallet.name}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: wallet.color }}>
                Rp {wallet.balance.toLocaleString('id-ID')}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
