import React, { useState } from 'react';
import {
  Github,
  Search,
  ExternalLink,
  Star,
  GitFork,
  CircleDot,
  GitPullRequest,
  GitCommit,
  RefreshCw,
  Plus,
  Key,
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  FolderGit2,
} from 'lucide-react';
import { GitHubRepo, GitHubIssue, GitHubEvent } from '../types';
import { GitHubUser } from '../services/github';

interface GitHubViewProps {
  repos: GitHubRepo[];
  issues: GitHubIssue[];
  events: GitHubEvent[];
  starred: GitHubRepo[];
  githubUser: GitHubUser | null;
  isLoading: boolean;
  onRefresh: () => void;
  onConfigureAuth: () => void;
  onPinRepo: (repoId: string) => void;
  pinnedIds: string[];
  onCreateTaskFromIssue: (issue: GitHubIssue) => void;
}

export const GitHubView: React.FC<GitHubViewProps> = ({
  repos,
  issues,
  events,
  starred,
  githubUser,
  isLoading,
  onRefresh,
  onConfigureAuth,
  onPinRepo,
  pinnedIds,
  onCreateTaskFromIssue,
}) => {
  const [activeTab, setActiveTab] = useState<'repos' | 'issues' | 'events' | 'starred'>('repos');
  const [search, setSearch] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');

  // Extract unique languages
  const languages = ['all', ...Array.from(new Set(repos.map((r) => r.language).filter(Boolean))) as string[]];

  const filteredRepos = repos.filter((r) => {
    const matchesSearch =
      !search ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(search.toLowerCase()));

    const matchesLang = languageFilter === 'all' || r.language === languageFilter;
    return matchesSearch && matchesLang;
  });

  const filteredIssues = issues.filter((i) => {
    return (
      !search ||
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      (i.repo_name && i.repo_name.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const getLanguageColor = (lang: string | null) => {
    const colors: Record<string, string> = {
      TypeScript: 'bg-blue-500',
      JavaScript: 'bg-yellow-400',
      Python: 'bg-emerald-500',
      Rust: 'bg-orange-500',
      Go: 'bg-cyan-400',
      Java: 'bg-red-500',
      HTML: 'bg-rose-400',
      CSS: 'bg-purple-400',
    };
    return colors[lang || ''] || 'bg-slate-500';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & User Profile */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 overflow-hidden">
            {githubUser?.avatar_url ? (
              <img src={githubUser.avatar_url} alt={githubUser.login} className="w-full h-full object-cover" />
            ) : (
              <Github className="w-6 h-6" />
            )}
          </div>
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              GitHub Developer Hub
              {githubUser && (
                <span className="text-[10px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Connected as @{githubUser.login}
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {githubUser
                ? `${githubUser.name || githubUser.login} • ${repos.length} Repositories • ${issues.length} Issues • Live sync enabled`
                : 'Connect with your GitHub account (Personal Access Token or username) to sync repos & issues.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={onConfigureAuth}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg flex items-center gap-2 border border-slate-700 transition-colors"
          >
            <Key className="w-3.5 h-3.5 text-indigo-400" />
            <span>{githubUser ? 'Account Settings' : 'Connect GitHub'}</span>
          </button>

          {githubUser && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg flex items-center gap-2 shadow-sm transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Syncing...' : 'Sync GitHub'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('repos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'repos'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>Repositories ({repos.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('issues')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'issues'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <CircleDot className="w-3.5 h-3.5" />
            <span>Issues & PRs ({issues.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('events')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'events'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitCommit className="w-3.5 h-3.5" />
            <span>Commits Activity</span>
          </button>

          <button
            onClick={() => setActiveTab('starred')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'starred'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>Starred ({starred.length})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-48 sm:w-64 hidden sm:block">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter GitHub items..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Repositories Tab Content */}
      {activeTab === 'repos' && (
        <div className="space-y-4">
          {/* Language filter chips */}
          {languages.length > 2 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {languages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguageFilter(lang)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    languageFilter === lang
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lang === 'all' ? 'All Languages' : lang}
                </button>
              ))}
            </div>
          )}

          {filteredRepos.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-slate-800 rounded-xl space-y-2">
              <FolderGit2 className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs font-medium text-slate-300">No repositories found</p>
              <p className="text-[11px] text-slate-500">
                {githubUser ? 'Try adjusting your search query.' : 'Connect your GitHub account to sync repositories.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredRepos.map((repo) => {
                const isPinned = pinnedIds.includes(`repo-${repo.id}`);

                return (
                  <div
                    key={repo.id}
                    className="bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-xl p-4 transition-all flex flex-col justify-between shadow-sm"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-white hover:text-indigo-400 transition-colors">
                            {repo.name}
                          </h4>
                          {repo.private && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              Private
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onPinRepo(`repo-${repo.id}`)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              isPinned
                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                                : 'bg-slate-800/50 border-transparent text-slate-500 hover:text-slate-300'
                            }`}
                            title={isPinned ? 'Unpin' : 'Pin to Board'}
                          >
                            <Star className={`w-3.5 h-3.5 ${isPinned ? 'fill-amber-400' : ''}`} />
                          </button>

                          <a
                            href={repo.html_url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>

                      <p className="text-xs text-slate-400 line-clamp-2 min-h-[2.5rem]">
                        {repo.description || 'No description provided.'}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                      <div className="flex items-center gap-2">
                        {repo.language && (
                          <span className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${getLanguageColor(repo.language)}`} />
                            <span>{repo.language}</span>
                          </span>
                        )}
                        <span>★ {repo.stargazers_count}</span>
                        <span>⑂ {repo.forks_count}</span>
                      </div>

                      <span>Updated {formatDate(repo.updated_at)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Issues Tab Content */}
      {activeTab === 'issues' && (
        <div className="space-y-3">
          {filteredIssues.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-slate-800 rounded-xl space-y-2">
              <CircleDot className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs font-medium text-slate-300">No issues or pull requests found</p>
              <p className="text-[11px] text-slate-500">
                {githubUser ? 'All clear! No open issues or pull requests assigned.' : 'Connect your account to view assigned issues.'}
              </p>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800/80">
              {filteredIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="p-3.5 hover:bg-slate-800/40 transition-colors flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="mt-0.5 text-emerald-400">
                      {issue.pull_request ? (
                        <GitPullRequest className="w-4 h-4 text-purple-400" />
                      ) : (
                        <CircleDot className="w-4 h-4" />
                      )}
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-medium text-slate-100 hover:text-indigo-300">
                          {issue.title}
                        </span>
                        {issue.repo_name && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                            {issue.repo_name} #{issue.number}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-3">
                        <span>Opened {formatDate(issue.created_at)}</span>
                        {issue.comments > 0 && <span>💬 {issue.comments} comments</span>}
                        {issue.labels?.map((label) => (
                          <span
                            key={label.name}
                            className="px-1.5 py-0.2 rounded text-[10px]"
                            style={{ backgroundColor: `#${label.color}20`, color: `#${label.color}` }}
                          >
                            {label.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onCreateTaskFromIssue(issue)}
                      className="px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 flex items-center gap-1.5"
                      title="Convert this GitHub issue into an actionable workspace task"
                    >
                      <Plus className="w-3 h-3 text-indigo-400" />
                      <span>Track as Task</span>
                    </button>

                    <a
                      href={issue.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Events / Commits Activity Tab */}
      {activeTab === 'events' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 divide-y divide-slate-800/80">
          {events.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No recent GitHub events recorded.
            </div>
          ) : (
            events.map((ev) => (
              <div key={ev.id} className="py-3 flex items-start gap-3 first:pt-0 last:pb-0">
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg shrink-0 mt-0.5">
                  <GitCommit className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-slate-200">
                    <span className="capitalize">{ev.type.replace('Event', '')}</span> on{' '}
                    <span className="font-mono text-indigo-300">{ev.repo.name}</span>
                  </div>
                  {ev.payload?.commits && (
                    <div className="mt-1 space-y-1">
                      {ev.payload.commits.slice(0, 3).map((c: any, i: number) => (
                        <p key={i} className="text-[11px] text-slate-400 font-mono truncate">
                          • {c.message}
                        </p>
                      ))}
                    </div>
                  )}
                  <div className="text-[10px] text-slate-400 mt-1">
                    {formatDate(ev.created_at)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Starred Tab */}
      {activeTab === 'starred' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {starred.map((repo) => (
            <div key={repo.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-semibold text-white flex items-center justify-between">
                  <span>{repo.full_name}</span>
                  <a href={repo.html_url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{repo.description || 'No description'}</p>
              </div>
              <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>★ {repo.stargazers_count}</span>
                <span>{repo.language || 'Code'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
