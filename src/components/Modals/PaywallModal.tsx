import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { CreditCard, Zap, ShieldAlert, X, Check } from 'lucide-react';

export const PaywallModal: React.FC = () => {
  const { isPaywallOpen, closePaywall, currentUser, openPaymentModal } = useAuth();

  if (!isPaywallOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-slate-900 border-2 border-pink-500/50 rounded-2xl shadow-2xl overflow-hidden shadow-pink-500/20 text-center p-6 space-y-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-14 h-14 rounded-2xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center mx-auto text-pink-400">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-extrabold text-white">Free Hosting Quota Reached</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your account ({currentUser.username}) has reached the Free Plan limit of{' '}
            <strong className="text-white">{currentUser.projectsLimit} projects</strong> or{' '}
            <strong className="text-white">{(currentUser.storageLimitKb / 1024).toFixed(0)}MB storage</strong>.
          </p>
        </div>

        {/* Upgrade Highlights */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-left space-y-2 text-xs text-slate-300">
          <div className="text-[11px] font-mono uppercase text-pink-400 font-bold mb-2">Upgrade to Pro Developer:</div>
          <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> 50 Hosted Websites</div>
          <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> 5 GB High-Speed Cloud Storage</div>
          <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Password-Protected Sites</div>
          <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Instant bKash / Nagad Activation (৳550)</div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={() => {
              closePaywall();
              openPaymentModal();
            }}
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-pink-500/25 transition-all flex items-center justify-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            <span>Upgrade via bKash / Nagad Now</span>
          </button>

          <button
            onClick={closePaywall}
            className="w-full py-2 text-xs text-slate-400 hover:text-white"
          >
            Dismiss for now
          </button>
        </div>
      </div>
    </div>
  );
};
