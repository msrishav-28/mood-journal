/**
 * AI Service — Placeholder
 * 
 * When OpenAI keys are configured, these functions will call
 * Whisper for transcription and GPT-4o for analysis.
 * For now, they return simulated results after a small delay.
 */

const OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const isConfigured = () => OPENAI_KEY && !OPENAI_KEY.startsWith('sk-...');

const EMOTIONS = ['Calm', 'Joy', 'Anxious', 'Frustrated', 'Grateful', 'Reflective', 'Sad'];

const delay = (ms) => new Promise(r => setTimeout(r, ms));

/** 
 * Transcribe audio blob using OpenAI Whisper.
 * Placeholder: returns a mock transcript after a short delay.
 */
export const transcribeAudio = async (audioBlob) => {
  if (isConfigured()) {
    // TODO: Real Whisper API call
    // const formData = new FormData();
    // formData.append('file', audioBlob, 'recording.webm');
    // formData.append('model', 'whisper-1');
    // const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    //   method: 'POST',
    //   headers: { 'Authorization': `Bearer ${OPENAI_KEY}` },
    //   body: formData
    // });
    // const data = await res.json();
    // return data.text;
  }

  // Mock transcription
  await delay(1500);
  
  const mockTranscripts = [
    "I'm feeling a bit overwhelmed today. There's just so much piled up at work, and I really want to just rest this weekend without thinking about the deadline. I keep telling myself it'll be fine, but my body doesn't seem to believe me.",
    "Had a really good morning actually. Made breakfast, went for a short walk. The weather was perfect. I think I needed that reset after yesterday. Feeling cautiously optimistic about the day ahead.",
    "Can't stop thinking about that conversation with my manager. I don't think they meant it harshly, but it landed wrong. I need to figure out how to bring it up without making it weird.",
    "Feeling grateful today. Called an old friend I hadn't spoken to in months. We picked up right where we left off. It reminded me that good connections don't need constant maintenance.",
  ];

  return mockTranscripts[Math.floor(Math.random() * mockTranscripts.length)];
};

/**
 * Analyze a transcript using GPT-4o.
 * Extracts: dominant emotion, tags, AI insight/reflection.
 */
export const analyzeTranscript = async (transcript, persona = 'wellness') => {
  if (isConfigured()) {
    // TODO: Real GPT-4o API call
    // const res = await fetch('https://api.openai.com/v1/chat/completions', { ... });
  }

  await delay(1000);

  // Simple keyword-based mock analysis
  const lower = transcript.toLowerCase();
  let tags = [];
  let dominantEmotion = 'Calm';

  if (lower.includes('overwhelmed') || lower.includes('anxious') || lower.includes('stress') || lower.includes('worry')) {
    tags.push('Anxious');
    dominantEmotion = 'Anxious';
  }
  if (lower.includes('frustrated') || lower.includes('stuck') || lower.includes('angry') || lower.includes('wrong')) {
    tags.push('Frustrated');
    if (!dominantEmotion || dominantEmotion === 'Calm') dominantEmotion = 'Frustrated';
  }
  if (lower.includes('happy') || lower.includes('joy') || lower.includes('great') || lower.includes('good morning') || lower.includes('optimistic')) {
    tags.push('Joy');
    dominantEmotion = 'Joy';
  }
  if (lower.includes('grateful') || lower.includes('thankful') || lower.includes('appreciate') || lower.includes('friend')) {
    tags.push('Grateful');
    dominantEmotion = 'Grateful';
  }
  if (lower.includes('calm') || lower.includes('peaceful') || lower.includes('quiet') || lower.includes('reset')) {
    tags.push('Calm');
  }

  if (tags.length === 0) {
    tags = ['Reflective'];
    dominantEmotion = 'Reflective';
  }

  // Mock AI insight generation
  const insights = {
    Anxious: `You mentioned feeling overwhelmed — this tends to happen when you're carrying tomorrow's worries in today's body. Consider: what's the one thing you can actually control right now?`,
    Frustrated: `There's friction here, and it clearly matters to you. The frustration often signals that something you value isn't being met. What is it, specifically?`,
    Joy: `This energy is worth protecting. Notice what conditions made this feeling possible — time, people, pace — and see if you can create more of them.`,
    Grateful: `Gratitude entries like this one tend to have a lasting positive effect on your mood the following day. Worth remembering when things feel heavy.`,
    Calm: `You sound grounded today. Your calm entries often follow some form of physical movement or time in nature. Is that pattern holding?`,
    Reflective: `There's a lot of processing happening here. You're sitting with complexity, which is a sign of emotional maturity. No need to rush to a conclusion.`,
    Sad: `It's okay to feel this. Your past entries show that sadness for you is often temporary and tends to lift when you reach out to someone you trust.`
  };

  return {
    tags: [...new Set(tags)],
    dominantEmotion,
    aiInsight: insights[dominantEmotion] || insights['Reflective']
  };
};

/**
 * Generate a context-aware journaling prompt.
 */
export const generatePrompt = async (persona = 'wellness', recentEntries = []) => {
  await delay(300);

  const personaPrompts = {
    student: [
      "How did today's classes make you feel?",
      "What's weighing on you about this semester?",
      "Is there something you're proud of from today's study session?",
      "How are you feeling about upcoming exams?"
    ],
    professional: [
      "What's feeling heavy at work today?",
      "How are you feeling as the week begins to settle in?",
      "Did anything at work surprise you today — good or bad?",
      "What would your ideal workday look like right now?"
    ],
    wellness: [
      "What's on your mind right now?",
      "How are you feeling in your body today?",
      "What's one thing you're grateful for right now?",
      "If today had a colour, what would it be and why?"
    ]
  };

  const prompts = personaPrompts[persona] || personaPrompts.wellness;
  return prompts[Math.floor(Math.random() * prompts.length)];
};

export default { transcribeAudio, analyzeTranscript, generatePrompt };
