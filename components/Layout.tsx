import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onLogout }) => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path 
      ? 'text-rose-600 font-bold bg-rose-50' 
      : 'text-slate-500 hover:text-rose-500 hover:bg-slate-50';
  };

  const navLinks = [
    { path: '/', label: 'Minhas Séries' },
    { path: '/search', label: 'Buscar' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      
      {/* Wrapper for Content (Constrained Width) */}
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex-grow flex flex-col">
        {/* Header Desktop & Mobile Wrapper */}
        <header className="sticky top-0 sm:top-4 z-50 bg-white/90 backdrop-blur-md border-b sm:border border-white/40 shadow-sm sm:rounded-2xl px-4 sm:px-6 py-3 mb-8 -mx-4 sm:mx-0 transition-all">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group" onClick={() => setIsMenuOpen(false)}>
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-rose-500 via-orange-400 to-yellow-500 rounded-xl flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-md group-hover:rotate-6 transition-transform duration-300">
                M
              </div>
              <span className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
                Mara<span className="text-rose-500">tonei</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden sm:flex items-center gap-2">
              {navLinks.map(link => (
                <Link key={link.path} to={link.path} className={`px-3 py-1 rounded-full transition-all ${isActive(link.path)}`}>
                  {link.label}
                </Link>
              ))}
              <div className="w-px h-6 bg-slate-200 mx-1"></div>
              <Link to="/settings" className={`p-2 rounded-full transition-colors ${location.pathname === '/settings' ? 'bg-slate-100 text-rose-500' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`} title="Configurações">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </Link>
              <button 
                onClick={onLogout}
                className="p-2 rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors ml-1" 
                title="Sair"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button 
              className="sm:hidden p-2 text-slate-600 hover:text-rose-500 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>

          {/* Mobile Dropdown */}
          {isMenuOpen && (
            <div className="sm:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-100 shadow-lg animate-fade-in p-4 flex flex-col gap-2">
              {navLinks.map(link => (
                <Link 
                  key={link.path} 
                  to={link.path} 
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-between ${isActive(link.path)}`}
                >
                  {link.label}
                  <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </Link>
              ))}
              <div className="h-px bg-slate-100 my-1"></div>
              <Link 
                  to="/settings"
                  onClick={() => setIsMenuOpen(false)} 
                  className={`px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-between ${isActive('/settings')}`}
              >
                Configurações
                <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </Link>
              <button 
                  onClick={() => {
                    onLogout();
                    setIsMenuOpen(false);
                  }} 
                  className="px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-between text-red-500 hover:bg-red-50"
              >
                Sair da Conta
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>
            </div>
          )}
        </header>
        
        <main className="flex-grow pb-12">
          {children}
        </main>
      </div>

      {/* Footer spans full width now because it is outside the constrained container */}
      <Footer />
    </div>
  );
};

export default Layout;