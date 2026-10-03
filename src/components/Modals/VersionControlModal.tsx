import React, { useState } from 'react';
import { Project, ProjectVersion } from '../../types';
import { useRealtime } from '../../context/RealtimeContext';
import { History, RotateCcw, Check, Clock, X, GitCommit } from 'lucide-react';

interface VersionControlModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onRollbackSuccess: (updated: Project) => void;
}

export const VersionControlModal: React.FC<VersionControlModalProps> = ({
  project,
  isOpen,
  onClose,
  onRollbackSuccess
}) => {
  const { addToast } = useRealtime();
  const [isRollingBack, setIsRollingBack] = useState(false);

  if (!isOpen || !project) return null;

  const handleRollback = async (ver: ProjectVersion) => {
    if (ver.version === project.activeVersion) {
      addToast({
        type: 'info',
        title: 'Already on Version',
        description: `${ver.version} is already the live active release.`
      });
      return;
    }

    if (!confirm(`Are you sure you want to rollback to ${ver.version}? This will update the live hosted page immediately.`)) {
      return;
    }

    setIsRollingBack(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/rollback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetVersion: ver.version })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to rollback version');

      addToast({
        type: 'success',
        title: 'Rollback Complete',
        description: `Project ${project.slug} restored to ${ver.version}`
      });

      onRollbackSuccess(data.project);
      onClose();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Rollback Failed',
        description: err.message
      });
    } finally {
      setIsRollingBack(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
              <History className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Version Control & Rollback History</h3>
              <p className="text-xs text-slate-400">{project.title} (Active: {project.activeVersion})</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Versions List */}
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {project.versions?.map((ver, idx) => {
            const isCurrent = ver.version === project.activeVersion;

            return (
              <div
                key={ver.version}
                className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                  isCurrent
                    ? 'border-cyan-500/50 bg-cyan-950/20'
                    : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    isCurrent ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    <GitCommit className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white">{ver.version}</span>
                      {isCurrent && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          LIVE ACTIVE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-1 truncate">{ver.note || 'Code commit update'}</p>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1 font-mono">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(ver.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {!isCurrent && (
                  <button
                    onClick={() => handleRollback(ver)}
                    disabled={isRollingBack}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold shrink-0 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Rollback</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
