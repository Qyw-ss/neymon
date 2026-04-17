import { useState } from 'react'
import { Target, Plus, Trash2, PiggyBank } from 'lucide-react'
import { useTransactions } from '../context/TransactionContext'

export default function Savings() {
  const { goals, addGoal, deleteGoal, allocateToGoal, wallets } = useTransactions();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGoal, setNewGoal] = useState({ name: '', targetAmount: '', icon: '🎯', color: '#6366f1' });
  const [allocateForm, setAllocateForm] = useState({ goalId: null, amount: '', walletId: '' });

  const GOAL_ICONS = ['🎯', '🏖️', '💻', '🚗', '📱', '🏠', '✈️', '🎓', '💍', '🎁'];

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!newGoal.name || !newGoal.targetAmount) return;
    addGoal({
      name: newGoal.name,
      targetAmount: parseInt(newGoal.targetAmount, 10),
      icon: newGoal.icon,
      color: newGoal.color
    });
    setNewGoal({ name: '', targetAmount: '', icon: '🎯', color: '#6366f1' });
    setShowAddForm(false);
  };

  const handleAllocate = (goalId) => {
    const { amount, walletId } = allocateForm;
    if (!amount || !walletId) { alert('Pilih dompet dan masukkan jumlah!'); return; }
    const wallet = wallets.find(w => w.id === walletId);
    const numAmount = parseInt(amount, 10);
    if (wallet && numAmount > wallet.balance) {
      alert(`Saldo ${wallet.name} tidak cukup!`); return;
    }
    allocateToGoal(goalId, numAmount, walletId);
    setAllocateForm({ goalId: null, amount: '', walletId: '' });
  };

  const styles = {
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 },
    card: { padding: 24, display: 'flex', flexDirection: 'column', gap: 16 },
    progressBar: (percent, color) => ({
      height: 8, borderRadius: 8, background: 'rgba(255,255,255,0.1)',
      position: 'relative', overflow: 'hidden'
    }),
    progressFill: (percent, color) => ({
      position: 'absolute', left: 0, top: 0, bottom: 0,
      width: `${Math.min(percent, 100)}%`, background: color,
      borderRadius: 8, transition: 'width 0.8s ease'
    }),
    input: { width: '100%', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--glass-border)', borderRadius: 10, padding: '10px 14px', color: 'var(--text-primary)', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box' },
    btnPrimary: { background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' },
    btnDanger: { background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <PiggyBank color="var(--accent-primary)" /> Target Tabungan
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 4 }}>
            Sisihkan uang dari dompetmu untuk mimpi-mimpimu.
          </p>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)} style={styles.btnPrimary}>
          <Plus size={18} /> Tambah Target
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="glass-panel" style={styles.card}>
          <h3>🎯 Buat Target Baru</h3>
          <form onSubmit={handleAddGoal} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              style={styles.input} type="text" placeholder="Nama Target (misal: Liburan ke Jepang)"
              value={newGoal.name} onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })} required
            />
            <input
              style={styles.input} type="number" placeholder="Jumlah yang dibutuhkan (Rp)"
              value={newGoal.targetAmount} onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })} required
            />
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Pilih Ikon:</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {GOAL_ICONS.map(icon => (
                  <button
                    key={icon} type="button"
                    style={{ fontSize: '1.4rem', background: newGoal.icon === icon ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)', border: newGoal.icon === icon ? '2px solid var(--accent-primary)' : '1px solid var(--glass-border)', borderRadius: 8, padding: '4px 8px', cursor: 'pointer', transition: 'all 0.2s' }}
                    onClick={() => setNewGoal({ ...newGoal, icon: icon })}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" style={styles.btnPrimary}>Simpan Target</button>
              <button type="button" onClick={() => setShowAddForm(false)} style={{ ...styles.btnPrimary, background: 'rgba(255,255,255,0.05)' }}>Batal</button>
            </div>
          </form>
        </div>
      )}

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <div className="glass-panel" style={{ ...styles.card, alignItems: 'center', padding: 48, textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 8 }}>🎯</div>
          <p style={{ color: 'var(--text-secondary)' }}>Belum ada target tabungan. Mulai buat targetmu sekarang!</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {goals.map(goal => {
            const percent = Math.round((goal.currentAmount / goal.targetAmount) * 100);
            const remaining = goal.targetAmount - goal.currentAmount;
            const isComplete = goal.currentAmount >= goal.targetAmount;

            return (
              <div key={goal.id} className="glass-panel" style={styles.card}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ fontSize: '2rem', width: 48, height: 48, borderRadius: 12, background: `${goal.color || '#6366f1'}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {goal.icon}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1rem' }}>{goal.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Target: Rp {goal.targetAmount.toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => deleteGoal(goal.id)} style={styles.btnDanger}>
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Progress */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 8 }}>
                    <span style={{ color: goal.color || 'var(--accent-primary)', fontWeight: 700 }}>
                      Rp {goal.currentAmount.toLocaleString('id-ID')}
                    </span>
                    <span style={{ color: isComplete ? 'var(--success)' : 'var(--text-secondary)', fontWeight: 600 }}>
                      {isComplete ? '✅ Tercapai!' : `${percent}%`}
                    </span>
                  </div>
                  <div style={styles.progressBar(percent, goal.color)}>
                    <div style={styles.progressFill(percent, goal.color || '#6366f1')} />
                  </div>
                  {!isComplete && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                      Kurang Rp {remaining.toLocaleString('id-ID')} lagi
                    </div>
                  )}
                </div>

                {/* Allocate Form */}
                {!isComplete && (
                  <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: 12 }}>
                    {allocateForm.goalId === goal.id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <select
                          style={{ ...styles.input, cursor: 'pointer' }}
                          value={allocateForm.walletId}
                          onChange={(e) => setAllocateForm({ ...allocateForm, walletId: e.target.value })}
                        >
                          <option value="">Pilih Dompet Sumber</option>
                          {wallets.map(w => (
                            <option key={w.id} value={w.id}>
                              {w.icon} {w.name} (Rp {w.balance.toLocaleString('id-ID')})
                            </option>
                          ))}
                        </select>
                        <input
                          style={styles.input} type="number"
                          placeholder="Jumlah yang disisihkan (Rp)"
                          value={allocateForm.amount}
                          onChange={(e) => setAllocateForm({ ...allocateForm, amount: e.target.value })}
                        />
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => handleAllocate(goal.id)} style={{ ...styles.btnPrimary, flex: 1 }}>Sisihkan</button>
                          <button onClick={() => setAllocateForm({ goalId: null, amount: '', walletId: '' })} style={{ ...styles.btnPrimary, flex: 1, background: 'rgba(255,255,255,0.05)' }}>Batal</button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAllocateForm({ goalId: goal.id, amount: '', walletId: wallets[0]?.id || '' })}
                        style={{ ...styles.btnPrimary, width: '100%' }}
                      >
                        <Target size={16} /> Sisihkan Uang
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
