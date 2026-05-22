<div align="center">
  <div style="width: 80px; height: 80px; border-radius: 20px; background-color: #8C9F8C; margin: 0 auto; display: flex; align-items: center; justify-content: center; color: white; font-family: serif; font-size: 40px; font-weight: bold; margin-bottom: 20px;">
    S
  </div>
  
  # Sentia — Voice Journal PWA
  
  **Speak freely. Understand deeply. Grow daily.**

  An emotional wellness PWA that lets you speak your thoughts freely, transcribes them, and uses AI to surface patterns, insights, and reflections. 
  
  Built with a local-first service architecture, designed for a stunning, offline-capable progressive web app experience.

  ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
  ![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
  ![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
  ![Framer Motion](https://img.shields.io/badge/Framer_Motion-black?style=for-the-badge&logo=framer&logoColor=blue)
  ![Lucide](https://img.shields.io/badge/Lucide_Icons-FF6C37?style=for-the-badge&logo=lucide&logoColor=white)
  <br/>
  ![Firebase](https://img.shields.io/badge/firebase-%23039BE5.svg?style=for-the-badge&logo=firebase)
  ![Deepgram](https://img.shields.io/badge/Deepgram-4F46E5?style=for-the-badge&logo=deepgram&logoColor=white)
  ![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)
  ![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)

</div>

---

## Overview

Sentia was built to remove the friction from journaling. Blank pages can be intimidating, and typing feels like work. With Sentia, you simply open the app, tap record, and talk. 

The application transcribes your thoughts using high-performance speech APIs and uses AI to analyze emotional sentiment, automatically tag your entries, and provide gentle, thoughtful reflections ("Sentia Reflects").

## Core Features

- **Voice-First Journaling:** Hands-free recording using the `MediaRecorder` API.
- **Dual-Engine Speech-to-Text:** Employs Deepgram's `nova-2` API (primary) or OpenAI Whisper API (fallback) for transcription.
- **AI-Powered Insights:** Uses OpenAI's `gpt-4o-mini` to extract emotion tags, identify dominant feelings, and generate personalized advice.
- **Beautiful, Calming Interface:** Built with tailwind, custom CSS keyframes (waveform animations), and `framer-motion` for buttery smooth transitions.
- **Comprehensive Desktop & Mobile Layouts:** 
  - Mobile: App-like PWA experience with bottom navigation.
  - Desktop: 3-pane productivity layout for reading, reflecting, and analyzing.
- **Dynamic Mood Arc:** SVG data visualization mapping your emotional journey over the week.
- **Export Anywhere:** Local and flexible data ownership. Export your journals to **PDF (styled)**, **CSV**, or **Plain Text**.
- **Settings & Context:** Adjustable settings for daily reminders, AI delivery preference, and Persona Context (Student, Professional, Wellness) to tailor AI insights.

## Architecture

Sentia operates on a modular **Service Layer Architecture** allowing local-first placeholder usage with a seamless transition to a production cloud backend.

### Project Structure
```text
src/
├── context/         # React Contexts (Auth, Settings)
├── layouts/         # App routing wrappers (Mobile Nav / Desktop Sidebar)
├── pages/           # Core Screens (Home, Journal, Insights, Profile, Settings, Auth)
└── services/        # Backend Abstract Layer (Local Storage for dev, Firebase in cloud)
    ├── ai.js        # Deepgram + OpenAI integration
    ├── auth.js      # Auth service (Firebase Auth / local fallback)
    ├── entries.js   # Entries persistence (Cloud Firestore / local fallback)
    ├── export.js    # PDF generation and CSV parsing
    ├── firebase.js  # Firebase configuration and initialization
    └── settings.js  # Settings persistence (Cloud Firestore / local fallback)
```

For more details on setting up the real backend, database schemas, and firebase rules, see **[Backend Setup Guide](docs/BACKEND_SETUP.md)**.

## Quick Start (Local Development)

The app is currently configured to run entirely in the browser using `localStorage` to simulate backend services. This ensures a zero-friction setup.

```bash
# 1. Clone the repository
git clone https://github.com/msrishav-28/mood-journal.git
cd mood-journal

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Visit `http://localhost:5173` (or the port specified in console) to start using the app.

## Vercel Deployment

This project is fully optimized for **Vercel** deployment out of the box.

1. Push your code to GitHub.
2. Import the project into Vercel.
3. Vercel will automatically detect **Vite**.
4. The `vercel.json` file ensures that React Router Single Page Application (SPA) routing works correctly by rewriting traffic to `index.html`.
5. Deploy!

## Tech Stack

- **Framework:** React 18 (Vite) + React Router v7
- **Styling:** Tailwind CSS + Vanilla CSS (Variables)
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **PDF Export:** jsPDF + jsPDF-AutoTable
- **Target Backend:** Firebase Auth + Cloud Firestore
- **Target AI/STT:** Deepgram (Nova-2) & OpenAI (GPT-4o-mini + Whisper)

## Design System

Sentia uses a custom tailored semantic design system built on custom colors rather than generic utility frameworks:
- **Canvas (`var(--color-canvas)`):** `#F7F6F2` (Warm, paper-like background)
- **Surface (`var(--color-surface)`):** `#FFFFFF` (Crisp, clean containers)
- **Accent (`var(--color-accent)`):** `#8C9F8C` (Sage green, calming primary action color)
- **Text (`var(--color-text-main)`):** `#2C362C` (Deep charcoal, legible and soft)

---
*Built with care for a more mindful daily routine.*
