import { useState } from 'react'
import { Wallet, Plus, Pencil, Trash2, X, Check } from 'lucide-react'
import { useTransactions } from '../context/TransactionContext'

const WALLET_ICONS = ['💵', '🏦', '💳', '📱', '💰', '🪙', '💎', '🔶', '🟣', '🟢'];
const WALLET_COLORS = ['#10b981', '#6366f1', '#00aed6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#3b82f6'];

export default function WalletManager() {
  const { wallets, addWallet, updateWallet, deleteWallet } = useTransactions();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', icon: '💵', color: '#10b981', balance: '' });

  const resetForm = () => {
    setFormData({ name: '', icon: '💵', color: '#10b981', balance: '' });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Nama dompet tidak boleh kosong!');
      return;
    }
    const balanceNum = parseInt(formData.balance, 10) || 0;

    if (editingId) {
      updateWallet(editingId, { name: formData.name, icon: formData.icon, color: formData.color });
      alert('Dompet berhasil diperbarui!');
    } else {
      addWallet({ name: formData.name, icon: formData.icon, color: formData.color, balance: balanceNum });
      alert('Dompet baru berhasil ditambahkan!');
    }
    resetForm();
  };

  const startEdit = (wallet) => {
    setEditingId(wallet.id);
    setFormData({ name: wallet.name, icon: wallet.icon, color: wallet.color, balance: wallet.balance.toString() });
    setShowForm(true);
  };

  const styles = {
    container: { display: 'flex', flexDirection: 'column', gap: 24 },
    walletGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 },
    walletCard: { padding: 20, borderRadius: 16, display: 'flex', flexDirection: 'column', gap: 12, position: 'relative', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default' },
    walletHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    walletIcon: { fontSize: '1.5rem', width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    walletActions: { display: 'flex', gap: 4 },
    actionBtn: { background: 'transparent', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8, display: 'flex', alignItems: 'center', transition: 'all 0.2s' },
    addCard: { padding: 20, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', border: '2px dashed var(--glass-border)', background: 'rgba(255,255,255,0.02)', color: 'var(--text-secondary)', fontWeight: 500, transition: 'all 0.2s', minHeight: 120 },
    form: { padding: 24, display: 'flex', flexDirection: 'column', gap: 20 },
    inputGroup: { display: 'flex', alignItems: 'center', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--glass-border)', borderRadius: 12, padding: '10px 16px', gap: 12 },
    input: { flex: 1, background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '1rem', outline: 'none' },
    pickerRow: { display: 'flex', gap: 8, flexWrap: 'wrap' },
    pickerItem: { width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid transparent', transition: 'all 0.2s', fontSize: '1.2rem' },
    colorItem: { width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', border: '3px solid transparent', transition: 'all 0.2s' },
    btnRow: { display: 'flex', gap: 12 },
    btnPrimary: { background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem' },
    btnSecondary: { background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--glass-border)', padding: '12px 24px', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', fontWeight: 500, fontSize: '0.95rem' },
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Wallet size={24} color="var(--accent-primary)" /> Dompet Saya
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Kelola semua sumber danamu di satu tempat.</p>
        </div>
      </div>

      {/* Wallet Grid */}
      <div style={styles.walletGrid}>
        {wallets.map(wallet => (
          <div 
            key={wallet.id} 
            className="glass-panel" 
            style={styles.walletCard}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}
          >
            <div style={styles.walletHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{...styles.walletIcon, background: `${wallet.color}20`}}>
                  {wallet.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{wallet.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Dompet</div>
                </div>
              </div>
              <div style={styles.walletActions}>
                <button 
                  style={styles.actionBtn}
                  onClick={() => startEdit(wallet)}
                  onMouseOver={(e) => { e.currentTarget.style.color = 'var(--accent-primary)'; e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.color = ''; e.currentTarget.style.background = 'transparent'; }}
                >
                  <Pencil size={16} color="var(--text-secondary)" />
                </button>
                <button 
                  style={styles.actionBtn}
                  onClick={() => deleteWallet(wallet.id)}
                  onMouseOver={(e) => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.color = ''; e.currentTarget.style.background = 'transparent'; }}
                >
                  <Trash2 size={16} color="var(--text-secondary)" />
                </button>
              </div>
            </div>
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Saldo</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: wallet.color }}>
                Rp {wallet.balance.toLocaleString('id-ID')}
              </div>
            </div>
          </div>
        ))}

        {/* Add New Wallet Button */}
        {!showForm && (
          <div 
            style={styles.addCard}
            onClick={() => { resetForm(); setShowForm(true); }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.color = 'var(--accent-primary)'; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <Plus size={20} /> Tambah Dompet
          </div>
        )}
      </div>

      {/* Form Add/Edit */}
      {showForm && (
        <div className="glass-panel" style={styles.form}>
          <h3>{editingId ? 'Edit Dompet' : 'Tambah Dompet Baru'}</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Name */}
            <div>
              <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Nama Dompet</label>
              <div style={styles.inputGroup}>
                <input 
                  type="text" 
                  style={styles.input}
                  placeholder="Contoh: Dana, OVO, Rekening BRI..."
                  value={formData.name}
                  onChange={(e) => setFormData(p => ({...p, name: e.target.value}))}
                />
              </div>
            </div>

            {/* Balance (only for new) */}
            {!editingId && (
              <div>
                <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Saldo Awal</label>
                <div style={styles.inputGroup}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Rp</span>
                  <input 
                    type="number"
                    style={styles.input}
                    placeholder="0"
                    value={formData.balance}
                    onChange={(e) => setFormData(p => ({...p, balance: e.target.value}))}
                    min="0"
                  />
                </div>
              </div>
            )}

            {/* Icon Picker */}
            <div>
              <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Pilih Ikon</label>
              <div style={styles.pickerRow}>
                {WALLET_ICONS.map(icon => (
                  <div 
                    key={icon}
                    onClick={() => setFormData(p => ({...p, icon}))}
                    style={{
                      ...styles.pickerItem, 
                      background: formData.icon === icon ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
                      borderColor: formData.icon === icon ? 'var(--accent-primary)' : 'transparent'
                    }}
                  >
                    {icon}
                  </div>
                ))}
              </div>
            </div>

            {/* Color Picker */}
            <div>
              <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Pilih Warna</label>
              <div style={styles.pickerRow}>
                {WALLET_COLORS.map(color => (
                  <div 
                    key={color}
                    onClick={() => setFormData(p => ({...p, color}))}
                    style={{
                      ...styles.colorItem, 
                      background: color,
                      borderColor: formData.color === color ? '#fff' : 'transparent',
                      transform: formData.color === color ? 'scale(1.2)' : 'scale(1)'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div style={styles.btnRow}>
              <button type="submit" style={styles.btnPrimary}>
                <Check size={18} /> {editingId ? 'Simpan Perubahan' : 'Tambah Dompet'}
              </button>
              <button type="button" onClick={resetForm} style={styles.btnSecondary}>
                <X size={18} /> Batal
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
