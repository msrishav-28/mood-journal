import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Auth() {
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle } = useAuth();
  
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        const user = await signUp(email, password, name || 'User');
        navigate(user.persona ? '/home' : '/onboarding');
      } else {
        const user = await signIn(email, password);
        navigate(user.persona ? '/home' : '/onboarding');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      const user = await signInWithGoogle();
      navigate(user.persona ? '/home' : '/onboarding');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md">
        
        {/* Logo */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="w-16 h-16 rounded-3xl bg-accent mx-auto mb-6 flex items-center justify-center text-white font-serif font-bold text-4xl shadow-float">
            S
          </div>
          <h1 className="text-3xl font-serif text-text-main mb-2">
            {mode === 'signin' ? 'Welcome back.' : 'Create your space.'}
          </h1>
          <p className="text-text-muted">
            {mode === 'signin' ? 'Sign in to continue your journey.' : 'Start your voice journaling journey.'}
          </p>
        </motion.div>

        {/* Google OAuth */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={handleGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-surface border border-canvas-alt rounded-2xl shadow-soft text-text-main font-medium hover:shadow-float hover:border-accent/30 transition-all mb-6"
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </motion.button>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-canvas-alt"></div>
          <span className="text-xs text-text-muted uppercase tracking-wider">or</span>
          <div className="flex-1 h-px bg-canvas-alt"></div>
        </div>

        {/* Form */}
        <motion.form 
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col gap-4"
        >
          <AnimatePresence>
            {mode === 'signup' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="flex items-center gap-3 px-4 py-3 bg-surface border border-canvas-alt rounded-2xl focus-within:border-accent transition-colors">
                  <User className="text-text-muted" size={18} />
                  <input 
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-transparent border-none outline-none flex-grow text-text-main placeholder-text-muted"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-3 px-4 py-3 bg-surface border border-canvas-alt rounded-2xl focus-within:border-accent transition-colors">
            <Mail className="text-text-muted" size={18} />
            <input 
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-transparent border-none outline-none flex-grow text-text-main placeholder-text-muted"
            />
          </div>

          <div className="flex items-center gap-3 px-4 py-3 bg-surface border border-canvas-alt rounded-2xl focus-within:border-accent transition-colors">
            <Lock className="text-text-muted" size={18} />
            <input 
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-transparent border-none outline-none flex-grow text-text-main placeholder-text-muted"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-text-muted hover:text-text-main">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-xl"
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-accent text-white rounded-full font-semibold text-lg shadow-float hover:bg-accent-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            {!loading && <ArrowRight size={20} />}
          </button>
        </motion.form>

        {/* Toggle */}
        <p className="text-center text-text-muted mt-6 text-sm">
          {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }}
            className="text-accent font-semibold hover:underline"
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>

      </div>
    </div>
  );
}
