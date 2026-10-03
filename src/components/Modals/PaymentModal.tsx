import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRealtime } from '../../context/RealtimeContext';
import { PaymentSubmission, PaymentMethod } from '../../types';
import { 
  CreditCard, 
  Copy, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  XCircle, 
  Zap, 
  PhoneCall, 
  Check, 
  X,
  ShieldCheck
} from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const { addToast, refreshTrigger } = useRealtime();

  const [method, setMethod] = useState<PaymentMethod>('bkash');
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'enterprise'>('pro');
  const [senderNumber, setSenderNumber] = useState('');
  const [trxId, setTrxId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [userPayments, setUserPayments] = useState<PaymentSubmission[]>([]);

  // Merchant numbers
  const merchantNumbers = {
    bkash: '01700-112233',
    nagad: '01900-445566'
  };

  const planDetails = {
    pro: {
      name: 'Pro Developer Plan',
      bdt: 550,
      usd: 5,
      features: ['50 Active Hosted Sites', '5 GB Cloud Storage', 'Password Protection', 'Unlimited Version Rollback']
    },
    enterprise: {
      name: 'Enterprise Cloud Plan',
      bdt: 1650,
      usd: 15,
      features: ['9,999+ Hosted Sites', '50 GB Cloud Storage', 'Custom Domain CNAME', '24/7 Priority Support']
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUserPayments();
    }
  }, [isOpen, refreshTrigger]);

  const fetchUserPayments = () => {
    fetch(`/api/payments?username=${currentUser.username}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setUserPayments(data);
      })
      .catch(() => {});
  };

  const copyMerchantNumber = () => {
    const num = merchantNumbers[method].replace('-', '');
    navigator.clipboard.writeText(num);
    setCopiedNumber(true);
    addToast({
      type: 'info',
      title: 'Number Copied',
      description: `${method.toUpperCase()} number ${merchantNumbers[method]} copied to clipboard`
    });
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderNumber.trim() || !trxId.trim()) {
      addToast({
        type: 'warning',
        title: 'Missing Fields',
        description: 'Please provide both your Sender Phone Number and Transaction ID.'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/payments/bkash-nagad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          username: currentUser.username,
          method,
          senderNumber: senderNumber.trim(),
          trxId: trxId.trim().toUpperCase(),
          plan: selectedPlan
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Payment submission failed.');
      }

      addToast({
        type: 'success',
        title: 'Payment Queued for Review',
        description: 'Transaction ID received. Manual verification in progress (typically 1-5 mins).'
      });

      setSenderNumber('');
      setTrxId('');
      fetchUserPayments();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Submission Error',
        description: err.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden shadow-pink-500/10"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/20">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Manual bKash & Nagad Payment Gateway
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  INSTANT VERIFY
                </span>
              </h3>
              <p className="text-xs text-slate-400">Upgrade your hosting limits with zero credit card friction</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {/* Plan Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Select Cloud Tier</label>
            <div className="grid sm:grid-cols-2 gap-3">
              <div
                onClick={() => setSelectedPlan('pro')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedPlan === 'pro'
                    ? 'border-cyan-400 bg-cyan-950/30 shadow-md shadow-cyan-500/10'
                    : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-white">Pro Developer</span>
                  <span className="text-xs font-bold text-cyan-400">৳550 / month</span>
                </div>
                <p className="text-[11px] text-slate-400">50 Hosted Sites • 5GB Storage • Version History</p>
              </div>

              <div
                onClick={() => setSelectedPlan('enterprise')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedPlan === 'enterprise'
                    ? 'border-pink-400 bg-pink-950/30 shadow-md shadow-pink-500/10'
                    : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-white">Enterprise Cloud</span>
                  <span className="text-xs font-bold text-pink-400">৳1,650 / month</span>
                </div>
                <p className="text-[11px] text-slate-400">Unlimited Sites (9,999+) • 50GB Storage • Custom Domain</p>
              </div>
            </div>
          </div>

          {/* Payment Method Switcher */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Choose Payment Method</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMethod('bkash')}
                className={`p-3 rounded-xl border flex items-center justify-center gap-3 transition-all ${
                  method === 'bkash'
                    ? 'border-pink-500 bg-pink-500/10 text-white font-bold'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-pink-500" />
                <span>bKash (Send Money / Payment)</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('nagad')}
                className={`p-3 rounded-xl border flex items-center justify-center gap-3 transition-all ${
                  method === 'nagad'
                    ? 'border-amber-500 bg-amber-500/10 text-white font-bold'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span>Nagad (Send Money)</span>
              </button>
            </div>
          </div>

          {/* Step-by-Step Payment Instructions */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              How to Complete Payment ({method.toUpperCase()}):
            </h4>
            <ol className="text-xs text-slate-400 space-y-2 list-decimal list-inside leading-relaxed">
              <li>Open your <strong>{method === 'bkash' ? 'bKash' : 'Nagad'} App</strong> or dial *247# / *167#.</li>
              <li>Select <strong>Send Money</strong> or <strong>Payment</strong>.</li>
              <li>
                Enter Official Merchant Number:
                <div className="inline-flex items-center gap-2 ml-2 px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs font-bold">
                  <span>{merchantNumbers[method]}</span>
                  <button
                    type="button"
                    onClick={copyMerchantNumber}
                    className="text-cyan-400 hover:text-white p-0.5"
                    title="Copy Number"
                  >
                    {copiedNumber ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </li>
              <li>Amount: <strong className="text-white">৳{planDetails[selectedPlan].bdt} BDT</strong></li>
              <li>Reference: <code className="text-cyan-400 bg-slate-900 px-1 py-0.5 rounded">{currentUser.username}</code></li>
              <li>Copy the <strong>Transaction ID (TrxID)</strong> from confirmation SMS and submit below.</li>
            </ol>
          </div>

          {/* Submission Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Sender {method.toUpperCase()} Mobile Number
                </label>
                <input
                  type="text"
                  required
                  value={senderNumber}
                  onChange={e => setSenderNumber(e.target.value)}
                  placeholder="e.g. 01711234567"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-pink-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Transaction ID (TrxID)
                </label>
                <input
                  type="text"
                  required
                  value={trxId}
                  onChange={e => setTrxId(e.target.value)}
                  placeholder="e.g. 9K4M8Z1P"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-pink-400 placeholder-slate-500 focus:border-pink-500 outline-none font-mono uppercase font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-pink-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>{isSubmitting ? 'Submitting to Verification Queue...' : `Submit TrxID & Upgrade to ${planDetails[selectedPlan].name}`}</span>
            </button>
          </form>

          {/* User's Previous Submissions */}
          {userPayments.length > 0 && (
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-300">Your Recent Payment Submissions</h4>
              <div className="space-y-2">
                {userPayments.map(pay => (
                  <div key={pay.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="uppercase font-bold text-slate-200">{pay.method}</span>
                        <span className="text-pink-400">TrxID: {pay.trxId}</span>
                        <span className="text-slate-500 text-[10px]">({pay.senderNumber})</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {pay.plan.toUpperCase()} Plan • ৳{pay.amountBdt} BDT • {new Date(pay.submittedAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {pay.status === 'pending' && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[11px] font-mono">
                          <Clock className="w-3 h-3" /> Under Review
                        </span>
                      )}
                      {pay.status === 'approved' && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-mono">
                          <CheckCircle2 className="w-3 h-3" /> Approved
                        </span>
                      )}
                      {pay.status === 'rejected' && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[11px] font-mono" title={pay.rejectionReason || ''}>
                          <XCircle className="w-3 h-3" /> Rejected
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
