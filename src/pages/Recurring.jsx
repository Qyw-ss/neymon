import { useState } from 'react'
import { Calendar, Plus, Trash2, Clock, CheckCircle2, AlertCircle, X } from 'lucide-react'
import { useTransactions } from '../context/TransactionContext'
import { CATEGORIES, FALLBACK_CATEGORY } from '../constants/categories'

export default function Recurring() {
  const { recurringItems, addRecurring, deleteRecurring, wallets, customCategories, addTransaction } = useTransactions();
  const [showAdd, setShowAdd] = useState(false);
  
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('other');
  const [walletId, setWalletId] = useState('');
  const [interval, setInterval] = useState('monthly'); // 'monthly' | 'weekly'
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!name || !amount || !walletId) return;
    addRecurring({
      name,
      amount: parseFloat(amount),
      categoryId,
      walletId,
      interval,
      date: startDate,
      status: 'active'
    });
    setName('');
    setAmount('');
    setShowAdd(false);
  };

  const handlePayNow = (item) => {
    if (window.confirm(`Bayar "${item.name}" sekarang?`)) {
      addTransaction({
        id: Date.now().toString(),
        note: `Tagihan: ${item.name}`,
        amount: item.amount,
        categoryId: item.categoryId,
        walletId: item.walletId,
        date: new Date().toISOString(),
        type: 'expense',
        isRecurring: true
      });
      alert('Berhasil dibayar!');
    }
  };

  const styles = {
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 },
    card: { padding: 20, display: 'flex', flexDirection: 'column', gap: 16, position: 'relative' },
    badge: (type) => ({
      fontSize: '0.7rem', padding: '4px 8px', borderRadius: 8,
      background: type === 'monthly' ? 'rgba(99,102,241,0.1)' : 'rgba(236,72,153,0.1)',
      color: type === 'monthly' ? 'var(--accent-primary)' : 'var(--accent-secondary)',
      fontWeight: 700, textTransform: 'uppercase'
    }),
    modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 },
    modalContent: { width: '100%', maxWidth: 400, background: '#0f172a', borderRadius: 24, padding: 24, border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: 20 },
    input: { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 12, padding: 12, color: 'white' }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ marginBottom: 4 }}>Tagihan Rutin</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Otomatiskan pencatatan pengeluaran rutinmu.</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          style={{ background: 'var(--accent-primary)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
        >
          <Plus size={20} /> Tambah Rutin
        </button>
      </div>

      <div style={styles.grid}>
        {recurringItems.length === 0 ? (
          <div className="glass-panel" style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)', gridColumn: '1 / -1' }}>
            <Clock size={48} style={{ marginBottom: 16, opacity: 0.2 }} />
            <p>Belum ada tagihan rutin yang terdaftar.</p>
          </div>
        ) : (
          recurringItems.map(item => {
            const cat = CATEGORIES[item.categoryId] || customCategories.find(c => c.id === item.categoryId) || FALLBACK_CATEGORY;
            const wallet = wallets.find(w => w.id === item.walletId);
            return (
              <div key={item.id} className="glass-panel" style={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       {typeof cat.icon === 'string' ? cat.icon : <cat.icon size={20} className={cat.color} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700 }}>{item.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{cat.name} • {wallet?.name || 'Unknown'}</div>
                    </div>
                  </div>
                  <div style={styles.badge(item.interval)}>{item.interval === 'monthly' ? 'Bulanan' : 'Mingguan'}</div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                  <div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>Rp {item.amount.toLocaleString('id-ID')}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={12} /> Jatuh tempo berikutnya: {new Date(item.nextDue).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button 
                      onClick={() => handlePayNow(item)}
                      style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', border: 'none', padding: '8px 12px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Bayar
                    </button>
                    <button 
                      onClick={() => deleteRecurring(item.id)}
                      style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: 'none', padding: 8, borderRadius: 8, cursor: 'pointer' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showAdd && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <h2 style={{ fontSize: '1.25rem' }}>Tambah Tagihan Rutin</h2>
               <X cursor="pointer" onClick={() => setShowAdd(false)} />
             </div>
             <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Nama Tagihan</label>
                  <input style={styles.input} placeholder="Misal: Netflix, Listrik..." value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Jumlah (Rp)</label>
                  <input type="number" style={styles.input} placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} />
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Frekuensi</label>
                    <select style={styles.input} value={interval} onChange={e => setInterval(e.target.value)}>
                      <option value="monthly">Bulanan</option>
                      <option value="weekly">Mingguan</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Dompet</label>
                    <select style={styles.input} value={walletId} onChange={e => setWalletId(e.target.value)}>
                      <option value="">Pilih...</option>
                      {wallets.map(w => <option key={w.id} value={w.id}>{w.icon} {w.name}</option>)}
                    </select>
                  </div>
                </div>
                <button type="submit" style={{ background: 'var(--accent-primary)', color: 'white', border: 'none', padding: 14, borderRadius: 12, fontWeight: 700, marginTop: 10 }}>
                   Simpan Tagihan
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
