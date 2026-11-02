import {
  RefreshCw,
  Cloud,
  Github,
  Database,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  Trash2,
  Activity,
  Layers,
  ArrowUpDown,
  Zap,
  Share2,
  ArrowRight,
  Inbox,
  Send,
  GitCompare,
  Check,
  CopyPlus,
  Radio,
} from 'lucide-react';
import {
  SyncConfig,
  SyncLogEntry,
  GoogleDriveFile,
  AppTab,
  OutboxItem,
  SyncConflict,
  WorkspaceTask,
  WorkspaceNote,
} from '../types';
import { GitHubSyncData } from '../services/github';
import { User } from 'firebase/auth';

interface SyncCenterViewProps {
  config: SyncConfig;
  onUpdateConfig: (config: Partial<SyncConfig>) => void;
  logs: SyncLogEntry[];
  onClearLogs: () => void;
  onSyncAll: () => void;
  onSyncDrive: () => void;
  onSyncGitHub: () => void;
  isSyncing: boolean;
  googleUser: User | null;
  githubUser: any;
  driveFiles: GoogleDriveFile[];
  githubData: GitHubSyncData | null;
  tasksCount: number;
  notesCount: number;
  bridgesCount?: number;
  outboxItems?: OutboxItem[];
  isFlushingOutbox?: boolean;
  onFlushOutbox?: () => void;
  onClearOutbox?: () => void;
  conflicts?: SyncConflict[];
  onResolveConflict?: (conflictId: string, resolution: 'local' | 'cloud' | 'both') => void;
  onSimulateConflict?: () => void;
  onSelectTab?: (tab: AppTab) => void;
  onExportWorkspace: () => void;
}

