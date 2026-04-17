import { useState, useEffect } from 'react'
import { Bot, Send, ChevronDown, Loader2, Sparkles, TrendingDown, TrendingUp } from 'lucide-react'
import { useTransactions } from '../context/TransactionContext'
import { parseSmartInputAsync } from '../utils/nlp'

export default function SmartInput() {
  const { addTransaction, wallets, aiApiKey } = useTransactions();
  const [inputVal, setInputVal] = useState('');
  const [parsedPreview, setParsedPreview] = useState(null);
  const [selectedWalletId, setSelectedWalletId] = useState('');
  const [showWalletPicker, setShowWalletPicker] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  // Manual type override (used when user wants to force income/expense)
  const [manualType, setManualType] = useState(null); // null = auto-detect

  // Default to first wallet
  useEffect(() => {
    if (wallets.length > 0 && !selectedWalletId) {
      setSelectedWalletId(wallets[0].id);
    }
  }, [wallets, selectedWalletId]);

  // Debounced effect for live preview
  useEffect(() => {
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
  }, [inputVal, aiApiKey]);

  const selectedWallet = wallets.find(w => w.id === selectedWalletId);
  
  // Effective type: use manual override if set, else use AI-detected
  const effectiveType = manualType || parsedPreview?.type || 'expense';
  const isIncome = effectiveType === 'income';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!parsedPreview) {
      alert("Harap tunggu AI memproses input Anda, atau format teks tidak dimengerti.");
      return;
    }
    if (!selectedWalletId) {
      alert("Pilih dompet terlebih dahulu!");
      return;
    }
    // Only validate balance for expense
    if (!isIncome && selectedWallet && parsedPreview.amount > selectedWallet.balance) {
      alert(`Saldo ${selectedWallet.name} tidak cukup! (Saldo: Rp ${selectedWallet.balance.toLocaleString('id-ID')})`);
      return;
    }

    const newTx = {
      id: Date.now().toString(),
      note: parsedPreview.note,
      amount: parsedPreview.amount,
      categoryId: parsedPreview.category.id || (isIncome ? 'salary' : 'other'),
      type: effectiveType,
      walletId: selectedWalletId,
      date: new Date().toISOString()
    };

    addTransaction(newTx);
    setInputVal('');
    setParsedPreview(null);
    setManualType(null);
  };

  const styles = {
    card: { padding: 24, display: 'flex', flexDirection: 'column', gap: 16 },
    inputGroup: { display: 'flex', alignItems: 'center', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--glass-border)', borderRadius: 12, padding: '8px 16px', gap: 12, position: 'relative' },
    input: { flex: 1, background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '1rem', outline: 'none' },
    btnPrimary: { background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', color: 'white', border: 'none', width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'opacity 0.2s' },
    walletSelector: { position: 'relative' },
    walletBtn: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12, border: '1px solid var(--glass-border)', background: 'rgba(15, 23, 42, 0.6)', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 500, transition: 'all 0.2s', width: '100%' },
    walletDropdown: { position: 'absolute', top: '110%', left: 0, right: 0, background: 'rgba(30, 41, 59, 0.95)', backdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)', borderRadius: 12, padding: 8, zIndex: 50, boxShadow: '0 12px 40px rgba(0,0,0,0.4)' },
    walletOption: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s' },
    toggleGroup: { display: 'flex', gap: 8 },
    toggleBtn: (active, color) => ({
      flex: 1, padding: '8px 12px', borderRadius: 10, border: `1px solid ${active ? color : 'var(--glass-border)'}`,
      background: active ? `${color}20` : 'transparent', color: active ? color : 'var(--text-secondary)',
      cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s'
    }),
  };

  return (
    <div className="glass-panel" style={styles.card}>
      <div>
        <h3 style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
          Tambah Transaksi
          {aiApiKey && <Sparkles size={16} color="var(--accent-secondary)" title="Powered by Gemini AI" />}
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 16 }}>
          Ketik seperti mengobrol (misal: "gajian 5 juta" atau "bayar gojek 35rb")
        </p>
      </div>

      {/* Tipe Toggle: Pengeluaran / Pemasukan */}
      <div style={styles.toggleGroup}>
        <button
          type="button"
          style={styles.toggleBtn(manualType === null ? !isIncome : manualType === 'expense', 'var(--danger)')}
          onClick={() => setManualType(manualType === 'expense' ? null : 'expense')}
        >
          <TrendingDown size={16} /> Pengeluaran
        </button>
        <button
          type="button"
          style={styles.toggleBtn(manualType === null ? isIncome : manualType === 'income', 'var(--success)')}
          onClick={() => setManualType(manualType === 'income' ? null : 'income')}
        >
          <TrendingUp size={16} /> Pemasukan
        </button>
      </div>

      {/* Wallet Selector */}
      <div style={styles.walletSelector}>
        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
          {isIncome ? 'Diterima ke Dompet:' : 'Dari Dompet:'}
        </label>
        <div style={styles.walletBtn} onClick={() => setShowWalletPicker(!showWalletPicker)}>
          {selectedWallet ? (
            <>
              <span style={{ fontSize: '1.1rem' }}>{selectedWallet.icon}</span>
              <span style={{ flex: 1 }}>{selectedWallet.name}</span>
              <span style={{ fontSize: '0.8rem', color: selectedWallet.color, fontWeight: 600 }}>
                Rp {selectedWallet.balance.toLocaleString('id-ID')}
              </span>
            </>
          ) : (
            <span style={{ color: 'var(--text-secondary)' }}>Pilih Dompet...</span>
          )}
          <ChevronDown size={16} color="var(--text-secondary)" />
        </div>

        {showWalletPicker && (
          <div style={styles.walletDropdown}>
            {wallets.length === 0 ? (
              <div style={{ padding: 12, textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Belum ada dompet.
              </div>
            ) : (
              wallets.map(w => (
                <div
                  key={w.id}
                  style={{ ...styles.walletOption, background: w.id === selectedWalletId ? 'rgba(99,102,241,0.1)' : 'transparent' }}
                  onClick={() => { setSelectedWalletId(w.id); setShowWalletPicker(false); }}
                >
                  <span style={{ fontSize: '1.1rem' }}>{w.icon}</span>
                  <span style={{ flex: 1, fontWeight: 500 }}>{w.name}</span>
                  <span style={{ fontSize: '0.8rem', color: w.color, fontWeight: 600 }}>
                    Rp {w.balance.toLocaleString('id-ID')}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Smart Input */}
      <form onSubmit={handleSubmit} style={{
        ...styles.inputGroup,
        borderColor: isIncome ? 'rgba(16, 185, 129, 0.4)' : 'var(--glass-border)'
      }}>
        {isProcessing ? (
          <Loader2 className="icon-pulse" color="var(--accent-secondary)" size={20} />
        ) : (
          <Bot color={parsedPreview ? (isIncome ? 'var(--success)' : 'var(--danger)') : 'var(--accent-secondary)'} size={20} />
        )}
        <input 
          autoFocus
          type="text" 
          style={styles.input} 
          placeholder={isIncome ? "Contoh: gajian bulan ini 5 juta..." : "Contoh: bayar gojek 35rb..."}
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
        />
        <button 
          type="submit" 
          style={{ ...styles.btnPrimary, opacity: (!parsedPreview || isProcessing) ? 0.5 : 1 }}
          disabled={!parsedPreview || isProcessing}
        >
          <Send size={18} />
        </button>
      </form>
      
      {/* Live Preview */}
      <div style={{ minHeight: 100 }}>
        {isProcessing && !parsedPreview && (
          <div style={{ padding: 12, color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Loader2 size={14} className="icon-pulse" /> AI sedang memahami kalimatmu...
          </div>
        )}

        {parsedPreview && !isProcessing && (
          <div style={{
            padding: 12,
            background: isIncome ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.08)',
            border: `1px solid ${isIncome ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.25)'}`,
            borderRadius: 8, fontSize: '0.875rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <strong>{isIncome ? '💰 Pemasukan Terdeteksi' : '💸 Pengeluaran Terdeteksi'}</strong>
              {parsedPreview.isAi && (
                <span style={{ background: 'var(--accent-primary)', color: 'white', fontSize: '0.65rem', padding: '2px 6px', borderRadius: 10, fontWeight: 'bold' }}>AI</span>
              )}
            </div>
            <div><span style={{ color: 'var(--text-secondary)' }}>Catatan:</span> {parsedPreview.note}</div>
            <div><span style={{ color: 'var(--text-secondary)' }}>Kategori:</span> {parsedPreview.category.name}</div>
            <div style={{ color: isIncome ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold', marginTop: 4 }}>
              {isIncome ? '+' : '-'} Rp {parsedPreview.amount.toLocaleString('id-ID')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
