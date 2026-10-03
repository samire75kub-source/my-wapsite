import React, { useState, useEffect, useRef } from 'react';
import { ConsoleLogMessage } from '../../types';
import { 
  Monitor, 
  Tablet, 
  Smartphone, 
  Maximize2, 
  RotateCw, 
  ExternalLink, 
  Terminal, 
  Trash2, 
  Filter,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  X
} from 'lucide-react';

interface SandboxPreviewProps {
  files: Record<string, string>;
  title?: string;
  liveUrl?: string;
}

export const SandboxPreview: React.FC<SandboxPreviewProps> = ({ files, title, liveUrl }) => {
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [logs, setLogs] = useState<ConsoleLogMessage[]>([]);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [logFilter, setLogFilter] = useState<'all' | 'log' | 'error' | 'warn'>('all');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Compile bundled HTML with console logger injected
  const srcDoc = React.useMemo(() => {
    let html = files['index.html'] || '<!DOCTYPE html><html><body><h1 style="color:#fff;font-family:sans-serif;">NexusHost Sandbox Ready</h1></body></html>';
    const css = files['style.css'] || '';
    const js = files['script.js'] || '';

    const consoleBridge = `
      <script>
        (function() {
          const origLog = console.log;
          const origErr = console.error;
          const origWarn = console.warn;
          const origInfo = console.info;

          function sendLog(type, args) {
            try {
              const msg = Array.from(args).map(a => {
                if (typeof a === 'object') {
                  try { return JSON.stringify(a); } catch(e) { return String(a); }
                }
                return String(a);
              }).join(' ');
              window.parent.postMessage({ type: 'NEXUS_CONSOLE_LOG', level: type, message: msg, time: new Date().toLocaleTimeString() }, '*');
            } catch(e) {}
          }

          console.log = function() { sendLog('log', arguments); origLog.apply(console, arguments); };
          console.error = function() { sendLog('error', arguments); origErr.apply(console, arguments); };
          console.warn = function() { sendLog('warn', arguments); origWarn.apply(console, arguments); };
          console.info = function() { sendLog('info', arguments); origInfo.apply(console, arguments); };

          window.onerror = function(msg, url, line) {
            sendLog('error', [msg + ' (Line: ' + line + ')']);
          };
        })();
      </script>
    `;

    const injectedStyle = `<style>${css}</style>`;
    const injectedScript = `<script>${js}</script>`;

    if (html.includes('</head>')) {
      html = html.replace('</head>', `${consoleBridge}${injectedStyle}</head>`);
    } else {
      html = `<head>${consoleBridge}${injectedStyle}</head>${html}`;
    }

    if (html.includes('</body>')) {
      html = html.replace('</body>', `${injectedScript}</body>`);
    } else {
      html = `${html}${injectedScript}`;
    }

    return html;
  }, [files]);

  // Handle postMessage from iframe
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'NEXUS_CONSOLE_LOG') {
        const newMsg: ConsoleLogMessage = {
          id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
          level: e.data.level,
          message: e.data.message,
          time: e.data.time || new Date().toLocaleTimeString()
        };
        setLogs(prev => [...prev.slice(-100), newMsg]);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleReload = () => {
    setReloadKey(k => k + 1);
  };

  const filteredLogs = logs.filter(l => {
    if (logFilter === 'all') return true;
    return l.level === logFilter;
  });

  const widthClasses = {
    desktop: 'w-full',
    tablet: 'w-[768px] max-w-full',
    mobile: 'w-[375px] max-w-full'
  };

  return (
    <div 
      ref={containerRef}
      className={`flex flex-col bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl h-full transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'relative'
      }`}
    >
      {/* Top Preview Control Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 shrink-0">
        {/* Left: Device Toggles */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setDeviceMode('desktop')}
            className={`p-1.5 rounded-lg text-xs transition-all ${
              deviceMode === 'desktop' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-white'
            }`}
            title="Desktop Mode (100%)"
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeviceMode('tablet')}
            className={`p-1.5 rounded-lg text-xs transition-all ${
              deviceMode === 'tablet' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-white'
            }`}
            title="Tablet Mode (768px)"
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeviceMode('mobile')}
            className={`p-1.5 rounded-lg text-xs transition-all ${
              deviceMode === 'mobile' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-white'
            }`}
            title="Mobile Mode (375px)"
          >
            <Smartphone className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-800 mx-2" />

          {/* Reload Frame */}
          <button
            onClick={handleReload}
            className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-slate-800"
            title="Reload Execution Sandbox"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Center: Sandboxed Status */}
        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="hidden sm:inline">SANDBOXED RUNTIME</span>
          {liveUrl && (
            <span className="text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40 text-[10px] truncate max-w-[200px]">
              {liveUrl}
            </span>
          )}
        </div>

        {/* Right: Actions (Console, Popout, Fullscreen) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsConsoleOpen(!isConsoleOpen)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
              isConsoleOpen 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Inspect JavaScript Console Logs"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Console</span>
            {logs.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-cyan-400 font-bold">
                {logs.length}
              </span>
            )}
          </button>

          {liveUrl && (
            <a
              href={liveUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-slate-800"
              title="Open Live Hosted Website"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Sandbox'}
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Iframe Canvas Display */}
      <div className="flex-1 bg-slate-900/40 flex items-center justify-center p-2 sm:p-4 overflow-hidden relative">
        <div className={`h-full ${widthClasses[deviceMode]} transition-all duration-200 flex flex-col bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-800`}>
          <iframe
            key={reloadKey}
            ref={iframeRef}
            srcDoc={srcDoc}
            title={title || 'Interactive Sandbox'}
            sandbox="allow-scripts allow-forms allow-modals allow-pointer-lock allow-same-origin"
            className="w-full h-full border-none bg-white"
          />
        </div>

        {/* Collapsible Console Log Inspector Panel */}
        {isConsoleOpen && (
          <div className="absolute bottom-0 inset-x-0 h-64 bg-slate-950/95 border-t border-cyan-500/30 shadow-2xl flex flex-col z-20 backdrop-blur-xl animate-in slide-in-from-bottom-5">
            {/* Console Bar Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/90 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-cyan-400 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" /> JS CONSOLE INSPECTOR
                </span>

                {/* Log filters */}
                <div className="flex items-center gap-1 text-[11px] font-mono">
                  {(['all', 'log', 'error', 'warn'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setLogFilter(f)}
                      className={`px-2 py-0.5 rounded capitalize ${
                        logFilter === f ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLogs([])}
                  className="p-1 text-slate-400 hover:text-rose-400"
                  title="Clear Console Output"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsConsoleOpen(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Console Log Feed */}
            <div className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-1.5 divide-y divide-slate-800/40">
              {filteredLogs.length === 0 ? (
                <div className="text-slate-600 text-[11px] py-6 text-center">
                  No console logs captured yet. Call console.log() or interact with buttons in the sandbox.
                </div>
              ) : (
                filteredLogs.map(log => {
                  const colors = {
                    log: 'text-slate-200',
                    error: 'text-rose-400 bg-rose-950/20 p-1 rounded',
                    warn: 'text-amber-300 bg-amber-950/20 p-1 rounded',
                    info: 'text-cyan-300'
                  };

                  return (
                    <div key={log.id} className={`flex items-start gap-2 pt-1 ${colors[log.level]}`}>
                      <span className="text-[10px] text-slate-500 select-none shrink-0">{log.time}</span>
                      <span className="text-[10px] uppercase font-bold shrink-0 opacity-70">[{log.level}]</span>
                      <span className="break-all whitespace-pre-wrap">{log.message}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
