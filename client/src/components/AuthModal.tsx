import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp, signInWithGoogle } = useAuth();

  useEffect(() => {
    setMode(initialMode);
    setError('');
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'login') await signIn(email, password);
      else await signUp(email, password);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fade-in transition-all">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-3xl" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md bento-card p-10 bg-black/40 border-white/10 shadow-2xl animate-scale-in">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-muted hover:text-primary transition-colors p-2"
        >
           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
           </svg>
        </button>

        <div className="text-center mb-10">
          <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center text-black font-black text-2xl mx-auto mb-6 shadow-lg shadow-accent/20">H</div>
          <h2 className="text-3xl font-black text-primary italic uppercase tracking-tighter">
            {mode === 'login' ? 'Ident System' : 'Protocol Join'}
          </h2>
          <p className="text-[10px] text-muted font-bold uppercase tracking-[0.2em] mt-3">
             {mode === 'login' ? 'Access your harvesting console' : 'Initialize your industrial account'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl text-error text-[11px] font-black uppercase tracking-widest text-center animate-pulse">
            ERROR_LOG: {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] italic">EMAIL_ADDRESS</label>
            <input 
              type="email"
              placeholder="operator@network.io"
              className="w-full"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] italic">SECURE_CREDENTIAL</label>
            <input 
              type="password"
              placeholder="••••••••"
              className="w-full"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary w-full py-4 text-xs tracking-widest mt-4"
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Execute Login →' : 'Initialize Account →'}
          </button>
        </form>

        <div className="relative my-8 text-center overline-muted">
           <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5" /></div>
           <span className="relative px-4 text-[9px] font-black text-muted uppercase tracking-[0.2em] bg-[#0c0c0c]">or external ident</span>
        </div>

        <button 
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="btn btn-secondary w-full py-4 flex items-center gap-4 group justify-center"
        >
          <svg className="w-4 h-4 transition-transform group-hover:scale-125" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          <span className="text-[10px] uppercase font-black tracking-widest opacity-60 group-hover:opacity-100 italic transition-opacity">Connect with Google</span>
        </button>

        <div className="mt-10 text-center">
           <button 
             onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
             className="text-[10px] font-black text-muted hover:text-accent transition-colors uppercase tracking-[0.2em] italic"
           >
             {mode === 'login' ? "Need a new identifier? JOIN PROTOCOL" : "Already have ident? BACK TO LOGIN"}
           </button>
        </div>
      </div>
    </div>
  );
}
