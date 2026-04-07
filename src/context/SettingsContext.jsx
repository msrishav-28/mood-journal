import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as settingsService from '../services/settings';
import { useAuth } from './AuthContext';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState(settingsService.DEFAULT_SETTINGS);

  useEffect(() => {
    if (user?.id) {
      setSettings(settingsService.getSettings(user.id));
    }
  }, [user?.id]);

  const updateSetting = useCallback((key, value) => {
    if (!user?.id) return;
    const updated = settingsService.updateSetting(user.id, key, value);
    setSettings(updated);
  }, [user?.id]);

  const updateMultiple = useCallback((updates) => {
    if (!user?.id) return;
    const updated = settingsService.updateSettings(user.id, updates);
    setSettings(updated);
  }, [user?.id]);

  const reset = useCallback(() => {
    if (!user?.id) return;
    const defaults = settingsService.resetSettings(user.id);
    setSettings(defaults);
  }, [user?.id]);

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, updateMultiple, reset }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
};
