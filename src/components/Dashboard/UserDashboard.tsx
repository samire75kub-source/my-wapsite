import React, { useState, useEffect } from 'react';
import { Project, PaymentSubmission, AuditLog } from '../../types';
import { ProjectCard } from './ProjectCard';
import { FileManagerModal } from '../FileManager/FileManagerModal';
import { VersionControlModal } from '../Modals/VersionControlModal';
import { ShareModal } from '../Modals/ShareModal';
import { useAuth } from '../../context/AuthContext';
import { useRealtime } from '../../context/RealtimeContext';
import { 
  Layers, 
  BarChart3, 
  CreditCard, 
  Settings, 
  Plus, 
  Search, 
  ShieldCheck, 
  HardDrive, 
  Zap, 
  Globe2, 
  Clock, 
  User as UserIcon,
  RefreshCw
} from 'lucide-react';

interface UserDashboardProps {
  onOpenIdeWithProject: (project: Project | null) => void;
  onDeployNew: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  onOpenIdeWithProject,
  onDeployNew
}) => {
  const { currentUser, openPaymentModal } = useAuth();
  const { addToast, refreshTrigger } = useRealtime();

  const [activeTab, setActiveTab] = useState<'projects' | 'analytics' | 'billing' | 'settings'>('projects');
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Active Modals
  const [fileManagerProject, setFileManagerProject] = useState<Project | null>(null);
  const [versionsProject, setVersionsProject] = useState<Project | null>(null);
  const [shareProject, setShareProject] = useState<Project | null>(null);

  // Audit logs & billing
  const [payments, setPayments] = useState<PaymentSubmission[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    fetchProjects();
    fetchPayments();
    fetchAuditLogs();
  }, [currentUser.username, refreshTrigger]);

  const fetchProjects = () => {
    setIsLoading(true);
    fetch(`/api/projects?username=${currentUser.username}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setProjects(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };

  const fetchPayments = () => {
    fetch(`/api/payments?username=${currentUser.username}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setPayments(data);
      })
      .catch(() => {});
  };

  const fetchAuditLogs = () => {
    fetch('/api/admin/audit-logs')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Filter logs involving current user
          const filtered = data.filter((l: AuditLog) => l.actor === currentUser.username || l.details.includes(currentUser.username));
          setAuditLogs(filtered);
        }
      })
      .catch(() => {});
  };

  const handleTogglePublish = async (project: Project) => {
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !project.isPublished })
      });
      const updated = await res.json();
      setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
      addToast({
        type: 'info',
        title: updated.isPublished ? 'Website Published Live' : 'Website Unpublished',
        description: `Status toggled for ${project.slug}`
      });
    } catch (e) {
      addToast({ type: 'error', title: 'Error', description: 'Failed to toggle status' });
    }
  };

  const handleCloneProject = async (project: Project) => {
    try {
      const res = await fetch(`/api/projects/${project.id}/clone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser.username })
      });
      const cloned = await res.json();
      setProjects(prev => [cloned, ...prev]);
      addToast({
        type: 'success',
        title: 'Project Cloned',
        description: `Created replica "${cloned.title}"`
      });
    } catch (e) {
      addToast({ type: 'error', title: 'Error', description: 'Failed to clone project' });
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
      setProjects(prev => prev.filter(p => p.id !== projectId));
      addToast({
        type: 'info',
        title: 'Project Removed',
        description: 'Deleted project from global edge network'
      });
    } catch (e) {
      addToast({ type: 'error', title: 'Error', description: 'Failed to delete' });
    }
  };

  const handleSaveFilesFromManager = async (updatedFiles: Record<string, string>) => {
    if (!fileManagerProject) return;
    try {
      const res = await fetch(`/api/projects/${fileManagerProject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: updatedFiles,
          commitNote: 'Updated files via Cloud File Manager'
        })
      });
      const updated = await res.json();
      setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
    } catch (e) {
      addToast({ type: 'error', title: 'Error', description: 'Failed to save files' });
    }
  };

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalViews = projects.reduce((acc, p) => acc + (p.views || 0), 0);
  const totalBandwidth = projects.reduce((acc, p) => acc + (p.bandwidthKb || 0), 0);
  const totalStorage = projects.reduce((acc, p) => acc + (p.storageKb || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* User Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-bold text-xl text-cyan-400">
              {currentUser.username[0]?.toUpperCase()}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white">{currentUser.username}</h1>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                currentUser.plan === 'enterprise' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                currentUser.plan === 'pro' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                'bg-slate-800 text-slate-400'
              }`}>
                {currentUser.plan} PLAN
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Cloud Storage: {(currentUser.storageUsedKb / 1024).toFixed(1)} MB / {(currentUser.storageLimitKb / 1024).toFixed(0)} MB • {projects.length} Sites Deployed
            </p>
          </div>
        </div>

        {/* Top CTA */}
        <div className="flex items-center gap-3">
          {currentUser.plan === 'free' && (
            <button
              onClick={openPaymentModal}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-xs shadow-md shadow-pink-500/20 hover:opacity-95 transition-all"
            >
              Upgrade via bKash / Nagad
            </button>
          )}

          <button
            onClick={onDeployNew}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-cyan-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Deploy New Project</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('projects')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'projects'
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>My Projects ({projects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'analytics'
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Traffic & Bandwidth</span>
        </button>

        <button
          onClick={() => setActiveTab('billing')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'billing'
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>bKash/Nagad Payments</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'settings'
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Account Settings & Audit</span>
        </button>
      </div>

      {/* Tab 1: Projects Matrix */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          {/* Search bar & filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Filter projects by title or slug..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 outline-none"
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Real-Time Sync Active</span>
            </div>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
                <Globe2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">No Hosted Websites Found</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Deploy your first HTML5/CSS/JS application now to get a live global URL.
                </p>
              </div>
              <button
                onClick={onDeployNew}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-bold text-xs shadow-md"
              >
                Launch Cloud IDE
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onEditInIde={(p) => onOpenIdeWithProject(p)}
                  onOpenFileManager={(p) => setFileManagerProject(p)}
                  onOpenVersions={(p) => setVersionsProject(p)}
                  onOpenShare={(p) => setShareProject(p)}
                  onCloneProject={handleCloneProject}
                  onDeleteProject={handleDeleteProject}
                  onTogglePublish={handleTogglePublish}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Analytics & Traffic */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="text-xs text-slate-400 font-mono mb-1">TOTAL GLOBAL REQUESTS</div>
              <div className="text-3xl font-extrabold text-white font-mono">{totalViews.toLocaleString()}</div>
              <div className="text-xs text-emerald-400 mt-2 font-mono">100% Cache hit ratio</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="text-xs text-slate-400 font-mono mb-1">BANDWIDTH CONSUMED</div>
              <div className="text-3xl font-extrabold text-cyan-400 font-mono">{(totalBandwidth / 1024).toFixed(1)} MB</div>
              <div className="text-xs text-slate-400 mt-2 font-mono">Unlimited edge throughput</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="text-xs text-slate-400 font-mono mb-1">STORAGE ALLOCATED</div>
              <div className="text-3xl font-extrabold text-teal-400 font-mono">{totalStorage} KB</div>
              <div className="text-xs text-slate-400 mt-2 font-mono">
                {((totalStorage / currentUser.storageLimitKb) * 100).toFixed(1)}% of quota
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white">Project Traffic Breakdown</h3>
            <div className="space-y-3">
              {projects.map(p => (
                <div key={p.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-cyan-400 font-semibold">{p.slug}</span>
                    <span className="text-slate-400">{p.title}</span>
                  </div>
                  <div className="flex items-center gap-6 font-mono text-slate-300">
                    <span>{p.views.toLocaleString()} hits</span>
                    <span>{(p.bandwidthKb / 1024).toFixed(1)} MB</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: bKash / Nagad Billing */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Manual bKash & Nagad Submissions</h3>
              <p className="text-xs text-slate-400">View real-time status of your payment verifications</p>
            </div>
            <button
              onClick={openPaymentModal}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-xs shadow-md"
            >
              Submit New TrxID
            </button>
          </div>

          {payments.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
              No payments submitted yet for {currentUser.username}.
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map(pay => (
                <div key={pay.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="uppercase font-bold text-white">{pay.method}</span>
                      <span className="text-pink-400 font-bold">TrxID: {pay.trxId}</span>
                      <span className="text-slate-500">({pay.senderNumber})</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      {pay.plan.toUpperCase()} Cloud Tier • ৳{pay.amountBdt} BDT • Submitted: {new Date(pay.submittedAt).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold uppercase ${
                      pay.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                      pay.status === 'rejected' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' :
                      'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}>
                      {pay.status === 'pending' ? 'Verification Pending' : pay.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Account Settings & Audit Logs */}
      {activeTab === 'settings' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white">Account Profile</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-500 font-mono">USERNAME</label>
                <div className="font-semibold text-white mt-0.5">{currentUser.username}</div>
              </div>
              <div>
                <label className="text-slate-500 font-mono">EMAIL ADDRESS</label>
                <div className="font-semibold text-white mt-0.5">{currentUser.email}</div>
              </div>
              <div>
                <label className="text-slate-500 font-mono">STORAGE LIMIT</label>
                <div className="font-semibold text-white mt-0.5">{(currentUser.storageLimitKb / 1024).toFixed(0)} MB ({currentUser.plan.toUpperCase()})</div>
              </div>
              <div>
                <label className="text-slate-500 font-mono">PROJECT HOSTING LIMIT</label>
                <div className="font-semibold text-white mt-0.5">{currentUser.projectsLimit} Active Sites</div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white">Security & Activity Audit Logs</h3>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {auditLogs.length === 0 ? (
                <div className="text-slate-500 text-xs py-4 text-center">No recent audit logs.</div>
              ) : (
                auditLogs.map(log => (
                  <div key={log.id} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px]">
                    <div className="flex items-center justify-between text-slate-500 font-mono text-[10px]">
                      <span>{log.action}</span>
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-slate-300 mt-1">{log.details}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <FileManagerModal
        project={fileManagerProject}
        isOpen={!!fileManagerProject}
        onClose={() => setFileManagerProject(null)}
        onSaveFiles={handleSaveFilesFromManager}
      />

      <VersionControlModal
        project={versionsProject}
        isOpen={!!versionsProject}
        onClose={() => setVersionsProject(null)}
        onRollbackSuccess={(updated) => {
          setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
        }}
      />

      <ShareModal
        project={shareProject}
        isOpen={!!shareProject}
        onClose={() => setShareProject(null)}
      />
    </div>
  );
};
