/**
 * Auth Service — Placeholder
 * 
 * Supports email/password and Google OAuth stubs.
 * All state persisted in localStorage until NeonDB is wired up.
 */
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'sentia_auth';
const USERS_KEY = 'sentia_users';

// ---------- helpers ----------
const getStoredUsers = () => {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; } 
  catch { return []; }
};

const saveUsers = (users) => localStorage.setItem(USERS_KEY, JSON.stringify(users));

const setSession = (user) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
};

const clearSession = () => localStorage.removeItem(STORAGE_KEY);

// ---------- public API ----------

/** Get current user from local session. Returns null if not logged in. */
export const getCurrentUser = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); }
  catch { return null; }
};

/** Register with email/password */
export const signUp = async (email, password, displayName = 'User') => {
  const users = getStoredUsers();
  
  if (users.find(u => u.email === email)) {
    throw new Error('An account with this email already exists.');
  }

  const newUser = {
    id: uuidv4(),
    email,
    displayName,
    persona: null, // set during onboarding
    avatarUrl: null,
    provider: 'email',
    createdAt: new Date().toISOString()
  };

  users.push({ ...newUser, passwordHash: password }); // plaintext for placeholder only!
  saveUsers(users);
  setSession(newUser);
  return newUser;
};

/** Sign in with email/password */
export const signIn = async (email, password) => {
  const users = getStoredUsers();
  const found = users.find(u => u.email === email && u.passwordHash === password);
  
  if (!found) {
    throw new Error('Invalid email or password.');
  }

  const { passwordHash, ...user } = found;
  setSession(user);
  return user;
};

/** Google OAuth placeholder */
export const signInWithGoogle = async () => {
  // In production, this would redirect to Google OAuth consent screen.
  // For placeholder, we simulate a Google user.
  const googleUser = {
    id: uuidv4(),
    email: 'maya.reddy@gmail.com',
    displayName: 'Maya Reddy',
    persona: null,
    avatarUrl: null,
    provider: 'google',
    createdAt: new Date().toISOString()
  };

  const users = getStoredUsers();
  const existing = users.find(u => u.email === googleUser.email);
  if (existing) {
    const { passwordHash, ...user } = existing;
    setSession(user);
    return user;
  }

  users.push(googleUser);
  saveUsers(users);
  setSession(googleUser);
  return googleUser;
};

/** Update user profile (persona, display name, etc.) */
export const updateProfile = async (updates) => {
  const current = getCurrentUser();
  if (!current) throw new Error('Not authenticated');

  const updated = { ...current, ...updates };
  setSession(updated);

  // Also update in the users list
  const users = getStoredUsers();
  const idx = users.findIndex(u => u.id === current.id);
  if (idx >= 0) {
    users[idx] = { ...users[idx], ...updates };
    saveUsers(users);
  }

  return updated;
};

/** Sign out */
export const signOut = async () => {
  clearSession();
};

/** Delete account and all data */
export const deleteAccount = async () => {
  const current = getCurrentUser();
  if (!current) return;

  const users = getStoredUsers().filter(u => u.id !== current.id);
  saveUsers(users);
  clearSession();

  // Also wipe entries and settings
  localStorage.removeItem('sentia_entries');
  localStorage.removeItem('sentia_settings');
};

export default {
  getCurrentUser, signUp, signIn, signInWithGoogle,
  updateProfile, signOut, deleteAccount
};
