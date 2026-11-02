import React, { useState, useMemo } from 'react';
import {
  FolderGit2,
  Github,
  Cloud,
  ExternalLink,
  Plus,
  RefreshCw,
  Search,
  Star,
  CheckCircle2,
  Clock,
  Sparkles,
  Download,
  Upload,
  Play,
  Layers,
  Code2,
  Trash2,
  Edit3,
  Tag,
  Eye,
  X,
  FileCode,
  FolderOpen,
  ArrowUpRight,
  GitBranch,
  CheckSquare,
  FileText,
  SlidersHorizontal,
  ChevronRight,
  Maximize2,
  Laptop,
  Smartphone,
  Tablet,
} from 'lucide-react';
import {
  WorkspaceProject,
  ProjectSource,
  ProjectStatus,
  GitHubRepo,
  GoogleDriveFile,
  WorkspaceTask,
  WorkspaceNote,
  AppTab,
} from '../types';
import { GitHubUser } from '../services/github';
import { User } from 'firebase/auth';

interface ProjectPortfolioViewProps {
  projects: WorkspaceProject[];
  onAddProject: (project: Omit<WorkspaceProject, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateProject: (id: string, updates: Partial<WorkspaceProject>) => void;
  onDeleteProject: (id: string) => void;
  onBatchImportProjects: (projects: WorkspaceProject[]) => void;
  githubRepos: GitHubRepo[];
  githubUser: GitHubUser | null;
  driveFiles: GoogleDriveFile[];
  googleUser: User | null;
  onSyncGitHub: () => void;
  onSyncDrive: () => void;
  onAddTask: (task: Omit<WorkspaceTask, 'id' | 'createdAt'>) => void;
  onAddNote: (note: Omit<WorkspaceNote, 'id' | 'updatedAt'>) => void;
  onSelectTab: (tab: AppTab) => void;
  onLogSyncEvent?: (source: 'all' | 'github' | 'drive', msg: string, count: number) => void;
}

export const ProjectPortfolioView: React.FC<ProjectPortfolioViewProps> = ({
  projects,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
  onBatchImportProjects,
  githubRepos,
  githubUser,
  driveFiles,
  googleUser,
  onSyncGitHub,
  onSyncDrive,
  onAddTask,
  onAddNote,
  onSelectTab,
  onLogSyncEvent,
}) => {
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'all' | ProjectSource>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | ProjectStatus>('all');
  const [sortBy, setSortBy] = useState<'updated' | 'stars' | 'name'>('updated');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<WorkspaceProject | null>(null);
  const [isDriveImportOpen, setIsDriveImportOpen] = useState(false);
  const [isPackageJsonImportOpen, setIsPackageJsonImportOpen] = useState(false);
  const [previewProject, setPreviewProject] = useState<WorkspaceProject | null>(null);
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // New Project Form State
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formSource, setFormSource] = useState<ProjectSource>('custom');
  const [formStatus, setFormStatus] = useState<ProjectStatus>('active');
  const [formUrl, setFormUrl] = useState('');
  const [formPreviewUrl, setFormPreviewUrl] = useState('');
  const [formTechStack, setFormTechStack] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Package.json import state
  const [packageJsonText, setPackageJsonText] = useState('');
  const [packageJsonError, setPackageJsonError] = useState<string | null>(null);

  // Drive import selected ids
  const [selectedDriveFileIds, setSelectedDriveFileIds] = useState<string[]>([]);

