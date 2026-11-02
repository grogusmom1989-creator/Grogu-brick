import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Circle,
  Clock,
  AlertCircle,
  ExternalLink,
  Trash2,
  Tag,
  Filter,
  CheckCircle2,
  Calendar,
  Cloud,
  Github,
  Sparkles,
  Layers,
} from 'lucide-react';
import { WorkspaceTask } from '../types';

interface TasksViewProps {
  tasks: WorkspaceTask[];
  onAddTask: (task: Omit<WorkspaceTask, 'id' | 'createdAt'>) => void;
  onUpdateTaskStatus: (taskId: string, status: 'todo' | 'in_progress' | 'done') => void;
  onDeleteTask: (taskId: string) => void;
  isOpenNewTaskModal: boolean;
  onCloseNewTaskModal: () => void;
  onOpenNewTaskModal: () => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  onAddTask,
  onUpdateTaskStatus,
  onDeleteTask,
  isOpenNewTaskModal,
  onCloseNewTaskModal,
  onOpenNewTaskModal,
}) => {
  const [sourceFilter, setSourceFilter] = useState<'all' | 'github' | 'drive' | 'manual' | 'ai'>('all');
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');

  // New task form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onAddTask({
      title: title.trim(),
      description: description.trim() || undefined,
      status: 'todo',
      priority,
      dueDate: dueDate || undefined,
      source: 'manual',
      tags: tags.length > 0 ? tags : ['General'],
    });

    setTitle('');
    setDescription('');
    setDueDate('');
    setTagsInput('');
    onCloseNewTaskModal();
  };

  const filteredTasks = tasks.filter((t) => {
    if (sourceFilter === 'all') return true;
    return t.source === sourceFilter;
  });

  const todoTasks = filteredTasks.filter((t) => t.status === 'todo');
  const inProgressTasks = filteredTasks.filter((t) => t.status === 'in_progress');
  const doneTasks = filteredTasks.filter((t) => t.status === 'done');

  const getSourceIcon = (source: WorkspaceTask['source']) => {
    if (source === 'drive') return <Cloud className="w-3.5 h-3.5 text-cyan-400" />;
    if (source === 'github') return <Github className="w-3.5 h-3.5 text-indigo-400" />;
    if (source === 'ai') return <Sparkles className="w-3.5 h-3.5 text-amber-400" />;
    return <Layers className="w-3.5 h-3.5 text-slate-400" />;
  };

  const getPriorityBadge = (p: WorkspaceTask['priority']) => {
    if (p === 'high') return <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">High</span>;
    if (p === 'medium') return <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">Medium</span>;
    return <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">Low</span>;
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-400" />
            <span>Unified Action Items</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
              {tasks.length} total
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Synchronized tasks from GitHub issues, Google Drive files, and workspace priorities.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {/* Source filters */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs">
            {(['all', 'github', 'drive', 'manual'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSourceFilter(s)}
                className={`px-2.5 py-1 rounded font-medium capitalize transition-colors ${
                  sourceFilter === s
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <button
            onClick={onOpenNewTaskModal}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* TO DO Column */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col min-h-[450px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">To Do</h3>
            </div>
            <span className="text-[11px] font-mono text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
              {todoTasks.length}
            </span>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto">
            {todoTasks.map((task) => (
              <div
                key={task.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-lg p-3.5 space-y-2.5 shadow-sm group transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-medium text-slate-100 group-hover:text-indigo-300 leading-snug">
                    {task.title}
                  </h4>
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 rounded transition-opacity"
                    title="Delete task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {task.description && (
                  <p className="text-[11px] text-slate-400 line-clamp-2">{task.description}</p>
                )}

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    {getSourceIcon(task.source)}
                    {getPriorityBadge(task.priority)}
                  </div>

                  {/* Move to In Progress button */}
                  <button
                    onClick={() => onUpdateTaskStatus(task.id, 'in_progress')}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 font-medium px-2 py-0.5 rounded bg-indigo-500/10 hover:bg-indigo-500/20"
                  >
                    Start →
                  </button>
                </div>

                {task.sourceUrl && (
                  <a
                    href={task.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-slate-400 hover:text-indigo-300 flex items-center gap-1 truncate"
                  >
                    <ExternalLink className="w-3 h-3 shrink-0" />
                    <span className="truncate">{task.sourceTitle || 'View Source'}</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* IN PROGRESS Column */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col min-h-[450px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-300">In Progress</h3>
            </div>
            <span className="text-[11px] font-mono text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
              {inProgressTasks.length}
            </span>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto">
            {inProgressTasks.map((task) => (
              <div
                key={task.id}
                className="bg-slate-900 border border-indigo-500/30 rounded-lg p-3.5 space-y-2.5 shadow-sm group transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-medium text-slate-100 group-hover:text-indigo-300 leading-snug">
                    {task.title}
                  </h4>
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 rounded transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {task.description && (
                  <p className="text-[11px] text-slate-400 line-clamp-2">{task.description}</p>
                )}

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    {getSourceIcon(task.source)}
                    {getPriorityBadge(task.priority)}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onUpdateTaskStatus(task.id, 'todo')}
                      className="text-[10px] text-slate-400 hover:text-slate-200 px-1.5 py-0.5 rounded bg-slate-800"
                    >
                      ← Todo
                    </button>
                    <button
                      onClick={() => onUpdateTaskStatus(task.id, 'done')}
                      className="text-[10px] text-emerald-400 hover:text-emerald-300 font-medium px-2 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20"
                    >
                      Complete ✓
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DONE Column */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col min-h-[450px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Completed</h3>
            </div>
            <span className="text-[11px] font-mono text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
              {doneTasks.length}
            </span>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto">
            {doneTasks.map((task) => (
              <div
                key={task.id}
                className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3.5 space-y-2 opacity-80 hover:opacity-100 transition-opacity group"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-medium text-slate-400 line-through leading-snug">
                    {task.title}
                  </h4>
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    {getSourceIcon(task.source)}
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>

                  <button
                    onClick={() => onUpdateTaskStatus(task.id, 'in_progress')}
                    className="text-[10px] text-slate-400 hover:text-slate-200 px-1.5 py-0.5 rounded bg-slate-800"
                  >
                    Reopen
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* New Task Modal */}
      {isOpenNewTaskModal && (
        <div
          onClick={onCloseNewTaskModal}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-white">Create New Action Item</h3>
              <button onClick={onCloseNewTaskModal} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add details, links, or context..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Dev, Review, Design"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onCloseNewTaskModal}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg shadow-sm"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
