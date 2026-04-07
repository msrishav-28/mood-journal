import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Search, Filter, Play, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import * as entriesService from '../services/entries';

const { getTagStyle } = entriesService;

const formatDate = (isoStr) => {
  const d = new Date(isoStr);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) + 
    ' · ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

const formatDuration = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export default function Journal() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    loadEntries();
  }, [user?.id]);

  const loadEntries = async () => {
    if (!user?.id) return;
    setLoading(true);
    const data = await entriesService.getEntries(user.id);
    setEntries(data);
    if (data.length > 0 && !selectedId) setSelectedId(data[0].id);
    setLoading(false);
  };

  const filtered = entries.filter(e =>
    !searchQuery || e.transcript?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const selectedEntry = filtered.find(e => e.id === selectedId);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-center gap-4 px-8">
        <div className="w-16 h-16 rounded-full bg-canvas-alt flex items-center justify-center">
          <Sparkles className="text-text-muted" size={28} />
        </div>
        <h2 className="font-serif text-2xl text-text-main">No entries yet.</h2>
        <p className="text-text-muted max-w-sm">Record your first voice entry from the Home screen and it'll show up here.</p>
      </div>
    );
  }

  // MOBILE VIEW
  const MobileView = () => (
    <div className="md:hidden flex flex-col h-full overflow-y-auto no-scrollbar pt-4 pb-12">
      <div className="flex justify-between items-center mb-6 px-1">
        <h1 className="font-serif text-3xl font-medium text-text-main">Journal</h1>
        <button className="w-10 h-10 rounded-full bg-surface shadow-soft flex items-center justify-center text-text-muted">
          <Calendar size={20} />
        </button>
      </div>

      <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 mb-6 border mx-1
        ${searchFocused ? 'bg-surface shadow-soft border-accent' : 'bg-surface border-canvas-alt'}`}>
        <Search className="text-text-muted" size={20} />
        <input type="text" placeholder="Search your thoughts..."
          value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          className="bg-transparent border-none outline-none flex-grow text-text-main placeholder-text-muted"
          onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)}
        />
        <Filter className="text-text-muted" size={18} />
      </div>

      <div className="flex flex-col gap-4 px-1">
        {filtered.map((entry) => (
          <div key={entry.id} className="bg-surface rounded-3xl p-5 border border-canvas-alt shadow-soft">
            <div className="flex justify-between text-xs text-text-muted mb-3 font-medium">
              <span>{formatDate(entry.createdAt)}</span>
              <span>{formatDuration(entry.durationSeconds)}</span>
            </div>
            <div className="flex gap-2 mb-3 flex-wrap">
              {(entry.tags || []).map(tag => {
                const s = getTagStyle(tag);
                return (
                  <span key={tag} className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md ${s.bg} ${s.text}`}>
                    <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${s.dot}`}></span>
                    {tag}
                  </span>
                );
              })}
            </div>
            <p className="text-sm text-text-main leading-relaxed line-clamp-3">{entry.transcript}</p>
          </div>
        ))}
      </div>
    </div>
  );

  // DESKTOP VIEW
  const DesktopView = () => (
    <div className="hidden md:flex h-[calc(100vh-40px)] border border-canvas-alt rounded-2xl overflow-hidden shadow-soft mt-4">
      
      {/* Left: Entry list */}
      <div className="w-[30%] bg-canvas border-r border-canvas-alt flex flex-col">
        <div className="p-4 border-b border-canvas-alt bg-canvas/80 backdrop-blur z-10 sticky top-0">
          <h2 className="font-serif text-xl font-medium mb-3">All entries</h2>
          <div className="bg-surface border border-canvas-alt rounded-xl px-3 py-2 flex items-center gap-2 shadow-sm">
            <Search size={16} className="text-text-muted" />
            <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full" />
          </div>
        </div>
        <div className="overflow-y-auto no-scrollbar flex-1 p-2">
          {filtered.map(entry => (
            <div key={entry.id} onClick={() => setSelectedId(entry.id)}
              className={`p-4 rounded-xl cursor-pointer mb-1 transition-colors border ${selectedId === entry.id ? 'bg-surface border-canvas-alt shadow-sm' : 'border-transparent hover:bg-canvas-alt'}`}
            >
              <div className="text-xs text-text-muted mb-1">{formatDate(entry.createdAt)}</div>
              <p className="text-sm text-text-main line-clamp-2 leading-snug mb-2">{entry.transcript}</p>
              <div className="flex gap-1.5 flex-wrap">
                {(entry.tags || []).map(tag => {
                  const s = getTagStyle(tag);
                  return <span key={tag} className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${s.bg} ${s.text}`}>{tag}</span>;
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Center: Transcript detail */}
      <div className="w-[45%] bg-surface flex flex-col overflow-y-auto no-scrollbar">
        {selectedEntry && (
          <AnimatePresence mode="wait">
            <motion.div key={selectedEntry.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 pb-16">
              <div className="text-xs uppercase tracking-widest text-text-muted mb-6 font-medium">
                {formatDate(selectedEntry.createdAt)} · {formatDuration(selectedEntry.durationSeconds)}
              </div>
              <h2 className="font-serif text-2xl font-medium text-text-main italic mb-8 leading-relaxed">
                "{selectedEntry.transcript?.split('.')[0]}..."
              </h2>

              <div className="flex items-center gap-3 bg-canvas-alt rounded-xl px-4 py-2 mb-8">
                <button className="w-8 h-8 rounded-full bg-[var(--color-emo-calm)] text-white flex items-center justify-center shadow-sm">
                  <Play size={14} fill="currentColor" className="ml-0.5"/>
                </button>
                <div className="flex-1 flex items-center gap-0.5 h-6 opacity-40">
                  {Array.from({length: 30}).map((_, i) => (
                    <div key={i} className="w-1 bg-text-muted rounded-full" style={{height: `${Math.max(10, Math.random() * 100)}%`}}></div>
                  ))}
                </div>
                <span className="text-xs text-text-muted font-medium">{formatDuration(selectedEntry.durationSeconds)}</span>
              </div>

              <div className="flex gap-2 mb-8 flex-wrap">
                {(selectedEntry.tags || []).map(tag => {
                  const s = getTagStyle(tag);
                  return (
                    <span key={tag} className={`text-xs uppercase font-bold px-3 py-1 rounded-full ${s.bg} ${s.text}`}>
                      <span className={`inline-block w-2 h-2 rounded-full mr-2 ${s.dot}`}></span>
                      {tag}
                    </span>
                  );
                })}
              </div>

              <div className="text-base text-text-main leading-loose mb-10">
                {selectedEntry.transcript?.split('. ').map((sentence, idx, arr) => (
                  <p key={idx} className="mb-4">{sentence}{idx < arr.length - 1 ? '.' : ''}</p>
                ))}
              </div>

              {selectedEntry.aiInsight && (
                <div className="bg-canvas border-l-4 border-accent rounded-r-2xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Sparkles size={60} />
                  </div>
                  <div className="text-xs uppercase tracking-widest text-accent font-bold mb-3">Sentia Reflects</div>
                  <div className="font-serif italic text-text-main leading-relaxed">
                    "{selectedEntry.aiInsight}"
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Right: Weekly overview */}
      <div className="w-[25%] bg-canvas border-l border-canvas-alt p-6 overflow-y-auto no-scrollbar">
        <h3 className="text-xs uppercase tracking-widest text-text-muted mb-6 font-bold">Week Overview</h3>
        <div className="bg-surface rounded-xl p-4 border border-canvas-alt shadow-sm mb-3 text-center">
          <div className="font-serif text-3xl text-text-main">{entries.length}</div>
          <div className="text-[10px] uppercase tracking-wider text-text-muted mt-1">Total entries</div>
        </div>
        {entries.slice(0, 3).map(e => (
          <div key={e.id} className="bg-surface rounded-xl p-4 border border-canvas-alt shadow-sm mb-3">
            <p className="text-xs text-text-main leading-relaxed line-clamp-2">{e.transcript}</p>
            <div className="flex gap-1 mt-2">
              {(e.tags || []).map(tag => {
                const s = getTagStyle(tag);
                return <span key={tag} className={`text-[8px] uppercase font-bold px-1 py-0.5 rounded ${s.bg} ${s.text}`}>{tag}</span>;
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <MobileView />
      <DesktopView />
    </>
  );
}
