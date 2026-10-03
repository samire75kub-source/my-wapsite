import React, { useState, useEffect } from 'react';
import { RealtimeProvider } from './context/RealtimeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Locale } from './utils/i18n';
import { Navbar } from './components/Navbar';
import { LandingHero } from './components/LandingHero';
import { CodeEditor } from './components/Editor/CodeEditor';
import { UserDashboard } from './components/Dashboard/UserDashboard';
import { AdminPanel } from './components/Admin/AdminPanel';
import { PaymentModal } from './components/Modals/PaymentModal';
import { PaywallModal } from './components/Modals/PaywallModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { LiveChatWidget } from './components/LiveChatWidget';
import { ToastContainer } from './components/ToastContainer';
import { Project } from './types';
import { ShieldCheck, KeyRound, ArrowLeft, Terminal, AlertTriangle, Eye, EyeOff } from 'lucide-react';

function getIsAdminPath(): boolean {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  return path === '/admin' || path.startsWith('/admin/') || hash === '#admin' || hash === '#/admin';
}

function MainApp() {
  const { isAdminLoggedIn, loginAdmin, logoutAdmin } = useAuth();
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(getIsAdminPath);
  const [currentTab, setCurrentTab] = useState<'home' | 'ide' | 'projects' | 'analytics' | 'billing'>('home');
  const [locale, setLocale] = useState<Locale>('en');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [ideInitialProject, setIdeInitialProject] = useState<Project | null>(null);
  const [openDeployTrigger, setOpenDeployTrigger] = useState(0);

  // Admin login form states
  const [adminPassword, setAdminPassword] = useState('');
  const [adminTotp, setAdminTotp] = useState('123456');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);

  // Listen to browser navigation (back/forward and URL changes)
  useEffect(() => {
    const handleLocationChange = () => {
      setIsAdminRoute(getIsAdminPath());
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Keyboard shortcut for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Master Hosting Action: Switches to IDE and immediately triggers Deploy Modal!
  const handleHostWebsite = () => {
    setIdeInitialProject(null);
    setCurrentTab('ide');
    setOpenDeployTrigger(prev => prev + 1);
  };

  const handleOpenIdeWithProject = (project: Project | null) => {
    setIdeInitialProject(project);
    setCurrentTab('ide');
  };

  const handleSelectSearchProject = (project: Project) => {
    setIdeInitialProject(project);
    setCurrentTab('ide');
  };

  const handleExitAdmin = () => {
    logoutAdmin();
    window.history.pushState({}, '', '/');
    setIsAdminRoute(false);
  };

  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoading(true);
    setAdminError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: adminPassword.trim(),
          totpCode: adminTotp.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication rejected');
      }

      loginAdmin(data.token, data.role || 'super_admin');
      setAdminPassword('');
    } catch (err: any) {
      setAdminError(err.message || 'Administrative verification failed');
    } finally {
      setAdminLoading(false);
    }
  };

  // ==========================================
  // VIEW A: DEDICATED SEPARATE ADMIN PORTAL
  // (Only rendered when URL path is /admin)
  // ==========================================
  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-[#04060d] text-slate-100 flex flex-col font-sans selection:bg-rose-500/30 selection:text-rose-200">
        {/* Dedicated Admin Header */}
        <header className="border-b border-rose-950/60 bg-slate-950/90 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-extrabold text-sm text-white tracking-widest">
                  NEXUSHOST // ROOT ADMIN
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30">
                  ROUTE: /admin
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">Isolated Administration Network Control</p>
            </div>
          </div>

          <button
            onClick={handleExitAdmin}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-mono transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Exit to Public Site</span>
          </button>
        </header>

        {/* Admin Content Area */}
        <main className="flex-1 flex flex-col">
          {isAdminLoggedIn ? (
            <AdminPanel />
          ) : (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="w-full max-w-md bg-slate-900/90 border-2 border-rose-500/40 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 shadow-rose-950/40">
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400 mb-4">
                    <KeyRound className="w-7 h-7" />
                  </div>
                  <h2 className="text-xl font-extrabold text-white">Super Admin Access Portal</h2>
                  <p className="text-xs text-slate-400 font-mono">
                    Restricted Area. Master password &amp; 2FA TOTP verification required.
                  </p>
                </div>

                {adminError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{adminError}</span>
                  </div>
                )}

                <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Master Password (Default: <code className="text-rose-400">1234</code>)
                    </label>
                    <div className="relative">
                      <input
                        type={showAdminPassword ? 'text' : 'password'}
                        required
                        value={adminPassword}
                        onChange={e => setAdminPassword(e.target.value)}
                        placeholder="Enter master password"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 pr-10 text-sm text-slate-100 placeholder-slate-500 focus:border-rose-500 outline-none font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      2FA TOTP Code (Default: <code className="text-rose-400">123456</code>)
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={adminTotp}
                      onChange={e => setAdminTotp(e.target.value)}
                      placeholder="6-digit TOTP code"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-center font-mono tracking-widest text-cyan-300 focus:border-rose-500 outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={adminLoading}
                    className="w-full py-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-rose-950/50 transition-all flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{adminLoading ? 'Authenticating...' : 'Authorize Admin Session'}</span>
                  </button>
                </form>

                <div className="text-center pt-2">
                  <button
                    onClick={handleExitAdmin}
                    className="text-xs text-slate-500 hover:text-slate-300 font-mono"
                  >
                    &larr; Return to Public Platform (/)
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

        <ToastContainer />
      </div>
    );
  }

  // ==========================================
  // VIEW B: PUBLIC PLATFORM APPLICATION
  // (No admin buttons or links visible)
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        openSearch={() => setIsSearchOpen(true)}
        locale={locale}
        setLocale={setLocale}
        onDeployClick={handleHostWebsite}
      />

      {/* Main Tab Content */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <LandingHero
            locale={locale}
            onOpenIde={() => setCurrentTab('ide')}
            onDeployClick={handleHostWebsite}
            onExploreClick={() => setIsSearchOpen(true)}
          />
        )}

        {currentTab === 'ide' && (
          <CodeEditor
            initialProject={ideInitialProject}
            openDeployTrigger={openDeployTrigger}
            onDeploySuccess={(savedProj) => {
              setIdeInitialProject(savedProj);
            }}
          />
        )}

        {(currentTab === 'projects' || currentTab === 'analytics' || currentTab === 'billing') && (
          <UserDashboard
            onOpenIdeWithProject={handleOpenIdeWithProject}
            onDeployNew={handleHostWebsite}
          />
        )}
      </main>

      {/* Public Footer */}
      {currentTab !== 'ide' && (
        <footer className="border-t border-slate-900 bg-slate-950/80 py-8 px-4 text-center text-xs text-slate-500 font-mono">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>NEXUSHOST GLOBAL CLUSTER • REAL-TIME EDGE ENGINE</span>
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <button onClick={() => setCurrentTab('home')} className="hover:text-cyan-400">Overview</button>
              <button onClick={() => setCurrentTab('ide')} className="hover:text-cyan-400">Cloud IDE</button>
              <button onClick={() => setCurrentTab('projects')} className="hover:text-cyan-400">Dashboard</button>
            </div>
            <div>
              &copy; {new Date().getFullYear()} NexusHost Global. All rights reserved.
            </div>
          </div>
        </footer>
      )}

      {/* Global Modals & Widgets */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectProject={handleSelectSearchProject}
      />
      <ActivePaymentModal />
      <PaywallModal />
      <LiveChatWidget />
      <ToastContainer />
    </div>
  );
}

// Helper wrapper for AuthContext driven payment modal
function ActivePaymentModal() {
  const { isPaymentModalOpen, closePaymentModal } = useAuth();
  return (
    <PaymentModal
      isOpen={isPaymentModalOpen}
      onClose={closePaymentModal}
    />
  );
}

export default function App() {
  return (
    <RealtimeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </RealtimeProvider>
  );
}
