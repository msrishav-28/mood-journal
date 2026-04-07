# Backend Setup Guide

The Sentia PWA frontend currently uses `localStorage` via the `src/services/` layer to allow for zero-configuration local development.

When you are ready to connect to a real database (NeonDB) and a real AI Provider (OpenAI), follow the steps below.

## 1. Environment Requirements

You will need an `.env` file at the root of your project:

```env
VITE_SUPABASE_URL=your_placeholder_if_using_supabase
VITE_SUPABASE_ANON_KEY=your_placeholder_if_using_supabase

# For NeonDB (Serverless Postgres)
VITE_NEON_DB_URL=postgres://user:password@endpoint.neon.tech/dbname

# For AI
VITE_OPENAI_API_KEY=sk-your-openai-api-key
```

## 2. Database Schema setup (NeonDB)

A complete PostgreSQL schema has been provided in `supabase/schema.sql`.

1. Create an account at [Neon.tech](https://neon.tech) and create a new project.
2. Open the SQL Editor in your Neon dashboard.
3. Copy the contents of `supabase/schema.sql` and run it. 

This will create the following tables:
- `profiles`
- `entries`
- `settings`
- `sessions`

## 3. Transitioning the Service Layer

The frontend components **do not need to change**. They are entirely abstracted from the data source via React Context.

To migrate to a real backend, you simply need to update the files in `src/services/`.

### Update `db.js`
Install the Neon serverless package: `npm install @neondatabase/serverless`

```javascript
// src/services/db.js
import { neon } from '@neondatabase/serverless';

// Replace the mock export with the real Neon client:
const sql = neon(import.meta.env.VITE_NEON_DB_URL);
export default sql;
```

### Update `entries.js`
Change the `localStorage` logic to use the `db.js` SQL client.

```javascript
// Example transformation for createEntry:
import sql from './db';

export const createEntry = async (userId, entryData) => {
  const result = await sql`
    INSERT INTO entries (user_id, transcript, duration_seconds, tags, dominant_emotion, ai_insight)
    VALUES (${userId}, ${entryData.transcript}, ${entryData.durationSeconds}, ${entryData.tags}, ${entryData.dominantEmotion}, ${entryData.aiInsight})
    RETURNING *;
  `;
  return result[0];
}
```

### Update `ai.js`
Change the simulated delays to real API calls against OpenAI's Whisper and Completion APIs.

```javascript
// Example transformation for analyzeTranscript:
export const analyzeTranscript = async (transcript, persona) => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
         // ... insert prompt here ...
      ]
    })
  });
  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}
```

## 4. Authentication

Currently, `auth.js` mocks Google OAuth and Email/Password auth.

To replace this, you can utilize:
- **Firebase Auth** (Easiest drop-in)
- **Supabase Auth** (If you transition from Neon to Supabase)
- **NextAuth / Auth.js** (If you migrate the Vite wrapper to Next.js in the future)

Simply drop the new provider logic into the functions inside `src/services/auth.js` and the `AuthContext.jsx` will automatically pick up the new tokens and pass them to the application state.
