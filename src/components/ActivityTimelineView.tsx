import React from 'react';
import {
  Activity,
  GitCommit,
  Cloud,
  CheckSquare,
  ExternalLink,
  CircleDot,
  FileText,
  Clock,
  Layers,
} from 'lucide-react';
import { GoogleDriveFile, GitHubEvent, WorkspaceTask } from '../types';

interface ActivityTimelineViewProps {
  driveFiles: GoogleDriveFile[];
  githubEvents: GitHubEvent[];
  tasks: WorkspaceTask[];
}

export const ActivityTimelineView: React.FC<ActivityTimelineViewProps> = ({
  driveFiles,
  githubEvents,
  tasks,
}) => {
  // Aggregate items into unified timeline
  const items: Array<{
    id: string;
    type: 'drive' | 'github' | 'task';
    title: string;
    subtitle: string;
    date: Date;
    url?: string;
    icon: any;
    color: string;
  }> = [];

  // Add Drive Files
  driveFiles.slice(0, 20).forEach((f) => {
    items.push({
      id: `drive-${f.id}`,
      type: 'drive',
      title: `Updated "${f.name}"`,
      subtitle: `Google Drive • ${f.mimeType.split('.').pop() || 'file'}`,
      date: new Date(f.modifiedTime),
      url: f.webViewLink,
      icon: Cloud,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    });
  });

  // Add GitHub Events
  githubEvents.slice(0, 20).forEach((e) => {
    const commitMsg = e.payload?.commits?.[0]?.message;
    items.push({
      id: `gh-${e.id}`,
      type: 'github',
      title: commitMsg ? `Pushed commit: "${commitMsg}"` : `${e.type.replace('Event', '')} on ${e.repo.name}`,
      subtitle: `GitHub • ${e.repo.name}`,
      date: new Date(e.created_at),
      url: `https://github.com/${e.repo.name}`,
      icon: GitCommit,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    });
  });

  // Add Tasks
  tasks.slice(0, 15).forEach((t) => {
    items.push({
      id: `task-${t.id}`,
      type: 'task',
      title: `${t.status === 'done' ? 'Completed task' : 'Created task'}: "${t.title}"`,
      subtitle: `Workspace Action Item • Priority: ${t.priority}`,
      date: new Date(t.createdAt),
      url: t.sourceUrl,
      icon: CheckSquare,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    });
  });

  // Sort by date descending
  items.sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-400" />
          <span>Unified Activity Stream</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Real-time merged audit trail of your changes across GitHub, Google Drive, and workspace tasks.
        </p>
      </div>

      {/* Stream list */}
      {items.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-slate-800 rounded-xl space-y-2">
          <Clock className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-xs font-medium text-slate-300">No activity recorded yet</p>
          <p className="text-[11px] text-slate-500">Connect Google Drive or GitHub to stream live activity.</p>
        </div>
      ) : (
        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.id} className="relative group">
                {/* Dot */}
                <div
                  className={`absolute -left-6 top-2.5 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${item.color}`}
                >
                  <Icon className="w-3 h-3" />
                </div>

                {/* Content Box */}
                <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 transition-all shadow-sm flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="text-xs font-medium text-slate-100 group-hover:text-indigo-300 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{item.subtitle}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-slate-400 text-[11px]">
                    <span className="font-mono text-[10px]">
                      {item.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}{' '}
                      {item.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
