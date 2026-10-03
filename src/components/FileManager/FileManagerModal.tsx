import React, { useState } from 'react';
import { Project } from '../../types';
import { useRealtime } from '../../context/RealtimeContext';
import { 
  FolderTree, 
  FileCode2, 
  Plus, 
  Trash2, 
  Save, 
  X, 
  FileText, 
  Code, 
  Check,
  Download
} from 'lucide-react';

interface FileManagerModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveFiles: (updatedFiles: Record<string, string>) => void;
}

export const FileManagerModal: React.FC<FileManagerModalProps> = ({
  project,
  isOpen,
  onClose,
  onSaveFiles
}) => {
  const { addToast } = useRealtime();

  const [files, setFiles] = useState<Record<string, string>>(project ? { ...project.files } : {});
  const [selectedFilename, setSelectedFilename] = useState<string>('index.html');
  const [fileContent, setFileContent] = useState<string>('');
  const [newFileName, setNewFileName] = useState('');
  const [isCreatingFile, setIsCreatingFile] = useState(false);

  React.useEffect(() => {
    if (project) {
      setFiles({ ...project.files });
      const first = Object.keys(project.files)[0] || 'index.html';
      setSelectedFilename(first);
      setFileContent(project.files[first] || '');
    }
  }, [project, isOpen]);

  if (!isOpen || !project) return null;

  const handleSelectFile = (name: string) => {
    // save current buffer into files state first
    setFiles(prev => ({ ...prev, [selectedFilename]: fileContent }));
    setSelectedFilename(name);
    setFileContent(files[name] || '');
  };

  const handleCreateFile = () => {
    if (!newFileName.trim()) return;
    const cleanName = newFileName.trim().toLowerCase();
    if (files[cleanName]) {
      addToast({
        type: 'warning',
        title: 'File already exists',
        description: `A file named ${cleanName} already exists in this project.`
      });
      return;
    }

    const updated = { ...files, [cleanName]: `/* ${cleanName} */\n` };
    setFiles(updated);
    setSelectedFilename(cleanName);
    setFileContent(`/* ${cleanName} */\n`);
    setNewFileName('');
    setIsCreatingFile(false);
    addToast({
      type: 'success',
      title: 'File Created',
      description: `Added ${cleanName} to project file repository.`
    });
  };

  const handleDeleteFile = (name: string) => {
    if (name === 'index.html') {
      addToast({
        type: 'error',
        title: 'Cannot delete index.html',
        description: 'index.html is the required primary entry point for hosting.'
      });
      return;
    }

    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    const updated = { ...files };
    delete updated[name];
    setFiles(updated);

    const remainingKeys = Object.keys(updated);
    const nextKey = remainingKeys[0] || 'index.html';
    setSelectedFilename(nextKey);
    setFileContent(updated[nextKey] || '');

    addToast({
      type: 'info',
      title: 'File Removed',
      description: `${name} deleted from project files.`
    });
  };

  const handleSaveAll = () => {
    const finalFiles = {
      ...files,
      [selectedFilename]: fileContent
    };
    onSaveFiles(finalFiles);
    addToast({
      type: 'success',
      title: 'Cloud Repository Synced',
      description: 'All modified files saved and updated across cluster.'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="w-full max-w-4xl h-[78vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-800 bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center">
              <FolderTree className="w-4 h-4 text-teal-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Cloud File Manager</h3>
              <p className="text-xs text-slate-400 font-mono">/{project.username}/{project.slug}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveAll}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save & Sync Changes</span>
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Split: File Tree (Left) & Editor (Right) */}
        <div className="flex-1 flex overflow-hidden">
          {/* File List Tree */}
          <div className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col p-3 shrink-0">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2 px-1">
              <span className="font-mono font-bold uppercase text-[10px]">REPOSITORY FILES</span>
              <button
                onClick={() => setIsCreatingFile(!isCreatingFile)}
                className="p-1 text-cyan-400 hover:text-white rounded hover:bg-slate-800"
                title="New File"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {isCreatingFile && (
              <div className="mb-2 p-2 bg-slate-900 border border-slate-700 rounded-lg space-y-1.5">
                <input
                  type="text"
                  value={newFileName}
                  onChange={e => setNewFileName(e.target.value)}
                  placeholder="e.g. assets.css"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 outline-none font-mono"
                />
                <div className="flex justify-end gap-1">
                  <button onClick={() => setIsCreatingFile(false)} className="text-[10px] text-slate-400 px-2 py-0.5">Cancel</button>
                  <button onClick={handleCreateFile} className="text-[10px] bg-cyan-500 text-slate-950 font-bold px-2 py-0.5 rounded">Create</button>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto space-y-1">
              {Object.keys(files).map((filename) => {
                const isSelected = selectedFilename === filename;
                return (
                  <div
                    key={filename}
                    onClick={() => handleSelectFile(filename)}
                    className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileCode2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate">{filename}</span>
                    </div>

                    {filename !== 'index.html' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFile(filename);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity"
                        title="Delete file"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Code View / Edit Pane */}
          <div className="flex-1 flex flex-col bg-[#070b16] overflow-hidden">
            <div className="h-9 px-4 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400 shrink-0">
              <span>Editing: <strong className="text-cyan-400">{selectedFilename}</strong></span>
              <span>{(new Blob([fileContent]).size / 1024).toFixed(1)} KB</span>
            </div>

            <textarea
              value={fileContent}
              onChange={e => setFileContent(e.target.value)}
              spellCheck={false}
              className="flex-1 p-4 bg-transparent text-slate-100 placeholder-slate-600 outline-none resize-none font-mono text-xs leading-relaxed selection:bg-cyan-500/30 whitespace-pre"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
