/**
 * Entries Service — localStorage fallback
 * 
 * Manages journal entries. When NeonDB is configured,
 * replace localStorage calls with db.query() calls.
 */
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'sentia_entries';

const getAll = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
};

const persist = (entries) => localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));

// Emotion tag styling map
export const EMOTION_STYLES = {
  Calm:       { bg: 'bg-[var(--color-emo-calm-bg)]', text: 'text-[var(--color-emo-calm-txt)]', dot: 'bg-[var(--color-emo-calm)]' },
  Joy:        { bg: 'bg-[var(--color-emo-joy-bg)]',  text: 'text-[var(--color-emo-joy-txt)]',  dot: 'bg-[var(--color-emo-joy)]' },
  Anxious:    { bg: 'bg-[var(--color-emo-anx-bg)]',  text: 'text-[var(--color-emo-anx-txt)]',  dot: 'bg-[var(--color-emo-anx)]' },
  Frustrated: { bg: 'bg-[var(--color-emo-frust-bg)]', text: 'text-[var(--color-emo-frust-txt)]', dot: 'bg-[var(--color-emo-frust)]' },
  Grateful:   { bg: 'bg-[var(--color-emo-grat-bg)]', text: 'text-[var(--color-emo-grat-txt)]', dot: 'bg-[var(--color-emo-grat)]' },
  Sad:        { bg: 'bg-blue-50',  text: 'text-blue-700',  dot: 'bg-blue-400' },
  Reflective: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-400' },
};

export const getTagStyle = (tag) => EMOTION_STYLES[tag] || { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' };

/** Create a new journal entry */
export const createEntry = async (userId, { transcript, durationSeconds, tags, dominantEmotion, aiInsight, audioUrl = null }) => {
  const entry = {
    id: uuidv4(),
    userId,
    audioUrl,
    transcript,
    durationSeconds,
    tags: tags || [],
    dominantEmotion: dominantEmotion || (tags?.[0] || 'Calm'),
    aiInsight: aiInsight || '',
    createdAt: new Date().toISOString()
  };

  const entries = getAll();
  entries.unshift(entry); // newest first
  persist(entries);
  return entry;
};

/** Get all entries for a user, newest first */
export const getEntries = async (userId) => {
  return getAll().filter(e => e.userId === userId);
};

/** Get a single entry by ID */
export const getEntry = async (entryId) => {
  return getAll().find(e => e.id === entryId) || null;
};

/** Delete an entry */
export const deleteEntry = async (entryId) => {
  const entries = getAll().filter(e => e.id !== entryId);
  persist(entries);
};

/** Get entry count for a user */
export const getEntryCount = async (userId) => {
  return getAll().filter(e => e.userId === userId).length;
};

/** Calculate current streak (consecutive days with at least 1 entry) */
export const getStreak = async (userId) => {
  const entries = getAll().filter(e => e.userId === userId);
  if (entries.length === 0) return 0;

  // Group by date
  const dates = [...new Set(entries.map(e => new Date(e.createdAt).toDateString()))];
  dates.sort((a, b) => new Date(b) - new Date(a)); // newest first

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < dates.length; i++) {
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    
    if (new Date(dates[i]).toDateString() === expected.toDateString()) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

/** Seed demo data for a user (used when no entries exist) */
export const seedDemoEntries = async (userId) => {
  const existing = getAll().filter(e => e.userId === userId);
  if (existing.length > 0) return; // don't overwrite

  const now = new Date();
  const demoEntries = [
    {
      id: uuidv4(), userId,
      transcript: "Had a really productive morning — got through two things I'd been putting off for weeks, made progress on the proposal. But then the 3 o'clock meeting happened. It wasn't what was said so much as how it was said. I'm sitting here at 11 PM still replaying it. My body is still carrying it.",
      durationSeconds: 204, tags: ['Anxious', 'Frustrated'], dominantEmotion: 'Anxious',
      aiInsight: "There's a real contrast here — a morning of genuine momentum, then an afternoon that undid the feeling of it. The replaying at night is something you've mentioned before. Worth sitting with: what would it take to let a difficult meeting stay in the afternoon?",
      createdAt: new Date(now - 1000 * 60 * 60 * 2).toISOString()
    },
    {
      id: uuidv4(), userId,
      transcript: "Woke up feeling really clear-headed. Made coffee and sat with the morning light for a while before reaching for my phone. It's funny how just 15 minutes of quiet completely changes the trajectory of the day.",
      durationSeconds: 131, tags: ['Calm'], dominantEmotion: 'Calm',
      aiInsight: "You consistently report higher clarity when you delay phone usage in the mornings. This '15 minutes of quiet' seems like a powerful anchor practice for you.",
      createdAt: new Date(now - 1000 * 60 * 60 * 24).toISOString()
    },
    {
      id: uuidv4(), userId,
      transcript: "Went to the farmers market with Priya. It was so nice to just wander without a plan for once. Found this incredible mango jam. I realize I need more of these unstructured weekends.",
      durationSeconds: 245, tags: ['Joy'], dominantEmotion: 'Joy',
      aiInsight: "Unstructured social time is a distinct driver of joy for you. You've noted twice this month that removing 'plans' leads to better weekends.",
      createdAt: new Date(now - 1000 * 60 * 60 * 48).toISOString()
    },
    {
      id: uuidv4(), userId,
      transcript: "Called mom today. It was good. A bit emotional but in a warm way. Realised how much I miss just sitting with her. We talked about nothing and everything.",
      durationSeconds: 220, tags: ['Grateful'], dominantEmotion: 'Grateful',
      aiInsight: "Family calls that feel 'warm' tend to surface around mid-week for you. There's a pattern of reaching out when work stress builds — and it consistently helps.",
      createdAt: new Date(now - 1000 * 60 * 60 * 72).toISOString()
    },
    {
      id: uuidv4(), userId,
      transcript: "Feeling stuck with the project. Can't seem to get into the flow. Everything feels harder than it should right now. I keep second-guessing every decision.",
      durationSeconds: 118, tags: ['Frustrated'], dominantEmotion: 'Frustrated',
      aiInsight: "When you're stuck, you tend to describe the feeling as things being 'harder than they should be' — this language has appeared in 3 entries. Consider: what would it look like to lower the bar temporarily?",
      createdAt: new Date(now - 1000 * 60 * 60 * 96).toISOString()
    },
  ];

  const all = getAll();
  all.unshift(...demoEntries);
  persist(all);
};

export default {
  createEntry, getEntries, getEntry, deleteEntry,
  getEntryCount, getStreak, seedDemoEntries, getTagStyle, EMOTION_STYLES
};
