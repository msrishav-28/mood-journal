/**
 * Settings Service — Supports Firestore settings persistence and localStorage fallback
 */
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';

const STORAGE_KEY = 'sentia_settings';

export const DEFAULT_SETTINGS = {
  reminderEnabled: true,
  reminderTime: '21:00',
  insightDelivery: 'weekly', // 'daily' | 'weekly' | 'off'
  persona: 'wellness',       // 'student' | 'professional' | 'wellness'
};

/** Get settings for a user (falls back to defaults) */
export const getSettings = async (userId) => {
  let cached = null;
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    cached = all[userId] ? { ...DEFAULT_SETTINGS, ...all[userId] } : null;
  } catch (e) {
    console.error('Error reading settings cache:', e);
  }

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'settings', userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const serverSettings = docSnap.data();
        const merged = { ...DEFAULT_SETTINGS, ...serverSettings };
        
        // Update local cache
        const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        all[userId] = merged;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
        
        return merged;
      } else {
        // Initialise in Firestore
        const initial = cached || DEFAULT_SETTINGS;
        await setDoc(docRef, initial);
        return initial;
      }
    } catch (error) {
      console.error('Error fetching settings from Firestore, using local cache:', error);
    }
  }

  return cached || { ...DEFAULT_SETTINGS };
};

/** Update a single setting */
export const updateSetting = async (userId, key, value) => {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  if (!all[userId]) all[userId] = {};
  all[userId][key] = value;
  const updated = { ...DEFAULT_SETTINGS, ...all[userId] };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'settings', userId);
      await setDoc(docRef, { [key]: value }, { merge: true });
    } catch (error) {
      console.error('Error updating setting in Firestore:', error);
    }
  }
  return updated;
};

/** Update multiple settings at once */
export const updateSettings = async (userId, updates) => {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  all[userId] = { ...(all[userId] || {}), ...updates };
  const updated = { ...DEFAULT_SETTINGS, ...all[userId] };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'settings', userId);
      await setDoc(docRef, updates, { merge: true });
    } catch (error) {
      console.error('Error updating settings in Firestore:', error);
    }
  }
  return updated;
};

/** Reset settings to defaults */
export const resetSettings = async (userId) => {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  delete all[userId];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'settings', userId);
      await setDoc(docRef, DEFAULT_SETTINGS);
    } catch (error) {
      console.error('Error resetting settings in Firestore:', error);
    }
  }
  return { ...DEFAULT_SETTINGS };
};

export default { getSettings, updateSetting, updateSettings, resetSettings, DEFAULT_SETTINGS, isFirebaseConfigured };
