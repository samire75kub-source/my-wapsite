import React, { useState } from 'react';
import { useRealtime } from '../context/RealtimeContext';
import { useAuth } from '../context/AuthContext';
import { Locale, TRANSLATIONS } from '../utils/i18n';
import { 
  Terminal, 
  Search, 
  Globe2, 
  ShieldCheck, 
  Zap, 
  CreditCard, 
  Code2, 
  User as UserIcon, 
  LogOut,
  ChevronDown,
  Layers,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  currentTab: 'home' | 'ide' | 'projects' | 'analytics' | 'billing';
  setCurrentTab: (tab: 'home' | 'ide' | 'projects' | 'analytics' | 'billing') => void;
  openSearch: () => void;
  locale: Locale;
  setLocale: (l: Locale) => void;
  onDeployClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  openSearch,
  locale,
  setLocale,
  onDeployClick
}) => {
  const { isConnected, onlineCount, latencyMs } = useRealtime();
  const { currentUser, switchUser, usersList, openPaymentModal } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  const t = TRANSLATIONS[locale] || TRANSLATIONS.en;

  const languages: { code: Locale; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'bn', label: 'বাংলা (bKash)', flag: '🇧🇩' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'ar', label: 'العربية', flag: '🇸🇦' }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyan-500/20 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setCurrentTab('home')}
            className="flex items-center gap-3 group text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-400/40 transition-all">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Terminal className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-wider bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 bg-clip-text text-transparent">
                  NEXUS<span className="text-white">HOST</span>
                </span>
                <span className="hidden sm:inline-flex text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  GLOBAL EDGE
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block font-mono">Real-Time Cloud Hosting</p>
            </div>
          </button>

          {/* Real-time Status Badge */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
            <span className="text-slate-300 font-mono text-[11px]">
              {isConnected ? `EDGE ONLINE • ${latencyMs}ms • ${onlineCount} PEERS` : 'DISCONNECTED'}
            </span>
          </div>
        </div>

        {/* Global Search Bar Trigger */}
        <div className="flex-1 max-w-md hidden md:block">
          <button
            onClick={openSearch}
            className="w-full flex items-center justify-between px-3.5 py-2 text-sm text-slate-400 bg-slate-900/90 border border-slate-800 rounded-xl hover:border-cyan-500/50 hover:bg-slate-900 transition-all"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-cyan-400" />
              <span className="text-xs">{t.searchPlaceholder || 'Search hosted projects...'}</span>
            </div>
            <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400 bg-slate-800 border border-slate-700 rounded">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Navigation & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile search trigger */}
          <button
            onClick={openSearch}
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1">
            <button
              onClick={() => setCurrentTab('home')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentTab === 'home'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setCurrentTab('ide')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentTab === 'ide'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-cyan-400" />
              Cloud IDE
            </button>
            <button
              onClick={() => setCurrentTab('projects')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentTab === 'projects'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              My Projects
            </button>
            <button
              onClick={() => setCurrentTab('billing')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentTab === 'billing'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-pink-400" />
              bKash / Nagad
            </button>
          </nav>

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-slate-900 border border-slate-800"
            >
              <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline font-mono uppercase">{locale}</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {isLangMenuOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLocale(l.code);
                      setIsLangMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-left ${
                      locale === l.code ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{l.flag} {l.label}</span>
                    {locale === l.code && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Host Website CTA */}
          <button
            onClick={onDeployClick}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 hover:from-cyan-300 hover:to-teal-200 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            title="Deploy & Host Website Live on Global Edge"
          >
            <Zap className="w-3.5 h-3.5 fill-current animate-pulse" />
            <span>Host Website Live</span>
          </button>

          {/* User Account & Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700"
            >
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white text-[11px] font-bold">
                {currentUser.username[0]?.toUpperCase()}
              </div>
              <div className="text-left hidden lg:block">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-200 max-w-[90px] truncate">{currentUser.username}</span>
                  <span className={`text-[9px] font-mono px-1 rounded uppercase ${
                    currentUser.plan === 'enterprise' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    currentUser.plan === 'pro' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {currentUser.plan}
                  </span>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="p-2 border-b border-slate-800 mb-2">
                  <p className="text-xs font-semibold text-white">{currentUser.username}</p>
                  <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                  
                  {/* Quota Gauge */}
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono mb-1">
                      <span>Storage Quota</span>
                      <span>{(currentUser.storageUsedKb / 1024).toFixed(1)} / {(currentUser.storageLimitKb / 1024).toFixed(0)} MB</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-400 rounded-full transition-all"
                        style={{ width: `${Math.min(100, (currentUser.storageUsedKb / currentUser.storageLimitKb) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {currentUser.plan === 'free' && (
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        openPaymentModal();
                      }}
                      className="mt-3 w-full py-1.5 text-center text-xs font-bold rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/20 hover:opacity-95"
                    >
                      Upgrade via bKash / Nagad
                    </button>
                  )}
                </div>

                <div className="text-[10px] uppercase font-mono text-slate-500 px-2 py-1">Quick Switch Profile:</div>
                {usersList.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      switchUser(u.id);
                      setIsUserMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs ${
                      u.id === currentUser.id ? 'bg-cyan-500/10 text-cyan-300' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="truncate">{u.username}</span>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">{u.plan}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
