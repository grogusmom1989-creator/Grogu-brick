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
  syncUserProfileToFirestore,
  pullAllFromFirestore,
  saveTaskToFirestore,
  deleteTaskFromFirestore,
  saveNoteToFirestore,
  deleteNoteFromFirestore,
  saveProjectToFirestore,
  deleteProjectFromFirestore,
  saveBridgeToFirestore,
  deleteBridgeFromFirestore,
} from './services/firebase';
import { fetchDriveFiles } from './services/googleDrive';
import { fetchGitHubData, GitHubUser } from './services/github';
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
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { MobileBottomNav } from './components/MobileBottomNav';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PlayStoreModal } from './components/PlayStoreModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isPlayStoreModalOpen, setIsPlayStoreModalOpen] = useState(false);

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

  // Helper to auto-import pulled GitHub repos & Google Drive folders into Projects Portfolio
  const mergePulledAssetsIntoPortfolio = useCallback(
    (reposToMerge: GitHubRepo[], driveFilesToMerge: GoogleDriveFile[], baseProjects?: WorkspaceProject[]) => {
      const currentList = baseProjects ?? getStoredProjects();
      const existingIds = new Set(currentList.map((p) => p.id));
      const existingRepoNames = new Set(
        currentList.map((p) => p.repoFullName?.toLowerCase()).filter(Boolean)
      );
      const existingDriveIds = new Set(currentList.map((p) => p.driveFolderId).filter(Boolean));

      const importedFromRepos: WorkspaceProject[] = [];
      for (const repo of reposToMerge) {
        const projId = `proj-gh-${repo.id}`;
        if (existingIds.has(projId) || existingRepoNames.has(repo.full_name.toLowerCase())) {
          continue;
        }
        importedFromRepos.push({
          id: projId,
          name: repo.name,
          description: repo.description || `Synced GitHub repository (${repo.full_name})`,
          source: 'github',
          status: 'active',
          url: repo.html_url,
          repoFullName: repo.full_name,
          language: repo.language || undefined,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          openIssues: repo.open_issues_count,
          tags: repo.topics && repo.topics.length > 0 ? repo.topics.slice(0, 6) : ['GitHub', repo.language || 'Code'].filter(Boolean),
          techStack: [repo.language || 'TypeScript', 'GitHub'].filter(Boolean),
          updatedAt: repo.updated_at || new Date().toISOString(),
          createdAt: repo.updated_at || new Date().toISOString(),
          isPinned: repo.stargazers_count > 0,
        });
      }

      const importedFromDrive: WorkspaceProject[] = [];
      const driveFolders = driveFilesToMerge.filter(
        (f) => f.mimeType === 'application/vnd.google-apps.folder'
      );
      for (const folder of driveFolders) {
        const projId = `proj-drive-${folder.id}`;
        if (existingIds.has(projId) || existingDriveIds.has(folder.id)) {
          continue;
        }
        importedFromDrive.push({
          id: projId,
          name: folder.name,
          description: 'Synced Google Drive workspace folder',
          source: 'drive',
          status: 'active',
          url: folder.webViewLink,
          driveFolderId: folder.id,
          tags: ['Google Drive', 'Folder'],
          techStack: ['Google Workspace', 'Cloud Storage'],
          updatedAt: folder.modifiedTime || new Date().toISOString(),
          createdAt: folder.modifiedTime || new Date().toISOString(),
          isPinned: false,
        });
      }

      if (importedFromRepos.length > 0 || importedFromDrive.length > 0) {
        const merged = [...currentList, ...importedFromRepos, ...importedFromDrive];
        setProjects(merged);
        saveStoredProjects(merged);
        return merged;
      }
      return currentList;
    },
    []
  );

  // Pull & Merge from Firestore Cloud Vault when user is authenticated
  const syncFirestoreCloud = useCallback(async (user: User) => {
    try {
      const cfg = getSyncConfig();
      await syncUserProfileToFirestore(user, cfg.githubUsername || 'grogusmom1989');
      const cloudData = await pullAllFromFirestore(user.uid);

      // Merge Tasks
      const localTasks = getStoredTasks();
      const cloudTaskIds = new Set(cloudData.tasks.map((t) => t.id));
      const mergedTasks = [
        ...cloudData.tasks,
        ...localTasks.filter((t) => !cloudTaskIds.has(t.id)),
      ];
      setTasks(mergedTasks);
      saveStoredTasks(mergedTasks);
      for (const t of localTasks.filter((item) => !cloudTaskIds.has(item.id)).slice(0, 15)) {
        await saveTaskToFirestore(user.uid, t);
      }

      // Merge Notes
      const localNotes = getStoredNotes();
      const cloudNoteIds = new Set(cloudData.notes.map((n) => n.id));
      const mergedNotes = [
        ...cloudData.notes,
        ...localNotes.filter((n) => !cloudNoteIds.has(n.id)),
      ];
      setNotes(mergedNotes);
      saveStoredNotes(mergedNotes);
      for (const n of localNotes.filter((item) => !cloudNoteIds.has(item.id)).slice(0, 15)) {
        await saveNoteToFirestore(user.uid, n);
      }

      // Merge Projects
      const localProjects = getStoredProjects();
      const cloudProjIds = new Set(cloudData.projects.map((p) => p.id));
      const mergedProjects = [
        ...cloudData.projects,
        ...localProjects.filter((p) => !cloudProjIds.has(p.id)),
      ];
      setProjects(mergedProjects);
      saveStoredProjects(mergedProjects);
      for (const p of localProjects.filter((item) => !cloudProjIds.has(item.id)).slice(0, 15)) {
        await saveProjectToFirestore(user.uid, p);
      }

      // Merge Bridges
      const localBridges = getStoredBridges();
      const cloudBridgeIds = new Set(cloudData.bridges.map((b) => b.id));
      const mergedBridges = [
        ...cloudData.bridges,
        ...localBridges.filter((b) => !cloudBridgeIds.has(b.id)),
      ];
      setBridges(mergedBridges);
      saveStoredBridges(mergedBridges);
    } catch (err) {
      console.warn('Firestore cloud sync warning:', err);
    }
  }, []);

  // 1. Initial Load from Local Cache & Persistent Auth Listener
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
      mergePulledAssetsIntoPortfolio(cachedGh.repos, cachedDrive);
    }

    // Initialize Firebase Auth listener (stays signed in across reloads via browserLocalPersistence)
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        if (token) {
          setCachedAccessToken(token);
          syncDrive(token);
        }
        syncFirestoreCloud(user);
      },
      () => {
        setGoogleUser(null);
      }
    );

    return () => unsubscribe();
  }, [mergePulledAssetsIntoPortfolio, syncFirestoreCloud]);

  // 2. Fetch GitHub Data Handler (Auto-pulls repos into Portfolio)
  const syncGitHub = useCallback(
    async (username?: string, token?: string) => {
      const config = getSyncConfig();
      const effectiveUser = username || config.githubUsername || 'grogusmom1989';
      const effectiveToken = token ?? config.githubToken;

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

        // Automatically pull all synced GitHub repositories into the Projects Portfolio
        mergePulledAssetsIntoPortfolio(data.repos, getCachedDriveFiles());

        const durationMs = Date.now() - startTime;
        const count = data.repos.length + data.issues.length;
        addSyncLog({
          source: 'github',
          status: data.error ? 'warning' : 'success',
          itemCount: count,
          message:
            data.error ||
            `Pulled ${data.repos.length} repositories & ${data.issues.length} issues from @${effectiveUser}`,
          durationMs,
        });
        setSyncLogs(getSyncLogs());

        const nextConfig = {
          ...config,
          githubUsername: effectiveUser,
          lastSyncGitHub: new Date().toISOString(),
        };
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
    },
    [mergePulledAssetsIntoPortfolio]
  );

  // Initial GitHub load on startup
  useEffect(() => {
    syncGitHub();
  }, [syncGitHub]);

  // 3. Fetch Google Drive Files Handler
  const syncDrive = useCallback(
    async (manualToken?: string) => {
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
          mergePulledAssetsIntoPortfolio(githubRepos, result.files);

          addSyncLog({
            source: 'drive',
            status: 'success',
            itemCount: result.files.length,
            message: `Pulled ${result.files.length} Google Drive files & folders`,
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
    },
    [githubRepos, mergePulledAssetsIntoPortfolio]
  );

  // 4. Master "Pull Everything" Handler
  const syncAll = useCallback(async () => {
    setIsSyncing(true);
    const startTime = Date.now();
    try {
      await Promise.allSettled([
        syncDrive(),
        syncGitHub(),
        googleUser ? syncFirestoreCloud(googleUser) : Promise.resolve(),
      ]);

      const latestGh = getCachedGitHubData();
      const latestDrive = getCachedDriveFiles();
      const mergedProjects = mergePulledAssetsIntoPortfolio(
        latestGh?.repos || githubRepos,
        latestDrive.length > 0 ? latestDrive : driveFiles
      );

      const config = getSyncConfig();
      const nextConfig = { ...config, lastSyncAll: new Date().toISOString() };
      setSyncConfig(nextConfig);
      saveSyncConfig(nextConfig);
      setSyncCountdown((config.intervalMinutes || 5) * 60);

      addSyncLog({
        source: 'all',
        status: 'success',
        itemCount:
          (latestDrive.length || driveFiles.length) +
          (latestGh?.repos.length || githubRepos.length) +
          mergedProjects.length +
          tasks.length,
        message: `Pulled everything: ${latestGh?.repos.length || githubRepos.length} repos, ${latestDrive.length || driveFiles.length} Drive files, ${mergedProjects.length} portfolio projects`,
        durationMs: Date.now() - startTime,
      });
      setSyncLogs(getSyncLogs());
    } finally {
      setIsSyncing(false);
    }
  }, [
    syncDrive,
    syncGitHub,
    googleUser,
    syncFirestoreCloud,
    mergePulledAssetsIntoPortfolio,
    githubRepos,
    driveFiles,
    tasks.length,
  ]);

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

  // 7. Google Sign-In Action (Locks Persistent Session & Pulls Drive + Firestore)
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const res = await googleSignIn();
      if (res?.user && res.accessToken) {
        setGoogleUser(res.user);
        await Promise.allSettled([
          syncDrive(res.accessToken),
          syncFirestoreCloud(res.user),
        ]);
      }
    } catch (err) {
      console.error('Google Sign in failed:', err);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleLogout = async () => {
    await firebaseLogout();
    setGoogleUser(null);
    setDriveFiles([]);
    saveCachedDriveFiles([]);
    addSyncLog({
      source: 'drive',
      status: 'warning',
      itemCount: 0,
      message: 'Signed out of Google Workspace session',
      durationMs: 10,
    });
    setSyncLogs(getSyncLogs());
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

  // 9. Tasks and Notes Handlers (Persisted Locally + Firestore Cloud)
  const handleAddTask = (newTask: Omit<WorkspaceTask, 'id' | 'createdAt'>) => {
    const task: WorkspaceTask = {
      ...newTask,
      id: 'task-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    const updated = [task, ...tasks];
    setTasks(updated);
    saveStoredTasks(updated);
    if (googleUser) {
      saveTaskToFirestore(googleUser.uid, task).catch(() => {});
    }
  };

  const handleUpdateTaskStatus = (taskId: string, status: 'todo' | 'in_progress' | 'done') => {
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, status } : t));
    setTasks(updated);
    saveStoredTasks(updated);
    const target = updated.find((t) => t.id === taskId);
    if (googleUser && target) {
      saveTaskToFirestore(googleUser.uid, target).catch(() => {});
    }
  };

  const handleDeleteTask = (taskId: string) => {
    const updated = tasks.filter((t) => t.id !== taskId);
    setTasks(updated);
    saveStoredTasks(updated);
    if (googleUser) {
      deleteTaskFromFirestore(googleUser.uid, taskId).catch(() => {});
    }
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
    if (googleUser) {
      saveNoteToFirestore(googleUser.uid, note).catch(() => {});
    }
  };

  const handleUpdateNote = (id: string, updates: Partial<WorkspaceNote>) => {
    const updated = notes.map((n) =>
      n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
    );
    setNotes(updated);
    saveStoredNotes(updated);
    const target = updated.find((n) => n.id === id);
    if (googleUser && target) {
      saveNoteToFirestore(googleUser.uid, target).catch(() => {});
    }
  };

  const handleDeleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    saveStoredNotes(updated);
    if (googleUser) {
      deleteNoteFromFirestore(googleUser.uid, id).catch(() => {});
    }
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
    if (googleUser) {
      saveProjectToFirestore(googleUser.uid, newProj).catch(() => {});
    }
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
    const target = updated.find((p) => p.id === id);
    if (googleUser && target) {
      saveProjectToFirestore(googleUser.uid, target).catch(() => {});
    }
  };

  const handleDeleteProject = (id: string) => {
    const updated = projects.filter((p) => p.id !== id);
    setProjects(updated);
    saveStoredProjects(updated);
    if (googleUser) {
      deleteProjectFromFirestore(googleUser.uid, id).catch(() => {});
    }
  };

  const handleBatchImportProjects = (newProjects: WorkspaceProject[]) => {
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
    if (googleUser) {
      deduplicated.slice(0, 20).forEach((p) => {
        saveProjectToFirestore(googleUser.uid, p).catch(() => {});
      });
    }
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
      const target = updated.find((b) => b.id === id);
      if (googleUser && target) {
        saveBridgeToFirestore(googleUser.uid, target).catch(() => {});
      }
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
      if (googleUser) {
        saveBridgeToFirestore(googleUser.uid, bridge).catch(() => {});
      }
      return updated;
    });
  };

  const handleDeleteBridge = (id: string) => {
    setBridges((prev) => {
      const updated = prev.filter((b) => b.id !== id);
      saveStoredBridges(updated);
      if (googleUser) {
        deleteBridgeFromFirestore(googleUser.uid, id).catch(() => {});
      }
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
        onOpenPlayStore={() => setIsPlayStoreModalOpen(true)}
        isSyncing={isSyncing || isDriveLoading || isGitHubLoading}
        syncCountdown={syncCountdown}
        autoSyncEnabled={syncConfig.autoSync}
        googleUser={googleUser}
        githubUser={githubUser}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* PWA Mobile App Download & Install Banner */}
      <PWAInstallBanner />

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
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto overflow-y-auto pb-24 lg:pb-8">
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
        currentUsername={syncConfig.githubUsername || 'grogusmom1989'}
        currentToken={syncConfig.githubToken || ''}
        onSave={handleSaveGitHub}
        isLoading={isGitHubLoading}
      />

      {/* Google Play Store Packager & Universal Pull Studio Modal */}
      <PlayStoreModal
        isOpen={isPlayStoreModalOpen}
        onClose={() => setIsPlayStoreModalOpen(false)}
        googleUser={googleUser}
        githubUser={githubUser}
        onGoogleSignIn={handleGoogleSignIn}
        onPullEverything={syncAll}
        isSyncing={isSyncing || isDriveLoading || isGitHubLoading}
        stats={{
          reposCount: githubRepos.length,
          driveCount: driveFiles.length,
          projectsCount: projects.length,
          tasksCount: tasks.length,
          notesCount: notes.length,
          bridgesCount: bridges.length,
        }}
      />

      {/* Mobile Bottom Navigation Bar (Phone Screens) */}
      <MobileBottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenSidebar={() => setSidebarOpen(true)}
        bridgesCount={bridges.length}
      />

      {/* Offline Status Connectivity Banner */}
      <OfflineIndicator />
    </div>
  );
}
