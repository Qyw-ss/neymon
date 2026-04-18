import { Wallet, Sparkles, Shield, Zap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTransactions } from '../context/TransactionContext'

export default function Welcome() {
  const { loginWithGoogle, loginLoading, loginError } = useAuth();
  const { startAsGuest } = useTransactions();

  const styles = {
    container: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at top right, #1e293b, #0f172a)', color: 'white', padding: 24, textAlign: 'center' },
    hero: { maxWidth: 600, display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center' },
    logoBox: { width: 80, height: 80, borderRadius: 24, background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, boxShadow: '0 20px 40px rgba(99,102,241,0.3)' },
    title: { fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 },
    subtitle: { fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 32 },
    btnGoogle: { width: '100%', maxWidth: 320, padding: '16px 24px', borderRadius: 16, border: 'none', background: loginLoading ? '#ccc' : 'white', color: '#0f172a', fontWeight: 700, fontSize: '1rem', cursor: loginLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, transition: 'transform 0.2s', boxShadow: '0 10px 20px rgba(0,0,0,0.1)', opacity: loginLoading ? 0.7 : 1 },
    btnGuest: { background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', padding: '12px 24px', borderRadius: 12, cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, transition: 'all 0.2s' },
    features: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24, marginTop: 64, width: '100%', maxWidth: 900 },
    featCard: { padding: 24, borderRadius: 20, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', textAlign: 'left' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <div style={styles.logoBox}>
          <Wallet size={40} color="white" />
        </div>
        <h1 style={styles.title}>Neymon</h1>
        <p style={styles.subtitle}>
          Kelola keuangan pribadi dengan cerdas, otomatis, dan aman. 
          Smart Finance Tracker yang dirancang untuk gaya hidup modern.
        </p>

        <button 
          style={styles.btnGoogle} 
          onClick={loginWithGoogle}
          disabled={loginLoading}
        >
          {loginLoading ? (
            <>
              <div style={{ width: 18, height: 18, border: '2px solid #0f172a', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              Menghubungkan...
            </>
          ) : (
            <>
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="G" style={{ width: 20 }} />
              Masuk dengan Google
            </>
          )}
        </button>

        {loginError && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '10px 16px', maxWidth: 320, fontSize: '0.85rem', color: '#fca5a5', textAlign: 'left', lineHeight: 1.5 }}>
            ⚠️ {loginError}
          </div>
        )}

        <div style={{ marginTop: 12 }}>
          <button 
            style={styles.btnGuest}
            onClick={startAsGuest}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = 'white'; e.currentTarget.style.color = 'white'; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            Coba sebagai Tamu (Offline Mode)
          </button>
        </div>
      </div>

      <div style={styles.features}>
        <div style={styles.featCard}>
          <Zap size={24} color="var(--accent-primary)" style={{ marginBottom: 12 }} />
          <h3 style={{ marginBottom: 8 }}>Cepat & Ringan</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Teknologi Offline-First membuat pencatatan transaksi secepat kilat tanpa loading.</p>
        </div>
        <div style={styles.featCard}>
          <Shield size={24} color="var(--success)" style={{ marginBottom: 12 }} />
          <h3 style={{ marginBottom: 8 }}>Aman di Cloud</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Sinkronisasi otomatis ke Google Cloud Anda. Ganti perangkat tanpa takut kehilangan data.</p>
        </div>
        <div style={styles.featCard}>
          <Sparkles size={24} color="var(--accent-secondary)" style={{ marginBottom: 12 }} />
          <h3 style={{ marginBottom: 8 }}>Smart AI Input</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Ketik transaksi seperti mengobrol, AI akan mendeteksi kategori dan nominalnya.</p>
        </div>
      </div>

      <div style={{ marginTop: 64, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        © 2026 Neymon Finance Tracker. Dibuat dengan ❤️ untuk kemudahan finansial.
      </div>
    </div>
  );
}
