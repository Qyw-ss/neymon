import { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithPopup,
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setLoginLoading(true);
    setLoginError(null);
    try {
      // signInWithPopup is reliable across all modern browsers
      // Safari on iOS 14.5+ supports this natively
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      if (error.code === 'auth/popup-closed-by-user') {
        // User closed the popup - not an error, just ignore
      } else if (error.code === 'auth/popup-blocked') {
        setLoginError('Popup diblok browser. Izinkan popup untuk neymon.vercel.app di pengaturan browser Anda, lalu coba lagi.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        // Another popup was already open - ignore
      } else {
        console.error('Login error:', error);
        setLoginError('Login gagal: ' + (error.message || 'Coba lagi beberapa saat.'));
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const logout = async () => {
    if (window.confirm('Yakin ingin keluar? Data lokal tetap aman.')) {
      await signOut(auth);
    }
  };

  return (
    <AuthContext.Provider value={{ user, authLoading, loginWithGoogle, loginLoading, loginError, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
