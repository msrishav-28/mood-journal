-- Sentia — NeonDB Postgres Schema
-- Run this against your Neon database to initialize tables.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users / Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL DEFAULT 'User',
  avatar_url TEXT,
  persona TEXT NOT NULL DEFAULT 'wellness' CHECK (persona IN ('student', 'professional', 'wellness')),
  password_hash TEXT, -- for email/password auth
  google_id TEXT,     -- for Google OAuth
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Journal Entries
CREATE TABLE IF NOT EXISTS entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  audio_url TEXT,
  transcript TEXT NOT NULL DEFAULT '',
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  tags TEXT[] NOT NULL DEFAULT '{}',
  dominant_emotion TEXT,
  ai_insight TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_entries_user_id ON entries(user_id);
CREATE INDEX idx_entries_created_at ON entries(created_at DESC);

-- User Settings
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reminder_enabled BOOLEAN NOT NULL DEFAULT true,
  reminder_time TEXT NOT NULL DEFAULT '21:00',
  insight_delivery TEXT NOT NULL DEFAULT 'weekly' CHECK (insight_delivery IN ('daily', 'weekly', 'off')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sessions (JWT token tracking)
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
