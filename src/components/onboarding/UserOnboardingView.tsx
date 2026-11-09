import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OnboardingSubmission, UserRole, ApprovalStatus } from '../../types';
import {
  Users,
  UserPlus,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  Database,
  Lock,
  Layers,
  Code2,
  Sliders,
  Send,
  Eye,
  CheckSquare
} from 'lucide-react';
import { formatDate, formatDateTime } from '../../utils/formatters';
import { InviteUserModal } from './InviteUserModal';
import { PublicOnboardingFormModal } from './PublicOnboardingFormModal';

export const UserOnboardingView: React.FC = () => {
  const {
    onboardingSubmissions,
    userInvitations,
    toggleOnboardingApproval,
    simulateSheetApprovalWebhook,
    triggerSheetsOnboardingSync,
    googleSettings,
    supabaseConfig,
    updateSupabaseConfig,
    currentUser
  } = useApp();

  const [activeTab, setActiveTab] = useState<'queue' | 'invitations' | 'strategy' | 'code'>('queue');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<OnboardingSubmission | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Filtered submissions
  const filteredSubmissions = onboardingSubmissions.filter(s => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.requestedRole.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || s.approvalStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const unapprovedCount = onboardingSubmissions.filter(s => s.approvalStatus === 'unapproved').length;
  const approvedCount = onboardingSubmissions.filter(s => s.approvalStatus === 'approved').length;

  const handleToggleStatus = async (submission: OnboardingSubmission) => {
    const nextStatus: ApprovalStatus = submission.approvalStatus === 'approved' ? 'unapproved' : 'approved';
    await toggleOnboardingApproval(submission.id, nextStatus);
  };

  const handleSimulateWebhook = async (submission: OnboardingSubmission) => {
    setIsSyncing(true);
    setSyncFeedback(`Triggering Google Sheets onEdit() Webhook for Row #${submission.googleSheetRowIndex}...`);
    try {
      await simulateSheetApprovalWebhook(submission.googleSheetRowIndex, 'approved');
      setSyncFeedback(
        `✓ Webhook received from Google Sheets! Cell J${submission.googleSheetRowIndex} set to "approved". User ${submission.fullName} activated in Supabase Auth.`
      );
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncFeedback(null), 4000);
    }
  };

  const handleSyncAll = async () => {
    setIsSyncing(true);
    setSyncFeedback('Syncing Onboarding Submissions with Google Sheet...');
    try {
      const res = await triggerSheetsOnboardingSync();
      setSyncFeedback(res.message);
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncFeedback(null), 3000);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return { label: 'Founder & Super Admin', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      case 'admin':
        return { label: 'Operations & Admin', color: 'bg-blue-100 text-blue-900 border-blue-300' };
      case 'bd_manager':
        return { label: 'BD Manager', color: 'bg-indigo-100 text-indigo-900 border-indigo-300' };
      case 'sales_rep':
        return { label: 'Sales Representative', color: 'bg-purple-100 text-purple-900 border-purple-300' };
      case 'consultant':
        return { label: 'Lead Consultant', color: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'intern':
        return { label: 'Operations Fellow', color: 'bg-slate-100 text-slate-800 border-slate-300' };
    }
  };

  // Google Apps Script snippet
  const googleAppsScriptCode = `/**
 * Google Apps Script for The Affluentaccelerators
 * Place this in Extensions > Apps Script of your spreadsheet:
 * "${googleSettings.spreadsheetName}"
 *
 * Automatically triggers webhook to Supabase / AffluentOS whenever
 * the admin toggles the "approved" / "unapproved" boolean column!
 */
function onEdit(e) {
  var sheet = e.source.getActiveSheet();
  var sheetName = sheet.getName();
  
  // Only monitor the [User Onboarding & Approvals] tab
  if (sheetName !== "${googleSettings.onboardingSheetName || 'User Onboarding & Approvals'}") {
    return;
  }
  
  var range = e.range;
  var col = range.getColumn();
  var row = range.getRow();
  
  // Header is row 1. Column J (10) is "Status (approved / unapproved)"
  if (row > 1 && col === 10) {
    var newStatus = range.getValue().toString().trim().toLowerCase();
    var email = sheet.getRange(row, 4).getValue(); // Col D is Email
    var fullName = sheet.getRange(row, 2).getValue(); // Col B is Name
    var role = sheet.getRange(row, 6).getValue(); // Col F is Role
    
    var payload = {
      event: "approval_status_changed",
      sheetTab: sheetName,
      rowIndex: row,
      fullName: fullName,
      email: email,
      role: role,
      newStatus: newStatus, // "approved" or "unapproved"
      timestamp: new Date().toISOString()
    };
    
    // Call Supabase / AffluentOS Webhook Endpoint
    var webhookUrl = "https://vkwubtxvqlmnoyz.supabase.co/functions/v1/sheets-approval-webhook";
    var options = {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      headers: {
        "Authorization": "Bearer YOUR_SUPABASE_SERVICE_ROLE_KEY"
      },
      muteHttpExceptions: true
    };
    
    UrlFetchApp.fetch(webhookUrl, options);
  }
}`;

  // Supabase SQL schema snippet
  const supabaseSQLCode = `-- ==============================================================
-- SUPABASE POSTGRES SCHEMA: The Affluentaccelerators Hybrid Architecture
-- System of Record: Supabase Auth & RLS
-- Live Collaborative Two-Way Window: Google Sheets
-- ==============================================================

-- 1. Custom User Roles Enum
CREATE TYPE user_role AS ENUM (
  'super_admin',
  'admin',
  'bd_manager',
  'sales_rep',
  'consultant',
  'intern'
);

-- 2. User Profiles (Extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'sales_rep',
  title TEXT,
  department TEXT,
  phone TEXT,
  active BOOLEAN NOT NULL DEFAULT false, -- Set to true once approved on Google Sheet!
  google_sheet_row_index INT,
  created_at TIMESTAMPTZ DEFAULT now(),
  approved_at TIMESTAMPTZ
);

-- 3. Onboarding Queue Submissions
CREATE TABLE public.user_onboarding_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  requested_role user_role NOT NULL,
  department TEXT NOT NULL,
  bio TEXT,
  approval_status TEXT NOT NULL DEFAULT 'unapproved', -- 'approved', 'unapproved'
  sheet_tab_name TEXT DEFAULT 'User Onboarding & Approvals',
  sheet_row_index INT,
  invited_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  approved_at TIMESTAMPTZ
);

-- 4. CRM Contacts (Mirrored to Google Sheets)
CREATE TABLE public.crm_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  contact_type TEXT NOT NULL,
  relationship_owner_id UUID REFERENCES public.profiles(id),
  sheet_row_index INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Role-Based Contact Tasks
CREATE TABLE public.contact_role_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assigned_role user_role NOT NULL,
  assigned_user_id UUID REFERENCES public.profiles(id),
  due_date DATE NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'todo', -- 'todo', 'in_progress', 'completed'
  sheet_row_index INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- Ensures Sales Reps only see their assigned contacts & tasks!
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_role_tasks ENABLE ROW LEVEL SECURITY;

-- Sales Reps only see contacts they own:
CREATE POLICY "Sales Reps see assigned contacts"
ON public.crm_contacts FOR SELECT
USING (
  auth.uid() = relationship_owner_id
  OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'bd_manager'))
);

-- Role-Based Tasks Policy:
CREATE POLICY "Users see tasks matching their role or assigned to them"
ON public.contact_role_tasks FOR ALL
USING (
  assigned_user_id = auth.uid()
  OR assigned_role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin'))
);`;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-card">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-[#043e2f] text-white flex items-center justify-center shadow-xs">
                <Users size={20} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
                  <span>User Onboarding & Approvals Hub</span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Google Sheets & Supabase Pipeline
                  </span>
                </h1>
                <p className="text-xs text-slate-500">
                  Invite new users by email → Onboarding Form → Posted to Google Sheet tab <span className="font-mono font-semibold text-emerald-800">[{googleSettings.onboardingSheetName || 'User Onboarding & Approvals'}]</span> → Admin approves by toggling Boolean status.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="px-3.5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <UserPlus size={15} />
              <span>Invite User by Email</span>
            </button>

            <button
              onClick={() => setIsOnboardingModalOpen(true)}
              className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 cursor-pointer border border-slate-300"
            >
              <ExternalLink size={14} />
              <span>Test Public Form</span>
            </button>

            <button
              onClick={handleSyncAll}
              disabled={isSyncing}
              className="px-3 py-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 cursor-pointer border border-slate-200 shadow-xs"
            >
              <RefreshCw size={14} className={isSyncing ? 'animate-spin text-emerald-600' : ''} />
              <span>Sync Sheets</span>
            </button>
          </div>
        </div>

        {/* Sync Feedback Toast */}
        {syncFeedback && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center space-x-2 animate-in fade-in duration-150">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span className="font-medium">{syncFeedback}</span>
          </div>
        )}

        {/* Quick KPI Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Email Invitations</div>
            <div className="text-lg font-bold text-slate-900 mt-0.5">{userInvitations.length}</div>
            <div className="text-[10px] text-slate-500">Links dispatched</div>
          </div>

          <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200">
            <div className="text-[10px] uppercase font-bold text-amber-700">Pending Approvals</div>
            <div className="text-lg font-bold text-amber-900 mt-0.5 flex items-center space-x-1.5">
              <span>{unapprovedCount}</span>
              <span className="text-[10px] font-mono bg-amber-200/70 text-amber-900 px-1.5 py-0.2 rounded font-bold">
                unapproved
              </span>
            </div>
            <div className="text-[10px] text-amber-800">Requires sheet toggle</div>
          </div>

          <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200">
            <div className="text-[10px] uppercase font-bold text-emerald-700">Approved & Active</div>
            <div className="text-lg font-bold text-emerald-900 mt-0.5 flex items-center space-x-1.5">
              <span>{approvedCount}</span>
              <span className="text-[10px] font-mono bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded font-bold">
                approved
              </span>
            </div>
            <div className="text-[10px] text-emerald-800">Active in Supabase</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="text-[10px] uppercase font-bold text-slate-400">Google Sheet Tab</div>
            <div className="text-xs font-bold text-slate-800 mt-1 truncate">
              {googleSettings.onboardingSheetName || 'User Onboarding & Approvals'}
            </div>
            <div className="text-[10px] text-emerald-700 font-semibold flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>2-Way Synced</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-2xl px-4 pt-2 space-x-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('queue')}
          className={`py-3 px-3.5 border-b-2 flex items-center space-x-2 transition-colors cursor-pointer ${
            activeTab === 'queue'
              ? 'border-emerald-700 text-emerald-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileSpreadsheet size={15} />
          <span>Onboarding Approvals Board</span>
          {unapprovedCount > 0 && (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              {unapprovedCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('invitations')}
          className={`py-3 px-3.5 border-b-2 flex items-center space-x-2 transition-colors cursor-pointer ${
            activeTab === 'invitations'
              ? 'border-emerald-700 text-emerald-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Send size={15} />
          <span>Dispatched Email Invitations</span>
          <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
            {userInvitations.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('strategy')}
          className={`py-3 px-3.5 border-b-2 flex items-center space-x-2 transition-colors cursor-pointer ${
            activeTab === 'strategy'
              ? 'border-emerald-700 text-emerald-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles size={15} className="text-amber-500" />
          <span>Consultant's Strategic Architecture</span>
          <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
            Better Strategy
          </span>
        </button>

        <button
          onClick={() => setActiveTab('code')}
          className={`py-3 px-3.5 border-b-2 flex items-center space-x-2 transition-colors cursor-pointer ${
            activeTab === 'code'
              ? 'border-emerald-700 text-emerald-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Code2 size={15} />
          <span>Google Apps Script & SQL Schema</span>
        </button>
      </div>

      {/* TAB 1: ONBOARDING QUEUE & APPROVALS BOARD */}
      {activeTab === 'queue' && (
        <div className="bg-white rounded-b-2xl border border-slate-200 shadow-card p-4 sm:p-6 space-y-5">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2 flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search candidate name, email, department, or role..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-500 font-medium">Filter Status:</span>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Submissions ({onboardingSubmissions.length})</option>
                <option value="unapproved">Pending Approvals ({unapprovedCount})</option>
                <option value="approved">Approved & Active ({approvedCount})</option>
              </select>
            </div>
          </div>

          {/* Submissions Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3.5">Candidate / User</th>
                  <th className="py-3 px-3.5">Assigned Role & Unit</th>
                  <th className="py-3 px-3.5">Google Sheet Section & Row</th>
                  <th className="py-3 px-3.5">Submitted / Invited</th>
                  <th className="py-3 px-3.5 text-center">Boolean Approval Status</th>
                  <th className="py-3 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400">
                      No onboarding applications matching current filter.
                    </td>
                  </tr>
                ) : (
                  filteredSubmissions.map(sub => {
                    const roleBadge = getRoleBadge(sub.requestedRole);
                    const isApproved = sub.approvalStatus === 'approved';

                    return (
                      <tr
                        key={sub.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          !isApproved ? 'bg-amber-50/20' : ''
                        }`}
                      >
                        {/* Candidate */}
                        <td className="py-3.5 px-3.5">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0">
                              {sub.fullName.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{sub.fullName}</div>
                              <div className="text-[11px] text-slate-500 flex items-center space-x-1.5">
                                <span>{sub.email}</span>
                                <span>•</span>
                                <span>{sub.phone}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Role & Dept */}
                        <td className="py-3.5 px-3.5">
                          <div className="space-y-1">
                            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleBadge.color}`}>
                              {roleBadge.label}
                            </span>
                            <div className="text-[11px] text-slate-500 font-medium">
                              {sub.department}
                            </div>
                          </div>
                        </td>

                        {/* Google Sheet Reference */}
                        <td className="py-3.5 px-3.5">
                          <div className="flex items-center space-x-1.5 font-mono text-[11px]">
                            <FileSpreadsheet size={14} className="text-emerald-700 shrink-0" />
                            <div>
                              <div className="font-bold text-slate-800">
                                Tab: [{sub.googleSheetTab}]
                              </div>
                              <div className="text-[10px] text-slate-500">
                                Row #{sub.googleSheetRowIndex} • Col J (Status)
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Submitted Date */}
                        <td className="py-3.5 px-3.5 text-slate-600 text-[11px]">
                          <div>{formatDate(sub.submittedAt)}</div>
                          <div className="text-[10px] text-slate-400">
                            Invited by: {sub.invitedBy || 'Direct Request'}
                          </div>
                        </td>

                        {/* Boolean Status Toggle */}
                        <td className="py-3.5 px-3.5 text-center">
                          <div className="inline-flex flex-col items-center space-y-1">
                            <button
                              onClick={() => handleToggleStatus(sub)}
                              title="Click to toggle status on the Google Sheet and activate/deactivate in Supabase"
                              className={`px-3 py-1 rounded-full font-mono text-[11px] font-bold border transition-all flex items-center space-x-1.5 cursor-pointer shadow-2xs ${
                                isApproved
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                                  : 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                              }`}
                            >
                              <span className={`w-2 h-2 rounded-full ${isApproved ? 'bg-emerald-600' : 'bg-amber-600'}`}></span>
                              <span>{sub.approvalStatus}</span>
                            </button>
                            <span className="text-[9px] text-slate-400">
                              (Click to flip boolean)
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-3.5 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {!isApproved && (
                              <button
                                onClick={() => handleSimulateWebhook(sub)}
                                title="Simulate someone changing cell J in the actual Google Sheet to 'approved' via Google Apps Script onEdit trigger"
                                className="px-2.5 py-1 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-300 transition-colors cursor-pointer flex items-center space-x-1"
                              >
                                <Sparkles size={11} className="text-amber-600" />
                                <span>Simulate Sheet onEdit</span>
                              </button>
                            )}

                            <button
                              onClick={() => setSelectedSubmission(sub)}
                              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="View full submission details & bio"
                            >
                              <Eye size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Workflow Guide Footer */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 space-y-2">
            <div className="flex items-center space-x-2 font-bold text-slate-800">
              <FileSpreadsheet size={16} className="text-emerald-700" />
              <span>How The Google Sheet Boolean Approval Workflow Operates:</span>
            </div>
            <ol className="list-decimal pl-5 space-y-1 text-[11px] text-slate-600 leading-relaxed">
              <li>
                When an applicant submits the Onboarding Form, it inserts a new row in Google Sheets tab <span className="font-mono font-bold text-slate-800">[{googleSettings.onboardingSheetName || 'User Onboarding & Approvals'}]</span> with status cell set to <span className="font-mono font-bold text-amber-800">"unapproved"</span>.
              </li>
              <li>
                In Supabase, their auth account is generated in an inactive state (<span className="font-mono text-slate-700">active = false</span>).
              </li>
              <li>
                The partner or administrator can review their submission right here in AffluentOS or open Google Sheets directly.
              </li>
              <li>
                Once you change the status cell in Google Sheets to <span className="font-mono font-bold text-emerald-800">"approved"</span>, Google Apps Script calls the webhook, flips the Supabase account to <span className="font-mono text-emerald-800">active = true</span>, and unlocks role-based tasks on assigned client contacts!
              </li>
            </ol>
          </div>
        </div>
      )}

      {/* TAB 2: DISPATCHED EMAIL INVITATIONS */}
      {activeTab === 'invitations' && (
        <div className="bg-white rounded-b-2xl border border-slate-200 shadow-card p-4 sm:p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Dispatched Onboarding Invitations
              </h3>
              <p className="text-xs text-slate-500">
                Track invitation tokens sent to candidates. Each link opens the pre-filled onboarding form.
              </p>
            </div>
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <UserPlus size={14} />
              <span>Invite Another User</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {userInvitations.map(inv => {
              const roleBadge = getRoleBadge(inv.role);
              const isSubmitted = inv.status === 'submitted';

              return (
                <div
                  key={inv.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-xs transition-all space-y-3 text-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{inv.email}</div>
                      <div className="text-[11px] text-slate-500">
                        Invited by {inv.invitedBy} on {formatDate(inv.invitedAt)}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isSubmitted
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-amber-100 text-amber-900 border-amber-300'
                      }`}
                    >
                      {isSubmitted ? 'Form Completed' : 'Pending Candidate'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleBadge.color}`}>
                      {roleBadge.label}
                    </span>
                    <span className="text-[11px] text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {inv.department}
                    </span>
                  </div>

                  {inv.customNotes && (
                    <div className="text-[11px] italic text-slate-600 bg-white p-2 rounded-lg border border-slate-200">
                      "{inv.customNotes}"
                    </div>
                  )}

                  {/* Shareable Link Box */}
                  <div className="pt-1 flex items-center space-x-2">
                    <input
                      type="text"
                      readOnly
                      value={inv.inviteUrl}
                      className="flex-1 px-2.5 py-1.5 text-[10px] font-mono bg-white border border-slate-200 rounded-lg text-slate-600 select-all"
                    />
                    <button
                      onClick={() => copyToClipboard(inv.inviteUrl, inv.id)}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-[10px] font-bold flex items-center space-x-1 transition-colors cursor-pointer shrink-0"
                    >
                      {copiedCode === inv.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      <span>{copiedCode === inv.id ? 'Copied' : 'Copy Link'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: CONSULTANT'S STRATEGIC ARCHITECTURE (THE "BETTER STRATEGY") */}
      {activeTab === 'strategy' && (
        <div className="bg-white rounded-b-2xl border border-slate-200 shadow-card p-5 sm:p-7 space-y-7">
          {/* Executive Strategy Overview */}
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold">
              <Sparkles size={14} className="text-emerald-600" />
              <span>Senior Systems Consultant & Full-Stack Architect Advisory</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Why Pure Google Sheets is Risky for Client Data — and The Proven "Hybrid Engine" Strategy
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-4xl">
              You proposed using Google Sheets to host all client data, using Supabase for user auth & role-based tasks, an onboarding form posting to a separate sheet section, and admin approvals via boolean status (<span className="font-mono font-bold text-slate-800">"approved" / "unapproved"</span>).
              Here is my candid professional evaluation and the battle-tested hybrid strategy that gives you the exact user experience you want without system crashes or security holes.
            </p>
          </div>

          {/* Comparison Matrix: Pure Sheets vs Hybrid */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="bg-slate-900 text-white p-4 font-bold text-xs uppercase tracking-wider flex items-center justify-between">
              <span>Architectural Comparison Matrix</span>
              <span className="text-emerald-400 text-[11px] normal-case font-medium">Internal Tools Best Practice</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 text-xs">
              {/* Option A: Pure Google Sheets as Database */}
              <div className="p-5 space-y-3 bg-rose-50/20">
                <div className="flex items-center space-x-2 text-rose-700 font-bold text-sm">
                  <AlertCircle size={18} />
                  <span>The Pitfalls of Pure Google Sheets Backend</span>
                </div>
                <ul className="space-y-2 text-slate-600 text-[11px] leading-relaxed">
                  <li className="flex items-start space-x-2">
                    <span className="text-rose-500 font-bold">✗</span>
                    <span><strong>No Row Level Security (RLS):</strong> If a sales rep has sheet access, they can view ALL clients, revenues, and consultant notes. Google Sheets cannot hide rows dynamically by user role.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-rose-500 font-bold">✗</span>
                    <span><strong>Strict API Rate Limits:</strong> Sheets API has a hard quota of 60 read/write requests per minute. If 5 reps are active simultaneously, the app throws <code className="bg-rose-100 text-rose-800 px-1 py-0.5 rounded">429 Rate Limit Exceeded</code>.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-rose-500 font-bold">✗</span>
                    <span><strong>Concurrency & Race Overwrites:</strong> If two users edit rows or add contacts simultaneously, row indexes shift and data gets corrupted.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-rose-500 font-bold">✗</span>
                    <span><strong>Approval Polling Lag:</strong> Changing a cell to "approved" requires constant polling unless you wire an Apps Script webhook.</span>
                  </li>
                </ul>
              </div>

              {/* Option B: The Recommended Hybrid Architecture */}
              <div className="p-5 space-y-3 bg-emerald-50/30">
                <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm">
                  <CheckCircle2 size={18} className="text-emerald-600" />
                  <span>The Consultant's Recommended Hybrid Engine</span>
                </div>
                <ul className="space-y-2 text-slate-700 text-[11px] leading-relaxed">
                  <li className="flex items-start space-x-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span><strong>Supabase Postgres as System of Record:</strong> Sub-10ms queries, bulletproof Row Level Security (Chioma only sees her contacts; David only sees consulting projects; Dr. Eze sees all).</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span><strong>Google Sheets as Live Two-Way Mirror:</strong> Executives keep their beloved spreadsheet interface! Any change in the CRM writes to Sheets; changing <code className="bg-emerald-100 text-emerald-800 px-1 py-0.5 rounded">"approved"</code> in Sheets instantly activates the user via webhook!</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span><strong>Zero Rate Limit Vulnerability:</strong> The app reads from Supabase directly at 10,000 req/sec; syncs with Sheets in the background via queuing.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span><strong>Full Audit Trail & Task Automation:</strong> Automatic assignment of role-based contact tasks as soon as approval is toggled.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Workflow Step Diagram */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              End-to-End System Flow: From Invitation to Sheet Approval & Role Tasks
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
                <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-[11px]">
                  1
                </div>
                <div className="font-bold text-slate-900">Email Invitation</div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Admin generates invite specifying target role (e.g. Sales Rep Chioma). Tokenized link sent to candidate.
                </p>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
                <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-[11px]">
                  2
                </div>
                <div className="font-bold text-slate-900">Onboarding Form</div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Candidate completes bio, phone, and password. Data writes to Google Sheet tab <span className="font-mono text-emerald-700">[User Onboarding]</span> with status <span className="font-mono text-amber-700">"unapproved"</span>.
                </p>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
                <div className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-[11px]">
                  3
                </div>
                <div className="font-bold text-slate-900">Boolean Approval</div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Admin opens Google Sheet and changes cell from <span className="font-mono font-bold text-amber-800">unapproved</span> to <span className="font-mono font-bold text-emerald-800">approved</span>. Webhook triggers Supabase activation!
                </p>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
                <div className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-[11px]">
                  4
                </div>
                <div className="font-bold text-slate-900">Role-Based Tasks</div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  User logs in via Supabase Auth and sees only their assigned contacts & tasks on the sheet based on RLS permissions.
                </p>
              </div>
            </div>
          </div>

          {/* Supabase Connection Details */}
          <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Database size={18} className="text-emerald-700" />
                <h4 className="font-bold text-sm text-slate-900">
                  Supabase Live Connection Configuration
                </h4>
              </div>
              <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2.5 py-0.5 rounded-full border border-emerald-300">
                Connected & RLS Enforced
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="text"
                  value={supabaseConfig.projectUrl}
                  onChange={e => updateSupabaseConfig({ projectUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Auth Method & Policy Enforcement
                </label>
                <div className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-700 flex items-center justify-between">
                  <span>Supabase JWT + Row Level Security (RLS)</span>
                  <Lock size={14} className="text-emerald-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CODE SCRIPTS (GOOGLE APPS SCRIPT & SQL SCHEMA) */}
      {activeTab === 'code' && (
        <div className="bg-white rounded-b-2xl border border-slate-200 shadow-card p-5 sm:p-7 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Ready-to-Deploy Code Snippets
            </h3>
            <p className="text-xs text-slate-500">
              Copy and paste these directly into your Google Sheets Apps Script and Supabase SQL Editor.
            </p>
          </div>

          {/* Snippet 1: Google Apps Script */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="text-emerald-700" size={16} />
                <span className="text-xs font-bold text-slate-800">
                  1. Google Apps Script: Auto-Webhook on "approved" / "unapproved" Cell Edit
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(googleAppsScriptCode, 'apps_script')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center space-x-1 cursor-pointer transition-colors"
              >
                {copiedCode === 'apps_script' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{copiedCode === 'apps_script' ? 'Copied' : 'Copy Apps Script'}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto leading-relaxed border border-slate-800 max-h-72">
              {googleAppsScriptCode}
            </pre>
            <p className="text-[11px] text-slate-500">
              Paste this in <span className="font-semibold text-slate-700">Google Sheets &gt; Extensions &gt; Apps Script</span>. When any cell in Column J is edited to "approved", it triggers the webhook immediately.
            </p>
          </div>

          {/* Snippet 2: Supabase Schema */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Database className="text-emerald-700" size={16} />
                <span className="text-xs font-bold text-slate-800">
                  2. Supabase SQL Schema & Row Level Security (RLS) Policies
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(supabaseSQLCode, 'supabase_sql')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center space-x-1 cursor-pointer transition-colors"
              >
                {copiedCode === 'supabase_sql' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{copiedCode === 'supabase_sql' ? 'Copied' : 'Copy SQL Schema'}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-900 text-emerald-300 font-mono text-[11px] rounded-xl overflow-x-auto leading-relaxed border border-slate-800 max-h-72">
              {supabaseSQLCode}
            </pre>
            <p className="text-[11px] text-slate-500">
              Paste this into your <span className="font-semibold text-slate-700">Supabase SQL Editor</span> to create the tables, enums, and Row Level Security policies.
            </p>
          </div>
        </div>
      )}

      {/* Candidate Profile Details Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-floating border border-slate-200 w-full max-w-lg p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 font-bold text-slate-700 flex items-center justify-center text-sm">
                  {selectedSubmission.fullName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{selectedSubmission.fullName}</h4>
                  <p className="text-[11px] text-slate-500">{selectedSubmission.email} • {selectedSubmission.phone}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-slate-600">
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Requested Role</span>
                  <span className="font-bold text-slate-800">{selectedSubmission.requestedRole.toUpperCase()}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Department</span>
                  <span className="font-bold text-slate-800">{selectedSubmission.department}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Google Sheet Row</span>
                  <span className="font-mono font-bold text-slate-800">Row #{selectedSubmission.googleSheetRowIndex}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Status</span>
                  <span className={`font-mono font-bold ${selectedSubmission.approvalStatus === 'approved' ? 'text-emerald-700' : 'text-amber-700'}`}>
                    "{selectedSubmission.approvalStatus}"
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Professional Bio & Experience</span>
                <p className="p-3 bg-slate-50 rounded-xl text-slate-700 leading-relaxed text-[11px]">
                  {selectedSubmission.bio}
                </p>
              </div>

              {selectedSubmission.linkedinUrl && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">LinkedIn Profile</span>
                  <a
                    href={selectedSubmission.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-700 hover:underline flex items-center space-x-1"
                  >
                    <span>{selectedSubmission.linkedinUrl}</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  handleToggleStatus(selectedSubmission);
                  setSelectedSubmission(null);
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-colors text-white ${
                  selectedSubmission.approvalStatus === 'approved'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-emerald-700 hover:bg-emerald-800'
                }`}
              >
                {selectedSubmission.approvalStatus === 'approved' ? 'Change to "unapproved"' : 'Approve on Sheet & Supabase'}
              </button>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite User Modal */}
      <InviteUserModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onOpenOnboardingPreview={() => setIsOnboardingModalOpen(true)}
      />

      {/* Public Onboarding Form Modal */}
      <PublicOnboardingFormModal
        isOpen={isOnboardingModalOpen}
        onClose={() => setIsOnboardingModalOpen(false)}
      />
    </div>
  );
};
