import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { GraduationCap, Briefcase, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { seedDemoEntries } from '../services/entries';

const PERSONAS = [
  {
    id: 'student',
    title: 'Student',
    description: 'Managing academic stress, exams, and social life.',
    icon: GraduationCap,
    color: 'bg-orange-50 text-orange-600',
    border: 'border-orange-100'
  },
  {
    id: 'professional',
    title: 'Professional',
    description: 'Balancing career pressure and avoiding burnout.',
    icon: Briefcase,
    color: 'bg-blue-50 text-blue-600',
    border: 'border-blue-100'
  },
  {
    id: 'wellness',
    title: 'General Wellness',
    description: 'Seeking self-reflection, gratitude, and growth.',
    icon: Heart,
    color: 'bg-accent/10 text-accent',
    border: 'border-accent/20'
  }
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const { updateSetting } = useSettings();
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!selected) return;
    setLoading(true);
    
    try {
      await updateProfile({ persona: selected });
      updateSetting('persona', selected);
      
      // Seed demo entries for first-time users
      if (user?.id) {
        await seedDemoEntries(user.id);
      }
      
      navigate('/home');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-canvas p-6 items-center justify-center font-sans">
      <div className="w-full max-w-md">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="w-16 h-16 rounded-3xl bg-accent mx-auto mb-6 flex items-center justify-center text-white font-serif font-bold text-4xl shadow-float">
            S
          </div>
          <h1 className="text-3xl font-serif text-text-main mb-3">
            Welcome{user?.displayName ? `, ${user.displayName}` : ''}.
          </h1>
          <p className="text-text-muted text-lg">To personalize your space, tell us what brings you here.</p>
        </motion.div>

        <div className="flex flex-col gap-4 mb-10">
          {PERSONAS.map((p, idx) => {
            const isSelected = selected === p.id;
            const Icon = p.icon;
            
            return (
              <motion.button
                key={p.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => setSelected(p.id)}
                className={`w-full text-left p-5 flex items-start gap-4 rounded-3xl border-2 transition-all duration-300 ${isSelected ? 'border-accent bg-surface shadow-soft scale-[1.02]' : 'border-transparent bg-canvas-alt hover:bg-surface'}`}
              >
                <div className={`p-3 rounded-2xl ${p.color}`}>
                  <Icon size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-text-main mb-1">{p.title}</h3>
                  <p className="text-text-muted text-sm leading-relaxed">{p.description}</p>
                </div>
              </motion.button>
            )
          })}
        </div>

        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.5 }}
        >
          <button
            onClick={handleContinue}
            disabled={!selected || loading}
            className={`w-full py-4 rounded-full font-semibold text-lg transition-all duration-300 ${selected && !loading ? 'bg-accent text-white shadow-float hover:bg-accent-hover' : 'bg-canvas-alt text-text-muted opacity-50 cursor-not-allowed'}`}
          >
            {loading ? 'Setting up...' : 'Continue'}
          </button>
        </motion.div>

      </div>
    </div>
  );
}
