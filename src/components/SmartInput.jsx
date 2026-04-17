import { useState, useEffect } from 'react'
import { Bot, Send, ChevronDown, Loader2, Sparkles, TrendingDown, TrendingUp, Calendar, Smile, Edit3 } from 'lucide-react'
import { useTransactions } from '../context/TransactionContext'
import { parseSmartInputAsync } from '../utils/nlp'
import { CATEGORIES, FALLBACK_CATEGORY } from '../constants/categories'

export default function SmartInput() {
  const { addTransaction, wallets, aiApiKey, customCategories } = useTransactions();
  const [activeMode, setActiveMode] = useState('smart'); // 'smart' | 'manual'
  
  // Smart Mode States
  const [inputVal, setInputVal] = useState('');
  const [parsedPreview, setParsedPreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Manual Mode States
  const [manualAmount, setManualAmount] = useState('');
  const [manualNote, setManualNote] = useState('');
  const [manualCategory, setManualCategory] = useState('other');
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualMood, setManualMood] = useState(null);

  const [selectedWalletId, setSelectedWalletId] = useState('');
  const [showWalletPicker, setShowWalletPicker] = useState(false);
  
  // Manual type override (used for both modes)
  const [manualType, setManualType] = useState(null); // null = auto-detect

  const moods = [
    { emoji: '😊', label: 'Senang' },
    { emoji: '😔', label: 'Sedih' },
    { emoji: '😡', label: 'Marah' },
    { emoji: '😴', label: 'Bosan' },
    { emoji: '🎉', label: 'Pesta' }
  ];

  // Default to first wallet
  useEffect(() => {
    if (wallets.length > 0 && !selectedWalletId) {
      setSelectedWalletId(wallets[0].id);
    }
  }, [wallets, selectedWalletId]);

  // Smart Mode Processing
  useEffect(() => {
    if (activeMode !== 'smart') return;
    let isCancelled = false;
    
    const processInput = async () => {
      if (inputVal.trim() === '') {
        setParsedPreview(null);
        setIsProcessing(false);
        return;
      }
      setIsProcessing(true);
      const parsed = await parseSmartInputAsync(inputVal, aiApiKey);
      
      if (!isCancelled) {
        setParsedPreview(parsed);
        setIsProcessing(false);
      }
    };

    const timeoutId = setTimeout(processInput, 1500);
    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [inputVal, aiApiKey, activeMode]);

  const selectedWallet = wallets.find(w => w.id === selectedWalletId);
  const isIncome = manualType === 'income' || (manualType === null && (activeMode === 'smart' ? parsedPreview?.type === 'income' : false));

  const handleSmartSubmit = (e) => {
    e.preventDefault();
    if (!parsedPreview) return;
    if (!selectedWalletId) { alert("Pilih dompet!"); return; }
    
    const newTx = {
      id: Date.now().toString(),
      note: parsedPreview.note,
      amount: parsedPreview.amount,
      categoryId: parsedPreview.category.id || (isIncome ? 'salary' : 'other'),
      type: manualType || parsedPreview.type,
      walletId: selectedWalletId,
      date: new Date().toISOString(),
      isAi: true
    };

    addTransaction(newTx);
    setInputVal('');
    setParsedPreview(null);
    setManualType(null);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(manualAmount);
    if (!amount || amount <= 0) { alert("Masukkan jumlah yang valid!"); return; }
    if (!manualNote) { alert("Masukkan catatan!"); return; }
    if (!selectedWalletId) { alert("Pilih dompet!"); return; }

    const newTx = {
      id: Date.now().toString(),
      note: manualNote,
      amount: amount,
      categoryId: manualCategory,
      type: manualType || 'expense',
      walletId: selectedWalletId,
      date: new Date(manualDate).toISOString(),
      mood: manualMood,
      isAi: false
    };

    addTransaction(newTx);
    // Reset manual form
    setManualAmount('');
    setManualNote('');
    setManualMood(null);
    setManualType(null);
    alert("Transaksi berhasil dicatat!");
  };

  const styles = {
    card: { padding: 24, display: 'flex', flexDirection: 'column', gap: 20 },
    tabGroup: { display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 4, marginBottom: 8 },
    tabBtn: (active) => ({
      flex: 1, padding: '10px', borderRadius: 10, border: 'none',
      background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
      color: active ? 'white' : 'var(--text-secondary)',
      cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
    }),
    gridCategories: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 8 },
    catBtn: (active, color) => ({
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '12px 8px',
      borderRadius: 12, border: `2px solid ${active ? color : 'transparent'}`,
      background: active ? `${color}15` : 'rgba(255,255,255,0.03)',
      cursor: 'pointer', transition: 'all 0.2s'
    }),
    moodGroup: { display: 'flex', justifyContent: 'space-between', marginTop: 8, gap: 8 },
    moodBtn: (active) => ({
      flex: 1, fontSize: '1.5rem', padding: 8, borderRadius: 12, border: `2px solid ${active ? 'var(--accent-primary)' : 'transparent'}`,
      background: active ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.03)',
      cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center'
    }),
    inputGroup: { display: 'flex', alignItems: 'center', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--glass-border)', borderRadius: 12, padding: '12px 16px', gap: 12 },
    input: { flex: 1, background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '1rem', outline: 'none' },
    label: { fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' },
    walletBtn: { display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderRadius: 12, border: '1px solid var(--glass-border)', background: 'rgba(15, 23, 42, 0.6)', cursor: 'pointer', color: 'var(--text-primary)', transition: 'all 0.2s', width: '100%' },
    toggleGroup: { display: 'flex', gap: 8, flexWrap: 'wrap' },
    toggleBtn: (active, color) => ({
      flex: '1 1 auto', minWidth: 120, padding: '10px 12px', borderRadius: 10, border: `1px solid ${active ? color : 'var(--glass-border)'}`,
      background: active ? `${color}20` : 'transparent', color: active ? color : 'var(--text-secondary)',
      cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s'
    }),
    btnSubmit: { background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', color: 'white', border: 'none', padding: '14px', borderRadius: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 10 }
  };

  return (
    <div className="glass-panel" style={styles.card}>
      {/* Mode Switcher */}
      <div style={styles.tabGroup}>
        <button style={styles.tabBtn(activeMode === 'smart')} onClick={() => setActiveMode('smart')}>
          <Bot size={16} /> Smart AI
        </button>
        <button style={styles.tabBtn(activeMode === 'manual')} onClick={() => setActiveMode('manual')}>
          <Edit3 size={16} /> Manual
        </button>
      </div>

      {/* Common: Type Toggle */}
      <div style={styles.toggleGroup}>
        <button
          type="button"
          style={styles.toggleBtn(manualType === 'expense' || (manualType === null && (activeMode === 'smart' ? !isIncome : true)), 'var(--danger)')}
          onClick={() => setManualType('expense')}
        >
          <TrendingDown size={16} /> Pengeluaran
        </button>
        <button
          type="button"
          style={styles.toggleBtn(manualType === 'income' || (manualType === null && (activeMode === 'smart' ? isIncome : false)), 'var(--success)')}
          onClick={() => setManualType('income')}
        >
          <TrendingUp size={16} /> Pemasukan
        </button>
      </div>

      {activeMode === 'smart' ? (
        <>
          <div style={styles.walletSelector}>
            <label style={styles.label}>Ke/Dari Dompet:</label>
            <div style={styles.walletBtn} onClick={() => setShowWalletPicker(!showWalletPicker)}>
              {selectedWallet ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, flexWrap: 'wrap' }}>
                  <span>{selectedWallet.icon} {selectedWallet.name}</span>
                  <span style={{ marginLeft: 'auto', fontWeight: 700, color: selectedWallet.color }}>Rp {selectedWallet.balance.toLocaleString('id-ID')}</span>
                </div>
              ) : <span>Pilih Dompet...</span>}
              <ChevronDown size={16} />
            </div>
            {showWalletPicker && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#1e293b', borderRadius: 12, padding: 8, zIndex: 100, border: '1px solid var(--glass-border)' }}>
                {wallets.map(w => (
                  <div key={w.id} style={{ padding: 10, cursor: 'pointer' }} onClick={() => { setSelectedWalletId(w.id); setShowWalletPicker(false); }}>
                    {w.icon} {w.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleSmartSubmit} style={styles.inputGroup}>
            {isProcessing ? <Loader2 size={20} className="icon-pulse" /> : <Bot size={20} color="var(--accent-secondary)" />}
            <input 
              style={styles.input} placeholder="Ketik transaksi..." value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
            />
            <button type="submit" disabled={!parsedPreview} style={{ background: 'var(--accent-primary)', border: 'none', padding: 8, borderRadius: 8, color: 'white', opacity: parsedPreview ? 1 : 0.5 }}>
              <Send size={18} />
            </button>
          </form>

          {parsedPreview && (
            <div style={{ padding: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 8, fontSize: '0.85rem' }}>
              <Sparkles size={14} color="var(--accent-secondary)" /> {parsedPreview.note} - <strong>Rp {parsedPreview.amount.toLocaleString('id-ID')}</strong>
            </div>
          )}
        </>
      ) : (
        <form onSubmit={handleManualSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={styles.label}>Jumlah (Rp)</label>
            <div style={styles.inputGroup}>
              <span style={{ fontWeight: 700 }}>Rp</span>
              <input 
                type="number" style={styles.input} placeholder="0" 
                value={manualAmount} onChange={(e) => setManualAmount(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label style={styles.label}>Catatan</label>
            <div style={styles.inputGroup}>
              <input 
                type="text" style={styles.input} placeholder="Beli apa?" 
                value={manualNote} onChange={(e) => setManualNote(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label style={styles.label}>Kategori</label>
            <div style={styles.gridCategories}>
              {Object.entries(CATEGORIES).map(([id, cat]) => {
                const Icon = cat.icon;
                return (
                  <div 
                    key={id} 
                    style={styles.catBtn(manualCategory === id, cat.hex)}
                    onClick={() => setManualCategory(id)}
                  >
                    <Icon size={20} style={{ color: cat.hex }} />
                    <span style={{ fontSize: '0.65rem', fontWeight: 600, textAlign: 'center' }}>{cat.name.split(' ')[0]}</span>
                  </div>
                );
              })}
              {/* Custom Categories */}
              {customCategories.map(cat => (
                <div 
                  key={cat.id} 
                  style={styles.catBtn(manualCategory === cat.id, cat.hex)}
                  onClick={() => setManualCategory(cat.id)}
                >
                  <span style={{ fontSize: '1.2rem' }}>{cat.icon}</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: 600, textAlign: 'center' }}>{cat.name.split(' ')[0]}</span>
                </div>
              ))}
              <div 
                style={styles.catBtn(manualCategory === 'other', '#94a3b8')}
                onClick={() => setManualCategory('other')}
              >
                <TrendingUp size={20} color="#94a3b8" />
                <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>Lainnya</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Dompet</label>
              <select 
                style={{ ...styles.walletBtn, appearance: 'none' }}
                value={selectedWalletId} onChange={(e) => setSelectedWalletId(e.target.value)}
              >
                {wallets.map(w => <option key={w.id} value={w.id}>{w.icon} {w.name}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Tanggal</label>
              <div style={styles.inputGroup}>
                <Calendar size={16} />
                <input 
                  type="date" style={{ ...styles.input, fontSize: '0.85rem' }} 
                  value={manualDate} onChange={(e) => setManualDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <label style={styles.label}>Gimana perasaanmu? (Mood)</label>
            <div style={styles.moodGroup}>
              {moods.map(m => (
                <div 
                  key={m.emoji} 
                  style={styles.moodBtn(manualMood === m.emoji)}
                  onClick={() => setManualMood(m.emoji)}
                  title={m.label}
                >
                  {m.emoji}
                </div>
              ))}
            </div>
          </div>

          <button type="submit" style={styles.btnSubmit}>
            <Send size={18} /> Simpan Transaksi
          </button>
        </form>
      )}
    </div>
  );
}
