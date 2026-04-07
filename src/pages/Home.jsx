import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Check, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import * as ai from '../services/ai';
import * as entries from '../services/entries';

const generateWaveBars = () => {
  return Array.from({ length: 15 }).map(() => ({
    height: Math.floor(Math.random() * 20) + 12,
    delay: Math.random() * 0.2
  }));
};

export default function Home() {
  const { user } = useAuth();
  const { settings } = useSettings();

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [processingState, setProcessingState] = useState('idle'); // idle | recording | processing | saved
  const [waveBars, setWaveBars] = useState([]);
  const [smartPrompt, setSmartPrompt] = useState('');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const startTimeRef = useRef(null);

  useEffect(() => {
    setWaveBars(generateWaveBars());
    loadPrompt();
  }, []);

  const loadPrompt = async () => {
    const persona = settings.persona || user?.persona || 'wellness';
    const prompt = await ai.generatePrompt(persona);
    setSmartPrompt(prompt);
  };

  // Greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = user?.displayName?.split(' ')[0] || '';
    if (hour < 12) return `Good morning${name ? `, ${name}` : ''}.`;
    if (hour < 17) return `Good afternoon${name ? `, ${name}` : ''}.`;
    return `Good evening${name ? `, ${name}` : ''}.`;
  };

  // Timer
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processRecording(audioBlob);
      };

      mediaRecorder.start();
      startTimeRef.current = Date.now();
      setIsRecording(true);
      setRecordingTime(0);
      setProcessingState('recording');
      setWaveBars(generateWaveBars());
    } catch (err) {
      console.error('Microphone access denied:', err);
      // Fall back to mock recording
      mockRecord();
    }
  };

  const mockRecord = () => {
    setIsRecording(true);
    setRecordingTime(0);
    setProcessingState('recording');
    setWaveBars(generateWaveBars());
  };

  const stopRecording = () => {
    setIsRecording(false);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      // Mock flow
      processRecording(null);
    }
  };

  const processRecording = async (audioBlob) => {
    setProcessingState('processing');
    const durationSeconds = Math.round((Date.now() - (startTimeRef.current || Date.now())) / 1000) || recordingTime;

    try {
      // Step 1: Transcribe
      const text = await ai.transcribeAudio(audioBlob);
      setTranscript(text);

      // Step 2: Analyze
      const persona = settings.persona || user?.persona || 'wellness';
      const analysis = await ai.analyzeTranscript(text, persona);

      // Step 3: Save entry
      if (user?.id) {
        await entries.createEntry(user.id, {
          transcript: text,
          durationSeconds,
          tags: analysis.tags,
          dominantEmotion: analysis.dominantEmotion,
          aiInsight: analysis.aiInsight
        });
      }

      setProcessingState('saved');
      
      // Reset after showing confirmation
      setTimeout(() => {
        setProcessingState('idle');
        setTranscript('');
        setRecordingTime(0);
        loadPrompt(); // Get fresh prompt
      }, 3000);
    } catch (err) {
      console.error('Processing failed:', err);
      setProcessingState('idle');
    }
  };

  const toggleRecording = () => {
    if (isRecording) stopRecording();
    else startRecording();
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full bg-canvas text-text-main">
      <header className="mb-10">
        <h1 className="font-serif text-3xl font-medium mb-1">{getGreeting()}</h1>
        <p className="text-text-muted text-lg">Ready to unpack your day?</p>
      </header>

      {/* Smart Prompt */}
      <AnimatePresence>
        {processingState === 'idle' && smartPrompt && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10, filter: 'blur(5px)' }}
            className="bg-surface rounded-3xl p-6 shadow-soft mb-8 border border-canvas-alt relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-50">
              <Sparkles className="text-accent" size={40} strokeWidth={1} />
            </div>
            <div className="flex bg-accent/10 w-10 h-10 rounded-full items-center justify-center text-accent mb-4">
              <Sparkles size={20} />
            </div>
            <h3 className="font-serif text-2xl text-text-main leading-snug pr-8">
              {smartPrompt}
            </h3>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Processing / Transcript */}
      <AnimatePresence>
        {processingState === 'processing' && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-grow mb-8 flex flex-col items-center justify-center gap-4"
          >
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <p className="text-text-muted text-sm">Analysing your thoughts...</p>
          </motion.div>
        )}
        {(processingState === 'saved' && transcript) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0 }}
            className="flex-grow mb-8 flex flex-col justify-end"
          >
            <div className="text-xl font-serif leading-relaxed text-text-main/80 pb-4">
              {transcript}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-grow"></div>

      {/* Controls */}
      <div className="flex flex-col items-center justify-end pb-8">
        <div className="h-[60px] flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {isRecording ? (
              <motion.div key="recording-ui" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center gap-2"
              >
                <div className="flex items-center justify-center gap-[3px] h-8">
                  {waveBars.map((bar, i) => (
                    <div key={i} className="w-[3px] rounded-full bg-accent opacity-80"
                      style={{ height: `${bar.height}px`, animation: `wave 0.7s ease-in-out infinite alternate`, animationDelay: `${bar.delay}s` }}
                    />
                  ))}
                </div>
                <div className="text-accent font-semibold flex items-center gap-2 px-4 rounded-full mt-2">
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  {formatTime(recordingTime)}
                </div>
              </motion.div>
            ) : processingState === 'saved' ? (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="text-green-600 font-medium flex items-center gap-2"
              >
                <Check size={20} /> Entry saved
              </motion.div>
            ) : processingState === 'processing' ? (
              <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-accent font-medium"
              >
                Processing...
              </motion.div>
            ) : (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-text-muted mt-6"
              >
                Tap to record
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative mt-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleRecording}
            disabled={processingState === 'processing' || processingState === 'saved'}
            className={`relative z-10 w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center shadow-float transition-colors duration-500
              ${isRecording ? 'bg-[#B56B6B] text-white' 
                : processingState !== 'idle' ? 'bg-canvas-alt text-text-muted cursor-default shadow-none pointer-events-none' 
                : 'bg-accent text-white'}`}
          >
            {isRecording ? <Square size={32} fill="currentColor" /> : <Mic size={36} strokeWidth={2.5} />}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
