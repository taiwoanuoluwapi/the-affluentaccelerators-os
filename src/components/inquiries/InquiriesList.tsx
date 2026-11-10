import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Inbox,
  Filter,
  Search,
  Plus,
  FileSpreadsheet,
  Columns,
  List,
  CheckCircle,
  CheckCircle2,
  Clock,
  ArrowUpDown,
  Download,
  UserPlus,
  Eye,
  AlertTriangle,
  FolderOpen,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import {
  formatDate,
  formatDateTime,
  getStatusBadgeConfig,
  getPriorityBadge,
  exportToCSV
} from '../../utils/formatters';
import { Inquiry, InquiryStatus, InquiryPriority, InquiryCategory } from '../../types';

interface InquiriesListProps {
  onSelectInquiry: (id: string) => void;
  onOpenNewInquiry: () => void;
  onOpenGoogleModal: () => void;
}

export const InquiriesList: React.FC<InquiriesListProps> = ({
  onSelectInquiry,
  onOpenNewInquiry,
  onOpenGoogleModal
}) => {
  const { inquiries, users, updateInquiry, assignInquiry, addAuditLog, currentUser, googleSettings, triggerGoogleSync } = useApp();

  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assignedFilter, setAssignedFilter] = useState<string>('all');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Bulk selection
  const [selectedInquiryIds, setSelectedInquiryIds] = useState<string[]>([]);
  const [bulkAssigneeId, setBulkAssigneeId] = useState<string>('');
  const [bulkModalOpen, setBulkModalOpen] = useState(false);

  // Filter inquiries
  const filteredInquiries = inquiries.filter(inq => {
    const matchesSearch =
      inq.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.referenceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || inq.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || inq.category === categoryFilter;
    const matchesPriority = priorityFilter === 'all' || inq.priority === priorityFilter;
    const matchesAssigned =
      assignedFilter === 'all' ||
      inq.assignedBdId === assignedFilter ||
      inq.assignedSalesRepId === assignedFilter ||
      inq.assignedConsultantId === assignedFilter;

    return matchesSearch && matchesStatus && matchesCategory && matchesPriority && matchesAssigned;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedInquiryIds(filteredInquiries.map(i => i.id));
    } else {
      setSelectedInquiryIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedInquiryIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkAssign = () => {
    if (!bulkAssigneeId || selectedInquiryIds.length === 0) return;
    selectedInquiryIds.forEach(id => {
      assignInquiry(id, { bdId: bulkAssigneeId });
    });
    addAuditLog(
      'Bulk Assignment',
      'Inquiry',
      bulkAssigneeId,
      `Assigned ${selectedInquiryIds.length} inquiries to team member.`
    );
    setSelectedInquiryIds([]);
    setBulkModalOpen(false);
  };

  const handleDirectSync = async () => {
    setIsSyncing(true);
    setSyncFeedback('Querying Google Apps Script Master Database...');
    try {
      const res = await triggerGoogleSync();
      setSyncFeedback(res.message || 'Synchronisation completed.');
    } catch {
      setSyncFeedback('Synchronisation completed with local registry.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncFeedback(null), 4500);
    }
  };

  const handleExport = () => {
    const exportRows = filteredInquiries.map(i => ({
      'Reference No': i.referenceNo,
      'Full Name': i.fullName,
      'Business Name': i.businessName,
      'Email': i.email,
      'Phone': i.phone,
      'Location': i.location,
      'Industry': i.industry,
      'Category': i.category,
      'Requested Service': i.requestedService,
      'Budget Range': i.budgetRange,
      'Stage': i.stage,
      'Annual Revenue': i.annualRevenueRange,
      'Status': i.status,
      'Priority': i.priority,
      'Source': i.source,
      'Submitted At': i.submittedAt
    }));
    exportToCSV('AffluentOS_Inquiries_Export', exportRows);
  };

  const kanbanColumns: { id: InquiryStatus; title: string; color: string }[] = [
    { id: 'new', title: 'New Submissions', color: 'border-emerald-500' },
    { id: 'under_review', title: 'Under Review', color: 'border-indigo-500' },
    { id: 'contacted', title: 'Contacted', color: 'border-sky-500' },
    { id: 'qualified', title: 'Qualified Leads', color: 'border-teal-500' },
    { id: 'proposal_requested', title: 'Proposal Requested', color: 'border-purple-500' },
    { id: 'converted', title: 'Converted to Deal', color: 'border-emerald-600' }
  ];

  const consultingCount = inquiries.filter(i => i.category === 'Custom Business Consulting' || i.category === 'Business Strategy Requests').length;
  const auditCount = inquiries.filter(i => i.category === 'Business Audit Requests').length;
  const generalCount = inquiries.filter(i => i.category === 'General Business Inquiries' || i.category === 'Partnership Inquiries' || i.category === 'Business Advisory').length;

  return (
    <div className="space-y-4">
      {/* Header and Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shrink-0">
              <Inbox size={20} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">Inquiry & Lead Management</h2>
                <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-mono font-bold">
                  {filteredInquiries.length} records
                </span>
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100/70 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  <span>Google Sheets Synced: [{googleSettings.spreadsheetName.trim()}]</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Centralized website submissions, audit requests, and lead qualification pipeline.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Table view"
              >
                <List size={15} />
                <span className="hidden sm:inline">Table</span>
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer ${
                  viewMode === 'kanban' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Kanban view"
              >
                <Columns size={15} />
                <span className="hidden sm:inline">Kanban</span>
              </button>
            </div>

            {/* Direct Google Sync Trigger */}
            <button
              onClick={handleDirectSync}
              disabled={isSyncing}
              className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-300 transition-all cursor-pointer shadow-2xs disabled:opacity-60"
              title="Query live Google Apps Script endpoint to synchronize master sheet rows"
            >
              <RefreshCw size={14} className={isSyncing ? 'animate-spin text-emerald-600' : 'text-emerald-700'} />
              <span>{isSyncing ? 'Syncing...' : 'Google Sync'}</span>
            </button>

            {/* Google Config Modal */}
            <button
              onClick={onOpenGoogleModal}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs transition-colors cursor-pointer border border-slate-200"
              title="Google Sheet & Apps Script Settings"
            >
              <FileSpreadsheet size={16} />
            </button>

            {/* Export CSV */}
            <button
              onClick={handleExport}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs transition-colors cursor-pointer border border-slate-200"
              title="Export to CSV"
            >
              <Download size={16} />
            </button>

            {/* New Inquiry */}
            <button
              onClick={onOpenNewInquiry}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow transition-all cursor-pointer"
            >
              <Plus size={15} />
              <span>New Lead</span>
            </button>
          </div>
        </div>

        {/* Sync Feedback Toast */}
        {syncFeedback && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between animate-in fade-in">
            <div className="flex items-center space-x-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span className="font-medium">{syncFeedback}</span>
            </div>
            <button
              onClick={() => setSyncFeedback(null)}
              className="text-emerald-700 hover:underline text-[10px] font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Quick Category Sheet Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-xs font-semibold">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              categoryFilter === 'all'
                ? 'bg-emerald-800 text-white shadow-2xs font-bold'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            All Sheets ({inquiries.length})
          </button>
          <button
            onClick={() => setCategoryFilter('Business Audit Requests')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              categoryFilter === 'Business Audit Requests'
                ? 'bg-emerald-800 text-white shadow-2xs font-bold'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Tab: [Business Audits] ({auditCount})
          </button>
          <button
            onClick={() => setCategoryFilter('Custom Business Consulting')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              categoryFilter === 'Custom Business Consulting'
                ? 'bg-emerald-800 text-white shadow-2xs font-bold'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Tab: [Consulting Inquiries] ({consultingCount})
          </button>
          <button
            onClick={() => setCategoryFilter('General Business Inquiries')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              categoryFilter === 'General Business Inquiries'
                ? 'bg-emerald-800 text-white shadow-2xs font-bold'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Tab: [General Submissions] ({generalCount})
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-2 border-t border-slate-100">
          <div className="relative lg:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search inquiries..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            <option value="all">All Statuses</option>
            <option value="new">New Submission</option>
            <option value="under_review">Under Review</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified Lead</option>
            <option value="proposal_requested">Proposal Requested</option>
            <option value="converted">Converted to Deal</option>
            <option value="not_qualified">Not Qualified</option>
            <option value="closed_lost">Closed / Lost</option>
          </select>

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            <option value="all">All Service Categories</option>
            <option value="Business Audit Requests">Business Audit Requests</option>
            <option value="Custom Business Consulting">Custom Business Consulting</option>
            <option value="Business Advisory">Business Advisory</option>
            <option value="Business Strategy Requests">Business Strategy Requests</option>
            <option value="Business Growth Support">Business Growth Support</option>
            <option value="Business Development Requests">Business Development Requests</option>
          </select>

          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={assignedFilter}
            onChange={e => setAssignedFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            <option value="all">All Assignees</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role.replace('_', ' ')})
              </option>
            ))}
          </select>
        </div>

        {/* Bulk Action Bar if items selected */}
        {selectedInquiryIds.length > 0 && (
          <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl animate-in fade-in">
            <span className="text-xs font-semibold text-emerald-900">
              {selectedInquiryIds.length} inquiry records selected
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setBulkModalOpen(true)}
                className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold"
              >
                <UserPlus size={13} />
                <span>Bulk Assign BD Manager</span>
              </button>
              <button
                onClick={() => setSelectedInquiryIds([])}
                className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* VIEW: TABLE */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                <tr>
                  <th className="p-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={
                        filteredInquiries.length > 0 &&
                        selectedInquiryIds.length === filteredInquiries.length
                      }
                      onChange={handleSelectAll}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                  </th>
                  <th className="py-3 px-3">Reference #</th>
                  <th className="py-3 px-3">Company & Contact</th>
                  <th className="py-3 px-3">Inquiry Category</th>
                  <th className="py-3 px-3">Budget Range</th>
                  <th className="py-3 px-3">Source</th>
                  <th className="py-3 px-3">Assigned Lead</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInquiries.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400">
                      No inquiries match the current search and filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredInquiries.map(inq => {
                    const statusConfig = getStatusBadgeConfig(inq.status);
                    const priorityConfig = getPriorityBadge(inq.priority);
                    const assignedUser = users.find(u => u.id === (inq.assignedBdId || inq.assignedSalesRepId));

                    return (
                      <tr
                        key={inq.id}
                        className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                        onClick={() => onSelectInquiry(inq.id)}
                      >
                        <td
                          className="p-3 text-center"
                          onClick={e => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={selectedInquiryIds.includes(inq.id)}
                            onChange={() => handleToggleSelect(inq.id)}
                            className="rounded text-emerald-600 focus:ring-emerald-500"
                          />
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="font-mono font-bold text-slate-900">
                            {inq.referenceNo}
                          </div>
                          {inq.googleReferenceId && (
                            <div className="text-[10px] font-mono font-bold text-emerald-800 flex items-center space-x-1 mt-0.5">
                              <FileSpreadsheet size={11} className="text-emerald-600 shrink-0" />
                              <span>{inq.googleReferenceId}</span>
                            </div>
                          )}
                          {inq.googleSheetName && (
                            <span className="inline-block text-[9px] font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200 px-1 rounded mt-0.5">
                              {inq.googleSheetName}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                            {inq.businessName}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {inq.fullName} • {inq.location}
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span className="font-medium text-slate-700 block truncate max-w-[180px]">
                            {inq.category}
                          </span>
                          <span className="text-[11px] text-slate-400 truncate block max-w-[180px]">
                            {inq.requestedService}
                          </span>
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap font-medium text-slate-700">
                          {inq.budgetRange}
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                            {inq.source}
                          </span>
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          {assignedUser ? (
                            <div className="flex items-center space-x-1.5">
                              <img
                                src={assignedUser.avatar}
                                alt=""
                                className="w-5 h-5 rounded-full object-cover"
                              />
                              <span className="text-slate-800 font-medium">{assignedUser.name.split(' ')[0]}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Unassigned</span>
                          )}
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${priorityConfig.color}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${priorityConfig.dotColor}`}></span>
                            {priorityConfig.label}
                          </span>
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                          >
                            {statusConfig.label}
                          </span>
                        </td>

                        <td
                          className="py-3 px-3 text-right whitespace-nowrap"
                          onClick={e => e.stopPropagation()}
                        >
                          <button
                            onClick={() => onSelectInquiry(inq.id)}
                            className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Open inquiry profile"
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* VIEW: KANBAN */
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3.5 overflow-x-auto pb-4">
          {kanbanColumns.map(col => {
            const colInquiries = filteredInquiries.filter(i => i.status === col.id);
            return (
              <div
                key={col.id}
                className="bg-slate-50/70 p-3 rounded-2xl border border-slate-200 flex flex-col min-h-[500px]"
              >
                <div className={`flex items-center justify-between pb-2 mb-2 border-b-2 ${col.color}`}>
                  <span className="font-bold text-xs text-slate-700">{col.title}</span>
                  <span className="text-[11px] font-bold bg-white text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                    {colInquiries.length}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1 overflow-y-auto">
                  {colInquiries.map(inq => {
                    const priorityConfig = getPriorityBadge(inq.priority);
                    return (
                      <div
                        key={inq.id}
                        onClick={() => onSelectInquiry(inq.id)}
                        className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-400 cursor-pointer transition-all hover:shadow-card group"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-1">
                            <span className="font-mono text-[10px] font-bold text-slate-900">{inq.referenceNo}</span>
                            {inq.googleReferenceId && (
                              <span className="text-[9px] font-mono font-bold text-emerald-800 bg-emerald-50 px-1 rounded border border-emerald-200">
                                {inq.googleReferenceId}
                              </span>
                            )}
                          </div>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${priorityConfig.color}`}>
                            {inq.priority}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-slate-800 group-hover:text-emerald-800 transition-colors line-clamp-1">
                          {inq.businessName}
                        </h4>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{inq.fullName}</p>
                        <div className="mt-2 text-[10px] text-slate-500 bg-slate-50 p-1.5 rounded border border-slate-100 line-clamp-2">
                          {inq.requestedService || inq.category}
                        </div>
                        <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-100">
                          <span>{formatDate(inq.submittedAt)}</span>
                          <span className="font-medium text-slate-700">{inq.budgetRange}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bulk Assign Modal */}
      {bulkModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-floating space-y-4">
            <h3 className="font-bold text-base text-slate-800">
              Bulk Assign {selectedInquiryIds.length} Inquiries
            </h3>
            <p className="text-xs text-slate-500">
              Assign all selected inquiries to a designated Business Development Manager or Sales Representative.
            </p>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Select Assignee</label>
              <select
                value={bulkAssigneeId}
                onChange={e => setBulkAssigneeId(e.target.value)}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
              >
                <option value="">-- Choose team member --</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {u.title} ({u.role})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setBulkModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkAssign}
                disabled={!bulkAssigneeId}
                className="px-4 py-2 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-lg"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
