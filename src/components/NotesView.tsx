import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Star,
  Trash2,
  Copy,
  Download,
  Eye,
  Edit3,
  ExternalLink,
  Tag,
  Check,
  Cloud,
  Github,
} from 'lucide-react';
import { WorkspaceNote, GoogleDriveFile, GitHubRepo } from '../types';

interface NotesViewProps {
  notes: WorkspaceNote[];
  onAddNote: (note: Omit<WorkspaceNote, 'id' | 'updatedAt'>) => void;
  onUpdateNote: (id: string, updates: Partial<WorkspaceNote>) => void;
  onDeleteNote: (id: string) => void;
  driveFiles: GoogleDriveFile[];
  githubRepos: GitHubRepo[];
}

export const NotesView: React.FC<NotesViewProps> = ({
  notes,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  driveFiles,
  githubRepos,
}) => {
  const [selectedNoteId, setSelectedNoteId] = useState<string>(notes[0]?.id || '');
  const [search, setSearch] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  const selectedNote = notes.find((n) => n.id === selectedNoteId) || notes[0];

  const handleCreate = () => {
    const newNote: Omit<WorkspaceNote, 'id' | 'updatedAt'> = {
      title: 'Untitled Note',
      content: '# Untitled Note\n\nWrite your thoughts, architecture notes, or project specs here...',
      tags: ['Workspace'],
      pinned: false,
    };
    onAddNote(newNote);
  };

  const handleCopy = () => {
    if (!selectedNote) return;
    navigator.clipboard.writeText(selectedNote.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!selectedNote) return;
    const blob = new Blob([selectedNote.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedNote.title.toLowerCase().replace(/\s+/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredNotes = notes.filter((n) => {
    return (
      !search ||
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" />
            <span>Knowledge Base & Notes</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
              {notes.length} notes
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Personal markdown knowledge base with Drive and GitHub cross-referencing.
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>
      </div>

      {/* Main 2-Pane Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[calc(100vh-14rem)] min-h-[500px]">
        {/* Left Pane: Notes List */}
        <div className="md:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col space-y-3 overflow-hidden">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Notes list */}
          <div className="space-y-1.5 flex-1 overflow-y-auto">
            {filteredNotes.map((note) => {
              const isSelected = note.id === selectedNote?.id;
              return (
                <div
                  key={note.id}
                  onClick={() => setSelectedNoteId(note.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-indigo-600/15 border-indigo-500/40 text-white'
                      : 'bg-slate-950/40 border-slate-800/80 text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <h4 className="text-xs font-semibold truncate flex-1">{note.title}</h4>
                    {note.pinned && <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mb-2 font-mono">
                    {note.content.replace(/^#+\s+/gm, '')}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <div className="flex items-center gap-1 overflow-hidden">
                      {note.tags.slice(0, 2).map((t, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {t}
                        </span>
                      ))}
                    </div>
                    <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Pane: Editor & Preview */}
        <div className="md:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col space-y-3 overflow-hidden">
          {selectedNote ? (
            <>
              {/* Note Top Action Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <input
                  type="text"
                  value={selectedNote.title}
                  onChange={(e) => onUpdateNote(selectedNote.id, { title: e.target.value })}
                  className="bg-transparent text-sm sm:text-base font-bold text-white focus:outline-none w-full sm:w-auto flex-1 mr-2"
                  placeholder="Note Title"
                />

                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  <button
                    onClick={() => setIsPreview(!isPreview)}
                    className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
                      isPreview
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                    }`}
                    title={isPreview ? 'Switch to Edit' : 'Switch to Preview'}
                  >
                    {isPreview ? <Edit3 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">{isPreview ? 'Edit' : 'Preview'}</span>
                  </button>

                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                    title="Copy Markdown"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={handleDownload}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                    title="Export Markdown File"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm(`Delete "${selectedNote.title}"?`)) {
                        onDeleteNote(selectedNote.id);
                      }
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-700 transition-colors"
                    title="Delete Note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Editor or Preview Pane */}
              <div className="flex-1 overflow-y-auto">
                {isPreview ? (
                  <div className="prose prose-invert prose-sm max-w-none p-3 whitespace-pre-wrap font-sans leading-relaxed text-slate-200">
                    {selectedNote.content}
                  </div>
                ) : (
                  <textarea
                    value={selectedNote.content}
                    onChange={(e) => onUpdateNote(selectedNote.id, { content: e.target.value })}
                    className="w-full h-full bg-slate-950/60 p-4 rounded-lg font-mono text-xs text-slate-200 placeholder-slate-600 focus:outline-none resize-none leading-relaxed border border-slate-800/80"
                    placeholder="Type Markdown content..."
                  />
                )}
              </div>

              {/* Note Footer */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                  <span>{selectedNote.content.split(/\s+/).filter(Boolean).length} words</span>
                  <span>•</span>
                  <span>{selectedNote.content.length} characters</span>
                </div>
                <span>Last updated {new Date(selectedNote.updatedAt).toLocaleTimeString()}</span>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs">
              Select or create a note to begin.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
