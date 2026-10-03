import React, { useState, useEffect, useRef } from 'react';
import { Project } from '../types';
import { Search, Globe, User, Eye, Lock, ArrowUpRight, Code, X } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProject: (project: Project) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectProject
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      fetchProjects('');
    } else {
      setQuery('');
    }
  }, [isOpen]);

  const fetchProjects = (searchStr: string) => {
    setIsLoading(true);
    fetch(`/api/projects?search=${encodeURIComponent(searchStr)}`)
      .then(res => res.json())
      .then(data => {
        setResults(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    fetchProjects(val);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden shadow-cyan-500/10"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-slate-800">
          <Search className="w-5 h-5 text-cyan-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleSearchChange}
            placeholder="Search hosted sites by title, slug, user, or keyword..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 outline-none"
          />
          {query && (
            <button onClick={() => { setQuery(''); fetchProjects(''); }} className="p-1 text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 rounded border border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-800/40">
          {isLoading ? (
            <div className="py-8 text-center text-xs text-slate-500 font-mono">
              SEARCHING GLOBAL CLUSTER REPOSITORY...
            </div>
          ) : results.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400">
              No live websites found matching "{query}".
            </div>
          ) : (
            results.map((project) => (
              <div
                key={project.id}
                onClick={() => {
                  onSelectProject(project);
                  onClose();
                }}
                className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/70 cursor-pointer transition-all"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Globe className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors truncate">
                        {project.title}
                      </h4>
                      {project.hasPassword && (
                        <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          <Lock className="w-2.5 h-2.5" /> Locked
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/50 px-1.5 py-0.5 rounded">
                        /{project.username}/{project.slug}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {project.description || 'Public real-time hosted web application'}
                    </p>
                    <div className="flex items-center gap-4 mt-1 text-[11px] text-slate-500 font-mono">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" /> @{project.username}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3 text-slate-400" /> {project.views.toLocaleString()} views
                      </span>
                      <span>v{project.activeVersion}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`/view/${project.username}/${project.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-700 rounded-lg transition-colors"
                    title="Open live hosted URL"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-950/50 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-4">
            <span>Click to inspect & edit</span>
            <span>Live subdomains served at /view/:user/:slug</span>
          </div>
          <button onClick={onClose} className="hover:text-slate-300">
            Close [Esc]
          </button>
        </div>
      </div>
    </div>
  );
};
