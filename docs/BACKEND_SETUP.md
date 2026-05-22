# Backend Setup Guide

Sentia PWA frontend currently supports a zero-configuration local development experience using `localStorage` fallbacks. 

When you are ready to connect to a real database (Firebase Firestore), set up real authentication (Firebase Auth), and configure real Speech-to-Text / AI analysis (Deepgram & OpenAI), follow the steps below.

---

## 1. Environment Configuration

Create a `.env` file at the root of your project (you can copy `.env.example` as a starting point) and supply the keys below:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-firebase-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# AI & Speech-to-Text Configuration
VITE_DEEPGRAM_API_KEY=your-deepgram-api-key
VITE_OPENAI_API_KEY=sk-your-openai-api-key
```

---

## 2. Firebase Setup (Authentication & Cloud Firestore)

Sentia uses **Firebase Authentication** for user login (Email/Password and Google OAuth) and **Cloud Firestore** for data persistence.

### Step 1: Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and follow the prompts.

### Step 2: Enable Firebase Authentication
1. In the left navigation, click **Build** -> **Authentication**.
2. Click **Get Started**.
3. Under the **Sign-in method** tab, enable the following providers:
   * **Email/Password**: Enable both "Email/Password" and "Email link (passwordless sign-in)" (optional, only basic Email/Password is required).
   * **Google**: Enable it, choose a project support email, and save.
4. Copy the web app configuration settings and add them to your `.env` file.

### Step 3: Enable Cloud Firestore
1. In the left navigation, click **Build** -> **Firestore Database**.
2. Click **Create database**.
3. Choose your database location and select **Start in production mode** or **Start in test mode**.
4. In the **Rules** tab, publish the following security rules to restrict read/write access to authenticated users:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User Profiles: only the user can read/write their own profile doc
    match /profiles/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Journal Entries: only the owner can read/write their own entries
    match /entries/{entryId} {
      allow read, write: if request.auth != null && resource.data.userId == userId || (resource == null && request.resource.data.userId == request.auth.uid);
    }
    
    // User Settings: only the user can read/write their settings doc
    match /settings/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 3. AI Providers Setup (Deepgram & OpenAI)

Sentia supports real-time, high-accuracy speech transcription and automatic AI insights.

### Speech-to-Text (STT) Transcription
* **Deepgram (Primary)**:
  * Obtain an API key from [Deepgram](https://console.deepgram.com/).
  * Paste it into `VITE_DEEPGRAM_API_KEY`.
  * Deepgram uses the high-efficiency `nova-2` model for lightning-fast voice journal transcriptions.
* **OpenAI Whisper (Fallback)**:
  * If no Deepgram key is supplied, but an OpenAI key is configured, Sentia falls back to OpenAI Whisper API for transcriptions.

### AI Emotional Insights & Prompts
* **OpenAI GPT-4o-mini**:
  * Obtain an API key from the [OpenAI Developer Platform](https://platform.openai.com/).
  * Paste it into `VITE_OPENAI_API_KEY`.
  * GPT-4o-mini is used to automatically analyze transcripts, identify emotional tags, and generate personalized advice depending on your user's selected persona.

---

## 4. Zero-Config Mode (Local Storage Fallback)

If any of the environment keys are missing, Sentia will output logs to the browser console and gracefully execute in **Local Storage Fallback Mode**. 
* Registrations/Logins are simulated using local caches (`sentia_users`, `sentia_auth`).
* Audio transcriptions are simulated using dynamic mock templates.
* Sentiment/Emotional analyses are performed client-side using keyword mapping rules.

This ensures the app compiles perfectly and is 100% usable right out-of-the-box on local dev or for review deployments (e.g. on Vercel) without any initial setups.
