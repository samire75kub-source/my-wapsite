import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRealtime } from '../../context/RealtimeContext';
import { ShieldCheck, KeyRound, Lock, AlertTriangle, X, Check, Eye, EyeOff } from 'lucide-react';

export const AdminLoginModal: React.FC = () => {
  const { isAdminLoginOpen, closeAdminLogin, loginAdmin } = useAuth();
  const { addToast } = useRealtime();

  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isAdminLoginOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (failedAttempts >= 5) {
      setErrorMsg('Too many failed attempts. Administrative IP temporarily locked for 15 minutes.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: password.trim(),
          totpCode: totpCode.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setFailedAttempts(prev => prev + 1);
        throw new Error(data.error || 'Invalid credentials');
      }

      loginAdmin(data.token, data.role || 'super_admin');
      setPassword('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-slate-900 border-2 border-rose-500/50 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-6 shadow-rose-950/50"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                Admin Command Gateway
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">
                  CONFIDENTIAL
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">Route: /admin-secret-login</p>
            </div>
          </div>
          <button onClick={closeAdminLogin} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Master Admin Password (Default: <code className="text-cyan-400">1234</code>)
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter master password"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 pr-10 text-sm text-slate-100 placeholder-slate-500 focus:border-rose-500 outline-none font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              2FA TOTP Authenticator Code (Root: <code className="text-cyan-400">123456</code>)
            </label>
            <input
              type="text"
              required
              maxLength={6}
              value={totpCode}
              onChange={e => setTotpCode(e.target.value)}
              placeholder="6-digit TOTP code"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-center font-mono tracking-widest text-cyan-300 focus:border-rose-500 outline-none"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1 font-mono">
            <div className="flex justify-between">
              <span>SECURITY PROTOCOL:</span>
              <span className="text-emerald-400">2FA ENFORCED</span>
            </div>
            <div className="flex justify-between">
              <span>FAILED ATTEMPTS:</span>
              <span className={failedAttempts > 0 ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                {failedAttempts} / 5
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-rose-950/50 transition-all flex items-center justify-center gap-2"
          >
            <KeyRound className="w-4 h-4" />
            <span>{isLoading ? 'Verifying Credentials...' : 'Authenticate & Unlock Control Center'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
