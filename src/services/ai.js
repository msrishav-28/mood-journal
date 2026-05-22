/**
 * AI Service — Supports Deepgram and OpenAI integration with offline fallbacks
 */

const OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const DEEPGRAM_KEY = import.meta.env.VITE_DEEPGRAM_API_KEY;

const isOpenAIConfigured = !!(
  OPENAI_KEY &&
  !OPENAI_KEY.startsWith('sk-...') &&
  !OPENAI_KEY.startsWith('your-') &&
  !OPENAI_KEY.startsWith('placeholder') &&
  OPENAI_KEY !== ''
);

const isDeepgramConfigured = !!(
  DEEPGRAM_KEY &&
  !DEEPGRAM_KEY.startsWith('your-') &&
  !DEEPGRAM_KEY.startsWith('placeholder') &&
  DEEPGRAM_KEY !== ''
);

const delay = (ms) => new Promise(r => setTimeout(r, ms));

/** 
 * Transcribe audio blob using Deepgram (primary) or OpenAI Whisper (secondary).
 * Falls back to simulated mock transcription if neither is configured.
 */
export const transcribeAudio = async (audioBlob) => {
  // 1. Try Deepgram API
  if (isDeepgramConfigured) {
    try {
      console.log('[AI Service] Attempting Deepgram transcription...');
      const res = await fetch('https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${DEEPGRAM_KEY}`,
          'Content-Type': audioBlob.type || 'audio/webm'
        },
        body: audioBlob
      });
      
      if (!res.ok) {
        throw new Error(`Deepgram API returned status ${res.status}`);
      }
      
      const data = await res.json();
      const transcript = data.results?.channels?.[0]?.alternatives?.[0]?.transcript;
      if (transcript) {
        console.log('[AI Service] Deepgram transcription successful:', transcript);
        return transcript;
      }
    } catch (error) {
      console.error('[AI Service] Deepgram transcription failed:', error);
    }
  }

  // 2. Try OpenAI Whisper API as fallback
  if (isOpenAIConfigured) {
    try {
      console.log('[AI Service] Attempting OpenAI Whisper transcription fallback...');
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.webm');
      formData.append('model', 'whisper-1');
      
      const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_KEY}`
        },
        body: formData
      });
      
      if (!res.ok) {
        throw new Error(`OpenAI Whisper API returned status ${res.status}`);
      }
      
      const data = await res.json();
      if (data.text) {
        console.log('[AI Service] OpenAI Whisper transcription successful:', data.text);
        return data.text;
      }
    } catch (error) {
      console.error('[AI Service] OpenAI Whisper transcription failed:', error);
    }
  }

  // 3. Simulated Fallback
  console.log('[AI Service] No speech-to-text service configured or successful. Returning mock transcription.');
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
 * Analyze a transcript using GPT-4o-mini.
 * Extracts: dominant emotion, tags, AI insight/reflection.
 */
export const analyzeTranscript = async (transcript, persona = 'wellness') => {
  if (isOpenAIConfigured) {
    try {
      console.log('[AI Service] Attempting OpenAI Chat GPT-4o-mini analysis...');
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content: `You are an empathetic, insightful mood journal assistant. Analyze the user's transcript and respond in JSON format.
You must return a JSON object with:
1. "dominantEmotion": one of the following strings: "Calm", "Joy", "Anxious", "Frustrated", "Grateful", "Reflective", "Sad".
2. "tags": an array of 1 to 3 relevant emotion tags (from the list above, or others that are suitable).
3. "aiInsight": a concise (1-3 sentences) reflection or prompt based on the user's entry, tailored to their selected persona: "${persona}".
Ensure the tone is warm, non-judgmental, and matching the persona style (e.g., student, professional, wellness).`
            },
            {
              role: 'user',
              content: transcript
            }
          ]
        })
      });
      
      if (!res.ok) {
        throw new Error(`OpenAI API returned status ${res.status}`);
      }
      
      const data = await res.json();
      const content = JSON.parse(data.choices[0].message.content);
      console.log('[AI Service] OpenAI Chat analysis successful:', content);
      return {
        dominantEmotion: content.dominantEmotion || 'Reflective',
        tags: content.tags || ['Reflective'],
        aiInsight: content.aiInsight || 'Thank you for sharing your thoughts today.'
      };
    } catch (error) {
      console.error('[AI Service] OpenAI Chat analysis failed, falling back to mock:', error);
    }
  }

  // Fallback to local keyword-based mock analysis
  await delay(1000);

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
export const generatePrompt = async (persona = 'wellness', _recentEntries = []) => {
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

export default { transcribeAudio, analyzeTranscript, generatePrompt, isOpenAIConfigured, isDeepgramConfigured };
