import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useAuth } from '../hooks/useAuth';

export default function AuthModal() {
  const { isPricingOpen, closePricing } = useAuthStore();
  const { signInWithGoogle, signIn, signUp } = useAuth();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isPricingOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isSignUp) await signUp(email, password);
      else await signIn(email, password);
      closePricing();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      closePricing();
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={closePricing}>
      <motion.div 
        className="modal" 
        onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button className="modal-x" onClick={closePricing}>✕</button>
        
        <div className="text-center mb-8">
          <div className="nav-logo-mark mx-auto mb-4">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#100800" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h2>{isSignUp ? 'Create your account' : 'Welcome back'}</h2>
          <p className="text-text-2 text-[14px]">Harvest leads and extract data in seconds.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="field">
            <span className="field-label">Email Address</span>
            <input 
              type="email" 
              className="input" 
              placeholder="name@company.com" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <span className="field-label">Password</span>
            <input 
              type="password" 
              className="input" 
              placeholder="••••••••" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="err-card">{error}</div>}

          <button className="btn btn-primary btn-xl btn-full" disabled={loading}>
            {loading ? <span className="spin spin-xs" /> : isSignUp ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <div className="flex items-center gap-4 my-6">
          <div className="h-[1px] flex-1 bg-border-1" />
          <span className="text-[11px] font-bold text-text-3 uppercase tracking-widest">or</span>
          <div className="h-[1px] flex-1 bg-border-1" />
        </div>

        <button 
          className="btn btn-primary btn-xl btn-full mb-6"
          onClick={handleGoogle}
          disabled={loading}
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="18" height="18" className="mr-2" alt="G" style={{ filter: 'brightness(0)' }} />
          Continue with Google
        </button>

        <p className="text-center text-[13px] text-text-2">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button 
            className="text-amber font-bold hover:underline"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? 'Sign in' : 'Create one for free'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
