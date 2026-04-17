import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          textAlign: 'center',
          background: 'var(--bg-primary)',
          color: 'var(--text-primary)'
        }}>
          <AlertTriangle size={64} color="var(--danger)" style={{ marginBottom: 24 }} />
          <h1 style={{ fontSize: '1.5rem', marginBottom: 12 }}>Ups, Terjadi Kesalahan!</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24, maxWidth: 400 }}>
            Maaf, ada komponen yang gagal dimuat. Anda bisa mencoba menyegarkan (refresh) halaman ini.
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            <RefreshCw size={18} /> Segarkan Halaman
          </button>
          
          {process.env.NODE_ENV === 'development' && (
            <pre style={{
              marginTop: 32,
              padding: 16,
              background: 'rgba(0,0,0,0.2)',
              borderRadius: 8,
              color: 'var(--danger)',
              fontSize: '0.8rem',
              maxWidth: '100%',
              overflowX: 'auto',
              textAlign: 'left'
            }}>
              {this.state.error?.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
