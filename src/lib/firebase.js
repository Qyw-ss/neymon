import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDCkxjlp-L5gpZ5MYGsov-Vfbm0K_V9E94",
  authDomain: "neymon.vercel.app",
  projectId: "monlimo",
  storageBucket: "monlimo.firebasestorage.app",
  messagingSenderId: "807020650784",
  appId: "1:807020650784:web:5ec21a06f95357b0d5f745",
  measurementId: "G-XS0H761VF0",
  databaseURL: "https://monlimo-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getDatabase(app);
