/**
 * Settings Service — localStorage persistence
 * 
 * When NeonDB is configured, sync to the settings table.
 */

const STORAGE_KEY = 'sentia_settings';

const DEFAULT_SETTINGS = {
  reminderEnabled: true,
  reminderTime: '21:00',
  insightDelivery: 'weekly', // 'daily' | 'weekly' | 'off'
  persona: 'wellness',       // 'student' | 'professional' | 'wellness'
};

/** Get settings for a user (falls back to defaults) */
export const getSettings = (userId) => {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    return { ...DEFAULT_SETTINGS, ...all[userId] };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
};

/** Update a single setting */
export const updateSetting = (userId, key, value) => {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  if (!all[userId]) all[userId] = {};
  all[userId][key] = value;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return { ...DEFAULT_SETTINGS, ...all[userId] };
};

/** Update multiple settings at once */
export const updateSettings = (userId, updates) => {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  all[userId] = { ...(all[userId] || {}), ...updates };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return { ...DEFAULT_SETTINGS, ...all[userId] };
};

/** Reset settings to defaults */
export const resetSettings = (userId) => {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  delete all[userId];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return { ...DEFAULT_SETTINGS };
};

export default { getSettings, updateSetting, updateSettings, resetSettings, DEFAULT_SETTINGS };