  // 1. One-Click: Pull All GitHub Repositories
  const handlePullAllGitHubRepos = () => {
    if (githubRepos.length === 0) {
      onSyncGitHub();
      showToast('Scanning GitHub for repositories...');
      return;
    }

    const existingRepoUrls = new Set(
      projects.filter((p) => p.repoFullName).map((p) => p.repoFullName?.toLowerCase())
    );

    const newProjects: WorkspaceProject[] = [];

    githubRepos.forEach((repo) => {
      const lowerFullName = repo.full_name.toLowerCase();
      if (!existingRepoUrls.has(lowerFullName)) {
        newProjects.push({
          id: `proj-gh-${repo.id}-${Date.now()}`,
          name: repo.name,
          description: repo.description || `GitHub repository ${repo.full_name}`,
          source: 'github',
          status: repo.open_issues_count > 0 ? 'active' : 'deployed',
          url: repo.html_url,
          repoFullName: repo.full_name,
          language: repo.language || undefined,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          openIssues: repo.open_issues_count,
          tags: repo.topics && repo.topics.length > 0 ? repo.topics : ['GitHub', repo.language || 'Code'],
          techStack: repo.language ? [repo.language, 'Git'] : ['Git'],
          updatedAt: repo.updated_at || new Date().toISOString(),
          createdAt: new Date().toISOString(),
          isPinned: repo.stargazers_count > 0,
          version: '1.0.0',
        });
      }
    });

    if (newProjects.length === 0) {
      showToast('All GitHub repositories are already imported in your projects!');
    } else {
      onBatchImportProjects(newProjects);
      showToast(`Successfully pulled in ${newProjects.length} GitHub repositories!`);
      if (onLogSyncEvent) {
        onLogSyncEvent('github', `Pulled ${newProjects.length} projects from GitHub`, newProjects.length);
      }
    }
  };

  // 2. Import Selected Google Drive Files/Folders
  const handleImportDriveSelection = () => {
    const selectedFiles = driveFiles.filter((f) => selectedDriveFileIds.includes(f.id));
    if (selectedFiles.length === 0) return;

    const existingDriveIds = new Set(projects.map((p) => p.driveFolderId).filter(Boolean));
    const newProjects: WorkspaceProject[] = [];

    selectedFiles.forEach((file) => {
      if (!existingDriveIds.has(file.id)) {
        const isFolder = file.mimeType.includes('folder');
        newProjects.push({
          id: `proj-drive-${file.id}`,
          name: file.name,
          description: file.description || `${isFolder ? 'Google Drive Project Folder' : 'Google Drive Workspace File'}: ${file.name}`,
          source: 'drive',
          status: 'active',
          driveFolderId: file.id,
          driveViewUrl: file.webViewLink,
          url: file.webViewLink,
          tags: isFolder ? ['Google-Drive', 'Project-Folder'] : ['Google-Drive', 'Document'],
          techStack: ['Google Drive Cloud'],
          updatedAt: file.modifiedTime || new Date().toISOString(),
          createdAt: new Date().toISOString(),
          isPinned: false,
        });
      }
    });

    if (newProjects.length > 0) {
      onBatchImportProjects(newProjects);
      showToast(`Imported ${newProjects.length} project items from Google Drive!`);
      if (onLogSyncEvent) {
        onLogSyncEvent('drive', `Imported ${newProjects.length} items from Google Drive`, newProjects.length);
      }
    } else {
      showToast('Selected items are already in your project portfolio.');
    }
    setIsDriveImportOpen(false);
    setSelectedDriveFileIds([]);
  };

  // 3. Import from package.json
  const handleParsePackageJson = () => {
    try {
      setPackageJsonError(null);
      const pkg = JSON.parse(packageJsonText);
      const name = pkg.name || 'Untitled Project';
      const description = pkg.description || 'Imported from package.json manifest';
      const version = pkg.version || '0.1.0';
      const deps = Object.keys(pkg.dependencies || {});
      const devDeps = Object.keys(pkg.devDependencies || {});
      const allDeps = Array.from(new Set([...deps, ...devDeps])).slice(0, 8);

      const newProj: WorkspaceProject = {
        id: `proj-pkg-${Date.now()}`,
        name,
        description,
        source: 'upload',
        status: 'active',
        tags: ['package.json', 'Node.js', pkg.type || 'module'],
        techStack: allDeps.length > 0 ? allDeps : ['JavaScript', 'Node.js'],
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        version,
        notes: `Imported with scripts: ${Object.keys(pkg.scripts || {}).join(', ') || 'none'}`,
      };

      onBatchImportProjects([newProj]);
      showToast(`Imported project "${name}" from package.json!`);
      setIsPackageJsonImportOpen(false);
      setPackageJsonText('');
    } catch (e: any) {
      setPackageJsonError(e.message || 'Invalid JSON format');
    }
  };

