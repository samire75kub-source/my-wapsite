import React, { useState } from 'react';
import { Project } from '../../types';
import { generateQrSvg } from '../../utils/qr';
import { useRealtime } from '../../context/RealtimeContext';
import { 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  QrCode, 
  MessageCircle, 
  Send, 
  X,
  Globe
} from 'lucide-react';

interface ShareModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ project, isOpen, onClose }) => {
  const { addToast } = useRealtime();
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  if (!isOpen || !project) return null;

  const liveUrl = `${window.location.origin}/view/${project.username}/${project.slug}`;
  const shareText = encodeURIComponent(`Check out ${project.title} hosted live on NexusHost Global: ${liveUrl}`);

  const handleCopy = () => {
    navigator.clipboard.writeText(liveUrl);
    setCopied(true);
    addToast({
      type: 'success',
      title: 'Link Copied',
      description: 'Public URL copied to clipboard'
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const socialLinks = [
    {
      name: 'WhatsApp',
      url: `https://api.whatsapp.com/send?text=${shareText}`,
      color: 'bg-emerald-600 hover:bg-emerald-500'
    },
    {
      name: 'Telegram',
      url: `https://t.me/share/url?url=${encodeURIComponent(liveUrl)}&text=${encodeURIComponent(project.title)}`,
      color: 'bg-sky-500 hover:bg-sky-400'
    },
    {
      name: 'X (Twitter)',
      url: `https://twitter.com/intent/tweet?text=${shareText}`,
      color: 'bg-slate-800 hover:bg-slate-700'
    },
    {
      name: 'Facebook',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(liveUrl)}`,
      color: 'bg-blue-600 hover:bg-blue-500'
    },
    {
      name: 'LinkedIn',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(liveUrl)}`,
      color: 'bg-blue-700 hover:bg-blue-600'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <Share2 className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Share Live Project</h3>
              <p className="text-xs text-slate-400">{project.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live URL Copy Bar */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 font-mono">PUBLIC LIVE EDGE URL</label>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800">
            <Globe className="w-4 h-4 text-cyan-400 shrink-0 ml-1" />
            <input
              type="text"
              readOnly
              value={liveUrl}
              className="bg-transparent text-xs text-slate-200 font-mono w-full outline-none truncate"
            />
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1 shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-200">Mobile QR Code Generator</span>
            <button
              onClick={() => setShowQr(!showQr)}
              className="text-cyan-400 hover:underline text-[11px] font-mono"
            >
              {showQr ? 'Collapse' : 'Expand QR'}
            </button>
          </div>

          {showQr && (
            <div className="pt-2 flex flex-col items-center animate-in fade-in">
              <img
                src={generateQrSvg(liveUrl, 160)}
                alt="Live Site QR"
                className="w-36 h-36 rounded-xl border border-cyan-500/30 p-2 bg-slate-950 shadow-md"
              />
              <span className="text-[10px] text-slate-400 mt-2 font-mono">Scan on Android or iOS to view website</span>
            </div>
          )}
        </div>

        {/* Direct Social Share Buttons */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2 font-mono">SHARE VIA SOCIAL NETWORKS</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {socialLinks.map(s => (
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className={`py-2 px-3 rounded-xl text-center text-xs font-semibold text-white transition-all ${s.color}`}
              >
                {s.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
