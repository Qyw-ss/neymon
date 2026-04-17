import { Trash2 } from 'lucide-react'
import { useTransactions } from '../context/TransactionContext'
import { CATEGORIES, FALLBACK_CATEGORY } from '../constants/categories'

export default function AllTransactions() {
  const { transactions, deleteTransaction, wallets } = useTransactions();

  const getWallet = (walletId) => wallets.find(w => w.id === walletId);

  const styles = {
    card: { padding: 24, display: 'flex', flexDirection: 'column', gap: 16 },
    txItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 12, background: 'rgba(255, 255, 255, 0.03)', marginBottom: 12 },
    btnIcon: { background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 8, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }
  };

  return (
    <div className="glass-panel" style={styles.card}>
      <h2 style={{ marginBottom: 16 }}>Semua Transaksi</h2>
      
      {transactions.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 40, fontSize: '1rem' }}>Belum ada riwayat transaksi.</div>
      ) : (
        <div>
          {transactions.map(tx => {
            const cat = CATEGORIES[tx.categoryId] || customCategories.find(c => c.id === tx.categoryId) || FALLBACK_CATEGORY;
            const Icon = cat.icon;
            const wallet = getWallet(tx.walletId);
            const dateStr = new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
            
            return (
              <div key={tx.id} style={styles.txItem}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {typeof Icon === 'string' ? (
                      <span style={{ fontSize: '1.5rem' }}>{Icon}</span>
                    ) : (
                      <Icon size={24} className={cat.color} />
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                      {tx.note}
                      {tx.mood && <span title="Mood">{tx.mood}</span>}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      {dateStr} • {cat.name}
                      {wallet && (
                        <span style={{ padding: '2px 8px', borderRadius: 8, background: `${wallet.color}15`, color: wallet.color, fontSize: '0.75rem', fontWeight: 500 }}>
                          {wallet.icon} {wallet.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>- Rp {tx.amount.toLocaleString('id-ID')}</div>
                  <button 
                    onClick={() => deleteTransaction(tx.id)}
                    style={styles.btnIcon}
                    onMouseOver={(e) => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}
                    title="Hapus Transaksi"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
