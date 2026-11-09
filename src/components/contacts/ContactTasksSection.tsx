import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Contact, UserRole } from '../../types';
import {
  CheckSquare,
  Square,
  Plus,
  FileSpreadsheet,
  Clock,
  User,
  Shield,
  Filter,
  AlertCircle,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

interface ContactTasksSectionProps {
  contact: Contact;
}

export const ContactTasksSection: React.FC<ContactTasksSectionProps> = ({ contact }) => {
  const {
    contactRoleTasks,
    addContactRoleTask,
    updateContactRoleTaskStatus,
    currentUser,
    users
  } = useApp();

  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [assignedRole, setAssignedRole] = useState<UserRole>('sales_rep');
  const [assignedUserId, setAssignedUserId] = useState(currentUser.id);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]
  );
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');

  // Filter tasks belonging to this contact
  const tasksForContact = contactRoleTasks.filter(t => t.contactId === contact.id);

  // Apply role filter
  const filteredTasks = tasksForContact.filter(t => {
    if (roleFilter === 'all') return true;
    if (roleFilter === 'my_role') return t.assignedRole === currentUser.role;
    return t.assignedRole === roleFilter;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle) return;

    const assignedUser = users.find(u => u.id === assignedUserId);

    addContactRoleTask({
      contactId: contact.id,
      contactName: contact.fullName,
      businessName: contact.businessName,
      title: taskTitle,
      description: taskDesc,
      assignedRole,
      assignedUserId,
      assignedUserName: assignedUser ? assignedUser.name : currentUser.name,
      dueDate,
      priority,
      status: 'todo'
    });

    setTaskTitle('');
    setTaskDesc('');
    setIsAddingTask(false);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return { label: 'Founder / Partner', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      case 'admin':
        return { label: 'Operations & Admin', color: 'bg-blue-100 text-blue-900 border-blue-300' };
      case 'bd_manager':
        return { label: 'BD Manager', color: 'bg-indigo-100 text-indigo-900 border-indigo-300' };
      case 'sales_rep':
        return { label: 'Sales Rep', color: 'bg-purple-100 text-purple-900 border-purple-300' };
      case 'consultant':
        return { label: 'Consultant', color: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'intern':
        return { label: 'Research Fellow', color: 'bg-slate-100 text-slate-800 border-slate-300' };
    }
  };

  return (
    <div className="space-y-4 pt-4 border-t border-slate-200">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center space-x-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center space-x-1.5">
              <span>Role-Based Tasks on Contact</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                Synced to Google Sheets
              </span>
            </h4>
          </div>
          <p className="text-[11px] text-slate-500">
            Assigned tasks based on Supabase team roles (Sales Rep, Consultant, BD Manager)
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="text-[11px] px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">All Roles ({tasksForContact.length})</option>
            <option value="my_role">My Role ({currentUser.role})</option>
            <option value="sales_rep">Sales Rep Tasks</option>
            <option value="consultant">Consultant Tasks</option>
            <option value="bd_manager">BD Tasks</option>
          </select>

          <button
            onClick={() => setIsAddingTask(!isAddingTask)}
            className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[11px] font-bold flex items-center space-x-1 transition-colors cursor-pointer shadow-2xs"
          >
            <Plus size={13} />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Add Task Sub-Form */}
      {isAddingTask && (
        <form
          onSubmit={handleCreateTask}
          className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs animate-in fade-in duration-150"
        >
          <div className="font-bold text-slate-800 flex items-center justify-between">
            <span>New Role-Based Contact Task</span>
            <button
              type="button"
              onClick={() => setIsAddingTask(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
              Task Title
            </label>
            <input
              type="text"
              required
              value={taskTitle}
              onChange={e => setTaskTitle(e.target.value)}
              placeholder="e.g. Conduct plant operational audit & prepare diagnostic memo"
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                Required Role
              </label>
              <select
                value={assignedRole}
                onChange={e => setAssignedRole(e.target.value as UserRole)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
              >
                <option value="sales_rep">Sales Representative</option>
                <option value="consultant">Lead Consultant</option>
                <option value="bd_manager">BD Manager</option>
                <option value="super_admin">Founder / Partner</option>
                <option value="admin">Operations Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                Assignee
              </label>
              <select
                value={assignedUserId}
                onChange={e => setAssignedUserId(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAddingTask(false)}
              className="px-3 py-1.5 text-slate-600 bg-white border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-2xs"
            >
              Save & Post to Google Sheet
            </button>
          </div>
        </form>
      )}

      {/* Task List */}
      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-400">
            No role-based tasks logged for this contact under selected filter.
          </div>
        ) : (
          filteredTasks.map(task => {
            const isCompleted = task.status === 'completed';
            const roleBadge = getRoleBadge(task.assignedRole);

            return (
              <div
                key={task.id}
                className={`p-3 rounded-xl border transition-all text-xs flex items-start justify-between gap-3 ${
                  isCompleted
                    ? 'bg-slate-50 border-slate-200 opacity-60'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className="flex items-start space-x-2.5 flex-1 min-w-0">
                  <button
                    onClick={() =>
                      updateContactRoleTaskStatus(task.id, isCompleted ? 'todo' : 'completed')
                    }
                    className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"
                  >
                    {isCompleted ? (
                      <CheckSquare size={17} className="text-emerald-600" />
                    ) : (
                      <Square size={17} />
                    )}
                  </button>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div
                      className={`font-semibold text-slate-800 ${
                        isCompleted ? 'line-through text-slate-400' : ''
                      }`}
                    >
                      {task.title}
                    </div>

                    {task.description && (
                      <p className="text-[11px] text-slate-500 leading-normal line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[10px]">
                      <span className={`font-bold px-2 py-0.2 rounded-full border ${roleBadge.color}`}>
                        {roleBadge.label}
                      </span>
                      <span className="text-slate-500 flex items-center space-x-1">
                        <User size={11} />
                        <span>{task.assignedUserName || 'Unassigned'}</span>
                      </span>
                      <span>•</span>
                      <span className="text-slate-500 flex items-center space-x-1">
                        <Calendar size={11} />
                        <span>Due: {formatDate(task.dueDate)}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Google Sheet reference pill */}
                <div className="text-right shrink-0">
                  <span className="font-mono text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                    Sheet Row #{task.googleSheetRowIndex || 3}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
