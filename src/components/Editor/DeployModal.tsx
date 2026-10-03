import React, { useState, useEffect } from 'react';
import { Project, ProjectSeo } from '../../types';
import { scanCodeForMalware } from '../../utils/security';
import { minifyCode } from '../../utils/minifier';
import { generateQrSvg } from '../../utils/qr';
import { useAuth } from '../../context/AuthContext';
import { useRealtime } from '../../context/RealtimeContext';
import { 
  Zap, 
  Lock, 
  Globe, 
  ShieldCheck, 
  CheckCircle2, 
  Copy, 
  ExternalLink, 
  QrCode, 
  Sparkles, 
  X, 
  AlertTriangle,
  UploadCloud,
  FileCode2
} from 'lucide-react';

interface DeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: Record<string, string>;
  editingProject?: Project | null;
  onDeploySuccess: (project: Project) => void;
}

export const DeployModal: React.FC<DeployModalProps> = ({
  isOpen,
  onClose,
  files,
  editingProject,
  onDeploySuccess
}) => {
  const { currentUser, checkQuota } = useAuth();
  const { addToast } = useRealtime();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [hasPassword, setHasPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDesc, setSeoDesc] = useState('');
  const [ogImage, setOgImage] = useState('');
  const [commitNote, setCommitNote] = useState('');

  // Deployment stages
  const [stage, setStage] = useState<'form' | 'packaging' | 'scanning' | 'minifying' | 'syncing' | 'live' | 'error'>('form');
  const [errorMsg, setErrorMsg] = useState('');
  const [deployedProject, setDeployedProject] = useState<Project | null>(null);
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  useEffect(() => {
    if (editingProject) {
      setTitle(editingProject.title);
      setSlug(editingProject.slug);
      setDescription(editingProject.description);
      setHasPassword(editingProject.hasPassword);
      setPassword(editingProject.password || '');
      setSeoTitle(editingProject.seo?.title || editingProject.title);
      setSeoDesc(editingProject.seo?.description || editingProject.description);
      setOgImage(editingProject.seo?.ogImage || '');
      setCommitNote(`Update ${editingProject.activeVersion} -> code release`);
    } else {
      setTitle('My Neon Web App');
      setSlug('neon-app-' + Math.random().toString(36).substring(2, 6));
      setDescription('Ultra-responsive interactive web application hosted live on NexusHost Global.');
      setHasPassword(false);
      setPassword('');
      setSeoTitle('');
      setSeoDesc('');
      setOgImage('');
      setCommitNote('Initial live edge deployment');
    }
    setStage('form');
    setErrorMsg('');
    setDeployedProject(null);
  }, [editingProject, isOpen]);

  const handleSlugChange = (val: string) => {
    const sanitized = val.toLowerCase().replace(/[^a-z0-9-_]/g, '-');
    setSlug(sanitized);
  };

  const handleDeploy = async () => {
    const finalTitle = title.trim() || 'My Web App';
    const finalSlug = (slug.trim() || ('app-' + Math.random().toString(36).substring(2, 6))).toLowerCase().replace(/[^a-z0-9-_]/g, '-');

    if (!editingProject && !checkQuota(100)) {
      setErrorMsg('Free tier hosting limit reached (5 projects or 50MB storage). Please upgrade via bKash/Nagad or delete an older site.');
      return;
    }

    setErrorMsg('');
    setStage('packaging');

    try {
      // Stage 1: Fast Packaging
      await new Promise(r => setTimeout(r, 120));
      setStage('scanning');

      // Stage 2: Malware & XSS Scanner
      await new Promise(r => setTimeout(r, 150));
      const scanResult = scanCodeForMalware(files, 'high');
      if (!scanResult.isClean) {
        setStage('error');
        setErrorMsg(`Security Risk Detected (Score ${scanResult.riskScore}/100): ${scanResult.threats.join('; ')}`);
        return;
      }

      // Stage 3: Minification & Optimization
      setStage('minifying');
      await new Promise(r => setTimeout(r, 120));
      const optimizedFiles = minifyCode(files);

      // Ensure index.html exists
      if (!optimizedFiles['index.html']) {
        optimizedFiles['index.html'] = '<!DOCTYPE html><html><body><h1>NexusHost Live</h1></body></html>';
      }

      // Stage 4: Syncing to Cloud Edge
      setStage('syncing');
      await new Promise(r => setTimeout(r, 150));

      const payload = {
        userId: currentUser.id,
        username: currentUser.username,
        title: finalTitle,
        slug: finalSlug,
        description: description || 'Live interactive web application hosted on NexusHost Global.',
        hasPassword,
        password: hasPassword ? password : '',
        seo: {
          title: seoTitle || finalTitle,
          description: seoDesc || description || 'Hosted on NexusHost Global',
          ogImage
        },
        files: optimizedFiles,
        commitNote
      };

      const endpoint = editingProject ? `/api/projects/${editingProject.id}` : '/api/projects';
      const method = editingProject ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to deploy project.');
      }

      setDeployedProject(data);
      setStage('live');
      onDeploySuccess(data);

      addToast({
        type: 'success',
        title: 'Website Hosted Live Worldwide!',
        description: `${data.title} is now accessible at /view/${data.username}/${data.slug}`
      });

    } catch (err: any) {
      setStage('error');
      setErrorMsg(err.message || 'An unexpected deployment failure occurred.');
    }
  };

  const liveUrl = deployedProject
    ? `${window.location.origin}/view/${deployedProject.username}/${deployedProject.slug}`
    : '';

  const copyLiveUrl = () => {
    if (!liveUrl) return;
    navigator.clipboard.writeText(liveUrl);
    setCopied(true);
    addToast({
      type: 'success',
      title: 'Live URL Copied to Clipboard',
      description: liveUrl
    });
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden shadow-cyan-500/10"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <Zap className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {editingProject ? 'Update & Sync Live Deployment' : 'Deploy Website Worldwide'}
              </h3>
              <p className="text-xs text-slate-400">Target: /view/{currentUser.username}/{slug || 'your-slug'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-5">
          {stage === 'form' && (
            <div className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Title & Slug */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Project Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Cyber Matrix Portfolio"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Custom URL Slug</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={e => handleSlugChange(e.target.value)}
                    placeholder="e.g. cyber-matrix"
                    disabled={!!editingProject}
                    className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-cyan-400 placeholder-slate-500 focus:border-cyan-500 outline-none ${
                      editingProject ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Short Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Tell visitors what this interactive site contains..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-500 outline-none resize-none"
                />
              </div>

              {/* Password Protection */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-400" />
                    <div>
                      <span className="text-xs font-semibold text-slate-200">Password Protection Lock</span>
                      <p className="text-[11px] text-slate-400">Require visitors to enter a passcode before accessing HTML</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={hasPassword}
                    onChange={e => setHasPassword(e.target.checked)}
                    className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                  />
                </div>

                {hasPassword && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80">
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Set access passcode"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 outline-none font-mono"
                    />
                  </div>
                )}
              </div>

              {/* SEO Meta Tags (Expandable) */}
              <details className="group rounded-xl bg-slate-950/40 border border-slate-800/80 p-3">
                <summary className="text-xs font-semibold text-slate-300 cursor-pointer list-none flex items-center justify-between">
                  <span>Advanced SEO & Social OpenGraph Card</span>
                  <span className="text-cyan-400 text-[10px] font-mono">+ Configure</span>
                </summary>
                <div className="space-y-3 pt-3 mt-2 border-t border-slate-800">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">SEO Title Tag</label>
                    <input
                      type="text"
                      value={seoTitle}
                      onChange={e => setSeoTitle(e.target.value)}
                      placeholder={title || 'Page title in Google search results'}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">OpenGraph Banner Image URL</label>
                    <input
                      type="text"
                      value={ogImage}
                      onChange={e => setOgImage(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none"
                    />
                  </div>
                </div>
              </details>

              {editingProject && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Commit Note / Version Log</label>
                  <input
                    type="text"
                    value={commitNote}
                    onChange={e => setCommitNote(e.target.value)}
                    placeholder="e.g. Added responsive layout & bug fixes"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                  />
                </div>
              )}
            </div>
          )}

          {/* Deployment Animation Stages */}
          {['packaging', 'scanning', 'minifying', 'syncing'].includes(stage) && (
            <div className="py-10 text-center space-y-6">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-ping" />
                <div className="w-16 h-16 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin flex items-center justify-center">
                  <Zap className="w-6 h-6 text-cyan-400" />
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-base font-bold text-white capitalize">
                  {stage === 'packaging' && 'Bundling Website Source Files...'}
                  {stage === 'scanning' && 'Scanning for XSS, Malicious Scripts & Phishing...'}
                  {stage === 'minifying' && 'Optimizing & Compressing HTML/CSS/JS Assets...'}
                  {stage === 'syncing' && 'Replicating Live Code to Global Edge Clusters...'}
                </h4>
                <p className="text-xs text-slate-400 font-mono">Real-time state synchronization via WebSocket</p>
              </div>

              {/* Step indicator pills */}
              <div className="flex justify-center items-center gap-2 pt-2 text-[10px] font-mono">
                <span className={`px-2 py-0.5 rounded ${stage === 'packaging' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'bg-slate-800 text-slate-500'}`}>1. BUNDLE</span>
                <span className={`px-2 py-0.5 rounded ${stage === 'scanning' ? 'bg-teal-500/20 text-teal-400 border border-teal-500/40' : 'bg-slate-800 text-slate-500'}`}>2. SCAN</span>
                <span className={`px-2 py-0.5 rounded ${stage === 'minifying' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40' : 'bg-slate-800 text-slate-500'}`}>3. MINIFY</span>
                <span className={`px-2 py-0.5 rounded ${stage === 'syncing' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'bg-slate-800 text-slate-500'}`}>4. LIVE</span>
              </div>
            </div>
          )}

          {/* Success / Live Screen */}
          {stage === 'live' && deployedProject && (
            <div className="py-6 space-y-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 shadow-xl shadow-emerald-500/10">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-white">Website Live on Global Edge!</h4>
                <p className="text-xs text-slate-400 mt-1">Your website is active and accessible worldwide.</p>
              </div>

              {/* URL Display Card */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-left space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>PUBLIC LIVE URL</span>
                  <span className="text-emerald-400">● ACTIVE</span>
                </div>
                <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-xs font-mono text-cyan-300 truncate">{liveUrl}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={copyLiveUrl}
                      className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                      title="Copy URL"
                    >
                      {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <a
                      href={liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 text-slate-400 hover:text-cyan-400 rounded hover:bg-slate-800"
                      title="Open Live Website"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Version: {deployedProject.activeVersion}</span>
                  <button
                    onClick={() => setShowQr(!showQr)}
                    className="text-cyan-400 hover:underline flex items-center gap-1 font-mono"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    {showQr ? 'Hide QR Code' : 'Show Mobile QR'}
                  </button>
                </div>

                {showQr && (
                  <div className="pt-3 border-t border-slate-800 text-center flex flex-col items-center">
                    <img
                      src={generateQrSvg(liveUrl, 160)}
                      alt="Website QR Code"
                      className="w-40 h-40 rounded-xl border border-cyan-500/30 p-2 bg-slate-950"
                    />
                    <span className="text-[11px] text-slate-400 mt-2 font-mono">Scan with phone camera to test live mobile view</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error Screen */}
          {stage === 'error' && (
            <div className="py-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Deployment Blocked</h4>
                <p className="text-xs text-rose-300 mt-1 max-w-md mx-auto leading-relaxed">{errorMsg}</p>
              </div>
              <button
                onClick={() => setStage('form')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
              >
                Back to Edit Form
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950/70 border-t border-slate-800 flex items-center justify-between">
          {stage === 'form' && (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleDeploy}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-500/25 transition-all"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>{editingProject ? 'Deploy Release Live' : 'Deploy & Host Live'}</span>
              </button>
            </>
          )}

          {stage === 'live' && (
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
            >
              Done & Return to Workspace
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
