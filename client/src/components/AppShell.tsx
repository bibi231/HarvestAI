import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAuthStore } from '../store/authStore';
import { useCredits } from '../hooks/useCredits';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const { credits } = useCredits();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await firebaseSignOut(auth);
    navigate('/');
  };

  const navItems = [
    { name: 'Harvest Center', path: '/app', icon: '🌾' },
    { name: 'Job History', path: '/app/history', icon: '📜' },
    { name: 'Credit Hub', path: '/pricing', icon: '⚡' },
  ];

  return (
    <div className="flex h-screen bg-black overflow-hidden selection:bg-accent/30 selection:text-accent">
      <div className="mesh-bg opacity-40" />
      
      {/* ── Sidebar ── */}
      <aside className="relative z-50 w-72 flex flex-col sidebar-glass border-r border-default">
        <div className="p-10">
          <div 
            className="flex items-center gap-4 mb-14 group cursor-pointer" 
            onClick={() => navigate('/')}
          >
             <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-black font-black text-xl shadow-lg shadow-accent/20 transition-transform group-hover:scale-110">H</div>
             <div className="flex flex-col">
                <span className="font-black text-xl text-primary tracking-tighter uppercase italic leading-none">HarvestAI</span>
                <span className="text-[9px] font-bold text-accent uppercase tracking-widest mt-1">Industrial Scraper Core</span>
             </div>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/app'}
                className={({ isActive }) => `
                  flex items-center gap-4 px-5 py-3.5 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all duration-300 border border-transparent
                  ${isActive 
                    ? 'nav-link-active' 
                    : 'text-secondary hover:text-primary hover:bg-white/[0.03] hover:border-default'}
                `}
              >
                <span className="text-lg opacity-80">{item.icon}</span>
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8 space-y-6">
          {/* Credit Display */}
          <div className="bento-card bg-accent/[0.02] border-accent/20 p-5 group">
            <span className="section-label mb-2 opacity-70 group-hover:opacity-100 transition-opacity">Credits Available</span>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-black text-primary font-mono tracking-tighter transition-all group-hover:text-accent">{credits?.credits ?? 0}</span>
              <NavLink to="/pricing" className="text-[10px] font-black text-accent hover:underline mb-1">REPLENISH +</NavLink>
            </div>
            <div className="mt-4 h-1.5 w-full bg-black/50 rounded-full overflow-hidden border border-default">
              <div className="h-full bg-accent transition-all duration-1000 shadow-[0_0_10px_var(--accent)]" style={{ width: `${Math.min(100, ((credits?.credits ?? 0) / 500) * 100)}%` }} />
            </div>
          </div>

          {/* User Profile */}
          <div className="flex items-center justify-between pt-6 border-t border-default/50">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-elevated border border-default flex items-center justify-center text-sm font-black text-accent shadow-inner">
                {user?.email?.[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black text-primary truncate leading-none uppercase tracking-tighter">{user?.displayName || 'Active User'}</div>
                <div className="text-[10px] text-muted truncate mt-1 lowercase font-medium">{user?.email}</div>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2.5 text-muted hover:text-error hover:bg-error/10 rounded-lg transition-all"
              title="Logout"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="relative z-0 flex-1 overflow-y-auto">
        {/* Mobile Header (Responsive Hide) */}
        <header className="sticky top-0 z-50 h-20 border-b border-default sidebar-glass px-8 flex items-center justify-between lg:hidden transition-all">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-black font-black text-sm">H</div>
              <span className="font-black text-lg text-primary tracking-tighter uppercase italic">HarvestAI</span>
            </div>
            <button className="p-3 bg-elevated border border-default rounded-xl text-primary hover:bg-accent hover:text-black transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
        </header>

        <div className="max-w-7xl mx-auto py-12 px-10 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
