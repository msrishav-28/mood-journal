/**
 * Auth Service — Supports Firebase Auth and local storage fallback
 */
import { v4 as uuidv4 } from 'uuid';
import { auth, db, isFirebaseConfigured } from './firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut, 
  updateProfile as fbUpdateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  deleteUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

const STORAGE_KEY = 'sentia_auth';
const USERS_KEY = 'sentia_users';

// ---------- helpers for local fallback ----------
const getStoredUsers = () => {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; } 
  catch { return []; }
};

const saveUsers = (users) => localStorage.setItem(USERS_KEY, JSON.stringify(users));

const setSession = (user) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
};

const clearSession = () => localStorage.removeItem(STORAGE_KEY);

// Setup background auth state listener for firebase to sync cache
if (isFirebaseConfigured && auth) {
  auth.onAuthStateChanged(async (fbUser) => {
    if (fbUser) {
      try {
        const docRef = doc(db, 'profiles', fbUser.uid);
        const docSnap = await getDoc(docRef);
        let persona = 'wellness';
        let displayName = fbUser.displayName || 'User';
        if (docSnap.exists()) {
          const data = docSnap.data();
          persona = data.persona || 'wellness';
          displayName = data.displayName || displayName;
        }
        const cachedUser = {
          id: fbUser.uid,
          email: fbUser.email,
          displayName,
          persona,
          avatarUrl: fbUser.photoURL || null,
          provider: fbUser.providerData[0]?.providerId || 'email',
          createdAt: fbUser.metadata.creationTime || new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedUser));
      } catch (e) {
        console.error('Error syncing auth state with firestore:', e);
      }
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  });
}

// ---------- public API ----------

/** Get current user from local session. Returns null if not logged in. */
export const getCurrentUser = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); }
  catch { return null; }
};

/** Register with email/password */
export const signUp = async (email, password, displayName = 'User') => {
  if (isFirebaseConfigured && auth) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const fbUser = userCredential.user;
    await fbUpdateProfile(fbUser, { displayName });
    
    const newUser = {
      id: fbUser.uid,
      email,
      displayName,
      persona: 'wellness',
      provider: 'email',
      createdAt: new Date().toISOString()
    };
    
    // Save profile to Firestore
    await setDoc(doc(db, 'profiles', fbUser.uid), {
      id: fbUser.uid,
      email,
      displayName,
      persona: 'wellness',
      createdAt: new Date().toISOString()
    });
    
    setSession(newUser);
    return newUser;
  }

  // Fallback mode
  const users = getStoredUsers();
  if (users.find(u => u.email === email)) {
    throw new Error('An account with this email already exists.');
  }

  const newUser = {
    id: uuidv4(),
    email,
    displayName,
    persona: null,
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
  if (isFirebaseConfigured && auth) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const fbUser = userCredential.user;
    
    const docRef = doc(db, 'profiles', fbUser.uid);
    const docSnap = await getDoc(docRef);
    let persona = 'wellness';
    let displayName = fbUser.displayName || 'User';
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      persona = data.persona || 'wellness';
      displayName = data.displayName || displayName;
    } else {
      await setDoc(docRef, {
        id: fbUser.uid,
        email: fbUser.email,
        displayName,
        persona,
        createdAt: new Date().toISOString()
      });
    }
    
    const loggedUser = {
      id: fbUser.uid,
      email: fbUser.email,
      displayName,
      persona,
      provider: 'email',
      createdAt: fbUser.metadata.creationTime || new Date().toISOString()
    };
    
    setSession(loggedUser);
    return loggedUser;
  }

  // Fallback mode
  const users = getStoredUsers();
  const found = users.find(u => u.email === email && u.passwordHash === password);
  if (!found) {
    throw new Error('Invalid email or password.');
  }

  const { passwordHash: _passwordHash, ...user } = found;
  setSession(user);
  return user;
};

/** Google OAuth provider */
export const signInWithGoogle = async () => {
  if (isFirebaseConfigured && auth) {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const fbUser = userCredential.user;
    
    const docRef = doc(db, 'profiles', fbUser.uid);
    const docSnap = await getDoc(docRef);
    let persona = 'wellness';
    let displayName = fbUser.displayName || 'User';
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      persona = data.persona || 'wellness';
      displayName = data.displayName || displayName;
    } else {
      await setDoc(docRef, {
        id: fbUser.uid,
        email: fbUser.email,
        displayName,
        persona,
        createdAt: new Date().toISOString()
      });
    }
    
    const loggedUser = {
      id: fbUser.uid,
      email: fbUser.email,
      displayName,
      persona,
      provider: 'google',
      createdAt: fbUser.metadata.creationTime || new Date().toISOString()
    };
    
    setSession(loggedUser);
    return loggedUser;
  }

  // Fallback mode
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
    const { passwordHash: _passwordHash, ...user } = existing;
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
  if (isFirebaseConfigured && auth) {
    const fbUser = auth.currentUser;
    if (!fbUser) throw new Error('Not authenticated');
    
    if (updates.displayName) {
      await fbUpdateProfile(fbUser, { displayName: updates.displayName });
    }
    
    const docRef = doc(db, 'profiles', fbUser.uid);
    await setDoc(docRef, updates, { merge: true });
    
    const current = getCurrentUser();
    const updated = { ...current, ...updates };
    setSession(updated);
    return updated;
  }

  // Fallback mode
  const current = getCurrentUser();
  if (!current) throw new Error('Not authenticated');

  const updated = { ...current, ...updates };
  setSession(updated);

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
  if (isFirebaseConfigured && auth) {
    await fbSignOut(auth);
    clearSession();
    return;
  }
  clearSession();
};

/** Delete account and all data */
export const deleteAccount = async () => {
  if (isFirebaseConfigured && auth) {
    const fbUser = auth.currentUser;
    if (!fbUser) return;
    
    const uid = fbUser.uid;
    await deleteDoc(doc(db, 'profiles', uid));
    await deleteDoc(doc(db, 'settings', uid));
    await deleteUser(fbUser);
    clearSession();
    
    localStorage.removeItem('sentia_entries');
    localStorage.removeItem('sentia_settings');
    return;
  }

  // Fallback mode
  const current = getCurrentUser();
  if (!current) return;

  const users = getStoredUsers().filter(u => u.id !== current.id);
  saveUsers(users);
  clearSession();

  localStorage.removeItem('sentia_entries');
  localStorage.removeItem('sentia_settings');
};

export default {
  getCurrentUser, signUp, signIn, signInWithGoogle,
  updateProfile, signOut, deleteAccount
};
