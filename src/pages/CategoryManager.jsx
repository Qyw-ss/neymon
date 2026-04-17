import { useState } from 'react'
import { Plus, Trash2, Tag, Check, X } from 'lucide-react'
import { useTransactions } from '../context/TransactionContext'
import { CATEGORIES } from '../constants/categories'

export default function CategoryManager() {
  const { customCategories, addCategory, deleteCategory } = useTransactions();
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('📦');
  const [newColor, setNewColor] = useState('#6366f1');
  const [newType, setNewType] = useState('expense');

  const popularIcons = ['📦', '🎮', '💡', '🏥', '🎓', '🐕', '🌱', '🎁', '📱', '👔', '🧹', '🛠️'];
  const colors = ['#6366f1', '#ec4899', '#ef4444', '#f59e0b', '#10b981', '#0ea5e9', '#8b5cf6', '#94a3b8'];

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newName) return;
    addCategory({
      name: newName,
      icon: newIcon, // For custom, we store the emoji string
      hex: newColor,
      type: newType,
      isCustom: true
    });
    setNewName('');
    setShowAdd(false);
  };

  const styles = {
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 16 },
    card: (color) => ({
      padding: 16, borderRadius: 16, border: '1px solid var(--glass-border)',
      background: 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column', gap: 12,
      position: 'relative', transition: 'transform 0.2s'
    }),
    iconBox: (color) => ({
      width: 40, height: 40, borderRadius: 10, background: `${color}15`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem'
    }),
    badge: { fontSize: '0.7rem', padding: '2px 8px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', alignSelf: 'flex-start' },
    deleteBtn: { position: 'absolute', top: 12, right: 12, color: 'var(--danger)', background: 'transparent', border: 'none', cursor: 'pointer', opacity: 0.6 },
    addCard: {
      padding: 16, borderRadius: 16, border: '1px dashed var(--glass-border)',
      background: 'rgba(255,255,255,0.01)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', color: 'var(--text-secondary)', gap: 8, height: '100%'
    },
    modal: {
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20
    },
    modalContent: {
      width: '100%', maxWidth: 400, background: '#0f172a', borderRadius: 24, padding: 24,
      border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: 20
    },
    input: { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 12, padding: 12, color: 'white', outline: 'none' }
  };

  return (
    <div style={{ marginTop: 24 }}>
      <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Tag size={20} color="var(--accent-primary)" /> Kelola Kategori
      </h3>

      <div style={styles.grid}>
        {/* Default Categories */}
        {Object.entries(CATEGORIES).map(([id, cat]) => (
          <div key={id} style={styles.card(cat.hex)}>
            <div style={styles.iconBox(cat.hex)}>
               {/* Lucide icons handled in actual usage, here we just show name */}
               <cat.icon size={20} style={{ color: cat.hex }} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{cat.name}</div>
              <div style={styles.badge}>Sistem</div>
            </div>
          </div>
        ))}

        {/* Custom Categories */}
        {customCategories.map(cat => (
          <div key={cat.id} style={styles.card(cat.hex)}>
            <button style={styles.deleteBtn} onClick={() => deleteCategory(cat.id)}>
              <Trash2 size={16} />
            </button>
            <div style={styles.iconBox(cat.hex)}>
              {cat.icon}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{cat.name}</div>
              <div style={{ ...styles.badge, color: 'var(--accent-secondary)' }}>Custom</div>
            </div>
          </div>
        ))}

        <div style={styles.addCard} onClick={() => setShowAdd(true)}>
          <Plus size={20} /> Tambah Kategori
        </div>
      </div>

      {showAdd && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem' }}>Tambah Kategori</h2>
              <X cursor="pointer" onClick={() => setShowAdd(false)} />
            </div>

            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>Nama Kategori</label>
                <input 
                  style={styles.input} placeholder="Misal: Hobi, Zakat..."
                  value={newName} onChange={e => setNewName(e.target.value)}
                  autoFocus
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>Ikon</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {popularIcons.map(icon => (
                    <div 
                      key={icon} 
                      style={{ 
                        fontSize: '1.5rem', cursor: 'pointer', padding: 8, borderRadius: 10,
                        background: newIcon === icon ? 'rgba(255,255,255,0.1)' : 'transparent',
                        border: `1px solid ${newIcon === icon ? 'var(--accent-primary)' : 'transparent'}`
                      }}
                      onClick={() => setNewIcon(icon)}
                    >
                      {icon}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>Warna</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {colors.map(color => (
                    <div 
                      key={color} 
                      style={{ 
                        width: 30, height: 30, borderRadius: '50%', background: color, cursor: 'pointer',
                        border: `2px solid ${newColor === color ? 'white' : 'transparent'}`
                      }}
                      onClick={() => setNewColor(color)}
                    />
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                <button 
                  type="button" 
                  style={{ flex: 1, padding: 12, borderRadius: 12, border: '1px solid var(--glass-border)', background: 'transparent', color: 'white' }}
                  onClick={() => setShowAdd(false)}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  style={{ flex: 1, padding: 12, borderRadius: 12, border: 'none', background: 'var(--accent-primary)', color: 'white', fontWeight: 600 }}
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
