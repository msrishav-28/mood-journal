import React from 'react';
import { Outlet, useLocation, Link } from 'react-router';
import { Home, Book, Sparkles, User, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { path: '/home', label: 'Home', icon: Home },
  { path: '/journal', label: 'Journal', icon: Book },
  { path: '/insights', label: 'Insights', icon: Sparkles },
  { path: '/profile', label: 'Profile', icon: User }
];

export default function AppLayout() {
  const location = useLocation();

  return (
    <div className="flex bg-canvas min-h-screen w-full font-sans text-text-main selection:bg-accent selection:text-white">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-canvas-alt bg-surface pt-8 pb-6 px-4 flex-shrink-0">
        <div className="flex items-center gap-2 mb-12 px-2">
          <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center text-white font-serif font-bold text-xl leading-none pt-1">
            S
          </div>
          <span className="font-serif text-2xl tracking-tight text-text-main">Sentia</span>
        </div>

        <nav className="flex flex-col gap-2 flex-grow">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${isActive ? 'bg-accent/10 text-accent font-medium' : 'text-text-muted hover:bg-canvas-alt hover:text-text-main'}`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <Link 
          to="/settings"
          className={`mt-auto px-4 py-3 flex items-center gap-3 rounded-2xl transition-colors ${
            location.pathname === '/settings' 
              ? 'bg-accent/10 text-accent font-medium' 
              : 'text-text-muted hover:text-text-main hover:bg-canvas-alt'
          }`}
        >
          <Settings size={20} />
          <span>Settings</span>
        </Link>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full relative pb-20 md:pb-0 h-screen overflow-y-auto no-scrollbar">
        <div className="max-w-3xl mx-auto h-full flex flex-col pt-8 px-6 pb-24 md:pb-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface/80 backdrop-blur-xl border-t border-canvas-alt z-50">
        <nav className="flex justify-around items-center px-2 py-4 pb-safe">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className="relative flex flex-col items-center justify-center w-16 h-12"
              >
                <motion.div 
                   animate={{ 
                     y: isActive ? -4 : 0, 
                     color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)' 
                   }}
                   transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                </motion.div>
                
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute -bottom-1 w-1 h-1 rounded-full bg-accent"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  );
}
