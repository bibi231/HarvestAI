import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useHarvestStore } from '../store/harvestStore';
import { Icon } from './shared/Icon';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, credits, setUser } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    setUser(null);
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/app', icon: 'zap' as const },
    { name: 'Job History', path: '/history', icon: 'database' as const },
    { name: 'Buy Credits', path: '/pricing', icon: 'trendingUp' as const },
    { name: 'Settings', path: '/settings', icon: 'settings' as const },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-8">
        <div
          className="flex items-center gap-4 mb-12 group cursor-pointer"
          onClick={() => { navigate('/'); setSidebarOpen(false); }}
        >
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-black shadow-lg shadow-accent/20">
            <Icon name="zap" className="fill-black" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-2xl text-primary tracking-tighter uppercase italic leading-none">HarvestAI</span>
            <span className="text-[9px] font-black text-accent uppercase tracking-[0.3em] mt-1 opacity-60">AI Data Extraction</span>
          </div>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/app'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center gap-4 px-5 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-[0.18em] transition-all border border-transparent group relative overflow-hidden",
                isActive
                  ? "bg-accent/10 text-accent border-accent/20"
                  : "text-white/40 hover:text-white hover:bg-white/5 hover:border-white/10"
              )}
            >
              <Icon name={item.icon} size={15} />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-8 space-y-6">
        {/* Credit display */}
        <div className="rounded-xl p-5 bg-accent/[0.03] border border-accent/15">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black text-accent uppercase tracking-widest">Credits</span>
            <NavLink to="/pricing" onClick={() => setSidebarOpen(false)} className="text-[10px] font-bold text-white/30 hover:text-accent transition-colors">Top up +</NavLink>
          </div>
          <div className="text-3xl font-black text-white tracking-tighter mb-3">
            {credits ? (credits.freeRemaining + credits.paidCredits).toLocaleString() : '0'}
          </div>
          <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden border border-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (((credits?.freeRemaining || 0) + (credits?.paidCredits || 0)) / 1000) * 100)}%` }}
              className="h-full bg-accent transition-all duration-1000"
            />
          </div>
        </div>

        {/* User */}
        <div className="flex items-center justify-between pt-5 border-t border-white/5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-sm font-black text-accent overflow-hidden flex-shrink-0">
              {user?.photoURL
                ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                : user?.email?.[0].toUpperCase() || 'H'
              }
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">{user?.displayName || 'Your Account'}</div>
              <div className="text-[10px] text-white/25 truncate">{user?.email || ''}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-white/25 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all flex-shrink-0"
            title="Sign out"
          >
            <Icon name="logOut" size={16} />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-bg-base overflow-hidden">
      <div className="mesh-bg opacity-40" />

      {/* ── Mobile overlay ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar (desktop: always visible; mobile: slide-in) ── */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : undefined }}
        className={cn(
          "relative z-50 w-72 flex flex-col sidebar-glass border-r border-white/5 flex-shrink-0",
          "hidden lg:flex",
        )}
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -288 }}
            animate={{ x: 0 }}
            exit={{ x: -288 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 left-0 z-50 w-72 flex flex-col sidebar-glass border-r border-white/5 lg:hidden"
          >
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Main content ── */}
      <div className="relative z-0 flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <div className="flex items-center gap-4 px-5 py-4 border-b border-white/5 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-white/60 hover:text-white transition-all"
            aria-label="Open menu"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="2" y1="4" x2="14" y2="4" />
              <line x1="2" y1="8" x2="14" y2="8" />
              <line x1="2" y1="12" x2="14" y2="12" />
            </svg>
          </button>
          <span className="font-black text-white tracking-tight">HarvestAI</span>
        </div>

        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={typeof window !== 'undefined' ? window.location.pathname : ''}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-7xl mx-auto py-10 px-6 lg:px-10 lg:py-14"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
