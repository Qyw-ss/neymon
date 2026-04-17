import { useState } from 'react'
import { User, CreditCard, ChevronRight, Check, Sparkles } from 'lucide-react'
import { useTransactions } from '../context/TransactionContext'
import { useAuth } from '../context/AuthContext'

export default function Onboarding() {
  const { user } = useAuth();
  const { completeOnboarding, isGuest } = useTransactions();
  const [step, setStep] = useState(1);
  
  // Step 1: Profile
  const [name, setName] = useState(user?.displayName || '');
  const [avatar, setAvatar] = useState(user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName || 'Guest'}&background=random`);

  // Step 2: Wallet
  const [walletName, setWalletName] = useState('Dompet Utama');
  const [walletIcon, setWalletIcon] = useState('💵');
  const [walletBalance, setWalletBalance] = useState('0');

  const icons = ['💵', '🏦', '💳', '🐷', '💰', '📱'];

  const handleFinish = () => {
    const onboardingData = {
      profile: { name, avatar },
      wallet: {
        id: 'main',
        name: walletName,
        icon: walletIcon,
        balance: parseFloat(walletBalance) || 0,
        color: '#6366f1'
      }
    };
    completeOnboarding(onboardingData);
  };

  const styles = {
    container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: 'white', padding: 20 },
    card: { width: '100%', maxWidth: 440, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: 24, padding: 32, display: 'flex', flexDirection: 'column', gap: 24 },
    stepIndicator: { display: 'flex', gap: 8, marginBottom: 8 },
    dot: (active) => ({ width: active ? 24 : 8, height: 8, borderRadius: 4, background: active ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)', transition: 'all 0.3s' }),
    input: { width: '100%', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--glass-border)', borderRadius: 12, padding: '12px 16px', color: 'white', fontSize: '1rem', outline: 'none' },
    label: { fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8, display: 'block' },
    btnPrimary: { background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', color: 'white', border: 'none', padding: '14px', borderRadius: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 },
    avatarBox: { width: 80, height: 80, borderRadius: '50%', border: '3px solid var(--accent-primary)', marginBottom: 12, overflow: 'hidden' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.stepIndicator}>
          <div style={styles.dot(step === 1)} />
          <div style={styles.dot(step === 2)} />
        </div>

        {step === 1 ? (
          <>
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: 8 }}>Personalisasi Profil</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {isGuest ? 'Karena Anda masuk sebagai tamu, beri nama profil Anda.' : 'Kami mengambil info dari akun Google Anda.'}
              </p>
            </div>

            <div style={{ alignSelf: 'center', textAlign: 'center' }}>
              <div style={styles.avatarBox}>
                <img src={avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', cursor: 'pointer' }} onClick={() => setAvatar(`https://ui-avatars.com/api/?name=${name}&background=random`)}>Acak Warna</span>
            </div>

            <div>
              <label style={styles.label}>Siapa nama Anda?</label>
              <input style={styles.input} value={name} onChange={e => setName(e.target.value)} placeholder="Nama Anda" />
            </div>

            <button style={styles.btnPrimary} onClick={() => setStep(2)}>
              Lanjut <ChevronRight size={18} />
            </button>
          </>
        ) : (
          <>
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: 8 }}>Dompet Pertama</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Berapa uang yang Anda miliki saat ini?</p>
            </div>

            <div>
              <label style={styles.label}>Nama Dompet (Misal: Tunai/Dompet)</label>
              <input style={styles.input} value={walletName} onChange={e => setWalletName(e.target.value)} />
            </div>

            <div>
              <label style={styles.label}>Pilih Ikon</label>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                {icons.map(icon => (
                  <div 
                    key={icon} 
                    onClick={() => setWalletIcon(icon)}
                    style={{ fontSize: '1.5rem', cursor: 'pointer', padding: 8, borderRadius: 10, background: walletIcon === icon ? 'rgba(99,102,241,0.1)' : 'transparent', border: `1px solid ${walletIcon === icon ? 'var(--accent-primary)' : 'transparent'}` }}
                  >
                    {icon}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label style={styles.label}>Saldo Awal (Rp)</label>
              <input type="number" style={styles.input} value={walletBalance} onChange={e => setWalletBalance(e.target.value)} />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                style={{ flex: 1, background: 'transparent', border: '1px solid var(--glass-border)', color: 'white', borderRadius: 12, fontWeight: 600 }}
                onClick={() => setStep(1)}
              >
                Kembali
              </button>
              <button style={{ ...styles.btnPrimary, flex: 2 }} onClick={handleFinish}>
                Selesai & Masuk <Check size={18} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
