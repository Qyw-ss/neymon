import { Utensils, Car, Film, ShoppingBag, Tag } from 'lucide-react'

export const CATEGORIES = {
  // Expense Categories
  food: { type: 'expense', name: 'Makanan & Minuman', icon: Utensils, color: 'text-warning', bg: 'bg-warning/20', hex: '#f59e0b', keywords: ['makan', 'minum', 'kopi', 'mcd', 'kfc', 'geprek', 'warteg', 'gofood', 'grabfood', 'indomaret', 'alfamart'] },
  transport: { type: 'expense', name: 'Transportasi', icon: Car, color: 'text-accent-primary', bg: 'bg-accent-primary/20', hex: '#6366f1', keywords: ['gojek', 'grab', 'bensin', 'tol', 'parkir', 'krl', 'mrt', 'kereta', 'tiket'] },
  entertainment: { type: 'expense', name: 'Hiburan', icon: Film, color: 'text-accent-secondary', bg: 'bg-accent-secondary/20', hex: '#ec4899', keywords: ['nonton', 'bioskop', 'netflix', 'spotify', 'game', 'main', 'liburan'] },
  shopping: { type: 'expense', name: 'Belanja', icon: ShoppingBag, color: 'text-danger', bg: 'bg-danger/20', hex: '#ef4444', keywords: ['baju', 'sepatu', 'shopee', 'tokopedia', 'belanja', 'tas'] },
  
  // Income Categories
  salary: { type: 'income', name: 'Gaji & Upah', icon: Tag, color: 'text-success', bg: 'bg-success/20', hex: '#10b981', keywords: ['gaji', 'upah', 'honor', 'bayaran', 'fee', 'bonus', 'thr'] },
  investment: { type: 'income', name: 'Investasi', icon: Tag, color: 'text-info', bg: 'bg-info/20', hex: '#0ea5e9', keywords: ['investasi', 'dividen', 'bunga', 'profit', 'cair', 'jual'] }
}

export const FALLBACK_CATEGORY = { 
  id: 'other',
  type: 'expense',
  name: 'Lainnya', 
  icon: Tag, 
  color: 'text-text-secondary', 
  bg: 'bg-text-secondary/20',
  hex: '#94a3b8'
};
