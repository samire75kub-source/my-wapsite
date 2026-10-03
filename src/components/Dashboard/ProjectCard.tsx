import React, { useState } from 'react';
import { Project } from '../../types';
import { useRealtime } from '../../context/RealtimeContext';
import JSZip from 'jszip';
import { 
  Globe, 
  Eye, 
  HardDrive, 
  History, 
  Share2, 
  FolderTree, 
  Copy, 
  Trash2, 
  Lock, 
  Unlock, 
  ExternalLink, 
  Edit3, 
  Check, 
  ArrowUpRight,
  FolderDown,
  Layers
} from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onEditInIde: (project: Project) => void;
  onOpenFileManager: (project: Project) => void;
  onOpenVersions: (project: Project) => void;
  onOpenShare: (project: Project) => void;
  onCloneProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onTogglePublish: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onEditInIde,
  onOpenFileManager,
  onOpenVersions,
  onOpenShare,
  onCloneProject,
  onDeleteProject,
  onTogglePublish
}) => {
  const { addToast } = useRealtime();
  const [copied, setCopied] = useState(false);

  const liveUrl = `${window.location.origin}/view/${project.username}/${project.slug}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(liveUrl);
    setCopied(true);
    addToast({
      type: 'success',
      title: 'Copied Live URL',
      description: liveUrl
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportZip = async () => {
    const zip = new JSZip();
    for (const [name, content] of Object.entries(project.files)) {
      zip.file(name, content);
    }
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.slug}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addToast({
      type: 'info',
      title: 'Downloaded Archive',
      description: `${project.slug}.zip exported successfully`
    });
  };

  return (
    <div className={`flex flex-col bg-slate-900 border rounded-2xl overflow-hidden transition-all shadow-xl hover:shadow-cyan-500/10 ${
      project.isPublished ? 'border-slate-800 hover:border-cyan-500/40' : 'border-rose-900/50 opacity-80'
    }`}>
      {/* Card Header & Status */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${project.isPublished ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              <h3 className="font-bold text-base text-white truncate max-w-[200px]" title={project.title}>
                {project.title}
              </h3>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {project.hasPassword && (
                <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <Lock className="w-2.5 h-2.5" /> Password Locked
                </span>
              )}
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                {project.activeVersion}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-400 line-clamp-2 mb-3">
            {project.description || 'Interactive website deployed live on NexusHost Global.'}
          </p>

          {/* Live Subdomain URL */}
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800/80 mb-4">
            <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-300 truncate min-w-0">
              <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="truncate">/{project.username}/{project.slug}</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={copyUrl}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                title="Copy live URL"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <a
                href={liveUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1 text-slate-400 hover:text-cyan-400 rounded hover:bg-slate-800"
                title="Open in new window"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Real-time Metrics (Views, Bandwidth, Storage) */}
          <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-slate-950/60 rounded-xl border border-slate-800/60 text-center text-xs font-mono">
            <div>
              <div className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
                <Eye className="w-3 h-3 text-cyan-400" /> VIEWS
              </div>
              <div className="font-bold text-slate-200 mt-0.5">{project.views.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
                <HardDrive className="w-3 h-3 text-teal-400" /> STORAGE
              </div>
              <div className="font-bold text-slate-200 mt-0.5">{project.storageKb} KB</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
                <Globe className="w-3 h-3 text-blue-400" /> DATA
              </div>
              <div className="font-bold text-slate-200 mt-0.5">{(project.bandwidthKb / 1024).toFixed(1)} MB</div>
            </div>
          </div>
        </div>

        {/* Action Controls Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-1 text-xs">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEditInIde(project)}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-semibold rounded-lg border border-cyan-500/30 transition-colors"
              title="Edit in Cloud IDE"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>IDE</span>
            </button>

            <button
              onClick={() => onOpenFileManager(project)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Open File Manager"
            >
              <FolderTree className="w-4 h-4 text-teal-400" />
            </button>

            <button
              onClick={() => onOpenVersions(project)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Version Control & Rollback"
            >
              <History className="w-4 h-4 text-indigo-400" />
            </button>

            <button
              onClick={() => onOpenShare(project)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Share & QR Code"
            >
              <Share2 className="w-4 h-4 text-pink-400" />
            </button>

            <button
              onClick={handleExportZip}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Export as .ZIP"
            >
              <FolderDown className="w-4 h-4 text-blue-400" />
            </button>
          </div>

          <div className="flex items-center gap-1">
            {/* Publish Toggle */}
            <button
              onClick={() => onTogglePublish(project)}
              className={`p-1.5 rounded-lg transition-colors ${
                project.isPublished ? 'text-emerald-400 hover:bg-emerald-950/40' : 'text-rose-400 hover:bg-rose-950/40'
              }`}
              title={project.isPublished ? 'Unpublish website' : 'Republish website'}
            >
              {project.isPublished ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </button>

            {/* Clone */}
            <button
              onClick={() => onCloneProject(project)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              title="Duplicate / Clone project"
            >
              <Layers className="w-4 h-4" />
            </button>

            {/* Delete */}
            <button
              onClick={() => {
                if (confirm(`Permanently delete project "${project.title}"?`)) {
                  onDeleteProject(project.id);
                }
              }}
              className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800"
              title="Delete project"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
