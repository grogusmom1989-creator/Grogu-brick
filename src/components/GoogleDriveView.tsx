import React, { useState } from 'react';
import {
  Cloud,
  Search,
  ExternalLink,
  FileText,
  FileSpreadsheet,
  Presentation,
  Folder,
  FileCheck,
  Star,
  RefreshCw,
  Plus,
  Clock,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  Eye,
  Tag,
  Grid,
  List,
} from 'lucide-react';
import { GoogleDriveFile } from '../types';
import { GoogleSignInButton } from './GoogleSignInButton';
import { getDriveFileType, formatFileSize } from '../services/googleDrive';
import { User } from 'firebase/auth';

interface GoogleDriveViewProps {
  files: GoogleDriveFile[];
  googleUser: User | null;
  isLoading: boolean;
  onSignIn: () => void;
  onRefresh: () => void;
  onOpenInDrive: (url?: string) => void;
  onPinFile: (fileId: string) => void;
  pinnedIds: string[];
  onCreateTaskFromFile: (file: GoogleDriveFile) => void;
}

export const GoogleDriveView: React.FC<GoogleDriveViewProps> = ({
  files,
  googleUser,
  isLoading,
  onSignIn,
  onRefresh,
  onOpenInDrive,
  onPinFile,
  pinnedIds,
  onCreateTaskFromFile,
}) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFile, setSelectedFile] = useState<GoogleDriveFile | null>(null);

  const filterTabs = [
    { id: 'all', label: 'All Files' },
    { id: 'docs', label: 'Docs' },
    { id: 'sheets', label: 'Sheets' },
    { id: 'slides', label: 'Slides' },
    { id: 'pdf', label: 'PDFs' },
    { id: 'media', label: 'Media' },
    { id: 'folders', label: 'Folders' },
  ];

  const filteredFiles = files.filter((file) => {
    const matchesSearch =
      !search ||
      file.name.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'docs') return file.mimeType.includes('document');
    if (filterType === 'sheets') return file.mimeType.includes('spreadsheet');
    if (filterType === 'slides') return file.mimeType.includes('presentation');
    if (filterType === 'pdf') return file.mimeType.includes('pdf');
    if (filterType === 'media') return file.mimeType.includes('image') || file.mimeType.includes('video');
    if (filterType === 'folders') return file.mimeType.includes('folder');
    return true;
  });

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('document')) return <FileText className="w-5 h-5 text-blue-400" />;
    if (mimeType.includes('spreadsheet')) return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
    if (mimeType.includes('presentation')) return <Presentation className="w-5 h-5 text-amber-400" />;
    if (mimeType.includes('folder')) return <Folder className="w-5 h-5 text-slate-400" />;
    return <FileCheck className="w-5 h-5 text-indigo-400" />;
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
            <Cloud className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              Google Drive Cloud Workspace
              {googleUser && (
                <span className="text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Connected
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {googleUser
                ? `Syncing files from ${googleUser.email}. Fast search & instant docs access.`
                : 'Connect your Google account to index and sync your Drive files and documents.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {googleUser ? (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg flex items-center gap-2 border border-slate-700 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
              <span>{isLoading ? 'Syncing...' : 'Sync Drive'}</span>
            </button>
          ) : (
            <GoogleSignInButton onClick={onSignIn} isLoading={isLoading} />
          )}
        </div>
      </div>

      {/* If disconnected, show onboarding view */}
      {!googleUser ? (
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-8 text-center max-w-xl mx-auto space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-inner">
            <Cloud className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Ready to sync Google Drive?</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
              Sign in with Google to read and organize your documents, spreadsheets, presentations, and files directly inside OmniSync Hub with permission.
            </p>
          </div>
          <div className="pt-2 flex justify-center">
            <GoogleSignInButton onClick={onSignIn} isLoading={isLoading} />
          </div>
        </div>
      ) : (
        <>
          {/* Controls Bar: Search, Category Tabs & View Toggle */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Drive files by name..."
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg self-end sm:self-auto">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded text-xs transition-colors ${
                  viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Grid view"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded text-xs transition-colors ${
                  viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="List view"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Filter Categories Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                  filterType === tab.id
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
            <span className="text-slate-500 text-xs ml-auto font-mono">
              {filteredFiles.length} item{filteredFiles.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Files Display */}
          {isLoading && files.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Loading your Google Drive items...</p>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-slate-800 rounded-xl space-y-2">
              <HardDrive className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs font-medium text-slate-300">No matching Google Drive files found</p>
              <p className="text-[11px] text-slate-500">Try adjusting your search or category filter.</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredFiles.map((file) => {
                const meta = getDriveFileType(file.mimeType);
                const isPinned = pinnedIds.includes(`drive-${file.id}`);

                return (
                  <div
                    key={file.id}
                    onClick={() => setSelectedFile(file)}
                    className="group bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-xl p-4 transition-all cursor-pointer flex flex-col justify-between shadow-sm hover:shadow-md"
                  >
                    <div>
                      {/* Top Header of Card */}
                      <div className="flex items-start justify-between gap-2 mb-2.5">
                        <div className="p-2 rounded-lg bg-slate-800/80 group-hover:bg-slate-800 border border-slate-700/50">
                          {getFileIcon(file.mimeType)}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onPinFile(`drive-${file.id}`);
                            }}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              isPinned
                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                                : 'bg-slate-800/50 border-transparent text-slate-500 hover:text-slate-300'
                            }`}
                            title={isPinned ? 'Unpin' : 'Pin to Board'}
                          >
                            <Star className={`w-3.5 h-3.5 ${isPinned ? 'fill-amber-400' : ''}`} />
                          </button>

                          {file.webViewLink && (
                            <a
                              href={file.webViewLink}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-transparent transition-colors"
                              title="Open directly in Google Drive"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>

                      {/* File Name */}
                      <h4 className="text-xs font-medium text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-2">
                        {file.name}
                      </h4>
                    </div>

                    {/* Metadata Footer */}
                    <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${meta.color}`}>
                        {meta.label}
                      </span>
                      <div className="flex items-center gap-2">
                        <span>{formatFileSize(file.size)}</span>
                        <span>•</span>
                        <span>{formatDate(file.modifiedTime)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800/80">
              {filteredFiles.map((file) => {
                const meta = getDriveFileType(file.mimeType);
                const isPinned = pinnedIds.includes(`drive-${file.id}`);

                return (
                  <div
                    key={file.id}
                    onClick={() => setSelectedFile(file)}
                    className="p-3 hover:bg-slate-800/50 transition-colors flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-1.5 rounded-lg bg-slate-800 shrink-0">
                        {getFileIcon(file.mimeType)}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-medium text-slate-100 truncate hover:text-cyan-300">
                          {file.name}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2">
                          <span className={`px-1 rounded text-[10px] ${meta.color}`}>{meta.label}</span>
                          <span>{formatFileSize(file.size)}</span>
                          <span>Modified {formatDate(file.modifiedTime)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onCreateTaskFromFile(file);
                        }}
                        className="px-2 py-1 text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
                        title="Add action item for this file"
                      >
                        + Task
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPinFile(`drive-${file.id}`);
                        }}
                        className={`p-1.5 rounded border ${
                          isPinned
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${isPinned ? 'fill-amber-400' : ''}`} />
                      </button>

                      {file.webViewLink && (
                        <a
                          href={file.webViewLink}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Selected File Details Drawer / Modal */}
          {selectedFile && (
            <div
              onClick={() => setSelectedFile(null)}
              className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl p-5 shadow-2xl space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-slate-800 rounded-xl">
                      {getFileIcon(selectedFile.mimeType)}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white line-clamp-1">{selectedFile.name}</h3>
                      <p className="text-xs text-slate-400">{getDriveFileType(selectedFile.mimeType).label}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-slate-400 hover:text-slate-200 text-sm font-bold p-1"
                  >
                    ✕
                  </button>
                </div>

                <div className="bg-slate-950/60 rounded-lg p-3 space-y-2 text-xs border border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-400">File ID:</span>
                    <span className="font-mono text-slate-300 text-[11px] truncate max-w-xs">{selectedFile.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Last Modified:</span>
                    <span className="text-slate-300">{formatDate(selectedFile.modifiedTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">File Size:</span>
                    <span className="text-slate-300">{formatFileSize(selectedFile.size)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">MIME Type:</span>
                    <span className="font-mono text-[11px] text-slate-300 truncate max-w-xs">{selectedFile.mimeType}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => {
                      onCreateTaskFromFile(selectedFile);
                      setSelectedFile(null);
                    }}
                    className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700"
                  >
                    + Create Action Item
                  </button>
                  {selectedFile.webViewLink && (
                    <a
                      href={selectedFile.webViewLink}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center gap-1.5"
                    >
                      <span>Open in Google Drive</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
