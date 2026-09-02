'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { 
  Scan, 
  History, 
  Settings, 
  Sun, 
  Moon, 
  User as UserIcon, 
  LogOut, 
  Menu, 
  X, 
  Sparkles,
  Database
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { user, signOutUser, isFirebaseActive } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const navLinks = [
    { name: 'Scan Studio', href: '/scan', icon: Scan },
    { name: 'History', href: '/history', icon: History },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/10 px-4 sm:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-fuchsia-500 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all duration-300">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
              Face<span className="gradient-text">Lens</span>
            </span>
            <span className="text-[10px] tracking-widest uppercase font-semibold text-slate-400 -mt-1">
              AI Face Analytics
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/60 p-1.5 rounded-full border border-cyan-500/20 backdrop-blur-md">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'btn-futuristic-tab btn-futuristic-tab-active'
                    : 'btn-futuristic-tab hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : ''}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Theme Toggle + Auth User controls */}
        <div className="hidden md:flex items-center gap-3">
          
          {/* Firebase / Demo mode badge */}
          <div 
            title={isFirebaseActive ? 'Connected to Firebase' : 'Running in Local Demo Storage Mode'}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-900/80 border border-cyan-500/30 text-slate-300 shadow-inner"
          >
            <Database className={`w-3.5 h-3.5 ${isFirebaseActive ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span>{isFirebaseActive ? 'Firebase Active' : 'Demo Mode'}</span>
          </div>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-full btn-futuristic-secondary text-slate-300 hover:text-white"
            aria-label="Toggle dark/light mode"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          {/* User profile / Log in */}
          {mounted && user ? (
            <div className="flex items-center gap-3 pl-2 border-l border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-900 border border-cyan-500/50 flex items-center justify-center text-cyan-300 font-bold text-xs shadow-md">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-200 truncate max-w-[100px]">
                    {user.displayName || 'Explorer'}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate max-w-[100px]">
                    {user.isDemo ? 'Guest User' : user.email}
                  </span>
                </div>
              </div>

              <button
                onClick={signOutUser}
                className="p-2 rounded-xl btn-futuristic-danger text-xs flex items-center gap-1"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : mounted && !user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 text-xs font-semibold btn-futuristic-secondary rounded-full"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-5 py-2 text-xs font-bold btn-futuristic-primary rounded-full"
              >
                Get Started
              </Link>
            </div>
          ) : null}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl btn-futuristic-secondary text-slate-300"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl btn-futuristic-secondary text-slate-300"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden pt-4 pb-3 border-t border-white/10 mt-3 space-y-3">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                    isActive
                      ? 'btn-futuristic-tab btn-futuristic-tab-active'
                      : 'btn-futuristic-tab'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {link.name}
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            {mounted && user ? (
              <div className="flex items-center justify-between px-4 py-2 bg-slate-900/60 rounded-xl">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-medium text-slate-200">{user.displayName || 'User'}</span>
                </div>
                <button
                  onClick={() => {
                    signOutUser();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs text-rose-400 font-semibold hover:underline"
                >
                  Sign Out
                </button>
              </div>
            ) : mounted && !user ? (
              <div className="flex flex-col gap-2 px-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-sm font-semibold btn-futuristic-secondary rounded-xl"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-sm font-bold btn-futuristic-primary rounded-xl"
                >
                  Get Started
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </header>
  );
}
