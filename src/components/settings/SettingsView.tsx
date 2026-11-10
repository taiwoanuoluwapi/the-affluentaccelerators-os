import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Shield,
  Users2,
  Building,
  FileSpreadsheet,
  CheckCircle2,
  Layers,
  History,
  RotateCcw,
  Sparkles,
  Lock,
  Globe,
  UserCheck,
  UserPlus,
  Trash2,
  BookOpen,
  Mail,
  ToggleLeft,
  ToggleRight,
  Database,
  Activity,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { formatDateTime, formatDate } from '../../utils/formatters';
import { UserRole } from '../../types';
import { ProductionGuideView } from './ProductionGuideView';

export const SettingsView: React.FC = () => {
  const {
    users,
    auditLogs,
    googleSettings,
    currentUser,
    resetToInitialData,
    authorizedUsers,
    addAuthorizedUser,
    removeAuthorizedUser,
    toggleUserActive,
    supabaseLiveConnected,
    supabaseLiveLatency,
    supabaseProjectRef,
    testSupabaseHealth,
    updateSupabaseCredentials,
    supabaseConfig
  } = useApp();

  const [activeTab, setActiveTab] = useState<'database' | 'guide' | 'whitelist' | 'branding' | 'roles' | 'audit'>('database');
  const [auditFilter, setAuditFilter] = useState('all');

  // Supabase form state
  const [supabaseUrlInput, setSupabaseUrlInput] = useState(supabaseConfig.projectUrl);
  const [supabaseKeyInput, setSupabaseKeyInput] = useState(supabaseConfig.anonKey);
  const [pingLoading, setPingLoading] = useState(false);
  const [pingMessage, setPingMessage] = useState<string | null>(null);

  // New whitelist state
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<UserRole>('sales_rep');

  const filteredLogs = auditLogs.filter(
    l => auditFilter === 'all' || l.entityType === auditFilter
  );

  const handleAddWhitelist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffEmail || !newStaffEmail.includes('@')) {
      alert('Please enter a valid email address.');
      return;
    }
    addAuthorizedUser(newStaffEmail, newStaffRole);
    setNewStaffEmail('');
  };

  const permissionsMatrix: { role: UserRole; label: string; desc: string; inquiries: string; crm: string; pipeline: string; consulting: string; settings: string }[] = [
    {
      role: 'super_admin',
      label: 'Super Admin / Founder',
      desc: 'Full company-wide oversight and unrestricted executive permissions.',
      inquiries: 'Full Access (All)',
      crm: 'Full Access (All)',
      pipeline: 'Full Access (All)',
      consulting: 'Full Access (All)',
      settings: 'Full Config & Security'
    },
    {
      role: 'admin',
      label: 'Operations Manager',
      desc: 'Operational coordination, lead triage, consultant assignment.',
      inquiries: 'Manage & Assign',
      crm: 'Manage & Merge',
      pipeline: 'Monitor All Stages',
      consulting: 'Coordinate & Assign',
      settings: 'Operational Settings'
    },
    {
      role: 'bd_manager',
      label: 'Business Development Manager',
      desc: 'Lead prospecting, qualification, commercial deals, outreach.',
      inquiries: 'Assigned Leads & Create',
      crm: 'Create & Manage Assigned',
      pipeline: 'Create & Advance Deals',
      consulting: 'Request Assignment',
      settings: 'View Only'
    },
    {
      role: 'sales_rep',
      label: 'Sales Representative',
      desc: 'Discovery calls, proposal submission, conversion closing.',
      inquiries: 'Assigned Prospects',
      crm: 'Assigned Contacts',
      pipeline: 'Manage Assigned Deals',
      consulting: 'No Access',
      settings: 'No Access'
    },
    {
      role: 'consultant',
      label: 'Consultant / Business Analyst',
      desc: 'Client engagement execution, diagnostics, milestone reports.',
      inquiries: 'Assigned Diagnostics',
      crm: 'Authorised Client Info',
      pipeline: 'No Access',
      consulting: 'Manage Tasks & Uploads',
      settings: 'No Access'
    },
    {
      role: 'intern',
      label: 'Team Fellow / Intern',
      desc: 'Research synthesis, task execution, document prep.',
      inquiries: 'Assigned Research',
      crm: 'Restricted View',
      pipeline: 'No Access',
      consulting: 'Assigned Tasks Only',
      settings: 'No Access'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-slate-800">Platform Settings & Governance</h2>
            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-mono">
              Role-Based Access Control
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Production guide, staff whitelist authorization, database security, and audit logs
          </p>
        </div>

        <button
          onClick={() => {
            if (confirm('Reset AffluentOS to clean initial operational dataset?')) {
              resetToInitialData();
            }
          }}
          className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 rounded-xl text-xs font-semibold border border-slate-200 transition-colors self-start sm:self-auto"
        >
          <RotateCcw size={14} />
          <span>Reset Demo Data</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('database')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center space-x-1.5 ${
            activeTab === 'database'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Database size={14} />
          <span>Supabase & Live Database</span>
          <span className={`w-2 h-2 rounded-full ${supabaseLiveConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
        </button>

        <button
          onClick={() => setActiveTab('guide')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center space-x-1.5 ${
            activeTab === 'guide'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen size={14} />
          <span>Production Requirements Guide</span>
        </button>

        <button
          onClick={() => setActiveTab('whitelist')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center space-x-1.5 ${
            activeTab === 'whitelist'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UserCheck size={14} />
          <span>Staff Whitelist & Accounts ({authorizedUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('branding')}
          className={`px-4 py-2 rounded-xl transition-colors ${
            activeTab === 'branding'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Company Branding & Tokens
        </button>

        <button
          onClick={() => setActiveTab('roles')}
          className={`px-4 py-2 rounded-xl transition-colors ${
            activeTab === 'roles'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Roles & RBAC Matrix
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center space-x-1.5 ${
            activeTab === 'audit'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <History size={14} />
          <span>Audit Trail</span>
        </button>
      </div>

      {/* TAB 0: SUPABASE & LIVE DATABASE */}
      {activeTab === 'database' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6 text-xs text-slate-700">
          <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-sm text-slate-900">Supabase Cloud PostgreSQL & Auth Engine</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  supabaseLiveConnected
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}>
                  {supabaseLiveConnected ? 'Connected & Verified' : 'Connecting'}
                </span>
              </div>
              <p className="text-slate-400 mt-0.5">
                Target Project: <code className="font-mono text-emerald-800 font-bold">{supabaseProjectRef}</code> • System of record for users, roles, permissions, and Row Level Security (RLS).
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={async () => {
                  setPingLoading(true);
                  setPingMessage(null);
                  try {
                    const res = await testSupabaseHealth();
                    setPingMessage(res.message);
                  } catch (e: any) {
                    setPingMessage(e?.message || 'Ping failed');
                  } finally {
                    setPingLoading(false);
                  }
                }}
                disabled={pingLoading}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold rounded-lg text-xs flex items-center space-x-1.5 cursor-pointer transition-colors"
              >
                <Activity size={14} className={pingLoading ? 'animate-spin text-emerald-600' : 'text-emerald-700'} />
                <span>{pingLoading ? 'Testing...' : 'Ping Supabase API'}</span>
              </button>

              <a
                href={`https://supabase.com/dashboard/project/${supabaseProjectRef}/sql/new`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-xs flex items-center space-x-1.5 cursor-pointer transition-colors"
              >
                <span>Supabase SQL Editor</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>

          {pingMessage && (
            <div className="p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl flex items-center justify-between">
              <span>{pingMessage}</span>
              {supabaseLiveLatency && <span className="text-slate-400 text-[11px]">{supabaseLiveLatency}ms latency</span>}
            </div>
          )}

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Founder / Super Admin</span>
              <div className="font-bold text-slate-900 text-sm">fulfilmenttaiwo@gmail.com</div>
              <span className="text-[11px] text-emerald-700 font-semibold">Pre-seeded in authorized_staff</span>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Auth Provider</span>
              <div className="font-bold text-slate-900 text-sm">Supabase GoTrue (Email/Password)</div>
              <span className="text-[11px] text-emerald-700 font-semibold">JWT + Row Level Security</span>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Database Architecture</span>
              <div className="font-bold text-slate-900 text-sm">PostgreSQL 15+</div>
              <span className="text-[11px] text-emerald-700 font-semibold">5 System Tables + RLS Policies</span>
            </div>
          </div>

          {/* Connection Configuration Form */}
          <form
            onSubmit={async e => {
              e.preventDefault();
              setPingLoading(true);
              setPingMessage(null);
              try {
                const res = await updateSupabaseCredentials(supabaseUrlInput, supabaseKeyInput);
                setPingMessage(res.message);
              } catch (err: any) {
                setPingMessage(err?.message || 'Error updating credentials');
              } finally {
                setPingLoading(false);
              }
            }}
            className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4"
          >
            <h4 className="font-bold text-xs text-slate-800 flex items-center space-x-1.5">
              <Settings size={14} className="text-emerald-700" />
              <span>Project Endpoint & Credentials</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Supabase Project URL</label>
                <input
                  type="text"
                  required
                  value={supabaseUrlInput}
                  onChange={e => setSupabaseUrlInput(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Publishable Key (Client API Key)</label>
                <input
                  type="text"
                  required
                  value={supabaseKeyInput}
                  onChange={e => setSupabaseKeyInput(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-500">
                Changes persist across sessions in local storage and environment configuration.
              </span>
              <button
                type="submit"
                disabled={pingLoading}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
              >
                Save & Reconnect Supabase
              </button>
            </div>
          </form>

          {/* Quick Links & Resources */}
          <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2 text-emerald-950">
            <h4 className="font-bold text-xs">Direct Supabase Dashboard Shortcuts</h4>
            <div className="flex flex-wrap gap-3 pt-1">
              <a
                href={`https://supabase.com/dashboard/project/${supabaseProjectRef}/editor`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-800 hover:underline"
              >
                <span>Table Editor</span>
                <ExternalLink size={12} />
              </a>
              <a
                href={`https://supabase.com/dashboard/project/${supabaseProjectRef}/auth/users`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-800 hover:underline"
              >
                <span>Auth Users & Sessions</span>
                <ExternalLink size={12} />
              </a>
              <a
                href={`https://supabase.com/dashboard/project/${supabaseProjectRef}/settings/api`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-800 hover:underline"
              >
                <span>API Settings & Keys</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: PRODUCTION DEPLOYMENT GUIDE */}
      {activeTab === 'guide' && <ProductionGuideView />}

      {/* TAB 2: STAFF WHITELIST & INVITATIONS */}
      {activeTab === 'whitelist' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6 text-xs text-slate-700">
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Authorized Staff Whitelist (List-Based Auth)</h3>
              <p className="text-slate-400 mt-0.5">
                Only users whose emails appear in this authorized list or match <code className="font-mono text-emerald-800">@affluentaccelerators.com</code> can log in or register.
              </p>
            </div>
            <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 font-semibold self-start sm:self-auto">
              {authorizedUsers.length} Whitelisted Staff
            </span>
          </div>

          {/* Add Staff to Whitelist Form */}
          <form onSubmit={handleAddWhitelist} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-xs text-slate-800 flex items-center space-x-1.5">
              <UserPlus size={14} className="text-emerald-700" />
              <span>Authorize New Staff Member / Employee</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="font-semibold text-slate-600 block mb-1">Corporate Email Address *</label>
                <input
                  type="email"
                  required
                  value={newStaffEmail}
                  onChange={e => setNewStaffEmail(e.target.value)}
                  placeholder="e.g. j.smith@affluentaccelerators.com"
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Assigned Default Role</label>
                <select
                  value={newStaffRole}
                  onChange={e => setNewStaffRole(e.target.value as UserRole)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                >
                  <option value="sales_rep">Sales Representative</option>
                  <option value="bd_manager">BD Manager</option>
                  <option value="consultant">Consultant / Analyst</option>
                  <option value="intern">Fellow / Intern</option>
                  <option value="admin">Operations Admin</option>
                  <option value="super_admin">Super Admin / Founder</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-xs text-xs"
              >
                + Add to Authorized Staff List
              </button>
            </div>
          </form>

          {/* Whitelist Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="p-3">Staff Email</th>
                    <th className="p-3">Role Assigned</th>
                    <th className="p-3">Invited By</th>
                    <th className="p-3">Invitation Date</th>
                    <th className="p-3">Access Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {authorizedUsers.map(auth => (
                    <tr key={auth.id} className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-900 font-mono text-[11px]">{auth.email}</td>
                      <td className="p-3">
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded capitalize">
                          {auth.defaultRole.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500">{auth.invitedBy}</td>
                      <td className="p-3 text-slate-400 font-mono text-[11px]">{formatDate(auth.invitedAt)}</td>
                      <td className="p-3">
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Authorized
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => removeAuthorizedUser(auth.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          title="Revoke Authorization"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* User Account Activation / Deactivation */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <h4 className="font-bold text-xs text-slate-800">Live Team Accounts & Security Status</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {users.map(u => (
                <div
                  key={u.id}
                  className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2.5">
                    <img src={u.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <span className="font-bold text-slate-900 block text-xs">{u.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{u.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        u.active
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {u.active ? 'ACTIVE' : 'DEACTIVATED'}
                    </span>
                    <button
                      onClick={() => toggleUserActive(u.id)}
                      className="text-xs font-semibold text-slate-600 hover:text-emerald-700 underline"
                    >
                      {u.active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BRANDING */}
      {activeTab === 'branding' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6 text-xs text-slate-700">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-bold text-sm text-slate-900">Brand Identity & Visual Standards</h3>
            <p className="text-slate-400 mt-0.5">Specifications for The Affluentaccelerators internal platform</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <label className="font-bold text-slate-600 block mb-1">Application Name</label>
                <input
                  type="text"
                  readOnly
                  value="AffluentOS"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Parent Organisation</label>
                <input
                  type="text"
                  readOnly
                  value="The Affluentaccelerators"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Company Tagline</label>
                <input
                  type="text"
                  readOnly
                  value="Your Business. Your People. Your Progress."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-emerald-800 font-semibold italic"
                />
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-800 text-xs">Visual Identity Tokens</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 rounded-md bg-[#064e3b]"></div>
                    <span className="font-semibold text-slate-800">Deep Emerald Green (#064E3B)</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Primary Brand</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 rounded-md bg-[#d97706]"></div>
                    <span className="font-semibold text-slate-800">Warm Gold Accent (#D97706)</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Secondary Brand</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 rounded-md bg-[#0f172a]"></div>
                    <span className="font-semibold text-slate-800">Dark Charcoal Text (#0F172A)</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Typography</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ROLES & RBAC MATRIX */}
      {activeTab === 'roles' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs text-slate-700">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900">Database Role-Based Access Control (RBAC)</h3>
            <p className="text-slate-400 mt-0.5">
              Strict permissions enforced server-side. Users cannot access unauthorized endpoints by URL alteration.
            </p>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="p-3">User Role</th>
                    <th className="p-3">Inquiries</th>
                    <th className="p-3">CRM / Contacts</th>
                    <th className="p-3">Sales Deals</th>
                    <th className="p-3">Projects</th>
                    <th className="p-3">Settings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {permissionsMatrix.map(m => (
                    <tr key={m.role} className="hover:bg-slate-50">
                      <td className="p-3">
                        <span className="font-bold text-slate-900 block">{m.label}</span>
                        <span className="text-[10px] text-slate-400">{m.desc}</span>
                      </td>
                      <td className="p-3 font-medium text-emerald-800">{m.inquiries}</td>
                      <td className="p-3 font-medium text-slate-700">{m.crm}</td>
                      <td className="p-3 font-medium text-purple-800">{m.pipeline}</td>
                      <td className="p-3 font-medium text-blue-800">{m.consulting}</td>
                      <td className="p-3 font-medium text-slate-600">{m.settings}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Immutable Corporate Audit Log</h3>
              <p className="text-slate-400 mt-0.5">Every inquiry assignment, deal update, and project milestone is recorded</p>
            </div>

            <select
              value={auditFilter}
              onChange={e => setAuditFilter(e.target.value)}
              className="text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
            >
              <option value="all">All Entity Actions</option>
              <option value="Inquiry">Inquiry Actions</option>
              <option value="Deal">Deal Actions</option>
              <option value="Project">Project Actions</option>
              <option value="Contact">Contact Actions</option>
              <option value="GoogleSync">Google Synchronisation</option>
              <option value="User">User & Auth Actions</option>
            </select>
          </div>

          <div className="space-y-2.5 max-h-96 overflow-y-auto">
            {filteredLogs.map(log => (
              <div
                key={log.id}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between text-xs space-x-3"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900">{log.action}</span>
                    <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded">
                      {log.entityType}
                    </span>
                  </div>
                  <p className="text-slate-600 text-xs">{log.details}</p>
                  <span className="text-[10px] text-slate-400 block pt-0.5">
                    User: {log.userName} ({log.userRole})
                  </span>
                </div>

                <span className="text-[10px] text-slate-400 font-mono shrink-0">
                  {formatDateTime(log.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
