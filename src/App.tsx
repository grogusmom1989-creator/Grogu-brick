/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User } from 'firebase/auth';
import {
  AppTab,
  GoogleDriveFile,
  GitHubRepo,
  GitHubIssue,
  GitHubEvent,
  WorkspaceTask,
  WorkspaceNote,
  WorkspaceProject,
  ProjectBridge,
  BridgeEvent,
  SyncConfig,
  SyncLogEntry,
} from './types';
import {
  initAuth,
  googleSignIn,
  logout as firebaseLogout,
  getAccessToken,
  setCachedAccessToken,
} from './services/firebase';
import { fetchDriveFiles } from './services/googleDrive';
import { fetchGitHubData, GitHubUser, GitHubSyncData } from './services/github';
import {
  getStoredTasks,
  saveStoredTasks,
  getStoredNotes,
  saveStoredNotes,
  getStoredProjects,
  saveStoredProjects,
  getStoredBridges,
  saveStoredBridges,
  getStoredBridgeEvents,
  addStoredBridgeEvent,
  clearStoredBridgeEvents,
  getSyncConfig,
  saveSyncConfig,
  getSyncLogs,
  addSyncLog,
  clearSyncLogs,
  getCachedDriveFiles,
  saveCachedDriveFiles,
  getCachedGitHubData,
  saveCachedGitHubData,
  getPinnedIds,
  togglePinnedId,
} from './services/storage';

