import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Briefcase,
  CheckCircle2,
  Clock,
  Calendar,
  DollarSign,
  Plus,
  FileText,
  UserCheck,
  CheckSquare,
  Square,
  AlertCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { formatCurrency, formatDate, getStatusBadgeConfig } from '../../utils/formatters';
import { ProjectStatus } from '../../types';

interface ProjectDetailModalProps {
  projectId: string | null;
  onClose: () => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ projectId, onClose }) => {
  const { projects, users, updateProject, addTaskToProject, updateTaskStatus, currentUser } = useApp();

  const [activeTab, setActiveTab] = useState<'tasks' | 'deliverables' | 'documents' | 'overview'>('tasks');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('usr_analyst');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  if (!projectId) return null;

  const project = projects.find(p => p.id === projectId);
  if (!project) return null;

  const statusConfig = getStatusBadgeConfig(project.status);
  const leadConsultant = users.find(u => u.id === project.leadConsultantId);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const assignedUser = users.find(u => u.id === newTaskAssignee);

    addTaskToProject(project.id, {
      projectId: project.id,
      title: newTaskTitle,
      description: 'Standard consulting engagement task',
      assignedUserId: newTaskAssignee,
      assignedUserName: assignedUser?.name || 'Consultant',
      dueDate: newTaskDueDate || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      priority: 'high',
      status: 'todo'
    });

    setNewTaskTitle('');
  };

  const handleStatusChange = (status: ProjectStatus) => {
    updateProject(project.id, { status });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-floating border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-start justify-between">
          <div className="flex items-start space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-800 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
              <Briefcase size={22} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded border border-blue-200">
                  {project.reference}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                  {statusConfig.label}
                </span>
                <span className="text-xs text-slate-500 font-mono font-bold text-emerald-800">
                  {formatCurrency(project.agreedFee, project.currency)}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-1">{project.name}</h2>
              <p className="text-xs text-slate-500 font-medium">
                Client: <span className="text-slate-800 font-bold">{project.businessName}</span> ({project.clientName})
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={project.status}
              onChange={e => handleStatusChange(e.target.value as ProjectStatus)}
              className="text-xs p-1.5 bg-white border border-slate-200 rounded-lg font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              <option value="planning">Planning</option>
              <option value="in_progress">In Progress</option>
              <option value="under_review">Under Review</option>
              <option value="completed">Completed</option>
              <option value="on_hold">On Hold</option>
            </select>
            <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-400">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Progress & Milestone Bar */}
        <div className="px-5 py-3 bg-slate-100/60 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-4 flex-1 max-w-md mr-4">
            <span className="font-bold text-slate-700 whitespace-nowrap">Progress: {project.progressPercentage}%</span>
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${project.progressPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-slate-500 font-mono text-[11px]">
            <span>Start: {formatDate(project.startDate)}</span>
            <span>• Deadline: {formatDate(project.expectedCompletionDate)}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-5 border-b border-slate-200 flex space-x-6 text-xs font-semibold text-slate-500 bg-white">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`py-3 border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'tasks' ? 'border-emerald-700 text-emerald-900 font-bold' : 'border-transparent hover:text-slate-800'
            }`}
          >
            <span>Project Tasks</span>
            <span className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded-full text-[10px]">
              {project.tasks.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('deliverables')}
            className={`py-3 border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'deliverables' ? 'border-emerald-700 text-emerald-900 font-bold' : 'border-transparent hover:text-slate-800'
            }`}
          >
            <span>Deliverables & Reports</span>
            <span className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded-full text-[10px]">
              {project.deliverables.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'documents' ? 'border-emerald-700 text-emerald-900 font-bold' : 'border-transparent hover:text-slate-800'
            }`}
          >
            Engagement Files ({project.documents.length})
          </button>
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'overview' ? 'border-emerald-700 text-emerald-900 font-bold' : 'border-transparent hover:text-slate-800'
            }`}
          >
            Scope & Instructions
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto bg-slate-50/50 space-y-6 text-xs text-slate-700">
          {/* TAB 1: TASKS */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              {/* Task Creation Inline */}
              <form onSubmit={handleCreateTask} className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-2">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  placeholder="Add a new project task or audit action..."
                  className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
                <select
                  value={newTaskAssignee}
                  onChange={e => setNewTaskAssignee(e.target.value)}
                  className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role.replace('_', ' ')})
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  value={newTaskDueDate}
                  onChange={e => setNewTaskDueDate(e.target.value)}
                  className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                />
                <button
                  type="submit"
                  disabled={!newTaskTitle.trim()}
                  className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold disabled:opacity-50 flex items-center space-x-1"
                >
                  <Plus size={14} />
                  <span>Add Task</span>
                </button>
              </form>

              {/* Task List */}
              <div className="space-y-2.5">
                {project.tasks.map(task => {
                  const isDone = task.status === 'done';
                  return (
                    <div
                      key={task.id}
                      className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                        isDone ? 'bg-slate-50 border-slate-200 opacity-70' : 'bg-white border-slate-200 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => updateTaskStatus(project.id, task.id, isDone ? 'in_progress' : 'done')}
                          className="text-emerald-700 hover:text-emerald-800"
                        >
                          {isDone ? <CheckCircle2 size={18} className="text-emerald-600" /> : <div className="w-4 h-4 rounded border-2 border-slate-300 hover:border-emerald-500"></div>}
                        </button>
                        <div>
                          <span className={`font-semibold text-xs text-slate-800 ${isDone ? 'line-through text-slate-400' : ''}`}>
                            {task.title}
                          </span>
                          <div className="text-[10px] text-slate-400 flex items-center space-x-2 mt-0.5">
                            <span>Assigned: {task.assignedUserName}</span>
                            <span>• Due: {formatDate(task.dueDate)}</span>
                            <span className="capitalize">• Status: {task.status.replace('_', ' ')}</span>
                          </div>
                        </div>
                      </div>

                      <select
                        value={task.status}
                        onChange={e => updateTaskStatus(project.id, task.id, e.target.value as any)}
                        className="text-[11px] p-1 bg-slate-50 border border-slate-200 rounded font-semibold text-slate-700"
                      >
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="review">Under Review</option>
                        <option value="done">Completed</option>
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: DELIVERABLES */}
          {activeTab === 'deliverables' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                Agreed Client Deliverables & Milestones
              </h4>

              <div className="space-y-3">
                {project.deliverables.map(del => (
                  <div key={del.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h5 className="font-bold text-slate-900 text-xs">{del.title}</h5>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          del.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {del.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-slate-600 text-xs mt-1">{del.description}</p>
                      <span className="text-[10px] text-slate-400 font-mono mt-1 block">Due Date: {formatDate(del.dueDate)}</span>
                    </div>

                    <button
                      onClick={() => alert(`Simulated document delivery for: ${del.title}`)}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 flex items-center space-x-1"
                    >
                      <FileText size={13} className="text-emerald-700" />
                      <span>Upload Report</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                Engagement Contracts & Diagnostic Reports
              </h4>
              <div className="space-y-2">
                {project.documents.map(doc => (
                  <div key={doc.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <FileText size={16} className="text-emerald-700" />
                      <div>
                        <span className="font-bold text-slate-800 block text-xs">{doc.name}</span>
                        <span className="text-[10px] text-slate-400">{doc.category} • {doc.size}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => alert(`Opening secure document: ${doc.name}`)}
                      className="text-xs font-semibold text-blue-600 hover:underline flex items-center space-x-1"
                    >
                      <span>Preview</span>
                      <ExternalLink size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: OVERVIEW & SCOPE */}
          {activeTab === 'overview' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div>
                <h4 className="font-bold text-slate-900 text-xs mb-1">Engagement Description</h4>
                <p className="p-3 bg-slate-50 rounded-xl text-slate-700 leading-relaxed">
                  {project.description}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-xs mb-1">Detailed Scope of Work (SOW)</h4>
                <div className="p-3 bg-slate-50 rounded-xl text-slate-700 whitespace-pre-wrap leading-relaxed font-mono text-[11px]">
                  {project.scopeOfWork}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-[10px] block">Lead Strategy Consultant</span>
                  <span className="font-bold text-slate-800 text-xs">{leadConsultant?.name} ({leadConsultant?.title})</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[10px] block">Agreed Consulting Fee</span>
                  <span className="font-extrabold text-sm text-emerald-800 font-mono">
                    {formatCurrency(project.agreedFee, project.currency)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
