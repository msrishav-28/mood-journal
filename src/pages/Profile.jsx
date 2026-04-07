import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { Settings, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import * as entriesService from '../services/entries';

export default function Profile() {
  const { user } = useAuth();
  const { settings } = useSettings();

  const [entryCount, setEntryCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [weeksSinceJoin, setWeeksSinceJoin] = useState(0);

  useEffect(() => {
    loadStats();
  }, [user?.id]);

  const loadStats = async () => {
    if (!user?.id) return;
    setEntryCount(await entriesService.getEntryCount(user.id));
    setStreak(await entriesService.getStreak(user.id));
    
    const created = new Date(user.createdAt || Date.now());
    const weeks = Math.max(1, Math.ceil((Date.now() - created.getTime()) / (7 * 24 * 60 * 60 * 1000)));
    setWeeksSinceJoin(weeks);
  };

  const persona = settings.persona || user?.persona || 'wellness';
  const personaLabel = persona === 'student' ? 'Student' : persona === 'professional' ? 'Working Professional' : 'General Wellness';
  const initials = (user?.displayName || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="flex flex-col h-full bg-canvas text-text-main font-sans pt-8 overflow-y-auto no-scrollbar pb-12">
      {/* Avatar & name */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 rounded-full bg-accent-light flex items-center justify-center font-serif text-3xl text-accent-hover mb-4">
          {initials}
        </div>
        <h2 className="font-serif text-2xl font-medium mb-1">{user?.displayName || 'User'}</h2>
        <div className="inline-flex py-1 px-4 bg-surface rounded-full text-xs text-text-muted border border-canvas-alt shadow-sm">
          {personaLabel}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}
          className="bg-surface rounded-2xl p-4 text-center border border-canvas-alt shadow-soft">
          <div className="font-serif text-3xl font-medium text-text-main mb-1">{streak}</div>
          <div className="text-[10px] uppercase tracking-wider text-text-muted">Day streak</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-surface rounded-2xl p-4 text-center border border-canvas-alt shadow-soft">
          <div className="font-serif text-3xl font-medium text-text-main mb-1">{entryCount}</div>
          <div className="text-[10px] uppercase tracking-wider text-text-muted">Entries</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-surface rounded-2xl p-4 text-center border border-canvas-alt shadow-soft">
          <div className="font-serif text-3xl font-medium text-text-main mb-1">{weeksSinceJoin}</div>
          <div className="text-[10px] uppercase tracking-wider text-text-muted">Weeks</div>
        </motion.div>
      </div>

      {/* Quick settings preview */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Quick Settings</h3>
        <Link to="/settings" className="text-xs text-accent font-semibold flex items-center gap-1 hover:underline">
          All settings <ChevronRight size={14} />
        </Link>
      </div>

      <div className="bg-surface border border-canvas-alt rounded-3xl overflow-hidden shadow-soft">
        <Link to="/settings" className="flex items-center justify-between p-4 px-5 border-b border-canvas-alt hover:bg-canvas-alt transition-colors">
          <span className="text-sm">Daily reminder</span>
          <span className="text-xs text-text-muted">{settings.reminderEnabled ? settings.reminderTime : 'Off'} ›</span>
        </Link>
        <Link to="/settings" className="flex items-center justify-between p-4 px-5 border-b border-canvas-alt hover:bg-canvas-alt transition-colors">
          <span className="text-sm">Journal context</span>
          <span className="text-xs text-text-muted capitalize">{persona} ›</span>
        </Link>
        <Link to="/settings" className="flex items-center justify-between p-4 px-5 border-b border-canvas-alt hover:bg-canvas-alt transition-colors">
          <span className="text-sm">AI Insights delivery</span>
          <span className="text-xs text-text-muted capitalize">{settings.insightDelivery} ›</span>
        </Link>
        <Link to="/settings" className="flex items-center justify-between p-4 px-5 hover:bg-canvas-alt transition-colors">
          <span className="text-sm">Export entries</span>
          <span className="text-xs text-text-muted">PDF / CSV / Text ›</span>
        </Link>
      </div>
    </div>
  );
}
