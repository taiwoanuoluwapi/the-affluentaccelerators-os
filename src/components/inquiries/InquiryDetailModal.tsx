import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Building,
  UserCheck,
  Mail,
  Phone,
  MessageSquare,
  Globe,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  FileSpreadsheet,
  Download,
  ExternalLink,
  Plus,
  Send,
  GitBranch,
  ShieldAlert,
  Clock,
  ArrowRight,
  CheckCircle2,
  FolderOpen
} from 'lucide-react';
import {
  formatDate,
  formatDateTime,
  getStatusBadgeConfig,
  getPriorityBadge,
  formatCurrency
} from '../../utils/formatters';
import { InquiryStatus, InquiryPriority } from '../../types';

interface InquiryDetailModalProps {
  inquiryId: string | null;
  onClose: () => void;
  onConvertToDeal: (inquiryId: string) => void;
  onScheduleFollowUp: (targetName: string, relatedId: string) => void;
}

export const InquiryDetailModal: React.FC<InquiryDetailModalProps> = ({
  inquiryId,
  onClose,
  onConvertToDeal,
  onScheduleFollowUp
}) => {
  const { inquiries, users, updateInquiry, assignInquiry, logActivity, activities, auditLogs, currentUser, googleSettings } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'business' | 'documents' | 'activities' | 'notes' | 'audit'>('overview');
  const [newNote, setNewNote] = useState('');
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);

  if (!inquiryId) return null;

  const inquiry = inquiries.find(i => i.id === inquiryId);
  if (!inquiry) return null;

  const statusConfig = getStatusBadgeConfig(inquiry.status);
  const priorityConfig = getPriorityBadge(inquiry.priority);

  const assignedBd = users.find(u => u.id === inquiry.assignedBdId);
  const assignedRep = users.find(u => u.id === inquiry.assignedSalesRepId);
  const assignedConsultant = users.find(u => u.id === inquiry.assignedConsultantId);

  const inquiryActivities = activities.filter(
    a => a.relatedType === 'inquiry' && a.relatedId === inquiry.id
  );

  const inquiryAudit = auditLogs.filter(
    a => a.entityType === 'Inquiry' && a.entityId === inquiry.id
  );

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const formattedNote = `${inquiry.internalNotes ? inquiry.internalNotes + '\n\n' : ''}[${new Date().toLocaleDateString('en-GB')} by ${currentUser.name}]: ${newNote}`;
    updateInquiry(inquiry.id, { internalNotes: formattedNote });

    logActivity({
      type: 'note',
      relatedType: 'inquiry',
      relatedId: inquiry.id,
      relatedTitle: inquiry.businessName,
      date: new Date().toISOString(),
      summary: `Internal note added by ${currentUser.name}`,
      outcome: newNote,
      nextAction: 'Review during pipeline sprint',
      userId: currentUser.id,
      userName: currentUser.name,
      completed: true
    });

    setNewNote('');
  };

  const handleStatusChange = (newStatus: InquiryStatus) => {
    updateInquiry(inquiry.id, { status: newStatus });
    setStatusMenuOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-floating border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex items-start justify-between">
          <div className="flex items-start space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-[#043e2f] text-white flex items-center justify-center font-bold text-lg shadow-sm border border-emerald-400/40 shrink-0">
              <Building size={22} />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-300">
                  {inquiry.referenceNo}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${priorityConfig.color}`}>
                  {priorityConfig.label}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                  {statusConfig.label}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-1">{inquiry.businessName}</h2>
              <p className="text-xs text-slate-500">
                Contact: <span className="font-semibold text-slate-700">{inquiry.fullName}</span> • {inquiry.industry} • {inquiry.location}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onConvertToDeal(inquiry.id)}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <GitBranch size={14} />
              <span>Qualify & Create Deal</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Quick Action Strip */}
        <div className="px-5 py-2.5 bg-emerald-50/40 border-b border-emerald-100 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-medium">Quick Status:</span>
            <select
              value={inquiry.status}
              onChange={e => handleStatusChange(e.target.value as InquiryStatus)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              <option value="new">New Submission</option>
              <option value="under_review">Under Review</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="proposal_requested">Proposal Requested</option>
              <option value="converted">Converted to Deal</option>
              <option value="not_qualified">Not Qualified</option>
              <option value="closed_lost">Closed / Lost</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onScheduleFollowUp(inquiry.fullName, inquiry.id)}
              className="flex items-center space-x-1 px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-medium"
            >
              <Clock size={12} className="text-emerald-700" />
              <span>Schedule Follow-up</span>
            </button>
            <a
              href={`https://wa.me/${inquiry.whatsapp?.replace(/\D/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium"
            >
              <MessageSquare size={12} />
              <span>WhatsApp Client</span>
            </a>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="px-5 border-b border-slate-200 flex space-x-6 text-xs font-semibold text-slate-500 bg-white">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'overview' ? 'border-emerald-700 text-emerald-900 font-bold' : 'border-transparent hover:text-slate-800'
            }`}
          >
            1. Overview
          </button>
          <button
            onClick={() => setActiveTab('business')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'business' ? 'border-emerald-700 text-emerald-900 font-bold' : 'border-transparent hover:text-slate-800'
            }`}
          >
            2. Business Diagnostics
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`py-3 border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'documents' ? 'border-emerald-700 text-emerald-900 font-bold' : 'border-transparent hover:text-slate-800'
            }`}
          >
            <span>3. Uploaded Files</span>
            <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full text-[10px]">
              {inquiry.supportingDocuments.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'activities' ? 'border-emerald-700 text-emerald-900 font-bold' : 'border-transparent hover:text-slate-800'
            }`}
          >
            4. Activities ({inquiryActivities.length})
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'notes' ? 'border-emerald-700 text-emerald-900 font-bold' : 'border-transparent hover:text-slate-800'
            }`}
          >
            5. Internal Notes
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'audit' ? 'border-emerald-700 text-emerald-900 font-bold' : 'border-transparent hover:text-slate-800'
            }`}
          >
            6. Audit History
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 flex-1 overflow-y-auto bg-slate-50/50 space-y-6 text-xs text-slate-700">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                  Client Contact Information
                </h4>
                <div className="space-y-2.5">
                  <div className="flex items-center space-x-2.5">
                    <Mail size={15} className="text-slate-400 shrink-0" />
                    <div>
                      <span className="text-slate-400 text-[10px] block">Email Address</span>
                      <a href={`mailto:${inquiry.email}`} className="text-emerald-700 font-semibold hover:underline">
                        {inquiry.email}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <Phone size={15} className="text-slate-400 shrink-0" />
                    <div>
                      <span className="text-slate-400 text-[10px] block">Telephone</span>
                      <span className="font-semibold text-slate-800">{inquiry.phone}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <MessageSquare size={15} className="text-emerald-600 shrink-0" />
                    <div>
                      <span className="text-slate-400 text-[10px] block">WhatsApp</span>
                      <span className="font-semibold text-slate-800">{inquiry.whatsapp || inquiry.phone}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <MapPin size={15} className="text-slate-400 shrink-0" />
                    <div>
                      <span className="text-slate-400 text-[10px] block">Location</span>
                      <span className="font-medium text-slate-800">{inquiry.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <Globe size={15} className="text-slate-400 shrink-0" />
                    <div>
                      <span className="text-slate-400 text-[10px] block">Website / Profile</span>
                      <a href={inquiry.websiteUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                        {inquiry.websiteUrl}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Inquiry Details Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                  Inquiry & Service Request
                </h4>
                <div className="space-y-2.5">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Service Category</span>
                    <span className="font-bold text-slate-800 text-sm">{inquiry.category}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Specific Service Requested</span>
                    <span className="font-semibold text-emerald-800">{inquiry.requestedService || 'General Consultation'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Budget Range</span>
                      <span className="font-bold text-slate-800 font-mono">{inquiry.budgetRange}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Consultation Preference</span>
                      <span className="font-medium text-slate-700">{inquiry.preferredConsultationMethod}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Acquisition Source</span>
                      <span className="font-semibold text-slate-700">{inquiry.source}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Submission Date</span>
                      <span className="font-medium text-slate-700">{formatDateTime(inquiry.submittedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Google Sheets Live Record Card */}
              <div className="md:col-span-2 bg-gradient-to-r from-emerald-50/80 to-slate-50 p-4 rounded-2xl border border-emerald-200/90 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileSpreadsheet size={16} className="text-emerald-700" />
                    <span className="font-bold text-xs text-slate-800">
                      Google Sheets Master Unified Database Record
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Synced with Apps Script
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Spreadsheet</span>
                    <span className="font-semibold text-slate-800 truncate block">
                      {googleSettings.spreadsheetName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Sheet Tab</span>
                    <span className="font-mono font-bold text-emerald-800 block">
                      [{inquiry.googleSheetName || 'Consulting Inquiries'}]
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Google Reference ID</span>
                    <span className="font-mono font-bold text-slate-900 block">
                      {inquiry.googleReferenceId || inquiry.referenceNo}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Direct Spreadsheet</span>
                    <a
                      href={googleSettings.spreadsheetUrl || 'https://docs.google.com/spreadsheets/d/14F30s9WoA2dLDBttEv2jgm3VnPmUJ6xQHT00FIa3-K8/edit'}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-700 font-bold hover:underline inline-flex items-center space-x-1"
                    >
                      <span>Open in Sheets</span>
                      <ExternalLink size={11} />
                    </a>
                  </div>
                </div>
              </div>

              {/* Team Assignment Controls */}
              <div className="md:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2 mb-3">
                  Internal Team Assignments
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* BD Manager */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Assigned BD Manager
                    </label>
                    <select
                      value={inquiry.assignedBdId || ''}
                      onChange={e => assignInquiry(inquiry.id, { bdId: e.target.value })}
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    >
                      <option value="">-- Select BD Manager --</option>
                      {users
                        .filter(u => u.role === 'bd_manager' || u.role === 'super_admin')
                        .map(u => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.role.replace('_', ' ')})
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Sales Rep */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Assigned Sales Rep
                    </label>
                    <select
                      value={inquiry.assignedSalesRepId || ''}
                      onChange={e => assignInquiry(inquiry.id, { repId: e.target.value })}
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    >
                      <option value="">-- Select Sales Rep --</option>
                      {users
                        .filter(u => u.role === 'sales_rep' || u.role === 'bd_manager')
                        .map(u => (
                          <option key={u.id} value={u.id}>
                            {u.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Consultant */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Assigned Consultant
                    </label>
                    <select
                      value={inquiry.assignedConsultantId || ''}
                      onChange={e => assignInquiry(inquiry.id, { consultantId: e.target.value })}
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    >
                      <option value="">-- Select Consultant / Analyst --</option>
                      {users
                        .filter(u => u.role === 'consultant')
                        .map(u => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.title})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BUSINESS INFORMATION */}
          {activeTab === 'business' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Business Stage</span>
                  <span className="font-bold text-slate-800">{inquiry.stage}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Team Size</span>
                  <span className="font-bold text-slate-800">{inquiry.teamSize}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Business Model</span>
                  <span className="font-bold text-slate-800">{inquiry.businessModel}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Annual Revenue</span>
                  <span className="font-bold text-emerald-800 font-mono">{inquiry.annualRevenueRange}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 text-xs mb-1">Business Overview</h4>
                <p className="p-3 bg-slate-50 rounded-xl text-slate-700 leading-relaxed">
                  {inquiry.description}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-rose-800 text-xs mb-1">Current Challenges & Pain Points</h4>
                <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl text-slate-800 leading-relaxed">
                  {inquiry.currentChallenges || 'No specific challenges noted in initial form submission.'}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-emerald-800 text-xs mb-1">Objectives & Expected Outcomes</h4>
                <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl text-slate-800 leading-relaxed">
                  {inquiry.expectedOutcomes || inquiry.businessObjectives || 'Needs structured discovery.'}
                </div>
              </div>

              {inquiry.specificQuestions && (
                <div>
                  <h4 className="font-bold text-slate-800 text-xs mb-1">Specific Client Inquiries / Questions</h4>
                  <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl text-slate-800 italic">
                    "{inquiry.specificQuestions}"
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: UPLOADED DOCUMENTS (GOOGLE DRIVE INTEGRATION) */}
          {activeTab === 'documents' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Supporting Documents & Pitch Decks</h4>
                  <p className="text-xs text-slate-400">
                    Files submitted via Google Form / Drive folder linked to this inquiry
                  </p>
                </div>
                <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                  Secure Drive Vault
                </span>
              </div>

              {inquiry.supportingDocuments.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <FolderOpen size={36} className="mx-auto mb-2 text-slate-300" />
                  <p className="text-xs">No documents uploaded with this submission.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {inquiry.supportingDocuments.map(doc => (
                    <div
                      key={doc.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors flex items-start justify-between space-x-3"
                    >
                      <div className="flex items-start space-x-3 min-w-0">
                        <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 shrink-0">
                          <FileText size={18} />
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-slate-800 block truncate text-xs">{doc.name}</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {doc.category} • {doc.size} • {formatDate(doc.uploadDate)}
                          </span>
                          <span className="text-[10px] text-emerald-700 font-mono mt-1 block">
                            Drive ID: {doc.driveFileId}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => alert(`Simulated secure preview of: ${doc.name}`)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors shrink-0"
                        title="Preview document"
                      >
                        <ExternalLink size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ACTIVITIES */}
          {activeTab === 'activities' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="font-bold text-slate-900 text-sm">Interaction History & Follow-ups</h4>
                <button
                  onClick={() => onScheduleFollowUp(inquiry.fullName, inquiry.id)}
                  className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold"
                >
                  + Log Call / Meeting
                </button>
              </div>

              {inquiryActivities.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-xs">
                  No activities recorded yet. Click above to log your first call or meeting!
                </div>
              ) : (
                <div className="space-y-3">
                  {inquiryActivities.map(act => (
                    <div key={act.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-xs">{act.summary}</span>
                        <span className="text-[10px] text-slate-400">{formatDateTime(act.date)}</span>
                      </div>
                      <p className="text-slate-600 text-xs">{act.outcome}</p>
                      <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-200/60">
                        <span>Logged by: {act.userName}</span>
                        {act.nextAction && <span className="text-emerald-700 font-medium">Next: {act.nextAction}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: INTERNAL NOTES */}
          {activeTab === 'notes' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                Team Internal Discussion & Collaboration
              </h4>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                {inquiry.internalNotes || 'No notes added yet.'}
              </div>

              <form onSubmit={handleAddNote} className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Add Internal Note</label>
                <textarea
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  placeholder="Type an internal note, strategy remark, or @mention a team member..."
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  rows={3}
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!newNote.trim()}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold disabled:opacity-50"
                  >
                    <Send size={13} />
                    <span>Post Note</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 6: AUDIT TRAIL */}
          {activeTab === 'audit' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                Audit Trail & History
              </h4>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {inquiryAudit.map(entry => (
                  <div key={entry.id} className="p-2.5 bg-slate-50 rounded-lg text-xs flex items-start justify-between">
                    <div>
                      <span className="font-bold text-slate-800">{entry.action}</span>
                      <span className="text-slate-500 block text-[11px] mt-0.5">{entry.details}</span>
                      <span className="text-slate-400 text-[10px]">By {entry.userName} ({entry.userRole})</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {formatDateTime(entry.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