// Components
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { CommandPalette } from './components/CommandPalette';
import { OverviewDashboard } from './components/OverviewDashboard';
import { GoogleDriveView } from './components/GoogleDriveView';
import { GitHubView } from './components/GitHubView';
import { GitHubAuthModal } from './components/GitHubAuthModal';
import { TasksView } from './components/TasksView';
import { NotesView } from './components/NotesView';
import { ActivityTimelineView } from './components/ActivityTimelineView';
import { SyncCenterView } from './components/SyncCenterView';
import { AICopilotView } from './components/AICopilotView';
import { OneDWorldView } from './components/OneDWorldView';
import { KikisWorldView } from './components/KikisWorldView';
import { RemixedAppView } from './components/RemixedAppView';
import { PayPalEarningsView } from './components/PayPalEarningsView';
import { ProjectPortfolioView } from './components/ProjectPortfolioView';
import { ConnectorsBridgesView } from './components/ConnectorsBridgesView';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Authentication State
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // GitHub State
  const [githubUser, setGithubUser] = useState<GitHubUser | null>(null);
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([]);
  const [githubIssues, setGithubIssues] = useState<GitHubIssue[]>([]);
  const [githubEvents, setGithubEvents] = useState<GitHubEvent[]>([]);
  const [githubStarred, setGithubStarred] = useState<GitHubRepo[]>([]);
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [githubError, setGithubError] = useState<string | undefined>(undefined);

  // Google Drive State
  const [driveFiles, setDriveFiles] = useState<GoogleDriveFile[]>([]);
  const [isDriveLoading, setIsDriveLoading] = useState(false);

  // Local Workspace State
  const [tasks, setTasks] = useState<WorkspaceTask[]>([]);
  const [notes, setNotes] = useState<WorkspaceNote[]>([]);
  const [projects, setProjects] = useState<WorkspaceProject[]>([]);
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);

  // Connectors & Bridges State
  const [bridges, setBridges] = useState<ProjectBridge[]>([]);
  const [bridgeEvents, setBridgeEvents] = useState<BridgeEvent[]>([]);

  // Sync Engine State
  const [syncConfig, setSyncConfig] = useState<SyncConfig>(getSyncConfig());
  const [syncLogs, setSyncLogs] = useState<SyncLogEntry[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncCountdown, setSyncCountdown] = useState<number>(300); // 5 min default

  // Global Command Palette (Cmd + K)
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  // 1. Initial Load from Local Cache & Config
  useEffect(() => {
    setTasks(getStoredTasks());
    setNotes(getStoredNotes());
    setProjects(getStoredProjects());
    setBridges(getStoredBridges());
    setBridgeEvents(getStoredBridgeEvents());
    setSyncLogs(getSyncLogs());
    setPinnedIds(getPinnedIds());

    const cachedDrive = getCachedDriveFiles();
    if (cachedDrive.length > 0) {
      setDriveFiles(cachedDrive);
    }

    const cachedGh = getCachedGitHubData();
    if (cachedGh) {
      setGithubUser(cachedGh.user);
      setGithubRepos(cachedGh.repos);
      setGithubIssues(cachedGh.issues);
      setGithubEvents(cachedGh.events);
      setGithubStarred(cachedGh.starred);
    }

    // Initialize Firebase Auth listener
    initAuth(
      (user, token) => {
        setGoogleUser(user);
        setCachedAccessToken(token);
        // Automatically fetch drive files when token is ready
        syncDrive(token);
      },
      () => {
        setGoogleUser(null);
      }
    );
  }, []);

  // 2. Fetch GitHub Data Handler
  const syncGitHub = useCallback(async (username?: string, token?: string) => {
    const config = getSyncConfig();
    const effectiveUser = username ?? config.githubUsername;
    const effectiveToken = token ?? config.githubToken;

    if (!effectiveUser && !effectiveToken) return;

    setIsGitHubLoading(true);
    const startTime = Date.now();
    try {
      const data = await fetchGitHubData(effectiveUser, effectiveToken);
      if (data.user) {
        setGithubUser(data.user);
        setGithubError(undefined);
      } else {
        setGithubUser(null);
        if (data.error) setGithubError(data.error);
      }
      setGithubRepos(data.repos);
      setGithubIssues(data.issues);
      setGithubEvents(data.events);
      setGithubStarred(data.starred);
      saveCachedGitHubData(data);

      const durationMs = Date.now() - startTime;
      const count = data.repos.length + data.issues.length;
      addSyncLog({
        source: 'github',
        status: data.error ? 'warning' : 'success',
        itemCount: count,
        message: data.error || `Successfully synced ${data.repos.length} repos and ${data.issues.length} issues`,
        durationMs,
      });
      setSyncLogs(getSyncLogs());

      const nextConfig = { ...config, lastSyncGitHub: new Date().toISOString() };
      setSyncConfig(nextConfig);
      saveSyncConfig(nextConfig);
    } catch (err: any) {
      setGithubError(err.message || 'Failed to sync GitHub data');
      addSyncLog({
        source: 'github',
        status: 'error',
        itemCount: 0,
        message: err.message || 'Failed to sync GitHub',
        durationMs: Date.now() - startTime,
      });
      setSyncLogs(getSyncLogs());
    } finally {
      setIsGitHubLoading(false);
    }
  }, []);

  // Initial GitHub load on startup
  useEffect(() => {
    const config = getSyncConfig();
    if (config.githubUsername || config.githubToken) {
      syncGitHub();
    }
  }, [syncGitHub]);

  // 3. Fetch Google Drive Files Handler
  const syncDrive = useCallback(async (manualToken?: string) => {
    const token = manualToken || (await getAccessToken());
    if (!token) return;

    setIsDriveLoading(true);
    const startTime = Date.now();
    try {
      const result = await fetchDriveFiles();
      if (result.error) {
        addSyncLog({
          source: 'drive',
          status: 'warning',
          itemCount: 0,
          message: result.error,
          durationMs: Date.now() - startTime,
        });
      } else {
        setDriveFiles(result.files);
        saveCachedDriveFiles(result.files);

        addSyncLog({
          source: 'drive',
          status: 'success',
          itemCount: result.files.length,
          message: `Indexed ${result.files.length} Google Drive files & documents`,
          durationMs: Date.now() - startTime,
        });

        const config = getSyncConfig();
        const nextConfig = { ...config, lastSyncDrive: new Date().toISOString() };
        setSyncConfig(nextConfig);
        saveSyncConfig(nextConfig);
      }
      setSyncLogs(getSyncLogs());
    } catch (err: any) {
      addSyncLog({
        source: 'drive',
        status: 'error',
        itemCount: 0,
        message: err.message || 'Failed to sync Drive',
        durationMs: Date.now() - startTime,
      });
      setSyncLogs(getSyncLogs());
    } finally {
      setIsDriveLoading(false);
    }
  }, []);

  // 4. Master Sync All Handler
  const syncAll = useCallback(async () => {
    setIsSyncing(true);
    const startTime = Date.now();
    try {
      await Promise.allSettled([
        syncDrive(),
        syncGitHub(),
      ]);

      const config = getSyncConfig();
      const nextConfig = { ...config, lastSyncAll: new Date().toISOString() };
      setSyncConfig(nextConfig);
      saveSyncConfig(nextConfig);
      setSyncCountdown((config.intervalMinutes || 5) * 60);

      addSyncLog({
        source: 'all',
        status: 'success',
        itemCount: driveFiles.length + githubRepos.length + tasks.length,
        message: 'Completed full workspace multi-sync cycle',
        durationMs: Date.now() - startTime,
      });
      setSyncLogs(getSyncLogs());
    } finally {
      setIsSyncing(false);
    }
  }, [syncDrive, syncGitHub, driveFiles.length, githubRepos.length, tasks.length]);

  // 5. Auto-Sync Countdown Daemon
  useEffect(() => {
    if (!syncConfig.autoSync) return;

    const interval = setInterval(() => {
      setSyncCountdown((prev) => {
        if (prev <= 1) {
          syncAll();
          return (syncConfig.intervalMinutes || 5) * 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [syncConfig.autoSync, syncConfig.intervalMinutes, syncAll]);

  // 6. Global Keyboard Shortcuts (Cmd + K, /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 7. Google Sign-In Action
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const res = await googleSignIn();
      if (res?.user && res.accessToken) {
        setGoogleUser(res.user);
        await syncDrive(res.accessToken);
      }
    } catch (err) {
      console.error('Google Sign in failed:', err);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleLogout = async () => {
    if (window.confirm('Disconnect Google Drive from this workspace?')) {
      await firebaseLogout();
      setGoogleUser(null);
      setDriveFiles([]);
      saveCachedDriveFiles([]);
      addSyncLog({
        source: 'drive',
        status: 'warning',
        itemCount: 0,
        message: 'Google Drive disconnected by user',
        durationMs: 10,
      });
      setSyncLogs(getSyncLogs());
    }
  };

  // 8. GitHub Auth Save
  const handleSaveGitHub = (username: string, token: string) => {
    const nextConfig = {
      ...syncConfig,
      githubUsername: username,
      githubToken: token,
    };
    setSyncConfig(nextConfig);
    saveSyncConfig(nextConfig);
    setIsGitHubModalOpen(false);
    syncGitHub(username, token);
  };

  // 9. Tasks and Notes Handlers
  const handleAddTask = (newTask: Omit<WorkspaceTask, 'id' | 'createdAt'>) => {
    const task: WorkspaceTask = {
      ...newTask,
      id: 'task-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    const updated = [task, ...tasks];
    setTasks(updated);
    saveStoredTasks(updated);
  };

  const handleUpdateTaskStatus = (taskId: string, status: 'todo' | 'in_progress' | 'done') => {
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, status } : t));
    setTasks(updated);
    saveStoredTasks(updated);
  };

  const handleDeleteTask = (taskId: string) => {
    const updated = tasks.filter((t) => t.id !== taskId);
    setTasks(updated);
    saveStoredTasks(updated);
  };

  const handleCreateTaskFromDriveFile = (file: GoogleDriveFile) => {
    handleAddTask({
      title: `Review document: "${file.name}"`,
      description: `Indexed from Google Drive (${file.mimeType}).`,
      status: 'todo',
      priority: 'medium',
      source: 'drive',
      sourceUrl: file.webViewLink,
      sourceTitle: file.name,
      tags: ['Drive', 'Doc'],
    });
    setActiveTab('tasks');
  };

  const handleCreateTaskFromIssue = (issue: GitHubIssue) => {
    handleAddTask({
      title: `Fix Issue #${issue.number}: ${issue.title}`,
      description: issue.body || 'Assigned GitHub issue.',
      status: 'todo',
      priority: 'high',
      source: 'github',
      sourceUrl: issue.html_url,
      sourceTitle: `${issue.repo_name || 'repo'} #${issue.number}`,
      tags: ['GitHub', 'Bug'],
    });
    setActiveTab('tasks');
  };

  const handleAddNote = (newNote: Omit<WorkspaceNote, 'id' | 'updatedAt'>) => {
    const note: WorkspaceNote = {
      ...newNote,
      id: 'note-' + Date.now(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [note, ...notes];
    setNotes(updated);
    saveStoredNotes(updated);
  };

  const handleUpdateNote = (id: string, updates: Partial<WorkspaceNote>) => {
    const updated = notes.map((n) =>
      n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
    );
    setNotes(updated);
    saveStoredNotes(updated);
  };

  const handleDeleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    saveStoredNotes(updated);
  };

  // Project Management Handlers
  const handleAddProject = (newProjData: Omit<WorkspaceProject, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProj: WorkspaceProject = {
      ...newProjData,
      id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newProj, ...projects];
    setProjects(updated);
    saveStoredProjects(updated);
    addSyncLog({
      source: 'all',
      status: 'success',
      itemCount: 1,
      message: `Added project: "${newProj.name}"`,
      durationMs: 25,
    });
    setSyncLogs(getSyncLogs());
  };

  const handleUpdateProject = (id: string, updates: Partial<WorkspaceProject>) => {
    const updated = projects.map((p) =>
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    );
    setProjects(updated);
    saveStoredProjects(updated);
  };

  const handleDeleteProject = (id: string) => {
    const updated = projects.filter((p) => p.id !== id);
    setProjects(updated);
    saveStoredProjects(updated);
  };

  const handleBatchImportProjects = (newProjects: WorkspaceProject[]) => {
    // Avoid duplicates by id or repoFullName or driveFolderId
    const existingIds = new Set(projects.map((p) => p.id));
    const existingRepoNames = new Set(projects.map((p) => p.repoFullName?.toLowerCase()).filter(Boolean));
    const existingDriveIds = new Set(projects.map((p) => p.driveFolderId).filter(Boolean));

    const deduplicated = newProjects.filter((p) => {
      if (existingIds.has(p.id)) return false;
      if (p.repoFullName && existingRepoNames.has(p.repoFullName.toLowerCase())) return false;
      if (p.driveFolderId && existingDriveIds.has(p.driveFolderId)) return false;
      return true;
    });

    const updated = [...deduplicated, ...projects];
    setProjects(updated);
    saveStoredProjects(updated);
    addSyncLog({
      source: 'all',
      status: 'success',
      itemCount: deduplicated.length,
      message: `Pulled in ${deduplicated.length} projects to portfolio`,
      durationMs: 35,
    });
    setSyncLogs(getSyncLogs());
  };

  // Connectors & Bridges Handlers
  const handleUpdateBridge = (id: string, updates: Partial<ProjectBridge>) => {
    setBridges((prev) => {
      const updated = prev.map((b) => (b.id === id ? { ...b, ...updates } : b));
      saveStoredBridges(updated);
      return updated;
    });
  };

  const handleAddBridge = (newBridge: Omit<ProjectBridge, 'id' | 'packetsCount' | 'lastEventAt'>) => {
    setBridges((prev) => {
      const bridge: ProjectBridge = {
        ...newBridge,
        id: `bridge-${Date.now()}`,
        packetsCount: 0,
        lastEventAt: new Date().toISOString(),
      };
      const updated = [bridge, ...prev];
      saveStoredBridges(updated);
      return updated;
    });
  };

  const handleDeleteBridge = (id: string) => {
    setBridges((prev) => {
      const updated = prev.filter((b) => b.id !== id);
      saveStoredBridges(updated);
      return updated;
    });
  };

  const handleAddBridgeEvent = (eventData: Omit<BridgeEvent, 'id' | 'timestamp'>) => {
    const newEvt: BridgeEvent = {
      ...eventData,
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    const updated = addStoredBridgeEvent(newEvt);
    setBridgeEvents(updated);
  };

  const handleClearBridgeEvents = () => {
    clearStoredBridgeEvents();
    setBridgeEvents([]);
  };

  const handlePin = (id: string) => {
    const nextPins = togglePinnedId(id);
    setPinnedIds(nextPins);
  };

  // 10. Export Snapshot
  const handleExportWorkspace = () => {
    const snapshot = {
      exportDate: new Date().toISOString(),
      driveFilesCount: driveFiles.length,
      githubReposCount: githubRepos.length,
      tasks,
      notes,
      syncConfig,
      syncLogs,
    };
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `omnisync-workspace-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Navbar */}
      <Navbar
        onOpenCommand={() => setIsCommandOpen(true)}
        onSyncAll={syncAll}
        isSyncing={isSyncing || isDriveLoading || isGitHubLoading}
        syncCountdown={syncCountdown}
        autoSyncEnabled={syncConfig.autoSync}
        googleUser={googleUser}
        githubUser={githubUser}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Container */}
      <div className="flex-1 flex w-full">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          driveCount={driveFiles.length}
          githubRepoCount={githubRepos.length}
          taskCount={tasks.filter((t) => t.status !== 'done').length}
          noteCount={notes.length}
          projectCount={projects.length}
          bridgesCount={bridges.length}
          googleUser={googleUser}
          githubUser={githubUser}
          onLogoutGoogle={handleGoogleLogout}
          onOpenGitHubModal={() => setIsGitHubModalOpen(true)}
        />

        {/* Center Main View Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto overflow-y-auto">
          {activeTab === 'overview' && (
            <OverviewDashboard
              onSelectTab={setActiveTab}
              onOpenCommand={() => setIsCommandOpen(true)}
              onSyncAll={syncAll}
              isSyncing={isSyncing || isDriveLoading || isGitHubLoading}
              googleUser={googleUser}
              onGoogleSignIn={handleGoogleSignIn}
              githubUser={githubUser}
              onConfigureGitHub={() => setIsGitHubModalOpen(true)}
              driveFiles={driveFiles}
              githubRepos={githubRepos}
              githubIssues={githubIssues}
              tasks={tasks}
              notes={notes}
              pinnedIds={pinnedIds}
              projectsCount={projects.length}
              bridgesCount={bridges.length}
              onOpenNewTaskModal={() => setIsNewTaskModalOpen(true)}
              onUpdateTaskStatus={handleUpdateTaskStatus}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectPortfolioView
              projects={projects}
              onAddProject={handleAddProject}
              onUpdateProject={handleUpdateProject}
              onDeleteProject={handleDeleteProject}
              onBatchImportProjects={handleBatchImportProjects}
              githubRepos={githubRepos}
              githubUser={githubUser}
              driveFiles={driveFiles}
              googleUser={googleUser}
              onSyncGitHub={() => syncGitHub()}
              onSyncDrive={() => syncDrive()}
              onAddTask={handleAddTask}
              onAddNote={handleAddNote}
              onSelectTab={setActiveTab}
              onLogSyncEvent={(source, msg, count) => {
                addSyncLog({
                  source: source === 'github' ? 'github' : source === 'drive' ? 'drive' : 'all',
                  status: 'success',
                  itemCount: count,
                  message: msg,
                  durationMs: 35,
                });
                setSyncLogs(getSyncLogs());
              }}
            />
          )}

          {activeTab === 'bridges' && (
            <ConnectorsBridgesView
              bridges={bridges}
              onUpdateBridge={handleUpdateBridge}
              onAddBridge={handleAddBridge}
              onDeleteBridge={handleDeleteBridge}
              bridgeEvents={bridgeEvents}
              onAddBridgeEvent={handleAddBridgeEvent}
              onClearBridgeEvents={handleClearBridgeEvents}
              googleUser={googleUser}
              githubUser={githubUser}
              driveFiles={driveFiles}
              githubRepos={githubRepos}
              tasks={tasks}
              notes={notes}
              projects={projects}
              onSelectTab={setActiveTab}
              onAddTask={handleAddTask}
              onAddNote={handleAddNote}
            />
          )}

          {activeTab === 'drive' && (
            <GoogleDriveView
              files={driveFiles}
              googleUser={googleUser}
              isLoading={isDriveLoading}
              onSignIn={handleGoogleSignIn}
              onRefresh={() => syncDrive()}
              onOpenInDrive={(url) => url && window.open(url, '_blank')}
              onPinFile={handlePin}
              pinnedIds={pinnedIds}
              onCreateTaskFromFile={handleCreateTaskFromDriveFile}
            />
          )}

          {activeTab === 'github' && (
            <GitHubView
              repos={githubRepos}
              issues={githubIssues}
              events={githubEvents}
              starred={githubStarred}
              githubUser={githubUser}
              isLoading={isGitHubLoading}
              onRefresh={() => syncGitHub()}
              onConfigureAuth={() => setIsGitHubModalOpen(true)}
              onPinRepo={handlePin}
              pinnedIds={pinnedIds}
              onCreateTaskFromIssue={handleCreateTaskFromIssue}
              error={githubError}
            />
          )}

          {activeTab === 'tasks' && (
            <TasksView
              tasks={tasks}
              onAddTask={handleAddTask}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              onDeleteTask={handleDeleteTask}
              isOpenNewTaskModal={isNewTaskModalOpen}
              onCloseNewTaskModal={() => setIsNewTaskModalOpen(false)}
              onOpenNewTaskModal={() => setIsNewTaskModalOpen(true)}
            />
          )}

          {activeTab === 'notes' && (
            <NotesView
              notes={notes}
              onAddNote={handleAddNote}
              onUpdateNote={handleUpdateNote}
              onDeleteNote={handleDeleteNote}
              driveFiles={driveFiles}
              githubRepos={githubRepos}
            />
          )}

          {activeTab === 'timeline' && (
            <ActivityTimelineView
              driveFiles={driveFiles}
              githubEvents={githubEvents}
              tasks={tasks}
            />
          )}

          {activeTab === 'sync' && (
            <SyncCenterView
              config={syncConfig}
              onUpdateConfig={(c) => {
                const updated = { ...syncConfig, ...c };
                setSyncConfig(updated);
                saveSyncConfig(updated);
              }}
              logs={syncLogs}
              onClearLogs={() => {
                clearSyncLogs();
                setSyncLogs([]);
              }}
              onSyncAll={syncAll}
              onSyncDrive={() => syncDrive()}
              onSyncGitHub={() => syncGitHub()}
              isSyncing={isSyncing || isDriveLoading || isGitHubLoading}
              googleUser={googleUser}
              githubUser={githubUser}
              driveFiles={driveFiles}
              githubData={{
                user: githubUser,
                repos: githubRepos,
                issues: githubIssues,
                events: githubEvents,
                starred: githubStarred,
              }}
              tasksCount={tasks.length}
              notesCount={notes.length}
              bridgesCount={bridges.length}
              onSelectTab={setActiveTab}
              onExportWorkspace={handleExportWorkspace}
            />
          )}

          {activeTab === 'ai' && (
            <AICopilotView
              driveFiles={driveFiles}
              githubRepos={githubRepos}
              githubIssues={githubIssues}
              tasks={tasks}
              notes={notes}
              onAddTask={handleAddTask}
            />
          )}

          {activeTab === 'one_d_world' && (
            <OneDWorldView
              onAddTask={handleAddTask}
              onLogSyncEvent={(source, msg, count) => {
                addSyncLog({
                  source: 'all',
                  status: 'success',
                  itemCount: count,
                  message: msg,
                  durationMs: 45,
                });
                setSyncLogs(getSyncLogs());
              }}
            />
          )}

          {activeTab === 'kikis_world' && (
            <KikisWorldView
              driveFiles={driveFiles}
              githubRepos={githubRepos}
              tasks={tasks}
              notes={notes}
              onAddTask={handleAddTask}
              onLogSyncEvent={(source, msg, count) => {
                addSyncLog({
                  source: 'all',
                  status: 'success',
                  itemCount: count,
                  message: msg,
                  durationMs: 50,
                });
                setSyncLogs(getSyncLogs());
              }}
            />
          )}

          {activeTab === 'remix' && (
            <RemixedAppView
              onAddTask={handleAddTask}
              onLogSyncEvent={(source, msg, count) => {
                addSyncLog({
                  source: 'all',
                  status: 'success',
                  itemCount: count,
                  message: msg,
                  durationMs: 35,
                });
                setSyncLogs(getSyncLogs());
              }}
            />
          )}

          {activeTab === 'earnings' && (
            <PayPalEarningsView
              onAddTask={handleAddTask}
              onLogSyncEvent={(source, msg, count) => {
                addSyncLog({
                  source: 'all',
                  status: 'success',
                  itemCount: count,
                  message: msg,
                  durationMs: 40,
                });
                setSyncLogs(getSyncLogs());
              }}
              defaultEmail={googleUser?.email || 'grogusmom1989@gmail.com'}
            />
          )}
        </main>
      </div>

      {/* Global Command Palette (Cmd + K) */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        driveFiles={driveFiles}
        githubRepos={githubRepos}
        githubIssues={githubIssues}
        tasks={tasks}
        notes={notes}
        projects={projects}
        onSelectTab={setActiveTab}
        onSyncAll={syncAll}
        onSelectDriveFile={(f) => {
          if (f.webViewLink) window.open(f.webViewLink, '_blank');
        }}
        onSelectGitHubRepo={(r) => {
          window.open(r.html_url, '_blank');
        }}
        onOpenTaskModal={() => setIsNewTaskModalOpen(true)}
        onOpenNoteModal={() => setActiveTab('notes')}
      />

      {/* GitHub Authentication / Configuration Modal */}
      <GitHubAuthModal
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
        currentUsername={syncConfig.githubUsername || ''}
        currentToken={syncConfig.githubToken || ''}
        onSave={handleSaveGitHub}
        isLoading={isGitHubLoading}
      />
    </div>
  );
}
