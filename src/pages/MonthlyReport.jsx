import { useState, useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Calendar, TrendingUp, TrendingDown, Heart, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTransactions } from '../context/TransactionContext'
import { CATEGORIES, FALLBACK_CATEGORY } from '../constants/categories'

export default function MonthlyReport() {
  const { transactions, monthlyBudget, customCategories } = useTransactions();
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  const filteredData = useMemo(() => {
    return transactions.filter(tx => {
      const d = new Date(tx.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
  }, [transactions, currentMonth, currentYear]);

  const stats = useMemo(() => {
    const expense = filteredData.filter(tx => (tx.type || 'expense') === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
    const income = filteredData.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
    
    // Category Breakdown
    const categoryMap = {};
    filteredData.filter(tx => (tx.type || 'expense') === 'expense').forEach(tx => {
      const cat = CATEGORIES[tx.categoryId] || customCategories.find(c => c.id === tx.categoryId) || FALLBACK_CATEGORY;
      categoryMap[cat.name] = (categoryMap[cat.name] || 0) + tx.amount;
    });

    const pieData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
    
    // Mood Stats
    const moods = filteredData.map(tx => tx.mood).filter(Boolean);
    const moodCounts = moods.reduce((acc, m) => ({ ...acc, [m]: (acc[m] || 0) + 1 }), {});
    const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    // Financial Health Score (0-100)
    // Formula: (Budget Ratio * 0.4) + (Savings Ratio * 0.4) + (Transaction Count Factor * 0.2)
    const budgetRatio = monthlyBudget > 0 ? Math.max(0, 1 - (expense / monthlyBudget)) : 0.5;
    const savingsRatio = income > 0 ? Math.min(1, (income - expense) / income) : 0;
    const score = Math.round((budgetRatio * 50) + (savingsRatio > 0 ? savingsRatio * 40 : 0) + (filteredData.length > 5 ? 10 : filteredData.length * 2));

    return { expense, income, pieData, topMood, score: Math.min(100, Math.max(0, score)) };
  }, [filteredData, monthlyBudget, customCategories]);

  const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#0ea5e9', '#8b5cf6'];

  const styles = {
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 },
    monthNav: { display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: 12, border: '1px solid var(--glass-border)' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 },
    card: { padding: 24, display: 'flex', flexDirection: 'column', gap: 16 },
    scoreCircle: (score) => ({
      width: 120, height: 120, borderRadius: '50%', border: `8px solid ${score > 70 ? 'var(--success)' : score > 40 ? 'var(--warning)' : 'var(--danger)'}`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 12
    })
  };

  const changeMonth = (dir) => {
    let newMonth = currentMonth + dir;
    let newYear = currentYear;
    if (newMonth < 0) { newMonth = 11; newYear--; }
    if (newMonth > 11) { newMonth = 0; newYear++; }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={styles.header}>
        <div>
          <h2 style={{ marginBottom: 4 }}>Laporan Bulanan</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Analisis mendalam keuangan Anda.</p>
        </div>
        <div style={styles.monthNav}>
          <ChevronLeft cursor="pointer" size={20} onClick={() => changeMonth(-1)} />
          <span style={{ fontWeight: 700, minWidth: 140, textAlign: 'center' }}>{monthNames[currentMonth]} {currentYear}</span>
          <ChevronRight cursor="pointer" size={20} onClick={() => changeMonth(1)} />
        </div>
      </div>

      <div style={styles.grid}>
        {/* Financial Health Score */}
        <div className="glass-panel" style={styles.card}>
          <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Heart size={18} color="var(--danger)" /> Kesehatan Keuangan
          </h3>
          <div style={styles.scoreCircle(stats.score)}>
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats.score}</div>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, opacity: 0.8 }}>SKOR</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              {stats.score > 80 ? 'Sangat Sehat! ✨' : stats.score > 60 ? 'Cukup Baik 👍' : 'Perlu Perhatian ⚠️'}
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {stats.score > 80 ? 'Pertahankan kebiasaan menabungmu!' : 'Coba kurangi pengeluaran non-primer.'}
            </p>
          </div>
        </div>

        {/* Expense vs Income */}
        <div className="glass-panel" style={styles.card}>
          <h3 style={{ fontSize: '1rem' }}>Ringkasan Arus Kas</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: 12, borderRadius: 12, background: 'rgba(16, 185, 129, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem' }}><TrendingUp size={16} color="var(--success)" /> Pemasukan</div>
              <div style={{ fontWeight: 700, color: 'var(--success)' }}>Rp {stats.income.toLocaleString('id-ID')}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: 12, borderRadius: 12, background: 'rgba(239, 68, 68, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem' }}><TrendingDown size={16} color="var(--danger)" /> Pengeluaran</div>
              <div style={{ fontWeight: 700, color: 'var(--danger)' }}>Rp {stats.expense.toLocaleString('id-ID')}</div>
            </div>
            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: 12, display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 600 }}>Selisih (Net)</div>
              <div style={{ fontWeight: 700, color: stats.income >= stats.expense ? 'var(--success)' : 'var(--danger)' }}>
                {stats.income >= stats.expense ? '+' : ''} Rp {(stats.income - stats.expense).toLocaleString('id-ID')}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.grid}>
        {/* Category Breakdown Chart */}
        <div className="glass-panel" style={{ ...styles.card, minHeight: 400 }}>
          <h3 style={{ fontSize: '1rem' }}>Alokasi Pengeluaran</h3>
          {stats.pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.pieData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: '#1e293b', border: '1px solid var(--glass-border)', borderRadius: 12 }}
                  itemStyle={{ color: 'white' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              Tidak ada data pengeluaran bulan ini.
            </div>
          )}
        </div>

        {/* Mood Insights */}
        <div className="glass-panel" style={styles.card}>
          <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={18} color="var(--accent-secondary)" /> Insight Mood
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 16 }}>
             <div style={{ fontSize: '3rem' }}>{stats.topMood === 'N/A' ? '❔' : stats.topMood}</div>
             <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Dominan Mood Bulan Ini</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                  {stats.topMood === '😊' ? 'Sangat Happy!' : 
                   stats.topMood === '😔' ? 'Sering Sedih' : 
                   stats.topMood === '😡' ? 'Sedang Stress' : 
                   stats.topMood === '😴' ? 'Bosan / Flat' : 
                   stats.topMood === '🎉' ? 'Banyak Pesta' : 'Belum ada Mood'}
                </div>
             </div>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {stats.topMood === '😔' || stats.topMood === '😡' ? 
              'Hati-hati, pengeluaranmu cenderung naik saat sedang sedih atau stress. Coba kontrol belanja impulsif!' : 
              'Mood yang stabil membantu pengambilan keputusan keuangan yang lebih bijak.'}
          </p>
        </div>
      </div>
    </div>
  );
}
