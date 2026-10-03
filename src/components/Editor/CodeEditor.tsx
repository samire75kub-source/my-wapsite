import React, { useState, useRef } from 'react';
import { Project } from '../../types';
import { TEMPLATES } from '../../utils/templates';
import { formatCode, minifyCode } from '../../utils/minifier';
import { SandboxPreview } from './SandboxPreview';
import { DeployModal } from './DeployModal';
import { useRealtime } from '../../context/RealtimeContext';
import JSZip from 'jszip';
import { 
  FileCode, 
  Paintbrush, 
  Play, 
  UploadCloud, 
  FolderDown, 
  Zap, 
  RotateCcw, 
  Sparkles, 
  Layers, 
  Maximize2,
  FileArchive,
  Save,
  Check
} from 'lucide-react';

interface CodeEditorProps {
  initialProject?: Project | null;
  onDeploySuccess?: (project: Project) => void;
  openDeployTrigger?: number;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ 
  initialProject, 
  onDeploySuccess,
  openDeployTrigger 
}) => {
  const { addToast } = useRealtime();

  const [activeTab, setActiveTab] = useState<'index.html' | 'style.css' | 'script.js'>('index.html');
  const [files, setFiles] = useState<Record<string, string>>(
    initialProject ? initialProject.files : TEMPLATES[0].files
  );

  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(TEMPLATES[0].id);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync files if initialProject changes
  React.useEffect(() => {
    if (initialProject && initialProject.files) {
      setFiles(initialProject.files);
    }
  }, [initialProject]);

  // Open modal if triggered externally (e.g. from Navbar Host Website button)
  React.useEffect(() => {
    if (openDeployTrigger && openDeployTrigger > 0) {
      setIsDeployModalOpen(true);
    }
  }, [openDeployTrigger]);

  const handleTabContentChange = (value: string) => {
    setFiles(prev => ({
      ...prev,
      [activeTab]: value
    }));
  };

  const handleTemplateSelect = (templateId: string) => {
    const tmpl = TEMPLATES.find(t => t.id === templateId);
    if (tmpl) {
      setSelectedTemplateId(templateId);
      setFiles(tmpl.files);
      addToast({
        type: 'info',
        title: `Loaded Template: ${tmpl.name}`,
        description: tmpl.description
      });
    }
  };

  const handleFormatCode = () => {
    const type = activeTab.endsWith('.html') ? 'html' : activeTab.endsWith('.css') ? 'css' : 'js';
    const formatted = formatCode(files[activeTab], type);
    setFiles(prev => ({
      ...prev,
      [activeTab]: formatted
    }));
    addToast({
      type: 'info',
      title: 'Code Formatted',
      description: `Cleaned indentation for ${activeTab}`
    });
  };

  const handleMinifyToggle = () => {
    const minified = minifyCode(files);
    setFiles(minified);
    addToast({
      type: 'success',
      title: 'Code Assets Minified',
      description: 'Stripped unnecessary whitespace & comments for optimal payload.'
    });
  };

  // Drag and Drop & Zip Archive ingestion
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFileList = async (fileList: FileList) => {
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];

      // Handle .zip archives
      if (file.name.endsWith('.zip')) {
        try {
          const zip = new JSZip();
          const unzipped = await zip.loadAsync(file);
          const newFiles: Record<string, string> = { ...files };

          let loadedCount = 0;
          for (const [relativePath, zipEntry] of Object.entries(unzipped.files)) {
            if (!zipEntry.dir) {
              const content = await zipEntry.async('text');
              const lower = relativePath.toLowerCase();

              if (lower.endsWith('index.html') || lower.endsWith('.html')) {
                newFiles['index.html'] = content;
                loadedCount++;
              } else if (lower.endsWith('style.css') || lower.endsWith('.css')) {
                newFiles['style.css'] = content;
                loadedCount++;
              } else if (lower.endsWith('script.js') || lower.endsWith('.js')) {
                newFiles['script.js'] = content;
                loadedCount++;
              }
            }
          }

          setFiles(newFiles);
          addToast({
            type: 'success',
            title: 'ZIP Archive Extracted',
            description: `Loaded ${loadedCount} files from ${file.name}`
          });
          setIsDeployModalOpen(true);
          return;
        } catch (err) {
          addToast({
            type: 'error',
            title: 'Failed to extract ZIP',
            description: 'Please ensure archive contains valid HTML/CSS/JS files.'
          });
        }
      } else {
        // Individual file upload
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          if (file.name.endsWith('.html')) {
            setFiles(prev => ({ ...prev, 'index.html': content }));
          } else if (file.name.endsWith('.css')) {
            setFiles(prev => ({ ...prev, 'style.css': content }));
          } else if (file.name.endsWith('.js')) {
            setFiles(prev => ({ ...prev, 'script.js': content }));
          }
        };
        reader.readAsText(file);
      }
    }

    addToast({
      type: 'info',
      title: 'Files Imported',
      description: 'Code dropzone successfully synced to Cloud IDE'
    });
    setIsDeployModalOpen(true);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFileList(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFileList(e.target.files);
    }
  };

  // Export as .zip archive
  const handleExportZip = async () => {
    const zip = new JSZip();
    zip.file('index.html', files['index.html']);
    zip.file('style.css', files['style.css']);
    zip.file('script.js', files['script.js']);

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${initialProject ? initialProject.slug : 'nexushost-project'}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addToast({
      type: 'success',
      title: 'Exported Project as ZIP',
      description: 'Clean bundled archive downloaded.'
    });
  };

  // Line count for editor gutter
  const lineCount = (files[activeTab] || '').split('\n').length;
  const currentBytes = new Blob([files[activeTab] || '']).size;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-full">
      {/* Top IDE Toolbar */}
      <div className="h-12 px-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
        {/* Left: Templates & Dropzone Trigger */}
        <div className="flex items-center gap-2">
          {/* Template Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={selectedTemplateId}
              onChange={e => handleTemplateSelect(e.target.value)}
              className="bg-transparent text-slate-200 outline-none text-xs cursor-pointer"
            >
              {TEMPLATES.map(t => (
                <option key={t.id} value={t.id} className="bg-slate-900 text-slate-200">
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            multiple
            accept=".zip,.html,.css,.js"
            className="hidden"
          />

          {/* Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-800 transition-colors"
            title="Upload HTML/CSS/JS or .zip archive"
          >
            <UploadCloud className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Upload ZIP / Code</span>
          </button>

          {/* Export Zip */}
          <button
            onClick={handleExportZip}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-800 transition-colors"
            title="Export project directory as .zip"
          >
            <FolderDown className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline">Export ZIP</span>
          </button>
        </div>

        {/* Center: File stats */}
        <div className="hidden lg:flex items-center gap-4 text-[11px] font-mono text-slate-500">
          <span>{lineCount} LINES</span>
          <span>{(currentBytes / 1024).toFixed(1)} KB</span>
          <span>UTF-8</span>
        </div>

        {/* Right: Code actions & Deploy Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleFormatCode}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-800"
            title="Format & Indent Code"
          >
            <Paintbrush className="w-3 h-3 text-cyan-400" />
            <span className="hidden sm:inline">Format</span>
          </button>

          <button
            onClick={handleMinifyToggle}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-800"
            title="Automated Minifier"
          >
            <RotateCcw className="w-3 h-3 text-indigo-400" />
            <span className="hidden sm:inline">Minify</span>
          </button>

          {/* Primary Deploy Button */}
          <button
            onClick={() => setIsDeployModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-extrabold text-xs rounded-lg shadow-md shadow-cyan-500/20 transition-all transform hover:scale-[1.02] active:scale-95"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>{initialProject ? 'Update Live' : 'Deploy & Host Live'}</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Split: Code Editor (Left) & Sandbox (Right) */}
      <div 
        className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden relative"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Drag and drop overlay */}
        {isDragging && (
          <div className="absolute inset-0 z-50 bg-cyan-950/90 border-2 border-dashed border-cyan-400 flex flex-col items-center justify-center p-8 backdrop-blur-md animate-in fade-in">
            <UploadCloud className="w-16 h-16 text-cyan-400 animate-bounce mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Drop Website Files or .ZIP Archive Here</h3>
            <p className="text-sm text-cyan-200">Automatically parses index.html, style.css, and script.js</p>
          </div>
        )}

        {/* Left Column: Multi-tab Code Editor */}
        <div className="flex flex-col h-full bg-slate-950 border-r border-slate-800 overflow-hidden">
          {/* File Tabs */}
          <div className="flex items-center bg-slate-900/70 border-b border-slate-800 px-2 shrink-0 overflow-x-auto">
            {(['index.html', 'style.css', 'script.js'] as const).map(tab => {
              const isActive = activeTab === tab;
              const icons = {
                'index.html': '🌐',
                'style.css': '🎨',
                'script.js': '⚡'
              };

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-2 px-3 py-2 text-xs font-mono border-b-2 transition-all shrink-0 ${
                    isActive
                      ? 'border-cyan-400 text-cyan-300 bg-slate-900 font-bold'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <span>{icons[tab]}</span>
                  <span>{tab}</span>
                </button>
              );
            })}
          </div>

          {/* Editor Body with Gutter */}
          <div className="flex-1 flex overflow-hidden bg-[#070b16] font-mono text-xs">
            {/* Line numbers gutter */}
            <div className="w-12 py-3 bg-[#050811] text-slate-600 select-none text-right pr-3 font-mono border-r border-slate-800/60 overflow-hidden">
              {Array.from({ length: Math.max(1, lineCount) }).map((_, idx) => (
                <div key={idx} className="leading-5 h-5">{idx + 1}</div>
              ))}
            </div>

            {/* Textarea code input */}
            <textarea
              value={files[activeTab] || ''}
              onChange={e => handleTabContentChange(e.target.value)}
              spellCheck={false}
              className="flex-1 p-3 bg-transparent text-slate-100 placeholder-slate-600 outline-none resize-none leading-5 font-mono overflow-auto selection:bg-cyan-500/30 whitespace-pre"
              placeholder={`Write ${activeTab} code here...`}
            />
          </div>
        </div>

        {/* Right Column: Real-Time Execution Sandbox Preview */}
        <div className="flex flex-col h-full bg-slate-950 overflow-hidden p-2 sm:p-3">
          <SandboxPreview
            files={files}
            title={initialProject?.title || 'Nexus Live Sandbox'}
            liveUrl={initialProject ? `${window.location.origin}/view/${initialProject.username}/${initialProject.slug}` : undefined}
          />
        </div>
      </div>

      {/* Deployment Modal */}
      <DeployModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
        files={files}
        editingProject={initialProject}
        onDeploySuccess={(savedProj) => {
          if (onDeploySuccess) onDeploySuccess(savedProj);
        }}
      />
    </div>
  );
};
