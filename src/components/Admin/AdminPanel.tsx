import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRealtime } from '../../context/RealtimeContext';
import { 
  Project, 
  User, 
  PaymentSubmission, 
  AuditLog, 
  AdminSettings, 
  Announcement 
} from '../../types';
import { 
  ShieldCheck, 
  Users, 
  CreditCard, 
  Server, 
  AlertTriangle, 
  Check, 
  X, 
  Trash2, 
  RefreshCw, 
  Radio, 
  Send, 
  HardDrive, 
  Lock, 
  Unlock, 
  Ban, 
  Search, 
  Globe, 
  Eye, 
  Cpu, 
  FolderDown, 
  Terminal, 
  RotateCcw,
  Sparkles,
  Zap,
  Clock
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const { logoutAdmin, usersList, refreshUsers } = useAuth();
  const { addToast, refreshTrigger, onlineCount, latencyMs, isConnected } = useRealtime();

  const [activeTab, setActiveTab] = useState<'payments' | 'users' | 'projects' | 'governance' | 'broadcast' | 'audit'>('payments');

  // Data states
  const [payments, setPayments] = useState<PaymentSubmission[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [settings, setSettings] = useState<AdminSettings | null>(null);

  // Search & Filter
  const [userSearch, setUserSearch] = useState('');
  const [projectSearch, setProjectSearch] = useState('');
  const [rejectionModal, setRejectionModal] = useState<{ paymentId: string; reason: string } | null>(null);
  const [takedownModal, setTakedownModal] = useState<{ projectId: string; reason: string } | null>(null);

  // Broadcast state
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastType, setBroadcastType] = useState<'info' | 'warning' | 'alert'>('info');

  // Inactivity timeout (15 mins countdown)
  const [timeoutSeconds, setTimeoutSeconds] = useState(900);

  useEffect(() => {
    fetchAllData();
  }, [refreshTrigger]);

  const handleExitSession = () => {
    logoutAdmin();
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeoutSeconds(prev => {
        if (prev <= 1) {
          handleExitSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchAllData = () => {
    fetch('/api/payments')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setPayments(data); });

    fetch('/api/projects')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setAllProjects(data); });

    fetch('/api/admin/audit-logs')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setAuditLogs(data); });

    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => setSettings(data));

    refreshUsers();
  };

  // bKash/Nagad: One-Click Approve
  const handleApprovePayment = async (paymentId: string) => {
    try {
      const res = await fetch(`/api/admin/payments/${paymentId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminUsername: 'samir_admin' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      addToast({
        type: 'success',
        title: 'Payment Approved (✓)',
        description: 'User plan upgraded in real-time and storage quota credited.'
      });
      fetchAllData();
    } catch (e: any) {
      addToast({ type: 'error', title: 'Approval Failed', description: e.message });
    }
  };

  // bKash/Nagad: One-Click Reject
  const handleConfirmReject = async () => {
    if (!rejectionModal) return;
    try {
      const res = await fetch(`/api/admin/payments/${rejectionModal.paymentId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: rejectionModal.reason || 'Invalid Transaction ID / Unverified SMS',
          adminUsername: 'samir_admin'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      addToast({
        type: 'warning',
        title: 'Payment Rejected (✗)',
        description: 'Flagged invalid payment with reason recorded.'
      });
      setRejectionModal(null);
      fetchAllData();
    } catch (e: any) {
      addToast({ type: 'error', title: 'Rejection Failed', description: e.message });
    }
  };

  // User Blacklist Toggle
  const handleToggleUserBlacklist = async (user: User) => {
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBlacklisted: !user.isBlacklisted })
      });
      const updated = await res.json();
      addToast({
        type: 'info',
        title: updated.isBlacklisted ? 'User Blacklisted' : 'User Restored',
        description: `Access updated for ${user.username}`
      });
      fetchAllData();
    } catch (e: any) {
      addToast({ type: 'error', title: 'Update Failed', description: e.message });
    }
  };

  // Manual Upgrade / Downgrade
  const handleSetUserPlan = async (user: User, newPlan: 'free' | 'pro' | 'enterprise') => {
    try {
      const storageLimitKb = newPlan === 'enterprise' ? 52428800 : newPlan === 'pro' ? 5242880 : 51200;
      const projectsLimit = newPlan === 'enterprise' ? 9999 : newPlan === 'pro' ? 50 : 5;

      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: newPlan, storageLimitKb, projectsLimit })
      });
      const updated = await res.json();
      addToast({
        type: 'success',
        title: 'Plan Updated Manually',
        description: `${user.username} is now on ${newPlan.toUpperCase()}`
      });
      fetchAllData();
    } catch (e: any) {
      addToast({ type: 'error', title: 'Update Failed', description: e.message });
    }
  };

  // Project: One-Click Takedown
  const handleConfirmTakedown = async () => {
    if (!takedownModal) return;
    try {
      const res = await fetch(`/api/admin/projects/${takedownModal.projectId}/takedown`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: takedownModal.reason })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      addToast({
        type: 'warning',
        title: 'Project Takedown Executed',
        description: 'Hosted site immediately unpublished from global edge nodes.'
      });
      setTakedownModal(null);
      fetchAllData();
    } catch (e: any) {
      addToast({ type: 'error', title: 'Takedown Failed', description: e.message });
    }
  };

  // Broadcast Message
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;

    try {
      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: broadcastTitle,
          message: broadcastMessage,
          type: broadcastType
        })
      });
      const data = await res.json();
      addToast({
        type: 'success',
        title: 'Global Announcement Dispatched',
        description: 'Pushed to all active client sessions via WebSocket.'
      });
      setBroadcastTitle('');
      setBroadcastMessage('');
      fetchAllData();
    } catch (e: any) {
      addToast({ type: 'error', title: 'Broadcast Failed', description: e.message });
    }
  };

  // Platform Settings Update
  const handleSaveSettings = async (updatedFields: Partial<AdminSettings>) => {
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      const data = await res.json();
      setSettings(data);
      addToast({
        type: 'success',
        title: 'Platform Governance Synced',
        description: 'Global settings updated.'
      });
    } catch (e: any) {
      addToast({ type: 'error', title: 'Save Failed', description: e.message });
    }
  };

  // Maintenance Actions
  const handleClearCache = async () => {
    const res = await fetch('/api/admin/maintenance/clear-cache', { method: 'POST' });
    const data = await res.json();
    addToast({
      type: 'success',
      title: 'Cache Cleared',
      description: data.message
    });
  };

  const handleBackupDb = async () => {
    const res = await fetch('/api/admin/maintenance/backup-db', { method: 'POST' });
    const data = await res.json();
    addToast({
      type: 'success',
      title: 'Database Backup Saved',
      description: `Generated file: ${data.filename}`
    });
  };

  const pendingPayments = payments.filter(p => p.status === 'pending');
  const filteredUsers = usersList.filter(u =>
    u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );
  const filteredProjects = allProjects.filter(p =>
    p.title.toLowerCase().includes(projectSearch.toLowerCase()) ||
    p.slug.toLowerCase().includes(projectSearch.toLowerCase()) ||
    p.username.toLowerCase().includes(projectSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Admin Top Command Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-rose-950/60 via-slate-900 to-slate-900 border-2 border-rose-500/40 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white">Super Admin Command Center</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                MASTER CLEARANCE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Real-Time Node Heartbeat: {latencyMs}ms • Active Sockets: {onlineCount} • Session Auto-Lock in {Math.floor(timeoutSeconds / 60)}m {timeoutSeconds % 60}s
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAllData}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:bg-slate-700"
            title="Refresh All Real-time Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleExitSession}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-950/50"
          >
            Exit Admin Session
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('payments')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'payments'
              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>bKash/Nagad Queue</span>
          {pendingPayments.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold">
              {pendingPayments.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'users'
              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Database ({usersList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('projects')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'projects'
              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>All Hosted Sites ({allProjects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('governance')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'governance'
              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Platform & Maintenance</span>
        </button>

        <button
          onClick={() => setActiveTab('broadcast')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'broadcast'
              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Global Broadcast</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'audit'
              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Immutable Audit Trail</span>
        </button>
      </div>

      {/* SECTION 1: Pending Premium Verification Queue */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Pending bKash & Nagad Verification Queue</h3>
              <p className="text-xs text-slate-400">Review user TrxIDs and SMS sender numbers with 1-click validation</p>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/50 px-3 py-1 rounded-lg border border-cyan-800/40">
              Total Transactions: {payments.length}
            </span>
          </div>

          {payments.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
              No payments submitted yet.
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map(pay => (
                <div
                  key={pay.id}
                  className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                    pay.status === 'pending'
                      ? 'bg-slate-900 border-amber-500/50 shadow-md shadow-amber-950/20'
                      : 'bg-slate-950 border-slate-800/80 opacity-90'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-mono">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        pay.method === 'bkash' ? 'bg-pink-500/20 text-pink-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {pay.method}
                      </span>
                      <span className="text-white font-bold text-sm">TrxID: {pay.trxId}</span>
                      <span className="text-slate-400 text-xs">Sender: {pay.senderNumber}</span>
                    </div>

                    <div className="text-xs text-slate-400 flex items-center gap-3">
                      <span>User: <strong className="text-cyan-300">@{pay.username}</strong></span>
                      <span>Target Plan: <strong className="text-white uppercase">{pay.plan}</strong></span>
                      <span>Amount: <strong className="text-emerald-400">৳{pay.amountBdt} BDT (${pay.amountUsd})</strong></span>
                      <span className="text-slate-500">{new Date(pay.submittedAt).toLocaleString()}</span>
                    </div>

                    {pay.rejectionReason && (
                      <div className="text-xs text-rose-400 mt-1">Rejection Reason: {pay.rejectionReason}</div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {pay.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleApprovePayment(pay.id)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors shadow-md shadow-emerald-950/30"
                          title="One-click Approve"
                        >
                          <Check className="w-4 h-4" />
                          <span>Approve (✓)</span>
                        </button>

                        <button
                          onClick={() => setRejectionModal({ paymentId: pay.id, reason: '' })}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg transition-colors"
                          title="One-click Reject with reason"
                        >
                          <X className="w-4 h-4" />
                          <span>Reject (✗)</span>
                        </button>
                      </>
                    ) : (
                      <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold uppercase ${
                        pay.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                        'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}>
                        {pay.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: User Database Management Matrix */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                placeholder="Search user database..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none"
              />
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Registered Accounts: {usersList.length}
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 border-b border-slate-800 text-[11px] font-mono text-slate-400">
                <tr>
                  <th className="p-3.5">USER</th>
                  <th className="p-3.5">TIER PLAN</th>
                  <th className="p-3.5">STORAGE QUOTA</th>
                  <th className="p-3.5">SITES</th>
                  <th className="p-3.5">STATUS</th>
                  <th className="p-3.5 text-right">COMMANDS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-white">{user.username}</div>
                      <div className="text-[11px] text-slate-400 font-sans">{user.email}</div>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                        user.plan === 'enterprise' ? 'bg-amber-500/20 text-amber-300' :
                        user.plan === 'pro' ? 'bg-indigo-500/20 text-indigo-300' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {user.plan}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div>{(user.storageUsedKb / 1024).toFixed(1)} / {(user.storageLimitKb / 1024).toFixed(0)} MB</div>
                    </td>
                    <td className="p-3.5">
                      <div>{user.projectsCount} / {user.projectsLimit}</div>
                    </td>
                    <td className="p-3.5">
                      {user.isBlacklisted ? (
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px]">SUSPENDED</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">ACTIVE</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      {/* One-click plan upgrade/downgrade */}
                      {user.plan !== 'pro' && (
                        <button
                          onClick={() => handleSetUserPlan(user, 'pro')}
                          className="px-2 py-1 rounded bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-[11px]"
                          title="Upgrade to Pro"
                        >
                          +Pro
                        </button>
                      )}
                      {user.plan !== 'enterprise' && (
                        <button
                          onClick={() => handleSetUserPlan(user, 'enterprise')}
                          className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px]"
                          title="Upgrade to Enterprise"
                        >
                          +Enterprise
                        </button>
                      )}
                      {user.plan !== 'free' && (
                        <button
                          onClick={() => handleSetUserPlan(user, 'free')}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
                          title="Revoke / Downgrade to Free"
                        >
                          Revoke
                        </button>
                      )}

                      {/* Blacklist toggle */}
                      <button
                        onClick={() => handleToggleUserBlacklist(user)}
                        className={`p-1 rounded ${user.isBlacklisted ? 'text-emerald-400 hover:bg-emerald-950/40' : 'text-rose-400 hover:bg-rose-950/40'}`}
                        title={user.isBlacklisted ? 'Unban user' : 'Suspend & Blacklist User'}
                      >
                        <Ban className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 3: Centralized Hosted Repository & One-Click Takedown */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={projectSearch}
                onChange={e => setProjectSearch(e.target.value)}
                placeholder="Search hosted sites by title, user, slug..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none"
              />
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Total Global Hosted Deployments: {allProjects.length}
            </div>
          </div>

          <div className="space-y-3">
            {filteredProjects.map(proj => (
              <div
                key={proj.id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-white">{proj.title}</span>
                    <span className="text-cyan-400">/{proj.username}/{proj.slug}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded ${proj.isPublished ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                      {proj.isPublished ? 'LIVE' : 'TAKEN DOWN'}
                    </span>
                  </div>
                  <div className="text-slate-400 mt-1 flex items-center gap-4 text-[11px] font-mono">
                    <span>Views: {proj.views.toLocaleString()}</span>
                    <span>Storage: {proj.storageKb} KB</span>
                    <span>Version: {proj.activeVersion}</span>
                    {proj.takedownReason && <span className="text-rose-400">Reason: {proj.takedownReason}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`/view/${proj.username}/${proj.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    Inspect
                  </a>

                  {proj.isPublished && (
                    <button
                      onClick={() => setTakedownModal({ projectId: proj.id, reason: '' })}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-950/40"
                    >
                      One-Click Takedown
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: Platform Governance & Maintenance */}
      {activeTab === 'governance' && settings && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" />
              Platform Branding & Edge Configuration
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 mb-1 block">Platform Site Title</label>
                <input
                  type="text"
                  value={settings.siteTitle}
                  onChange={e => handleSaveSettings({ siteTitle: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 mb-1 block">bKash Official Merchant Number</label>
                <input
                  type="text"
                  value={settings.bkashMerchantNumber}
                  onChange={e => handleSaveSettings({ bkashMerchantNumber: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 mb-1 block">Nagad Official Merchant Number</label>
                <input
                  type="text"
                  value={settings.nagadMerchantNumber}
                  onChange={e => handleSaveSettings({ nagadMerchantNumber: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 mb-1 block">Malware Scanner Sensitivity</label>
                <select
                  value={settings.malwareSensitivity}
                  onChange={e => handleSaveSettings({ malwareSensitivity: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white outline-none"
                >
                  <option value="high">High (Strict XSS & Phishing Blocking)</option>
                  <option value="medium">Medium (Standard Detection)</option>
                  <option value="relaxed">Relaxed (Permit Experimental JS)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-rose-400" />
              Global Maintenance & System Actions
            </h3>

            {/* Maintenance Mode Toggle */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Global Maintenance Mode</div>
                <div className="text-[11px] text-slate-400">Displays custom maintenance page worldwide</div>
              </div>
              <button
                onClick={() => handleSaveSettings({ maintenanceMode: !settings.maintenanceMode })}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                  settings.maintenanceMode ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300'
                }`}
              >
                {settings.maintenanceMode ? 'ACTIVE (OFFLINE)' : 'INACTIVE (ONLINE)'}
              </button>
            </div>

            {settings.maintenanceMode && (
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Maintenance Notice Message</label>
                <textarea
                  rows={2}
                  value={settings.maintenanceMessage}
                  onChange={e => handleSaveSettings({ maintenanceMessage: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white outline-none resize-none"
                />
              </div>
            )}

            {/* Maintenance Routine Buttons */}
            <div className="pt-2 space-y-2">
              <button
                onClick={handleClearCache}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Cpu className="w-4 h-4" />
                <span>Clear Server Disk I/O & Memory Cache</span>
              </button>

              <button
                onClick={handleBackupDb}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <FolderDown className="w-4 h-4" />
                <span>Create Database JSON Snapshot Backup</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: Global Broadcast Messaging System */}
      {activeTab === 'broadcast' && (
        <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-cyan-400" />
              Global Broadcast Messaging Center
            </h3>
            <p className="text-xs text-slate-400">Pushes instant animated alerts to all users worldwide via WebSocket stream</p>
          </div>

          <form onSubmit={handleSendBroadcast} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Announcement Title</label>
              <input
                type="text"
                required
                value={broadcastTitle}
                onChange={e => setBroadcastTitle(e.target.value)}
                placeholder="e.g. Scheduled Network Maintenance or New Region Added"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Message Content</label>
              <textarea
                rows={3}
                required
                value={broadcastMessage}
                onChange={e => setBroadcastMessage(e.target.value)}
                placeholder="Type global announcement message..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Alert Level</label>
              <div className="flex gap-3">
                {(['info', 'warning', 'alert'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setBroadcastType(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                      broadcastType === t ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Broadcast Globally via WebSocket</span>
            </button>
          </form>
        </div>
      )}

      {/* SECTION 6: Immutable Admin Audit Trail */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Immutable Administrative Audit Logs</h3>
            <span className="text-xs font-mono text-slate-500">{auditLogs.length} Records</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 max-h-[500px] overflow-y-auto space-y-2 font-mono text-xs">
            {auditLogs.map(log => (
              <div key={log.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="text-cyan-400 font-bold">[{log.action}]</span>
                    <span>Actor: {log.actor}</span>
                    <span>IP: {log.ip}</span>
                  </div>
                  <div className="text-slate-200 mt-1">{log.details}</div>
                </div>
                <span className="text-[10px] text-slate-500 shrink-0">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {rejectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h4 className="text-base font-bold text-white">Reject bKash/Nagad Submission</h4>
            <textarea
              rows={3}
              value={rejectionModal.reason}
              onChange={e => setRejectionModal({ ...rejectionModal, reason: e.target.value })}
              placeholder="Provide reason (e.g. Transaction ID was not found on merchant statement)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none resize-none"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setRejectionModal(null)} className="px-4 py-2 text-xs text-slate-400">Cancel</button>
              <button onClick={handleConfirmReject} className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs">Reject Submission</button>
            </div>
          </div>
        </div>
      )}

      {/* Takedown Modal */}
      {takedownModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h4 className="text-base font-bold text-white">Execute One-Click Website Takedown</h4>
            <p className="text-xs text-slate-400">This will immediately take the website offline worldwide.</p>
            <textarea
              rows={3}
              value={takedownModal.reason}
              onChange={e => setTakedownModal({ ...takedownModal, reason: e.target.value })}
              placeholder="State takedown reason (e.g. Phishing / Malware detected)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none resize-none"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setTakedownModal(null)} className="px-4 py-2 text-xs text-slate-400">Cancel</button>
              <button onClick={handleConfirmTakedown} className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs">Confirm Takedown</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
