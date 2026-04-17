import { useState, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';
import { CATEGORIES, FALLBACK_CATEGORY } from '../constants/categories';

export default function ExpenseChart() {
  const { transactions } = useTransactions();
  const [chartType, setChartType] = useState('area'); // 'area' | 'pie'

  // --- Prepare Data for Area Chart (Daily Spending) ---
  const areaData = useMemo(() => {
    // Get all unique dates in the current month up to today
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // Initialize array for all days in month
    const dailyData = Array.from({ length: daysInMonth }, (_, i) => ({
      date: i + 1,
      amount: 0,
      fullDate: new Date(currentYear, currentMonth, i + 1).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
    }));

    // Aggregate transactions
    transactions.forEach(tx => {
      const txDate = new Date(tx.date);
      if (txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
        const dayIdx = txDate.getDate() - 1;
        if (dailyData[dayIdx]) {
          dailyData[dayIdx].amount += tx.amount;
        }
      }
    });

    // Only show data up to the last day that has a transaction, or today
    const lastDayWithTx = Math.max(
      now.getDate(),
      ...transactions
        .filter(tx => new Date(tx.date).getMonth() === currentMonth)
        .map(tx => new Date(tx.date).getDate())
    );

    return dailyData.slice(0, lastDayWithTx);
  }, [transactions]);

  // --- Prepare Data for Pie Chart (Category Spending) ---
  const pieData = useMemo(() => {
    const categoryTotals = {};
    
    transactions.forEach(tx => {
      // Only include this month
      const txDate = new Date(tx.date);
      const now = new Date();
      if (txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear()) {
        const catId = tx.categoryId || 'other';
        categoryTotals[catId] = (categoryTotals[catId] || 0) + tx.amount;
      }
    });

    return Object.keys(categoryTotals).map(catId => {
      const catInfo = CATEGORIES[catId] || FALLBACK_CATEGORY;
      return {
        name: catInfo.name,
        value: categoryTotals[catId],
        color: catInfo.hex || '#cbd5e1'
      };
    }).sort((a, b) => b.value - a.value); // Sort descending
  }, [transactions]);

  // Custom Tooltip for Area Chart
  const CustomTooltipArea = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid var(--glass-border)', padding: '12px 16px', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 4 }}>{payload[0].payload.fullDate}</p>
          <p style={{ color: 'var(--accent-primary)', fontWeight: 700, fontSize: '1.1rem', margin: 0 }}>
            Rp {payload[0].value.toLocaleString('id-ID')}
          </p>
        </div>
      );
    }
    return null;
  };

  const styles = {
    card: { padding: 24, display: 'flex', flexDirection: 'column', gap: 20 },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    title: { display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.1rem', fontWeight: 600 },
    toggleGroup: { display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 4 },
    toggleBtn: { border: 'none', background: 'transparent', padding: '6px 12px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', transition: 'all 0.2s' },
    activeToggle: { background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)' }
  };

  return (
    <div className="glass-panel" style={styles.card}>
      <div style={styles.header}>
        <div style={styles.title}>
          {chartType === 'area' ? <BarChart3 color="var(--accent-primary)" size={20} /> : <PieChartIcon color="var(--accent-primary)" size={20} />}
          Analitik Bulan Ini
        </div>
        
        <div style={styles.toggleGroup}>
          <button 
            style={{...styles.toggleBtn, ...(chartType === 'area' ? styles.activeToggle : {})}}
            onClick={() => setChartType('area')}
          >
            Harian
          </button>
          <button 
            style={{...styles.toggleBtn, ...(chartType === 'pie' ? styles.activeToggle : {})}}
            onClick={() => setChartType('pie')}
          >
            Kategori
          </button>
        </div>
      </div>

      <div style={{ width: '100%', height: 280 }}>
        {transactions.length === 0 ? (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Belum ada data transaksi bulan ini.
          </div>
        ) : chartType === 'area' ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={areaData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                tickFormatter={(val) => `Rp${val / 1000}k`}
                dx={-10}
              />
              <Tooltip content={<CustomTooltipArea />} />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="var(--accent-primary)" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorAmount)" 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
                animationDuration={1000}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => `Rp ${value.toLocaleString('id-ID')}`}
                contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid var(--glass-border)', borderRadius: 12 }}
                itemStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                formatter={(value) => <span style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.85rem' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
