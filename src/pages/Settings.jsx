import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Bell, BellOff, Clock, Brain, FileDown, 
  Trash2, LogOut, ChevronRight, GraduationCap, Briefcase, Heart,
  FileText, FileSpreadsheet, File, Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { getEntries } from '../services/entries';
import { exportPDF, exportCSV, exportText } from '../services/export';

const PERSONAS = [
  { id: 'student', label: 'Student', icon: GraduationCap },
  { id: 'professional', label: 'Professional', icon: Briefcase },
  { id: 'wellness', label: 'General Wellness', icon: Heart },
];

const DELIVERY_OPTIONS = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'off', label: 'Off' },
];

export default function Settings() {
  const navigate = useNavigate();
  const { user, updateProfile, signOut, deleteAccount } = useAuth();
  const { settings, updateSetting } = useSettings();

  const [showExport, setShowExport] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [exportSuccess, setExportSuccess] = useState('');

  const handleExport = async (format) => {
    const entries = await getEntries(user?.id);
    if (entries.length === 0) {
      setExportSuccess('No entries to export');
      setTimeout(() => setExportSuccess(''), 2000);
      return;
    }

    const name = user?.displayName || 'User';
    if (format === 'pdf') exportPDF(entries, name);
    else if (format === 'csv') exportCSV(entries);
    else if (format === 'text') exportText(entries, name);
    
    setExportSuccess(`${format.toUpperCase()} downloaded`);
    setTimeout(() => setExportSuccess(''), 2000);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleDelete = async () => {
    await deleteAccount();
    navigate('/auth');
  };

  const handlePersonaChange = async (persona) => {
    updateSetting('persona', persona);
    await updateProfile({ persona });
  };

  return (
    <div className="flex flex-col h-full bg-canvas text-text-main font-sans overflow-y-auto no-scrollbar pb-12">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 pt-4">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-surface border border-canvas-alt flex items-center justify-center text-text-muted hover:text-text-main transition-colors shadow-sm"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-serif text-2xl font-medium">Settings</h1>
      </div>

      {/* -------- REMINDER SECTION -------- */}
      <section className="mb-8">
        <h2 className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-4">Daily Reminder</h2>
        <div className="bg-surface border border-canvas-alt rounded-3xl shadow-soft overflow-hidden">
          
          {/* Toggle */}
          <div className="flex items-center justify-between p-5 border-b border-canvas-alt">
            <div className="flex items-center gap-3">
              {settings.reminderEnabled ? <Bell size={18} className="text-accent" /> : <BellOff size={18} className="text-text-muted" /> }
              <span className="text-sm font-medium">Reminder</span>
            </div>
            <button
              onClick={() => updateSetting('reminderEnabled', !settings.reminderEnabled)}
              className={`w-12 h-7 rounded-full transition-colors duration-300 relative ${settings.reminderEnabled ? 'bg-accent' : 'bg-canvas-alt'}`}
            >
              <motion.div 
                animate={{ x: settings.reminderEnabled ? 20 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm"
              />
            </button>
          </div>

          {/* Time picker */}
          <AnimatePresence>
            {settings.reminderEnabled && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center justify-between p-5">
                  <div className="flex items-center gap-3">
                    <Clock size={18} className="text-text-muted" />
                    <span className="text-sm">Time</span>
                  </div>
                  <input
                    type="time"
                    value={settings.reminderTime}
                    onChange={(e) => updateSetting('reminderTime', e.target.value)}
                    className="bg-canvas-alt rounded-xl px-3 py-1.5 text-sm text-text-main border border-canvas-alt outline-none focus:border-accent transition-colors"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* -------- JOURNAL CONTEXT -------- */}
      <section className="mb-8">
        <h2 className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-4">Journal Context</h2>
        <div className="flex flex-col gap-2">
          {PERSONAS.map(p => {
            const Icon = p.icon;
            const isActive = (settings.persona || user?.persona) === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handlePersonaChange(p.id)}
                className={`flex items-center gap-3 p-4 rounded-2xl border transition-all duration-200 
                  ${isActive ? 'bg-accent/10 border-accent text-accent shadow-sm' : 'bg-surface border-canvas-alt text-text-muted hover:bg-canvas-alt'}`}
              >
                <Icon size={20} />
                <span className="text-sm font-medium flex-1 text-left">{p.label}</span>
                {isActive && <Check size={18} />}
              </button>
            );
          })}
        </div>
      </section>

      {/* -------- AI INSIGHTS DELIVERY -------- */}
      <section className="mb-8">
        <h2 className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-4">AI Insights Delivery</h2>
        <div className="flex gap-2">
          {DELIVERY_OPTIONS.map(opt => (
            <button 
              key={opt.id}
              onClick={() => updateSetting('insightDelivery', opt.id)}
              className={`flex-1 py-3 rounded-2xl text-sm font-medium transition-all duration-200 border
                ${settings.insightDelivery === opt.id 
                  ? 'bg-accent text-white border-accent shadow-float' 
                  : 'bg-surface border-canvas-alt text-text-muted hover:bg-canvas-alt'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {/* -------- EXPORT -------- */}
      <section className="mb-8">
        <h2 className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-4">Export Entries</h2>
        
        <div className="bg-surface border border-canvas-alt rounded-3xl shadow-soft overflow-hidden">
          <button
            onClick={() => setShowExport(!showExport)}
            className="flex items-center justify-between p-5 w-full"
          >
            <div className="flex items-center gap-3">
              <FileDown size={18} className="text-text-muted" />
              <span className="text-sm font-medium">Download your journal</span>
            </div>
            <motion.div animate={{ rotate: showExport ? 90 : 0 }}>
              <ChevronRight size={18} className="text-text-muted" />
            </motion.div>
          </button>

          <AnimatePresence>
            {showExport && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5 flex flex-col gap-2">
                  <button 
                    onClick={() => handleExport('pdf')}
                    className="flex items-center gap-3 p-3.5 rounded-2xl bg-canvas border border-canvas-alt hover:bg-canvas-alt transition-colors"
                  >
                    <FileText size={18} className="text-red-500" />
                    <div className="text-left flex-1">
                      <div className="text-sm font-medium">PDF</div>
                      <div className="text-xs text-text-muted">Formatted document for therapists & records</div>
                    </div>
                  </button>
                  <button 
                    onClick={() => handleExport('csv')}
                    className="flex items-center gap-3 p-3.5 rounded-2xl bg-canvas border border-canvas-alt hover:bg-canvas-alt transition-colors"
                  >
                    <FileSpreadsheet size={18} className="text-green-600" />
                    <div className="text-left flex-1">
                      <div className="text-sm font-medium">CSV</div>
                      <div className="text-xs text-text-muted">Spreadsheet format for analysis & LLMs</div>
                    </div>
                  </button>
                  <button 
                    onClick={() => handleExport('text')}
                    className="flex items-center gap-3 p-3.5 rounded-2xl bg-canvas border border-canvas-alt hover:bg-canvas-alt transition-colors"
                  >
                    <File size={18} className="text-blue-500" />
                    <div className="text-left flex-1">
                      <div className="text-sm font-medium">Plain Text</div>
                      <div className="text-xs text-text-muted">Paste into ChatGPT, Claude, or any tool</div>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {exportSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
            className="mt-3 text-sm text-accent font-medium flex items-center gap-2"
          >
            <Check size={16} /> {exportSuccess}
          </motion.div>
        )}
      </section>

      {/* -------- DANGER ZONE -------- */}
      <section className="mb-8">
        <h2 className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-4">Account</h2>
        <div className="flex flex-col gap-2">
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-3 p-4 rounded-2xl bg-surface border border-canvas-alt text-text-muted hover:bg-canvas-alt transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Sign out</span>
          </button>

          <button 
            onClick={() => setShowDelete(true)}
            className="flex items-center gap-3 p-4 rounded-2xl bg-surface border border-red-100 text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={18} />
            <span className="text-sm font-medium">Delete account & all data</span>
          </button>
        </div>
      </section>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {showDelete && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowDelete(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-surface rounded-3xl p-6 max-w-sm w-full shadow-float"
            >
              <h3 className="font-serif text-xl mb-2">Delete everything?</h3>
              <p className="text-sm text-text-muted mb-6 leading-relaxed">
                This will permanently delete your account, all journal entries, and settings. This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDelete(false)}
                  className="flex-1 py-3 rounded-2xl bg-canvas-alt text-text-muted font-medium"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-medium"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
