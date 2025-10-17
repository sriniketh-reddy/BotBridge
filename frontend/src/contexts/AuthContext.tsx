// src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { auth } from "../firebase/client";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
axios.defaults.baseURL = API_BASE;

axios.defaults.withCredentials = true;
const setBackendToken = (token: string | null) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => {
    // initialize from stored backend token if present
    // if firebase has a persisted user, exchange its idToken
    if (auth.currentUser) {
      auth.currentUser.getIdToken().then(idToken => exchangeIdToken(idToken)).catch(() => {});
    } else {
      // try fetching profile - backend may have httpOnly cookie set
      axios.get('/api/auth/me').then((res: any) => {
        setUser(res.data.user);
        setIsAuthenticated(true);
      }).catch(() => {
        setIsAuthenticated(false);
      });
    }
  }, []);

  const exchangeIdToken = async (idToken: string) => {
    const res = await axios.post('/api/auth/verify-token', { idToken });
    const token = res.data.token;
    console.log('exchanged idToken for backend token', token);
    const user = res.data.user;
    setBackendToken(token);
    setUser(user);
    setIsAuthenticated(true);
  };

  const login = async (email: string, password: string) => {
    // sign in with firebase and exchange token
    console.log(auth, email, password);
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await cred.user.getIdToken();
    console.log('got idToken', idToken);
    await exchangeIdToken(idToken);
  };

  const register = async (email: string, password: string, name?: string) => {
    // create user in firebase then exchange token and send name to backend
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const idToken = await cred.user.getIdToken();
    // call backend register endpoint which will persist the profile with name
    await axios.post('/api/auth/register', { idToken, name });
    // after backend sets cookie and returns, fetch profile
    const me = await axios.get('/api/auth/me');
    setUser(me.data.user);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    // local logout: remove backend token and sign out from firebase
    setBackendToken(null);
    setUser(null);
    setIsAuthenticated(false);
    try {
      await auth.signOut();
    } catch (_) {}
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext)!;