  // Form Submit for Add / Edit
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const techArray = formTechStack
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const tagsArray = formTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingProject) {
      onUpdateProject(editingProject.id, {
        name: formName.trim(),
        description: formDesc.trim(),
        source: formSource,
        status: formStatus,
        url: formUrl.trim() || undefined,
        previewUrl: formPreviewUrl.trim() || undefined,
        techStack: techArray.length > 0 ? techArray : ['Web'],
        tags: tagsArray.length > 0 ? tagsArray : ['Project'],
        notes: formNotes.trim() || undefined,
        updatedAt: new Date().toISOString(),
      });
      showToast(`Updated project "${formName.trim()}"`);
    } else {
      onAddProject({
        name: formName.trim(),
        description: formDesc.trim(),
        source: formSource,
        status: formStatus,
        url: formUrl.trim() || undefined,
        previewUrl: formPreviewUrl.trim() || undefined,
        techStack: techArray.length > 0 ? techArray : ['Web'],
        tags: tagsArray.length > 0 ? tagsArray : ['Project'],
        notes: formNotes.trim() || undefined,
        isPinned: false,
      });
      showToast(`Added new project "${formName.trim()}"!`);
    }

    closeFormModal();
  };

  const openEditModal = (proj: WorkspaceProject) => {
    setEditingProject(proj);
    setFormName(proj.name);
    setFormDesc(proj.description || '');
    setFormSource(proj.source);
    setFormStatus(proj.status);
    setFormUrl(proj.url || '');
    setFormPreviewUrl(proj.previewUrl || '');
    setFormTechStack(proj.techStack?.join(', ') || '');
    setFormTags(proj.tags?.join(', ') || '');
    setFormNotes(proj.notes || '');
    setIsAddModalOpen(true);
  };

  const closeFormModal = () => {
    setIsAddModalOpen(false);
    setEditingProject(null);
    setFormName('');
    setFormDesc('');
    setFormSource('custom');
    setFormStatus('active');
    setFormUrl('');
    setFormPreviewUrl('');
    setFormTechStack('');
    setFormTags('');
    setFormNotes('');
  };

  // Quick Action: Link Task to Project
  const handleCreateTaskFromProject = (proj: WorkspaceProject) => {
    onAddTask({
      title: `Review & update ${proj.name}`,
      description: `Task created for project "${proj.name}". Source: ${proj.source}. ${proj.description}`,
      status: 'todo',
      priority: 'medium',
      source: proj.source === 'github' ? 'github' : proj.source === 'drive' ? 'drive' : 'manual',
      sourceUrl: proj.url,
      sourceTitle: proj.name,
      tags: ['Project', ...proj.tags.slice(0, 2)],
    });
    showToast(`Created new action item for "${proj.name}"!`);
  };

  // Quick Action: Link Note to Project
  const handleCreateNoteFromProject = (proj: WorkspaceProject) => {
    onAddNote({
      title: `${proj.name} — Architecture & Dev Notes`,
      content: `# ${proj.name}\n\n**Source**: ${proj.source.toUpperCase()}\n**Status**: ${proj.status}\n**Tech Stack**: ${proj.techStack.join(', ') || 'N/A'}\n**URL**: ${proj.url || 'N/A'}\n\n### Overview\n${proj.description}\n\n### Architecture & Roadmap\n- [ ] Sprint milestones\n- [ ] Dependency updates\n- [ ] Integration with OmniSync Hub\n\n*Synced automatically with OmniSync Project Hub.*`,
      tags: ['Project', ...proj.tags],
      linkedRepoName: proj.repoFullName,
      linkedDriveId: proj.driveFolderId,
      pinned: false,
    });
    showToast(`Created dev notes for "${proj.name}"!`);
  };

  // Export Portfolio
  const handleExportPortfolio = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(projects, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `omnisync-portfolio-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Exported project portfolio manifest!');
  };

  // Filtered & Sorted Projects
  const filteredProjects = useMemo(() => {
    return projects
      .filter((p) => {
        if (sourceFilter !== 'all' && p.source !== sourceFilter) return false;
        if (statusFilter !== 'all' && p.status !== statusFilter) return false;
        if (!searchQuery.trim()) return true;

        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q)) ||
          p.techStack?.some((t) => t.toLowerCase().includes(q)) ||
          p.language?.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        // Pinned first
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;

        if (sortBy === 'stars') return (b.stars || 0) - (a.stars || 0);
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [projects, sourceFilter, statusFilter, searchQuery, sortBy]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: projects.length,
      deployed: projects.filter((p) => p.status === 'deployed').length,
      active: projects.filter((p) => p.status === 'active' || p.status === 'in_progress').length,
      github: projects.filter((p) => p.source === 'github').length,
      drive: projects.filter((p) => p.source === 'drive').length,
      internal: projects.filter((p) => p.source === 'internal').length,
    };
  }, [projects]);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-indigo-500/50 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs animate-in fade-in slide-in-from-bottom-2">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero / Command Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
              <FolderGit2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Universal Project Aggregator & Workspace</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              All Your Projects & Repositories in One Central Hub
            </h1>
            <p className="text-xs text-slate-400">
              Import all your GitHub repositories, Google Drive project folders, custom deployed web apps, and code manifests directly into OmniSync.
            </p>
          </div>

          {/* Quick Actions Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Pull All GitHub Repos Button */}
            <button
              onClick={handlePullAllGitHubRepos}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 hover:border-indigo-500/50 rounded-lg text-xs font-medium text-slate-100 flex items-center gap-2 transition-all shadow-sm"
              title="Automatically pull all repositories from your GitHub account"
            >
              <Github className="w-3.5 h-3.5 text-indigo-400" />
              <span>Pull All from GitHub</span>
              <span className="ml-1 px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-mono">
                {githubRepos.length}
              </span>
            </button>

            {/* Pull From Google Drive */}
            <button
              onClick={() => setIsDriveImportOpen(true)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 hover:border-cyan-500/50 rounded-lg text-xs font-medium text-slate-100 flex items-center gap-2 transition-all shadow-sm"
              title="Import project folders and documents from Google Drive"
            >
              <Cloud className="w-3.5 h-3.5 text-cyan-400" />
              <span>Pull from Drive</span>
              <span className="ml-1 px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-mono">
                {driveFiles.length}
              </span>
            </button>

            {/* Import package.json */}
            <button
              onClick={() => setIsPackageJsonImportOpen(true)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-medium text-slate-200 flex items-center gap-1.5 transition-all shadow-sm"
              title="Import from package.json or project manifest"
            >
              <FileCode className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">package.json</span>
            </button>

            {/* Add Custom Project */}
            <button
              onClick={() => {
                setEditingProject(null);
                setIsAddModalOpen(true);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded-lg text-xs font-medium flex items-center gap-2 shadow-md shadow-indigo-600/25 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Project</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
          <div className="text-[11px] text-slate-400 font-medium">Total Projects</div>
          <div className="text-xl font-bold text-white mt-1 flex items-baseline gap-1.5">
            {stats.total}
            <span className="text-[10px] text-slate-500 font-normal">in hub</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
          <div className="text-[11px] text-slate-400 font-medium">GitHub Repos</div>
          <div className="text-xl font-bold text-indigo-400 mt-1 flex items-baseline gap-1.5">
            {stats.github}
            <span className="text-[10px] text-slate-500 font-normal">synced</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
          <div className="text-[11px] text-slate-400 font-medium">Google Drive</div>
          <div className="text-xl font-bold text-cyan-400 mt-1 flex items-baseline gap-1.5">
            {stats.drive}
            <span className="text-[10px] text-slate-500 font-normal">linked</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
          <div className="text-[11px] text-slate-400 font-medium">Internal Apps</div>
          <div className="text-xl font-bold text-purple-400 mt-1 flex items-baseline gap-1.5">
            {stats.internal}
            <span className="text-[10px] text-slate-500 font-normal">studios</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
          <div className="text-[11px] text-slate-400 font-medium">Deployed & Live</div>
          <div className="text-xl font-bold text-emerald-400 mt-1 flex items-baseline gap-1.5">
            {stats.deployed}
            <span className="text-[10px] text-slate-500 font-normal">online</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
          <div className="text-[11px] text-slate-400 font-medium">Active Sprints</div>
          <div className="text-xl font-bold text-amber-400 mt-1 flex items-baseline gap-1.5">
            {stats.active}
            <span className="text-[10px] text-slate-500 font-normal">in dev</span>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by name, language, tag, or stack..."
            className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-indigo-500 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Badges & Sort Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Source Dropdown Filter */}
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value as any)}
            className="bg-slate-950/80 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 outline-none focus:border-indigo-500"
          >
            <option value="all">All Sources</option>
            <option value="github">GitHub</option>
            <option value="drive">Google Drive</option>
            <option value="internal">Internal Apps</option>
            <option value="custom">Custom URLs</option>
            <option value="upload">Uploaded Manifests</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-950/80 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="deployed">Deployed / Live</option>
            <option value="active">Active</option>
            <option value="in_progress">In Progress</option>
            <option value="concept">Concept</option>
            <option value="archived">Archived</option>
          </select>

          {/* Sort Control */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-950/80 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 outline-none focus:border-indigo-500"
          >
            <option value="updated">Recently Updated</option>
            <option value="stars">Most Starred</option>
            <option value="name">Alphabetical</option>
          </select>

          {/* Export JSON Button */}
          <button
            onClick={handleExportPortfolio}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors"
            title="Export Projects Portfolio JSON"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Projects Grid / List */}
      {filteredProjects.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 border-dashed rounded-2xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 mx-auto flex items-center justify-center">
            <FolderGit2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">No projects found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              {searchQuery || sourceFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your search criteria or filters.'
                : 'Pull all your GitHub repositories, sync from Google Drive, or create your first project.'}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            <button
              onClick={handlePullAllGitHubRepos}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center gap-2"
            >
              <Github className="w-3.5 h-3.5" />
              <span>Pull All GitHub Repositories</span>
            </button>
            <button
              onClick={() => setIsDriveImportOpen(true)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-2"
            >
              <Cloud className="w-3.5 h-3.5 text-cyan-400" />
              <span>Import Drive Projects</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => {
            const isInternal = project.source === 'internal';
            const isGitHub = project.source === 'github';
            const isDrive = project.source === 'drive';

            return (
              <div
                key={project.id}
                className="group relative bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/40 rounded-xl p-5 flex flex-col justify-between transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-indigo-500/5"
              >
                <div>
                  {/* Card Top: Source, Status & Pin */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {isGitHub && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px] font-medium font-mono">
                          <Github className="w-3 h-3 text-indigo-400" />
                          <span>GitHub</span>
                        </span>
                      )}
                      {isDrive && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[10px] font-medium font-mono">
                          <Cloud className="w-3 h-3 text-cyan-400" />
                          <span>Drive</span>
                        </span>
                      )}
                      {isInternal && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[10px] font-medium font-mono">
                          <Sparkles className="w-3 h-3 text-purple-400" />
                          <span>Internal Studio</span>
                        </span>
                      )}
                      {project.source === 'custom' && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-medium font-mono">
                          <ExternalLink className="w-3 h-3 text-amber-400" />
                          <span>Custom URL</span>
                        </span>
                      )}
                      {project.source === 'upload' && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px] font-medium font-mono">
                          <FileCode className="w-3 h-3 text-emerald-400" />
                          <span>Manifest</span>
                        </span>
                      )}

                      {/* Status indicator */}
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono ${
                          project.status === 'deployed'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : project.status === 'active' || project.status === 'in_progress'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {project.status === 'deployed' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        )}
                        <span className="capitalize">{project.status.replace('_', ' ')}</span>
                      </span>
                    </div>

                    {/* Star / Pin Button */}
                    <button
                      onClick={() => onUpdateProject(project.id, { isPinned: !project.isPinned })}
                      className={`p-1 rounded transition-colors ${
                        project.isPinned
                          ? 'text-amber-400'
                          : 'text-slate-600 hover:text-slate-400 opacity-0 group-hover:opacity-100'
                      }`}
                      title={project.isPinned ? 'Unpin project' : 'Pin project to top'}
                    >
                      <Star className={`w-3.5 h-3.5 ${project.isPinned ? 'fill-amber-400' : ''}`} />
                    </button>
                  </div>

                  {/* Project Title & Description */}
                  <h3 className="text-sm font-semibold text-white tracking-tight group-hover:text-indigo-300 transition-colors line-clamp-1 flex items-center justify-between">
                    <span>{project.name}</span>
                    {project.version && (
                      <span className="text-[10px] text-slate-500 font-mono font-normal">v{project.version}</span>
                    )}
                  </h3>

                  <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {project.description || 'No description provided.'}
                  </p>

                  {/* GitHub Repo Metrics (if present) */}
                  {(project.stars !== undefined || project.forks !== undefined || project.openIssues !== undefined) && (
                    <div className="flex items-center gap-3 mt-3 text-[11px] text-slate-500 font-mono">
                      {project.stars !== undefined && (
                        <span className="flex items-center gap-1" title="GitHub Stars">
                          <Star className="w-3 h-3 text-amber-400/80" />
                          <span>{project.stars}</span>
                        </span>
                      )}
                      {project.forks !== undefined && (
                        <span className="flex items-center gap-1" title="Forks">
                          <GitBranch className="w-3 h-3 text-indigo-400" />
                          <span>{project.forks}</span>
                        </span>
                      )}
                      {project.openIssues !== undefined && project.openIssues > 0 && (
                        <span className="flex items-center gap-1 text-rose-400" title="Open Issues">
                          <span>!</span>
                          <span>{project.openIssues} issues</span>
                        </span>
                      )}
                      {project.language && (
                        <span className="text-slate-400 font-sans text-[10px] px-1.5 py-0.5 rounded bg-slate-800">
                          {project.language}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Tech Stack Chips */}
                  {project.techStack && project.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {project.techStack.slice(0, 4).map((tech, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950/60 border border-slate-800 text-slate-300"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.techStack.length > 4 && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-500">
                          +{project.techStack.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Bottom: Actions */}
                <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between">
                  {/* Left: Quick Jump / Preview */}
                  <div className="flex items-center gap-1.5">
                    {/* If internal app, jump to corresponding tab */}
                    {isInternal && (
                      <button
                        onClick={() => {
                          if (project.id === 'proj-1d-world') onSelectTab('one_d_world');
                          else if (project.id === 'proj-kikis-world') onSelectTab('kikis_world');
                          else if (project.id === 'proj-remix-studio') onSelectTab('remix');
                          else if (project.id === 'proj-paypal-hub') onSelectTab('earnings');
                          else onSelectTab('overview');
                        }}
                        className="px-2.5 py-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
                      >
                        <Play className="w-3 h-3 text-indigo-400 fill-indigo-400" />
                        <span>Launch App</span>
                      </button>
                    )}

                    {/* External or Preview URL */}
                    {(project.url || project.previewUrl || project.driveViewUrl) && !isInternal && (
                      <a
                        href={project.previewUrl || project.url || project.driveViewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
                      >
                        <ArrowUpRight className="w-3 h-3 text-slate-400" />
                        <span>Open</span>
                      </a>
                    )}

                    {/* Live in-app preview modal trigger if URL exists */}
                    {(project.previewUrl || project.url) && (
                      <button
                        onClick={() => setPreviewProject(project)}
                        className="p-1 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded transition-colors"
                        title="Live in-app preview"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Right: Quick Context Actions */}
                  <div className="flex items-center gap-1 text-slate-500">
                    <button
                      onClick={() => handleCreateTaskFromProject(project)}
                      className="p-1 hover:text-emerald-400 hover:bg-slate-800 rounded transition-colors"
                      title="Create Action Item for this project"
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleCreateNoteFromProject(project)}
                      className="p-1 hover:text-purple-400 hover:bg-slate-800 rounded transition-colors"
                      title="Create dev notes for this project"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => openEditModal(project)}
                      className="p-1 hover:text-indigo-400 hover:bg-slate-800 rounded transition-colors"
                      title="Edit project details"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {!isInternal && (
                      <button
                        onClick={() => onDeleteProject(project.id)}
                        className="p-1 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                        title="Delete project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: Add / Edit Project */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-semibold text-white">
                  {editingProject ? 'Edit Project' : 'Add New Project to Hub'}
                </h3>
              </div>
              <button onClick={closeFormModal} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. My Next.js Web App, Reiki Portal, Solfeggio AI"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="What does this project do?"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Source</label>
                  <select
                    value={formSource}
                    onChange={(e) => setFormSource(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none focus:border-indigo-500"
                  >
                    <option value="custom">Custom Web App</option>
                    <option value="github">GitHub</option>
                    <option value="drive">Google Drive</option>
                    <option value="internal">Internal Studio</option>
                    <option value="upload">Uploaded Manifest</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none focus:border-indigo-500"
                  >
                    <option value="deployed">Deployed / Live</option>
                    <option value="active">Active</option>
                    <option value="in_progress">In Progress</option>
                    <option value="concept">Concept</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Project / Repository URL</label>
                <input
                  type="url"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  placeholder="https://github.com/grogusmom1989/repo or live website"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Live Embed / Preview URL (Optional)</label>
                <input
                  type="url"
                  value={formPreviewUrl}
                  onChange={(e) => setFormPreviewUrl(e.target.value)}
                  placeholder="https://my-app.vercel.app (for in-app live iframe preview)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Tech Stack (comma separated)</label>
                  <input
                    type="text"
                    value={formTechStack}
                    onChange={(e) => setFormTechStack(e.target.value)}
                    placeholder="React, TypeScript, Tailwind, Python"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    placeholder="Frontend, AI, Mobile, Reiki"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={closeFormModal}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium shadow-md shadow-indigo-600/25"
                >
                  {editingProject ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Import from Google Drive Picker */}
      {isDriveImportOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">Import from Google Drive</h3>
              </div>
              <button onClick={() => setIsDriveImportOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between text-xs text-slate-300">
              <span>Select Drive folders or files to import as workspace projects:</span>
              <button
                onClick={() => {
                  if (selectedDriveFileIds.length === driveFiles.length) {
                    setSelectedDriveFileIds([]);
                  } else {
                    setSelectedDriveFileIds(driveFiles.map((f) => f.id));
                  }
                }}
                className="text-xs text-cyan-400 hover:underline"
              >
                {selectedDriveFileIds.length === driveFiles.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="overflow-y-auto p-4 space-y-2 flex-1">
              {driveFiles.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No Google Drive files loaded yet. Please ensure Google Drive is connected.
                  <div className="mt-3">
                    <button
                      onClick={onSyncDrive}
                      className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs"
                    >
                      Sync Google Drive Now
                    </button>
                  </div>
                </div>
              ) : (
                driveFiles.map((file) => {
                  const isSelected = selectedDriveFileIds.includes(file.id);
                  const isFolder = file.mimeType.includes('folder');

                  return (
                    <div
                      key={file.id}
                      onClick={() => {
                        setSelectedDriveFileIds((prev) =>
                          prev.includes(file.id) ? prev.filter((id) => id !== file.id) : [...prev, file.id]
                        );
                      }}
                      className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-200'
                          : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center ${
                            isSelected ? 'bg-cyan-500 border-cyan-500 text-black' : 'border-slate-600'
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <div className="text-xs font-medium text-white flex items-center gap-1.5">
                            {isFolder ? (
                              <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                            ) : (
                              <FileText className="w-3.5 h-3.5 text-cyan-400" />
                            )}
                            <span>{file.name}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {isFolder ? 'Folder' : file.mimeType.split('.').pop() || 'File'} • Modified:{' '}
                            {new Date(file.modifiedTime).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-4 border-t border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/40">
              <span className="text-xs text-slate-400">
                {selectedDriveFileIds.length} item{selectedDriveFileIds.length === 1 ? '' : 's'} selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsDriveImportOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImportDriveSelection}
                  disabled={selectedDriveFileIds.length === 0}
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white rounded-lg text-xs font-medium"
                >
                  Import Selected to Projects
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Import package.json / Manifest */}
      {isPackageJsonImportOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-white">Import from package.json</h3>
              </div>
              <button onClick={() => setIsPackageJsonImportOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-400">
                Paste the contents of any project's <code className="text-amber-300 font-mono">package.json</code> file. OmniSync will automatically extract the name, description, tech stack, and dependencies.
              </p>

              <div>
                <textarea
                  rows={8}
                  value={packageJsonText}
                  onChange={(e) => setPackageJsonText(e.target.value)}
                  placeholder={`{\n  "name": "my-awesome-app",\n  "version": "1.0.0",\n  "description": "Full-stack cloud workspace",\n  "dependencies": {\n    "react": "^19.0.0",\n    "tailwindcss": "^4.0.0"\n  }\n}`}
                  className="w-full bg-slate-950 font-mono text-xs border border-slate-700 rounded-lg p-3 text-slate-100 outline-none focus:border-indigo-500"
                />
              </div>

              {packageJsonError && (
                <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg">
                  {packageJsonError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPackageJsonImportOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleParsePackageJson}
                  disabled={!packageJsonText.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg text-xs font-medium"
                >
                  Parse & Import Project
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: In-App Live Project Preview */}
      {previewProject && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col p-4 sm:p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl flex-1 flex flex-col overflow-hidden shadow-2xl">
            {/* Preview Toolbar */}
            <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white flex items-center gap-2">
                    <span>{previewProject.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Live Preview</span>
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {previewProject.previewUrl || previewProject.url}
                  </span>
                </div>
              </div>

              {/* Viewport Width Controls */}
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
                <button
                  onClick={() => setPreviewViewport('desktop')}
                  className={`p-1.5 rounded ${
                    previewViewport === 'desktop' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Desktop View"
                >
                  <Laptop className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setPreviewViewport('tablet')}
                  className={`p-1.5 rounded ${
                    previewViewport === 'tablet' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Tablet View"
                >
                  <Tablet className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setPreviewViewport('mobile')}
                  className={`p-1.5 rounded ${
                    previewViewport === 'mobile' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Mobile View"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* External open & close */}
              <div className="flex items-center gap-2">
                <a
                  href={previewProject.previewUrl || previewProject.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in Tab</span>
                </a>
                <button
                  onClick={() => setPreviewProject(null)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Preview Frame Container */}
            <div className="flex-1 bg-slate-950/80 p-4 flex items-center justify-center overflow-auto">
              <div
                className={`h-full bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-700 transition-all duration-300 ${
                  previewViewport === 'desktop'
                    ? 'w-full'
                    : previewViewport === 'tablet'
                    ? 'w-[768px]'
                    : 'w-[375px]'
                }`}
              >
                <iframe
                  src={previewProject.previewUrl || previewProject.url}
                  title={previewProject.name}
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
