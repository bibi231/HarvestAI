import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCredits } from '../hooks/useCredits';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const { credits } = useCredits();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const navItems = [
    { name: 'Harvest Center', path: '/app', icon: '🌾' },
    { name: 'Job History', path: '/app/history', icon: '📜' },
    { name: 'Credit Hub', path: '/pricing', icon: '⚡' },
  ];

  return (
    <div className="flex h-screen bg-base overflow-hidden">
      <div className="mesh-bg opacity-30" />
      
      {/* ── Sidebar ── */}
      <aside className="relative z-10 w-64 border-r border-default flex flex-col bg-neutral-950/50 backdrop-blur-xl">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10 select-none cursor-pointer" onClick={() => navigate('/')}>
             <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-black font-black">H</div>
             <span className="font-black text-xl text-primary tracking-tighter uppercase italic">HarvestAI</span>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/app'}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-bold transition-all
                  ${isActive 
                    ? 'bg-accent/10 text-accent border border-accent/20' 
                    : 'text-secondary hover:text-primary hover:bg-elevated border border-transparent'}
                `}
              >
                <span>{item.icon}</span>
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 space-y-4">
          {/* Credit Display */}
          <div className="bento-card bg-accent/5 border-accent/10 p-4">
            <div className="text-[10px] font-black text-accent uppercase mb-1">Available Credits</div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-primary">{credits}</span>
              <NavLink to="/pricing" className="text-[10px] font-bold text-accent hover:underline">Get More +</NavLink>
            </div>
            <div className="mt-2 h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
              <div className="h-full bg-accent" style={{ width: `${Math.min(100, (credits / 500) * 100)}%` }} />
            </div>
          </div>

          {/* User Profile */}
          <div className="flex items-center justify-between pt-4 border-t border-default">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-elevated border border-default flex items-center justify-center text-xs font-bold text-primary">
                {user?.email?.[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-primary truncate">{user?.displayName || 'Active User'}</div>
                <div className="text-[10px] text-muted truncate">{user?.email}</div>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-muted hover:text-error transition-colors"
              title="Logout"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="relative z-0 flex-1 overflow-y-auto">
        <header className="sticky top-0 z-20 h-16 border-b border-default bg-base/50 backdrop-blur-xl px-8 flex items-center justify-between lg:hidden">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-accent rounded flex items-center justify-center text-black font-black text-xs">H</div>
              <span className="font-black text-sm text-primary tracking-tighter uppercase italic">HarvestAI</span>
            </div>
            <button className="p-2 text-primary">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
        </header>

        <div className="max-w-7xl mx-auto py-8 px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
