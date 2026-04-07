import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = authService.getCurrentUser();
    setUser(stored);
    setLoading(false);
  }, []);

  const signUp = async (email, password, displayName) => {
    const u = await authService.signUp(email, password, displayName);
    setUser(u);
    return u;
  };

  const signIn = async (email, password) => {
    const u = await authService.signIn(email, password);
    setUser(u);
    return u;
  };

  const signInWithGoogle = async () => {
    const u = await authService.signInWithGoogle();
    setUser(u);
    return u;
  };

  const updateProfile = async (updates) => {
    const u = await authService.updateProfile(updates);
    setUser(u);
    return u;
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
  };

  const deleteAccount = async () => {
    await authService.deleteAccount();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user, loading,
      signUp, signIn, signInWithGoogle,
      updateProfile, signOut, deleteAccount
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
