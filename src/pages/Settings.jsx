import { useState, useRef } from 'react'
import { Target, Save, Key, Download, Upload, Shield, FileText, Cloud, LogOut } from 'lucide-react'
import { useTransactions } from '../context/TransactionContext'
import { useAuth } from '../context/AuthContext'
import CategoryManager from './CategoryManager'

export default function Settings() {
  const { 
    monthlyBudget, updateBudget, 
    aiApiKey, setAiApiKey, 
    transactions, wallets, goals, 
    restoreData, syncStatus,
    userProfile, setUserProfile
  } = useTransactions();
  
  const { user, loginWithGoogle, logout } = useAuth();
  
  const [budgetInput, setBudgetInput] = useState(monthlyBudget.toString());
  const [apiKeyInput, setApiKeyInput] = useState(aiApiKey || '');
  const [profileName, setProfileName] = useState(userProfile.name);
  const [profileAvatar, setProfileAvatar] = useState(userProfile.avatar);
  const fileInputRef = useRef(null);

  const handleSave = (e) => {
    e.preventDefault();
    const newBudget = parseInt(budgetInput, 10);
    if (isNaN(newBudget) || newBudget < 0) {
      alert('Masukkan angka budget yang valid!');
      return;
    }
    updateBudget(newBudget);
    setAiApiKey(apiKeyInput.trim());
    setUserProfile({ name: profileName, avatar: profileAvatar });
    alert('Pengaturan berhasil diperbarui!');
  };

  const handleExportJSON = () => {
    const data = { transactions, wallets, goals, monthlyBudget, aiApiKey, userProfile };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neymon_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const headers = ['Tanggal', 'Tipe', 'Catatan', 'Kategori', 'Dompet', 'Jumlah (Rp)'];
    const rows = transactions.map(tx => {
      const wallet = wallets.find(w => w.id === tx.walletId);
      return [
        new Date(tx.date).toLocaleDateString('id-ID'),
        tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
        `"${tx.note || '-'}"`,
        tx.categoryId || 'other',
        wallet ? wallet.name : 'Unknown',
        tx.amount
      ].join(',');
    });
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan_neymon_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (window.confirm("Peringatan: Mengembalikan data akan menimpa seluruh data Anda saat ini. Lanjutkan?")) {
          restoreData(parsed);
          alert("Data berhasil dipulihkan!");
          window.location.reload();
        }
      } catch (err) {
        alert("File backup tidak valid atau rusak.");
      }
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  const styles = {
    card: { padding: 24, display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 600 },
    formGroup: { display: 'flex', flexDirection: 'column', gap: 8 },
    inputGroup: { display: 'flex', alignItems: 'center', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--glass-border)', borderRadius: 12, padding: '12px 16px', gap: 12 },
    input: { flex: 1, background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '1.1rem', outline: 'none' },
    btnPrimary: { background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', fontWeight: 600, fontSize: '1rem', alignSelf: 'flex-start' },
    btnSecondary: { background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', padding: '10px 16px', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', fontWeight: 500, fontSize: '0.9rem', flex: 1 },
    sectionBox: { padding: 20, borderRadius: 16, border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column', gap: 16 }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Profile Settings Section */}
      <div className="glass-panel" style={styles.card}>
        <div>
          <h2 style={{ marginBottom: 8 }}>Pengaturan Profil</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Sesuaikan identitas penggunamu di Neymon.</p>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
             <img src={profileAvatar} alt="Preview" style={{ width: 80, height: 80, borderRadius: '50%', border: '3px solid var(--accent-primary)', objectFit: 'cover', background: 'rgba(255,255,255,0.05)' }} />
             <div style={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={styles.formGroup}>
                  <label style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Nama Lengkap</label>
                  <div style={styles.inputGroup}>
                    <input 
                      type="text" style={styles.input} value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                    />
                  </div>
                </div>
                <div style={styles.formGroup}>
                  <label style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>URL Foto Profil</label>
                  <div style={styles.inputGroup}>
                    <input 
                      type="text" style={styles.input} value={profileAvatar}
                      onChange={(e) => setProfileAvatar(e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                </div>
             </div>
          </div>
          
          <button type="submit" style={styles.btnPrimary}>
            <Save size={18} /> Simpan Perubahan Profil
          </button>
        </form>
      </div>

      <div className="glass-panel" style={styles.card}>
        <div>
          <h2 style={{ marginBottom: 8 }}>Pengaturan Aplikasi</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Sesuaikan Neymon dengan kebutuhanmu.</p>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={styles.formGroup}>
            <label style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Target size={18} color="var(--accent-primary)" />
              Target Pengeluaran Bulanan (Budget)
            </label>
            <div style={styles.inputGroup}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Rp</span>
              <input 
                type="number" style={styles.input} value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)} min="0"
              />
            </div>
            <small style={{ color: 'var(--text-secondary)' }}>Aplikasi akan memperingatkan jika kecepatan pengeluaranmu berisiko melewati angka ini.</small>
          </div>

          <div style={styles.formGroup}>
            <label style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Key size={18} color="var(--accent-primary)" />
              Google Gemini API Key (Opsional)
            </label>
            <div style={styles.inputGroup}>
              <input 
                type="password" style={{ ...styles.input, fontSize: '1rem' }}
                value={apiKeyInput} onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="AIzaSyA..."
              />
            </div>
            <small style={{ color: 'var(--text-secondary)' }}>
              Masukkan API Key dari Google AI Studio agar aplikasi ini menjadi sangat pintar.
            </small>
          </div>

          <button type="submit" style={styles.btnPrimary}>
            <Save size={18} /> Simpan Pengaturan
          </button>
        </form>
      </div>

      {/* Data Management Section */}
      <div className="glass-panel" style={styles.card}>
        <div>
          <h2 style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield color="var(--success)" />
            Manajemen Data & Cloud Sync
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>Aplikasi ini mendukung mode offline. Anda bisa menggunakan akun Google untuk sinkronisasi data antar perangkat secara otomatis.</p>
        </div>

        <div style={styles.sectionBox}>
          {/* Cloud Sync Account */}
          <div style={{ paddingBottom: 16, borderBottom: '1px solid var(--glass-border)' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Cloud size={18} color="var(--info)" /> Sinkronisasi Akun
            </h3>
            
            {user ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <img src={user.photoURL} alt="User" style={{ width: 40, height: 40, borderRadius: '50%' }} />
                  <div>
                    <div style={{ fontWeight: 600 }}>{user.displayName}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{user.email}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ fontSize: '0.85rem', color: syncStatus === 'syncing' ? 'var(--warning)' : syncStatus === 'synced' ? 'var(--success)' : 'var(--danger)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: syncStatus === 'syncing' ? 'var(--warning)' : syncStatus === 'synced' ? 'var(--success)' : 'var(--danger)' }} />
                    {syncStatus === 'syncing' ? 'Menyinkronkan...' : syncStatus === 'synced' ? 'Tersinkronisasi' : 'Error Sync'}
                  </div>
                  <button onClick={logout} style={{ ...styles.btnSecondary, color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.3)', padding: '6px 12px', flex: 'none' }}>
                    <LogOut size={16} /> Keluar
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Login untuk mengaktifkan backup otomatis ke Cloud.
                </div>
                <button onClick={loginWithGoogle} style={{ ...styles.btnSecondary, background: 'rgba(255,255,255,0.1)', color: 'white', flex: 'none' }}>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="G" style={{ width: 16 }} />
                  Login dengan Google
                </button>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', paddingTop: 8 }}>
            <button type="button" onClick={handleExportJSON} style={styles.btnSecondary}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            >
              <Download size={18} /> Download Backup (Lokal)
            </button>
            <button type="button" onClick={handleExportCSV} style={{ ...styles.btnSecondary, color: '#10b981', borderColor: 'rgba(16,185,129,0.3)' }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(16,185,129,0.1)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            >
              <FileText size={18} /> Ekspor ke CSV/Excel
            </button>
            <button type="button" onClick={() => fileInputRef.current?.click()} style={styles.btnSecondary}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            >
              <Upload size={18} /> Restore Data
            </button>
            <input 
              type="file" accept=".json" ref={fileInputRef}
              style={{ display: 'none' }} onChange={handleImport}
            />
          </div>
        </div>
      </div>

      <CategoryManager />
    </div>
  );
}