export const SyncCenterView: React.FC<SyncCenterViewProps> = ({
  config,
  onUpdateConfig,
  logs,
  onClearLogs,
  onSyncAll,
  onSyncDrive,
  onSyncGitHub,
  isSyncing,
  googleUser,
  githubUser,
  driveFiles,
  githubData,
  tasksCount,
  notesCount,
  bridgesCount = 10,
  outboxItems = [],
  isFlushingOutbox = false,
  onFlushOutbox,
  onClearOutbox,
  conflicts = [],
  onResolveConflict,
  onSimulateConflict,
  onSelectTab,
  onExportWorkspace,
}) => {
  const getStatusBadge = (status: SyncLogEntry['status']) => {
    if (status === 'success') {
      return (
        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 w-fit">
          <CheckCircle2 className="w-3 h-3" /> Success
        </span>
      );
    }
    if (status === 'warning') {
      return (
        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1 w-fit">
          <AlertTriangle className="w-3 h-3" /> Warning
        </span>
      );
    }
    return (
      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1 w-fit">
        <AlertTriangle className="w-3 h-3" /> Error
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-indigo-400" />
            <span>OmniSync Continuous Synchronization Engine</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time synchronization across Google Drive, GitHub repositories, issues, and local knowledge.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={onExportWorkspace}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Snapshot</span>
          </button>

          <button
            onClick={onSyncAll}
            disabled={isSyncing}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg flex items-center gap-2 shadow-sm transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing Everything...' : 'Sync All Now'}</span>
          </button>
        </div>
      </div>

      {/* Sync Services Connectivity Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Google Drive Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Cloud className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">Google Drive</h4>
                <p className="text-[11px] text-slate-400">
                  {googleUser ? googleUser.email : 'Not authenticated'}
                </p>
              </div>
            </div>
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                googleUser ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-slate-600'
              }`}
            />
          </div>

          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Indexed Files:</span>
              <span className="font-mono text-slate-200">{driveFiles.length} items</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Last Synced:</span>
              <span className="font-mono text-slate-200">
                {config.lastSyncDrive ? new Date(config.lastSyncDrive).toLocaleTimeString() : 'Never'}
              </span>
            </div>
          </div>

          <button
            onClick={onSyncDrive}
            disabled={isSyncing || !googleUser}
            className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
          >
            Sync Drive Files
          </button>
        </div>

        {/* GitHub Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Github className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">GitHub</h4>
                <p className="text-[11px] text-slate-400">
                  {githubUser ? `@${githubUser.login}` : 'Not connected'}
                </p>
              </div>
            </div>
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                githubUser ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-slate-600'
              }`}
            />
          </div>

          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Repos / Issues:</span>
              <span className="font-mono text-slate-200">
                {githubData?.repos?.length || 0} / {githubData?.issues?.length || 0}
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Last Synced:</span>
              <span className="font-mono text-slate-200">
                {config.lastSyncGitHub ? new Date(config.lastSyncGitHub).toLocaleTimeString() : 'Never'}
              </span>
            </div>
          </div>

          <button
            onClick={onSyncGitHub}
            disabled={isSyncing || !githubUser}
            className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
          >
            Sync GitHub Data
          </button>
        </div>

        {/* Local Knowledge & Cache Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">Local Offline Cache</h4>
                <p className="text-[11px] text-slate-400">Instant offline read/write</p>
              </div>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
          </div>

          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Tasks / Notes:</span>
              <span className="font-mono text-slate-200">
                {tasksCount} tasks / {notesCount} notes
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Persistence State:</span>
              <span className="text-emerald-400 font-medium">Synchronized</span>
            </div>
          </div>

          <button
            onClick={onExportWorkspace}
            className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
          >
            Backup Cache
          </button>
        </div>

        {/* Connectors & Bridges Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Share2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">Project Bridges</h4>
                <p className="text-[11px] text-slate-400">Cross-app pipelines</p>
              </div>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50 animate-pulse" />
          </div>

          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Active Bridges:</span>
              <span className="font-mono text-cyan-400">{bridgesCount} Pipelines</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Latency & Health:</span>
              <span className="text-emerald-400 font-medium">Optimal (~16ms)</span>
            </div>
          </div>

          <button
            onClick={() => onSelectTab && onSelectTab('bridges')}
            className="w-full py-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1"
          >
            <span>Manage Bridges</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Sync Engine Settings */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Autonomous Background Daemon & Cadence</span>
          </h3>
          <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            Non-Blocking Background Worker Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
            <div>
              <div className="text-xs font-medium text-slate-200">Background Auto-Sync</div>
              <div className="text-[11px] text-slate-500">Runs Drive, GitHub, Outbox & Socials silently</div>
            </div>
            <input
              type="checkbox"
              checked={config.autoSync}
              onChange={(e) => onUpdateConfig({ autoSync: e.target.checked })}
              className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
            <div>
              <div className="text-xs font-medium text-slate-200">Background Auto-Resolve</div>
              <div className="text-[11px] text-slate-500">Auto-merge conflicts by latest timestamp</div>
            </div>
            <input
              type="checkbox"
              checked={Boolean(config.autoResolveConflicts)}
              onChange={(e) => onUpdateConfig({ autoResolveConflicts: e.target.checked })}
              className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
            <div>
              <div className="text-xs font-medium text-slate-200">Sync Cadence</div>
              <div className="text-[11px] text-slate-500">Frequency between background ticks</div>
            </div>
            <select
              value={config.intervalMinutes}
              onChange={(e) => onUpdateConfig({ intervalMinutes: Number(e.target.value) })}
              className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-white focus:outline-none"
            >
              <option value={1}>1 Minute (Realtime)</option>
              <option value={5}>5 Minutes</option>
              <option value={15}>15 Minutes</option>
              <option value={30}>30 Minutes</option>
              <option value={60}>1 Hour</option>
            </select>
          </div>
        </div>
      </div>

      {/* Conflict Resolution Center UI (Local Offline vs. Firestore Cloud) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-amber-400" />
              <span>Conflict Resolution Center (Local Offline vs. Firestore Cloud)</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                  conflicts.length > 0
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                    : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {conflicts.length} {conflicts.length === 1 ? 'Conflict' : 'Conflicts'}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Detects when a task or note has been modified both locally while offline and in Firestore Cloud, allowing you to inspect both versions side-by-side and choose which version to keep.
            </p>
          </div>

          {onSimulateConflict && (
            <button
              onClick={onSimulateConflict}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-medium transition-colors shrink-0 flex items-center gap-1.5"
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>Test / Simulate Conflict</span>
            </button>
          )}
        </div>

        {conflicts.length === 0 ? (
          <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-lg flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Zero sync conflicts detected — Local Workspace and Firestore Cloud are in harmony.</span>
            </div>
            <span className="font-mono text-[11px] text-emerald-400">In Sync</span>
          </div>
        ) : (
          <div className="space-y-4">
            {conflicts.map((conflict) => {
              const isTask = conflict.entityType === 'task';
              const localTask = conflict.localVersion as WorkspaceTask;
              const cloudTask = conflict.cloudVersion as WorkspaceTask;
              const localNote = conflict.localVersion as WorkspaceNote;
              const cloudNote = conflict.cloudVersion as WorkspaceNote;

              return (
                <div
                  key={conflict.id}
                  className="p-4 rounded-xl bg-slate-950/90 border border-amber-500/40 space-y-4 shadow-lg"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {conflict.entityType} conflict
                      </span>
                      <h4 className="text-sm font-bold text-white">{conflict.entityTitle}</h4>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {conflict.summary}
                    </span>
                  </div>

                  {/* Side-by-Side Comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Local Offline Version */}
                    <div className="p-3.5 rounded-xl bg-indigo-950/25 border border-indigo-500/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-300">
                          Local Version (Modified Offline)
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {new Date(conflict.localUpdatedAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-white">
                        {conflict.localVersion.title}
                      </div>
                      {isTask ? (
                        <div className="space-y-1 text-xs text-slate-300">
                          <div className="flex items-center gap-2 font-mono text-[11px]">
                            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-indigo-300">
                              Status: {localTask.status}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-amber-300">
                              Priority: {localTask.priority}
                            </span>
                          </div>
                          {localTask.description && (
                            <p className="text-slate-400 text-[11px] pt-1 line-clamp-3">
                              {localTask.description}
                            </p>
                          )}
                        </div>
                      ) : (
                        <pre className="p-2.5 rounded bg-slate-900/90 text-[11px] text-slate-300 font-sans whitespace-pre-wrap max-h-28 overflow-y-auto">
                          {localNote.content}
                        </pre>
                      )}
                    </div>

                    {/* Firestore Cloud Version */}
                    <div className="p-3.5 rounded-xl bg-cyan-950/25 border border-cyan-500/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-cyan-300">
                          Firestore Cloud Version
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {new Date(conflict.cloudUpdatedAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-white">
                        {conflict.cloudVersion.title}
                      </div>
                      {isTask ? (
                        <div className="space-y-1 text-xs text-slate-300">
                          <div className="flex items-center gap-2 font-mono text-[11px]">
                            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300">
                              Status: {cloudTask.status}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-amber-300">
                              Priority: {cloudTask.priority}
                            </span>
                          </div>
                          {cloudTask.description && (
                            <p className="text-slate-400 text-[11px] pt-1 line-clamp-3">
                              {cloudTask.description}
                            </p>
                          )}
                        </div>
                      ) : (
                        <pre className="p-2.5 rounded bg-slate-900/90 text-[11px] text-slate-300 font-sans whitespace-pre-wrap max-h-28 overflow-y-auto">
                          {cloudNote.content}
                        </pre>
                      )}
                    </div>
                  </div>

                  {/* Resolution Actions */}
                  {onResolveConflict && (
                    <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => onResolveConflict(conflict.id, 'local')}
                        className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Keep Local Version</span>
                      </button>

                      <button
                        onClick={() => onResolveConflict(conflict.id, 'cloud')}
                        className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Cloud className="w-3.5 h-3.5" />
                        <span>Keep Firestore Cloud Version</span>
                      </button>

                      <button
                        onClick={() => onResolveConflict(conflict.id, 'both')}
                        className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <CopyPlus className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Keep Both (Save Forked Copy)</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Persistent Offline Outbox Queue */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <Inbox className="w-4 h-4 text-cyan-400" />
              <span>Persistent Offline Outbox Queue (localStorage → Firestore)</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                  outboxItems.length > 0
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {outboxItems.length} Queued
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Queues all task creations, status updates, note edits, and project changes in{' '}
              <code className="text-cyan-300 font-mono">omnisync_outbox_v1</code> while offline and automatically flushes them to Firestore when connectivity is restored.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {outboxItems.length > 0 && onClearOutbox && (
              <button
                onClick={onClearOutbox}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg border border-slate-700 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Clear Queue</span>
              </button>
            )}
            {onFlushOutbox && (
              <button
                onClick={onFlushOutbox}
                disabled={isFlushingOutbox || outboxItems.length === 0 || !googleUser}
                className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Send className={`w-3.5 h-3.5 ${isFlushingOutbox ? 'animate-pulse' : ''}`} />
                <span>
                  {isFlushingOutbox ? 'Flushing to Firestore...' : 'Flush Outbox Now'}
                </span>
              </button>
            )}
          </div>
        </div>

        {outboxItems.length === 0 ? (
          <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-lg flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Outbox is empty — all local mutations are flushed to Firestore Cloud.</span>
            </div>
            <span className="font-mono text-[11px] text-emerald-400">Auto-Flush Armed</span>
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-800 rounded-lg">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2 px-3">Queued At</th>
                  <th className="py-2 px-3">Entity</th>
                  <th className="py-2 px-3">Operation</th>
                  <th className="py-2 px-3">Item Title / ID</th>
                  <th className="py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {outboxItems.map((item) => (
                  <tr key={item.id} className="bg-slate-950/40">
                    <td className="py-2 px-3 text-[11px] text-slate-400 whitespace-nowrap">
                      {new Date(item.queuedAt).toLocaleTimeString()}
                    </td>
                    <td className="py-2 px-3 uppercase text-[10px] font-semibold text-cyan-300">
                      {item.entityType}
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded uppercase font-semibold ${
                          item.action === 'delete'
                            ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                            : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                        }`}
                      >
                        {item.action}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-sans text-xs text-slate-200 truncate max-w-xs">
                      {item.entityTitle || item.entityId}
                    </td>
                    <td className="py-2 px-3 text-[11px]">
                      {item.attempts > 0 ? (
                        <span className="text-amber-400" title={item.lastError}>
                          Retry #{item.attempts} Pending
                        </span>
                      ) : (
                        <span className="text-slate-400">Waiting for connection / auth</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sync Log Stream Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            <span>Sync Event Log & Audit Stream</span>
          </h3>

          {logs.length > 0 && (
            <button
              onClick={onClearLogs}
              className="text-xs text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {logs.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg">
            No sync logs recorded yet. Trigger a sync above to view real-time audit records.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Source</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Items</th>
                  <th className="py-2.5 px-3">Duration</th>
                  <th className="py-2.5 px-3">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-400 text-[11px]">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 px-3 uppercase text-[10px] font-semibold text-indigo-300">
                      {log.source}
                    </td>
                    <td className="py-2.5 px-3">{getStatusBadge(log.status)}</td>
                    <td className="py-2.5 px-3 text-slate-200">{log.itemCount}</td>
                    <td className="py-2.5 px-3 text-slate-400">{log.durationMs}ms</td>
                    <td className="py-2.5 px-3 font-sans text-slate-300 text-[11px] truncate max-w-xs">
                      {log.message}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
