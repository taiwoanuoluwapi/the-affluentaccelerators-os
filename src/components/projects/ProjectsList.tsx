import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  FolderOpen,
  ArrowRight,
  TrendingUp,
  Download
} from 'lucide-react';
import { formatDate, formatCurrency, getStatusBadgeConfig, exportToCSV } from '../../utils/formatters';
import { Project, ProjectStatus } from '../../types';

interface ProjectsListProps {
  onSelectProject: (id: string) => void;
  onOpenNewProject: () => void;
}

export const ProjectsList: React.FC<ProjectsListProps> = ({
  onSelectProject,
  onOpenNewProject
}) => {
  const { projects, users, currentUser } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [consultantFilter, setConsultantFilter] = useState<string>('all');

  const filteredProjects = projects.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.engagementType.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesConsultant =
      consultantFilter === 'all' ||
      p.leadConsultantId === consultantFilter ||
      p.supportingAnalystIds.includes(consultantFilter);

    return matchesSearch && matchesStatus && matchesConsultant;
  });

  const handleExportProjects = () => {
    const rows = filteredProjects.map(p => ({
      'Reference': p.reference,
      'Project Name': p.name,
      'Client': p.businessName,
      'Engagement Type': p.engagementType,
      'Status': p.status,
      'Progress': `${p.progressPercentage}%`,
      'Agreed Fee': p.agreedFee,
      'Currency': p.currency,
      'Start Date': p.startDate,
      'Deadline': p.expectedCompletionDate
    }));
    exportToCSV('AffluentOS_Consulting_Projects', rows);
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Briefcase size={18} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-800">Consulting Engagements & Projects</h2>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono">
                  {projects.length} engagements
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Manage client deliverables, diagnostic audits, consultant assignments, and milestone completion
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportProjects}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs transition-colors"
              title="Export Projects CSV"
            >
              <Download size={16} />
            </button>
            <button
              onClick={onOpenNewProject}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              <Plus size={15} />
              <span>New Engagement</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search engagements, clients, references..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            <option value="all">All Engagement Statuses</option>
            <option value="planning">Planning</option>
            <option value="in_progress">In Progress</option>
            <option value="under_review">Under Review</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
          </select>

          <select
            value={consultantFilter}
            onChange={e => setConsultantFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            <option value="all">All Lead Consultants</option>
            {users
              .filter(u => u.role === 'consultant' || u.role === 'super_admin')
              .map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.title})
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProjects.length === 0 ? (
          <div className="col-span-2 py-16 bg-white rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
            No consulting engagements match your search and filter criteria.
          </div>
        ) : (
          filteredProjects.map(prj => {
            const statusConfig = getStatusBadgeConfig(prj.status);
            const lead = users.find(u => u.id === prj.leadConsultantId);

            return (
              <div
                key={prj.id}
                onClick={() => onSelectProject(prj.id)}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all hover:shadow-card cursor-pointer group space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                      {prj.reference}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                    >
                      {statusConfig.label}
                    </span>
                  </div>

                  <span className="font-extrabold text-sm text-emerald-800 font-mono">
                    {formatCurrency(prj.agreedFee, prj.currency)}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-800 transition-colors line-clamp-1">
                    {prj.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Client: <span className="font-semibold text-slate-800">{prj.businessName}</span> ({prj.clientName})
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Milestone Progress</span>
                    <span className="font-bold text-emerald-800 font-mono">{prj.progressPercentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${prj.progressPercentage}%` }}
                    ></div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center space-x-2">
                    {lead && (
                      <div className="flex items-center space-x-1.5">
                        <img src={lead.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                        <span className="font-semibold text-slate-800">{lead.name.split(' ')[0]}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 text-[11px] font-mono">
                    <span>{prj.tasks.length} tasks</span>
                    <span>• Due: {formatDate(prj.expectedCompletionDate)}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
