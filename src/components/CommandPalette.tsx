import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Cloud,
  Github,
  CheckSquare,
  FileText,
  Sparkles,
  Compass,
  Film,
  Code2,
  DollarSign,
  RefreshCw,
  ExternalLink,
  X,
  File,
  ArrowRight,
  FolderGit2,
  Share2,
} from 'lucide-react';
import { GoogleDriveFile, GitHubRepo, GitHubIssue, WorkspaceTask, WorkspaceNote, WorkspaceProject, AppTab } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  driveFiles: GoogleDriveFile[];
  githubRepos: GitHubRepo[];
  githubIssues: GitHubIssue[];
  tasks: WorkspaceTask[];
  notes: WorkspaceNote[];
  projects?: WorkspaceProject[];
  onSelectTab: (tab: AppTab) => void;
  onSyncAll: () => void;
  onSelectDriveFile: (file: GoogleDriveFile) => void;
  onSelectGitHubRepo: (repo: GitHubRepo) => void;
  onOpenTaskModal: () => void;
  onOpenNoteModal: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  driveFiles,
  githubRepos,
  githubIssues,
  tasks,
  notes,
  projects = [],
  onSelectTab,
  onSyncAll,
  onSelectDriveFile,
  onSelectGitHubRepo,
  onOpenTaskModal,
  onOpenNoteModal,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  // Quick Action items
  const actions = [
    {
      id: 'action-sync',
      title: 'Sync All Workspaces Now',
      subtitle: 'Run continuous synchronization across Drive & GitHub',
      category: 'Actions',
      icon: RefreshCw,
      action: () => {
        onSyncAll();
        onClose();
      },
    },
    {
      id: 'action-task',
      title: 'Create New Task',
      subtitle: 'Add a new priority action item',
      category: 'Actions',
      icon: CheckSquare,
      action: () => {
        onOpenTaskModal();
        onClose();
      },
    },
    {
      id: 'action-note',
      title: 'Create New Note',
      subtitle: 'Create a markdown document in knowledge base',
      category: 'Actions',
      icon: FileText,
      action: () => {
        onOpenNoteModal();
        onClose();
      },
    },
    {
      id: 'action-ai',
      title: 'Ask OmniSync AI Copilot',
      subtitle: 'Analyze workspace or ask a question with Gemini 3.8 Flash',
      category: 'Actions',
      icon: Sparkles,
      action: () => {
        onSelectTab('ai');
        onClose();
      },
    },
    {
      id: 'action-1d-world',
      title: 'Open 1D World & Reiki HQ',
      subtitle: 'Explore 1D particle physics, Solfeggio sound harmonics & Wolfram automata',
      category: 'Actions',
      icon: Compass,
      action: () => {
        onSelectTab('one_d_world');
        onClose();
      },
    },
    {
      id: 'action-kikis-world',
      title: "Launch Kiki's World 2.0 Content Theater",
      subtitle: 'Play Google Drive videos, music, view all content & crystal sanctuary',
      category: 'Actions',
      icon: Film,
      action: () => {
        onSelectTab('kikis_world');
        onClose();
      },
    },
    {
      id: 'action-remix',
      title: 'Open Remixed App Studio & Sandbox',
      subtitle: 'Explore live applet sandboxes, remix configurations, and code snippets',
      category: 'Actions',
      icon: Code2,
      action: () => {
        onSelectTab('remix');
        onClose();
      },
    },
    {
      id: 'action-projects',
      title: 'Open My Projects & Repositories Portfolio',
      subtitle: 'View, pull in, and manage all your GitHub repos, Drive projects & manifests',
      category: 'Actions',
      icon: FolderGit2,
      action: () => {
        onSelectTab('projects');
        onClose();
      },
    },
    {
      id: 'action-bridges',
      title: 'Open Connectors & Bridges Hub',
      subtitle: 'Inspect live data pipes connecting Drive, GitHub, 1D Sound, Kiki 2.0, and PayPal',
      category: 'Actions',
      icon: Share2,
      action: () => {
        onSelectTab('bridges');
        onClose();
      },
    },
    {
      id: 'action-earnings',
      title: 'Open PayPal Creator Earnings & Tip Jar',
      subtitle: 'Accept PayPal tips, view creator revenue, and share PayPal.Me link',
      category: 'Actions',
      icon: DollarSign,
      action: () => {
        onSelectTab('earnings');
        onClose();
      },
    },
  ];

  // Filter items
  const matchedActions = actions.filter((a) => !q || a.title.toLowerCase().includes(q));

  const matchedProjects = projects
    .filter((p) => !q || p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)) || p.tags?.some(t => t.toLowerCase().includes(q)))
    .slice(0, 5)
    .map((p) => ({
      id: `proj-${p.id}`,
      title: p.name,
      subtitle: `Project • ${p.source.toUpperCase()} • ${p.status}`,
      category: 'Projects',
      icon: FolderGit2,
      action: () => {
        onSelectTab('projects');
        onClose();
      },
      url: p.url,
    }));

  const matchedDrive = driveFiles
    .filter((f) => !q || f.name.toLowerCase().includes(q))
    .slice(0, 5)
    .map((f) => ({
      id: `drive-${f.id}`,
      title: f.name,
      subtitle: `Google Drive • ${f.mimeType.split('.').pop() || 'file'}`,
      category: 'Google Drive',
      icon: Cloud,
      action: () => {
        onSelectDriveFile(f);
        onSelectTab('drive');
        onClose();
      },
      url: f.webViewLink,
    }));

  const matchedRepos = githubRepos
    .filter((r) => !q || r.name.toLowerCase().includes(q) || (r.description && r.description.toLowerCase().includes(q)))
    .slice(0, 5)
    .map((r) => ({
      id: `repo-${r.id}`,
      title: r.name,
      subtitle: `GitHub Repo • ${r.language || 'Code'} • ★ ${r.stargazers_count}`,
      category: 'GitHub Repos',
      icon: Github,
      action: () => {
        onSelectGitHubRepo(r);
        onSelectTab('github');
        onClose();
      },
      url: r.html_url,
    }));

  const matchedTasks = tasks
    .filter((t) => !q || t.title.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q)))
    .slice(0, 4)
    .map((t) => ({
      id: `task-${t.id}`,
      title: t.title,
      subtitle: `Task • ${t.status.toUpperCase()} • Priority: ${t.priority}`,
      category: 'Tasks',
      icon: CheckSquare,
      action: () => {
        onSelectTab('tasks');
        onClose();
      },
    }));

  const matchedNotes = notes
    .filter((n) => !q || n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q))
    .slice(0, 4)
    .map((n) => ({
      id: `note-${n.id}`,
      title: n.title,
      subtitle: `Note • ${n.tags.join(', ')}`,
      category: 'Notes',
      icon: FileText,
      action: () => {
        onSelectTab('notes');
        onClose();
      },
    }));

  const allResults = [
    ...matchedActions,
    ...matchedProjects,
    ...matchedDrive,
    ...matchedRepos,
    ...matchedTasks,
    ...matchedNotes,
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (allResults.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + (allResults.length || 1)) % (allResults.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allResults[selectedIndex]) {
        allResults[selectedIndex].action();
      }
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-start justify-center pt-16 sm:pt-24 px-4 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-slate-800 bg-slate-900/90">
          <Search className="w-5 h-5 text-indigo-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or search across Drive, GitHub, notes, tasks..."
            className="w-full h-14 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-200 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 space-y-1">
          {allResults.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No matching items found across your connected workspaces.
            </div>
          ) : (
            allResults.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => item.action()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-600/20 text-indigo-200 border border-indigo-500/30'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-medium text-slate-100 truncate">{item.title}</div>
                      <div className="text-[11px] text-slate-400 truncate">{item.subtitle || item.category}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-500 shrink-0">
                    <span className="text-[10px] font-mono uppercase bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700/60">
                      {item.category}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 font-mono text-[10px]">↑</kbd>{' '}
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 font-mono text-[10px]">↓</kbd> navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 font-mono text-[10px]">↵</kbd> select
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 font-mono text-[10px]">esc</kbd> close
            </span>
          </div>
          <span className="text-indigo-400/80 font-medium">OmniSync Global Index</span>
        </div>
      </div>
    </div>
  );
};
