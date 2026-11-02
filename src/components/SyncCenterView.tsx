import React from 'react';
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
} from 'lucide-react';
import { SyncConfig, SyncLogEntry, GoogleDriveFile } from '../types';
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      </div>

      {/* Sync Engine Settings */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Automation & Background Cadence</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
            <div>
              <div className="text-xs font-medium text-slate-200">Automatic Sync</div>
              <div className="text-[11px] text-slate-500">Run sync quietly in the background</div>
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
              <div className="text-xs font-medium text-slate-200">Sync Cadence</div>
              <div className="text-[11px] text-slate-500">Frequency between automatic updates</div>
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
