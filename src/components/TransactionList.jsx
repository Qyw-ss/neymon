import { Trash2 } from 'lucide-react'
import { useTransactions } from '../context/TransactionContext'
import { CATEGORIES, FALLBACK_CATEGORY } from '../constants/categories'

export default function TransactionList({ setTab }) {
  const { transactions, deleteTransaction, wallets } = useTransactions();

  const getWallet = (walletId) => wallets.find(w => w.id === walletId);

  const styles = {
    card: { padding: 24, display: 'flex', flexDirection: 'column', gap: 16 },
    txItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 12, background: 'rgba(255, 255, 255, 0.03)', marginBottom: 8 },
    btnIcon: { background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }
  };

  return (
    <div className="glass-panel" style={styles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h3>Transaksi Terakhir</h3>
        <span 
          onClick={() => setTab('transactions')}
          style={{ color: 'var(--accent-primary)', fontSize: '0.875rem', cursor: 'pointer', fontWeight: 500 }}
        >
          Lihat Semua
        </span>
      </div>
      
      <div>
        {transactions.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 24, fontSize: '0.9rem' }}>Belum ada transaksi.</div>
        ) : (
          transactions.slice(0, 5).map(tx => {
            const cat = CATEGORIES[tx.categoryId] || FALLBACK_CATEGORY;
            const Icon = cat.icon;
            const wallet = getWallet(tx.walletId);
            const dateStr = new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
            
            return (
              <div key={tx.id} style={styles.txItem}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={20} className={cat.color} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{tx.note}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {dateStr} • {cat.name}
                      {wallet && (
                        <span style={{ marginLeft: 6, padding: '1px 6px', borderRadius: 6, background: `${wallet.color}15`, color: wallet.color, fontSize: '0.7rem' }}>
                          {wallet.icon} {wallet.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontWeight: 600 }}>- Rp {tx.amount.toLocaleString('id-ID')}</div>
                  <button 
                    onClick={() => deleteTransaction(tx.id)}
                    style={styles.btnIcon}
                    onMouseOver={(e) => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}
                    title="Hapus Transaksi"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
